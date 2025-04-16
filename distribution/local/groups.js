const {getSID} = require('../util/id');

const groups = {
  'all': {},
};

groups.get = function (name, callback) {
  if (name in this) {
    callback(null, this[name]);
  } else {
    callback(new Error(`Group ${name} not found`), null);
  }
};

groups.put = function (config, group = {}, callback = () => {}) {
  const key = typeof config === 'string' ? {gid: config} : config;
  const {gid} = key;

  this[gid] = group;

  Object.keys(group).forEach((k) => {
    // const sid = getSID(group[k]);
    this.all[k] = group[k];
  });

  global.distribution[gid] = {};
  Object.keys(global.distribution.all).forEach((service) => {
    global.distribution[gid][service] = require(`../all/${service}`)(config);
  });

  callback(null, group);
};

groups.del = function (name, callback) {
  if (name in this) {
    const deleted = this[name];
    delete this[name];
    callback(null, deleted);
  } else {
    callback(new Error(`Group ${name} not found`), null);
  }
};

groups.add = function (name, node, callback) {
  callback = callback || function () {};

  if (name in this) {
    if (!this[name]) {
      this[name] = {};
    }

    const sid = getSID(node);

    this[name][sid] = node;
    this['all'][sid] = node;

    callback(null, this[name]);
  } else {
    callback(new Error(`Group ${name} not found`), null);
  }
};

groups.rem = function (name, node, callback) {
  callback = callback || function () {};

  if (name in this) {
    delete this[name][node];
    delete this['all'][node];

    callback(null, this[name]);
  } else {
    callback(new Error(`Group ${name} not found`), null);
  }
};

module.exports = groups;
