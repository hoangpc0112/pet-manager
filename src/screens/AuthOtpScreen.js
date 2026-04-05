import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { normalizeForSubmit, sanitizeOtpInput } from '../services/inputSanitizers';
import { getAuthErrorMessage } from '../services/auth';
import theme from '../theme';

const AuthOtpScreen = ({ route, navigation }) => {
  const debugOtp = route?.params?.debugOtp || '';
  const [otpCode, setOtpCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [debugOtpLocal, setDebugOtpLocal] = useState(debugOtp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = route?.params?.email || '';
  const verificationId = route?.params?.verificationId || '';
  const { verifySignUpOtp, resendSignUpOtp } = useAuth();

  const handleVerify = async () => {
    if (isSubmitting) return;
    if (!verificationId) {
      setErrorText('Không tìm thấy phiên OTP. Vui lòng yêu cầu mã mới.');
      return;
    }
    const cleanOtpCode = normalizeForSubmit(otpCode);

    if (cleanOtpCode.length < 6) {
      setErrorText('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText('');
      await verifySignUpOtp({ verificationId, otpCode: cleanOtpCode });
    } catch (error) {
      setErrorText(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || isSubmitting) return;
    if (!verificationId) {
      setErrorText('Không tìm thấy phiên OTP. Vui lòng đăng ký lại.');
      return;
    }

    try {
      setIsResending(true);
      setErrorText('');
      setResendMessage('');
      const payload = await resendSignUpOtp({ verificationId });
      if (__DEV__) {
        setDebugOtpLocal(payload.debugOtp || '');
      }
      setResendMessage('Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
    } catch (error) {
      setErrorText(getAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Xác thực email</Text>
          <Text style={styles.subtitle}>Mã OTP đã được gửi đến {email || 'email của bạn'}.</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Mã OTP</Text>
          <TextInput
            value={otpCode}
            onChangeText={(value) => setOtpCode(sanitizeOtpInput(value, 6))}
            placeholder="Nhập 6 số"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            autoCorrect={false}
            style={styles.input}
          />

          {__DEV__ && debugOtpLocal ? (
            <Text style={styles.devHint}>Mã OTP demo: {debugOtpLocal}</Text>
          ) : null}

          <PrimaryButton
            label={isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
            onPress={handleVerify}
            style={styles.primaryAction}
          />

          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          {resendMessage ? <Text style={styles.successText}>{resendMessage}</Text> : null}

          <Text style={styles.resendText} onPress={handleResendOtp}>
            {isResending ? 'Đang gửi lại OTP...' : 'Chưa nhận được mã? Gửi lại OTP'}
          </Text>

          <Text style={styles.backText} onPress={() => navigation.navigate('SignUp')}>
            Sai email? Quay lại đăng ký
          </Text>
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
  devHint: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm
  },
  primaryAction: {
    marginTop: theme.spacing.lg
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm
  },
  successText: {
    ...theme.typography.small,
    color: theme.colors.success,
    marginTop: theme.spacing.sm
  },
  resendText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700'
  },
  backText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  }
});

export default AuthOtpScreen;
