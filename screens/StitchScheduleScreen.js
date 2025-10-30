import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { 
  getEventsForWeek, 
  getEventsForDay, 
  getEventsForMonth,
  filterEventsByDayOfWeek 
} from "../src/lib/scheduleQueries";
import { 
  fmtRange, 
  fmtDate, 
  fmtTime, 
  groupEventsByDay,
  fromSeconds 
} from "../src/utils/time";
import UnifiedAthleteNavigation from "../src/stitch_components/UnifiedAthleteNavigation";

export default function StitchScheduleScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Day");
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleTabNavigation = (tab) => {
    console.log("Navigation vers:", tab);
    if (tab === "Home") {
      navigation.navigate("Home");
    } else if (tab === "Profile") {
      navigation.navigate("Profile");
    }
  };

  // Load user and team data
  useEffect(() => {
    const loadUserData = async () => {
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
        const userId = auth.currentUser.uid;

        if (!teamId) {
          console.log("No team ID found for user");
          setLoading(false);
          return;
        }

        setTeamId(teamId);
        setUserId(userId);
        console.log("📅 User data loaded:", { teamId, userId });

      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Load calendar events based on active tab
  useEffect(() => {
    const loadCalendarEvents = async () => {
      if (!teamId || !userId) return;

      try {
        setLoading(true);
        let events = [];

        try {
          switch (activeTab) {
            case "Day":
              events = await getEventsForDay(teamId, selectedDay, userId);
              break;
            case "Week":
              events = await getEventsForWeek(teamId, currentWeek, userId);
              break;
            case "Month":
              events = await getEventsForMonth(teamId, currentMonth, userId);
              break;
            default:
              events = await getEventsForDay(teamId, selectedDay, userId);
          }
          
          // S'assurer que events est un tableau
          if (!Array.isArray(events)) {
            console.log("📅 Events is not an array:", events);
            events = [];
          }
        } catch (error) {
          console.error("📅 Error loading events for", activeTab, ":", error);
          events = [];
        }

        // Filtrer pour n'afficher que les événements du mardi et jeudi
        const filteredEvents = filterEventsByDayOfWeek(events);
        
        setCalendarEvents(filteredEvents);
        console.log("📅 Calendar events loaded:", filteredEvents.length);
        console.log("📅 Events details:", filteredEvents.map(e => ({
          id: e.id,
          summary: e.summary,
          startUTC: e.startUTC,
          endUTC: e.endUTC,
          timeZone: e.timeZone,
          hasResponse: e.hasResponse
        })));

      } catch (error) {
        console.error("❌ Error loading calendar events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarEvents();
  }, [activeTab, selectedDay, currentWeek, currentMonth, teamId, userId]);


  // Get events for selected week
  const getEventsForWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return calendarEvents.filter(event => {
      let eventDate;
      
      if (event.startDate) {
        if (event.startDate.toDate) {
          eventDate = event.startDate.toDate();
        } else if (event.startDate instanceof Date) {
          eventDate = event.startDate;
        } else {
          eventDate = new Date(event.startDate);
        }
      } else {
        return false;
      }
      
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "Time not set";
    return timeString;
  };

  // Get day of week letters for current week
  const getDayLetters = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    return days.map((_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return {
        letter: days[index],
        date: day,
        isToday: day.toDateString() === new Date().toDateString(),
        isSelected: day.toDateString() === selectedDay.toDateString()
      };
    });
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Check if current week is selected
  const isCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    
    const selectedWeekStart = new Date(currentWeek);
    selectedWeekStart.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    return currentWeekStart.toDateString() === selectedWeekStart.toDateString();
  };

  const handleRespond = (eventId, eventData) => {
    console.log("Respond to event:", eventId);
    console.log("Event data:", eventData);
    
    // Naviguer vers le questionnaire avec les données de l'événement
    navigation.navigate("Questionnaire", {
      sessionId: eventId,
      eventTitle: eventData.summary || "Training Session",
      eventDate: new Date(eventData.startUTC).toLocaleDateString('fr-FR', { timeZone: eventData.timeZone }),
      eventStartDate: new Date(eventData.startUTC),
      eventEndDate: new Date(eventData.endUTC),
      teamId: teamId
    });
  };

  // Reset to current day when switching to Day view
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Day") {
      setSelectedDay(new Date());
    } else if (tab === "Week") {
      // Set current week to the week containing selected day
      setCurrentWeek(selectedDay);
    }
  };

  // Go back to current week
  const goToCurrentWeek = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDay(today);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Go back to current month
  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today);
  };

  // Check if current month is selected
  const isCurrentMonth = () => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDay.toDateString();
      
      // Check if this day has events
      const hasEvents = calendarEvents.some(event => {
        let eventDate;
        if (event.startDate) {
          if (event.startDate.toDate) {
            eventDate = event.startDate.toDate();
          } else if (event.startDate instanceof Date) {
            eventDate = event.startDate;
          } else {
            eventDate = new Date(event.startDate);
          }
        } else {
          return false;
        }
        return eventDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        hasEvents
      });
    }
    
    return days;
  };

  // Update current week when selected day changes in Week view
  useEffect(() => {
    if (activeTab === "Week") {
      const newWeek = new Date(selectedDay);
      newWeek.setDate(selectedDay.getDate() - selectedDay.getDay());
      setCurrentWeek(newWeek);
    }
  }, [selectedDay, activeTab]);

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div style={{
          width: "100%",
          maxWidth: "375px",
          height: "812px",
          backgroundColor: "#0A0F1A",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: Platform.select({ web: "'Inter', sans-serif", default: "System" }),
          color: "white",
        }}>
          {/* Background Gradient */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 50% 0%, rgba(0, 224, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 0% 100%, rgba(74, 103, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%)",
            zIndex: 0,
          }} />

          {/* Header */}
          <header style={{
            padding: "20px",
            paddingTop: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#E5E7EB",
              margin: 0,
            }}>
              Schedule
            </h1>
          </header>

          {/* Tab Navigation */}
          <div style={{
            padding: "0 20px 20px 20px",
            zIndex: 1,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "0",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "4px",
            }}>
              {["Day", "Week", "Month"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    backgroundColor: activeTab === tab ? "#00C6FF" : "transparent",
                    color: activeTab === tab ? "#0A0F1A" : "#9AA3B2",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main style={{
            flex: 1,
            padding: "0 20px 20px 20px",
            overflowY: "auto",
            zIndex: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {/* Hide scrollbar for Webkit browsers */}
            {Platform.OS === "web" && (
              <style dangerouslySetInnerHTML={{
                __html: `
                  main::-webkit-scrollbar {
                    display: none;
                  }
                `
              }} />
            )}

            {/* Date Display */}
            <div style={{
              textAlign: "center",
              marginBottom: "24px",
            }}>
              <h2 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#E5E7EB",
                margin: "0 0 8px 0",
              }}>
                {formatDate(selectedDay)}
              </h2>
            </div>

            {/* Week Navigation and Day Selector for Week View */}
            {activeTab === "Week" && (
              <div style={{ marginBottom: "24px" }}>
                {/* Week Navigation */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}>
                  <button
                    onClick={goToPreviousWeek}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ← Previous
                  </button>
                  
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#9AA3B2",
                      textAlign: "center",
                    }}>
                      Week of {currentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#00C6FF",
                      textAlign: "center",
                    }}>
                      Week {getWeekNumber(currentWeek)}
                    </div>
                  </div>
                  
                  <button
                    onClick={goToNextWeek}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Next →
                  </button>
                </div>

                {/* Today Button */}
                {!isCurrentWeek() && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <button
                      onClick={goToCurrentWeek}
                      style={{
                        backgroundColor: "#00C6FF",
                        border: "none",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        color: "#0A0F1A",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📅 Today
                    </button>
                  </div>
                )}

                {/* Day Selector */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                }}>
                  {getDayLetters().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        console.log("📅 Day clicked:", day.date.toDateString());
                        setSelectedDay(day.date);
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: day.isSelected ? "#00C6FF" : (day.isToday ? "rgba(0, 198, 255, 0.2)" : "transparent"),
                        color: day.isSelected ? "#0A0F1A" : "#E5E7EB",
                        border: day.isSelected ? "none" : (day.isToday ? "1px solid #00C6FF" : "1px solid rgba(255, 255, 255, 0.2)"),
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {day.letter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Month Calendar Grid */}
            {activeTab === "Month" && !loading && (
              <div style={{ marginBottom: "24px" }}>
                {/* Month Navigation */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}>
                  <button
                    onClick={goToPreviousMonth}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ← Previous
                  </button>
                  
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#E5E7EB",
                    textAlign: "center",
                  }}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  
                  <button
                    onClick={goToNextMonth}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#E5E7EB",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Next →
                  </button>
                </div>

                {/* Today Button */}
                {!isCurrentMonth() && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <button
                      onClick={goToCurrentMonth}
                      style={{
                        backgroundColor: "#00C6FF",
                        border: "none",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        color: "#0A0F1A",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📅 Today
                    </button>
                  </div>
                )}

                {/* Calendar Grid */}
                <div style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}>
                  {/* Day Headers */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                    marginBottom: "8px",
                  }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div
                        key={index}
                        style={{
                          textAlign: "center",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#9AA3B2",
                          padding: "8px 4px",
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                  }}>
                    {getCalendarDays().map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(day.date)}
                        style={{
                          aspectRatio: "1",
                          backgroundColor: day.isSelected ? "#00C6FF" : (day.isToday ? "rgba(0, 198, 255, 0.2)" : "transparent"),
                          color: day.isSelected ? "#0A0F1A" : (day.isCurrentMonth ? "#E5E7EB" : "#6B7280"),
                          border: day.isSelected ? "none" : (day.isToday ? "1px solid #00C6FF" : "1px solid transparent"),
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          transition: "all 0.2s ease",
                          opacity: day.isCurrentMonth ? 1 : 0.5,
                        }}
                      >
                        <span>{day.date.getDate()}</span>
                        {day.hasEvents && (
                          <div style={{
                            position: "absolute",
                            bottom: "4px",
                            width: "4px",
                            height: "4px",
                            backgroundColor: "#00C6FF",
                            borderRadius: "50%",
                          }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events List */}
            {loading ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#9AA3B2"
              }}>
                <div style={{ fontSize: "18px", marginBottom: "8px" }}>⏳</div>
                <p style={{ fontSize: "14px", margin: 0 }}>Loading events...</p>
              </div>
            ) : (
              (() => {
                let eventsToShow = [];
                if (activeTab === "Day") {
                  eventsToShow = getEventsForDay(selectedDay);
                  console.log("📅 Day view - Selected day:", selectedDay.toDateString(), "Events:", eventsToShow.length);
                } else if (activeTab === "Week") {
                  // In Week view, show events for the selected day, not the whole week
                  eventsToShow = getEventsForDay(selectedDay);
                  console.log("📅 Week view - Selected day:", selectedDay.toDateString(), "Events:", eventsToShow.length);
                } else if (activeTab === "Month") {
                  // In Month view, show events for the selected day
                  eventsToShow = getEventsForDay(selectedDay);
                  console.log("📅 Month view - Selected day:", selectedDay.toDateString(), "Events:", eventsToShow.length);
                } else {
                  eventsToShow = calendarEvents;
                  console.log("📅 All events:", eventsToShow.length);
                }

                // Si aucun événement trouvé pour le jour sélectionné, afficher tous les événements
                if (eventsToShow.length === 0 && calendarEvents.length > 0) {
                  console.log("📅 No events for selected day, showing all events for diagnostic");
                  eventsToShow = calendarEvents;
                }
                
                // S'assurer que eventsToShow est un tableau
                if (!Array.isArray(eventsToShow)) {
                  console.log("📅 eventsToShow is not an array:", eventsToShow);
                  eventsToShow = [];
                }
                
                if (eventsToShow.length === 0) {
                  const isToday = selectedDay.toDateString() === new Date().toDateString();
                  const isPast = selectedDay < new Date();
                  const isFuture = selectedDay > new Date();
                  
                  let message = "No events scheduled";
                  let subMessage = "Check back later for updates";
                  
                  if (activeTab === "Day") {
                    if (isToday) {
                      message = "No training today";
                      subMessage = "Time to rest and recover";
                    } else if (isPast) {
                      message = "No events on this day";
                      subMessage = "This day has passed";
                    } else {
                      message = "No training scheduled";
                      subMessage = "Check back closer to the date";
                    }
                  } else if (activeTab === "Week") {
                    if (isToday) {
                      message = "No training today";
                      subMessage = "Time to rest and recover";
                    } else if (isPast) {
                      message = "No events on this day";
                      subMessage = "This day has passed";
                    } else {
                      message = "No training scheduled";
                      subMessage = "Check back closer to the date";
                    }
                  } else {
                    message = "No events in calendar";
                    subMessage = "Contact your coach for updates";
                  }
                  
                  return (
                    <div style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#9AA3B2"
                    }}>
                      <div style={{ fontSize: "24px", marginBottom: "16px", opacity: 0.5 }}>
                        {isToday ? "💤" : "📅"}
                      </div>
                      <p style={{ fontSize: "16px", margin: 0, color: "#E5E7EB" }}>{message}</p>
                      <p style={{ fontSize: "14px", margin: "8px 0 0 0" }}>{subMessage}</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {eventsToShow.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{
                          fontSize: "12px",
                          color: "#9AA3B2",
                          minWidth: "80px",
                          textAlign: "right",
                        }}>
                          {fmtRange(
                            fromSeconds(event.start.seconds), 
                            fromSeconds(event.end.seconds), 
                            event.start.timeZone || 'UTC'
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: "14px", 
                            fontWeight: "600", 
                            margin: "0", 
                            color: "#E5E7EB",
                            lineHeight: "1.3"
                          }}>
                            {event.summary || "Training"}
                          </h3>
                        </div>
                        {activeTab !== "Month" && (
                          event.hasResponse ? (
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "#1F2937",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              gap: "8px",
                              border: "1px solid #374151",
                              minWidth: "70px",
                            }}>
                              <div style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "8px",
                                backgroundColor: "#10B981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                                fontSize: "10px",
                                fontWeight: "bold"
                              }}>
                                ✓
                              </div>
                              <span style={{
                                color: "#F9FAFB",
                                fontSize: "11px",
                                fontWeight: "500"
                              }}>
                                Completed
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRespond(event.id, event)}
                              style={{
                                background: "linear-gradient(to right, #00C6FF, #0066FF)",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                color: "white",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                position: "relative",
                                minWidth: "70px",
                              }}
                            >
                              Respond
                              <div style={{
                                position: "absolute",
                                top: "-3px",
                                right: "-3px",
                                width: "6px",
                                height: "6px",
                                backgroundColor: "#FF3B30",
                                borderRadius: "50%",
                              }} />
                            </button>
                          )
                        )}
                      </div>
                    ))}
            </div>
                );
              })()
            )}
          </main>

          {/* Footer Navigation */}
          {/* Navigation unifiée pour les athlètes */}
          <UnifiedAthleteNavigation 
            activeTab="Schedule" 
            onNavigate={handleTabNavigation} 
          />
        </div>
      </MobileViewport>
    );
  }

  return null;
}


