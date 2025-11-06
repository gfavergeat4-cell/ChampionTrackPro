# 🧪 Guide de Test - ChampionTrackPro

## ✅ **Tests à exécuter pour valider l'implémentation**

### **1. Test de compilation**
```bash
# Démarrer le serveur sur un nouveau port
npx expo start --web --port 8107 --clear
```

**✅ Attendu :** Aucune erreur de compilation, serveur démarre correctement.

### **2. Test du schéma Firestore**

#### **A. Probe Firestore (à exécuter dans la console du navigateur)**
```javascript
// Dans la console du navigateur (F12)
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const db = getFirestore();

// Remplacer par votre vrai teamId
const teamId = 'your-team-id-here';

const snap = await getDocs(collection(db, 'teams', teamId, 'events'));
console.log('[PROBE] count =', snap.size);

snap.docs.slice(0, 3).forEach(doc => {
  const data = doc.data();
  console.log('[PROBE] sample', doc.id, {
    summary: data.summary,
    startUTC: data.startUTC,
    endUTC: data.endUTC,
    timeZone: data.timeZone,
    uid: data.uid,
    teamId: data.teamId
  });
});
```

**✅ Attendu :**
- `startUTC` et `endUTC` en millisecondes (13 chiffres)
- `timeZone: "Europe/Paris"`
- `teamId` correspondant

#### **B. Probe Next Session**
```javascript
const nowUTC = Date.now();
const q = query(
  collection(db, 'teams', teamId, 'events'),
  where('startUTC', '>=', nowUTC),
  orderBy('startUTC', 'asc'),
  limit(1)
);

const s = await getDocs(q);
console.log('[NEXT]', nowUTC, s.docs[0]?.data());
```

**✅ Attendu :** Un document correspondant au prochain événement.

### **3. Test de l'import ICS**

#### **A. Ajouter l'URL ICS au team**
1. Aller sur l'Admin Dashboard
2. Cliquer sur "📅 Calendrier" pour une équipe
3. Vérifier que l'URL ICS est ajoutée au document team

#### **B. Vérifier le document team**
```javascript
// Dans la console
const teamDoc = await getDoc(doc(db, 'teams', teamId));
const teamData = teamDoc.data();
console.log('Team data:', {
  icsUrl: teamData.icsUrl,
  timeZone: teamData.timeZone,
  calendarImported: teamData.calendarImported
});
```

**✅ Attendu :**
```javascript
{
  icsUrl: "https://calendar.google.com/calendar/ical/gfavergeat4%40gmail.com/public/basic.ics",
  timeZone: "Europe/Paris",
  calendarImported: true
}
```

### **4. Test de l'affichage des événements**

#### **A. Home Screen**
1. Se connecter en tant qu'athlète
2. Vérifier que les événements s'affichent
3. Vérifier les heures avec le bon timezone

#### **B. Schedule Screen**
1. Aller sur l'onglet "Schedule"
2. Vérifier les vues Day/Week/Month
3. Vérifier que les boutons "Respond" fonctionnent

### **5. Test du formatage des heures**

#### **A. Vérifier le formatage**
```javascript
// Dans la console
const event = { startUTC: 1730066100000, endUTC: 1730072700000, timeZone: 'Europe/Paris' };
const start = new Date(event.startUTC);
const end = new Date(event.endUTC);

const startTime = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: event.timeZone
}).format(start);

const endTime = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: event.timeZone
}).format(end);

console.log('Formatted time:', `${startTime} – ${endTime}`);
```

**✅ Attendu :** Format `HH:MM – HH:MM` avec le bon timezone.

### **6. Test des requêtes Firestore**

#### **A. Test de la requête Next Session**
```javascript
const nowUTC = Date.now();
const nextQuery = query(
  collection(db, 'teams', teamId, 'events'),
  where('startUTC', '>=', nowUTC),
  orderBy('startUTC', 'asc'),
  limit(1)
);

const nextSnap = await getDocs(nextQuery);
console.log('Next session:', nextSnap.docs[0]?.data());
```

#### **B. Test de la requête Week**
```javascript
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
weekStart.setHours(0, 0, 0, 0);

const weekEnd = new Date(weekStart);
weekEnd.setDate(weekEnd.getDate() + 6);
weekEnd.setHours(23, 59, 59, 999);

const weekQuery = query(
  collection(db, 'teams', teamId, 'events'),
  where('startUTC', '>=', weekStart.getTime()),
  where('startUTC', '<', weekEnd.getTime()),
  orderBy('startUTC', 'asc')
);

const weekSnap = await getDocs(weekQuery);
console.log('Week events:', weekSnap.docs.map(d => d.data()));
```

## 🚨 **Problèmes courants et solutions**

### **Erreur 500 - Internal Server Error**
- Vérifier que le serveur Expo fonctionne
- Redémarrer avec `--clear`
- Vérifier les erreurs de compilation

### **MIME type error**
- Le bundle n'est pas servi correctement
- Redémarrer le serveur
- Vérifier la configuration Expo

### **Erreurs de compilation**
- Vérifier les imports dupliqués
- Vérifier la syntaxe JSX
- Nettoyer le cache avec `--clear`

### **Événements non affichés**
- Vérifier le schéma Firestore
- Vérifier les requêtes
- Vérifier les timezones

## 📊 **Résultats attendus**

### **Schéma Firestore correct :**
```javascript
{
  teamId: "team-123",
  summary: "Kickboxing",
  startUTC: 1730066100000, // 13 chiffres
  endUTC: 1730072700000,   // 13 chiffres
  timeZone: "Europe/Paris",
  uid: "kickboxing-morning@example.com",
  description: "Entraînement de kickboxing matinal",
  location: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### **Requêtes optimisées :**
- **Next session** : `where('startUTC', '>=', nowUTC)` + `orderBy('startUTC', 'asc')` + `limit(1)`
- **Week events** : `where('startUTC', '>=', weekStart)` + `where('startUTC', '<', weekEnd)` + `orderBy('startUTC', 'asc')`

### **Formatage des heures :**
- Format : `HH:MM – HH:MM`
- Timezone : Respect du `timeZone` de l'événement
- Locale : `fr-FR` pour l'affichage français

## 🎯 **Critères de succès**

1. ✅ **Compilation** : Aucune erreur de compilation
2. ✅ **Schéma** : `startUTC/endUTC` en millisecondes (13 chiffres)
3. ✅ **Requêtes** : Next session et Week events fonctionnent
4. ✅ **Affichage** : Heures formatées avec le bon timezone
5. ✅ **Navigation** : Boutons "Respond" fonctionnent
6. ✅ **Import** : URL ICS ajoutée au document team

---

**🚀 Une fois tous ces tests passés, l'application devrait fonctionner parfaitement avec le nouveau schéma Firestore et les requêtes optimisées !**


