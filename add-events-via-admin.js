// Script pour ajouter des événements via l'interface admin
// Exécutez ce script dans la console de votre navigateur sur l'interface admin

console.log("🚀 Ajout d'événements de test via l'interface admin...");

// Fonction pour ajouter un événement
async function addEvent(title, startTime, endTime, description) {
  try {
    // Récupérer l'ID de l'équipe depuis l'interface admin
    const teamId = window.currentTeamId || prompt("Entrez l'ID de votre équipe:");
    
    if (!teamId) {
      console.log("❌ ID d'équipe requis");
      return;
    }

    const today = new Date();
    const eventData = {
      title: title,
      summary: title,
      startTime: startTime,
      endTime: endTime,
      startDate: today.toISOString(),
      endDate: new Date(today.getTime() + 90 * 60000).toISOString(),
      description: description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Utiliser l'API Firebase directement
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/championtrackpro/databases/(default)/documents/teams/${teamId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: eventData.title },
          summary: { stringValue: eventData.summary },
          startTime: { stringValue: eventData.startTime },
          endTime: { stringValue: eventData.endTime },
          startDate: { stringValue: eventData.startDate },
          endDate: { stringValue: eventData.endDate },
          description: { stringValue: eventData.description },
          createdAt: { timestampValue: eventData.createdAt.toISOString() },
          updatedAt: { timestampValue: eventData.updatedAt.toISOString() }
        }
      })
    });

    if (response.ok) {
      console.log(`✅ Événement créé: ${title}`);
    } else {
      console.log(`❌ Erreur lors de la création de ${title}:`, await response.text());
    }
  } catch (error) {
    console.error(`❌ Erreur pour ${title}:`, error);
  }
}

// Ajouter plusieurs événements
async function addAllEvents() {
  console.log("📅 Ajout des événements de test...");
  
  await addEvent("Entraînement Matin", "09:00", "10:30", "Entraînement matinal - Cardio et renforcement");
  await addEvent("Entraînement Après-midi", "14:00", "15:30", "Entraînement après-midi - Technique et endurance");
  await addEvent("Entraînement Soir", "18:00", "19:30", "Entraînement du soir - Récupération et stretching");
  
  console.log("🎉 Tous les événements ont été ajoutés !");
  console.log("📱 Rechargez votre application pour voir les nouveaux événements");
}

// Exécuter
addAllEvents();


