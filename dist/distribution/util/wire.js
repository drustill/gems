const log = require('../util/log');
const serialization = require('../util/serialization');
const id = require('../util/id');
const node = require('../local/node');

global.toLocal = new Map();

function createRPC(func) {
  log(`Creating RPC: ${func.name}: ${func.toString().replace(/\n/g, '|')}`);
  const rpcID = id.getID(serialization.serialize(func));

  global.toLocal.set(rpcID, func);

  const fnBody = `
    const callback = args.pop();

    const remote = {node: ${JSON.stringify(node.config)}, service: '${rpcID}', method: 'call'};

    const message = args;

    distribution.local.comm.send(message, remote, (error, response) => {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  `;

  return new Function('...args', fnBody);
}

/*
  The toAsync function transforms a synchronous function that returns a value into an asynchronous one,
  which accepts a callback as its final argument and passes the value to the callback.
*/
function toAsync(func) {
  log(`Converting function to async: ${func.name}: ${func.toString().replace(/\n/g, '|')}`);

  // It's the caller's responsibility to provide a callback
  const asyncFunc = (...args) => {
    const callback = args.pop();
    try {
      const result = func(...args);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  };

  /* Overwrite toString to return the original function's code.
   Otherwise, all functions passed through toAsync would have the same id. */
  asyncFunc.toString = () => func.toString();
  return asyncFunc;
}


module.exports = {
  createRPC: createRPC,
  toAsync: toAsync,
};
