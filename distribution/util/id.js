/** @typedef {import("../types.js").Node} Node */

const assert = require('assert');
const crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
/** @typedef {!string} ID */

/**
 * @param {any} obj
 * @return {ID}
 */
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

/**
 * The NID is the SHA256 hash of the JSON representation of the node
 * @param {Node} node
 * @return {ID}
 */
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

/**
 * The SID is the first 5 characters of the NID
 * @param {Node} node
 * @return {ID}
 */
function getSID(node) {
  return getNID(node).substring(0, 5);
}

function getMID(message) {
  const msg = {};
  msg.date = new Date().getTime();
  msg.mss = message;
  return getID(msg);
}

function idToNum(id) {
  const n = parseInt(id, 16);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
}

function consistentHash(kid, nids) {
  const numToIdMap = new Map();
  const tmpNids = [...nids, kid];
  const ids = nids.map((nid) => idToNum(nid));
  ids.push(idToNum(kid));
  for (let i = 0; i < ids.length; i++) {
    numToIdMap.set(ids[i], tmpNids[i]);
  }
  ids.sort((a, b) => a - b);
  const index = ids.indexOf(idToNum(kid));
  const nextIndex = (index + 1) % ids.length;
  return numToIdMap.get(ids[nextIndex]);
}

function rendezvousHash(kid, nids) {
  let maxScore = Number.NEGATIVE_INFINITY;
  let selected = null;

  for (const nid of nids) {
    const normalized = nid.substring(0, 5);
    const combined = kid + normalized;
    const hash = getID(combined);
    const score = idToNum(hash);

    if (score > maxScore) {
      maxScore = score;
      selected = nid;
    }
  }

  return selected;
}

function normalize(config) {
  if (!config) {
    return {key: null};
  } else if (typeof config === 'string') {
    return {key: config, gid: 'local'};
  } else {
    return {
      ...config,
      key: config.key || null,
      gid: config.gid || 'local',
    };
  }
}

const getNode = (context, configuration, callback) => {
  global.distribution[context.gid].status.get('node', (e, v) => {
    const nids = Object.values(v).map((node) => getSID(node));
    const kid = getID(configuration);
    const target = context.hash(kid, nids);
    const node = v[target];
    callback(node);
  });
};

module.exports = {
  getID,
  getNID,
  getSID,
  getMID,
  naiveHash,
  consistentHash,
  rendezvousHash,
  normalize,
  getNode,
};
