import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";

export default function TestLandingScreen() {
  const navigation = useNavigation();

  const handleCreateAccount = () => {
    try {
      console.log("✅ PRESS OK: Create Account button clicked");
      console.log("🔄 Navigation vers CreateAccount...");
      navigation.navigate("CreateAccount");
    } catch (error) {
      console.error("❌ Error in handleCreateAccount:", error);
      alert("Navigation error: " + error.message);
    }
  };

  const handleLogin = () => {
    console.log("Login clicked");
    navigation.navigate("Login");
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div 
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, #0E1528, #000000)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
            position: "relative",
            pointerEvents: "auto", // Ensure clicks work
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: "bold",
                color: "white",
                textShadow: "0 0 8px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)",
                fontSize: "32px",
                marginBottom: "16px",
              }}
            >
              ChampionTrack<span style={{ color: "#00E0FF", textShadow: "0 0 8px rgba(0, 224, 255, 0.7), 0 0 20px rgba(0, 224, 255, 0.5)" }}>Pro</span>
            </h1>
            <p style={{ fontSize: "12px", fontWeight: "300", color: "#D1D5DB", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              The Training Intelligence
            </p>
          </div>

          {/* Buttons */}
          <div style={{ 
            width: "100%", 
            maxWidth: "300px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px", 
            position: "relative", 
            zIndex: 1000,
            pointerEvents: "auto"
          }}>
            <button 
              onClick={() => {
                console.log("🔥 BUTTON CLICKED: Create Account button pressed");
                handleCreateAccount();
              }}
              style={{
                width: "100%",
                height: "56px",
                borderRadius: "12px",
                background: "linear-gradient(to right, #00E0FF, #4A67FF)",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(0, 224, 255, 0.3), 0 0 25px rgba(74, 103, 255, 0.2)",
                transition: "opacity 0.2s",
                position: "relative",
                zIndex: 1001,
                pointerEvents: "auto",
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              CREATE ACCOUNT
            </button>
            <button 
              onClick={handleLogin}
              style={{
                width: "100%",
                height: "56px",
                borderRadius: "12px",
                background: "#1A1A1A",
                border: "1px solid #2B2E36",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(26, 26, 26, 0.8)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#1A1A1A"}
            >
              Log In
            </button>
          </div>
        </div>
      </MobileViewport>
    );
  }

  // Native fallback
  return (
    <MobileViewport>
      <View style={{ flex: 1, backgroundColor: "#0E1528", justifyContent: "center", alignItems: "center" }}>
        {/* Native implementation would go here */}
      </View>
    </MobileViewport>
  );
}

