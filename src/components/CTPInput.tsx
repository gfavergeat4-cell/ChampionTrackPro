import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, radii } from '../theme/tokens';

interface Props extends TextInputProps {
  label?: string;
}

export const CTPInput: React.FC<Props> = ({ label, ...props }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={'#A7B0C0'}
        style={[styles.input, focused && styles.focused]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { color: '#D0D6E0', marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#3A3F4B',
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  focused: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

export default CTPInput;



