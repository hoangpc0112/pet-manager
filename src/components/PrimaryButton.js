import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../theme';

const PrimaryButton = ({ label, onPress, style, textStyle, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.9}
    >
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.button
  },
  buttonDisabled: {
    opacity: 0.45
  },
  text: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  textDisabled: {
    color: '#FFFFFF'
  }
});

export default PrimaryButton;
