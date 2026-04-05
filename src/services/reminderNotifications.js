import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_SOUND = true;

const isExpoGo = Constants.executionEnvironment === 'storeClient';

const getNotificationsModule = async () => {
  if (isExpoGo) return null;

  try {
    return await import('expo-notifications');
  } catch (_error) {
    return null;
  }
};

const parseTimeToParts = (timeText) => {
  if (!timeText || typeof timeText !== 'string') return { hour: 8, minute: 0 };
  const [hourText, minuteText] = timeText.split(':');
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return { hour: 8, minute: 0 };
  }

  return {
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute))
  };
};

const parseWeekdayTriggers = (repeatText) => {
  const text = String(repeatText || '').toLowerCase();
  const regex = /thứ\s*(\d)/g;
  const weekdays = [];
  let match = regex.exec(text);

  while (match) {
    const vnWeekday = Number.parseInt(match[1], 10);
    if (Number.isFinite(vnWeekday) && vnWeekday >= 2 && vnWeekday <= 7) {
      weekdays.push(vnWeekday);
    }
    match = regex.exec(text);
  }

  const unique = Array.from(new Set(weekdays));
  if (unique.length === 0) return [];

  return unique.map((vnWeekday) => {
    // Expo notifications weekday in this app should be mapped as Monday=1 ... Sunday=7.
    // Vietnamese labels are Thu 2..Thu 7 (Monday..Saturday), so shift by -1.
    return vnWeekday - 1;
  });
};

const getReminderContent = (reminder) => ({
  title: reminder?.title || 'Nhắc nhở chăm sóc thú cưng',
  body: [reminder?.pet, reminder?.repeat].filter(Boolean).join(' • '),
  sound: DEFAULT_SOUND,
  data: {
    reminderId: reminder?.id || ''
  }
});

export const ensureReminderNotificationPermission = async () => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (current.canAskAgain === false) return false;

  const next = await Notifications.requestPermissionsAsync();
  return Boolean(next.granted);
};

export const scheduleReminderNotifications = async (reminder) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return [];

  const granted = await ensureReminderNotificationPermission();
  if (!granted) return [];

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminder-default', {
      name: 'Nhắc nhở thú cưng',
      importance: Notifications.AndroidImportance.HIGH,
      sound: DEFAULT_SOUND ? 'default' : undefined
    });
  }

  const { hour, minute } = parseTimeToParts(reminder?.time);
  const content = getReminderContent(reminder);
  const repeatText = String(reminder?.repeat || '').toLowerCase();

  const weekdayTriggers = parseWeekdayTriggers(repeatText);
  if (weekdayTriggers.length > 0) {
    const ids = await Promise.all(
      weekdayTriggers.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            channelId: Platform.OS === 'android' ? 'reminder-default' : undefined,
            weekday,
            hour,
            minute,
            repeats: true
          }
        })
      )
    );
    return ids.filter(Boolean);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      channelId: Platform.OS === 'android' ? 'reminder-default' : undefined,
      hour,
      minute,
      repeats: true
    }
  });

  return id ? [id] : [];
};

export const cancelReminderNotifications = async (notificationIds) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  const ids = Array.isArray(notificationIds) ? notificationIds : [];
  if (ids.length === 0) return;

  await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (_error) {
        // Ignore canceled/invalid ids.
      }
    })
  );
};
