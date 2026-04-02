import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
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

export const addDocument = async (collectionName, payload) => {
  const result = await addDoc(collection(db, collectionName), payload);
  return result.id;
};

export const addCommunityPost = async (payload) => {
  return addDocument('communityPosts', payload);
};
