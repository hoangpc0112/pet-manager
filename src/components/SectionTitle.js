import React from 'react';
import { StyleSheet, Text } from 'react-native';
import theme from '../theme';

const SectionTitle = ({ children, style }) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h3,
    color: theme.colors.text
  }
});

export default SectionTitle;
