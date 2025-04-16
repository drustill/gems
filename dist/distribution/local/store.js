/* Notes/Tips:

- Use absolute paths to make sure they are agnostic to where your code is running from!
  Use the `path` module for that.
*/
const fs = require('fs');
const path = require('path');
const id = require('../util/id');
const log = require('../util/log');

const {serialize, deserialize} = require('../util/serialization');

const store = path.join(__dirname, '../../store');

function put(state, configuration, callback) {
  configuration = id.normalize(configuration);
  configuration.key = configuration.key || id.getID(state);
  configuration.gid = configuration.gid || 'local';

  const serialized = serialize(state);

  let filename = Buffer.from(configuration.key).toString('base64');
  const dir = `${store}/s-${global.moreStatus.sid}`;
  filename = `${dir}/${configuration.gid}-${filename}`;

  log(
      `[store.put] configuration: ${JSON.stringify(configuration)} ` +
    `state: ${JSON.stringify(state)} filename: ${filename}`,
  );

  fs.mkdirSync(dir, {recursive: true});
  fs.writeFile(filename, serialized, (err) => {
    if (err) {
      console.log(err);
      callback(err);
      return;
    }
    callback(null, state);
  });
}

function get(configuration, callback) {
  configuration = id.normalize(configuration);
  configuration.gid = configuration.gid || 'local';

  if (!configuration.key) {
    const dirPath = `${store}/s-${global.moreStatus.sid}`;
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        callback(err, null);
        return;
      }

      const keys = [];

      for (const file of files) {
        const parts = file.split('-');
        const fileGid = parts[0];
        if (fileGid !== configuration.gid) continue;

        const encodedKey = parts[parts.length - 1];
        const decodedKey = Buffer.from(encodedKey, 'base64').toString('utf8');
        keys.push(decodedKey);
      }

      callback(null, keys);
    });

    return;
  }

  let filename = Buffer.from(configuration.key).toString('base64');
  filename = `${store}/s-${global.moreStatus.sid}/${configuration.gid}-${filename}`;

  log(`[store.get] configuration: ${JSON.stringify(configuration)} filename: ${filename}`);

  fs.readFile(filename, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        callback(new Error(`File ${filename} (from key '${configuration.key}') not found for group ${configuration.gid}`), null);
      } else {
        callback(err);
      }
      return;
    }

    const deserialized = deserialize(data.toString());
    callback(null, deserialized);
  });
}

function del(configuration, callback) {
  configuration = id.normalize(configuration);

  let filename = Buffer.from(configuration.key).toString('base64');
  filename = `${store}/s-${global.moreStatus.sid}/${configuration.gid}-${filename}`;

  get(configuration, (e, v) => {
    if (e) {
      callback(e);
      return;
    }

    fs.rm(filename, (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, v);
    });
  });
}

module.exports = {put, get, del};
