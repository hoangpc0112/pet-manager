import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../theme';

const ProgressSteps = ({ total, current }) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index < current;
        return <View key={`step-${index}`} style={[styles.bar, active ? styles.active : styles.inactive]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    marginRight: 8
  },
  active: {
    backgroundColor: theme.colors.primary
  },
  inactive: {
    backgroundColor: '#E5E7EB'
  }
});

export default ProgressSteps;
