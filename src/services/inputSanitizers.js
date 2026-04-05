const toStringValue = (value) => (typeof value === 'string' ? value : String(value || ''));

const limitLength = (value, maxLength) => {
  if (!Number.isInteger(maxLength) || maxLength <= 0) return value;
  return value.slice(0, maxLength);
};

export const sanitizeSingleLineInput = (value, options = {}) => {
  const { maxLength, collapseWhitespace = false } = options;

  let nextValue = toStringValue(value).replace(/[\r\n]+/g, ' ');
  if (collapseWhitespace) {
    nextValue = nextValue.replace(/\s+/g, ' ');
  }

  return limitLength(nextValue, maxLength);
};

export const sanitizeMultilineInput = (value, options = {}) => {
  const { maxLength } = options;
  const nextValue = toStringValue(value).replace(/\r\n/g, '\n');
  return limitLength(nextValue, maxLength);
};

export const sanitizeEmailInput = (value) =>
  limitLength(toStringValue(value).replace(/\s+/g, '').toLowerCase(), 120);

export const sanitizeOtpInput = (value, length = 6) =>
  toStringValue(value)
    .replace(/\D/g, '')
    .slice(0, length);

export const sanitizePhoneInput = (value, maxLength = 20) => {
  let nextValue = toStringValue(value)
    .replace(/[^\d+()\-\s]/g, '')
    .replace(/\s+/g, ' ')
    .trimStart();

  if (nextValue.includes('+')) {
    nextValue = `+${nextValue.replace(/\+/g, '').trimStart()}`;
  }

  return limitLength(nextValue, maxLength);
};

export const sanitizeDecimalInput = (value, options = {}) => {
  const { maxLength = 6 } = options;
  const rawValue = toStringValue(value).replace(',', '.');

  let result = '';
  let hasDot = false;

  for (const char of rawValue) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }

    if (char === '.' && !hasDot) {
      result += char;
      hasDot = true;
    }
  }

  return limitLength(result, maxLength);
};

export const sanitizeDateInput = (value) => {
  const digitsOnly = toStringValue(value).replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
};

export const normalizeForSubmit = (value) => toStringValue(value).trim();
