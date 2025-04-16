/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */
const {request} = require('http');
const {serialize, deserialize} = require('../util/util');

/**
 * @typedef {Object} Target
 * @property {string} service
 * @property {string} method
 * @property {Node} node
 */

/**
 * @param {Array} message
 * @param {Target} remote
 * @param {Callback} [callback]
 * @return {void}
 */
function send(message, {node, service, method, gid = 'local'}, callback) {
  const options = {
    method: 'PUT',
    host: node.ip,
    port: node.port,
    path: `/${gid}/${service}/${method}`,
  };
  const req = request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const {error, value} = deserialize(data);
      callback(error, value);
    });
  });

  req.on('error', (err) => {
    callback(new Error('Could not connect'), null);
  });
  req.write(serialize(message));
  req.end();
}

module.exports = {send};
