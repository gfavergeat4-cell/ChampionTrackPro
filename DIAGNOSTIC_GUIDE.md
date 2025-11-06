# 🔍 Guide de Diagnostic - Problème d'affichage des événements

## 🚨 **Problème identifié :**
L'écran Schedule affiche "No events on this day" alors que vous avez 3 entraînements dans votre calendrier Google.

## 🔧 **Étapes de diagnostic :**

### **1. Vérifier que le serveur fonctionne**
```bash
# Le serveur devrait être accessible sur :
http://localhost:8108
```

### **2. Ouvrir l'outil de diagnostic**
Ouvrez le fichier `test-schedule-debug.html` dans votre navigateur pour diagnostiquer le problème.

### **3. Tests à effectuer dans l'ordre :**

#### **A. Test de connexion Firebase**
- Cliquez sur "Tester la connexion"
- ✅ **Attendu :** "Connexion Firebase réussie!"

#### **B. Vérifier les teams**
- Cliquez sur "Lister les teams"
- ✅ **Attendu :** Au moins 1 team avec `icsUrl` et `timeZone`

#### **C. Vérifier les événements**
- Cliquez sur "Lister les événements"
- ✅ **Attendu :** Des événements avec `startUTC` en millisecondes

#### **D. Test ICS Import**
- Cliquez sur "Tester l'import ICS"
- ✅ **Attendu :** ICS accessible avec des événements

#### **E. Test de filtrage**
- Cliquez sur "Tester le filtrage"
- ✅ **Attendu :** Des événements Mardi/Jeudi

## 🎯 **Solutions selon le diagnostic :**

### **Si aucun team n'est trouvé :**
1. Aller sur l'Admin Dashboard
2. Créer un team
3. Ajouter l'URL ICS au team

### **Si aucun événement n'est trouvé :**
1. Aller sur l'Admin Dashboard
2. Cliquer sur "📅 Calendrier" pour importer les événements
3. Vérifier que l'import fonctionne

### **Si les événements ne sont pas filtrés correctement :**
1. Vérifier que les événements ont `startUTC` en millisecondes
2. Vérifier que les événements sont des mardis/jeudis
3. Vérifier le timezone

### **Si l'ICS n'est pas accessible :**
1. Vérifier l'URL ICS
2. Vérifier que le calendrier Google est public
3. Tester l'URL dans le navigateur

## 🚀 **Actions correctives :**

### **1. Importer les événements depuis l'Admin Dashboard :**
```javascript
// Dans la console du navigateur (F12)
// Aller sur l'Admin Dashboard et cliquer sur "📅 Calendrier"
```

### **2. Vérifier les événements dans Firestore :**
```javascript
// Dans la console du navigateur (F12)
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const db = getFirestore();

// Remplacer par votre teamId
const teamId = 'your-team-id-here';

const eventsSnap = await getDocs(collection(db, 'teams', teamId, 'events'));
console.log('Events count:', eventsSnap.size);

eventsSnap.docs.forEach(doc => {
  const data = doc.data();
  console.log('Event:', {
    summary: data.summary,
    startUTC: data.startUTC,
    timeZone: data.timeZone
  });
});
```

### **3. Tester le filtrage :**
```javascript
// Dans la console du navigateur (F12)
const tuesdayThursdayEvents = eventsSnap.docs.filter(eventDoc => {
  const eventData = eventDoc.data();
  const eventDate = new Date(eventData.startUTC);
  const dayOfWeek = eventDate.getDay();
  return dayOfWeek === 2 || dayOfWeek === 4; // Mardi ou jeudi
});

console.log('Tuesday/Thursday events:', tuesdayThursdayEvents.length);
```

## 📋 **Checklist de résolution :**

- [ ] Serveur accessible sur `http://localhost:8108`
- [ ] Connexion Firebase fonctionne
- [ ] Au moins 1 team dans Firestore
- [ ] Team a `icsUrl` et `timeZone`
- [ ] Événements importés dans Firestore
- [ ] Événements ont `startUTC` en millisecondes
- [ ] Événements sont des mardis/jeudis
- [ ] Filtrage fonctionne correctement
- [ ] Écran Schedule affiche les événements

## 🎯 **Résultat attendu :**
L'écran Schedule devrait afficher vos 3 entraînements du jeudi avec les heures correctes et les boutons "Respond" fonctionnels.

---

**Une fois ces étapes suivies, vos événements devraient s'afficher correctement dans l'écran Schedule !** 🚀


