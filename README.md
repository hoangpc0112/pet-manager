# ANDROID PET MANAGER

## 🚀 Hướng dẫn cài đặt

```bash
npm i
npx expo start
```

## OTP email khi đăng ký

App da duoc doi sang luong dang ky: nhap thong tin -> gui OTP qua email -> xac thuc OTP -> tao tai khoan.

De gui OTP that qua email, cau hinh cac bien moi truong Expo sau:

- EXPO_PUBLIC_EMAILJS_SERVICE_ID
- EXPO_PUBLIC_EMAILJS_TEMPLATE_ID
- EXPO_PUBLIC_EMAILJS_PUBLIC_KEY
- EXPO_PUBLIC_EMAILJS_PRIVATE_KEY (chi can khi bat strict mode)

Can bat them trong EmailJS:

- Account -> Security -> API access from non-browser environments -> Enable
- Neu bat strict mode, can tao Private Key va them EXPO_PUBLIC_EMAILJS_PRIVATE_KEY

Neu chua cau hinh ba bien tren:

- Che do development (`__DEV__`) se hien ma OTP demo tren man hinh xac thuc.
- Che do production se bao loi cau hinh OTP email.