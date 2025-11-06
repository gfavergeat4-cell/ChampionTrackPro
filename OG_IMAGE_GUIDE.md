# 📸 Guide de Génération de l'Image Open Graph

Ce guide explique comment générer `og-image.jpg` à partir de votre image source pour les aperçus de partage (LinkedIn, WhatsApp, Facebook, Twitter).

## 📋 Prérequis

1. **Installer la dépendance `sharp`** :
   ```bash
   npm install
   ```
   (La dépendance `sharp` a été ajoutée aux `devDependencies`)

## 🚀 Étapes

### 1. Préparer l'Image Source

Placez votre image source (celle que vous avez fournie) dans un des emplacements suivants :
- `assets/logo-source.jpg`
- `assets/logo-source.png`
- `public/logo-source.jpg`
- `public/logo-source.png`

**OU** gardez-la où elle est et notez son chemin complet.

### 2. Générer l'Image Open Graph

**Option A : Image dans un emplacement standard**
```bash
npm run og:generate
```

**Option B : Image avec chemin personnalisé**
```bash
node scripts/generate-og-image.js "chemin/vers/votre/image.jpg"
```

**Exemple :**
```bash
node scripts/generate-og-image.js "C:\Users\gabfa\Downloads\logo-championtrackpro.jpg"
```

### 3. Vérifier le Résultat

Le script génère `web/og-image.jpg` avec :
- ✅ Dimensions : 1200×630px (format Open Graph standard)
- ✅ Format : JPG (qualité optimisée, <1 Mo)
- ✅ Recadrage intelligent : l'image est redimensionnée pour couvrir les dimensions, puis recadrée au centre

### 4. Copier l'Image dans le Build

L'image doit être accessible publiquement après le build. Deux options :

**Option A : Copie manuelle**
Après `npm run web:build`, copiez `web/og-image.jpg` vers `web/dist/og-image.jpg`

**Option B : Automatique (recommandé)**
Le script peut être modifié pour copier automatiquement, ou vous pouvez ajouter cette étape dans votre workflow de build.

## 🧪 Tests

### 1. Test Local
```bash
npm run web:build
```
Vérifiez que `web/dist/og-image.jpg` existe et est accessible.

### 2. Test après Déploiement
1. Déployez sur Vercel
2. Ouvrez : `https://champion-track-pro.vercel.app/og-image.jpg`
3. Vérifiez que l'image s'affiche correctement

### 3. Test des Aperçus de Partage

**Facebook :**
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Entrez votre URL : `https://champion-track-pro.vercel.app/`
- Cliquez sur "Scrape Again" pour rafraîchir le cache

**LinkedIn :**
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- Entrez votre URL

**Twitter :**
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Entrez votre URL

## 📝 Notes Techniques

- **Dimensions** : 1200×630px (ratio 1.91:1) - standard Open Graph
- **Format** : JPG avec qualité 85% (optimisé pour le web)
- **Taille cible** : <1 MB
- **Recadrage** : L'image source est redimensionnée pour couvrir les dimensions, puis recadrée au centre
- **Qualité** : Si l'image fait plus de 1 MB, réduisez la qualité dans le script (ligne `quality: 85`)

## 🔧 Dépannage

### Erreur : "sharp n'est pas installé"
```bash
npm install sharp --save-dev
```

### L'image est trop grande (>1 MB)
Modifiez `scripts/generate-og-image.js` ligne `quality: 85` → `quality: 75` ou `quality: 70`

### L'image n'apparaît pas après le build
Assurez-vous que `web/og-image.jpg` est copié vers `web/dist/og-image.jpg` après le build.

### L'aperçu ne se met pas à jour
Les réseaux sociaux mettent en cache les aperçus. Utilisez les outils de debug pour forcer le rafraîchissement :
- Facebook : "Scrape Again" dans le Sharing Debugger
- LinkedIn : "Inspect" dans le Post Inspector
- Twitter : Le cache se rafraîchit automatiquement après quelques minutes

## ✅ Checklist

- [ ] `sharp` installé (`npm install`)
- [ ] Image source placée dans un emplacement accessible
- [ ] Script exécuté : `npm run og:generate`
- [ ] `web/og-image.jpg` généré (1200×630px, <1 MB)
- [ ] Image copiée vers `web/dist/og-image.jpg` après build
- [ ] Test d'accessibilité : `https://champion-track-pro.vercel.app/og-image.jpg`
- [ ] Test Facebook Sharing Debugger
- [ ] Test LinkedIn Post Inspector
- [ ] Test Twitter Card Validator

