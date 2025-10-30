# Stitch → RN Integration Rules

- Les fichiers présents dans src/stitch_components/*.tsx sont des blueprints visuels.
- À intégrer dans les écrans finaux (Expo Router OU React Navigation) sans modifier :
  - la logique Firebase
  - la navigation existante
  - les handlers d’auth & services
- Remplacer les styles inline par les tokens de src/theme/tokens.ts.
- Police: Inter pour tout l’UI. Police marque (Cinzel-like) uniquement dans le wordmark du header.
- Respecter la DA: fond #0E1528, accents #4A67FF / #00E0FF, glassmorphism, glow doux.
- Ne pas introduire de nouvelles dépendances.
