import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../theme';

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: theme.spacing.lg,
    ...theme.shadow.card
  }
});

export default Card;
