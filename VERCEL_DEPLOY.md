# Déploiement Vercel - ChampionTrackPro

## Configuration

Le projet est configuré pour être déployé automatiquement sur Vercel.

### Fichiers de configuration

- `vercel.json` : Configuration Vercel (build command, output directory, rewrites)
- `app.config.js` : Configuration Expo avec section web
- `.vercelignore` : Fichiers à exclure du déploiement

### Build

Le build web est généré avec :
```bash
npm run web:build
```

Cela crée les fichiers statiques dans `web/dist/`.

### Déploiement

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement la configuration
3. Le build se lancera automatiquement à chaque push

### Variables d'environnement (optionnel)

Si vous voulez utiliser des variables d'environnement pour Firebase, ajoutez-les dans Vercel :
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

Sinon, les valeurs par défaut dans `web/firebaseConfig.web.ts` seront utilisées.

### URL de déploiement

Après le premier déploiement, vous obtiendrez une URL du type :
- `https://championtrackpro.vercel.app`

Vous pouvez ensuite configurer un domaine personnalisé dans les paramètres Vercel.

