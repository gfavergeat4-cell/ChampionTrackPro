import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { tokens } from "../theme/tokens";
import { makePress } from "../utils/press";

interface LandingProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  loading: boolean;
}

export default function Landing({
  onNavigateToRegister,
  onLogin,
  loading
}: LandingProps) {
  return (
    <View style={styles.container}>
      {/* Cyan halo effect */}
      <View style={styles.halo} pointerEvents="none" />
      
      {/* Main content */}
      <View style={styles.main}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            ChampionTrack<Text style={styles.logoAccent}>Pro</Text>
          </Text>
          <Text style={styles.tagline}>THE TRAINING INTELLIGENCE</Text>
        </View>
      </View>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={makePress(onNavigateToRegister)}
          role={Platform.OS === "web" ? "button" : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={makePress(onLogin)}
          role={Platform.OS === "web" ? "button" : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.xl
  },
  halo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.35 }, { translateY: -100 }],
    width: width * 0.7,
    height: 200,
    backgroundColor: tokens.colors.accentCyan,
    opacity: 0.15,
    borderRadius: width * 0.35,
    // Note: blur effect would need react-native-blur or similar library
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  logoContainer: {
    alignItems: "center"
  },
  logo: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.brand,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  logoAccent: {
    color: tokens.colors.accentCyan,
    textShadowColor: 'rgba(0, 224, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  tagline: {
    marginTop: tokens.spacing.sm,
    color: tokens.colors.muted,
    fontFamily: tokens.typography.ui,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '300'
  },
  footer: {
    width: '100%',
    maxWidth: 300,
    paddingBottom: tokens.spacing.xxl,
    paddingTop: tokens.spacing.lg,
    gap: tokens.spacing.lg
  },
  button: {
    height: 56,
    borderRadius: tokens.radii.xl,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  primaryButton: {
    backgroundColor: tokens.colors.accentCyan,
    // Note: gradient would need react-native-linear-gradient
    shadowColor: tokens.colors.accentCyan,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6
  },
  secondaryButton: {
    backgroundColor: tokens.colors.graphite,
    borderWidth: 1,
    borderColor: tokens.colors.graphite
  },
  buttonText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});


