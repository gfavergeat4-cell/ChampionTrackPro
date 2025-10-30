# 🔄 Guide - Mise à jour automatique sur votre téléphone

## 🎯 Objectif
Que votre téléphone se mette à jour automatiquement quand vous modifiez le code.

## 🚀 Solution 1 : Expo Go (Recommandée)

### **Étape 1 : Installer Expo Go**
1. **Sur votre téléphone Android :**
   - Ouvrez le **Google Play Store**
   - Recherchez **"Expo Go"**
   - **Installez l'application** (gratuite)

### **Étape 2 : Démarrer le serveur de développement**
```bash
# Dans votre terminal, dans le dossier ChampionTrackPro
npx expo start
```

### **Étape 3 : Connecter votre téléphone**
1. **Sur votre ordinateur :** Vous verrez un QR code dans le terminal
2. **Sur votre téléphone :** Ouvrez Expo Go et scannez le QR code
3. **Votre app se lance** directement sur votre téléphone !

### **🔄 Mise à jour automatique :**
- ✅ **Modifiez votre code** sur l'ordinateur
- ✅ **Sauvegardez** (Ctrl+S)
- ✅ **L'app se met à jour automatiquement** sur votre téléphone !
- ✅ **Pas besoin de recompiler** ou réinstaller

---

## 🚀 Solution 2 : Expo Dev Client (Plus avancée)

### **Étape 1 : Installer le Dev Client**
```bash
npx expo install expo-dev-client
npx expo run:android
```

### **Étape 2 : Utiliser le tunnel**
```bash
npx expo start --tunnel
```

### **Avantages :**
- ✅ **Mise à jour en temps réel**
- ✅ **Hot reload** (rechargement instantané)
- ✅ **Debug** en direct
- ✅ **Console logs** visibles

---

## 🚀 Solution 3 : Build avec mise à jour OTA

### **Étape 1 : Configuration EAS Update**
```bash
npx eas update:configure
```

### **Étape 2 : Publier une mise à jour**
```bash
# Quand vous voulez mettre à jour
npx eas update --branch production --message "Nouvelle fonctionnalité"
```

### **Avantages :**
- ✅ **Mise à jour sans réinstaller l'app**
- ✅ **Distribution automatique**
- ✅ **Rollback** possible

---

## 📱 Instructions détaillées pour Expo Go

### **1. Démarrer le serveur :**
```bash
npx expo start
```

### **2. Vous verrez :**
```
Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### **3. Sur votre téléphone :**
1. **Ouvrez Expo Go**
2. **Scannez le QR code**
3. **L'app se lance !**

### **4. Pour les mises à jour :**
- **Modifiez votre code**
- **Sauvegardez** (Ctrl+S)
- **L'app se recharge automatiquement** sur votre téléphone

---

## 🔧 Dépannage

### **Problème : "Unable to connect"**
```bash
# Redémarrer avec tunnel
npx expo start --tunnel
```

### **Problème : "QR code ne fonctionne pas"**
1. Vérifiez que votre téléphone et ordinateur sont sur le même WiFi
2. Essayez : `npx expo start --tunnel`

### **Problème : "App ne se met pas à jour"**
1. Secouez votre téléphone (geste de refresh)
2. Ou fermez/rouvrez Expo Go

---

## 🎉 Résultat final

Avec Expo Go, vous aurez :
- ✅ **Développement en temps réel**
- ✅ **Mise à jour automatique**
- ✅ **Debug facile**
- ✅ **Pas de compilation nécessaire**

**🚀 Prêt à tester ? Lancez `npx expo start` et scannez le QR code !**

