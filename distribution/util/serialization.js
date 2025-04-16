const builtins = require('repl')._builtinLibs;

const nativeFunctions = new Map();

function discoverNatives(module, path = [], visited = new WeakSet()) {
  if (visited.has(module)) return;
  visited.add(module);

  const keys = Object.getOwnPropertyNames(module);
  for (const key of keys) {
    let value;
    try {
      value = module[key];
    } catch (err) {
      continue;
    }
    if (typeof value === 'function') {
      const id = [...path, key].join('.');
      nativeFunctions.set(value, id);
    } else if (typeof value === 'object' && value !== null) {
      discoverNatives(value, [...path, key], visited);
    }
  }
}

/* global globalThis */
discoverNatives(globalThis, ['global']);
for (const mod of builtins) {
  try {
    const modObject = require(mod);
    discoverNatives(modObject, [mod]);
  } catch (err) {}
}

const nativeFunctionsById = new Map(
    [...nativeFunctions.entries()].map(([fn, id]) => [id, fn]),
);

function transformObject(object, transformFn) {
  return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [key, transformFn(value)]),
  );
}

function serialize(object, seen = new WeakMap(), idMap = new Map(), idCounter = {count: 0}) {
  if (object === null) {
    return JSON.stringify({type: 'null', value: ''});
  }
  const type = typeof object;
  switch (type) {
    case 'number':
    case 'string':
    case 'boolean':
      return JSON.stringify({type, value: object});
    case 'undefined':
      return JSON.stringify({type, value: ''});
    case 'function':
      if (nativeFunctions.has(object)) {
        return JSON.stringify({type: 'native', value: nativeFunctions.get(object)});
      }
      return JSON.stringify({type, value: object.toString()});
    case 'object':
      if (Array.isArray(object)) {
        return JSON.stringify({
          type: 'array',
          value: object.map((item) => serialize(item, seen, idMap, idCounter)),
        });
      }
      if (seen.has(object)) {
        return JSON.stringify({type: 'reference', id: idMap.get(object)});
      }
      const objId = idCounter.count++;
      seen.set(object, true);
      idMap.set(object, objId);
      if (Object.prototype.toString.call(object) === '[object Date]') {
        return JSON.stringify({type: 'date', value: object.toISOString()});
      }
      if (object instanceof Error) {
        return JSON.stringify({type: 'error', value: object.message});
      }
      return JSON.stringify({
        type,
        id: objId,
        value: transformObject(object, (value) => serialize(value, seen, idMap, idCounter)),
      });
  }
}

function deserialize(string, idMap = new Map()) {
  const object = JSON.parse(string);
  switch (object.type) {
    case 'number':
    case 'string':
    case 'boolean':
      return object.value;
    case 'function':
      return new Function(`return ${object.value}`)();
    case 'null':
      return null;
    case 'undefined':
      return undefined;
    case 'object':
      if (idMap.has(object.id)) {
        return idMap.get(object.id);
      }
      const instance = {};
      idMap.set(object.id, instance);
      Object.assign(
          instance,
          transformObject(object.value, (value) => deserialize(value, idMap)),
      );
      return instance;
    case 'array':
      return object.value.map((val) => deserialize(val, idMap));
    case 'date':
      return new Date(object.value);
    case 'error':
      return new Error(object.value);
    case 'reference':
      return idMap.get(object.id);
    case 'native':
      const nativeFn = nativeFunctionsById.get(object.value);
      if (nativeFn) {
        return nativeFn;
      } else {
        throw new Error('Native function not found: ' + object.value);
      }
  }
}

module.exports = {
  serialize,
  deserialize,
};
