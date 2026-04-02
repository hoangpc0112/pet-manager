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

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const parseTime = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split(':').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  const [hours, minutes] = parts;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const ReminderNewScreen = ({ navigation, route }) => {
  const { pets, createReminder, getPetById } = useAppData();
  const fallbackPetName = useMemo(() => pets[0]?.name || '', [pets]);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [repeat, setRepeat] = useState('Mỗi ngày');
  const [petName, setPetName] = useState('');
  const [pickerValue, setPickerValue] = useState(parseTime('08:00') || new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [iosHour, setIosHour] = useState(8);
  const [iosMinute, setIosMinute] = useState(0);

  useEffect(() => {
    const preselectedPet = getPetById(route?.params?.preselectedPetId);
    if (preselectedPet?.name) {
      setPetName(preselectedPet.name);
      return;
    }

    if (!petName && fallbackPetName) {
      setPetName(fallbackPetName);
    }
  }, [fallbackPetName, getPetById, petName, route?.params?.preselectedPetId]);

  const resetForm = () => {
    setTitle('');
    setTime('08:00');
    setRepeat('Mỗi ngày');
    setPetName(fallbackPetName);
    setPickerValue(parseTime('08:00') || new Date());
    setIosHour(8);
    setIosMinute(0);
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

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề nhắc nhở.');
      return;
    }

    const payload = {
      title: title.trim(),
      time: time.trim(),
      repeat: repeat.trim() || 'Mỗi ngày',
      pet: petName.trim() || 'Tất cả'
    };

    createReminder(payload);
    resetForm();

    Alert.alert('Thành công', 'Đã tạo nhắc nhở mới.', [
      {
        text: 'Xem danh sách',
        onPress: () => navigation.navigate('Tabs', { screen: 'Reminders' })
      }
    ]);
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
          onChangeText={setTitle}
          placeholder="Ví dụ: Uống thuốc tim"
          placeholderTextColor={theme.colors.textLight}
          style={styles.input}
        />

        <TouchableOpacity style={styles.inputButton} onPress={openTimePicker}>
          <View>
            <Text style={styles.inputButtonLabel}>Giờ nhắc</Text>
            <Text style={styles.inputButtonValue}>{time}</Text>
          </View>
          <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TextInput
          value={repeat}
          onChangeText={setRepeat}
          placeholder="Lặp lại"
          placeholderTextColor={theme.colors.textLight}
          style={styles.input}
        />
        <TextInput
          value={petName}
          onChangeText={setPetName}
          placeholder="Tên thú cưng"
          placeholderTextColor={theme.colors.textLight}
          style={styles.input}
        />

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={resetForm}>
            <Text style={styles.secondaryActionText}>Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Tạo nhắc nhở</Text>
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
