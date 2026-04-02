import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';

const AuthMethodScreen = ({ navigation }) => {
  return (
    <Screen scroll={false} contentContainerStyle={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Chọn cách đăng nhập</Text>
        <Text style={styles.subtitle}>Bạn có thể tiếp tục với email hoặc số điện thoại.</Text>
      </View>

      <Card style={styles.card}>
        <PrimaryButton label="Đăng nhập bằng số điện thoại" onPress={() => navigation.navigate('AuthPhone')} />
        <GhostButton
          label="Quay về đăng nhập email"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.secondaryAction}
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    justifyContent: 'center'
  },
  headerWrap: {
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.bodyRegular,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  card: {
    padding: theme.spacing.lg
  },
  secondaryAction: {
    marginTop: theme.spacing.md
  }
});

export default AuthMethodScreen;


