const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const defaultConfig = getDefaultConfig(__dirname);

const blocklist = exclusionList([
  /functions[\/\\]node_modules[\/\\].*/,   // ignore les node_modules backend
  /android[\/\\].*\/node_modules[\/\\].*/, // ignore node_modules Android
  /\.gradle[\/\\].*/,                      // ignore caches gradle
]);

module.exports = mergeConfig(defaultConfig, {
  resolver: {
    blockList: blocklist,
  },
});
