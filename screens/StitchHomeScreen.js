import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";

export default function StitchHomeScreen() {
  const navigation = useNavigation();

  const handleRespond = () => {
    navigation.navigate("Questionnaire", { sessionId: "strength-training-10-11" });
  };

  const handleTabNavigation = (tabName) => {
    console.log("Navigating to:", tabName);
    if (tabName === "Schedule") {
      navigation.navigate("Schedule");
    } else if (tabName === "Profile") {
      navigation.navigate("Profile");
    }
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div 
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, #0A0F1A, #001E36)",
            minHeight: "100vh",
            fontFamily: "'Poppins', sans-serif",
            color: "#E5E4E2",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            maxWidth: "384px",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          {/* Background Effects */}
          <div 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "288px",
              height: "288px",
              backgroundColor: "rgba(0, 198, 255, 0.15)",
              borderRadius: "50%",
              filter: "blur(60px)",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />
          <div 
            style={{
              position: "absolute",
              bottom: "-64px",
              right: 0,
              width: "320px",
              height: "320px",
              backgroundColor: "rgba(0, 102, 255, 0.3)",
              borderRadius: "50%",
              filter: "blur(60px)",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          />

          {/* Profile Avatar */}
          <div 
            style={{
              position: "absolute",
              top: "48px",
              right: "24px",
              zIndex: 20,
            }}
          >
            <img 
              alt="Athlete Profile Picture" 
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid rgba(0, 198, 255, 0.6)",
                objectFit: "cover",
                boxShadow: "0 0 12px rgba(0, 224, 255, 0.4)",
              }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VDqipPFovwX9YNDC53nyUMqSQWMr4m0yVMk825OEedGvJt-xtgDZgb9g9RU_FhyHiNan9fObFvT8ZvK46xuMxDvu-o65ezWS1Lpq4bly_yCl_2xe55lmf_pjSRWAyVuG1wnld0bpXTcYVmrkTD98MozBtXb3ntUGQgBgug4Clmp52RxrnMSpRwNkfVpDyCaFZOQo_iR-mjj3iR-HpccEmBs37mussebmkn-h-Z12e9Ci2w2qWL3VpmfE8v4QI_8NcmavPD07aKU"
            />
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: "0 24px", paddingTop: "48px", paddingBottom: "100px", zIndex: 10 }}>
            {/* Header */}
            <header style={{ marginBottom: "32px", animation: "fadeIn 300ms ease-out forwards", animationDelay: "100ms" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.05em", textTransform: "uppercase" }}>
                WELCOME BACK
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(229, 228, 226, 0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Here are your upcoming sessions.
              </p>
            </header>

            {/* Sessions Section */}
            <main>
              <div style={{ textAlign: "center", marginBottom: "24px", animation: "fadeIn 300ms ease-out forwards", animationDelay: "200ms" }}>
                <h2 style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", color: "rgba(229, 228, 226, 0.9)", textTransform: "uppercase" }}>
                  Upcoming Sessions
                </h2>
                <p style={{ fontSize: "12px", color: "rgba(229, 228, 226, 0.7)" }}>
                  Your next training events.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Completed Session */}
                <div 
                  style={{
                    background: "rgba(20, 26, 36, 0.5)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(0, 198, 255, 0.2)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    opacity: 0,
                    animation: "slideUp 350ms ease-out forwards",
                    animationDelay: "300ms",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", color: "rgba(229, 228, 226, 0.7)", marginBottom: "4px" }}>
                        8:00 – 9:30 AM →
                      </p>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>
                        Morning Practice
                      </h3>
                    </div>
                    <div style={{ position: "relative", marginLeft: "16px" }}>
                      <div 
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          background: "linear-gradient(to right, #2C2F36, #3E414A)",
                          borderRadius: "9999px",
                          paddingLeft: "20px",
                          paddingRight: "16px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                        }}
                      >
                        <span>Completed</span>
                        <svg 
                          style={{ width: "16px", height: "16px", marginLeft: "6px", color: "#00FFAE", filter: "drop-shadow(0 0 8px #00FFAE)" }}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Respond Session */}
                <div 
                  style={{
                    background: "rgba(20, 26, 36, 0.5)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(0, 198, 255, 0.2)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    opacity: 0,
                    animation: "slideUp 350ms ease-out forwards",
                    animationDelay: "400ms",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", color: "rgba(229, 228, 226, 0.7)", marginBottom: "4px" }}>
                        10:00 – 11:00 AM →
                      </p>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>
                        Strength Training
                      </h3>
                    </div>
                    <div style={{ position: "relative", marginLeft: "16px" }}>
                      <button 
                        onClick={handleRespond}
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          background: "linear-gradient(to right, #00C6FF, #0066FF)",
                          borderRadius: "9999px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 0 15px rgba(0, 198, 255, 0.3), 0 0 10px rgba(0, 102, 255, 0.2)",
                          transition: "box-shadow 0.3s",
                        }}
                        onMouseEnter={(e) => e.target.style.boxShadow = "0 0 25px rgba(0, 198, 255, 0.5), 0 0 15px rgba(0, 102, 255, 0.4)"}
                        onMouseLeave={(e) => e.target.style.boxShadow = "0 0 15px rgba(0, 198, 255, 0.3), 0 0 10px rgba(0, 102, 255, 0.2)"}
                      >
                        Respond
                      </button>
                      <div 
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          width: "10px",
                          height: "10px",
                          backgroundColor: "#FF1D7C",
                          borderRadius: "50%",
                          border: "2px solid #0A0F1A",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Bottom Navigation */}
          <footer 
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: "384px",
              margin: "0 auto",
              background: "rgba(10, 10, 10, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              zIndex: 1000,
              padding: "0 24px",
            }}
          >
            <nav style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "80px" }}>
              {/* Home Tab (Active) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#00C6FF", position: "relative" }}>
                <svg 
                  style={{ width: "28px", height: "28px", filter: "drop-shadow(0 0 10px rgba(0, 224, 255, 0.8))" }}
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
                </svg>
                <div 
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    height: "4px",
                    width: "32px",
                    backgroundColor: "#00C6FF",
                    borderRadius: "9999px",
                    filter: "drop-shadow(0 0 10px rgba(0, 224, 255, 0.8))",
                  }}
                />
              </div>

              {/* Schedule Tab */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabNavigation("Schedule");
                }}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "4px", 
                  color: "#9AA3B2", 
                  cursor: "pointer", 
                  transition: "color 0.2s",
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#9AA3B2"}
              >
                <svg style={{ width: "28px", height: "28px" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Stats Tab */}
              <div 
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#9AA3B2", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#9AA3B2"}
              >
                <svg style={{ width: "28px", height: "28px" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M3 13.5l4-4 4 4L17.5 7 21 10.5M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Profile Tab */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabNavigation("Profile");
                }}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "4px", 
                  color: "#9AA3B2", 
                  cursor: "pointer", 
                  transition: "color 0.2s",
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#9AA3B2"}
              >
                <svg style={{ width: "28px", height: "28px" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </nav>
          </footer>
        </div>
      </MobileViewport>
    );
  }

  // Native fallback
  return (
    <MobileViewport>
      <View style={{ flex: 1, backgroundColor: "#0A0F1A", justifyContent: "center", alignItems: "center" }}>
        {/* Native implementation would go here */}
      </View>
    </MobileViewport>
  );
}
