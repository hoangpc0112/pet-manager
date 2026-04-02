import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const PetsScreen = ({ navigation }) => {
  const { pets } = useAppData();
  const [keyword, setKeyword] = useState('');

  const filteredPets = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return pets;

    return pets.filter((pet) => {
      const haystack = [pet.name, pet.breed, pet.age].join(' ').toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [pets, keyword]);

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thú cưng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PetNew')}>
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.textLight} />
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Tìm theo tên hoặc giống loài"
          placeholderTextColor={theme.colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <PrimaryButton
        label="Kiểm tra triệu chứng"
        onPress={() => navigation.navigate('SymptomStep1')}
        style={styles.symptomButton}
      />

      {filteredPets.map((pet) => (
        <TouchableOpacity
          key={pet.id}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
        >
          <Card style={styles.petCard}>
            <Image source={{ uri: pet.imageUrl }} style={styles.petImage} resizeMode="cover" />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petMeta}>{pet.breed} • {pet.age}</Text>
              <Text style={styles.petWeight}>{pet.weight}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...theme.shadow.card
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: theme.spacing.lg
  },
  symptomButton: {
    marginBottom: theme.spacing.lg
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: theme.colors.text
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  petImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: 14
  },
  petInfo: {
    flex: 1
  },
  petName: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  petMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  petWeight: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 4
  }
});

export default PetsScreen;
