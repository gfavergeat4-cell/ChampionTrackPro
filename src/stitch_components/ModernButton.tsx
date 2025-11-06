import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ModernButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle
}: ModernButtonProps) {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return tokens.gradients.primary;
      case 'secondary':
        return tokens.gradients.secondary;
      case 'success':
        return tokens.gradients.success;
      case 'warning':
        return tokens.gradients.warning;
      case 'danger':
        return tokens.gradients.danger;
      default:
        return tokens.gradients.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: tokens.spacing.sm,
          paddingHorizontal: tokens.spacing.md,
          fontSize: tokens.fontSizes.sm,
        };
      case 'large':
        return {
          paddingVertical: tokens.spacing.xl,
          paddingHorizontal: tokens.spacing.xxl,
          fontSize: tokens.fontSizes.lg,
        };
      default: // medium
        return {
          paddingVertical: tokens.spacing.lg,
          paddingHorizontal: tokens.spacing.xl,
          fontSize: tokens.fontSizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={[
          styles.gradient,
          { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[
          styles.text,
          { fontSize: sizeStyles.fontSize },
          disabled && styles.textDisabled,
          textStyle
        ]}>
          {loading ? 'Loading...' : title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.button,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  text: {
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
  },
  
  textDisabled: {
    opacity: 0.7,
  },
});


