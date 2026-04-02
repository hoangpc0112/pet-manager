import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCollectionDocs,
  getDocument,
  setDocument,
  subscribeCollectionDocs,
  subscribeDocument
} from '../services/firestore';

const AppDataContext = createContext(null);

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const DEFAULT_APP_CONFIG = {
  communityTabs: ['Hỏi đáp', 'review', 'Mạng xã hội'],
  exploreCards: [],
  recommendations: [],
  newPostDefaults: { category: 'Hỏi đáp' },
  petQuickActions: [],
  vaccinationTabs: ['Tất cả', 'Đến hạn', 'Hoàn tất'],
  vaccinations: [],
  petLogFormDefaults: {
    titlePlaceholder: 'Ví dụ: Kiểm tra cân nặng',
    dateValue: '',
    notePlaceholder: 'Nhập chi tiết...'
  },
  petNewFormDefaults: {
    namePlaceholder: 'Nhập tên',
    breedPlaceholder: 'Nhập giống'
  },
  petSwitcher: [],
  placeDetail: null,
  nearbyServices: [],
  profileOverview: {
    name: 'Người dùng',
    email: '',
    phone: '',
    plan: 'Free'
  },
  profileStats: [],
  profileSettings: [],
  reminderSummary: { today: 'Hôm nay', count: 0 },
  reminderItems: [],
  shopTabs: ['Tất cả'],
  shopItems: [],
  symptomGroups: [],
  symptomOptions: [],
  symptomMeta: {
    duration: ['< 24h', '1-3 ngày', '> 3 ngày'],
    energy: ['Thấp', 'Bình thường', 'Cao'],
    appetite: ['Giảm', 'Bình thường', 'Tăng']
  },
  resultSteps: [],
  resultWarnings: []
};

const toMs = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => {
    const byCreatedAt = toMs(b.createdAt) - toMs(a.createdAt);
    if (byCreatedAt !== 0) return byCreatedAt;
    const aSeed = Number.isFinite(a.seedOrder) ? a.seedOrder : Number.MAX_SAFE_INTEGER;
    const bSeed = Number.isFinite(b.seedOrder) ? b.seedOrder : Number.MAX_SAFE_INTEGER;
    return aSeed - bSeed;
  });

export const AppDataProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [appConfig, setAppConfig] = useState(DEFAULT_APP_CONFIG);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadAppData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [configDoc, petDocs, journalDocs, communityDocs] = await Promise.all([
        getDocument('app_config', 'main'),
        getCollectionDocs('pets'),
        getCollectionDocs('journalEntries'),
        getCollectionDocs('communityPosts')
      ]);

      if (configDoc) {
        setAppConfig((prev) => ({ ...prev, ...configDoc }));
      }
      setPets(sortByCreatedAtDesc(petDocs));
      setJournalEntries(sortByCreatedAtDesc(journalDocs));
      setCommunityPosts(sortByCreatedAtDesc(communityDocs));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load Firestore data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    setIsLoadingData(true);

    const loaded = {
      config: false,
      pets: false,
      journalEntries: false,
      communityPosts: false
    };

    const markLoaded = (key) => {
      loaded[key] = true;
      if (loaded.config && loaded.pets && loaded.journalEntries && loaded.communityPosts) {
        setIsLoadingData(false);
      }
    };

    const unsubConfig = subscribeDocument(
      'app_config',
      'main',
      (configDoc) => {
        if (configDoc) {
          setAppConfig((prev) => ({ ...prev, ...configDoc }));
        }
        markLoaded('config');
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe app config:', error);
        markLoaded('config');
      }
    );

    const unsubPets = subscribeCollectionDocs(
      'pets',
      (petDocs) => {
        setPets(sortByCreatedAtDesc(petDocs));
        markLoaded('pets');
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe pets:', error);
        markLoaded('pets');
      }
    );

    const unsubJournal = subscribeCollectionDocs(
      'journalEntries',
      (journalDocs) => {
        setJournalEntries(sortByCreatedAtDesc(journalDocs));
        markLoaded('journalEntries');
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe journal entries:', error);
        markLoaded('journalEntries');
      }
    );

    const unsubCommunity = subscribeCollectionDocs(
      'communityPosts',
      (communityDocs) => {
        setCommunityPosts(sortByCreatedAtDesc(communityDocs));
        markLoaded('communityPosts');
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe community posts:', error);
        markLoaded('communityPosts');
      }
    );

    return () => {
      unsubConfig();
      unsubPets();
      unsubJournal();
      unsubCommunity();
    };
  }, []);

  const saveJournalEntry = (entry) => {
    const nextEntry = {
      id: makeId('log'),
      title: entry.title,
      pet: entry.pet,
      date: entry.date,
      note: entry.note,
      category: entry.category || 'Khác',
      imageUrl: entry.imageUrl || null,
      createdAt: Date.now()
    };
    setJournalEntries((prev) => [nextEntry, ...prev]);
    setDocument('journalEntries', nextEntry.id, nextEntry).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save journal entry:', error);
    });
    return nextEntry;
  };

  const addPet = (petInput) => {
    const nextPet = {
      id: makeId('pet'),
      name: petInput.name,
      breed: petInput.breed,
      age: petInput.age || 'Chưa rõ tuổi',
      weight: petInput.weight || 'Chưa rõ',
      gender: petInput.gender || 'Chưa rõ',
      species: petInput.species || 'other',
      imageUrl:
        petInput.imageUrl ||
        'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop',
      createdAt: Date.now()
    };
    setPets((prev) => [nextPet, ...prev]);
    setDocument('pets', nextPet.id, nextPet).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save pet:', error);
    });
    return nextPet;
  };

  const getPetById = (petId) => pets.find((pet) => pet.id === petId) || null;

  const addCommunityPost = (postInput) => {
    const tags = (postInput.tags || [])
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (item.startsWith('#') ? item : `#${item}`));

    let category = 'Hỏi đáp';
    if (postInput.category === 'review') category = 'review';
    if (postInput.category === 'Mạng xã hội') category = 'Mạng xã hội';
    const nextPost = {
      id: makeId('post'),
      title: postInput.title,
      author: postInput.author || 'Bạn',
      time: 'Vừa xong',
      content: postInput.content,
      imageUrl: postInput.imageUrl || null,
      tags,
      location: category === 'Mạng xã hội' ? '' : postInput.location || 'Chưa cập nhật',
      likes: 0,
      comments: 0,
      category,
      reviewScore: category === 'review' ? postInput.reviewScore || 5 : null,
      createdAt: Date.now()
    };

    setCommunityPosts((prev) => [nextPost, ...prev]);
    setDocument('communityPosts', nextPost.id, nextPost).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save community post:', error);
    });
    return nextPost;
  };

  const value = useMemo(
    () => ({
      ...appConfig,
      pets,
      journalEntries,
      communityPosts,
      isLoadingData,
      reloadAppData: loadAppData,
      saveJournalEntry,
      addPet,
      getPetById,
      addCommunityPost
    }),
    [appConfig, pets, journalEntries, communityPosts, isLoadingData, loadAppData]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};
