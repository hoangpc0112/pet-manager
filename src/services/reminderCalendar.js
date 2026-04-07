import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

const parseTimeToParts = (timeText) => {
  if (!timeText || typeof timeText !== 'string') return { hour: 8, minute: 0 };

  const [hourText, minuteText] = timeText.split(':');
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return { hour: 8, minute: 0 };
  }

  return {
    hour: Math.max(0, Math.min(23, hour)),
    minute: Math.max(0, Math.min(59, minute))
  };
};

const parseDateToParts = (dateText) => {
  if (!dateText || typeof dateText !== 'string') return null;
  const parts = dateText.split('/').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [day, month, year] = parts;
  return { day, month, year };
};

const parseVnWeekdays = (repeatText) => {
  const text = String(repeatText || '').toLowerCase();
  const regex = /thứ\s*(\d)/g;
  const values = [];
  let match = regex.exec(text);

  while (match) {
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value >= 2 && value <= 7) {
      values.push(value);
    }
    match = regex.exec(text);
  }

  if (text.includes('chủ nhật') || text.includes('chu nhat')) {
    values.push(8);
  }

  return Array.from(new Set(values));
};

const toExpoWeekday = (vnWeekday) => {
  // Expo Calendar: 1 Sunday, 2 Monday ... 7 Saturday
  if (vnWeekday === 8) return 1;
  if (vnWeekday === 2) return 2;
  if (vnWeekday === 3) return 3;
  if (vnWeekday === 4) return 4;
  if (vnWeekday === 5) return 5;
  if (vnWeekday === 6) return 6;
  if (vnWeekday === 7) return 7;
  return null;
};

const buildStartDate = (timeText, dateText) => {
  const { hour, minute } = parseTimeToParts(timeText);
  const now = new Date();
  const dateParts = parseDateToParts(dateText);
  const startDate = dateParts
    ? new Date(dateParts.year, dateParts.month - 1, dateParts.day)
    : new Date(now);

  startDate.setHours(hour, minute, 0, 0);

  if (!dateParts && startDate.getTime() <= now.getTime()) {
    startDate.setDate(startDate.getDate() + 1);
  }

  return startDate;
};

const resolveCalendarId = async () => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const editable = calendars.find((item) => item?.allowsModifications);
  if (editable?.id) return editable.id;

  if (Platform.OS === 'ios') {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar?.id) return defaultCalendar.id;
  }

  throw new Error('No writable calendar available');
};

const buildRecurrenceRule = (repeatText) => {
  const text = String(repeatText || '').toLowerCase();
  if (text.includes('khong lap lai') || text.includes('không lặp lại') || text.includes('mot lan') || text.includes('một lần')) {
    return null;
  }

  const vnWeekdays = parseVnWeekdays(text);

  if (vnWeekdays.length > 0) {
    const daysOfTheWeek = vnWeekdays
      .map((day) => toExpoWeekday(day))
      .filter(Boolean)
      .map((day) => ({ dayOfTheWeek: day }));

    return {
      frequency: Calendar.Frequency.WEEKLY,
      daysOfTheWeek
    };
  }

  if (text.includes('mỗi tuần') || text.includes('hang tuan')) {
    return {
      frequency: Calendar.Frequency.WEEKLY,
      interval: 1
    };
  }

  return {
    frequency: Calendar.Frequency.DAILY,
    interval: 1
  };
};

export const ensureCalendarPermission = async () => {
  const current = await Calendar.getCalendarPermissionsAsync();
  if (current.granted) return true;
  if (current.canAskAgain === false) return false;

  const next = await Calendar.requestCalendarPermissionsAsync();
  return Boolean(next.granted);
};

export const createReminderCalendarEvent = async (reminder) => {
  const granted = await ensureCalendarPermission();
  if (!granted) return '';

  const calendarId = await resolveCalendarId();
  const startDate = buildStartDate(reminder?.time, reminder?.date);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const recurrenceRule = buildRecurrenceRule(reminder?.repeat);
  const eventId = await Calendar.createEventAsync(calendarId, {
    title: reminder?.title || 'Nhắc nhở chăm sóc thú cưng',
    notes: [reminder?.pet, reminder?.repeat].filter(Boolean).join(' • '),
    startDate,
    endDate,
    timeZone: timezone,
    alarms: [{ relativeOffset: -5 }],
    ...(recurrenceRule ? { recurrenceRule } : {})
  });

  return eventId || '';
};

export const deleteReminderCalendarEvent = async (eventId) => {
  if (!eventId) return;

  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (_error) {
    // Ignore missing/deleted events.
  }
};
