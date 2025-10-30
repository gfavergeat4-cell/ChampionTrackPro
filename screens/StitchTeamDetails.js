import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MobileViewport from "../src/components/MobileViewport";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function StitchTeamDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { teamId, teamName, teamData } = route.params || {};
  
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Charger les membres de l'équipe
      const membersQuery = query(
        collection(db, "users"),
        where("teamId", "==", teamId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(membersData);

      // Charger les événements de l'équipe
      const eventsQuery = query(
        collection(db, "teams", teamId, "events"),
        orderBy("start.seconds", "asc")
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date non définie";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Heure non définie";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div style={{
          width: "100%",
          maxWidth: "375px",
          height: "100%",
          background: "linear-gradient(to bottom, #0B0F1A, #020409)",
          display: "flex",
          flexDirection: "column",
          color: "white",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
          margin: "0 auto"
        }}>
          {/* Header */}
          <header style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => navigation.goBack()}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#00E0FF",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginRight: "12px"
                  }}
                >
                  ← Retour
                </button>
                <h1 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "4px 0 0 0",
                  background: "linear-gradient(135deg, #00E0FF, #4A67FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  {teamName || "Détails de l'équipe"}
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main style={{
            flex: 1,
            padding: "16px 20px",
            overflow: "auto",
            paddingBottom: "100px"
          }}>
            {loading ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#9AA3B2"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "16px" }}>⏳</div>
                <p style={{ fontSize: "14px", margin: 0 }}>Chargement des données...</p>
              </div>
            ) : (
              <>
                {/* Membres de l'équipe */}
                <div style={{
                  background: "rgba(0, 224, 255, 0.1)",
                  border: "1px solid rgba(0, 224, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px"
                }}>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: "#00E0FF"
                  }}>
                    Membres de l'équipe ({members.length})
                  </h2>
                  
                  {members.length === 0 ? (
                    <p style={{
                      fontSize: "12px",
                      color: "#9AA3B2",
                      margin: 0,
                      fontStyle: "italic"
                    }}>
                      Aucun membre dans cette équipe
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {members.map((member) => (
                        <div
                          key={member.id}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            padding: "12px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <h3 style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                margin: "0 0 4px 0",
                                color: "#E5E7EB"
                              }}>
                                {member.fullName || member.firstName + " " + member.lastName}
                              </h3>
                              <p style={{
                                fontSize: "11px",
                                color: "#9AA3B2",
                                margin: "0 0 4px 0"
                              }}>
                                {member.email}
                              </p>
                            </div>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: "500",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: member.role === "admin" ? "rgba(239, 68, 68, 0.1)" : 
                                         member.role === "coach" ? "rgba(0, 224, 255, 0.1)" : 
                                         "rgba(74, 103, 255, 0.1)",
                              color: member.role === "admin" ? "#EF4444" : 
                                     member.role === "coach" ? "#00E0FF" : "#4A67FF",
                              textTransform: "uppercase"
                            }}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendrier d'entraînement */}
                <div style={{
                  background: "rgba(74, 103, 255, 0.1)",
                  border: "1px solid rgba(74, 103, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "16px"
                }}>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: "#4A67FF"
                  }}>
                    Calendrier d'entraînement ({events.length})
                  </h2>
                  
                  {events.length === 0 ? (
                    <p style={{
                      fontSize: "12px",
                      color: "#9AA3B2",
                      margin: 0,
                      fontStyle: "italic"
                    }}>
                      Aucun événement programmé
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {events.slice(0, 10).map((event) => (
                        <div
                          key={event.id}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            padding: "12px"
                          }}
                        >
                          <h3 style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            margin: "0 0 4px 0",
                            color: "#E5E7EB"
                          }}>
                            {event.summary || "Entraînement"}
                          </h3>
                          <p style={{
                            fontSize: "11px",
                            color: "#9AA3B2",
                            margin: "0 0 4px 0"
                          }}>
                            {formatDate(event.start)} à {formatTime(event.start)}
                          </p>
                          {event.description && (
                            <p style={{
                              fontSize: "10px",
                              color: "#9AA3B2",
                              margin: 0,
                              fontStyle: "italic"
                            }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      ))}
                      {events.length > 10 && (
                        <p style={{
                          fontSize: "11px",
                          color: "#9AA3B2",
                          margin: "8px 0 0 0",
                          textAlign: "center",
                          fontStyle: "italic"
                        }}>
                          ... et {events.length - 10} autres événements
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </MobileViewport>
    );
  }

  // Native fallback
  return (
    <MobileViewport>
      <View style={styles.container}>
        <Text style={styles.title}>Team Details</Text>
        <Text style={styles.subtitle}>Team management interface coming soon...</Text>
      </View>
    </MobileViewport>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1528",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00E0FF",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});