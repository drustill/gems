/** @typedef {import("../types").Callback} Callback */

function routes(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function put(service, name, callback = () => {}) {
    const groupComm = global.distribution[context.gid].comm;
    groupComm.send([service, name], {service: 'routes', method: 'put', gid: 'local'}, (errors, responses) => {
      callback(errors, responses);
    });
  }

  /**
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function rem(service, name, callback = () => {}) {
    const groupComm = global.distribution[context.gid].comm;
    groupComm.send([service, name], {service: 'routes', method: 'rem', gid: 'local'}, (errors, responses) => {
      callback(errors, responses);
    });
  }

  return {put, rem};
}

module.exports = routes;
