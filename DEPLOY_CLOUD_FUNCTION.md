# 🚀 Déploiement de la Cloud Function pour l'import ICS

## 📋 Prérequis

1. **Firebase CLI installé** :
   ```bash
   npm install -g firebase-tools
   ```

2. **Authentification Firebase** :
   ```bash
   firebase login
   ```

3. **Initialisation du projet** (si pas déjà fait) :
   ```bash
   firebase init functions
   ```

## 🔧 Installation des dépendances

```bash
cd functions
npm install
```

## 🚀 Déploiement

```bash
# Depuis la racine du projet
firebase deploy --only functions
```

## ✅ Vérification

1. **Vérifier dans la console Firebase** :
   - Aller dans "Functions"
   - Vérifier que `importCalendarForTeam` est déployée

2. **Tester depuis l'Admin Dashboard** :
   - Aller sur `http://localhost:8113`
   - Se connecter en tant qu'admin
   - Cliquer sur "📅 Calendrier" pour une équipe
   - Vérifier les logs dans la console

## 🔍 Logs de la Cloud Function

```bash
firebase functions:log
```

## 🎯 Résultat attendu

- ✅ Plus d'erreur "Requiring unknown module"
- ✅ Import ICS côté serveur (robuste)
- ✅ Événements stockés avec `startUTC` en millisecondes
- ✅ Gestion des fuseaux horaires correcte
- ✅ Idempotence (pas de doublons)

## 🚨 En cas d'erreur

1. **Vérifier les permissions** :
   ```bash
   firebase projects:list
   ```

2. **Vérifier la configuration** :
   ```bash
   firebase use --add
   ```

3. **Redéployer** :
   ```bash
   firebase deploy --only functions --force
   ```

