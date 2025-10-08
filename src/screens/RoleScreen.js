import React from "react";
import { View, Text, Button } from "react-native";
export default function RoleScreen({ onPick, navigation }) {
  const pick = (r) => {
    onPick(r);
    navigation.reset({ index:0, routes:[{ name: r === "athlete" ? "AthleteHome" : "CoachDashboard" }] });
  };
  return (
    <View style={{ flex:1, padding:24, justifyContent:"center", gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:"600" }}>Choose your role</Text>
      <Button title="I am an Athlete" onPress={() => pick("athlete")} />
      <Button title="I am a Coach" onPress={() => pick("coach")} />
    </View>
  );
}
