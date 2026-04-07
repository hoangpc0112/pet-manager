import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import {
  deleteDocument,
  getCollectionDocs,
  getDocument,
  setDocument,
  subscribeCollectionDocs,
  subscribeDocument
} from '../services/firestore';
import {
  cancelReminderNotifications,
  scheduleReminderNotifications
} from '../services/reminderNotifications';
import {
  symptomGroups as defaultSymptomGroups,
  symptomMeta as defaultSymptomMeta,
  symptomOptions as defaultSymptomOptions
} from '../data/symptoms';
import {
  fetchNearbyServicesByLocation,
  filterVisibleServices,
  getSeedNearbyServicesByLocation
} from '../services/nearbyServices';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const ensureSymptomFallbacks = (config) => {
  const nextConfig = { ...(config || {}) };

  nextConfig.symptomGroups = Array.isArray(nextConfig.symptomGroups) && nextConfig.symptomGroups.length > 0
    ? nextConfig.symptomGroups
    : defaultSymptomGroups;

  nextConfig.symptomOptions = Array.isArray(nextConfig.symptomOptions) && nextConfig.symptomOptions.length > 0
    ? nextConfig.symptomOptions
    : defaultSymptomOptions;

  const meta = nextConfig.symptomMeta || {};
  nextConfig.symptomMeta = {
    duration: Array.isArray(meta.duration) && meta.duration.length > 0 ? meta.duration : defaultSymptomMeta.duration,
    energy: Array.isArray(meta.energy) && meta.energy.length > 0 ? meta.energy : defaultSymptomMeta.energy,
    appetite: Array.isArray(meta.appetite) && meta.appetite.length > 0 ? meta.appetite : defaultSymptomMeta.appetite
  };

  return nextConfig;
};

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
    plan: 'Free',
    avatarUrl: ''
  },
  profileStats: [],
  profileSettings: [],
  reminderSummary: { today: 'Hôm nay', count: 0 },
  reminderItems: [],
  shopTabs: ['Tất cả'],
  shopItems: [],
  symptomGroups: defaultSymptomGroups,
  symptomOptions: defaultSymptomOptions,
  symptomMeta: defaultSymptomMeta,
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

const parseVnDateToMs = (dateText) => {
  if (!dateText || typeof dateText !== 'string') return 0;
  const parts = dateText.split('/').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const [day, month, year] = parts;
  const value = new Date(year, month - 1, day).getTime();
  return Number.isNaN(value) ? 0 : value;
};

const buildSourceSummary = (places) => {
  const sources = Array.from(new Set((places || []).map((item) => item?.source).filter(Boolean)));
  if (sources.length === 0) return 'Theo vị trí GPS của bạn';
  return `Nguồn miễn phí: ${sources.join(', ')}`;
};

const getCoordinatesWithTimeout = async (timeoutMs = 12000) => {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutHandle = setTimeout(() => {
      clearTimeout(timeoutHandle);
      reject(new Error('Location timeout'));
    }, timeoutMs);
  });

  const locationPromise = (async () => {
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown?.coords?.latitude && lastKnown?.coords?.longitude) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude
      };
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      latitude: current?.coords?.latitude,
      longitude: current?.coords?.longitude
    };
  })();

  return Promise.race([locationPromise, timeoutPromise]);
};

const getVaccinationState = ({ doneDate, nextDate, status }) => {
  if (status === 'pending') {
    return { status: 'pending', statusLabel: 'Chưa tiêm' };
  }

  if (!doneDate) {
    return { status: 'pending', statusLabel: 'Chưa tiêm' };
  }

  const nextDateMs = parseVnDateToMs(nextDate);
  if (!nextDateMs) {
    return { status: 'done', statusLabel: 'Hoàn tất' };
  }

  return nextDateMs < Date.now()
    ? { status: 'overdue', statusLabel: 'Quá hạn' }
    : { status: 'done', statusLabel: 'Hoàn tất' };
};

const normalizeCommunityPost = (post) => {
  const commentsCount = Number.isFinite(post.comments) ? post.comments : 0;
  const commentItems = Array.isArray(post.commentItems) ? post.commentItems : [];

  return {
    ...post,
    authorAvatarUrl: post.authorAvatarUrl || '',
    likes: Number.isFinite(post.likes) ? post.likes : 0,
    comments: commentItems.length > 0 ? commentItems.length : commentsCount,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    commentItems
  };
};

