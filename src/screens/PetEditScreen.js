import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import {
  normalizeForSubmit,
  isValidVnDate,
  sanitizeDateInput,
  sanitizeDecimalInput,
  sanitizeSingleLineInput
} from '../services/inputSanitizers';

const speciesOptions = [
  { label: 'Chó', value: 'dog' },
  { label: 'Mèo', value: 'cat' },
  { label: 'Khác', value: 'other' }
];

const genderOptions = ['Đực', 'Cái', 'Chưa rõ'];

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

const parseBirth = (ageText) => {
  const value = String(ageText || '').trim();
  return value.startsWith('Sinh: ') ? value.replace('Sinh: ', '') : '';
};

const parseWeight = (weightText) => {
  const value = String(weightText || '').trim();
  return value.endsWith(' kg') ? value.replace(/\s*kg$/, '') : '';
};

const Field = ({ label, children }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      {children}
    </View>
  );
};

const PetEditScreen = ({ navigation, route }) => {
  const { getPetById, updatePet, deletePet } = useAppData();
  const petId = route?.params?.petId;
  const selectedPet = getPetById(petId);

  const [name, setName] = useState(selectedPet?.name || '');
  const [species, setSpecies] = useState(selectedPet?.species || 'dog');
  const [breed, setBreed] = useState(selectedPet?.breed || '');
  const [speciesOther, setSpeciesOther] = useState(selectedPet?.speciesDetail || '');
  const [gender, setGender] = useState(selectedPet?.gender || 'Duc');
  const [birth, setBirth] = useState(parseBirth(selectedPet?.age));
  const [weight, setWeight] = useState(parseWeight(selectedPet?.weight));
  const [imageUri, setImageUri] = useState(selectedPet?.imageUrl || '');
  const [imageUploadValue, setImageUploadValue] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const yearOptions = useMemo(
    () => Array.from({ length: 51 }, (_, index) => currentYear - index),
    [currentYear]
  );

  const maxMonth = pickerYear === currentYear ? currentMonth : 12;
  const maxDay = pickerYear === currentYear && pickerMonth === currentMonth
    ? currentDay
    : getDaysInMonth(pickerMonth, pickerYear);

  useEffect(() => {
    if (pickerMonth > maxMonth) {
      setPickerMonth(maxMonth);
    }
  }, [maxMonth, pickerMonth]);

  useEffect(() => {
    if (pickerDay > maxDay) {
      setPickerDay(maxDay);
    }
  }, [maxDay, pickerDay]);

  const hasPet = useMemo(() => Boolean(selectedPet), [selectedPet]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để chọn ảnh thú cưng.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const nextValue = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri || '';
      setImageUri(asset.uri || nextValue);
      setImageUploadValue(nextValue);
      setRemoveImage(false);
    }
  };

  const handleSave = () => {
    if (!selectedPet) {
      Alert.alert('Không tìm thấy', 'Không tìm thấy thú cưng cần sửa.');
      navigation.goBack();
      return;
    }

    const cleanName = normalizeForSubmit(name);
    const cleanBreed = normalizeForSubmit(breed);
    const cleanBirth = normalizeForSubmit(birth);
    const cleanSpeciesOther = normalizeForSubmit(speciesOther);
    const cleanWeight = normalizeForSubmit(weight);

    if (!cleanName || !cleanBreed) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên và giống thú cưng.');
      return;
    }

    if (species === 'other' && !cleanSpeciesOther) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập loại khác cho thú cưng.');
      return;
    }

    if (cleanBirth && !isValidVnDate(cleanBirth)) {
      Alert.alert('Ngày sinh không hợp lệ', 'Vui lòng nhập dd/mm/yyyy và là ngày hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    const nextImageUrl = removeImage
      ? 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop'
      : imageUploadValue || selectedPet.imageUrl;

    const updatedPet = updatePet(selectedPet.id, {
      name: cleanName,
      breed: cleanBreed,
      species,
      speciesDetail: species === 'other' ? cleanSpeciesOther : '',
      gender,
      age: cleanBirth ? `Sinh: ${cleanBirth}` : 'Chưa rõ tuổi',
      weight: cleanWeight ? `${cleanWeight} kg` : 'Chưa rõ cân nặng',
      imageUrl: nextImageUrl
    });

    setIsSubmitting(false);

    if (!updatedPet) {
      Alert.alert('Không thể cập nhật', 'Không tìm thấy thú cưng cần sửa.');
      return;
    }

    Alert.alert('Thành công', 'Đã cập nhật thông tin thú cưng.', [
      {
        text: 'Xem chi tiết',
        onPress: () => navigation.replace('PetDetail', { petId: updatedPet.id })
      },
      {
        text: 'Đóng',
        style: 'cancel'
      }
    ]);
  };

  const handleDelete = () => {
    if (!selectedPet) return;

    Alert.alert('Xóa thú cưng', 'Bạn có chắc muốn xóa thú cưng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const removed = deletePet(selectedPet.id);
          if (!removed) {
            Alert.alert('Không thể xóa', 'Không tìm thấy thú cưng cần xóa.');
            return;
          }
          navigation.navigate('Tabs', { screen: 'Pets' });
        }
      }
    ]);
  };

  if (!hasPet) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sửa thú cưng</Text>
          <View style={styles.savePlaceholder} />
        </View>
        <Card style={styles.card}>
          <Text style={styles.emptyText}>Không tìm thấy thú cưng cần sửa.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa thú cưng</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          <Text style={styles.save}>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickImage} activeOpacity={0.85}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="camera" size={26} color={theme.colors.textLight} />
              <Text style={styles.photoText}>Thêm ảnh</Text>
            </>
          )}
        </TouchableOpacity>

        {imageUri ? (
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => {
              setImageUri('');
              setImageUploadValue('');
              setRemoveImage(true);
            }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            <Text style={styles.removeImageText}>Xóa ảnh</Text>
          </TouchableOpacity>
        ) : null}

        <Field label="Tên thú cưng">
          <TextInput
            value={name}
            onChangeText={(value) =>
              setName(sanitizeSingleLineInput(value, { maxLength: 60, collapseWhitespace: true }))
            }
            placeholder="Nhập tên"
            placeholderTextColor={theme.colors.textLight}
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Loại">
          <View style={styles.choiceRow}>
            {speciesOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.choiceChip, option.value === species && styles.choiceChipActive]}
                onPress={() => {
                  setSpecies(option.value);
                  if (option.value !== 'other') {
                    setSpeciesOther('');
                  }
                }}
              >
                <Text style={[styles.choiceChipText, option.value === species && styles.choiceChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {species === 'other' ? (
          <Field label="Loại khác">
            <TextInput
              value={speciesOther}
              onChangeText={(value) =>
                setSpeciesOther(sanitizeSingleLineInput(value, { maxLength: 60, collapseWhitespace: true }))
              }
              placeholder="Nhập loại khác"
              placeholderTextColor={theme.colors.textLight}
              autoCorrect={false}
              style={styles.fieldInput}
            />
          </Field>
        ) : null}

        <Field label="Giống">
          <TextInput
            value={breed}
            onChangeText={(value) =>
              setBreed(sanitizeSingleLineInput(value, { maxLength: 80, collapseWhitespace: true }))
            }
            placeholder="Nhập giống"
            placeholderTextColor={theme.colors.textLight}
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Giới tính">
          <View style={styles.choiceRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.choiceChip, option === gender && styles.choiceChipActive]}
                onPress={() => setGender(option)}
              >
                <Text style={[styles.choiceChipText, option === gender && styles.choiceChipTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Ngày sinh">
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const sourceDate = parseDate(birth) || today;
              const safeDate = sourceDate.getTime() > today.getTime() ? today : sourceDate;
              setPickerDay(safeDate.getDate());
              setPickerMonth(safeDate.getMonth() + 1);
              setPickerYear(safeDate.getFullYear());
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>{birth || 'Chọn ngày sinh'}</Text>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Field>

        <Field label="Cân nặng (kg)">
          <TextInput
            value={weight}
            onChangeText={(value) => setWeight(sanitizeDecimalInput(value, { maxLength: 6 }))}
            placeholder="Nhập cân nặng"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="numeric"
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          <Text style={styles.deleteButtonText}>Xóa thú cưng</Text>
        </TouchableOpacity>
      </Card>

      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalActionText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity
                onPress={() => {
                  const value = `${String(pickerDay).padStart(2, '0')}/${String(pickerMonth).padStart(2, '0')}/${pickerYear}`;
                  const selected = parseDate(value) || today;
                  if (selected.getTime() > today.getTime()) {
                    setBirth(formatDate(today));
                  } else {
                    setBirth(value);
                  }
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalActionText}>Xong</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateColumns}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>Ngày</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => (
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
                  {Array.from({ length: maxMonth }, (_, i) => i + 1).map((month) => (
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
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text
  },
  save: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  savePlaceholder: {
    width: 28
  },
  card: {
    marginTop: theme.spacing.lg
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  photoBox: {
    height: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
    marginBottom: theme.spacing.lg
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },
  photoText: {
    color: theme.colors.textLight,
    marginTop: 8
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: theme.spacing.md
  },
  removeImageText: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginLeft: 4,
    fontWeight: '600'
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: theme.spacing.md
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  modalTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  modalActionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700'
  },
  dateColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  dateColumn: {
    flex: 1,
    maxHeight: 240
  },
  dateColumnTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '700',
    textAlign: 'center'
  },
  dateOption: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  dateOptionActive: {
    backgroundColor: theme.colors.primarySoft
  },
  dateOptionText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  dateOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  deleteButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '700',
    marginLeft: 6
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
  }
});

export default PetEditScreen;
