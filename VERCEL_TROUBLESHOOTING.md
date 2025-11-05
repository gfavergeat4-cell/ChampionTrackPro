# 🔧 Dépannage Vercel - ChampionTrackPro

## ❌ Problème : "No Production Deployment"

Si vous voyez "No Production Deployment" sur Vercel avec des erreurs 404, cela signifie que **aucun build n'a réussi** ou **aucun build n'a été déclenché**.

## ✅ Solutions à vérifier

### 1. Vérifier que le code est bien poussé sur GitHub

```bash
git status
git add .
git commit -m "fix: configure web build for Vercel"
git push origin main
```

### 2. Vérifier la configuration Vercel

Dans le dashboard Vercel :
1. Allez dans **Settings** → **General**
2. Vérifiez que :
   - **Root Directory** : `/` (vide)
   - **Build Command** : `npm run web:build`
   - **Output Directory** : `web/dist`
   - **Install Command** : `npm install`

### 3. Vérifier les logs de build

Dans le dashboard Vercel :
1. Cliquez sur **Deployments**
2. Ouvrez le dernier déploiement (même s'il a échoué)
3. Vérifiez les **Build Logs** pour voir l'erreur exacte

### 4. Vérifier localement que le build fonctionne

```bash
# Nettoyer
rm -rf node_modules web/dist

# Réinstaller
npm install

# Tester le build
npm run web:build

# Vérifier que web/dist/index.html existe
Test-Path web/dist/index.html
```

### 5. Erreurs communes et solutions

#### Erreur : "expo-router not found"
**Solution** : Vérifiez que `app.config.js` a `output: "single"` (pas `"static"`)

#### Erreur : "Module not found"
**Solution** : Vérifiez que toutes les dépendances sont dans `package.json`

#### Erreur : "Build timeout"
**Solution** : Le build prend trop de temps. Vérifiez que `.vercelignore` exclut les gros dossiers

#### Erreur : "Command failed"
**Solution** : Vérifiez que `npm run web:build` fonctionne localement

## 🔍 Vérifications à faire

1. ✅ Le fichier `vercel.json` existe à la racine
2. ✅ Le script `web:build` existe dans `package.json`
3. ✅ Le fichier `app.config.js` a `output: "single"`
4. ✅ Le build local fonctionne : `npm run web:build`
5. ✅ `web/dist/index.html` existe après le build
6. ✅ Le code est poussé sur la branche `main` (ou la branche connectée)

## 📝 Commandes pour déclencher un nouveau build

### Option 1 : Push sur GitHub
```bash
git commit --allow-empty -m "trigger vercel build"
git push origin main
```

### Option 2 : Déclencher manuellement dans Vercel
1. Allez dans **Deployments**
2. Cliquez sur **Redeploy** sur le dernier déploiement
3. Ou créez un nouveau déploiement depuis **Deployments** → **Create Deployment**

## 🚀 Si le build échoue

1. **Copiez les logs d'erreur** de Vercel
2. **Testez localement** avec les mêmes commandes
3. **Vérifiez** que toutes les dépendances sont installées
4. **Corrigez** les erreurs dans le code
5. **Poussez** à nouveau sur GitHub

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs de build dans Vercel
2. Testez le build localement avec `npm run web:build`
3. Vérifiez que `web/dist` contient bien `index.html` après le build