export const AppDataProvider = ({ children }) => {
  const { user, isAuthLoading } = useAuth();
  const currentUserId = user?.uid || '';

  const [pets, setPets] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [appConfig, setAppConfig] = useState(DEFAULT_APP_CONFIG);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [nearbyServicesCache, setNearbyServicesCache] = useState([]);
  const [nearbyServicesMeta, setNearbyServicesMeta] = useState({
    isLoading: true,
    error: '',
    sourceLabel: '',
    sourceType: ''
  });
  const nearbyServicesFetchedRef = useRef(false);
  const reminderItemsRef = useRef([]);

  const appConfigCollectionPath = useMemo(
    () => (currentUserId ? `users/${currentUserId}/app_config` : ''),
    [currentUserId]
  );
  const petsCollectionPath = useMemo(
    () => (currentUserId ? `users/${currentUserId}/pets` : ''),
    [currentUserId]
  );
  const journalCollectionPath = useMemo(
    () => (currentUserId ? `users/${currentUserId}/journalEntries` : ''),
    [currentUserId]
  );
  const appConfigServices = useMemo(
    () => (Array.isArray(appConfig.nearbyServices) ? appConfig.nearbyServices : []),
    [appConfig.nearbyServices]
  );

  const setNearbyServicesWithMeta = useCallback((items, nextMeta) => {
    setNearbyServicesCache(filterVisibleServices(items));
    setNearbyServicesMeta((prev) => ({
      ...prev,
      isLoading: false,
      error: nextMeta.error || '',
      sourceLabel: nextMeta.sourceLabel || '',
      sourceType: nextMeta.sourceType || ''
    }));
  }, []);

  const refreshNearbyServices = useCallback(async (options = {}) => {
    const force = options.force === true;
    if (nearbyServicesFetchedRef.current && !force) return;
    nearbyServicesFetchedRef.current = true;

    setNearbyServicesMeta((prev) => ({ ...prev, isLoading: true, error: '' }));
    let fallbackLocation = null;

    const applyConfigFallback = (errorMessage) => {
      if (appConfigServices.length > 0) {
        setNearbyServicesWithMeta(appConfigServices, {
          sourceLabel: 'Dữ liệu cấu hình ứng dụng',
          sourceType: 'config',
          error: errorMessage
        });
        return;
      }

      setNearbyServicesWithMeta(getSeedNearbyServicesByLocation(null), {
        sourceLabel: 'Dữ liệu mặc định',
        sourceType: 'seed',
        error: errorMessage
      });
    };

    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        applyConfigFallback('Dịch vụ vị trí trên iPhone đang tắt. Hiển thị dữ liệu gợi ý gần bạn.');
        return;
      }

      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== 'granted') {
        applyConfigFallback('Chưa được cấp quyền vị trí. Vào Cài đặt để cấp quyền khi dùng ứng dụng.');
        return;
      }

      const coords = await getCoordinatesWithTimeout(12000);
      const latitude = coords?.latitude;
      const longitude = coords?.longitude;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Invalid GPS coordinates');
      }

      fallbackLocation = { latitude, longitude };

      const remoteServices = await fetchNearbyServicesByLocation({
        latitude,
        longitude,
        radiusMeters: 5000,
        maxResults: 15
      });
      const filteredRemoteServices = filterVisibleServices(remoteServices);

      if (filteredRemoteServices.length > 0) {
        setNearbyServicesWithMeta(filteredRemoteServices, {
          sourceLabel: buildSourceSummary(filteredRemoteServices),
          sourceType: 'remote',
          error: ''
        });
        return;
      }

      setNearbyServicesWithMeta(getSeedNearbyServicesByLocation({ latitude, longitude }), {
        sourceLabel: 'Dữ liệu mặc định theo vị trí hiện tại',
        sourceType: 'seed',
        error: ''
      });
    } catch (_error) {
      const errorMessage = 'Không lấy được vị trí hoặc dữ liệu mạng lúc này. Đã chuyển sang dữ liệu dự phòng.';

      if (appConfigServices.length > 0) {
        setNearbyServicesWithMeta(appConfigServices, {
          sourceLabel: 'Dữ liệu cấu hình ứng dụng',
          sourceType: 'config',
          error: errorMessage
        });
      } else {
        setNearbyServicesWithMeta(getSeedNearbyServicesByLocation(fallbackLocation), {
          sourceLabel: fallbackLocation ? 'Dữ liệu mặc định theo vị trí hiện tại' : 'Dữ liệu mặc định',
          sourceType: 'seed',
          error: errorMessage
        });
      }
    }
  }, [appConfigServices, setNearbyServicesWithMeta]);

  const loadAppData = useCallback(async () => {
    if (!currentUserId) {
      setAppConfig(DEFAULT_APP_CONFIG);
      setPets([]);
      setJournalEntries([]);
      setCommunityPosts([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const [configDoc, petDocs, journalDocs, communityDocs] = await Promise.all([
        getDocument(appConfigCollectionPath, 'main'),
        getCollectionDocs(petsCollectionPath),
        getCollectionDocs(journalCollectionPath),
        getCollectionDocs('communityPosts')
      ]);

      if (configDoc) {
        setAppConfig((prev) => ensureSymptomFallbacks({ ...prev, ...configDoc }));
      }
      setPets(sortByCreatedAtDesc(petDocs));
      setJournalEntries(sortByCreatedAtDesc(journalDocs));
      setCommunityPosts(sortByCreatedAtDesc(communityDocs).map(normalizeCommunityPost));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load Firestore data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [appConfigCollectionPath, currentUserId, journalCollectionPath, petsCollectionPath]);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingData(true);
      return () => {};
    }

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

    if (!currentUserId) {
      setAppConfig(DEFAULT_APP_CONFIG);
      setPets([]);
      setJournalEntries([]);
      setCommunityPosts([]);
      setIsLoadingData(false);
      return () => {};
    }

    const unsubConfig = subscribeDocument(
      appConfigCollectionPath,
      'main',
      (configDoc) => {
        if (configDoc) {
          setAppConfig((prev) => ensureSymptomFallbacks({ ...prev, ...configDoc }));
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
      petsCollectionPath,
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
      journalCollectionPath,
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
        setCommunityPosts(sortByCreatedAtDesc(communityDocs).map(normalizeCommunityPost));
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
  }, [appConfigCollectionPath, currentUserId, isAuthLoading, journalCollectionPath, petsCollectionPath]);

  useEffect(() => {
    refreshNearbyServices();
  }, [refreshNearbyServices]);

  useEffect(() => {
    reminderItemsRef.current = Array.isArray(appConfig.reminderItems)
      ? appConfig.reminderItems
      : [];
  }, [appConfig.reminderItems]);

  useEffect(() => {
    if (nearbyServicesMeta.sourceType !== 'config') return;
    if (appConfigServices.length === 0) return;
    setNearbyServicesCache(filterVisibleServices(appConfigServices));
  }, [appConfigServices, nearbyServicesMeta.sourceType]);

  const saveJournalEntry = (entry) => {
    if (!currentUserId) return null;

    const inferredSource = entry.source
      ? entry.source
      : entry.symptomSnapshot || entry.aiRawResponse
        ? 'symptom'
        : 'manual';

    const nextEntry = {
      id: makeId('log'),
      title: entry.title,
      pet: entry.pet,
      date: entry.date,
      note: entry.note,
      category: entry.category || 'Khác',
      source: inferredSource,
      imageUrl: entry.imageUrl || null,
      aiAnalysis: entry.aiAnalysis || null,
      aiRawResponse: entry.aiRawResponse || null,
      symptomSnapshot: entry.symptomSnapshot || null,
      createdAt: Date.now(),
      ownerId: currentUserId
    };
    setJournalEntries((prev) => [nextEntry, ...prev]);
    setDocument(journalCollectionPath, nextEntry.id, nextEntry).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save journal entry:', error);
    });
    return nextEntry;
  };

  const deleteJournalEntry = (entryId) => {
    if (!entryId || !currentUserId) return false;

    setJournalEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    deleteDocument(journalCollectionPath, entryId).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete journal entry:', error);
    });

    return true;
  };

  const addPet = (petInput) => {
    if (!currentUserId) return null;

    const nextPet = {
      id: makeId('pet'),
      name: petInput.name,
      breed: petInput.breed,
      age: petInput.age || 'Chưa rõ tuổi',
      weight: petInput.weight || 'Chưa rõ',
      gender: petInput.gender || 'Chưa rõ',
      species: petInput.species || 'other',
      speciesDetail: petInput.speciesDetail || '',
      imageUrl:
        petInput.imageUrl ||
        'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop',
      createdAt: Date.now(),
      ownerId: currentUserId
    };
    setPets((prev) => [nextPet, ...prev]);
    setDocument(petsCollectionPath, nextPet.id, nextPet).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to save pet:', error);
    });
    return nextPet;
  };

  const updatePet = (petId, petInput) => {
    if (!currentUserId) return null;

    const currentPet = pets.find((pet) => pet.id === petId);
    if (!currentPet) return null;

    const nextPet = {
      ...currentPet,
      ...petInput,
      updatedAt: Date.now()
    };

    setPets((prev) => prev.map((pet) => (pet.id === petId ? nextPet : pet)));
    setDocument(petsCollectionPath, petId, nextPet).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update pet:', error);
    });

    if (nextPet.name && nextPet.name !== currentPet.name) {
      setJournalEntries((prev) =>
        prev.map((entry) => (entry.pet === currentPet.name ? { ...entry, pet: nextPet.name } : entry))
      );

      journalEntries
        .filter((entry) => entry.pet === currentPet.name)
        .forEach((entry) => {
          setDocument(journalCollectionPath, entry.id, { pet: nextPet.name }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to update journal pet name:', error);
          });
        });
    }

    return nextPet;
  };

  const deletePet = (petId) => {
    if (!petId || !currentUserId) return false;

    let removed = false;
    setPets((prev) => {
      const nextPets = prev.filter((pet) => pet.id !== petId);
      removed = nextPets.length !== prev.length;
      return nextPets;
    });

    if (!removed) return false;

    deleteDocument(petsCollectionPath, petId).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete pet:', error);
    });

    return true;
  };

  const updateProfileOverview = (profileInput) => {
    if (!currentUserId) return null;

    const nextOverview = {
      ...(appConfig.profileOverview || DEFAULT_APP_CONFIG.profileOverview),
      ...profileInput
    };

    setAppConfig((prev) => ({
      ...prev,
      profileOverview: nextOverview
    }));

    setDocument(appConfigCollectionPath, 'main', { profileOverview: nextOverview }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile overview:', error);
    });

    return nextOverview;
  };

  const addPetVaccination = (petId, vaccineInput) => {
    if (!currentUserId) return null;

    const currentPet = pets.find((pet) => pet.id === petId);
    if (!currentPet) return null;

    const doneDate = vaccineInput.doneDate || '';
    const nextDate = vaccineInput.nextDate || '';
    const state = getVaccinationState({ doneDate, nextDate, status: vaccineInput.status || 'pending' });
    const nextVaccination = {
      id: makeId('vac'),
      name: vaccineInput.name,
      doneDate,
      nextDate,
      clinic: vaccineInput.clinic || 'Chưa cập nhật',
      note: vaccineInput.note || '',
      status: state.status,
      statusLabel: state.statusLabel,
      createdAt: Date.now()
    };

    const currentVaccinations = Array.isArray(currentPet.vaccinations) ? currentPet.vaccinations : [];
    const nextVaccinations = sortByCreatedAtDesc([...currentVaccinations, nextVaccination]);

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              vaccinations: nextVaccinations,
              updatedAt: Date.now()
            }
          : pet
      )
    );

    setDocument(petsCollectionPath, petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to add pet vaccination:', error);
    });

    return nextVaccination;
  };

  const updatePetVaccination = (petId, vaccinationId, vaccineInput) => {
    if (!currentUserId) return null;

    const currentPet = pets.find((pet) => pet.id === petId);
    if (!currentPet || !vaccinationId) return null;

    const currentVaccinations = Array.isArray(currentPet.vaccinations) ? currentPet.vaccinations : [];
    const currentItem = currentVaccinations.find((item) => item.id === vaccinationId);
    if (!currentItem) return null;

    const doneDate = vaccineInput.doneDate ?? currentItem.doneDate ?? '';
    const nextDate = vaccineInput.nextDate ?? currentItem.nextDate ?? '';
    const state = getVaccinationState({ doneDate, nextDate, status: vaccineInput.status || currentItem.status });
    const nextItem = {
      ...currentItem,
      ...vaccineInput,
      doneDate,
      nextDate,
      status: state.status,
      statusLabel: state.statusLabel,
      updatedAt: Date.now()
    };

    const nextVaccinations = sortByCreatedAtDesc(
      currentVaccinations.map((item) => (item.id === vaccinationId ? nextItem : item))
    );

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              vaccinations: nextVaccinations,
              updatedAt: Date.now()
            }
          : pet
      )
    );

    setDocument(petsCollectionPath, petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update pet vaccination:', error);
    });

    return nextItem;
  };

  const deletePetVaccination = (petId, vaccinationId) => {
    if (!currentUserId) return false;

    const currentPet = pets.find((pet) => pet.id === petId);
    if (!currentPet || !vaccinationId) return false;

    const currentVaccinations = Array.isArray(currentPet.vaccinations) ? currentPet.vaccinations : [];
    const nextVaccinations = currentVaccinations.filter((item) => item.id !== vaccinationId);
    if (nextVaccinations.length === currentVaccinations.length) return false;

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              vaccinations: nextVaccinations,
              updatedAt: Date.now()
            }
          : pet
      )
    );

    setDocument(petsCollectionPath, petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete pet vaccination:', error);
    });

    return true;
  };

  const createReminder = async (reminderInput) => {
    if (!currentUserId) {
      return {
        reminder: null,
        notificationScheduled: false
      };
    }

    const nextReminder = {
      id: makeId('rem'),
      title: reminderInput.title,
      time: reminderInput.time,
      date: reminderInput.date || '',
      repeat: reminderInput.repeat || 'Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6',
      pet: reminderInput.pet || 'Tất cả',
      petId: reminderInput.petId || null,
      notificationIds: [],
      calendarEventId: '',
      enabled: true,
      createdAt: Date.now()
    };

    const currentItems = Array.isArray(reminderItemsRef.current)
      ? reminderItemsRef.current
      : Array.isArray(appConfig.reminderItems)
        ? appConfig.reminderItems
        : [];
    const nextItems = sortByCreatedAtDesc([nextReminder, ...currentItems]);
    const nextSummary = {
      ...(appConfig.reminderSummary || DEFAULT_APP_CONFIG.reminderSummary),
      count: nextItems.length
    };

    reminderItemsRef.current = nextItems;

    setAppConfig((prev) => ({
      ...prev,
      reminderItems: nextItems,
      reminderSummary: nextSummary
    }));

    try {
      await setDocument(appConfigCollectionPath, 'main', {
        reminderItems: nextItems,
        reminderSummary: nextSummary,
        updatedAt: Date.now()
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create reminder:', error);

      const rolledBackItems = (Array.isArray(reminderItemsRef.current) ? reminderItemsRef.current : [])
        .filter((item) => item.id !== nextReminder.id);
      const rolledBackSummary = {
        ...(appConfig.reminderSummary || DEFAULT_APP_CONFIG.reminderSummary),
        count: rolledBackItems.length
      };

      reminderItemsRef.current = rolledBackItems;

      setAppConfig((prev) => ({
        ...prev,
        reminderItems: rolledBackItems,
        reminderSummary: rolledBackSummary
      }));

      return {
        reminder: null,
        notificationScheduled: false
      };
    }

    let notificationScheduled = false;

    try {
      const notificationIds = await scheduleReminderNotifications(nextReminder);
      notificationScheduled = Array.isArray(notificationIds) && notificationIds.length > 0;

      const safeNotificationIds = Array.isArray(notificationIds) ? notificationIds : [];
      const baseItems = Array.isArray(reminderItemsRef.current)
        ? reminderItemsRef.current
        : Array.isArray(appConfig.reminderItems)
          ? appConfig.reminderItems
          : [];
      const updatedReminder = {
        ...nextReminder,
        notificationIds: safeNotificationIds,
        calendarEventId: '',
        updatedAt: Date.now()
      };
      const index = baseItems.findIndex((item) => item.id === nextReminder.id);
      const syncedItems = index >= 0
        ? baseItems.map((item) =>
            item.id === nextReminder.id
              ? {
                  ...item,
                  ...updatedReminder
                }
              : item
          )
        : sortByCreatedAtDesc([updatedReminder, ...baseItems]);

      reminderItemsRef.current = syncedItems;

      setAppConfig((prev) => ({
        ...prev,
        reminderItems: syncedItems
      }));

      setDocument(appConfigCollectionPath, 'main', {
        reminderItems: syncedItems,
        updatedAt: Date.now()
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to sync reminder channels:', error);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to sync reminder notifications/calendar:', error);
    }

    return {
      reminder: nextReminder,
      notificationScheduled
    };
  };

  const toggleReminderEnabled = (reminderId) => {
    if (!reminderId || !currentUserId) return null;

    const currentItems = Array.isArray(reminderItemsRef.current)
      ? reminderItemsRef.current
      : [];
    let nextReminder = null;
    let previousReminder = null;
    const nextItems = currentItems.map((item) => {
      if (item.id !== reminderId) return item;
      previousReminder = item;
      nextReminder = { ...item, enabled: !item.enabled, updatedAt: Date.now() };
      return nextReminder;
    });

    if (!nextReminder) return null;

    reminderItemsRef.current = nextItems;

    setAppConfig((prev) => ({
      ...prev,
      reminderItems: nextItems
    }));

    setDocument(appConfigCollectionPath, 'main', {
      reminderItems: nextItems,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle reminder:', error);
    });

    const previousNotificationIds = Array.isArray(previousReminder?.notificationIds)
      ? previousReminder.notificationIds
      : [];
    const applyReminderChannels = ({ notificationIds }) => {
      const baseItems = Array.isArray(reminderItemsRef.current)
        ? reminderItemsRef.current
        : Array.isArray(appConfig.reminderItems)
          ? appConfig.reminderItems
          : [];
      const syncedItems = baseItems.map((item) =>
        item.id === reminderId
          ? {
              ...item,
              notificationIds: Array.isArray(notificationIds) ? notificationIds : item.notificationIds || [],
              calendarEventId: '',
              updatedAt: Date.now()
            }
          : item
      );

      reminderItemsRef.current = syncedItems;

      setAppConfig((prev) => ({
        ...prev,
        reminderItems: syncedItems
      }));

      setDocument(appConfigCollectionPath, 'main', {
        reminderItems: syncedItems,
        updatedAt: Date.now()
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to sync reminder after toggle:', error);
      });
    };

    cancelReminderNotifications(previousNotificationIds)
      .then(async () => {
        if (!nextReminder.enabled) {
          applyReminderChannels({ notificationIds: [] });
          return;
        }

        const scheduledIds = await scheduleReminderNotifications(nextReminder);
        applyReminderChannels({ notificationIds: scheduledIds });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to sync reminder notifications when toggling:', error);
      });

    return nextReminder;
  };

  const updateReminder = (reminderId, reminderInput) => {
    if (!reminderId || !currentUserId) return null;

    let nextItems = [];
    let nextReminder = null;
    let previousNotificationIds = [];
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
      nextItems = currentItems.map((item) => {
        if (item.id !== reminderId) return item;
        previousNotificationIds = Array.isArray(item.notificationIds) ? item.notificationIds : [];
        nextReminder = {
          ...item,
          ...reminderInput,
          updatedAt: Date.now()
        };
        return nextReminder;
      });

      return {
        ...prev,
        reminderItems: nextItems
      };
    });

    if (!nextReminder) return null;

    setDocument(appConfigCollectionPath, 'main', {
      reminderItems: nextItems,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update reminder:', error);
    });

    cancelReminderNotifications(previousNotificationIds)
      .then(async () => {
        if (!nextReminder.enabled) {
          let syncedItems = [];
          setAppConfig((prev) => {
            const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
            syncedItems = currentItems.map((item) =>
              item.id === reminderId
                ? { ...item, notificationIds: [], calendarEventId: '', updatedAt: Date.now() }
                : item
            );

            return {
              ...prev,
              reminderItems: syncedItems
            };
          });

          setDocument(appConfigCollectionPath, 'main', {
            reminderItems: syncedItems,
            updatedAt: Date.now()
          }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to clear reminder notifications:', error);
          });
          return;
        }

        const scheduledIds = await scheduleReminderNotifications(nextReminder);
        let syncedItems = [];
        setAppConfig((prev) => {
          const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
          syncedItems = currentItems.map((item) =>
            item.id === reminderId
              ? { ...item, notificationIds: scheduledIds, calendarEventId: '', updatedAt: Date.now() }
              : item
          );

          return {
            ...prev,
            reminderItems: syncedItems
          };
        });

        setDocument(appConfigCollectionPath, 'main', {
          reminderItems: syncedItems,
          updatedAt: Date.now()
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to sync reminder notification ids on update:', error);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to reschedule reminder notifications:', error);
      });

    return nextReminder;
  };

  const deleteReminder = (reminderId) => {
    if (!reminderId || !currentUserId) return false;

    let nextItems = [];
    let removed = false;
    let deletedReminder = null;
    let nextSummary = DEFAULT_APP_CONFIG.reminderSummary;
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
      deletedReminder = currentItems.find((item) => item.id === reminderId) || null;
      nextItems = currentItems.filter((item) => item.id !== reminderId);
      removed = nextItems.length !== currentItems.length;
      nextSummary = {
        ...(prev.reminderSummary || DEFAULT_APP_CONFIG.reminderSummary),
        count: nextItems.length
      };

      return {
        ...prev,
        reminderItems: nextItems,
        reminderSummary: nextSummary
      };
    });

    if (!removed) return false;

    setDocument(appConfigCollectionPath, 'main', {
      reminderItems: nextItems,
      reminderSummary: nextSummary,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete reminder:', error);
    });

    cancelReminderNotifications(deletedReminder?.notificationIds).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to cancel reminder notifications on delete:', error);
    });

    return true;
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
      authorAvatarUrl: postInput.authorAvatarUrl || '',
      time: 'Vừa xong',
      content: postInput.content,
      imageUrl: postInput.imageUrl || null,
      tags,
      location: category === 'Mạng xã hội' ? '' : postInput.location || 'Chưa cập nhật',
      likes: 0,
      comments: 0,
      likedBy: [],
      commentItems: [],
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

  const toggleCommunityPostLike = (postId, actorId) => {
    if (!actorId) return null;

    let nextPost = null;
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
        const alreadyLiked = likedBy.includes(actorId);
        const nextLikedBy = alreadyLiked ? likedBy.filter((id) => id !== actorId) : [...likedBy, actorId];
        const updated = {
          ...post,
          likedBy: nextLikedBy,
          likes: nextLikedBy.length,
          updatedAt: Date.now()
        };
        nextPost = updated;
        return updated;
      })
    );

    if (!nextPost) return null;

    setDocument('communityPosts', postId, {
      likedBy: nextPost.likedBy,
      likes: nextPost.likes,
      updatedAt: nextPost.updatedAt
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update post like:', error);
    });

    return nextPost;
  };

  const addCommunityPostComment = (postId, commentInput) => {
    const content = String(commentInput?.content || '').trim();
    if (!content) return null;

    let nextPost = null;
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const nextComment = {
          id: makeId('cmt'),
          author: commentInput.author || 'Bạn',
          authorAvatarUrl: commentInput.authorAvatarUrl || '',
          content,
          createdAt: Date.now(),
          time: 'Vừa xong'
        };

        const currentItems = Array.isArray(post.commentItems) ? post.commentItems : [];
        const nextItems = [...currentItems, nextComment];
        const updated = {
          ...post,
          commentItems: nextItems,
          comments: nextItems.length,
          updatedAt: Date.now()
        };
        nextPost = updated;
        return updated;
      })
    );

    if (!nextPost) return null;

    setDocument('communityPosts', postId, {
      commentItems: nextPost.commentItems,
      comments: nextPost.comments,
      updatedAt: nextPost.updatedAt
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to add post comment:', error);
    });

    return nextPost;
  };

  const value = useMemo(
    () => ({
      ...appConfig,
      nearbyServices: nearbyServicesCache,
      nearbyServicesMeta,
      refreshNearbyServices,
      petsCollectionName: petsCollectionPath,
      journalCollectionName: journalCollectionPath,
      pets,
      journalEntries,
      communityPosts,
      isLoadingData,
      reloadAppData: loadAppData,
      saveJournalEntry,
      deleteJournalEntry,
      addPet,
      updatePet,
      deletePet,
      addPetVaccination,
      updatePetVaccination,
      deletePetVaccination,
      getPetById,
      createReminder,
      toggleReminderEnabled,
      updateReminder,
      deleteReminder,
      updateProfileOverview,
      addCommunityPost,
      toggleCommunityPostLike,
      addCommunityPostComment
    }),
    [
      appConfig,
      nearbyServicesCache,
      nearbyServicesMeta,
      refreshNearbyServices,
      petsCollectionPath,
      journalCollectionPath,
      pets,
      journalEntries,
      communityPosts,
      isLoadingData,
      loadAppData
    ]
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
