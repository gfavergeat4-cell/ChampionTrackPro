import React from "react";
import { View, Text, Button } from "react-native";
export default function AthleteHome({ navigation }) {
  return (
    <View style={{ flex:1, padding:24, gap:12 }}>
      <Text style={{ fontSize:20, fontWeight:"600" }}>Athlete Home</Text>
      <Button title="Fill Questionnaire" onPress={() => navigation.navigate("Questionnaire")} />
      <Button title="My Schedule" onPress={() => navigation.navigate("Schedule")} />
      <Button title="Alerts" onPress={() => navigation.navigate("Alerts")} />
      <Button title="Analytics (read-only)" onPress={() => navigation.navigate("Analytics")} />
    </View>
  );
}
