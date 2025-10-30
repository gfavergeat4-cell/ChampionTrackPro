import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.firebasestorage.app",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createTestEvents() {
  try {
    console.log('🔐 Connexion à Firebase...');
    
    // Se connecter en tant qu'admin
    await signInWithEmailAndPassword(auth, 'gabfavergeat@gmail.com', 'votre_mot_de_passe');
    console.log('✅ Connecté en tant qu\'admin');

    // ID de l'équipe (remplacez par l'ID de votre équipe)
    const teamId = '1WBsBtebylCir2M86FiG';
    
    console.log('📅 Suppression des anciens événements...');
    
    // Supprimer les anciens événements
    const eventsCollection = collection(db, 'teams', teamId, 'events');
    const existingEvents = await getDocs(eventsCollection);
    const deletePromises = existingEvents.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('✅ Anciens événements supprimés:', existingEvents.size);

    // Créer les événements de test
    const testEvents = [
      {
        title: 'Entraînement matinal',
        startTime: '08:00',
        description: 'Session d\'endurance et technique',
        startDate: new Date('2024-12-15T08:00:00'),
        endDate: new Date('2024-12-15T09:30:00')
      },
      {
        title: 'Entraînement technique',
        startTime: '10:00',
        description: 'Focus sur la coordination et la précision',
        startDate: new Date('2024-12-16T10:00:00'),
        endDate: new Date('2024-12-16T11:00:00')
      },
      {
        title: 'Match d\'entraînement',
        startTime: '18:00',
        description: 'Match de préparation contre l\'équipe B',
        startDate: new Date('2024-12-17T18:00:00'),
        endDate: new Date('2024-12-17T19:00:00')
      },
      {
        title: 'Séance de récupération',
        startTime: '09:00',
        description: 'Étirements et récupération active',
        startDate: new Date('2024-12-18T09:00:00'),
        endDate: new Date('2024-12-18T10:00:00')
      },
      {
        title: 'Entraînement physique',
        startTime: '16:00',
        description: 'Renforcement musculaire et cardio',
        startDate: new Date('2024-12-19T16:00:00'),
        endDate: new Date('2024-12-19T17:30:00')
      }
    ];

    console.log('📅 Création des événements de test...');
    
    const createPromises = testEvents.map(event => {
      const eventData = {
        title: event.title,
        startTime: event.startTime,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      };
      
      return addDoc(eventsCollection, eventData);
    });
    
    await Promise.all(createPromises);
    console.log('✅ Événements de test créés avec succès !');
    console.log('📊 Nombre d\'événements:', testEvents.length);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestEvents();
