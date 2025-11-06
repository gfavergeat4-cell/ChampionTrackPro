# 📱 Guide détaillé - Créer et installer l'APK ChampionTrackPRO

## 🎯 Objectif
Créer un fichier APK que vous pouvez installer directement sur votre téléphone Android.

## 📋 Prérequis
- ✅ Node.js installé
- ✅ Expo CLI installé
- ✅ Votre projet ChampionTrackPRO fonctionnel

## 🚀 Méthode 1 : Build avec Expo (Recommandée)

### Étape 1 : Préparation
```bash
# Dans le terminal, dans votre dossier ChampionTrackPro
npx expo install expo-dev-client
```

### Étape 2 : Build de l'APK
```bash
# Option A : Build avec Expo CLI (plus simple)
npx expo run:android

# Option B : Build avec EAS (plus avancé)
npx eas build --platform android --profile preview
```

### Étape 3 : Localiser l'APK
- Le fichier APK sera créé dans le dossier `android/app/build/outputs/apk/`
- Cherchez le fichier `app-debug.apk` ou `app-release.apk`

## 🚀 Méthode 2 : Build local complet

### Étape 1 : Installation des dépendances Android
```bash
# Installer Android Studio (si pas déjà fait)
# Télécharger depuis : https://developer.android.com/studio

# Configurer les variables d'environnement
# ANDROID_HOME = C:\Users\[votre-nom]\AppData\Local\Android\Sdk
# PATH += %ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

### Étape 2 : Build avec Gradle
```bash
# Aller dans le dossier android
cd android

# Build de l'APK
./gradlew assembleDebug

# L'APK sera dans : android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Installation sur votre téléphone

### Étape 1 : Préparer votre téléphone
1. **Aller dans Paramètres > Sécurité**
2. **Activer "Sources inconnues" ou "Installer des applications inconnues"**
3. **Autoriser l'installation depuis votre ordinateur**

### Étape 2 : Transférer l'APK
1. **Connecter votre téléphone à l'ordinateur via USB**
2. **Copier le fichier APK** (ex: `app-debug.apk`) sur votre téléphone
3. **Ou utiliser Google Drive/Dropbox** pour transférer le fichier

### Étape 3 : Installer l'APK
1. **Sur votre téléphone, ouvrir le fichier APK**
2. **Cliquer sur "Installer"**
3. **Accepter les permissions**
4. **L'application sera installée !**

## 🔧 Dépannage

### Problème : "Build failed"
```bash
# Nettoyer le cache
npx expo start --clear
rm -rf node_modules
npm install
```

### Problème : "Android SDK not found"
1. Installer Android Studio
2. Configurer ANDROID_HOME dans les variables d'environnement
3. Redémarrer le terminal

### Problème : "APK ne s'installe pas"
1. Vérifier que "Sources inconnues" est activé
2. Essayer de désinstaller une ancienne version si elle existe
3. Redémarrer le téléphone

## 📦 Fichiers générés

Après le build, vous trouverez :
- `android/app/build/outputs/apk/debug/app-debug.apk` (version debug)
- `android/app/build/outputs/apk/release/app-release.apk` (version release)

## 🎉 Résultat final

Une fois installé, vous aurez ChampionTrackPRO sur votre téléphone avec :
- ✅ Interface complète
- ✅ Connexion Firebase
- ✅ Import de calendrier
- ✅ Système de questionnaires
- ✅ Navigation entre les onglets

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les prérequis sont installés
2. Redémarrez votre terminal
3. Nettoyez le cache avec `npx expo start --clear`
4. Vérifiez que votre téléphone accepte les installations depuis des sources inconnues

---

**🚀 Prêt à créer votre APK ? Suivez les étapes ci-dessus !**


