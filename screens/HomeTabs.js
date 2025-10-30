import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { AthleteHome as StitchAthleteHome } from "../src/stitch_components";
import AthleteHomeExact from "../src/stitch_components/AthleteHome";

export default function HomeTabs() {
  const navigation = useNavigation();

  const handleRespond = (sessionId, eventData) => {
    console.log("Respond clicked for session:", sessionId);
    console.log("Event data being passed:", eventData);
    console.log("Event title:", eventData?.title);
    console.log("Event time:", eventData?.time);
    
    navigation.navigate("Questionnaire", { 
      sessionId,
      eventTitle: eventData?.title || "Training Session",
      eventDate: eventData?.time || new Date().toLocaleTimeString(),
      eventStartDate: eventData?.startDate,
      eventEndDate: eventData?.endDate
    });
  };

  const handleOpenSession = (sessionId) => {
    console.log("Session clicked:", sessionId);
    // Could navigate to session details if that screen exists
  };

  const handleNavigateToTab = (tabName) => {
    console.log("Navigate to tab:", tabName);
    navigation.navigate(tabName);
  };

  // Use the modified AthleteHome component that loads calendar events
  return (
    <AthleteHomeExact
      onRespond={handleRespond}
      onOpenSession={handleOpenSession}
    />
  );
}