import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function StitchHomeScreenClean() {
  const navigation = useNavigation();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  console.log("🏠 StitchHomeScreenClean component loaded - loading calendar events");

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
        setUserData(userData); // Stocker les données utilisateur
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
        eventsSnapshot.forEach((doc) => {
          const eventData = doc.data();
          console.log("📅 Événement trouvé:", eventData);
          events.push({
            id: doc.id,
            title: eventData.title || "Événement",
            time: eventData.startTime || "Heure non définie",
            hasResponse: false, // TODO: Vérifier si l'athlète a répondu
            ...eventData
          });
        });

        console.log("📅 Tous les événements récupérés:", events);

        // Trier les événements par date
        events.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : new Date();
          const dateB = b.startDate ? new Date(b.startDate) : new Date();
          return dateA.getTime() - dateB.getTime();
        });

        // Filtrer pour ne garder que le prochain événement (futur)
        const now = new Date();
        console.log("📅 Date actuelle pour filtrage:", now.toISOString());
        console.log("📅 Tous les événements avant filtrage:", events.map(e => ({
          title: e.title,
          startDate: e.startDate,
          startTime: e.startTime
        })));
        
        const upcomingEvents = events.filter(event => {
          let eventDate;
          
          if (event.startDate) {
            // Si c'est un timestamp Firestore
            if (event.startDate.toDate) {
              eventDate = event.startDate.toDate();
            } else if (event.startDate instanceof Date) {
              eventDate = event.startDate;
            } else {
              eventDate = new Date(event.startDate);
            }
          } else {
            console.log("⚠️ Pas de startDate pour l'événement:", event.title);
            eventDate = new Date();
          }
          
          const isFuture = eventDate >= now;
          console.log(`📅 Événement "${event.title}": ${eventDate.toISOString()} - ${isFuture ? 'FUTUR' : 'PASSÉ'}`);
          return isFuture;
        });

        // Prendre seulement le prochain événement
        const nextEvent = upcomingEvents.length > 0 ? [upcomingEvents[0]] : [];

        setCalendarEvents(nextEvent);
        console.log("📅 Prochain événement chargé:", nextEvent.length > 0 ? nextEvent[0].title : "Aucun");
        console.log("📅 Événements filtrés (futurs):", upcomingEvents.length);
        console.log("📅 Date actuelle:", now.toISOString());
        console.log("📅 Prochain événement:", nextEvent.length > 0 ? {
          title: nextEvent[0].title,
          startDate: nextEvent[0].startDate,
          startTime: nextEvent[0].startTime
        } : "Aucun");

      } catch (error) {
        console.error("❌ Erreur lors du chargement des événements:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarEvents();
  }, []);

  // Force admin redirect if user is gabfavergeat@gmail.com
  React.useEffect(() => {
    const checkAdminRedirect = () => {
      // Check if we should redirect to admin
      const currentUser = auth.currentUser;
      console.log("🔍 Current user in HomeScreen:", currentUser?.email);
      if (currentUser && currentUser.email === "gabfavergeat@gmail.com") {
        console.log("🔄 Redirecting to admin dashboard from HomeScreen");
        // Force navigation to admin
        navigation.reset({
          index: 0,
          routes: [{ name: "AdminMain" }],
        });
      }
    };
    
    // Check immediately and after a short delay
    checkAdminRedirect();
    const timeout = setTimeout(checkAdminRedirect, 1000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  const handleTabNavigation = (tabName) => {
    console.log("Navigating to:", tabName);
    navigation.navigate(tabName);
  };

  const handleRespond = (sessionId) => {
    console.log("Responding to session:", sessionId);
    navigation.navigate("Questionnaire", { sessionId });
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, #0B0F1A, #020409)",
            minHeight: "100vh",
            fontFamily: "'Inter', sans-serif",
            color: "#E5E4E2",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            maxWidth: "384px",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          {/* Background Effects */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle at 30% 20%, rgba(0, 224, 255, 0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50%",
              right: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle at 70% 80%, rgba(74, 103, 255, 0.08) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <header style={{ padding: "24px", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.05em", textTransform: "uppercase", margin: 0 }}>
                  WELCOME {userData?.firstName?.toUpperCase() || 'ATHLETE'}
                </h1>
                <p style={{ fontSize: "14px", color: "#9AA3B2", margin: "4px 0 0 0" }}>
                  HERE ARE YOUR UPCOMING SESSIONS.
                </p>
              </div>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: userData?.profileImage ? "none" : "linear-gradient(135deg, #00C6FF, #0066FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 224, 255, 0.3)",
                  position: "absolute",
                  top: "20px",
                  right: "20px"
                }}
              >
                {userData?.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt="Profile" 
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  userData?.firstName?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div style={{ flex: 1, padding: "0 24px", paddingBottom: "100px", zIndex: 10 }}>
            {/* Sessions Section */}
            <section style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase" }}>
                NEXT SESSION
              </h2>
              <p style={{ fontSize: "14px", color: "#9AA3B2", marginBottom: "24px" }}>
                Your upcoming training session.
              </p>

              {/* Loading State */}
              {loading && (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "40px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  backdropFilter: "blur(10px)"
                }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    border: "3px solid rgba(0, 224, 255, 0.3)", 
                    borderTop: "3px solid #00E0FF", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite",
                    marginBottom: "16px"
                  }} />
                  <p style={{ color: "#9AA3B2", fontSize: "14px" }}>Loading calendar...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && calendarEvents.length === 0 && (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "40px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  backdropFilter: "blur(10px)"
                }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: "rgba(0, 224, 255, 0.1)", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    📅
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", color: "#E5E4E2" }}>
                    No training scheduled
                  </h3>
                  <p style={{ color: "#9AA3B2", fontSize: "14px", textAlign: "center", margin: 0 }}>
                    No training is scheduled at the moment. Check the Schedule tab to see all events.
                  </p>
                </div>
              )}

              {/* Calendar Events */}
              {!loading && calendarEvents.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {calendarEvents.map((event, index) => (
                    <div
                      key={event.id || index}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px",
                        padding: "20px",
                        backdropFilter: "blur(10px)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", color: "#9AA3B2", marginBottom: "8px" }}>
                            {event.time} →
                          </div>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0" }}>
                            {event.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleRespond(event.id)}
                          style={{
                            background: "linear-gradient(to right, #00C6FF, #0066FF)",
                            border: "none",
                            borderRadius: "9999px",
                            padding: "8px 16px",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 0 15px rgba(0, 198, 255, 0.3)",
                            transition: "box-shadow 0.3s",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => e.target.style.boxShadow = "0 0 25px rgba(0, 198, 255, 0.5)"}
                          onMouseLeave={(e) => e.target.style.boxShadow = "0 0 15px rgba(0, 198, 255, 0.3)"}
                        >
                          Respond
                          <div
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              width: "8px",
                              height: "8px",
                              backgroundColor: "#FF1D7C",
                              borderRadius: "50%",
                              border: "2px solid #0A0F1A",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "40px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 0, 0, 0.3)",
                  borderRadius: "16px",
                  backdropFilter: "blur(10px)"
                }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    background: "rgba(255, 0, 0, 0.1)", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    ❌
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", color: "#E5E4E2" }}>
                    Erreur de chargement
                  </h3>
                  <p style={{ color: "#9AA3B2", fontSize: "14px", textAlign: "center", margin: 0 }}>
                    Impossible de charger le calendrier. Veuillez réessayer.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Bottom Navigation */}
          <footer
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: "384px",
              margin: "0 auto",
              background: "rgba(10, 10, 10, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              zIndex: 1000,
              padding: "0 24px",
            }}
          >
            <nav style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "80px" }}>
              {/* Home Tab (Active) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabNavigation("Home");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: "#00C6FF",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <svg style={{ width: "28px", height: "28px", filter: "drop-shadow(0 0 10px rgba(0, 224, 255, 0.8))" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
                </svg>
                <span style={{ fontSize: "12px", fontWeight: "500" }}>Home</span>
              </button>

              {/* Schedule Tab */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabNavigation("Schedule");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: "#9AA3B2",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#9AA3B2"}
              >
                <svg style={{ width: "28px", height: "28px" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: "12px", fontWeight: "500" }}>Schedule</span>
              </button>

              {/* Profile Tab */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabNavigation("Profile");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: "#9AA3B2",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#9AA3B2"}
              >
                <svg style={{ width: "28px", height: "28px" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: "12px", fontWeight: "500" }}>Profile</span>
              </button>
            </nav>
          </footer>
        </div>
      </MobileViewport>
    );
  }

  // Native rendering would go here
  return null;
}
