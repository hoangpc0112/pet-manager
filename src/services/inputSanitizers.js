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

export const isValidVnDate = (value, options = {}) => {
  const { minYear = 1900, maxYear = new Date().getFullYear(), allowFuture = false } = options;
  const text = toStringValue(value).trim();
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (year < minYear || year > maxYear) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  if (!allowFuture && date.getTime() > Date.now()) return false;
  return true;
};

export const normalizeForSubmit = (value) => toStringValue(value).trim();
