import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { tokens } from "../theme/tokens";

export default function AthleteScheduleWeek() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule — Week</Text>
      <Text style={styles.subtitle}>Overview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontSize: 22
  },
  subtitle: {
    marginTop: tokens.spacing.xs,
    color: tokens.colors.muted,
    fontFamily: tokens.typography.ui,
    fontSize: 12
  }
});


