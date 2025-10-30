import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Role = 'athlete' | 'admin';

interface Props {
  value: Role;
  onChange: (role: Role) => void;
}

export const RoleToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {(['athlete', 'admin'] as Role[]).map((role) => {
        const active = value === role;
        return (
          <Pressable key={role} onPress={() => onChange(role)} style={[styles.segment, active && styles.active]}> 
            <Text style={styles.text}>{role === 'athlete' ? 'Athlete' : 'Admin'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  active: {
    backgroundColor: '#22324A',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  text: { color: colors.text, fontWeight: '600' },
});

export default RoleToggle;



