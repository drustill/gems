#!/usr/bin/env node
const distribution = require('../../config.js');
const local = require('../local/local');

const iterations = 1000;
const concurrencyLimit = 100;
const message = ['sid'];
const remote = {node: distribution.node.config, service: 'status', method: 'get'};

console.log(`[local.comm.send]: making ${iterations} requests`);
console.time('[local.comm.send]');

distribution.node.start((server) => {
  let activeRequests = 0;
  let completedRequests = 0;
  let requestIndex = 0;

  function sendNext() {
    while (activeRequests < concurrencyLimit && requestIndex < iterations) {
      activeRequests++;
      const currentRequest = requestIndex++;
      local.comm.send(message, remote, (err, res) => {
        activeRequests--;
        completedRequests++;

        if (err) {
          console.error(`Error in request ${currentRequest}:`, err);
        }

        if (completedRequests === iterations) {
          console.timeEnd('[local.comm.send]');
          server.close();
        } else {
          sendNext();
        }
      });
    }
  }

  sendNext();
});
