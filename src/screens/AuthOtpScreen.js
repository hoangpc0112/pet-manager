import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';

const AuthOtpScreen = ({ route, onAuthenticated }) => {
  const [otpCode, setOtpCode] = useState('');
  const phone = route?.params?.phone || '';

  const handleVerify = () => {
    if (otpCode.trim().length < 4) return;
    onAuthenticated();
  };

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Nhập mã OTP</Text>
          <Text style={styles.subtitle}>Mã xác thực đã được gửi đến {phone || 'số điện thoại của bạn'}.</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Mã OTP</Text>
          <TextInput
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="Nhập 4-6 số"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />

          <PrimaryButton label="Xác thực" onPress={handleVerify} style={styles.primaryAction} />
        </Card>
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
    marginTop: theme.spacing.lg
  }
});

export default AuthOtpScreen;
