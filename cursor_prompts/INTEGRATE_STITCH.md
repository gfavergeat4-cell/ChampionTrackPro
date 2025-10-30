# ChampionTrackPro – Intégration *exacte* des designs Google Stitch

## Contexte
- Les composants Stitch ont été copiés tels quels dans \src/stitch_components/\ via \STITCH_MANIFEST.json\.
- **Ne modifie pas le visuel.** Aucune retouche de styles, couleurs, marges, tailles, typographies, ombres, etc.  
- Ta mission : **brancher** ces composants comme **présentation** (UI pure) sur les écrans existants et câbler la navigation/handlers, **sans toucher aux styles**.

## Contraintes/UI
- Respect **strict** du rendu Stitch : utilise le code HTML/CSS/JS fourni dans \src/stitch_components/*\.
- S'il faut exposer des props (ex: \sessions\, \onPressRespond\), ajoute des props **sans modifier la mise en page**.
- Si un layer décoratif bloque les clics (ex: grands cercles), ajoute \pointerEvents="none"\ **uniquement** sur ces décorations (pas sur les containers).
- **Aucun remplacement** par nos composants maison. On garde exactement les assets Stitch.

## Wiring à réaliser
1. **Landing** → affiche le composant Stitch de landing. Boutons :
   - **Create Account** → navigue vers \Register\
   - **Log In** → navigue vers \Login\

2. **Login** → réutilise l'existant (Firebase auth). Boutons et inputs Stitch :
   - Submit = \handleLogin(email, password)\
   - **Forgot Password?** → appelle \sendPasswordResetEmail\ ou route dédiée si déjà en place
   - Ne remonte aucun alert dans \Landing\/autres écrans

3. **Register (CreateAccount)** → utilise Stitch :
   - Inputs : team access code, full name, email, password
   - Toggle de rôle : **Athlete** par défaut (Coach plus tard, pas de logique maintenant)
   - Submit → crée l'utilisateur + enregistre \
ole\, \	eamId\ si access code mappé

4. **HomeTabs / AthleteHome** :
   - Utiliser le composant Stitch **Athlete Home** comme *pure UI*.
   - Le composant reçoit : \sessions\ (liste), \onPressRespond(sessionId)\.
   - Bouton **Respond** → \
avigation.navigate('QuestionnaireStart', { sessionId })\
   - Badges **Completed** quand une réponse existe (utilise \hasResponseForSession\ si présent).
   - Les onglets en bas doivent rester fonctionnels.

5. **QuestionnaireStart (MVP)** :
   - Écran minimal avec 3 sliders (intensity, fatigue, wellbeing) + bouton **Submit**.
   - À la soumission → \createQuestionnaireResponse\ (service existant) puis \goBack()\.
   - Aucune stylisation autre que Stitch si un composant correspondant existe; sinon UI minimale.

6. **ICS Import (plus tard si déjà en place)** :
   - Laisse en l'état. Pas de changement visuel ici.
   - Si un bouton “Import Schedule” existe quelque part, assure qu’il ouvre le picker et upsert les sessions (pas d’UI custom).

## Répertoires utiles
- **Manifest** : \STITCH_MANIFEST.json\ (mapping source/destination)  
- **Composants Stitch copiés** : \src/stitch_components/<nom_dossier_stitch>/\

## Règles à respecter
- ❌ **Ne change pas** les styles/stitches (pas de tailwind, pas de refactor visuel).
- ✅ Ajoute **uniquement** la logique (props + navigation).
- ✅ Corrige les blocages d’input/clic via \pointerEvents="none"\ sur les **décorations seulement**.
- ✅ Préserve toute la logique Firebase/Navigations existantes.

## Critères d’acceptation
- Accès Landing → Register / Login opérationnels.
- Auth OK → \HomeTabs\ s’affiche.  
- Athlète Home = design Stitch identique, **Respond** ouvre **QuestionnaireStart** avec le sessionId.
- Les onglets bas fonctionnent.
- Aucune régression d’auth; aucun style altéré.

> **Si tu as besoin de mapping fichier→écran**, lis \STITCH_MANIFEST.json\ et explore \src/stitch_components/\.
