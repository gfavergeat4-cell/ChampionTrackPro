import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { tokens } from "../theme/tokens";
import { makePress } from "../utils/press";

interface CreateAccountProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onCreateAccount: (data: { teamCode: string; fullName: string; email: string; password: string; role: string }) => void;
  onBackToLogin: () => void;
  loading: boolean;
}

export default function CreateAccount({
  email,
  setEmail,
  password,
  setPassword,
  onCreateAccount,
  onBackToLogin,
  loading
}: CreateAccountProps) {
  const [accessCode, setAccessCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"ATHLETE" | "COACH">("ATHLETE");

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
          <View style={styles.roleSelector}>
            <Pressable
              style={[styles.roleButton, role === "ATHLETE" && styles.roleButtonActive]}
              onPress={makePress(() => setRole("ATHLETE"))}
              onClick={makePress(() => setRole("ATHLETE"))}
              role={Platform.OS === "web" ? "button" : undefined}
              tabIndex={Platform.OS === "web" ? 0 : undefined}
            >
              <Text style={[styles.roleButtonText, role === "ATHLETE" && styles.roleButtonTextActive]}>
                ATHLETE
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleButton, role === "COACH" && styles.roleButtonActive]}
              onPress={makePress(() => setRole("COACH"))}
              onClick={makePress(() => setRole("COACH"))}
              role={Platform.OS === "web" ? "button" : undefined}
              tabIndex={Platform.OS === "web" ? 0 : undefined}
            >
              <Text style={[styles.roleButtonText, role === "COACH" && styles.roleButtonTextActive]}>
                COACH
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={accessCode}
              onChangeText={setAccessCode}
              placeholder="Team Access Code"
              placeholderTextColor={tokens.colors.muted}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={tokens.colors.muted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
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

          <Pressable
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={makePress(() => onCreateAccount({ teamCode: accessCode, fullName, email, password, role }))}
            onClick={makePress(() => onCreateAccount({ teamCode: accessCode, fullName, email, password, role }))}
            role={Platform.OS === "web" ? "button" : undefined}
            tabIndex={Platform.OS === "web" ? 0 : undefined}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Pressable 
                onPress={makePress(onBackToLogin)}
                onClick={makePress(onBackToLogin)}
                role={Platform.OS === "web" ? "button" : undefined}
                tabIndex={Platform.OS === "web" ? 0 : undefined}
                style={{ zIndex: 10 }}
              >
                <Text style={styles.footerLink}>Log In</Text>
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
    marginTop: tokens.spacing.xxl,
    marginBottom: tokens.spacing.xl
  },
  logo: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.brand,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  logoAccent: {
    color: tokens.colors.accentCyan,
    textShadowColor: tokens.colors.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  tagline: {
    color: '#E6ECF9',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '300',
    marginTop: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 224, 255, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12
  },
  form: {
    width: '100%',
    marginTop: tokens.spacing.xl
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl
  },
  roleButton: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xxl,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    zIndex: 10
  },
  roleButtonActive: {
    backgroundColor: tokens.colors.accentCyan,
    shadowColor: tokens.colors.accentCyan,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.muted
  },
  roleButtonTextActive: {
    color: tokens.colors.text
  },
  inputContainer: {
    marginBottom: tokens.spacing.lg
  },
  input: {
    backgroundColor: 'rgba(26, 32, 44, 0.5)',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: tokens.radii.md,
    height: 52,
    color: tokens.colors.text,
    paddingHorizontal: tokens.spacing.lg,
    fontFamily: tokens.typography.ui,
    fontSize: 16
  },
  createButton: {
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: tokens.radii.lg,
    paddingVertical: tokens.spacing.lg,
    alignItems: "center",
    marginTop: tokens.spacing.lg,
    shadowColor: tokens.colors.accentCyan,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 10
  },
  createButtonDisabled: {
    opacity: 0.7
  },
  createButtonText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  footer: {
    alignItems: "center",
    marginTop: tokens.spacing.xl
  },
  footerText: {
    color: tokens.colors.muted,
    fontSize: 14,
    textAlign: "center"
  },
  footerLink: {
    color: tokens.colors.accentCyan,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 224, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  }
});


