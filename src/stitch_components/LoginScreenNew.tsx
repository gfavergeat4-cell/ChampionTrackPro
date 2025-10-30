import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, TextInput } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToRegister?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email');
    }
  };

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

      {/* Login Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            placeholderTextColor={tokens.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={tokens.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIcon}>👁</Text>
          </Pressable>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Pressable
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={tokens.gradients.primary}
            style={styles.loginButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.footerLink} onPress={onNavigateToRegister}>
            Create one
          </Text>
        </Text>
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
    alignItems: 'center',
    paddingTop: tokens.spacing.xxxl * 2,
    paddingBottom: tokens.spacing.xxxl,
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
  
  formContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    justifyContent: 'center',
  },
  
  inputContainer: {
    marginBottom: tokens.spacing.xl,
    position: 'relative',
  },
  
  input: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  eyeButton: {
    position: 'absolute',
    right: tokens.spacing.lg,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: tokens.spacing.sm,
  },
  
  eyeIcon: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
  },
  
  errorText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.danger,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: tokens.spacing.xl,
  },
  
  forgotPasswordText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.accentCyan,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  loginButton: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.button,
  },
  
  loginButtonDisabled: {
    opacity: 0.6,
  },
  
  loginButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loginButtonText: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
  },
  
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
  },
  
  footerLink: {
    color: tokens.colors.accentCyan,
    fontWeight: tokens.fontWeights.semibold,
  },
});

