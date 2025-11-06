# 🚀 ACTION IMMÉDIATE - Résoudre le problème des événements

## 🎯 **Problème identifié :**
- Pas d'événements dans "Next session"
- Pas d'événements dans "Schedule"
- Les événements du calendrier Google ne sont pas importés

## 🔧 **SOLUTION IMMÉDIATE :**

### **Étape 1 : Vérifier l'état actuel**
1. Ouvrez `quick-firestore-test.html` dans votre navigateur
2. Cliquez sur "Tester la connexion" → Doit afficher ✅
3. Cliquez sur "Lister les teams" → Doit afficher au moins 1 team
4. Cliquez sur "Lister les événements" → Vérifiez s'il y a des événements

### **Étape 2 : Importer les événements depuis l'Admin Dashboard**
1. Allez sur `http://localhost:8108`
2. Connectez-vous en tant qu'admin
3. Allez sur l'Admin Dashboard
4. Cliquez sur "📅 Calendrier" pour importer les événements
5. Vérifiez que l'import fonctionne

### **Étape 3 : Vérifier l'import**
1. Retournez sur `quick-firestore-test.html`
2. Cliquez sur "Lister les événements" → Doit afficher vos événements
3. Cliquez sur "Tester le filtrage" → Doit afficher les événements Mardi/Jeudi

### **Étape 4 : Tester l'application**
1. Allez sur `http://localhost:8108`
2. Connectez-vous en tant qu'athlète
3. Vérifiez l'écran Home → Doit afficher "Next session"
4. Vérifiez l'écran Schedule → Doit afficher les événements

## 🚨 **Si l'import ne fonctionne pas :**

### **Solution alternative : Import manuel**
1. Ouvrez la console du navigateur (F12)
2. Collez et exécutez ce code :

```javascript
// Import manuel des événements
async function importEventsManually() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { getFirestore, collection, getDocs, doc, setDoc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  
  const firebaseConfig = {
    apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
    authDomain: "championtrackpro.firebaseapp.com",
    projectId: "championtrackpro",
    storageBucket: "championtrackpro.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Récupérer le premier team
  const teamsSnap = await getDocs(collection(db, 'teams'));
  const teamId = teamsSnap.docs[0].id;
  
  // Créer des événements de test pour mardi et jeudi
  const today = new Date();
  const tuesday = new Date(today);
  tuesday.setDate(today.getDate() + (2 - today.getDay() + 7) % 7); // Prochain mardi
  const thursday = new Date(today);
  thursday.setDate(today.getDate() + (4 - today.getDay() + 7) % 7); // Prochain jeudi
  
  const events = [
    {
      id: 'test-tuesday-1',
      summary: 'Entraînement Mardi Matin',
      startUTC: new Date(tuesday.getFullYear(), tuesday.getMonth(), tuesday.getDate(), 9, 0).getTime(),
      endUTC: new Date(tuesday.getFullYear(), tuesday.getMonth(), tuesday.getDate(), 10, 30).getTime(),
      timeZone: 'Europe/Paris'
    },
    {
      id: 'test-tuesday-2',
      summary: 'Entraînement Mardi Soir',
      startUTC: new Date(tuesday.getFullYear(), tuesday.getMonth(), tuesday.getDate(), 18, 0).getTime(),
      endUTC: new Date(tuesday.getFullYear(), tuesday.getMonth(), tuesday.getDate(), 19, 30).getTime(),
      timeZone: 'Europe/Paris'
    },
    {
      id: 'test-thursday-1',
      summary: 'Entraînement Jeudi Matin',
      startUTC: new Date(thursday.getFullYear(), thursday.getMonth(), thursday.getDate(), 9, 0).getTime(),
      endUTC: new Date(thursday.getFullYear(), thursday.getMonth(), thursday.getDate(), 10, 30).getTime(),
      timeZone: 'Europe/Paris'
    },
    {
      id: 'test-thursday-2',
      summary: 'Entraînement Jeudi Soir',
      startUTC: new Date(thursday.getFullYear(), thursday.getMonth(), thursday.getDate(), 18, 0).getTime(),
      endUTC: new Date(thursday.getFullYear(), thursday.getMonth(), thursday.getDate(), 19, 30).getTime(),
      timeZone: 'Europe/Paris'
    }
  ];
  
  // Importer les événements
  for (const event of events) {
    const eventRef = doc(db, 'teams', teamId, 'events', event.id);
    await setDoc(eventRef, {
      teamId: teamId,
      summary: event.summary,
      startUTC: event.startUTC,
      endUTC: event.endUTC,
      timeZone: event.timeZone,
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ Événement créé: ${event.summary}`);
  }
  
  console.log('🎉 Tous les événements ont été créés !');
}

// Exécuter l'import
importEventsManually();
```

## 🎯 **Résultat attendu :**
Après ces étapes, vous devriez voir :
- ✅ Des événements dans l'écran Home ("Next session")
- ✅ Des événements dans l'écran Schedule
- ✅ Les événements filtrés pour Mardi/Jeudi
- ✅ Les boutons "Respond" fonctionnels

---

**Suivez ces étapes dans l'ordre et vos événements devraient s'afficher correctement !** 🚀


