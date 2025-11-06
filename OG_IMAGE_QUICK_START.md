# 🚀 Démarrage Rapide - Génération og-image.jpg

## ✅ Ce qui a été fait

1. ✅ Script de génération créé : `scripts/generate-og-image.js`
2. ✅ Dépendance `sharp` ajoutée au `package.json`
3. ✅ Script npm ajouté : `npm run og:generate`
4. ✅ Métadonnées mises à jour pour pointer vers `.jpg` et l'URL correcte
5. ✅ Copie automatique de l'image dans `web/dist` après le build
6. ✅ Guide complet créé : `OG_IMAGE_GUIDE.md`

## 📝 Étapes pour générer votre image

### 1. Installer les dépendances
```bash
npm install
```

### 2. Générer l'image Open Graph

**Option A : Si votre image est dans un emplacement standard**
Placez votre image source dans :
- `assets/logo-source.jpg` ou `.png`
- `public/logo-source.jpg` ou `.png`

Puis exécutez :
```bash
npm run og:generate
```

**Option B : Si votre image est ailleurs**
```bash
node scripts/generate-og-image.js "chemin/vers/votre/image.jpg"
```

**Exemple :**
```bash
node scripts/generate-og-image.js "C:\Users\gabfa\Downloads\mon-logo.jpg"
```

### 3. Build et déploiement
```bash
npm run web:build:meta
```

Cette commande :
- ✅ Build l'application
- ✅ Injecte les métadonnées Open Graph
- ✅ Copie automatiquement `og-image.jpg` dans `web/dist/`

### 4. Vérifier l'accessibilité

Après déploiement sur Vercel, ouvrez :
```
https://champion-track-pro.vercel.app/og-image.jpg
```

### 5. Tester les aperçus

- **Facebook** : [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **LinkedIn** : [Post Inspector](https://www.linkedin.com/post-inspector/)
- **Twitter** : [Card Validator](https://cards-dev.twitter.com/validator)

## 📋 Résultat attendu

- ✅ Fichier généré : `web/og-image.jpg` (1200×630px, <1 MB)
- ✅ Fichier copié : `web/dist/og-image.jpg` (après build)
- ✅ Accessible publiquement : `https://champion-track-pro.vercel.app/og-image.jpg`
- ✅ Aperçus de partage fonctionnels sur tous les réseaux sociaux

## 🔧 Dépannage

**Erreur "sharp n'est pas installé"**
```bash
npm install sharp --save-dev
```

**L'image fait plus de 1 MB**
Modifiez `scripts/generate-og-image.js` ligne 89 : `quality: 85` → `quality: 75`

**L'aperçu ne se met pas à jour**
Utilisez les outils de debug pour forcer le rafraîchissement du cache.

## 📚 Documentation complète

Voir `OG_IMAGE_GUIDE.md` pour plus de détails.

