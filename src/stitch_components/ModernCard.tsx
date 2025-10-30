import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'elevated';
  padding?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function ModernCard({
  children,
  variant = 'default',
  padding = 'medium',
  style
}: ModernCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'surface':
        return {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.surfaceHover,
        };
      case 'elevated':
        return {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.surfaceHover,
          ...tokens.shadows.card,
        };
      default:
        return {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.surfaceHover,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'small':
        return tokens.spacing.md;
      case 'large':
        return tokens.spacing.xxl;
      default: // medium
        return tokens.spacing.xl;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = getPaddingStyles();

  return (
    <View style={[
      styles.card,
      variantStyles,
      { padding: paddingValue },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
  },
});

