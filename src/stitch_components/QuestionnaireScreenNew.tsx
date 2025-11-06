import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView, TextInput } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";

interface QuestionnaireScreenProps {
  eventData?: {
    id: string;
    title: string;
    time: string;
  };
  onSubmit?: (responses: any) => void;
  onBack?: () => void;
}

interface SliderProps {
  title: string;
  description: string;
  value: number;
  onValueChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ title, description, value, onValueChange }) => {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderTitle}>{title}</Text>
      <Text style={styles.sliderDescription}>{description}</Text>
      
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${value}%` }]} />
        <View style={[styles.sliderThumb, { left: `${value}%` }]} />
      </View>
      
      <View style={styles.sliderControls}>
        <Pressable
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.max(0, value - 10))}
        >
          <Text style={styles.sliderButtonText}>-</Text>
        </Pressable>
        <Pressable
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.min(100, value + 10))}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
};

interface BinaryChoiceProps {
  title: string;
  description: string;
  value: boolean | null;
  onValueChange: (value: boolean) => void;
}

const BinaryChoice: React.FC<BinaryChoiceProps> = ({ title, description, value, onValueChange }) => {
  return (
    <View style={styles.binaryContainer}>
      <Text style={styles.binaryTitle}>{title}</Text>
      <Text style={styles.binaryDescription}>{description}</Text>
      
      <View style={styles.binaryButtons}>
        <Pressable
          style={[
            styles.binaryButton,
            value === false && styles.binaryButtonSelected
          ]}
          onPress={() => onValueChange(false)}
        >
          <Text style={[
            styles.binaryButtonText,
            value === false && styles.binaryButtonTextSelected
          ]}>
            No
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.binaryButton,
            value === true && styles.binaryButtonSelected
          ]}
          onPress={() => onValueChange(true)}
        >
          <Text style={[
            styles.binaryButtonText,
            value === true && styles.binaryButtonTextSelected
          ]}>
            Yes
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function QuestionnaireScreen({ 
  eventData, 
  onSubmit, 
  onBack 
}: QuestionnaireScreenProps) {
  const [responses, setResponses] = useState({
    averageIntensity: 50,
    highIntensity: 50,
    cardiacImpact: 50,
    muscularImpact: 50,
    fatigue: 50,
    technique: 50,
    tactics: 50,
    dynamism: 50,
    nervousness: 50,
    concentration: 50,
    confidence: 50,
    wellBeing: 50,
    sleepQuality: 50,
    physicalPain: null as boolean | null,
    painIntensity: 50,
    painFrequency: null as string | null,
    discomfort: 50
  });

  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSliderChange = (key: string, value: number) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleBinaryChange = (key: string, value: boolean) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleFrequencyChange = (value: string) => {
    setResponses(prev => ({ ...prev, painFrequency: value }));
  };

  const handleSubmit = () => {
    onSubmit?.(responses);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    setShowSubmitButton(isAtBottom);
  };

  return (
    <LinearGradient
      colors={[tokens.colors.bg, tokens.colors.bgSecondary]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{eventData?.title || 'Practice'}</Text>
          <Text style={styles.headerTime}>{eventData?.time || '2:00 PM - 3:30 PM'}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Intensity Sliders */}
        <Slider
          title="Average Intensity"
          description="Average of all effort intensities."
          value={responses.averageIntensity}
          onValueChange={(value) => handleSliderChange('averageIntensity', value)}
        />

        <Slider
          title="High Intensity"
          description="Peak effort during the session."
          value={responses.highIntensity}
          onValueChange={(value) => handleSliderChange('highIntensity', value)}
        />

        <Slider
          title="Cardiac Impact"
          description="Cardiovascular load and heart rate response."
          value={responses.cardiacImpact}
          onValueChange={(value) => handleSliderChange('cardiacImpact', value)}
        />

        <Slider
          title="Muscular Impact"
          description="Muscle fatigue and strength requirements."
          value={responses.muscularImpact}
          onValueChange={(value) => handleSliderChange('muscularImpact', value)}
        />

        <Slider
          title="Fatigue"
          description="Overall fatigue level after the session."
          value={responses.fatigue}
          onValueChange={(value) => handleSliderChange('fatigue', value)}
        />

        {/* Pain Assessment */}
        <BinaryChoice
          title="Did you feel any physical pain?"
          description="Any discomfort or pain during the session."
          value={responses.physicalPain}
          onValueChange={(value) => handleBinaryChange('physicalPain', value)}
        />

        {responses.physicalPain === true && (
          <>
            <Slider
              title="Level of Pain Intensity"
              description="How intense was the pain?"
              value={responses.painIntensity}
              onValueChange={(value) => handleSliderChange('painIntensity', value)}
            />

            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyTitle}>Frequency of Appearance</Text>
              <Text style={styles.frequencyDescription}>How often does this pain appear?</Text>
              
              <View style={styles.frequencyGrid}>
                {['First time', 'Rarely', 'Often', 'Always'].map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.frequencyButton,
                      responses.painFrequency === option && styles.frequencyButtonSelected
                    ]}
                    onPress={() => handleFrequencyChange(option)}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      responses.painFrequency === option && styles.frequencyButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Technical Aspects */}
        <Slider
          title="Technique"
          description="Technical execution quality."
          value={responses.technique}
          onValueChange={(value) => handleSliderChange('technique', value)}
        />

        <Slider
          title="Tactics"
          description="Strategic and tactical performance."
          value={responses.tactics}
          onValueChange={(value) => handleSliderChange('tactics', value)}
        />

        <Slider
          title="Dynamism"
          description="Energy and movement quality."
          value={responses.dynamism}
          onValueChange={(value) => handleSliderChange('dynamism', value)}
        />

        {/* Mental State */}
        <Slider
          title="Nervousness"
          description="Level of anxiety or nervousness."
          value={responses.nervousness}
          onValueChange={(value) => handleSliderChange('nervousness', value)}
        />

        <Slider
          title="Concentration"
          description="Focus and attention during the session."
          value={responses.concentration}
          onValueChange={(value) => handleSliderChange('concentration', value)}
        />

        <Slider
          title="Confidence"
          description="Self-confidence and belief in abilities."
          value={responses.confidence}
          onValueChange={(value) => handleSliderChange('confidence', value)}
        />

        {/* Well-being */}
        <Slider
          title="Well-being"
          description="Overall physical and mental well-being."
          value={responses.wellBeing}
          onValueChange={(value) => handleSliderChange('wellBeing', value)}
        />

        <Slider
          title="Sleep Quality"
          description="Quality of sleep before the session."
          value={responses.sleepQuality}
          onValueChange={(value) => handleSliderChange('sleepQuality', value)}
        />

        <Slider
          title="Level of Discomfort"
          description="General discomfort or unease."
          value={responses.discomfort}
          onValueChange={(value) => handleSliderChange('discomfort', value)}
        />

        {/* Submit Button - Only visible when scrolled to bottom */}
        {showSubmitButton && (
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={tokens.gradients.primary}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Spacer to ensure submit button is visible */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  
  backButton: {
    marginRight: tokens.spacing.lg,
    padding: tokens.spacing.sm,
  },
  
  backArrow: {
    fontSize: tokens.fontSizes.xl,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: tokens.fontSizes.xxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  headerTime: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  
  // Slider Styles
  sliderContainer: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  sliderTitle: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  sliderDescription: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
  },
  
  sliderTrack: {
    height: 8,
    backgroundColor: tokens.colors.surfaceHover,
    borderRadius: tokens.radii.sm,
    position: 'relative',
    marginBottom: tokens.spacing.lg,
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
  
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sliderButtonText: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.bold,
  },
  
  // Binary Choice Styles
  binaryContainer: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  binaryTitle: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  binaryDescription: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
  },
  
  binaryButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  
  binaryButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surfaceHover,
    alignItems: 'center',
  },
  
  binaryButtonSelected: {
    backgroundColor: tokens.colors.accentCyan,
    ...tokens.shadows.glow,
  },
  
  binaryButtonText: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  binaryButtonTextSelected: {
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.semibold,
  },
  
  // Frequency Styles
  frequencyContainer: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  frequencyTitle: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  frequencyDescription: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
  },
  
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surfaceHover,
    alignItems: 'center',
  },
  
  frequencyButtonSelected: {
    backgroundColor: tokens.colors.accentCyan,
    ...tokens.shadows.glow,
  },
  
  frequencyButtonText: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  frequencyButtonTextSelected: {
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.semibold,
  },
  
  // Submit Button
  submitButton: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    marginTop: tokens.spacing.xl,
    ...tokens.shadows.button,
  },
  
  submitButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  submitButtonText: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    letterSpacing: 1,
  },
  
  bottomSpacer: {
    height: 100,
  },
});


