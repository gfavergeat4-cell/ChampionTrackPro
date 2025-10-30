import React from "react";
import { AthleteHome as StitchAthleteHome } from "../stitch_components";

export default function AthleteHome({ navigation }) {
  const handleTabNavigation = (tab) => {
    console.log("Navigation vers:", tab);
    if (tab === "Schedule") {
      navigation.navigate("Schedule");
    } else if (tab === "Profile") {
      navigation.navigate("Profile");
    }
    // Home est déjà actif, pas besoin de naviguer
  };

  return (
    <StitchAthleteHome
      onNavigateToSchedule={() => navigation.navigate("Schedule")}
      onNavigateToQuestionnaire={() => navigation.navigate("Questionnaire")}
      onNavigateToAnalytics={() => navigation.navigate("Analytics")}
      onNavigateToTab={handleTabNavigation}
    />
  );
}
