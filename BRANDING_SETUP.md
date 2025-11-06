# 🎨 Guide d'Harmonisation de l'Identité Visuelle ChampionTrackPRO

Ce guide explique comment harmoniser l'identité visuelle de ChampionTrackPRO sur toute la plateforme.

## ✅ Fichiers Créés

### 1. Template HTML avec Métadonnées
- **`web/index.html`** : Template HTML personnalisé avec toutes les métadonnées Open Graph et Twitter Cards

### 2. Assets de Logo
- **`assets/logo.svg`** : Logo SVG réutilisable avec effets de glow
- **`assets/og-image-template.html`** : Template HTML pour générer l'image Open Graph (1200x630px)

## 📋 Étapes pour Finaliser

### 1. Générer l'Image Open Graph (og-image.png)

L'image Open Graph doit être de **1200x630 pixels** et placée dans le dossier `public/` ou `web/dist/`.

**Option A : Utiliser le template HTML**
1. Ouvrez `assets/og-image-template.html` dans un navigateur
2. Utilisez un outil de capture d'écran ou un service comme :
   - [htmlcsstoimage.com](https://htmlcsstoimage.com)
   - [screenshotapi.net](https://screenshotapi.net)
   - Ou un outil local comme Puppeteer
3. Capturez l'image à 1200x630px
4. Enregistrez-la comme `public/og-image.png` ou `web/dist/og-image.png`

**Option B : Créer manuellement**
- Utilisez un outil de design (Figma, Photoshop, etc.)
- Fond : `#0E1528` (dégradé vers `#000000`)
- Logo : "ChampionTrackPro" avec "Pro" en cyan (#00E0FF)
- Police : Cinzel (logo), Inter (tagline)
- Tagline : "THE TRAINING INTELLIGENCE"
- Ajoutez un halo cyan subtil derrière le logo

### 2. Mettre à Jour les Assets d'Icônes

Les fichiers suivants doivent être mis à jour avec le logo lumineux :
- `assets/favicon.png` (16x16, 32x32, ou 48x48px recommandé)
- `assets/icon.png` (1024x1024px pour iOS/Android)
- `assets/adaptive-icon.png` (1024x1024px pour Android)
- `assets/splash-icon.png` (1024x1024px pour le splash screen)

**Recommandations :**
- Utilisez le logo "ChampionTrackPro" ou une version simplifiée
- Fond transparent ou fond sombre (#0E1528)
- Le logo doit être lisible même à petite taille
- Pour le favicon, une version simplifiée (CTP ou icône) peut être préférable

### 3. Vérifier la Configuration Expo

Le fichier `app.config.js` a été mis à jour avec :
- Métadonnées web (name, description, themeColor, etc.)
- Configuration pour le favicon

### 4. Vérifier le Template HTML

Le fichier `web/index.html` contient :
- ✅ Métadonnées Open Graph complètes
- ✅ Twitter Cards
- ✅ Favicon et apple-touch-icon
- ✅ Theme color

**Note :** Expo peut ne pas utiliser automatiquement ce template. Si nécessaire, vous devrez peut-être :
- Utiliser un plugin Expo pour injecter les métadonnées
- Ou modifier le fichier généré après le build

### 5. Mettre à Jour l'URL dans les Métadonnées

Dans `web/index.html`, remplacez :
- `https://championtrackpro.vercel.app/` par votre URL de production réelle
- Assurez-vous que l'URL de l'image Open Graph est correcte

## 🧪 Tests

### Test du Favicon
1. Lancez l'app : `npm run web:start`
2. Vérifiez que le favicon apparaît dans l'onglet du navigateur
3. Testez sur mobile (ajoutez à l'écran d'accueil)

### Test des Métadonnées Open Graph
1. Utilisez un outil de test :
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Entrez l'URL de votre site
3. Vérifiez que l'image, le titre et la description s'affichent correctement

### Test du Logo dans l'App
Vérifiez que le logo s'affiche correctement sur :
- ✅ Landing Screen (`screens/StitchLandingScreen.js`)
- ✅ Login Screen (`screens/StitchLoginScreen.js`)
- ✅ Create Account Screen (`screens/StitchCreateAccountScreen.js`)

## 📝 Notes Importantes

1. **Ne pas recréer le logo** : Utilisez les fichiers existants dans le projet
2. **Cohérence visuelle** : Tous les éléments doivent respecter la charte :
   - Fond sombre : `#0E1528`
   - Accent cyan : `#00E0FF`
   - Accent bleu : `#4A67FF`
   - Police logo : Cinzel
   - Police UI : Inter
3. **Optimisation** : Compressez les images pour le web (TinyPNG, ImageOptim, etc.)
4. **Accessibilité** : Assurez-vous que le logo reste lisible sur fond sombre

## 🔄 Après le Build

Après avoir exécuté `npm run web:build`, vérifiez que :
- Le fichier `web/dist/index.html` contient les métadonnées
- Le fichier `web/dist/og-image.png` existe
- Le favicon est accessible à `/favicon.png`

Si les métadonnées ne sont pas présentes dans le HTML généré, vous devrez peut-être :
1. Utiliser un plugin Expo pour injecter les métadonnées
2. Ou créer un script post-build pour modifier le HTML généré

