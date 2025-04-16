const {serialize, deserialize} = require('../util/serialization');
const id = require('../util/id');
const log = require('../util/log');

const distribution = global.distribution;
const util = distribution.util;

function mem(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || global.distribution.util.id.naiveHash;

  /* For the distributed mem service, the configuration will
          always be a string */
  return {
    get: (configuration, callback) => {
      if (!configuration) {
        const message = [{key: null, gid: context.gid}];
        distribution[context.gid].comm.send(message, {service: 'mem', method: 'get'}, (errors, responses) => {
          log(`[all.mem.get] null given as key. keys: ${JSON.stringify(responses)} errors: ${JSON.stringify(errors)}`);

          const allKeys = Object.values(responses).reduce((acc, keys) => acc.concat(keys), []);
          callback(errors, allKeys);
        });

        return;
      }

      configuration = id.normalize(configuration);

      id.getNode(context, configuration, (node) => {
        const message = [{...configuration, gid: context.gid}];
        const remote = {service: 'mem', method: 'get', node};

        log(
            `[all.mem.get] configuration: ${JSON.stringify(configuration)} ` +
          `node: ${JSON.stringify(global.nodeConfig)} ` +
          `target node: ${JSON.stringify(node)}`,
        );

        distribution.local.comm.send(message, remote, callback);
      });
    },

    put: (state, configuration, callback) => {
      configuration = configuration || util.id.getID(state);
      configuration = id.normalize(configuration);
      id.getNode(context, configuration, (node) => {
        const message = [state, {...configuration, gid: context.gid}];
        const remote = {service: 'mem', method: 'put', node};

        log(
            `[all.mem.put] state: ${JSON.stringify(state)} ` +
          `configuration: ${JSON.stringify(configuration)} ` +
          `target node: ${JSON.stringify(node)}`,
        );

        distribution.local.comm.send(message, remote, callback);
      });
    },

    del: (configuration, callback) => {
      configuration = id.normalize(configuration);
      id.getNode(context, configuration, (node) => {
        const message = [{...configuration, gid: context.gid}];
        const remote = {service: 'mem', method: 'del', node};
        distribution.local.comm.send(message, remote, callback);
      });
    },

    reconf: (configuration, callback) => {
      const groups = require('./groups')(config);

      groups.get(context.gid, (e, v) => {
        if (Object.keys(e).length > 0) {
          callback(e, null);
          return;
        }
        const [nids, nodes] = Object.entries(v);
        const remoteNode = nodes[0];
        const remote = {service: 'mem', method: 'get', node: remoteNode, gid: 'local'};
        const groupComm = distribution[context.gid].comm;
        groupComm.send([null], remote, (e, v) => {
          const keySet = new Set();
          Object.values(v).forEach((responseObj) => {
            Object.keys(responseObj).forEach((key) => keySet.add(key));
          });
          const keysArray = Array.from(keySet);
          let pending = keysArray.length;
          const errorsOccurred = [];
          keysArray.forEach((key) => {
            const fullKey = key.indexOf(context.gid + ':') === 0 ? key : context.gid + ':' + key;
            const kid = util.id.getID(fullKey);
            const oldNids = Object.keys(configuration);
            const oldTarget = context.hash(kid, oldNids);
            const newTarget = context.hash(kid, nids);

            if (oldTarget === newTarget) {
              pending--;
              if (pending === 0) {
                callback(errorsOccurred.length ? errorsOccurred : null, 'Reconf complete');
              }
              return;
            }

            const sourceNode = nodes[oldTarget];
            const destNode = configuration[newTarget];

            const remoteGet = {service: 'mem', method: 'get', node: sourceNode, gid: 'local'};
            groupComm.send([fullKey], remoteGet, (getErr, getRes) => {
              if (getErr && Object.keys(getErr).length > 0) {
                errorsOccurred.push(getErr);
                pending--;
                if (pending === 0) {
                  callback(errorsOccurred.length ? errorsOccurred : null, 'Reconf complete');
                }
                return;
              }
              const value = deserialize(Object.values(getRes)[0]);

              const remoteDel = {service: 'mem', method: 'del', node: sourceNode, gid: 'local'};
              groupComm.send([fullKey], remoteDel, (delErr, delRes) => {
                const remotePut = {service: 'mem', method: 'put', node: destNode, gid: 'local'};
                groupComm.send([serialize(value), fullKey], remotePut, (putErr, putRes) => {
                  if (putErr && Object.keys(putErr).length > 0) {
                    errorsOccurred.push(putErr);
                  }
                  pending--;
                  if (pending === 0) {
                    console.log(errorsOccurred);
                    callback(errorsOccurred.length ? errorsOccurred : null, 'Reconf complete');
                  }
                });
              });
            });
          });
        });
      });
    },
  };
};

module.exports = mem;
