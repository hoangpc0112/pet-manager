import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

const OTP_TTL_MS = 5 * 60 * 1000;
const pendingSignUpOtps = new Map();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createAuthError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const createOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const sendOtpToEmail = async ({ email, otpCode, displayName }) => {
  const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EXPO_PUBLIC_EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return false;
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey || undefined,
      template_params: {
        to_email: email,
        otp_code: otpCode,
        user_name: displayName || 'ban',
        app_name: 'Pet Care App'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const normalized = String(errorText || '').toLowerCase();

    if (normalized.includes('non-browser environments is currently disabled')) {
      throw createAuthError(
        'auth/otp-emailjs-non-browser-disabled',
        'EmailJS dang chan moi truong non-browser. Vui long bat tuy chon nay trong EmailJS Security.'
      );
    }

    if (normalized.includes('strict mode') && normalized.includes('no private key')) {
      throw createAuthError(
        'auth/otp-emailjs-strict-mode-private-key-missing',
        'EmailJS dang o strict mode nhung thieu Private Key.'
      );
    }

    throw createAuthError('auth/otp-send-failed', 'Khong the gui OTP den email nay.');
  }

  return true;
};

export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export const signInWithEmail = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
};

export const requestSignUpEmailOtp = async ({ displayName, email, password }) => {
  const cleanDisplayName = String(displayName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanDisplayName) {
    throw createAuthError('auth/missing-display-name', 'Vui long nhap ten hien thi.');
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    throw createAuthError('auth/invalid-email', 'Email khong hop le.');
  }

  if (String(password || '').length < 6) {
    throw createAuthError('auth/weak-password', 'Mat khau phai co it nhat 6 ky tu.');
  }

  const verificationId = `email-signup-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const otpCode = createOtpCode();
  const expiresAt = Date.now() + OTP_TTL_MS;

  pendingSignUpOtps.set(verificationId, {
    displayName: cleanDisplayName,
    email: cleanEmail,
    password,
    otpCode,
    expiresAt
  });

  const emailSent = await sendOtpToEmail({
    email: cleanEmail,
    otpCode,
    displayName: cleanDisplayName
  });

  if (!emailSent && !__DEV__) {
    pendingSignUpOtps.delete(verificationId);
    throw createAuthError(
      'auth/otp-email-not-configured',
      'He thong gui OTP email chua duoc cau hinh.'
    );
  }

  return {
    verificationId,
    email: cleanEmail,
    emailSent,
    debugOtp: __DEV__ && !emailSent ? otpCode : ''
  };
};

export const resendSignUpEmailOtp = async ({ verificationId }) => {
  const pending = pendingSignUpOtps.get(verificationId);

  if (!pending) {
    throw createAuthError('auth/invalid-verification-id', 'Phien xac thuc da het han. Vui long dang ky lai.');
  }

  const nextOtpCode = createOtpCode();
  pendingSignUpOtps.set(verificationId, {
    ...pending,
    otpCode: nextOtpCode,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  const emailSent = await sendOtpToEmail({
    email: pending.email,
    otpCode: nextOtpCode,
    displayName: pending.displayName
  });

  if (!emailSent && !__DEV__) {
    throw createAuthError(
      'auth/otp-email-not-configured',
      'He thong gui OTP email chua duoc cau hinh.'
    );
  }

  return {
    verificationId,
    email: pending.email,
    emailSent,
    debugOtp: __DEV__ && !emailSent ? nextOtpCode : ''
  };
};

export const verifySignUpEmailOtp = async ({ verificationId, otpCode }) => {
  const pending = pendingSignUpOtps.get(verificationId);

  if (!pending) {
    throw createAuthError('auth/invalid-verification-id', 'Phien xac thuc da het han. Vui long dang ky lai.');
  }

  if (pending.expiresAt < Date.now()) {
    pendingSignUpOtps.delete(verificationId);
    throw createAuthError('auth/code-expired', 'Ma OTP da het han. Vui long dang ky lai.');
  }

  if (String(otpCode || '').trim() !== pending.otpCode) {
    throw createAuthError('auth/invalid-verification-code', 'Ma OTP chua dung.');
  }

  pendingSignUpOtps.delete(verificationId);

  const credential = await createUserWithEmailAndPassword(auth, pending.email, pending.password);
  if (pending.displayName) {
    await updateProfile(credential.user, { displayName: pending.displayName });
  }
  return credential.user;
};

export const signOutCurrentUser = async () => {
  await signOut(auth);
};

export const updateCurrentUserProfile = async ({ displayName, photoURL }) => {
  if (!auth.currentUser) {
    throw createAuthError('auth/no-current-user', 'Chua co nguoi dung dang nhap.');
  }

  const payload = {};
  if (typeof displayName === 'string') payload.displayName = displayName;
  if (typeof photoURL === 'string') payload.photoURL = photoURL;
  if (photoURL === null) payload.photoURL = null;

  await updateProfile(auth.currentUser, payload);
  return auth.currentUser;
};

export const getAuthErrorMessage = (error) => {
  const code = error?.code;
  const fallback = 'Có lỗi xảy ra. Vui lòng thử lại.';

  if (!code) {
    if (__DEV__ && error?.message) {
      return `Loi khong xac dinh: ${error.message}`;
    }
    return fallback;
  }

  const messageMap = {
    'auth/email-already-in-use': 'Email này đã được sử dụng.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/invalid-credential': 'Thông tin đăng nhập chưa đúng.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
    'auth/user-not-found': 'Không tìm thấy tài khoản.',
    'auth/wrong-password': 'Mật khẩu chưa đúng.',
    'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự.',
    'auth/operation-not-allowed':
      'Dang ky bang Email/Password chua duoc bat tren Firebase Auth. Vui long bat provider Email/Password.',
    'auth/configuration-not-found': 'Cau hinh Firebase Auth chua dung hoac chua day du.',
    'auth/invalid-api-key': 'Firebase API key khong hop le.',
    'auth/app-not-authorized': 'Ung dung chua duoc cap quyen tren Firebase project.',
    'auth/internal-error': 'Firebase Auth gap loi noi bo. Vui long thu lai.',
    'auth/invalid-profile-attribute':
      'Anh dai dien khong hop le cho Firebase Auth. Vui long dung URL http/https hoac de trong.',
    'auth/too-many-requests': 'Qua nhieu yeu cau trong thoi gian ngan. Vui long thu lai sau.',
    'auth/network-request-failed': 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.',
    'auth/invalid-verification-code': 'Mã OTP chưa đúng.',
    'auth/invalid-verification-id': 'Phiên xác thực không hợp lệ hoặc đã hết hạn.',
    'auth/code-expired': 'Mã OTP đã hết hạn.',
    'auth/missing-display-name': 'Vui lòng nhập tên hiển thị.',
    'auth/otp-send-failed': 'Không thể gửi OTP qua email. Vui lòng thử lại.',
    'auth/otp-email-not-configured': 'Chưa cấu hình dịch vụ gửi OTP email.',
    'auth/otp-emailjs-non-browser-disabled':
      'EmailJS đang chặn môi trường non-browser. Vào EmailJS > Account > Security và bật API access from non-browser environments.',
    'auth/otp-emailjs-strict-mode-private-key-missing':
      'EmailJS đang bật strict mode nhưng chưa có Private Key. Thêm EXPO_PUBLIC_EMAILJS_PRIVATE_KEY hoặc tắt strict mode.',
    'auth/no-current-user': 'Chưa có người dùng đăng nhập.'
  };

  if (messageMap[code]) return messageMap[code];

  if (__DEV__) {
    return `Loi he thong (${code}). Vui long kiem tra cau hinh Firebase/EmailJS.`;
  }

  return fallback;
};
