import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Image, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { makePress } from "../utils/press";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";
import { useDevice } from "../hooks/useDevice";
import { getResponsiveSpacing, getResponsiveFontSize, getMainContainerStyle } from "../utils/responsive";

interface AthleteHomeProps {
  sessions?: Array<{ id: string; title: string; time: string; hasResponse?: boolean }>;
  onRespond?: (sessionId: string, eventData?: any) => void;
  onOpenSession?: (sessionId: string) => void;
}

export default function AthleteHome({
  sessions = [],
  onRespond,
  onOpenSession
}: AthleteHomeProps) {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);
  const device = useDevice();

  // Fonction de rechargement forcé
  const forceRefresh = () => {
    console.log("🔄 Rechargement forcé des données...");
    setRefreshKey(prev => prev + 1);
    setCalendarEvents([]);
    setLoading(true);
    
    setTimeout(() => {
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    }, 100);
  };

  // Charger les événements du calendrier
  useEffect(() => {
    const loadCalendarEvents = async () => {
      try {
        if (!auth.currentUser) {
          console.log("No authenticated user");
          setLoading(false);
          return;
        }

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

        console.log("🔍 Loading events for team:", teamId);

        // Charger les événements de l'équipe
        const eventsQuery = query(
          collection(db, "teams", teamId, "events"),
          where("startUTC", ">=", Date.now())
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("📅 Events loaded:", events.length);

        // Filtrer les événements d'aujourd'hui
        const today = new Date();
        const todayEvents = events.filter(event => {
          const eventDate = new Date(event.startUTC);
          return eventDate.toDateString() === today.toDateString();
        });

        // Trier par heure
        todayEvents.sort((a, b) => a.startUTC - b.startUTC);

        // Formater les événements
        const formattedEvents = todayEvents.map(event => {
          const startTime = new Date(event.startUTC);
          const endTime = new Date(event.endUTC);
          
          const timeString = `${startTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - ${endTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`;

          return {
            id: event.id,
            title: event.summary || 'Training',
            time: timeString,
            hasResponse: false // TODO: Check for existing responses
          };
        });

        setCalendarEvents(formattedEvents);
        console.log("📅 Today's events:", formattedEvents);

      } catch (error) {
        console.error("❌ Error loading events:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarEvents();
  }, [refreshKey]);

  // Auto-refresh for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const autoRefreshInterval = setInterval(() => {
        forceRefresh();
      }, 3000);
      
      return () => clearInterval(autoRefreshInterval);
    }
  }, []);

  const todayEvents = calendarEvents;

  const containerStyle = getMainContainerStyle(device);
  const headerPadding = getResponsiveSpacing('xl', device);
  const sectionPadding = getResponsiveSpacing('lg', device);

  return (
    <LinearGradient
      colors={[tokens.colors.bg, tokens.colors.bgSecondary]}
      style={[styles.container, containerStyle]}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile */}
        <View style={[styles.header, { paddingHorizontal: headerPadding }]}>
          <View style={[
            styles.headerContent,
            device.isMobile ? styles.headerContentMobile : styles.headerContentDesktop
          ]}>
            <View style={styles.welcomeSection}>
              <Text style={[
                styles.welcomeText,
                { fontSize: getResponsiveFontSize('xxxl', device) }
              ]}>
                WELCOME BACK
              </Text>
              <Text style={[
                styles.subtitleText,
                { fontSize: getResponsiveFontSize('md', device) }
              ]}>
                HERE ARE YOUR UPCOMING SESSIONS.
              </Text>
            </View>
            <View style={styles.profileContainer}>
              <View style={[
                styles.profileImage,
                { 
                  width: device.isMobile ? 50 : 60,
                  height: device.isMobile ? 50 : 60
                }
              ]}>
                <Text style={[
                  styles.profileInitial,
                  { fontSize: getResponsiveFontSize('xl', device) }
                ]}>
                  U
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sessions Section */}
        <View style={[styles.sessionsSection, { paddingHorizontal: sectionPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              { fontSize: getResponsiveFontSize('xl', device) }
            ]}>
              UPCOMING SESSIONS
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { fontSize: getResponsiveFontSize('sm', device) }
            ]}>
              Your next training events.
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[
                styles.loadingText,
                { fontSize: getResponsiveFontSize('md', device) }
              ]}>
                Loading sessions...
              </Text>
            </View>
          ) : todayEvents.length > 0 ? (
            <View style={[
              styles.sessionsList,
              device.isDesktop && styles.sessionsListDesktop
            ]}>
              {todayEvents.map((session, index) => (
                <View 
                  key={session.id || index} 
                  style={[
                    styles.sessionCard,
                    device.isDesktop && styles.sessionCardDesktop
                  ]}
                >
                  <View style={styles.sessionInfo}>
                    <Text style={[
                      styles.sessionTime,
                      { fontSize: getResponsiveFontSize('sm', device) }
                    ]}>
                      {session.time}
                    </Text>
                    <Text style={[
                      styles.sessionTitle,
                      { fontSize: getResponsiveFontSize('lg', device) }
                    ]}>
                      {session.title}
                    </Text>
                  </View>
                  <View style={styles.sessionAction}>
                    {session.hasResponse ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedIcon}>✓</Text>
                        <Text style={[
                          styles.completedText,
                          { fontSize: getResponsiveFontSize('sm', device) }
                        ]}>
                          Completed
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.respondButton}
                        onPress={() => {
                          console.log("Respond button pressed for session:", session);
                          if (onRespond) {
                            onRespond(session.id, session);
                          }
                        }}
                      >
                        <Text style={[
                          styles.respondText,
                          { fontSize: getResponsiveFontSize('sm', device) }
                        ]}>
                          Respond
                        </Text>
                        <View style={styles.notificationDot} />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noSessionsContainer}>
              <Text style={[
                styles.noSessionsText,
                { fontSize: getResponsiveFontSize('lg', device) }
              ]}>
                No sessions scheduled for today
              </Text>
              <Text style={[
                styles.noSessionsSubtext,
                { fontSize: getResponsiveFontSize('sm', device) }
              ]}>
                Check back later for updates
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  headerContentMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.lg,
  },
  
  headerContentDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  welcomeText: {
    fontSize: tokens.fontSizes.xxxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
    marginBottom: tokens.spacing.sm,
  },
  
  subtitleText: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    lineHeight: 22,
  },
  
  profileContainer: {
    marginLeft: tokens.spacing.lg,
  },
  
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 2,
    borderColor: tokens.colors.accentCyan,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.glow,
  },
  
  profileInitial: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  sessionsSection: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  
  sectionHeader: {
    marginBottom: tokens.spacing.xl,
  },
  
  sectionTitle: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.sm,
  },
  
  sectionSubtitle: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  sessionsList: {
    gap: tokens.spacing.lg,
  },
  
  sessionsListDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  sessionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  sessionCardDesktop: {
    width: '48%',
    marginBottom: tokens.spacing.lg,
  },
  
  sessionInfo: {
    flex: 1,
  },
  
  sessionTime: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  sessionTitle: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  sessionAction: {
    marginLeft: tokens.spacing.lg,
  },
  
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceHover,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.success,
  },
  
  completedIcon: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.success,
    marginRight: tokens.spacing.xs,
  },
  
  completedText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.success,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  respondButton: {
    position: 'relative',
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    ...tokens.shadows.button,
  },
  
  respondText: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.danger,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  
  loadingText: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  noSessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  
  noSessionsText: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
    marginBottom: tokens.spacing.sm,
  },
  
  noSessionsSubtext: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
});
