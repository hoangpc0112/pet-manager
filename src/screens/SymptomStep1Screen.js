import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import PaginationControls from '../components/PaginationControls';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { normalizeForSubmit, sanitizeSingleLineInput } from '../services/inputSanitizers';

const PAGE_SIZE = 5;

const SymptomStep1Screen = ({ navigation, route }) => {
  const { pets, symptomGroups } = useAppData();
  const groups = symptomGroups || [];
  const preselectedPetId = route?.params?.preselectedPetId || '';
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || pets[0]?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [customGroupLabel, setCustomGroupLabel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const petImageSources = useMemo(
    () =>
      pets.reduce((acc, pet) => {
        if (pet.imageUrl) {
          acc[pet.id] = { uri: pet.imageUrl, cache: 'force-cache' };
        }
        return acc;
      }, {}),
    [pets]
  );
  const selectedPet = useMemo(() => pets.find((item) => item.id === selectedPetId), [pets, selectedPetId]);
  const totalPages = Math.max(1, Math.ceil(pets.length / PAGE_SIZE));
  const visiblePets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return pets.slice(start, start + PAGE_SIZE);
  }, [pets, currentPage]);

  useEffect(() => {
    if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (!preselectedPetId) return;

    const matchedPet = pets.find((item) => item.id === preselectedPetId);
    if (!matchedPet) return;

    setSelectedPetId(preselectedPetId);
    const selectedIndex = pets.findIndex((item) => item.id === preselectedPetId);
    if (selectedIndex >= 0) {
      setCurrentPage(Math.floor(selectedIndex / PAGE_SIZE) + 1);
    }
  }, [pets, preselectedPetId]);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [pets.length, totalPages]);

  const isOtherGroup = selectedGroupId === 'other';
  const canContinueToStep2 = Boolean(selectedGroupId) && (!isOtherGroup || Boolean(normalizeForSubmit(customGroupLabel)));
  const selectedGroupLabel = isOtherGroup
    ? normalizeForSubmit(customGroupLabel) || 'Khác'
    : groups.find((item) => item.id === selectedGroupId)?.label || '';

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 1/4</Text>
      <Text style={styles.stepTitle}>Chọn thú cưng và nhóm vấn đề</Text>
      <ProgressSteps total={4} current={1} />

      <Card style={styles.card}>
        {visiblePets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[styles.petRow, selectedPetId === pet.id && styles.petRowSelected]}
            onPress={() => setSelectedPetId(pet.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.petIcon, selectedPetId === pet.id && styles.petIconSelected]}>
              {petImageSources[pet.id] ? (
                <Image
                  source={petImageSources[pet.id]}
                  defaultSource={require('../../assets/icon.png')}
                  style={styles.petImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="paw" size={20} color={theme.colors.primary} />
              )}
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed}</Text>
            </View>
            {selectedPetId === pet.id ? <Text style={styles.petSelected}>Đã chọn</Text> : null}
          </TouchableOpacity>
        ))}

        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Nhóm triệu chứng</Text>
        <View style={styles.chipsRow}>
          {groups.map((group) => (
            <Chip
              key={group.id}
              label={group.label}
              active={group.id === selectedGroupId}
              onPress={() => setSelectedGroupId(group.id)}
            />
          ))}
        </View>

        {isOtherGroup ? (
          <View style={styles.customGroupWrap}>
            <Text style={styles.customGroupLabel}>Nhập nhóm triệu chứng</Text>
            <TextInput
              value={customGroupLabel}
              onChangeText={(value) =>
                setCustomGroupLabel(sanitizeSingleLineInput(value, { maxLength: 80, collapseWhitespace: true }))
              }
              placeholder="Ví dụ: Thần kinh, Nội tiết..."
              placeholderTextColor={theme.colors.textLight}
              autoCorrect={false}
              style={styles.customGroupInput}
            />
          </View>
        ) : null}
      </Card>

      <PrimaryButton
        label="Tiếp tục"
        onPress={() =>
          navigation.navigate('SymptomStep2', {
            selectedPetId,
            selectedPetName: selectedPet?.name || '',
            selectedGroupId,
            selectedGroupLabel
          })
        }
        disabled={!canContinueToStep2}
        style={styles.primaryButton}
      />
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
    marginBottom: theme.spacing.md
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
    flex: 1,
    textAlign: 'center',
    ...theme.typography.h3,
    marginRight: 28
  },
  stepLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  stepTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: 6
  },
  card: {
    marginTop: theme.spacing.lg
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  petRowSelected: {
    borderColor: theme.colors.primary,
    borderBottomColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  petIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 13
  },
  petIconSelected: {
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  petInfo: {
    flex: 1,
    marginLeft: 12
  },
  petName: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  petBreed: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  petSelected: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.md
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  customGroupWrap: {
    marginTop: theme.spacing.sm
  },
  customGroupLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 8
  },
  customGroupInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...theme.typography.caption,
    color: theme.colors.text
  },
  primaryButton: {
    marginTop: theme.spacing.xl
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default SymptomStep1Screen;




