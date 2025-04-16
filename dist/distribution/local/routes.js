/** @typedef {import("../types").Callback} Callback */

const routes = {};

/**
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function get(configuration, callback) {
  let gid = 'local'; let service;
  if (typeof configuration === 'string') {
    service = configuration;
  } else if (typeof configuration === 'object' && configuration !== null) {
    gid = configuration.gid || 'local';
    service = configuration.service;
  } else {
    callback(new Error(`${configuration} not found`), null);
  }

  let result;
  if (gid === 'local') {
    result = routes[service];
  } else {
    result = global.distribution && global.distribution[gid] && global.distribution[gid][service];
  }

  if (result) {
    callback(null, result);
  } else {
    callback(new Error(`not found`), null);
  }
}

/**
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function put(service, configuration, callback) {
  routes[configuration] = service;
  if (typeof callback === 'function') {
    callback(null, configuration);
  }
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
  const removed = routes[configuration];
  delete routes[configuration];
  callback(null, removed);
};

module.exports = {get, put, rem};
