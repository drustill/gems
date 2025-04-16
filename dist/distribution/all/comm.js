/** @typedef {import("../types").Callback} Callback */
const local = require('../local/local');

/**
 * NOTE: This Target is slightly different from local.all.Target
 * @typdef {Object} Target
 * @property {string} service
 * @property {string} method
 */

/**
 * @param {object} config
 * @return {object}
 */
function comm(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {Array} message
   * @param {object} configuration
   * @param {Callback} callback
   * @return {undefined}
   */
  function send(message, configuration, callback) {
    let nodes;
    if (context.gid === 'all') {
      const gids = Object.keys(local.groups);
      nodes = gids.reduce((acc, gid) => {
        return acc.concat(Object.entries(local.groups[gid]));
      }, []);
    } else {
      nodes = Object.entries(local.groups[context.gid]);
    }
    const responses = {};
    const errors = {};
    let pending = nodes.length;


    if (pending == 0) {
      return callback(errors, responses);
    }

    nodes.forEach(([sid, node]) => {
      local.comm.send(message, {...configuration, node}, (e, v) => {
        if (e) {
          errors[sid] = e;
        } else {
          responses[sid] = v;
        }

        if (--pending === 0) {
          callback(errors, responses);
        }
      });
    });
  };

  return {send};
};

module.exports = comm;
