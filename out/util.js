"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFirstExistingFile = getFirstExistingFile;
exports.getFreePort = getFreePort;
exports.orIfFileNotExist = orIfFileNotExist;
exports.orNullIfFileNotExist = orNullIfFileNotExist;
exports.statOrNull = statOrNull;
function BluebirdPromise() {
  const data = _interopRequireWildcard(require("bluebird"));
  BluebirdPromise = function () {
    return data;
  };
  return data;
}
function _fsExtra() {
  const data = require("fs-extra");
  _fsExtra = function () {
    return data;
  };
  return data;
}
function _net() {
  const data = require("net");
  _net = function () {
    return data;
  };
  return data;
}
var path = _interopRequireWildcard(require("path"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
async function statOrNull(file) {
  return orNullIfFileNotExist((0, _fsExtra().stat)(file));
}
function orNullIfFileNotExist(promise) {
  return orIfFileNotExist(promise, null);
}
function orIfFileNotExist(promise, fallbackValue) {
  return promise.catch(e => {
    if (e.code === "ENOENT" || e.code === "ENOTDIR") {
      return fallbackValue;
    }
    throw e;
  });
}
function getFirstExistingFile(names, rootDir) {
  return BluebirdPromise().filter(names.map(it => rootDir == null ? it : path.join(rootDir, it)), it => statOrNull(it).then(it => it != null)).then(it => it.length > 0 ? it[0] : null);
}
function getFreePort(defaultHost, defaultPort) {
  return new Promise((resolve, reject) => {
    const server = (0, _net().createServer)({
      pauseOnConnect: true
    });
    server.addListener("listening", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    function doListen(port) {
      server.listen({
        host: defaultHost,
        port,
        backlog: 1,
        exclusive: true
      });
    }
    server.on("error", e => {
      if (e.code === "EADDRINUSE") {
        server.close(() => doListen(0));
      } else {
        reject(e);
      }
    });
    doListen(defaultPort);
  });
}

// __ts-babel@6.0.4
//# sourceMappingURL=util.js.map