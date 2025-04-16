const log = require('../util/log');
const {getNode} = require('../util/id');
const {serialize, deserialize} = require('../util/serialization');

const distribution = global.distribution;
const util = distribution.util;

const store = function(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || global.distribution.util.id.naiveHash;

  /* For the distributed store service, the configuration will
          always be a string */
  return {
    get: (configuration, callback) => {
      if (!configuration) {
        const message = [{key: null, gid: context.gid}];
        distribution[context.gid].comm.send(message, {service: 'store', method: 'get'}, (errors, responses) => {
          log(`[all.store.get] null given as key. keys: ${JSON.stringify(responses)} errors: ${JSON.stringify(errors)}`);

          const allKeys = Object.values(responses).reduce((acc, keys) => acc.concat(keys), []);
          callback(errors, allKeys);
        });

        return;
      }

      getNode(context, configuration, (node) => {
        const message = [{key: configuration, gid: context.gid}];
        const remote = {service: 'store', method: 'get', node};

        distribution.local.comm.send(message, remote, callback);
      });
    },

    put: (state, configuration, callback) => {
      configuration = configuration || util.id.getID(state);
      getNode(context, configuration, (node) => {
        const message = [state, {key: configuration, gid: context.gid}];
        const remote = {service: 'store', method: 'put', node};

        log(`[all.store.put]: (gid: ${context.gid}) ${JSON.stringify(state)} ${JSON.stringify(configuration)} target node: ${JSON.stringify(node)}`);
        distribution.local.comm.send(message, remote, callback);
      });
    },

    del: (configuration, callback) => {
      getNode(context, configuration, (node) => {
        const message = [{key: configuration, gid: context.gid}];
        const remote = {service: 'store', method: 'del', node};
        distribution.local.comm.send(message, remote, callback);
      });
    },

    reconf: (configuration, callback) => {
      const groups = require('./groups')(config);

      groups.get(context.gid, (e, v) => {
        const [nids, nodes] = Object.entries(v);
        const remoteNode = nodes[0];
        const remote = {service: 'store', method: 'get', node: remoteNode, gid: 'local'};
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

            const remoteGet = {service: 'store', method: 'get', node: sourceNode, gid: 'local'};
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

              const remoteDel = {service: 'store', method: 'del', node: sourceNode, gid: 'local'};
              groupComm.send([fullKey], remoteDel, (delErr, delRes) => {
                const remotePut = {service: 'store', method: 'put', node: destNode, gid: 'local'};
                groupComm.send([serialize(value), fullKey], remotePut, (putErr, putRes) => {
                  if (putErr && Object.keys(putErr).length > 0) {
                    errorsOccurred.push(putErr);
                  }
                  pending--;
                  if (pending === 0) {
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

module.exports = store;
