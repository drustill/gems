const local = require('../local/local');

/**
 * Shuffle an array
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *
 * @param {Array} array
 * @return {Array}
 */
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const gossip = function(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.subset = config.subset || function(lst) {
    return Math.ceil(Math.log(lst.length));
  };

  return {
    send: (payload, remote, callback) => {
      const groupNodes = Object.entries(local.groups[context.gid] || {});
      if (groupNodes.length === 0) {
        callback(null, {});
        return;
      }

      let subsetSize = context.subset(groupNodes);
      subsetSize = Math.min(subsetSize, groupNodes.length);
      const chosen = shuffle([...groupNodes]).slice(0, subsetSize);

      const constructedPayload = {
        remote,
        name: payload[0],
        node: payload[1],
        metadata: {
          timestamp: Date.now(),
          id: Math.random().toString(36).substring(2),
        },
      };

      const responses = {};
      const errors = {};
      let pending = chosen.length;

      chosen.forEach(([sid, node]) => {
        local.comm.send([constructedPayload], {node, service: 'gossip', method: 'recv', gid: 'local'}, (e, v) => {
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
    },

    at: (period, func, callback) => {
    },

    del: (intervalID, callback) => {
    },
  };
};

module.exports = gossip;
