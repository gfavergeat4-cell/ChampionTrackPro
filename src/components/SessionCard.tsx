import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radii } from '../theme/tokens';

interface Props {
  title: string;
  start: Date;
  end: Date;
  completed?: boolean;
  onPress?: () => void;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const SessionCard: React.FC<Props> = ({ title, start, end, completed, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>{formatTime(start)} — {formatTime(end)}</Text>
        <View style={[styles.badge, completed ? styles.badgeCompleted : styles.badgeRespond]}>
          <Text style={styles.badgeText}>{completed ? 'Completed' : 'Respond'}</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: '#D0D6E0' },
  title: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 8 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.sm },
  badgeCompleted: { backgroundColor: '#2E7D32' },
  badgeRespond: { backgroundColor: '#1F3A93' },
  badgeText: { color: '#FFFFFF', fontSize: 12 },
});

export default SessionCard;








