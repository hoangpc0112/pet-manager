import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const speciesOptions = [
  { label: 'Cho', value: 'dog' },
  { label: 'Meo', value: 'cat' },
  { label: 'Khac', value: 'other' }
];

const genderOptions = ['Duc', 'Cai', 'Chua ro'];

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
  const { getPetById, updatePet } = useAppData();
  const petId = route?.params?.petId;
  const selectedPet = getPetById(petId);

  const [name, setName] = useState(selectedPet?.name || '');
  const [species, setSpecies] = useState(selectedPet?.species || 'dog');
  const [breed, setBreed] = useState(selectedPet?.breed || '');
  const [gender, setGender] = useState(selectedPet?.gender || 'Duc');
  const [birth, setBirth] = useState(parseBirth(selectedPet?.age));
  const [weight, setWeight] = useState(parseWeight(selectedPet?.weight));
  const [imageUri, setImageUri] = useState(selectedPet?.imageUrl || '');
  const [imageUploadValue, setImageUploadValue] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPet = useMemo(() => Boolean(selectedPet), [selectedPet]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Can quyen truy cap', 'Vui long cap quyen thu vien anh de chon anh thu cung.');
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
      Alert.alert('Khong tim thay', 'Khong tim thay thu cung can sua.');
      navigation.goBack();
      return;
    }

    if (!name.trim() || !breed.trim()) {
      Alert.alert('Thieu thong tin', 'Vui long nhap ten va giong thu cung.');
      return;
    }

    setIsSubmitting(true);
    const nextImageUrl = removeImage
      ? 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop'
      : imageUploadValue || selectedPet.imageUrl;

    const updatedPet = updatePet(selectedPet.id, {
      name: name.trim(),
      breed: breed.trim(),
      species,
      gender,
      age: birth.trim() ? `Sinh: ${birth.trim()}` : 'Chua ro tuoi',
      weight: weight.trim() ? `${weight.trim()} kg` : 'Chua ro',
      imageUrl: nextImageUrl
    });

    setIsSubmitting(false);

    if (!updatedPet) {
      Alert.alert('Khong the cap nhat', 'Khong tim thay thu cung can sua.');
      return;
    }

    Alert.alert('Thanh cong', 'Da cap nhat thong tin thu cung.', [
      {
        text: 'Xem chi tiet',
        onPress: () => navigation.replace('PetDetail', { petId: updatedPet.id })
      },
      {
        text: 'Dong',
        style: 'cancel'
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
          <Text style={styles.headerTitle}>Sua thu cung</Text>
          <View style={styles.savePlaceholder} />
        </View>
        <Card style={styles.card}>
          <Text style={styles.emptyText}>Khong tim thay thu cung can sua.</Text>
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
        <Text style={styles.headerTitle}>Sua thu cung</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          <Text style={styles.save}>{isSubmitting ? 'Dang luu...' : 'Luu'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickImage} activeOpacity={0.85}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="camera" size={26} color={theme.colors.textLight} />
              <Text style={styles.photoText}>Them anh</Text>
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
            <Text style={styles.removeImageText}>Xoa anh</Text>
          </TouchableOpacity>
        ) : null}

        <Field label="Ten thu cung">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nhap ten"
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Loai">
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

        <Field label="Giong">
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="Nhap giong"
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Gioi tinh">
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

        <Field label="Ngay sinh">
          <TextInput
            value={birth}
            onChangeText={setBirth}
            placeholder="Nhap ngay sinh"
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </Field>

        <Field label="Can nang (kg)">
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="Nhap can nang"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="numeric"
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
