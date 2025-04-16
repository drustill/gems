const {fork} = require('child_process');
const {serialize} = require('../util/serialization');
const local = require('../local/local');
const {createRPC} = require('../util/wire');

const status = function(config) {
  const context = {};
  context.gid = config.gid || 'all';


  return {
    get: (configuration, callback) => {
      const groupComm = global.distribution[context.gid].comm;
      groupComm.send([configuration], {service: 'status', method: 'get', gid: 'local'}, (errors, responses) => {
        if (['counts', 'heapTotal', 'heapUsed'].includes(configuration)) {
          let sum = 0;
          for (const sid in responses) {
            sum += Number(responses[sid]) || 0;
          }
          callback(errors, sum);
        } else {
          callback(errors, responses);
        }
      });
    },

    spawn: (configuration, callback) => {
      callback = callback || function() {};
      if (!configuration) {
        return callback(new Error('Need Configuration'), null);
      }

      const originalOnStart = configuration.onStart;
      const newOnStart = () => {
        if (typeof originalOnStart === 'function') {
          originalOnStart();
        }
        local.groups.add(context.gid, configuration, (e, v) => {});
        const groupComm = global.distribution[context.gid].comm;
        groupComm.send([context.gid, configuration], {service: 'groups', method: 'add', gid: context.gid}, (errors, responses) => {
          callback(null, configuration);
        });
      };

      configuration.onStart = createRPC(newOnStart);
      fork('distribution.js', ['--config', serialize(configuration)]);
    },

    stop: (callback) => {
      callback = callback || function() {};
      const groupComm = global.distribution[context.gid].comm;
      groupComm.send([], {service: 'status', method: 'stop', gid: context.gid}, (errors, responses) => {
        setTimeout(() => {
          global.distribution.node.server.close();
          callback(null, global.nodeConfig);
          // process.exit();
        }, 100);
      });
    },
  };
};

module.exports = status;
