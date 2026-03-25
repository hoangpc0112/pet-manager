import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../theme';

const IconBadge = ({ children, style }) => {
  return <View style={[styles.badge, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft
  }
});

export default IconBadge;
