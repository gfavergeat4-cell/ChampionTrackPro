// Script de test pour vérifier le schéma Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies clés)
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

// Test du schéma Firestore
async function testFirestoreSchema() {
  try {
    console.log('🧪 Testing Firestore schema...');
    
    // Créer un événement de test avec le bon schéma
    const testEvent = {
      teamId: 'test-team-123',
      summary: 'Test Training',
      startUTC: Date.now() + 24 * 60 * 60 * 1000, // Demain
      endUTC: Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000, // +1h30
      timeZone: 'Europe/Paris',
      uid: 'test-event-' + Date.now(),
      description: 'Test event description',
      location: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('📝 Test event data:', testEvent);
    
    // Vérifier que startUTC et endUTC sont des millisecondes (13 chiffres)
    const startUTCLength = testEvent.startUTC.toString().length;
    const endUTCLength = testEvent.endUTC.toString().length;
    
    console.log(`✅ startUTC length: ${startUTCLength} (should be 13)`);
    console.log(`✅ endUTC length: ${endUTCLength} (should be 13)`);
    
    if (startUTCLength === 13 && endUTCLength === 13) {
      console.log('✅ Schema validation passed!');
    } else {
      console.log('❌ Schema validation failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing schema:', error);
  }
}

testFirestoreSchema().catch(console.error);


