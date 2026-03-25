import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../theme';

const Chip = ({ label, active, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, active ? styles.active : styles.inactive, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10
  },
  active: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  inactive: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.chipBorder
  },
  text: {
    ...theme.typography.caption
  },
  textActive: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  textInactive: {
    color: theme.colors.textMuted
  }
});

export default Chip;
