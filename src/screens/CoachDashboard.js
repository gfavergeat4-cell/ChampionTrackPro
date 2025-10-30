import React from "react";
import { View, Text, Button } from "react-native";
export default function CoachDashboard({ navigation }) {
  return (
    <View style={{ flex:1, padding:24, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>Coach Dashboard</Text>
      <Button title="Team Analytics" onPress={() => navigation.navigate("Analytics")} />
      <Button title="Schedule" onPress={() => navigation.navigate("Schedule")} />
      <Button title="Alerts" onPress={() => navigation.navigate("Alerts")} />
      <Button title="Admin Panel" onPress={() => navigation.navigate("AdminPanel")} />
    </View>
  );
}
