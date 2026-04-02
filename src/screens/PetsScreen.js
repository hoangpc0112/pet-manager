import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { getCollectionPage } from '../services/firestore';

const PAGE_SIZE = 5;

const PetsScreen = ({ navigation }) => {
  const { pets } = useAppData();
  const scrollRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [serverPagePets, setServerPagePets] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const pageDataCacheRef = useRef({});
  const pageStartCursorRef = useRef({ 1: null });

  const filteredPets = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return pets;

    return pets.filter((pet) => {
      const haystack = [pet.name, pet.breed, pet.age].join(' ').toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [pets, keyword]);

  const isSearching = keyword.trim().length > 0;
  const totalPages = Math.max(1, Math.ceil((isSearching ? filteredPets.length : pets.length) / PAGE_SIZE));
  const visiblePets = useMemo(() => {
    if (isSearching) {
      const start = (currentPage - 1) * PAGE_SIZE;
      return filteredPets.slice(start, start + PAGE_SIZE);
    }
    return serverPagePets;
  }, [isSearching, filteredPets, currentPage, serverPagePets]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [keyword, filteredPets.length, pets.length]);

  useEffect(() => {
    pageDataCacheRef.current = {};
    pageStartCursorRef.current = { 1: null };
  }, [pets.length]);

  const loadPage = async (targetPage) => {
    if (isSearching) return;

    if (pageDataCacheRef.current[targetPage]) {
      setServerPagePets(pageDataCacheRef.current[targetPage]);
      return;
    }

    setIsPageLoading(true);
    try {
      for (let page = 1; page < targetPage; page += 1) {
        if (pageStartCursorRef.current[page + 1] !== undefined) {
          continue;
        }

        const result = await getCollectionPage({
          collectionName: 'pets',
          pageSize: PAGE_SIZE,
          cursor: pageStartCursorRef.current[page],
          orderByField: 'createdAt',
          orderDirection: 'desc'
        });

        pageDataCacheRef.current[page] = result.docs;
        pageStartCursorRef.current[page + 1] = result.nextCursor;
      }

      const result = await getCollectionPage({
        collectionName: 'pets',
        pageSize: PAGE_SIZE,
        cursor: pageStartCursorRef.current[targetPage],
        orderByField: 'createdAt',
        orderDirection: 'desc'
      });

      pageDataCacheRef.current[targetPage] = result.docs;
      pageStartCursorRef.current[targetPage + 1] = result.nextCursor;
      setServerPagePets(result.docs);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load pets page:', error);
      setServerPagePets([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    if (!isSearching) {
      loadPage(currentPage);
    }
  }, [currentPage, isSearching, pets.length]);

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thú cưng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PetNew')}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm mới</Text>
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

      {visiblePets.map((pet) => (
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

      {isPageLoading ? <Text style={styles.loadingText}>Đang tải danh sách...</Text> : null}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  addButtonText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2
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
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm
  }
});

export default PetsScreen;
