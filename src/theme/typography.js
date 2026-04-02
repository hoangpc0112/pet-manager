import { Platform } from 'react-native';

const headingFont = Platform.select({
  ios: 'sans-serif-medium',
  android: 'sans-serif-medium',
  default: 'System'
});

const bodyFont = Platform.select({
  ios: 'sans-serif',
  android: 'sans-serif',
  default: 'System'
});

const typography = {
  h1: { fontSize: 30, fontWeight: '700', fontFamily: headingFont },
  h2: { fontSize: 25, fontWeight: '700', fontFamily: headingFont },
  h3: { fontSize: 20, fontWeight: '700', fontFamily: headingFont },
  body: { fontSize: 18, fontWeight: '500', fontFamily: bodyFont },
  bodyRegular: { fontSize: 18, fontWeight: '400', fontFamily: bodyFont },
  caption: { fontSize: 15, fontWeight: '400', fontFamily: bodyFont },
  small: { fontSize: 13, fontWeight: '400', fontFamily: bodyFont }
};

export default typography;
