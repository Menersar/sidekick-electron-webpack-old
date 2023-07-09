"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebpackRemoveOldAssetsPlugin = exports.MAX_FILE_REQUESTS = exports.CONCURRENCY = void 0;
exports.walk = walk;
function bluebird() {
  const data = _interopRequireWildcard(require("bluebird"));
  bluebird = function () {
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
var path = _interopRequireWildcard(require("path"));
function _util() {
  const data = require("../util");
  _util = function () {
    return data;
  };
  return data;
}
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const MAX_FILE_REQUESTS = 8;
exports.MAX_FILE_REQUESTS = MAX_FILE_REQUESTS;
const CONCURRENCY = {
  concurrency: MAX_FILE_REQUESTS
};
exports.CONCURRENCY = CONCURRENCY;
const debug = require("debug")("electron-webpack:clean");
async function walk(initialDirPath, filter) {
  const result = [];
  const queue = [initialDirPath];
  let addDirToResult = false;
  while (queue.length > 0) {
    const dirPath = queue.pop();
    const childNames = await (0, _util().orNullIfFileNotExist)((0, _fsExtra().readdir)(dirPath));
    if (childNames == null) {
      continue;
    }
    if (addDirToResult) {
      result.push(dirPath);
    } else {
      addDirToResult = true;
    }
    childNames.sort();
    const dirs = [];
    // our handler is async, but we should add sorted files, so, we add file to result not in the mapper, but after map
    const sortedFilePaths = await bluebird().map(childNames, name => {
      const filePath = dirPath + path.sep + name;
      return (0, _fsExtra().lstat)(filePath).then(stat => {
        if (filter != null && !filter(filePath, stat)) {
          return null;
        }
        if (stat.isDirectory()) {
          dirs.push(name);
          return null;
        } else {
          return filePath;
        }
      });
    }, CONCURRENCY);
    for (const child of sortedFilePaths) {
      if (child != null) {
        result.push(child);
      }
    }
    dirs.sort();
    for (const child of dirs) {
      queue.push(dirPath + path.sep + child);
    }
  }
  return result;
}
class WebpackRemoveOldAssetsPlugin {
  constructor(dllManifest) {
    this.dllManifest = dllManifest;
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync("WebpackRemoveOldAssetsPlugin", (compilation, callback) => {
      const newlyCreatedAssets = compilation.assets;
      const outDir = compiler.options.output.path;
      walk(outDir, (file, stat) => {
        // dll plugin
        if (file === this.dllManifest) {
          return false;
        }
        const relativePath = file.substring(outDir.length + 1);
        if (stat.isFile()) {
          return newlyCreatedAssets[relativePath] == null;
        } else if (stat.isDirectory()) {
          for (const p of Object.keys(newlyCreatedAssets)) {
            if (p.length > relativePath.length && (p[relativePath.length] === "/" || p[relativePath.length] === "\\") && p.startsWith(relativePath)) {
              return false;
            }
          }
          return true;
        }
        return false;
      }).then(it => {
        if (it.length === 0) {
          return null;
        }
        if (debug.enabled) {
          debug(`Remove outdated files:\n  ${it.join("\n  ")}`);
        }
        return bluebird().map(it, it => (0, _fsExtra().remove)(it), CONCURRENCY);
      }).then(() => callback()).catch(callback);
    });
  }
}
exports.WebpackRemoveOldAssetsPlugin = WebpackRemoveOldAssetsPlugin;
// __ts-babel@6.0.4
//# sourceMappingURL=WebpackRemoveOldAssetsPlugin.js.map