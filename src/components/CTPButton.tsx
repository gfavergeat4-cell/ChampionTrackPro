import React from 'react';
import { Platform, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { tokens } from '../theme/tokens';
import { makePress } from '../utils/press';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: any;
  testID?: string;
};

const CTPButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  testID,
}) => {
  const isPrimary = variant === 'primary';

  const handlePress = makePress(() => {
    if (!disabled && !loading && onPress) onPress();
  });

  return (
    <Pressable
      onPress={handlePress}
      onClick={handlePress}
      accessibilityRole="button"
      role={Platform.OS === "web" ? "button" : undefined}
      tabIndex={Platform.OS === "web" ? 0 : undefined}
      testID={testID}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'center',
          height: 52,
          borderRadius: 16,
          paddingHorizontal: 20,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
          backgroundColor: isPrimary ? 'transparent' : tokens.colors.neutral700,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: tokens.colors.neutral600,
          shadowColor: tokens.colors.cyanGlow,
          shadowOpacity: isPrimary ? 0.4 : 0.2,
          shadowRadius: isPrimary ? 16 : 8,
          shadowOffset: { width: 0, height: 6 },
          zIndex: 10,
        },
        style,
      ]}
    >
      <View
        style={[
          isPrimary && {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 16,
            backgroundColor: tokens.gradients.primary.start, // fallback
          },
        ]}
      />
      {isPrimary && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 16,
            backgroundColor: 'transparent',
          }}
        />
      )}
      {loading ? (
        <ActivityIndicator color={tokens.colors.white} />
      ) : (
        <Text
          style={{
            color: tokens.colors.white,
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default CTPButton;
