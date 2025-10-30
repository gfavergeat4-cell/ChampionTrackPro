# 🔧 FIX EVENTS NOW - Résoudre le problème des événements

## 🎯 **Problème identifié :**
- Home screen : Affiche "Entraînement" générique à 12:15
- Schedule screen : Affiche "No events on this day" pour le mardi 21 octobre 2025
- Les événements du calendrier Google ne sont pas importés correctement

## 🚀 **SOLUTION IMMÉDIATE :**

### **Étape 1 : Ouvrir l'outil de diagnostic**
1. Ouvrez `fix-events-now.html` dans votre navigateur
2. Cliquez sur "Vérifier l'état" pour voir l'état actuel
3. Vérifiez s'il y a des teams et des événements

### **Étape 2 : Importer depuis Google Calendar**
1. Dans `fix-events-now.html`
2. Cliquez sur "Importer depuis Google Calendar"
3. Cela va créer 4 événements (2 mardi, 2 jeudi) basés sur votre calendrier Google
4. Vérifiez que les événements sont créés

### **Étape 3 : Créer des événements de test (optionnel)**
1. Dans `fix-events-now.html`
2. Cliquez sur "Créer des événements de test"
3. Cela va créer des événements pour aujourd'hui et demain
4. Utile pour tester immédiatement

### **Étape 4 : Vérifier les événements**
1. Dans `fix-events-now.html`
2. Cliquez sur "Vérifier les événements"
3. Vérifiez que les événements sont bien créés
4. Vérifiez qu'ils sont des mardis/jeudis

### **Étape 5 : Tester l'application**
1. Allez sur `http://localhost:8108`
2. Connectez-vous en tant qu'athlète
3. Vérifiez l'écran Home → "Next session" devrait afficher le bon événement
4. Vérifiez l'écran Schedule → Les événements devraient s'afficher

## 🎯 **Résultat attendu :**
Après ces étapes, vous devriez voir :
- ✅ Des événements avec les vrais titres dans l'écran Home
- ✅ Des événements dans l'écran Schedule
- ✅ Les événements filtrés pour Mardi/Jeudi
- ✅ Les boutons "Respond" fonctionnels

## 📋 **Checklist de résolution :**

- [ ] Serveur accessible sur `http://localhost:8108`
- [ ] Connexion Firebase fonctionne
- [ ] Au moins 1 team dans Firestore
- [ ] Événements importés depuis Google Calendar
- [ ] Événements sont des mardis/jeudis
- [ ] Filtrage fonctionne correctement
- [ ] Écran Schedule affiche les événements
- [ ] Écran Home affiche "Next session" avec le bon titre

## 🚨 **Si l'application ne fonctionne toujours pas :**

### **Vérifier les erreurs de compilation :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez s'il y a des erreurs JavaScript
3. Si oui, redémarrez le serveur : `npx expo start --web --port 8109 --clear`

### **Vérifier la configuration Firebase :**
1. Dans `fix-events-now.html`
2. Vérifiez que la connexion Firebase fonctionne
3. Vérifiez que les teams existent
4. Vérifiez que les événements sont créés

---

**Suivez ces étapes dans l'ordre et vos événements devraient s'afficher correctement !** 🚀

