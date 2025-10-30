import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Landing as StitchLanding } from "../src/stitch_components";

export default function Landing() {
  const navigation = useNavigation();

  return (
    <StitchLanding 
      onLogin={() => navigation.navigate('Login')}
      onNavigateToRegister={() => navigation.navigate("Register")}
      loading={false}
    />
  );
}