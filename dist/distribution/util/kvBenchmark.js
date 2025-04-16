#!/usr/bin/env node
const distribution = require('../../config.js');
const local = require('../local/local');
const id = require('../util/id');

const mygroupConfig = {gid: 'mygroup'};
const mygroupGroup = {};
const nodes = [
  {ip: '3.17.58.205', port: 1234},
  {ip: '3.128.192.112', port: 1234},
  {ip: '3.17.57.86', port: 1234},
];

nodes.forEach((node) => {
  const sid = id.getSID(node);
  mygroupGroup[sid] = node;
});

function setupGroup(callback) {
  distribution.node.start((server) => {
    distribution.local.groups.put(mygroupConfig, mygroupGroup, (e, v) => {
      if (e) {
        console.error('Error creating group:', e);
        return;
      }
      callback(e, v);
    });
  });
}

function randomString(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const iterations = 1000;
const concurrencyLimit = 100;

setupGroup((err) => {
  if (err) {
    console.error('Failed to setup group:', err);
    return;
  }

  const allKeys = [];

  console.log(`[mem.put]: making ${iterations} requests`);
  console.time('[mem.put]');

  let activeRequests = 0;
  let completedRequests = 0;
  let requestIndex = 0;

  function sendNext() {
    while (activeRequests < concurrencyLimit && requestIndex < iterations) {
      activeRequests++;
      requestIndex++;
      const key = randomString(10);
      const value = randomString(20);
      allKeys.push(key);
      distribution.mygroup.store.put(key, value, (e, v) => {
        activeRequests--;
        completedRequests++;

        if (completedRequests === iterations) {
          console.timeEnd('[mem.put]');


          console.log(`[mem.get]: making ${iterations} requests`);
          console.time('[mem.get]');

          activeRequests = 0;
          completedRequests = 0;
          requestIndex = 0;

          function sendNextGet() {
            while (activeRequests < concurrencyLimit && requestIndex < iterations) {
              activeRequests++;
              requestIndex++;
              const key = allKeys[requestIndex - 1];
              distribution.mygroup.store.get(key, (e, v) => {
                console.log(e, v);
                activeRequests--;
                completedRequests++;

                if (completedRequests === iterations) {
                  console.timeEnd('[mem.get]');
                  return;
                }
                sendNextGet();
              });
            }
          }

          sendNextGet();
        }
        sendNext();
      });
    }
  }

  sendNext();
});
