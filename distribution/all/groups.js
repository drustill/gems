const groups = function (config) {
  const context = {};
  context.gid = config.gid || 'all';

  return {
    put: (config, group, callback) => {
      global.distribution[context.gid].comm.send([config, group], {service: 'groups', method: 'put'}, callback);
    },

    del: (name, callback) => {
      global.distribution[context.gid].comm.send([name], {service: 'groups', method: 'del'}, callback);
    },

    get: (name, callback) => {
      global.distribution[context.gid].comm.send([name], {service: 'groups', method: 'get'}, callback);
    },

    add: (name, node, callback) => {
      global.distribution[context.gid].comm.send([name, node], {service: 'groups', method: 'add'}, callback);
    },

    rem: (name, node, callback) => {
      global.distribution[context.gid].comm.send([name, node], {service: 'groups', method: 'rem'}, callback);
    },
  };
};

module.exports = groups;
