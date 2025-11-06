# 📱 Guide de création d'APK pour ChampionTrackPRO

## 🎯 Objectif
Créer un fichier APK installable sur votre téléphone Android, comme les applications du Google Play Store.

## 🚀 Méthodes disponibles

### **Méthode 1 : Build local (Recommandée)**

#### **Étape 1 : Préparation**
```bash
# Vérifier que vous êtes dans le bon répertoire
cd C:\Users\gabfa\ChampionTrackPro

# Installer les dépendances
npm install
```

#### **Étape 2 : Build avec Expo**
```bash
# Option A : Build Expo classique
npx expo build:android --type apk

# Option B : Build avec EAS (recommandé)
npx eas build --platform android --profile preview
```

#### **Étape 3 : Scripts automatisés**
```bash
# Utiliser le script Node.js
node build-apk.js

# Ou utiliser le script PowerShell
.\build-apk.ps1
```

### **Méthode 2 : EAS Build (Cloud)**

#### **Étape 1 : Configuration EAS**
```bash
# Se connecter à EAS
npx eas login

# Initialiser EAS
npx eas build:configure
```

#### **Étape 2 : Build cloud**
```bash
# Build pour Android
npx eas build --platform android --profile preview

# Build de production
npx eas build --platform android --profile production
```

## 📋 Configuration requise

### **1. Android Studio (Recommandé)**
- Télécharger depuis : https://developer.android.com/studio
- Installer le SDK Android
- Configurer les variables d'environnement

### **2. Java Development Kit (JDK)**
- Installer JDK 11 ou plus récent
- Configurer JAVA_HOME

### **3. Variables d'environnement**
```bash
# Ajouter à votre PATH
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
```

## 🔧 Résolution des problèmes

### **Erreur : "SDK not found"**
```bash
# Installer Android SDK
npx expo install --fix
```

### **Erreur : "Java not found"**
```bash
# Vérifier Java
java -version
javac -version
```

### **Erreur : "Build failed"**
```bash
# Nettoyer le cache
npx expo r -c
npm run clean
```

## 📱 Installation sur téléphone

### **1. Activer les sources inconnues**
- Paramètres → Sécurité → Sources inconnues ✅

### **2. Transférer l'APK**
- Copier le fichier `.apk` sur votre téléphone
- Ou utiliser ADB : `adb install app.apk`

### **3. Installer l'APK**
- Ouvrir le fichier APK sur votre téléphone
- Suivre les instructions d'installation

## 🎯 Fichiers de sortie

### **Local build :**
- `android-build/app-release.apk`
- `android/app/build/outputs/apk/release/app-release.apk`

### **EAS build :**
- Téléchargement depuis le dashboard EAS
- Lien fourni après le build

## 📞 Support

### **Commandes utiles :**
```bash
# Vérifier la configuration
npx expo doctor

# Nettoyer le projet
npx expo r -c

# Voir les logs
npx expo logs
```

### **En cas de problème :**
1. Vérifier que tous les prérequis sont installés
2. Nettoyer le cache : `npx expo r -c`
3. Réinstaller les dépendances : `npm install`
4. Utiliser EAS Build si le build local échoue

## 🎉 Résultat attendu

Vous obtiendrez un fichier `.apk` que vous pourrez installer sur votre téléphone Android, exactement comme les applications du Google Play Store !

**📱 Votre app ChampionTrackPRO sera alors disponible sur votre téléphone !**


