import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';

const SignUpScreen = ({ navigation, onAuthenticated }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    password === confirmPassword;

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình chăm sóc thú cưng thông minh.</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tên của bạn"
            placeholderTextColor={theme.colors.textLight}
            style={styles.input}
          />

          <Text style={[styles.label, styles.labelGap]}>Email</Text>
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

          <Text style={[styles.label, styles.labelGap]}>Nhập lại mật khẩu</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={theme.colors.textLight}
            secureTextEntry
            style={styles.input}
          />

          {!canSubmit && confirmPassword.length > 0 ? (
            <Text style={styles.errorText}>Mật khẩu xác nhận chưa khớp.</Text>
          ) : null}

          <PrimaryButton
            label="Đăng ký"
            onPress={() => canSubmit && onAuthenticated()}
            style={styles.primaryAction}
          />
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Đã có tài khoản?</Text>
          <Text style={styles.linkText} onPress={() => navigation.navigate('SignIn')}>
            Đăng nhập
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
    marginTop: theme.spacing.sm
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
  errorText: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm
  },
  primaryAction: {
    marginTop: theme.spacing.lg
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

export default SignUpScreen;
