const id = require('../util/id');
const log = require('../util/log');

const store = {
  store: new Map(),

  put: function(config, value) {
    const {key, gid} = config;
    if (!this.store.has(gid)) {
      this.store.set(gid, new Map());
    }
    this.store.get(gid).set(key, value);
  },

  append: function(config, value) {
    const {key, gid} = config;
    if (!this.store.has(gid)) {
      this.store.set(gid, new Map());
    }
    const group = this.store.get(gid);

    if (!group.has(key)) {
      group.set(key, []);
    }

    const existing = group.get(key);
    if (!Array.isArray(existing)) {
      throw new Error(`Cannot append to non-array value at ${gid}:${key}`);
    }

    existing.push(value);
  },

  get: function(config) {
    const {key, gid} = config;
    const group = this.store.get(gid);
    if (group && group.has(key)) {
      return group.get(key);
    }
    return null;
  },

  del: function(config) {
    const {gid, key} = config;
    const group = this.store.get(gid);
    if (group && group.has(key)) {
      const value = group.get(key);
      group.delete(key);
      return value;
    }
    return null;
  },

  toString: function() {
    const obj = {};
    for (const [gid, group] of this.store.entries()) {
      obj[gid] = Object.fromEntries(group.entries());
    }
    return JSON.stringify(obj, null, 2);
  },
};


function put(state, configuration, callback = () => {}) {
  log(`[mem.put] configuration: ${JSON.stringify(configuration)} state: ${JSON.stringify(state)} store: ${store.toString()}`);

  configuration = id.normalize(configuration);
  configuration.key = configuration.key || id.getID(state);
  configuration.gid = configuration.gid || 'local';
  configuration.action = configuration.action || 'put';

  store[configuration.action](configuration, state);

  log(`[mem.put] store (after): ${store.toString()}`);

  callback(null, state);
};

function get(configuration, callback) {
  log(`[mem.get] configuration: ${JSON.stringify(configuration)} store: ${store.toString()}`);

  configuration = id.normalize(configuration);
  configuration.gid = configuration.gid || 'local';

  if (!configuration.key) {
    const groupStore = store.store.get(configuration.gid) || {};
    const keys = Array.from(groupStore.keys());
    callback(null, keys);
    return;
  }

  const value = store.get(configuration);
  if (value) {
    callback(null, value);
  } else {
    callback(new Error(`Memory key "${configuration.key}" not found for ${configuration.gid}'s store`));
  }
}

function del(configuration, callback) {
  log(`[mem.del] configuration: ${JSON.stringify(configuration)} store: ${store.toString()}`);

  configuration = id.normalize(configuration);

  const deleted = store.del(configuration);

  log(`[mem.del] store (after): ${store.toString()}`);

  if (deleted) {
    callback(null, deleted);
  } else {
    callback(new Error(`Memory key "${configuration.key}" not found for ${configuration.gid}'s store`));
  }
};

module.exports = {put, get, del};
