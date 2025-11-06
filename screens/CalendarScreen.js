import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AthleteScheduleDay, AthleteScheduleWeek } from "../src/stitch_components";

export default function CalendarScreen({ navigation }) {
  const [viewMode, setViewMode] = useState("day"); // "day" or "week"

  const handleSessionClick = (sessionId) => {
    console.log("Session clicked:", sessionId);
    // Navigate to questionnaire or session details
    navigation.navigate("Questionnaire", { sessionId });
  };

  const handleRespond = (sessionId) => {
    console.log("Respond clicked for session:", sessionId);
    navigation.navigate("Questionnaire", { sessionId });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "day" ? "week" : "day");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Schedule</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleViewMode}>
          <Text style={styles.toggleText}>
            {viewMode === "day" ? "Week View" : "Day View"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {viewMode === "day" ? (
        <AthleteScheduleDay 
          onSessionClick={handleSessionClick}
          onRespond={handleRespond}
        />
      ) : (
        <AthleteScheduleWeek 
          onSessionClick={handleSessionClick}
          onRespond={handleRespond}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1528",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  toggleButton: {
    backgroundColor: "#4A67FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});




