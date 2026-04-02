import React, { createContext, useContext, useMemo, useState } from 'react';
import { journalEntries as initialJournalEntries } from '../data/journal';
import { petList as initialPets } from '../data/pets';
import { communityPosts as initialCommunityPosts } from '../data/community';

const AppDataContext = createContext(null);

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const AppDataProvider = ({ children }) => {
  const [pets, setPets] = useState(initialPets);
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);
  const [communityPosts, setCommunityPosts] = useState(initialCommunityPosts);

  const saveJournalEntry = (entry) => {
    const nextEntry = {
      id: makeId('log'),
      title: entry.title,
      pet: entry.pet,
      date: entry.date,
      note: entry.note,
      category: entry.category || 'Khác'
    };
    setJournalEntries((prev) => [nextEntry, ...prev]);
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
        'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop'
    };
    setPets((prev) => [nextPet, ...prev]);
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
      reviewScore: category === 'review' ? postInput.reviewScore || 5 : null
    };

    setCommunityPosts((prev) => [nextPost, ...prev]);
    return nextPost;
  };

  const value = useMemo(
    () => ({
      pets,
      journalEntries,
      communityPosts,
      saveJournalEntry,
      addPet,
      getPetById,
      addCommunityPost
    }),
    [pets, journalEntries, communityPosts]
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
