import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  deleteDocument,
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
    plan: 'Free',
    avatarUrl: ''
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

const parseVnDateToMs = (dateText) => {
  if (!dateText || typeof dateText !== 'string') return 0;
  const parts = dateText.split('/').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const [day, month, year] = parts;
  const value = new Date(year, month - 1, day).getTime();
  return Number.isNaN(value) ? 0 : value;
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
      setCommunityPosts(sortByCreatedAtDesc(communityDocs).map(normalizeCommunityPost));
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

  const deleteJournalEntry = (entryId) => {
    if (!entryId) return false;

    setJournalEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    deleteDocument('journalEntries', entryId).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete journal entry:', error);
    });

    return true;
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

  const updatePet = (petId, petInput) => {
    const currentPet = pets.find((pet) => pet.id === petId);
    if (!currentPet) return null;

    const nextPet = {
      ...currentPet,
      ...petInput,
      updatedAt: Date.now()
    };

    setPets((prev) => prev.map((pet) => (pet.id === petId ? nextPet : pet)));
    setDocument('pets', petId, nextPet).catch((error) => {
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
          setDocument('journalEntries', entry.id, { pet: nextPet.name }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to update journal pet name:', error);
          });
        });
    }

    return nextPet;
  };

  const updateProfileOverview = (profileInput) => {
    const nextOverview = {
      ...(appConfig.profileOverview || DEFAULT_APP_CONFIG.profileOverview),
      ...profileInput
    };

    setAppConfig((prev) => ({
      ...prev,
      profileOverview: nextOverview
    }));

    setDocument('app_config', 'main', { profileOverview: nextOverview }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile overview:', error);
    });

    return nextOverview;
  };

  const addPetVaccination = (petId, vaccineInput) => {
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

    setDocument('pets', petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to add pet vaccination:', error);
    });

    return nextVaccination;
  };

  const updatePetVaccination = (petId, vaccinationId, vaccineInput) => {
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

    setDocument('pets', petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update pet vaccination:', error);
    });

    return nextItem;
  };

  const deletePetVaccination = (petId, vaccinationId) => {
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

    setDocument('pets', petId, {
      vaccinations: nextVaccinations,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete pet vaccination:', error);
    });

    return true;
  };

  const createReminder = (reminderInput) => {
    const nextReminder = {
      id: makeId('rem'),
      title: reminderInput.title,
      time: reminderInput.time,
      repeat: reminderInput.repeat || 'Mỗi ngày',
      pet: reminderInput.pet || 'Tất cả',
      enabled: true,
      createdAt: Date.now()
    };

    let nextItems = [];
    let nextSummary = DEFAULT_APP_CONFIG.reminderSummary;
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
      nextItems = sortByCreatedAtDesc([nextReminder, ...currentItems]);
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

    setDocument('app_config', 'main', {
      reminderItems: nextItems,
      reminderSummary: nextSummary,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to create reminder:', error);
    });

    return nextReminder;
  };

  const toggleReminderEnabled = (reminderId) => {
    if (!reminderId) return null;

    let nextItems = [];
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
      nextItems = currentItems.map((item) =>
        item.id === reminderId ? { ...item, enabled: !item.enabled, updatedAt: Date.now() } : item
      );

      return {
        ...prev,
        reminderItems: nextItems
      };
    });

    setDocument('app_config', 'main', {
      reminderItems: nextItems,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle reminder:', error);
    });

    return nextItems.find((item) => item.id === reminderId) || null;
  };

  const updateReminder = (reminderId, reminderInput) => {
    if (!reminderId) return null;

    let nextItems = [];
    let nextReminder = null;
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
      nextItems = currentItems.map((item) => {
        if (item.id !== reminderId) return item;
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

    setDocument('app_config', 'main', {
      reminderItems: nextItems,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to update reminder:', error);
    });

    return nextReminder;
  };

  const deleteReminder = (reminderId) => {
    if (!reminderId) return false;

    let nextItems = [];
    let removed = false;
    let nextSummary = DEFAULT_APP_CONFIG.reminderSummary;
    setAppConfig((prev) => {
      const currentItems = Array.isArray(prev.reminderItems) ? prev.reminderItems : [];
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

    setDocument('app_config', 'main', {
      reminderItems: nextItems,
      reminderSummary: nextSummary,
      updatedAt: Date.now()
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to delete reminder:', error);
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
      pets,
      journalEntries,
      communityPosts,
      isLoadingData,
      reloadAppData: loadAppData,
      saveJournalEntry,
      deleteJournalEntry,
      addPet,
      updatePet,
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
