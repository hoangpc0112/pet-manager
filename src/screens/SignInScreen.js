import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';

const SignInScreen = ({ navigation, onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (!email || !password) return;
    onAuthenticated();
  };

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Chào mừng quay lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để quản lý thú cưng của bạn.</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@domain.com"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={[styles.label, styles.labelGap]}>Mật khẩu</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={theme.colors.textLight}
            secureTextEntry
            style={styles.input}
          />

          <PrimaryButton
            label="Đăng nhập"
            onPress={handleSignIn}
            style={styles.primaryAction}
          />

          <GhostButton
            label="Đăng nhập bằng số điện thoại"
            onPress={() => navigation.navigate('AuthMethod')}
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>
            Đăng ký
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  keyboardContainer: {
    flex: 1,
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
  formCard: {
    padding: theme.spacing.lg
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  labelGap: {
    marginTop: theme.spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    backgroundColor: '#FFFFFF',
    ...theme.typography.bodyRegular
  },
  primaryAction: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  linkText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: '700'
  }
});

export default SignInScreen;
