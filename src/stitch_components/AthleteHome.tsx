import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { makePress } from "../utils/press";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";
import UnifiedAthleteNavigation from "./UnifiedAthleteNavigation";

interface AthleteHomeProps {
  sessions?: Array<{ id: string; title: string; time: string; hasResponse?: boolean }>;
  onRespond?: (sessionId: string, eventData?: any) => void;
  onOpenSession?: (sessionId: string) => void;
  onNavigateToTab?: (tab: 'Home' | 'Schedule' | 'Profile') => void;
}

export default function AthleteHome({
  sessions = [],
  onRespond,
  onOpenSession,
  onNavigateToTab
}: AthleteHomeProps) {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  console.log("🏠 AthleteHome component loaded - this is the modified component");

  // Fonction de rechargement forcé
  const forceRefresh = () => {
    console.log("🔄 Rechargement forcé des données...");
    setRefreshKey(prev => prev + 1);
    setCalendarEvents([]);
    setLoading(true);
    
    // Forcer un rechargement complet après un court délai
    setTimeout(() => {
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    }, 100);
  };

  // Charger les événements du calendrier pour l'équipe de l'athlète
  useEffect(() => {
    const loadCalendarEvents = async () => {
      try {
        if (!auth.currentUser) {
          console.log("No authenticated user");
          setLoading(false);
          return;
        }

        // Récupérer les informations de l'utilisateur
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) {
          console.log("User document not found");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const teamId = userData.teamId;

        if (!teamId) {
          console.log("No team ID found for user");
          setLoading(false);
          return;
        }

        // Récupérer les informations de l'équipe
        const teamDoc = await getDoc(doc(db, "teams", teamId));
        if (!teamDoc.exists()) {
          console.log("Team document not found");
          setLoading(false);
          return;
        }

        const teamData = teamDoc.data();
        console.log("📅 Données de l'équipe:", teamData);
        
        if (!teamData.calendarImported) {
          console.log("📅 Aucun calendrier importé pour cette équipe");
          setCalendarEvents([]);
          setLoading(false);
          return;
        }

        // Récupérer les événements du calendrier pour cette équipe
        const eventsRef = collection(db, "teams", teamId, "events");
        const eventsSnapshot = await getDocs(eventsRef);
        
        console.log("📅 Nombre d'événements trouvés:", eventsSnapshot.size);
        
        const events = [];
        for (const docSnapshot of eventsSnapshot.docs) {
          const eventData = docSnapshot.data();
          console.log("📅 Événement trouvé:", eventData);
          
          // Vérifier si l'athlète a déjà répondu à ce questionnaire
          let hasResponse = false;
          try {
            const responseRef = doc(db, "teams", teamId, "events", docSnapshot.id, "responses", auth.currentUser.uid);
            const responseDoc = await getDoc(responseRef);
            hasResponse = responseDoc.exists();
            
            console.log("📅 Vérification réponse pour événement", docSnapshot.id);
            console.log("📅 Response doc exists:", responseDoc.exists());
            console.log("📅 Response doc data:", responseDoc.data());
            console.log("📅 hasResponse final:", hasResponse);
            
            // Double vérification avec un petit délai pour s'assurer que les données sont bien sauvegardées
            if (!hasResponse) {
              await new Promise(resolve => setTimeout(resolve, 100));
              const responseDocRetry = await getDoc(responseRef);
              hasResponse = responseDocRetry.exists();
              console.log("📅 Vérification retry - Response doc exists:", responseDocRetry.exists());
              console.log("📅 hasResponse après retry:", hasResponse);
            }
          } catch (error) {
            console.log("📅 Erreur lors de la vérification de la réponse:", error);
          }
          
          console.log("📅 Event data from Firestore:", eventData);
          console.log("📅 Event title:", eventData.title);
          console.log("📅 Event summary:", eventData.summary);
          
          // Formater l'heure avec la timezone de l'événement
          const formatTime = (startUTC: number, endUTC: number, timeZone: string) => {
            const startTime = new Intl.DateTimeFormat('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: timeZone
            }).format(new Date(startUTC));
            
            const endTime = new Intl.DateTimeFormat('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: timeZone
            }).format(new Date(endUTC));
            
            return `${startTime} - ${endTime}`;
          };

          events.push({
            id: docSnapshot.id,
            title: eventData.title || eventData.summary || "Événement",
            time: eventData.startUTC && eventData.endUTC && eventData.timeZone 
              ? formatTime(eventData.startUTC, eventData.endUTC, eventData.timeZone)
              : eventData.startTime || "Heure non définie",
            hasResponse: hasResponse,
            ...eventData
          });
        }

        // Filtrer les événements pour n'afficher que ceux du mardi et jeudi
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        console.log("📅 Aujourd'hui:", today.toDateString());
        console.log("📅 Plage de dates:", todayStart.toISOString(), "à", todayEnd.toISOString());
        
        const todayEvents = events.filter(event => {
          console.log("📅 Vérification événement:", event.title, "startUTC:", event.startUTC);
          
          // Utiliser startUTC en millisecondes pour le filtrage
          if (!event.startUTC) {
            console.log("📅 Pas de startUTC valide pour l'événement:", event.title);
            return false;
          }
          
          const eventDate = new Date(event.startUTC);
          console.log("📅 Date de l'événement (startUTC):", eventDate.toDateString());
          
          // Vérifier si c'est aujourd'hui ET si c'est mardi ou jeudi
          const isToday = eventDate >= todayStart && eventDate < todayEnd;
          const dayOfWeek = eventDate.getDay(); // 0=dimanche, 1=lundi, 2=mardi, 4=jeudi
          const isTuesdayOrThursday = dayOfWeek === 2 || dayOfWeek === 4;
          
          console.log("📅 Est-ce aujourd'hui?", isToday, "pour", event.title);
          console.log("📅 Jour de la semaine:", dayOfWeek, "(2=mardi, 4=jeudi)");
          console.log("📅 Est mardi ou jeudi?", isTuesdayOrThursday);
          
          return isToday && isTuesdayOrThursday;
        });

        // Trier les événements de la journée par heure
        todayEvents.sort((a, b) => {
          const timeA = a.startUTC ? new Date(a.startUTC) : new Date();
          const timeB = b.startUTC ? new Date(b.startUTC) : new Date();
          return timeA.getTime() - timeB.getTime();
        });

        // Si aucun événement d'aujourd'hui, afficher tous les événements
        const eventsToShow = todayEvents.length > 0 ? todayEvents : events;
        
        setCalendarEvents(eventsToShow);
        console.log("📅 Événements d'aujourd'hui chargés:", todayEvents.length);
        console.log("📅 Événements affichés:", eventsToShow.length);
        console.log("📅 Événements d'aujourd'hui:", todayEvents);
        console.log("📅 Tous les événements:", events);

      } catch (error) {
        console.error("❌ Erreur lors du chargement des événements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarEvents();
  }, [refreshKey]);

  // Recharger les données quand l'utilisateur revient sur l'écran
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Écran d'accueil refocusé, rechargement des données...");
      forceRefresh();
    };

    // Pour le web, recharger à chaque fois et écouter les changements de focus
    if (Platform.OS === 'web') {
      handleFocus();
      
      // Écouter les changements de focus de la fenêtre
      window.addEventListener('focus', handleFocus);
      
      // Écouter les événements de stockage pour détecter les changements
      const handleStorageChange = (e) => {
        if (e.key === 'questionnaireSubmitted') {
          console.log("🔄 Questionnaire soumis détecté, rechargement...");
          forceRefresh();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Rechargement automatique toutes les 3 secondes pour s'assurer de la synchronisation
      const autoRefreshInterval = setInterval(() => {
        console.log("🔄 Rechargement automatique des données...");
        forceRefresh();
      }, 3000);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(autoRefreshInterval);
      };
    }
  }, []);

  // Toujours utiliser les événements du calendrier (pas de sessions par défaut)
  const displaySessions = calendarEvents;
  return (
    <View style={styles.container}>
      {/* Background gradient effects */}
      <View style={styles.backgroundEffect1} pointerEvents="none" />
      <View style={styles.backgroundEffect2} pointerEvents="none" />
      
      {/* Profile avatar */}
      <View style={styles.profileContainer} pointerEvents="none">
        <View style={styles.avatar} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>WELCOME BACK</Text>
              <Text style={styles.subtitle}>Here are your sessions for today.</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <Pressable 
              style={styles.refreshButton}
              onPress={() => {
                console.log("🔄 Rafraîchissement manuel des données...");
                forceRefresh();
              }}
            >
              <Text style={styles.refreshButtonText}>🔄</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            {calendarEvents.length > 0 && calendarEvents[0].startDate && 
             new Date(calendarEvents[0].startDate).toDateString() === new Date().toDateString() 
             ? "Today's Sessions" : "Your Sessions"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {calendarEvents.length > 0 && calendarEvents[0].startDate && 
             new Date(calendarEvents[0].startDate).toDateString() === new Date().toDateString() 
             ? "Your training events for today." : "Your upcoming training events."}
          </Text>

          <View style={styles.sessionsList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading calendar...</Text>
              </View>
            ) : displaySessions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sessions today</Text>
                <Text style={styles.emptySubtext}>No training scheduled for today</Text>
              </View>
            ) : (
              displaySessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <Pressable 
                  style={[
                    styles.sessionInfo,
                    session.hasResponse && styles.completedSessionCard
                  ]}
                  onPress={makePress(() => {
                    if (session.hasResponse) {
                      console.log("Session already completed, access denied");
                      return; // Empêcher l'accès si déjà complété
                    }
                    console.log("Session clicked:", session.id);
                    onOpenSession?.(session.id);
                  })}
                  role={Platform.OS === "web" ? "button" : undefined}
                  tabIndex={Platform.OS === "web" ? 0 : undefined}
                  accessible={true}
                  accessibilityLabel={`Session ${session.title} at ${session.time}`}
                  disabled={session.hasResponse} // Désactiver si déjà complété
                >
                  <Text style={[
                    styles.sessionTime,
                    session.hasResponse && styles.completedSessionText
                  ]}>
                    {session.startUTC && session.endUTC && session.timeZone 
                      ? (() => {
                          const startTime = new Intl.DateTimeFormat('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: session.timeZone
                          }).format(new Date(session.startUTC));
                          
                          const endTime = new Intl.DateTimeFormat('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: session.timeZone
                          }).format(new Date(session.endUTC));
                          
                          return `${startTime} - ${endTime}`;
                        })()
                      : session.time || session.startTime || "Heure non définie"
                    }
                  </Text>
                  <Text style={[
                    styles.sessionTitle,
                    session.hasResponse && styles.completedSessionText
                  ]}>
                    {session.title || session.summary || "Entraînement"}
                  </Text>
                </Pressable>
                <View style={styles.sessionStatus}>
                  {session.hasResponse ? (
                    <View style={styles.completedBadge}>
                      <View style={styles.checkmarkCircle}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  ) : (
                    <>
                      <Pressable 
                        style={styles.respondButton} 
                        onPress={makePress(() => {
                          console.log("Respond button clicked for session:", session.id);
                          console.log("Event data:", session);
                          onRespond?.(session.id, session);
                        })}
                        role={Platform.OS === "web" ? "button" : undefined}
                        tabIndex={Platform.OS === "web" ? 0 : undefined}
                        accessible={true}
                        accessibilityLabel={`Respond to ${session.title}`}
                      >
                        <Text style={styles.respondButtonText}>Respond</Text>
                      </Pressable>
                      <View style={styles.notificationDot} />
                    </>
                  )}
                </View>
              </View>
              ))
            )}
          </View>
        </View>
      </View>

      {/* Navigation unifiée pour les athlètes */}
      {Platform.OS === 'web' && onNavigateToTab && (
        <UnifiedAthleteNavigation 
          activeTab="Home" 
          onNavigate={onNavigateToTab} 
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1A", // brand-navy from Stitch
    minHeight: 884, // Exact height from Stitch
    width: "100%",
    maxWidth: 375, // Mobile viewport width
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundEffect1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 288, // w-72 = 288px
    height: 288,
    backgroundColor: "#00C6FF", // brand-cyan
    opacity: 0.15,
    borderRadius: 144,
    // blur-3xl effect approximated
    shadowColor: "#00C6FF",
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 0,
  },
  backgroundEffect2: {
    position: "absolute",
    bottom: -64, // -bottom-16 = -64px
    right: 0,
    width: 320, // w-80 = 320px
    height: 320,
    backgroundColor: "#0066FF", // brand-blue
    opacity: 0.3,
    borderRadius: 160,
    // blur-3xl effect approximated
    shadowColor: "#0066FF",
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 0,
  },
  profileContainer: {
    position: "absolute",
    top: 48, // top-12 = 48px
    right: 24, // right-6 = 24px
    zIndex: 20,
  },
  avatar: {
    width: 36, // w-9 = 36px
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00C6FF", // brand-cyan
    borderWidth: 2,
    borderColor: "rgba(0, 198, 255, 0.6)", // border-brand-cyan/60
    // avatar-glow effect
    shadowColor: "#00C6FF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24, // px-6 = 24px
    paddingTop: 48, // pt-12 = 48px
    zIndex: 10,
  },
  header: {
    marginBottom: 32, // mb-8 = 32px
  },
  welcomeText: {
    color: "#E5E4E2", // platinum
    fontSize: 24, // text-2xl
    fontWeight: "700",
    letterSpacing: -0.5, // tracking-tighter
    textTransform: "uppercase",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  subtitle: {
    color: "rgba(229, 228, 226, 0.8)", // text-platinum/80
    fontSize: 14, // text-sm
    textTransform: "uppercase",
    letterSpacing: 1, // tracking-wide
    marginTop: 4,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  sessionsSection: {
    alignItems: "center",
    marginBottom: 24, // mb-6 = 24px
  },
  sectionTitle: {
    color: "rgba(229, 228, 226, 0.9)", // text-platinum/90
    fontSize: 12, // text-xs
    fontWeight: "600",
    letterSpacing: 2, // tracking-widest
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  sectionSubtitle: {
    color: "rgba(229, 228, 226, 0.7)", // text-platinum/70
    fontSize: 12, // text-xs
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  sessionsList: {
    width: "100%",
    gap: 12, // space-y-3 = 12px
  },
  sessionCard: {
    backgroundColor: "rgba(20, 26, 36, 0.5)", // card-glass background
    borderRadius: 16, // rounded-2xl
    paddingHorizontal: 16, // px-4 = 16px
    paddingVertical: 12, // py-3 = 12px
    borderWidth: 1,
    borderColor: "rgba(0, 198, 255, 0.2)", // border-brand-cyan/20
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Glass effect shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    color: "rgba(229, 228, 226, 0.7)", // text-platinum/70
    fontSize: 12, // text-xs
    marginBottom: 4, // mb-1 = 4px
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  sessionTitle: {
    color: "#E5E4E2", // platinum
    fontSize: 16, // text-base
    fontWeight: "600",
    letterSpacing: -0.5, // tracking-tight
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  sessionStatus: {
    marginLeft: 16, // ml-4 = 16px
    position: "relative",
  },
  respondButton: {
    backgroundColor: "#00C6FF", // brand-cyan
    borderRadius: 20, // rounded-full
    paddingHorizontal: 20, // px-5 = 20px
    paddingVertical: 10, // py-2.5 = 10px
    // respond-button-glow effect
    shadowColor: "#00C6FF",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  respondButtonText: {
    color: "#FFFFFF",
    fontSize: 14, // text-sm
    fontWeight: "600",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  notificationDot: {
    position: "absolute",
    top: -4, // -top-1 = -4px
    right: -4, // -right-1 = -4px
    width: 10, // w-2.5 = 10px
    height: 10,
    backgroundColor: "#FF1D7C", // brand-pink
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#0A0F1A", // border-brand-navy
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    color: "rgba(229, 228, 226, 0.7)",
    fontSize: 14,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "rgba(229, 228, 226, 0.7)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  emptySubtext: {
    color: "rgba(229, 228, 226, 0.5)",
    fontSize: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "web" ? "Poppins" : "System",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937", // Dark background like in the image
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  completedText: {
    color: "#F9FAFB", // Light gray text like in the image
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "web" ? "Inter" : "System",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Platform.OS === "web" ? "Inter" : "System",
    textAlign: "center",
  },
  completedSessionCard: {
    opacity: 0.6, // Dim completed sessions more
    backgroundColor: "rgba(16, 185, 129, 0.05)", // Subtle green tint
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    // Add a subtle disabled effect
    shadowColor: "transparent",
    elevation: 0,
  },
  completedSessionText: {
    color: "rgba(255, 255, 255, 0.5)", // More dimmed text
  },
  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981", // Green circle like in the image
    alignItems: "center",
    justifyContent: "center",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  refreshButton: {
    backgroundColor: "rgba(0, 224, 255, 0.1)",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 255, 0.3)",
  },
  refreshButtonText: {
    color: "#00E0FF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: Platform.OS === "web" ? "Inter" : "System",
    marginTop: 4,
    textTransform: "capitalize",
  },
});