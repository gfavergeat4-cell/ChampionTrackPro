import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";
import { useDevice } from "../hooks/useDevice";
import { getResponsiveSpacing, getResponsiveFontSize, getMainContainerStyle } from "../utils/responsive";

interface ScheduleScreenProps {
  onRespond?: (sessionId: string, eventData?: any) => void;
}

export default function ScheduleScreen({ onRespond }: ScheduleScreenProps) {
  const [activeTab, setActiveTab] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const device = useDevice();

  // Load events for the selected date
  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!auth.currentUser) return;

        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const teamId = userData.teamId;
        if (!teamId) return;

        // Calculate date range based on active tab
        let startDate, endDate;
        const selected = new Date(selectedDate);
        
        if (activeTab === 'Day') {
          startDate = new Date(selected);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(selected);
          endDate.setHours(23, 59, 59, 999);
        } else if (activeTab === 'Week') {
          const startOfWeek = new Date(selected);
          startOfWeek.setDate(selected.getDate() - selected.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          startDate = startOfWeek;
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          endDate = endOfWeek;
        } else { // Month
          const startOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
          const endOfMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
          startDate = startOfMonth;
          endDate = endOfMonth;
        }

        const eventsQuery = query(
          collection(db, "teams", teamId, "events"),
          where("startUTC", ">=", startDate.getTime()),
          where("startUTC", "<=", endDate.getTime())
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by start time
        eventsData.sort((a, b) => a.startUTC - b.startUTC);
        setEvents(eventsData);

      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeTab, selectedDate]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderDayView = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events on this day</Text>
        </View>
      );
    }

    return (
      <View style={styles.eventsList}>
        {events.map((event, index) => (
          <View key={event.id || index} style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.summary || 'Training'}</Text>
              <Text style={styles.eventTime}>
                {formatTime(event.startUTC)} - {formatTime(event.endUTC)}
              </Text>
            </View>
            <View style={styles.eventAction}>
              {event.hasResponse ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedIcon}>✓</Text>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              ) : (
                <Pressable
                  style={styles.respondButton}
                  onPress={() => onRespond?.(event.id, event)}
                >
                  <Text style={styles.respondText}>Respond</Text>
                  <View style={styles.notificationDot} />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWeekView = () => {
    // Group events by day
    const eventsByDay = {};
    events.forEach(event => {
      const eventDate = new Date(event.startUTC).toDateString();
      if (!eventsByDay[eventDate]) {
        eventsByDay[eventDate] = [];
      }
      eventsByDay[eventDate].push(event);
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return (
      <ScrollView style={styles.weekContainer}>
        {days.map((day, index) => {
          const dayDate = new Date(selectedDate);
          dayDate.setDate(selectedDate.getDate() - selectedDate.getDay() + index);
          const dayEvents = eventsByDay[dayDate.toDateString()] || [];
          
          return (
            <View key={day} style={styles.dayColumn}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <Text style={styles.dayDate}>{dayDate.getDate()}</Text>
              </View>
              <View style={styles.dayEvents}>
                {dayEvents.length === 0 ? (
                  <Text style={styles.noEventsText}>No events</Text>
                ) : (
                  dayEvents.map((event, eventIndex) => (
                    <View key={event.id || eventIndex} style={styles.weekEventCard}>
                      <Text style={styles.weekEventTitle}>{event.summary || 'Training'}</Text>
                      <Text style={styles.weekEventTime}>
                        {formatTime(event.startUTC)} - {formatTime(event.endUTC)}
                      </Text>
                      {event.hasResponse ? (
                        <View style={styles.weekCompletedBadge}>
                          <Text style={styles.weekCompletedText}>✓ Completed</Text>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.weekRespondButton}
                          onPress={() => onRespond?.(event.id, event)}
                        >
                          <Text style={styles.weekRespondText}>Respond</Text>
                        </Pressable>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    // Simple month view with dots for days with events
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const daysWithEvents = new Set();
    events.forEach(event => {
      const eventDate = new Date(event.startUTC);
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        daysWithEvents.add(eventDate.getDate());
      }
    });

    return (
      <View style={styles.monthContainer}>
        <Text style={styles.monthTitle}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.monthGrid}>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <View key={day} style={styles.monthDay}>
              <Text style={[
                styles.monthDayText,
                day === today.getDate() && today.getMonth() === currentMonth && today.getFullYear() === currentYear
                  ? styles.monthDayTextToday : {}
              ]}>
                {day}
              </Text>
              {daysWithEvents.has(day) && <View style={styles.monthEventDot} />}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[tokens.colors.bg, tokens.colors.bgSecondary]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerDate}>{formatDate(selectedDate)}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['Day', 'Week', 'Month'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'Day' && renderDayView()}
        {activeTab === 'Week' && renderWeekView()}
        {activeTab === 'Month' && renderMonthView()}
      </View>
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
  
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.lg,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: tokens.fontSizes.xxxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.sm,
  },
  
  headerDate: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  activeTab: {
    borderBottomColor: tokens.colors.accentCyan,
  },
  
  tabText: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  activeTabText: {
    color: tokens.colors.accentCyan,
    fontWeight: tokens.fontWeights.semibold,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  
  // Day View Styles
  eventsList: {
    gap: tokens.spacing.lg,
  },
  
  eventCard: {
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
  
  eventInfo: {
    flex: 1,
  },
  
  eventTitle: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  eventTime: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  eventAction: {
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
  
  // Week View Styles
  weekContainer: {
    flex: 1,
  },
  
  dayColumn: {
    marginBottom: tokens.spacing.xl,
  },
  
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
    paddingBottom: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surfaceHover,
  },
  
  dayName: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  dayDate: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  dayEvents: {
    gap: tokens.spacing.md,
  },
  
  weekEventCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
  },
  
  weekEventTitle: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  weekEventTime: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.sm,
  },
  
  weekCompletedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.success,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
  },
  
  weekCompletedText: {
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  weekRespondButton: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
  },
  
  weekRespondText: {
    fontSize: tokens.fontSizes.xs,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  // Month View Styles
  monthContainer: {
    flex: 1,
  },
  
  monthTitle: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  monthDay: {
    width: (width - tokens.spacing.xl * 2) / 7 - tokens.spacing.sm,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
    position: 'relative',
  },
  
  monthDayText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  monthDayTextToday: {
    color: tokens.colors.accentCyan,
    fontWeight: tokens.fontWeights.semibold,
  },
  
  monthEventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.accentCyan,
  },
  
  // Common Styles
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
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  
  emptyText: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  noEventsText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textMuted,
    fontFamily: tokens.typography.ui,
    fontStyle: 'italic',
  },
});
