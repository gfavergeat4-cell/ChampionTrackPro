/**
 * Metro config pour projet Expo/React Native.
 * On s'appuie sur `expo/metro-config` (fourni par le paquet `expo`),
 * donc PAS besoin de `@react-native/metro-config`.
 */
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// (Optionnel) Ajustements si besoin, ex:
// config.resolver.sourceExts.push("cjs");

module.exports = config;
