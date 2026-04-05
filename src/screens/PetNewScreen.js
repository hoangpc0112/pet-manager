import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import {
  normalizeForSubmit,
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

const Field = ({ label, children }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      {children}
    </View>
  );
};

const PetNewScreen = ({ navigation }) => {
  const { addPet, petNewFormDefaults } = useAppData();
  const formDefaults = petNewFormDefaults || {};
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Đực');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageDataUri, setImageDataUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setImageUri(asset.uri || '');
      setImageDataUri(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : '');
    }
  };

  const handleSave = () => {
    const cleanName = normalizeForSubmit(name);
    const cleanBreed = normalizeForSubmit(breed);
    const cleanBirth = normalizeForSubmit(birth);
    const cleanWeight = normalizeForSubmit(weight);

    if (!cleanName || !cleanBreed) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên và giống thú cưng.');
      return;
    }

    setIsSubmitting(true);

    addPet({
      name: cleanName,
      breed: cleanBreed,
      species,
      gender,
      age: cleanBirth ? `Sinh: ${cleanBirth}` : 'Chưa rõ tuổi',
      weight: cleanWeight ? `${cleanWeight} kg` : 'Chưa rõ',
      imageUrl: imageDataUri || undefined
    });

    setIsSubmitting(false);
    Alert.alert('Thành công', 'Đã thêm thú cưng mới.', [
      {
        text: 'Về danh sách',
        onPress: () => navigation.navigate('Tabs', { screen: 'Pets' })
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
        <Text style={styles.headerTitle}>Thêm thú cưng</Text>
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
              setImageDataUri('');
            }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            <Text style={styles.removeImageText}>Xoá ảnh</Text>
          </TouchableOpacity>
        ) : null}

        <Field label="Tên thú cưng">
          <TextInput
            value={name}
            onChangeText={(value) =>
              setName(sanitizeSingleLineInput(value, { maxLength: 60, collapseWhitespace: true }))
            }
            placeholder={formDefaults.namePlaceholder}
            placeholderTextColor={theme.colors.textLight}
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Loài">
          <View style={styles.choiceRow}>
            {speciesOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.choiceChip, option.value === species && styles.choiceChipActive]}
                onPress={() => setSpecies(option.value)}
              >
                <Text style={[styles.choiceChipText, option.value === species && styles.choiceChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Giống">
          <TextInput
            value={breed}
            onChangeText={(value) =>
              setBreed(sanitizeSingleLineInput(value, { maxLength: 80, collapseWhitespace: true }))
            }
            placeholder={formDefaults.breedPlaceholder}
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
          <TextInput
            value={birth}
            onChangeText={(value) => setBirth(sanitizeDateInput(value))}
            placeholder={formDefaults.birthPlaceholder}
            placeholderTextColor={theme.colors.textLight}
            keyboardType="number-pad"
            maxLength={10}
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Cân nặng (kg)">
          <TextInput
            value={weight}
            onChangeText={(value) => setWeight(sanitizeDecimalInput(value, { maxLength: 6 }))}
            placeholder={formDefaults.weightPlaceholder}
            placeholderTextColor={theme.colors.textLight}
            keyboardType="numeric"
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </Field>
      </Card>
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

export default PetNewScreen;




