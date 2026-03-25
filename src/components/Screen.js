import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import theme from '../theme';

const Screen = ({ children, scroll = true, contentContainerStyle, style }) => {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <View style={contentContainerStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl
  }
});

export default Screen;
