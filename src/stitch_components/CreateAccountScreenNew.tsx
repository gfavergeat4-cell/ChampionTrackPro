import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, TextInput } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";

interface CreateAccountScreenProps {
  onAccountCreated?: () => void;
  onNavigateToLogin?: () => void;
}

export default function CreateAccountScreen({ 
  onAccountCreated, 
  onNavigateToLogin 
}: CreateAccountScreenProps) {
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [formData, setFormData] = useState({
    teamCode: '',
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    if (!formData.teamCode || !formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Create user document
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: role,
        teamCode: formData.teamCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      onAccountCreated?.();
    } catch (error: any) {
      console.error('Account creation error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
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

      {/* Role Selection */}
      <View style={styles.roleSection}>
        <Pressable
          style={[styles.roleButton, role === 'athlete' && styles.roleButtonActive]}
          onPress={() => setRole('athlete')}
        >
          <Text style={[styles.roleButtonText, role === 'athlete' && styles.roleButtonTextActive]}>
            ATHLETE
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.roleButton, role === 'coach' && styles.roleButtonActive]}
          onPress={() => setRole('coach')}
        >
          <Text style={[styles.roleButtonText, role === 'coach' && styles.roleButtonTextActive]}>
            COACH
          </Text>
        </Pressable>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Team Access Code"
            placeholderTextColor={tokens.colors.textSecondary}
            value={formData.teamCode}
            onChangeText={(value) => handleInputChange('teamCode', value)}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={tokens.colors.textSecondary}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={tokens.colors.textSecondary}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
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
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
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
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          <LinearGradient
            colors={tokens.gradients.primary}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={onNavigateToLogin}>
            Log In
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
  
  roleSection: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  
  roleButton: {
    flex: 1,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    alignItems: 'center',
  },
  
  roleButtonActive: {
    backgroundColor: tokens.colors.accentCyan,
    ...tokens.shadows.glow,
  },
  
  roleButtonText: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
  },
  
  roleButtonTextActive: {
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.bold,
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
  
  createButton: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.button,
  },
  
  createButtonDisabled: {
    opacity: 0.6,
  },
  
  createButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  createButtonText: {
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


