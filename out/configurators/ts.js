"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureTypescript = configureTypescript;
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
async function configureTypescript(configurator) {
  const hasTsChecker = configurator.hasDevDependency("fork-ts-checker-webpack-plugin") || configurator.hasDevDependency("electron-webpack-ts");
  if (!(hasTsChecker || configurator.hasDevDependency("ts-loader"))) {
    return;
  }
  // add after js
  configurator.extensions.splice(1, 0, ".ts", ".tsx");
  const isTranspileOnly = configurator.isTest || hasTsChecker && !configurator.isProduction;
  const tsConfigFile = await (0, _util().getFirstExistingFile)([path.join(configurator.sourceDir, "tsconfig.json"), path.join(configurator.projectDir, "tsconfig.json")], null);
  // check to produce clear error message if no tsconfig.json
  if (tsConfigFile == null) {
    throw new Error(`Please create tsconfig.json in the "${configurator.projectDir}":\n\n{\n  "extends": "./node_modules/electron-webpack/tsconfig-base.json"\n}\n\n`);
  }
  if (configurator.debug.enabled) {
    configurator.debug(`Using ${tsConfigFile}`);
  }
  // no sense to use fork-ts-checker-webpack-plugin for production build
  if (isTranspileOnly && !configurator.isTest) {
    const hasVue = configurator.hasDependency("vue");
    const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
    configurator.plugins.push(new ForkTsCheckerWebpackPlugin({
      tsconfig: tsConfigFile,
      logger: configurator.env.forkTsCheckerLogger || {
        info: () => {
          // ignore
        },
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      },
      vue: hasVue
    }));
  }
  const tsLoaderOptions = {
    // use transpileOnly mode to speed-up compilation
    // in the test mode also, because checked during dev or production build
    transpileOnly: isTranspileOnly,
    appendTsSuffixTo: [/\.vue$/],
    configFile: tsConfigFile
  };
  if (configurator.debug.enabled) {
    configurator.debug(`ts-loader options: ${JSON.stringify(tsLoaderOptions, null, 2)}`);
  }
  configurator.rules.push({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [{
      loader: "ts-loader",
      options: tsLoaderOptions
    }]
  });
}

// __ts-babel@6.0.4
//# sourceMappingURL=ts.js.map