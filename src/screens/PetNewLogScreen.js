import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { normalizeForSubmit, sanitizeMultilineInput, sanitizeSingleLineInput } from '../services/inputSanitizers';

const categories = ['Sức khỏe', 'Dinh dưỡng', 'Vệ sinh', 'Vận động', 'Khác'];

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

const Field = ({ label, children }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      {children}
    </View>
  );
};

const PetNewLogScreen = ({ navigation, route }) => {
  const { pets, saveJournalEntry, petLogFormDefaults } = useAppData();
  const formDefaults = petLogFormDefaults || {};
  const initialPetId = route?.params?.preselectedPetId || pets[0]?.id || '';
  const [title, setTitle] = useState('');
  const [petId, setPetId] = useState(initialPetId);
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(formatDate(new Date()));
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => currentYear - 5 + index);
  }, []);

  const selectedPet = useMemo(() => pets.find((item) => item.id === petId), [pets, petId]);

  useEffect(() => {
    if (!petId && pets.length > 0) {
      setPetId(pets[0].id);
    }
  }, [pets, petId]);

  useEffect(() => {
    const maxDay = getDaysInMonth(pickerMonth, pickerYear);
    if (pickerDay > maxDay) {
      setPickerDay(maxDay);
    }
  }, [pickerDay, pickerMonth, pickerYear]);

  const openDatePicker = () => {
    const sourceDate = parseDate(date) || new Date();
    setPickerDay(sourceDate.getDate());
    setPickerMonth(sourceDate.getMonth() + 1);
    setPickerYear(sourceDate.getFullYear());
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const value = `${String(pickerDay).padStart(2, '0')}/${String(pickerMonth).padStart(2, '0')}/${pickerYear}`;
    setDate(value);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    const cleanTitle = normalizeForSubmit(title);
    const cleanNote = normalizeForSubmit(note);
    const cleanDate = normalizeForSubmit(date);

    if (!cleanTitle || !cleanNote || !selectedPet) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề, chọn thú cưng và ghi chú.');
      return;
    }

    saveJournalEntry({
      title: cleanTitle,
      pet: selectedPet.name,
      date: cleanDate || new Date().toLocaleDateString('vi-VN'),
      note: cleanNote,
      category
    });

    Alert.alert('Thành công', 'Đã lưu nhật ký mới.', [
      {
        text: 'Xem Nhật ký',
        onPress: () => navigation.navigate('Tabs', { screen: 'Journal' })
      },
      {
        text: 'Ở lại',
        style: 'cancel'
      }
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm nhật ký</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Field label="Tiêu đề">
          <TextInput
            value={title}
            onChangeText={(value) =>
              setTitle(sanitizeSingleLineInput(value, { maxLength: 120, collapseWhitespace: true }))
            }
            placeholder={formDefaults.titlePlaceholder}
            placeholderTextColor={theme.colors.textLight}
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Thú cưng">
          <View style={styles.choiceRow}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.choiceChip, pet.id === petId && styles.choiceChipActive]}
                onPress={() => setPetId(pet.id)}
              >
                <Text style={[styles.choiceChipText, pet.id === petId && styles.choiceChipTextActive]}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Danh mục">
          <View style={styles.choiceRow}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.choiceChip, item === category && styles.choiceChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.choiceChipText, item === category && styles.choiceChipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Ngày">
          <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
            <Text style={styles.dateButtonText}>{date || formDefaults.dateValue || 'Chọn ngày'}</Text>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Field>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Ghi chú <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={note}
            onChangeText={(value) => setNote(sanitizeMultilineInput(value, { maxLength: 3000 }))}
            placeholder={formDefaults.notePlaceholder}
            placeholderTextColor={theme.colors.textLight}
            multiline
            autoCorrect={false}
            style={[styles.fieldInput, styles.textArea]}
            textAlignVertical="top"
          />
        </View>
      </Card>

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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '600'
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text
  },
  save: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  card: {
    marginTop: theme.spacing.lg
  },
  fieldBlock: {
    marginBottom: theme.spacing.lg
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  required: {
    color: theme.colors.danger
  },
  fieldInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    color: theme.colors.text
  },
  dateButton: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dateButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  choiceChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF'
  },
  choiceChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  choiceChipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  choiceChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  textArea: {
    height: 140,
    alignItems: 'flex-start'
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
  }
});

export default PetNewLogScreen;




