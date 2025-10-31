const { getDefaultConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// Empêche d'embarquer Cloud Functions (deuxième copie de Firebase)
config.resolver = {
  ...config.resolver,
  blockList: exclusionList([
    /(^|[\\/])functions([\\/].*)?/,   // tout le dossier functions/
  ]),
};

module.exports = config;
