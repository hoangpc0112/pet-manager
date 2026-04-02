import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp, doc, writeBatch } from 'firebase/firestore';
import 'dotenv/config';
import {
  communityPosts,
  communityTabs,
  exploreCards,
  journalEntries,
  nearbyServices,
  newPostDefaults,
  petList,
  petLogFormDefaults,
  petNewFormDefaults,
  petQuickActions,
  petSwitcher,
  placeDetail,
  profileOverview,
  profileSettings,
  profileStats,
  recommendations,
  reminderItems,
  reminderSummary,
  resultSteps,
  resultWarnings,
  shopItems,
  shopTabs,
  symptomGroups,
  symptomMeta,
  symptomOptions,
  vaccinationTabs,
  vaccinations
} from '../src/data/mockData.js';

// Seed script for Firestore collections based on the DB diagram.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = new Date();

const asSeedItems = (items) =>
  items.map((item, index) => ({
    id: item.id,
    data: {
      ...item,
      createdAt: Timestamp.fromDate(new Date(now.getTime() - index * 60 * 1000)),
      updatedAt: Timestamp.fromDate(now)
    }
  }));

const appConfig = {
  communityTabs,
  exploreCards,
  recommendations,
  newPostDefaults,
  petQuickActions,
  vaccinationTabs,
  vaccinations,
  petLogFormDefaults,
  petNewFormDefaults,
  petSwitcher,
  placeDetail,
  nearbyServices,
  profileOverview,
  profileStats,
  profileSettings,
  reminderSummary,
  reminderItems,
  shopTabs,
  shopItems,
  symptomGroups,
  symptomOptions,
  symptomMeta,
  resultSteps,
  resultWarnings,
  updatedAt: Timestamp.fromDate(now)
};

const seedData = {
  pets: asSeedItems(petList),
  journalEntries: asSeedItems(journalEntries),
  communityPosts: asSeedItems(communityPosts)
};

const writeCollectionBatch = async (collectionName, items) => {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(db, collectionName, item.id);
    batch.set(ref, item.data, { merge: true });
  });
  await batch.commit();
};

const seed = async () => {
  const configBatch = writeBatch(db);
  configBatch.set(doc(db, 'app_config', 'main'), appConfig, { merge: true });
  await configBatch.commit();

  await writeCollectionBatch('pets', seedData.pets);
  await writeCollectionBatch('journalEntries', seedData.journalEntries);
  await writeCollectionBatch('communityPosts', seedData.communityPosts);
};

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Firestore seed completed: app_config/main, pets, journalEntries, communityPosts.');
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  });
