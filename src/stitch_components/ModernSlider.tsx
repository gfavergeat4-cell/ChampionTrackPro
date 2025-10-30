import React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { tokens } from "../theme/tokens";

interface ModernSliderProps {
  title: string;
  description?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export default function ModernSlider({
  title,
  description,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 10,
  style,
  titleStyle,
  descriptionStyle
}: ModernSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onValueChange(newValue);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {description && (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      )}
      
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
          <View style={[styles.sliderThumb, { left: `${percentage}%` }]} />
        </View>
        
        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={handleDecrease}
            disabled={value <= min}
          >
            <Text style={[
              styles.controlButtonText,
              value <= min && styles.controlButtonTextDisabled
            ]}>
              -
            </Text>
          </Pressable>
          
          <Text style={styles.valueText}>{value}</Text>
          
          <Pressable
            style={styles.controlButton}
            onPress={handleIncrease}
            disabled={value >= max}
          >
            <Text style={[
              styles.controlButtonText,
              value >= max && styles.controlButtonTextDisabled
            ]}>
              +
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  title: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  description: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
  },
  
  sliderContainer: {
    gap: tokens.spacing.lg,
  },
  
  sliderTrack: {
    height: 8,
    backgroundColor: tokens.colors.surfaceHover,
    borderRadius: tokens.radii.sm,
    position: 'relative',
  },
  
  sliderFill: {
    height: '100%',
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: tokens.radii.sm,
  },
  
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: tokens.radii.full,
    ...tokens.shadows.glow,
    transform: [{ translateX: -10 }],
  },
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  controlButtonText: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.bold,
  },
  
  controlButtonTextDisabled: {
    color: tokens.colors.textMuted,
  },
  
  valueText: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
});

