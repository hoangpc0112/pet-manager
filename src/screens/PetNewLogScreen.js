import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const categories = ['Sức khỏe', 'Dinh dưỡng', 'Vệ sinh', 'Vận động', 'Khác'];

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
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [note, setNote] = useState('');

  const selectedPet = useMemo(() => pets.find((item) => item.id === petId), [pets, petId]);

  useEffect(() => {
    if (!petId && pets.length > 0) {
      setPetId(pets[0].id);
    }
  }, [pets, petId]);

  const handleSave = () => {
    if (!title.trim() || !note.trim() || !selectedPet) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề, chọn thú cưng và ghi chú.');
      return;
    }

    saveJournalEntry({
      title: title.trim(),
      pet: selectedPet.name,
      date: date.trim() || new Date().toLocaleDateString('vi-VN'),
      note: note.trim(),
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
            onChangeText={setTitle}
            placeholder={formDefaults.titlePlaceholder}
            placeholderTextColor={theme.colors.textLight}
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
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder={formDefaults.dateValue}
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </Field>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Ghi chú <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={formDefaults.notePlaceholder}
            placeholderTextColor={theme.colors.textLight}
            multiline
            style={[styles.fieldInput, styles.textArea]}
            textAlignVertical="top"
          />
        </View>
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
  },
  textArea: {
    height: 140,
    alignItems: 'flex-start'
  }
});

export default PetNewLogScreen;




