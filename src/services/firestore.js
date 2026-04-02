import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getCollectionDocs = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const getDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const subscribeCollectionDocs = (collectionName, onData, onError) =>
  onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const docs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      onData(docs);
    },
    (error) => {
      if (onError) onError(error);
    }
  );

export const subscribeDocument = (collectionName, id, onData, onError) =>
  onSnapshot(
    doc(db, collectionName, id),
    (snapshot) => {
      onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    },
    (error) => {
      if (onError) onError(error);
    }
  );

export const setDocument = async (collectionName, id, payload, merge = true) => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, payload, { merge });
  return id;
};

export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
  return id;
};

export const addDocument = async (collectionName, payload) => {
  const result = await addDoc(collection(db, collectionName), payload);
  return result.id;
};

export const getCollectionPage = async ({
  collectionName,
  pageSize = 10,
  cursor = null,
  orderByField = 'createdAt',
  orderDirection = 'desc'
}) => {
  const constraints = [orderBy(orderByField, orderDirection), limit(pageSize)];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const nextCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return {
    docs,
    nextCursor,
    hasMore: snapshot.docs.length === pageSize
  };
};

export const addCommunityPost = async (payload) => {
  return addDocument('communityPosts', payload);
};
