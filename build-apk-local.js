#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 ChampionTrackPRO - Build APK Local');
console.log('=====================================');

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('package.json')) {
  console.error('❌ Erreur: package.json non trouvé. Assurez-vous d\'être dans le répertoire du projet.');
  process.exit(1);
}

// Vérifier que Expo CLI est installé
try {
  execSync('npx expo --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Erreur: Expo CLI non trouvé. Installez-le avec: npm install -g @expo/cli');
  process.exit(1);
}

console.log('✅ Vérifications préliminaires OK');

// Créer le répertoire de build s'il n'existe pas
const buildDir = path.join(__dirname, 'builds');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('📁 Répertoire builds créé');
}

// Configuration pour le build local
const appConfig = {
  "expo": {
    "name": "ChampionTrackPRO",
    "slug": "championtrackpro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0E1528"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0E1528"
      },
      "package": "com.championtrackpro.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
};

// Sauvegarder la configuration
fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
console.log('✅ Configuration app.json mise à jour');

// Instructions pour l'utilisateur
console.log('\n📱 INSTRUCTIONS POUR CRÉER L\'APK:');
console.log('================================');
console.log('1. Ouvrez un terminal dans ce répertoire');
console.log('2. Exécutez: npx expo build:android');
console.log('3. Ou utilisez: npx eas build --platform android --profile preview');
console.log('\n🔧 ALTERNATIVE - Build avec Expo CLI:');
console.log('====================================');
console.log('1. npx expo install expo-dev-client');
console.log('2. npx expo run:android');
console.log('\n📦 Le fichier APK sera généré dans le dossier builds/');
console.log('\n🚀 Pour installer sur votre téléphone:');
console.log('1. Activez "Sources inconnues" dans les paramètres Android');
console.log('2. Transférez l\'APK sur votre téléphone');
console.log('3. Ouvrez le fichier APK et installez');

console.log('\n✅ Configuration terminée !');
console.log('📱 Vous pouvez maintenant créer votre APK.');
