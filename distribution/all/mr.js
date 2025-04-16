/** @typedef {import("../types").Callback} Callback */
const distribution = require('../../config');
const id = require('../util/id');

/**
 * Map functions used for mapreduce
 * @callback Mapper
 * @param {any} key
 * @param {any} value
 * @returns {object[]}
 */

/**
 * Reduce functions used for mapreduce
 * @callback Reducer
 * @param {any} key
 * @param {Array} value
 * @returns {object}
 */

/**
 * Optional Compact function
 * @callback Compactor
 * @param {object[]} data
 * @returns {object}
 */

/**
 * @typedef {Object} MRConfig
 * @property {Mapper} map
 * @property {Reducer} reduce
 * @property {Compactor} compact
 * @property {string} out
 * @property {boolean} mem
 * @property {string[]} keys
 * @property {number} rounds
 */

/*
  Note: The only method explicitly exposed in the `mr` service is `exec`.
  Other methods, such as `map`, `shuffle`, and `reduce`, should be dynamically
  installed on the remote nodes and not necessarily exposed to the user.
*/

function mr(config) {
  const context = {
    gid: config.gid || 'all',
  };

  /**
   * @param {MRConfig} configuration
   * @param {string[]} input
   * @param {number} remaining
   * @param {Callback} cb
   * @return {void}
   */
  function iterExec(configuration, input, remaining, cb) {
    configuration.keys = input;
    configuration.rounds = null;
    global.distribution[config.gid].mr.exec(configuration, (e, v) => {
      if (e) {
        return cb(e, null);
      }
      if (remaining > 0) {
        let keys = [];
        v.forEach((o) => {
          const key = Object.keys(o)[0];
          const value = o[key];
          keys = keys.concat(value);
        });
        iterExec(configuration, keys, remaining - 1, cb);
      } else {
        cb(null, v);
      }
    });
  }

  /**
   * @param {MRConfig} configuration
   * @param {Callback} cb
   * @return {void}
   */
  function exec(configuration, cb) {
    if (configuration.rounds && configuration.rounds > 1) {
      iterExec(configuration, configuration.keys, configuration.rounds, cb);
    } else {
      const sid = id.getSID(configuration);

      const mapReduce = {
        out: configuration.out || null,
        storage: configuration.mem ? 'mem' : 'store',

        mapper: configuration.map,
        reducer: configuration.reduce,
        compact: configuration.compact || ((data) => data),

        map: function(input, gid, job, callback) {
          if (input.length === 0) {
            callback(null, {});
          } else {
            const mapRes = [];
            let completed = 0;

            input.forEach((key) => {
              global.distribution[gid].store.get(key, (e, v) => {
                completed++;
                const mapped = this.mapper(key, v, global.distribution.util.require);
                if (Array.isArray(mapped)) mapRes.push(...mapped);
                else mapRes.push(mapped);

                if (completed === input.length) {
                  distribution.local[this.storage].put(mapRes, job + '_map', (e, v) => {
                    callback(null, mapRes);
                  });
                }
              });
            });
          }
        },

        shuffle: function(target, job, callback) {
          global.distribution.local[this.storage].get(job + '_map', (err, mapped) => {
            if (err) return callback(err, {});

            let completed = 0;
            mapped.forEach((item) => {
              const [key] = Object.keys(item);
              global.distribution[target].mem.put(item[key], {key, action: 'append'}, (err, _) => {
                completed++;
                if (completed == mapped.length) {
                  callback(null, mapped);
                }
              });
            });
          });
        },

        reduce: function(groupId, job, callback) {
          global.distribution.local.mem.get({key: null, gid: groupId}, (err, keys) => {
            if (err || !keys.length) return callback(null, null);

            let results = [];
            let completed = 0;

            keys.forEach((key) => {
              global.distribution.local.mem.get({key, gid: groupId}, (err, values) => {
                const reduced = this.reducer(key, values, global.distribution);
                results = results.concat(reduced);
                completed++;
                if (completed === keys.length) {
                  callback(null, results);
                }
              });
            });
          });
        },
      };

      function partition(keys, groups) {
        const partitions = {};
        Object.keys(groups).forEach((group) => {
          partitions[group] = [];
        });
        keys.forEach((key) => {
          const keyId = id.getID(key);
          const partition = id.naiveHash(keyId, Object.keys(groups));
          partitions[partition].push(key);
        });
        return partitions;
      }

      const routeKey = 'mr-' + sid;
      global.distribution[context.gid].routes.put(mapReduce, routeKey, (err, _) => {
        global.distribution.local.groups.get(context.gid, (err, group) => {
          const partitions = partition(configuration.keys, group);
          const totalNodes = Object.keys(group).length;
          let completed = 0;

          const mapRemote = {service: routeKey, method: 'map'};

          for (const nid in group) {
            const node = group[nid];
            const message = [partitions[nid], context.gid, sid];
            mapRemote.node = node;

            global.distribution.local.comm.send(message, mapRemote, (err, _) => {
              completed++;
              if (completed === totalNodes) {
                const shuffleRemote = {service: routeKey, method: 'shuffle'};
                global.distribution[context.gid].comm.send([context.gid, sid], shuffleRemote, (err, _) => {
                  const reduceRemote = {service: routeKey, method: 'reduce'};
                  global.distribution[context.gid].comm.send([context.gid, sid], reduceRemote, (err, results) => {
                    let finalResult = [];
                    for (const partial of Object.values(results)) {
                      if (partial !== null) finalResult = finalResult.concat(partial);
                    }

                    cb(null, finalResult);

                    global.distribution[context.gid].routes.rem(routeKey, () => {});
                  });
                });
              }
            });
          }
        });
      });
    }
  }

  return {exec};
};

module.exports = mr;
