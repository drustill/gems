const {fork} = require('child_process');
const {serialize} = require('../util/serialization');
const {createRPC} = require('../util/wire');

const status = {};

global.moreStatus = {
  sid: global.distribution.util.id.getSID(global.nodeConfig),
  nid: global.distribution.util.id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function (configuration, callback) {
  callback = callback || function () {};
  if (configuration === 'sid') {
    callback(null, global.moreStatus.sid);
    return;
  }
  if (configuration === 'nid') {
    callback(null, global.moreStatus.nid);
    return;
  }
  if (configuration === 'ip') {
    callback(null, global.nodeConfig.ip);
    return;
  }
  if (configuration === 'port') {
    callback(null, global.nodeConfig.port);
    return;
  }
  if (configuration === 'counts') {
    callback(null, global.moreStatus.counts);
    return;
  }
  if (configuration === 'heapTotal') {
    callback(null, process.memoryUsage().heapTotal);
    return;
  }
  if (configuration === 'heapUsed') {
    callback(null, process.memoryUsage().heapUsed);
    return;
  }
  if (configuration === 'node') {
    callback(null, global.nodeConfig);
    return;
  }
  callback(new Error('Status key not found'));
};

status.spawn = function (configuration, callback) {
  callback = callback || function () {};
  if (!configuration) {
    callback(new Error('Configuration is required'), null);
    return;
  }

  if (typeof configuration.onStart === 'function') {
    const originalOnStart = configuration.onStart;

    const newOnStart = () => {
      originalOnStart();
      callback(null, configuration);
    };
    configuration.onStart = createRPC(newOnStart);
  } else {
    const newOnStart = () => {
      callback(null, configuration);
    };
    configuration.onStart = createRPC(newOnStart);
  }

  fork('distribution.js', ['--config', serialize(configuration)]);
};

status.stop = function (callback) {
  setTimeout(() => {
    global.distribution.node.server.close();
    callback(null, global.nodeConfig);
    process.exit();
  }, 200);
};

module.exports = status;
