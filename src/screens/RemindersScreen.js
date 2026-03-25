import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import theme from '../theme';

const RemindersScreen = () => {
  return (
    <Screen contentContainerStyle={styles.container} scroll={false}>
      <View style={styles.center}>
        <Text style={styles.title}>Nhắc nhở</Text>
        <Text style={styles.subtitle}>Màn hình đang được chuẩn bị.</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 8
  }
});

export default RemindersScreen;
