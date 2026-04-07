import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { normalizeForSubmit, sanitizeSingleLineInput } from '../services/inputSanitizers';

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const parseDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split('/').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

const parseTime = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split(':').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  const [hours, minutes] = parts;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const DEFAULT_REMINDER_REPEAT = 'Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6';
const DEFAULT_REPEAT_DAYS = [2, 3, 4, 5, 6];
const DEFAULT_FIXED_REPEAT = 'Không lặp lại';
const REMINDER_MODE_FIXED = 'fixed';
const REMINDER_MODE_WEEKLY = 'weekly';
const WEEKDAY_OPTIONS = [
  { value: 2, label: 'Thứ 2', full: 'Thứ 2' },
  { value: 3, label: 'Thứ 3', full: 'Thứ 3' },
  { value: 4, label: 'Thứ 4', full: 'Thứ 4' },
  { value: 5, label: 'Thứ 5', full: 'Thứ 5' },
  { value: 6, label: 'Thứ 6', full: 'Thứ 6' },
  { value: 7, label: 'Thứ 7', full: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật', full: 'Chủ nhật' }
];
const WEEKDAY_ORDER = WEEKDAY_OPTIONS.map((option) => option.value);
const WEEKDAY_TEXT = WEEKDAY_OPTIONS.reduce((acc, option) => ({ ...acc, [option.value]: option.full }), {});

const buildRepeatText = (days) => {
  const normalized = Array.from(new Set(days)).filter((day) => WEEKDAY_ORDER.includes(day));
  if (normalized.length === 0) return DEFAULT_REMINDER_REPEAT;

  const ordered = WEEKDAY_ORDER.filter((day) => normalized.includes(day));
  return ordered.map((day) => WEEKDAY_TEXT[day]).join(', ');
};

const ReminderNewScreen = ({ navigation, route }) => {
  const { pets, createReminder, getPetById } = useAppData();
  const petOptions = useMemo(
    () => (Array.isArray(pets) ? pets.map((pet) => ({ id: pet.id, name: pet.name })).filter((pet) => Boolean(pet.name)) : []),
    [pets]
  );
  const fallbackPetId = useMemo(() => petOptions[0]?.id || '', [petOptions]);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedWeekdays, setSelectedWeekdays] = useState(DEFAULT_REPEAT_DAYS);
  const [repeatMode, setRepeatMode] = useState(REMINDER_MODE_WEEKLY);
  const [fixedDate, setFixedDate] = useState(formatDate(new Date()));
  const [selectedPetId, setSelectedPetId] = useState('');
  const [pickerValue, setPickerValue] = useState(parseTime('08:00') || new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iosHour, setIosHour] = useState(8);
  const [iosMinute, setIosMinute] = useState(0);
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const repeatText = useMemo(() => buildRepeatText(selectedWeekdays), [selectedWeekdays]);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => currentYear - 5 + index);
  }, []);

  const selectedPet = useMemo(
    () => petOptions.find((pet) => pet.id === selectedPetId) || null,
    [petOptions, selectedPetId]
  );
  const selectedPetName = selectedPet?.name || 'Chọn thú cưng';

  useEffect(() => {
    const preselectedPet = getPetById(route?.params?.preselectedPetId);
    if (preselectedPet?.id) {
      setSelectedPetId(preselectedPet.id);
      return;
    }

    if (!selectedPetId && fallbackPetId) {
      setSelectedPetId(fallbackPetId);
    }
  }, [fallbackPetId, getPetById, route?.params?.preselectedPetId, selectedPetId]);

  useEffect(() => {
    const maxDay = getDaysInMonth(pickerMonth, pickerYear);
    if (pickerDay > maxDay) {
      setPickerDay(maxDay);
    }
  }, [pickerDay, pickerMonth, pickerYear]);

  const resetForm = () => {
    setTitle('');
    setTime('08:00');
    setSelectedWeekdays(DEFAULT_REPEAT_DAYS);
    setRepeatMode(REMINDER_MODE_WEEKLY);
    setFixedDate(formatDate(new Date()));
    setSelectedPetId(fallbackPetId);
    setPickerValue(parseTime('08:00') || new Date());
    setIosHour(8);
    setIosMinute(0);
    setPickerDay(new Date().getDate());
    setPickerMonth(new Date().getMonth() + 1);
    setPickerYear(new Date().getFullYear());
  };

  const toggleWeekday = (value) => {
    setSelectedWeekdays((prev) => {
        const exists = prev.includes(value);
        if (exists) {
          const next = prev.filter((day) => day !== value);
          if (next.length === 0) return prev;
          return next;
        }
      return [...prev, value];
    });
  };

  const openTimePicker = () => {
    const baseTime = parseTime(time) || new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: baseTime,
        mode: 'time',
        is24Hour: true,
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          setTime(formatTime(selectedDate));
        }
      });
      return;
    }

    setPickerValue(baseTime);
    setIosHour(baseTime.getHours());
    setIosMinute(baseTime.getMinutes());
    setShowTimePicker(true);
  };

  const confirmIosTime = () => {
    const nextTime = `${String(iosHour).padStart(2, '0')}:${String(iosMinute).padStart(2, '0')}`;
    setTime(nextTime);
    const nextDate = new Date();
    nextDate.setHours(iosHour, iosMinute, 0, 0);
    setPickerValue(nextDate);
    setShowTimePicker(false);
  };

  const openDatePicker = () => {
    const sourceDate = parseDate(fixedDate) || new Date();
    setPickerDay(sourceDate.getDate());
    setPickerMonth(sourceDate.getMonth() + 1);
    setPickerYear(sourceDate.getFullYear());
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const value = `${String(pickerDay).padStart(2, '0')}/${String(pickerMonth).padStart(2, '0')}/${pickerYear}`;
    setFixedDate(value);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const cleanTitle = normalizeForSubmit(title);
    const cleanTime = normalizeForSubmit(time);
    const cleanRepeat = normalizeForSubmit(repeatText);
    const cleanFixedDate = normalizeForSubmit(fixedDate);

    if (!cleanTitle) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề nhắc nhở.');
      return;
    }

    if (!selectedPet) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn thú cưng cho nhắc nhở.');
      return;
    }

    if (repeatMode === REMINDER_MODE_FIXED) {
      const parsed = parseDate(cleanFixedDate);
      if (!parsed) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày nhắc nhở cố định.');
        return;
      }

      const timeParts = parseTime(cleanTime) || new Date();
      const scheduled = new Date(parsed);
      scheduled.setHours(timeParts.getHours(), timeParts.getMinutes(), 0, 0);
      if (scheduled.getTime() <= Date.now()) {
        Alert.alert('Ngày không hợp lệ', 'Vui lòng chọn thời gian trong tương lai.');
        return;
      }
    }

    const payload = {
      title: cleanTitle,
      time: cleanTime,
      repeat: repeatMode === REMINDER_MODE_FIXED ? DEFAULT_FIXED_REPEAT : cleanRepeat || DEFAULT_REMINDER_REPEAT,
      date: repeatMode === REMINDER_MODE_FIXED ? cleanFixedDate : '',
      pet: selectedPet.name,
      petId: selectedPet.id
    };

    setIsSubmitting(true);
    try {
      const result = await createReminder(payload);
      const createdReminder = result?.reminder;
      if (!createdReminder) {
        Alert.alert('Không thể tạo nhắc nhở', 'Vui lòng thử lại sau.');
        return;
      }

      const notificationScheduled = Boolean(result?.notificationScheduled);

      resetForm();

      Alert.alert(
        'Thành công',
        notificationScheduled
          ? 'Đã tạo nhắc nhở mới. Hệ thống sẽ gửi thông báo khi đến giờ đã chọn.'
          : 'Đã tạo nhắc nhở mới. Chưa bật được thông báo, vui lòng kiểm tra quyền Thông báo.',
        [
          {
            text: 'Xem danh sách',
            onPress: () =>
              navigation.navigate('Tabs', {
                screen: 'Reminders',
                params: {
                  resetFilter: true
                }
              })
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo nhắc nhở</Text>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Thông tin nhắc nhở</Text>
        <TextInput
          value={title}
          onChangeText={(value) =>
            setTitle(sanitizeSingleLineInput(value, { maxLength: 120, collapseWhitespace: true }))
          }
          placeholder="Ví dụ: Uống thuốc tim"
          placeholderTextColor={theme.colors.textLight}
          autoCorrect={false}
          style={styles.input}
        />

        <TouchableOpacity style={styles.inputButton} onPress={openTimePicker}>
          <View>
            <Text style={styles.inputButtonLabel}>Giờ nhắc</Text>
            <Text style={styles.inputButtonValue}>{time}</Text>
          </View>
          <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.repeatBlock}>
          <Text style={styles.inputButtonLabel}>Loại nhắc nhở</Text>
          <View style={styles.repeatOptionsRow}>
            <TouchableOpacity
              style={[styles.repeatOption, repeatMode === REMINDER_MODE_FIXED && styles.repeatOptionActive]}
              onPress={() => setRepeatMode(REMINDER_MODE_FIXED)}
            >
              <Text style={[styles.repeatOptionText, repeatMode === REMINDER_MODE_FIXED && styles.repeatOptionTextActive]}>
                Ngày cố định
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatOption, repeatMode === REMINDER_MODE_WEEKLY && styles.repeatOptionActive]}
              onPress={() => setRepeatMode(REMINDER_MODE_WEEKLY)}
            >
              <Text style={[styles.repeatOptionText, repeatMode === REMINDER_MODE_WEEKLY && styles.repeatOptionTextActive]}>
                Lặp theo tuần
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {repeatMode === REMINDER_MODE_FIXED ? (
          <TouchableOpacity style={styles.inputButton} onPress={openDatePicker}>
            <View>
              <Text style={styles.inputButtonLabel}>Ngày nhắc</Text>
              <Text style={styles.inputButtonValue}>{fixedDate}</Text>
            </View>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.repeatBlock}>
            <Text style={styles.inputButtonLabel}>Chọn thứ</Text>
            <View style={styles.repeatOptionsRow}>
              {WEEKDAY_OPTIONS.map((option) => {
                const isActive = selectedWeekdays.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.repeatOption, isActive && styles.repeatOptionActive]}
                    onPress={() => toggleWeekday(option.value)}
                  >
                    <Text style={[styles.repeatOptionText, isActive && styles.repeatOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.inputButton} onPress={() => setShowPetPicker(true)}>
          <View>
            <Text style={styles.inputButtonLabel}>Thú cưng</Text>
            <Text style={styles.inputButtonValue}>{selectedPetName}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={resetForm}>
            <Text style={styles.secondaryActionText}>Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.submitText}>{isSubmitting ? 'Đang tạo...' : 'Tạo nhắc nhở'}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {Platform.OS === 'ios' ? (
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalActionText}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Chọn giờ nhắc</Text>
                <TouchableOpacity onPress={confirmIosTime}>
                  <Text style={styles.modalActionText}>Xong</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeColumns}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnTitle}>Giờ</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <TouchableOpacity
                        key={`hour-${hour}`}
                        style={[styles.timeOption, iosHour === hour && styles.timeOptionActive]}
                        onPress={() => setIosHour(hour)}
                      >
                        <Text style={[styles.timeOptionText, iosHour === hour && styles.timeOptionTextActive]}>
                          {String(hour).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeColumnTitle}>Phút</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 60 }, (_, minute) => (
                      <TouchableOpacity
                        key={`minute-${minute}`}
                        style={[styles.timeOption, iosMinute === minute && styles.timeOptionActive]}
                        onPress={() => setIosMinute(minute)}
                      >
                        <Text style={[styles.timeOptionText, iosMinute === minute && styles.timeOptionTextActive]}>
                          {String(minute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <Modal visible={showPetPicker} transparent animationType="fade" onRequestClose={() => setShowPetPicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPetPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPetPicker(false)}>
                <Text style={styles.modalActionText}>Đóng</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn thú cưng</Text>
              <View style={styles.modalSpacer} />
            </View>

            {petOptions.length === 0 ? (
              <Text style={styles.emptyPickerText}>Bạn chưa có thú cưng nào. Hãy thêm thú cưng trước khi tạo nhắc nhở.</Text>
            ) : (
              petOptions.map((pet) => {
                const isSelected = selectedPetId === pet.id;
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.petOption, isSelected && styles.petOptionActive]}
                    onPress={() => {
                      setSelectedPetId(pet.id);
                      setShowPetPicker(false);
                    }}
                  >
                    <Text style={[styles.petOptionText, isSelected && styles.petOptionTextActive]}>{pet.name}</Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={theme.colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalActionText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày</Text>
              <TouchableOpacity onPress={confirmDate}>
                <Text style={styles.modalActionText}>Xong</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateColumns}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Ngày</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {Array.from({ length: getDaysInMonth(pickerMonth, pickerYear) }, (_, i) => i + 1).map((day) => (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[styles.dateOption, pickerDay === day && styles.dateOptionActive]}
                      onPress={() => setPickerDay(day)}
                    >
                      <Text style={[styles.dateOptionText, pickerDay === day && styles.dateOptionTextActive]}>
                        {String(day).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Tháng</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <TouchableOpacity
                      key={`month-${month}`}
                      style={[styles.dateOption, pickerMonth === month && styles.dateOptionActive]}
                      onPress={() => setPickerMonth(month)}
                    >
                      <Text style={[styles.dateOptionText, pickerMonth === month && styles.dateOptionTextActive]}>
                        {String(month).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Năm</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={`year-${year}`}
                      style={[styles.dateOption, pickerYear === year && styles.dateOptionActive]}
                      onPress={() => setPickerYear(year)}
                    >
                      <Text style={[styles.dateOptionText, pickerYear === year && styles.dateOptionTextActive]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  formCard: {
    marginTop: theme.spacing.md
  },
  formTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: theme.colors.text
  },
  inputButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inputButtonLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: 2
  },
  inputButtonValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  repeatBlock: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10
  },
  repeatOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  repeatOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF'
  },
  repeatOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  repeatOptionText: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    fontWeight: '600'
  },
  repeatOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  secondaryAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8
  },
  secondaryActionText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  submitText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs
  },
  modalTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text
  },
  modalActionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700'
  },
  dateColumns: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    maxHeight: 300
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 6
  },
  dateColumnTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600'
  },
  dateOption: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F3F4F6'
  },
  dateOptionActive: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  dateOptionText: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  dateOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  modalSpacer: {
    width: 40
  },
  emptyPickerText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm
  },
  petOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  petOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  petOptionText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  petOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  timeColumns: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    maxHeight: 280
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 6
  },
  timeColumnTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600'
  },
  timeOption: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F3F4F6'
  },
  timeOptionActive: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  timeOptionText: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  timeOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  }
});

export default ReminderNewScreen;
