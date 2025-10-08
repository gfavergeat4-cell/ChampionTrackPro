// screens/AthleteTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TrainingSchedule from "./TrainingSchedule";
import MyData from "./MyData"; // ?? ajoute ceci

const Tab = createBottomTabNavigator();

export default function AthleteTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Planning" component={TrainingSchedule} />
      <Tab.Screen name="Mes donn�es" component={MyData} /> {/* ?? ajoute ceci */}
    </Tab.Navigator>
  );
}
