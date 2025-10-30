import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";

interface LandingScreenProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

export default function LandingScreen({ 
  onNavigateToLogin, 
  onNavigateToRegister 
}: LandingScreenProps) {
  return (
    <LinearGradient
      colors={[tokens.colors.bg, tokens.colors.bgSecondary]}
      style={styles.container}
    >
      {/* Background Effects */}
      <View style={styles.backgroundEffect1} />
      <View style={styles.backgroundEffect2} />
      
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>
          <Text style={styles.logoMain}>CHAMPIONTRACK</Text>
          <Text style={styles.logoPro}>PRO</Text>
        </Text>
        <Text style={styles.tagline}>THE TRAINING INTELLIGENCE</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Pressable
          style={styles.primaryButton}
          onPress={onNavigateToRegister}
        >
          <LinearGradient
            colors={tokens.gradients.primary}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={onNavigateToLogin}
        >
          <Text style={styles.secondaryButtonText}>LOG IN</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  
  backgroundEffect1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: tokens.colors.accentCyan,
    opacity: 0.1,
  },
  
  backgroundEffect2: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: tokens.colors.accentPurple,
    opacity: 0.08,
  },
  
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  
  logoText: {
    fontSize: tokens.fontSizes.display,
    fontWeight: tokens.fontWeights.bold,
    fontFamily: tokens.typography.brand,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  
  logoMain: {
    color: tokens.colors.text,
  },
  
  logoPro: {
    color: tokens.colors.accentCyan,
    ...tokens.shadows.glow,
  },
  
  tagline: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    letterSpacing: 2,
    textAlign: 'center',
  },
  
  actionsSection: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl * 2,
    gap: tokens.spacing.lg,
  },
  
  primaryButton: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.button,
  },
  
  primaryButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
  },
  
  secondaryButton: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.card,
  },
  
  secondaryButtonText: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
  },
});

