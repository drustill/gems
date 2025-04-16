const comm = require('./comm');
const gossip = {};
const received = new Set();

gossip.recv = function(payload, callback) {
  if (payload.metadata && payload.metadata.id) {
    if (received.has(payload.metadata.id)) {
      return callback(null, {});
    }

    received.add(payload.metadata.id);
  }
  comm.send([payload.name, payload.node], {...payload.remote, node: global.nodeConfig}, (e, v) => {
    callback(e, v);
  });
};

module.exports = gossip;
