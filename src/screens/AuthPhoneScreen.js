import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';

const AuthPhoneScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!phone.trim()) return;
    navigation.navigate('AuthOtp', { phone });
  };

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Đăng nhập với số điện thoại</Text>
          <Text style={styles.subtitle}>Chúng tôi sẽ gửi mã OTP để xác thực tài khoản.</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Ví dụ: 0912345678"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <PrimaryButton label="Gửi mã OTP" onPress={handleContinue} style={styles.primaryAction} />
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

export default AuthPhoneScreen;
