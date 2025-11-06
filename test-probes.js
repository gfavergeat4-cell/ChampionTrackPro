// Script de test des probes Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// TeamId à tester (remplacez par le vrai teamId)
const TEAM_ID = 'your-team-id-here';

async function testProbes() {
  try {
    console.log('🔍 Testing Firestore probes...');
    
    if (TEAM_ID === 'your-team-id-here') {
      console.error('❌ Please set the correct TEAM_ID in the script');
      process.exit(1);
    }
    
    // PROBE A: Events count and sample
    console.log('\n=== PROBE A: Events count and sample ===');
    const eventsCollection = collection(db, 'teams', TEAM_ID, 'events');
    const snap = await getDocs(eventsCollection);
    
    console.log('[PROBE] events count =', snap.size);
    
    if (snap.size > 0) {
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
    } else {
      console.log('❌ No events found in Firestore');
    }
    
    // PROBE B: Next session
    console.log('\n=== PROBE B: Next session ===');
    const nowUTC = Date.now();
    console.log('[NEXT] nowUTC =', nowUTC);
    
    const nextQuery = query(
      eventsCollection,
      where('startUTC', '>=', nowUTC),
      orderBy('startUTC', 'asc'),
      limit(1)
    );
    
    const nextSnap = await getDocs(nextQuery);
    if (nextSnap.empty) {
      console.log('[NEXT] No upcoming events found');
    } else {
      const nextEvent = nextSnap.docs[0].data();
      console.log('[NEXT] next event:', {
        summary: nextEvent.summary,
        startUTC: nextEvent.startUTC,
        timeZone: nextEvent.timeZone
      });
    }
    
    console.log('\n✅ Probes completed!');
    
  } catch (error) {
    console.error('❌ Error during probes:', error);
  }
}

testProbes().catch(console.error);


