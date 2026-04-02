import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
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

export const addCommunityPost = async (payload) => {
  const result = await addDoc(collection(db, 'communityPosts'), payload);
  return result.id;
};
