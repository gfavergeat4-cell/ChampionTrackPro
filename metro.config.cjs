/**
 * Expo SDK 54 — Metro config en CommonJS (.cjs) pour éviter les erreurs de chargement Node/EAS.
 * Aucune syntaxe ESM, aucun import TypeScript.
 */
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
