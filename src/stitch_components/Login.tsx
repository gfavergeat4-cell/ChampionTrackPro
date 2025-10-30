import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { tokens } from "../theme/tokens";
import { makePress } from "../utils/press";

interface LoginProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onForgotPassword?: () => void;
  loading: boolean;
}

export default function Login({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onNavigateToRegister,
  onForgotPassword,
  loading
}: LoginProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            ChampionTrack<Text style={styles.logoAccent}>PRO</Text>
          </Text>
          <Text style={styles.tagline}>THE TRAINING INTELLIGENCE</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email or Username"
              placeholderTextColor={tokens.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={tokens.colors.muted}
              secureTextEntry
            />
          </View>

          <View style={styles.forgotPassword}>
            <Pressable 
              onPress={makePress(onForgotPassword)}
              onClick={makePress(onForgotPassword)}
              role={Platform.OS === "web" ? "button" : undefined}
              tabIndex={Platform.OS === "web" ? 0 : undefined}
              style={{ zIndex: 10 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={() => {
              console.log("🖱️ Login button pressed (onPress)");
              console.log("🖱️ Loading state:", loading);
              console.log("🖱️ onLogin function:", typeof onLogin);
              if (!loading && onLogin) {
                console.log("🖱️ Calling onLogin...");
                onLogin();
              } else {
                console.log("🖱️ Not calling onLogin - loading:", loading, "onLogin exists:", !!onLogin);
              }
            }}
            role={Platform.OS === "web" ? "button" : undefined}
            tabIndex={Platform.OS === "web" ? 0 : undefined}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "SIGNING IN..." : "LOG IN"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Pressable 
                onPress={makePress(onNavigateToRegister)}
                onClick={makePress(onNavigateToRegister)}
                role={Platform.OS === "web" ? "button" : undefined}
                tabIndex={Platform.OS === "web" ? 0 : undefined}
                style={{ zIndex: 10 }}
              >
                <Text style={styles.footerLink}>Create one</Text>
              </Pressable>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.xl
  },
  content: {
    width: '100%',
    maxWidth: 300,
    alignItems: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: tokens.spacing.xxl
  },
  logo: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.brand,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center'
  },
  logoAccent: {
    color: tokens.colors.accentCyan,
    textShadowColor: tokens.colors.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  tagline: {
    color: tokens.colors.muted,
    opacity: 0.8,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '300',
    marginTop: tokens.spacing.sm
  },
  form: {
    width: '100%',
    gap: tokens.spacing.lg
  },
  inputContainer: {
    marginBottom: tokens.spacing.sm
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: tokens.radii.md,
    height: 52,
    color: tokens.colors.text,
    paddingHorizontal: tokens.spacing.lg,
    fontFamily: tokens.typography.ui,
    fontSize: 16
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: tokens.spacing.sm
  },
  forgotPasswordText: {
    color: tokens.colors.accentCyan,
    fontSize: 14,
    fontWeight: '500'
  },
  loginButton: {
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: tokens.radii.lg,
    paddingVertical: tokens.spacing.lg,
    alignItems: "center",
    shadowColor: tokens.colors.accentCyan,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 10,
    cursor: Platform.OS === "web" ? "pointer" : "default",
    userSelect: "none"
  },
  loginButtonDisabled: {
    opacity: 0.7
  },
  loginButtonText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  footer: {
    alignItems: "center",
    paddingTop: tokens.spacing.lg
  },
  footerText: {
    color: tokens.colors.muted,
    fontSize: 14,
    textAlign: "center"
  },
  footerLink: {
    color: tokens.colors.accentCyan,
    fontWeight: '500'
  }
});


