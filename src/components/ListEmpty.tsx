import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface Props {
  message?: string;
}

export const ListEmpty: React.FC<Props> = ({ message = 'Nothing here yet' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: colors.text, opacity: 0.7 },
});

export default ListEmpty;







