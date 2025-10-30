import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useFonts, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { Rajdhani_300Light, Rajdhani_700Bold } from "@expo-google-fonts/rajdhani";

type Nav = { navigate: (route: string) => void };

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Rajdhani_300Light,
    Rajdhani_700Bold,
  });

  const go = (route: "SignUp" | "Login") => {
    try { navigation.navigate(route); } catch { console.warn(`Route '${route}' introuvable.`); }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={["#101018", "#0A0A10"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.container}>
        <View style={styles.centerBlock}>
          <Text accessibilityRole="header" style={styles.title}>CHAMPIONTRACKPRO</Text>
          <Text style={styles.subtitle}>THE TRAINING INTELLIGENCE</Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create Account"
              onPress={() => go("SignUp")}
              style={({ pressed }) => [styles.btnPrimaryWrap, pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={["#00C6FF", "#0066FF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.btnPrimary}
              >
                <Text style={styles.btnPrimaryText}>CREATE ACCOUNT</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log In"
              onPress={() => go("Login")}
              style={({ pressed }) => [styles.btnGhost, pressed && { backgroundColor: "rgba(255,255,255,0.06)" }]}
            >
              <Text style={styles.btnGhostText}>LOG IN</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const RADIUS = 20;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A10" },
  container: { flex: 1, alignItems: "center", paddingHorizontal: 16 },
  centerBlock: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 32,
    letterSpacing: 6,
    color: "#E5E4E2",
    textTransform: "uppercase",
    textShadowColor: "rgba(229,228,226,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "Rajdhani_300Light",
    fontSize: 12,
    letterSpacing: 4.8,
    color: "#BFC3C9",
    textTransform: "uppercase",
  },
  footer: { width: "100%", paddingBottom: 24 },
  card: {
    width: "100%", maxWidth: 420, alignSelf: "center",
    borderRadius: RADIUS, padding: 16, gap: 12,
    backgroundColor: "rgba(18,22,32,0.75)",
    borderWidth: 1, borderColor: "rgba(229,228,226,0.10)",
    ...(Platform.OS === "android"
      ? { elevation: 3 }
      : { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }),
  },
  btnPrimaryWrap: { borderRadius: RADIUS },
  btnPrimary: {
    height: 48, borderRadius: RADIUS, alignItems: "center", justifyContent: "center",
    ...(Platform.OS === "android"
      ? { elevation: 6 }
      : { shadowColor: "rgba(0,198,255,0.5)", shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }),
  },
  btnPrimaryText: { fontFamily: "Rajdhani_700Bold", fontSize: 16, letterSpacing: 1, color: "#FFFFFF" },
  btnGhost: {
    height: 48, borderRadius: RADIUS, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(18,22,32,0.75)", borderWidth: 1, borderColor: "rgba(229,228,226,0.20)",
  },
  btnGhostText: { fontFamily: "Rajdhani_700Bold", fontSize: 16, letterSpacing: 1, color: "#E5E4E2" },
  glow: {
    position: "absolute", top: "25%", left: "50%", width: 384, height: 384,
    marginLeft: -192, marginTop: -192, backgroundColor: "rgba(0,198,255,0.10)", borderRadius: 9999,
    ...(Platform.OS === "android" ? { elevation: 0 } : { shadowColor: "rgba(0,198,255,0.6)", shadowOpacity: 1, shadowRadius: 40 }),
  },
});
