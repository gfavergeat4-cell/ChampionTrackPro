import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>CTP</Text>
        </View>
        <View style={styles.spinner} />
        <Text style={styles.text}>Loading...</Text>
      </View>
      {Platform.OS === "web" && (
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner-web {
            animation: spin 1s linear infinite;
          }
        `}</style>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1A",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00E0FF",
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS !== "web" && {
      shadowColor: "#00E0FF",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    }),
    ...(Platform.OS === "web" && {
      boxShadow: "0 0 20px rgba(0, 224, 255, 0.5)",
    }),
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A0F1A",
    fontFamily: Platform.OS === "web" ? "'Inter', sans-serif" : "System",
  },
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: "rgba(0, 224, 255, 0.3)",
    borderTopColor: "#00E0FF",
    borderRadius: 20,
    ...(Platform.OS === "web" && {
      className: "spinner-web",
    }),
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00E0FF",
    fontFamily: Platform.OS === "web" ? "'Inter', sans-serif" : "System",
  },
});


