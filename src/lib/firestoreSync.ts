import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

/**
 * Saves or updates a document in a specified Firestore collection.
 */
export async function syncDocToFirestore<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, { ...data, _lastSyncedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${data.id}`);
    return false;
  }
}

/**
 * Deletes a document from a specified Firestore collection.
 */
export async function deleteDocFromFirestore(collectionName: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    return false;
  }
}

/**
 * Syncs an entire array of items to Firestore in batches.
 */
export async function syncAllToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<boolean> {
  if (!items || items.length === 0) return true;
  try {
    const batch = writeBatch(db);
    // Firestore batch limit is 500 operations
    items.slice(0, 450).forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, { ...item, _lastSyncedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
    return false;
  }
}

/**
 * Loads all documents from a Firestore collection.
 */
export async function loadFromFirestore<T>(collectionName: string): Promise<T[] | null> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return null;
    }
    const results: T[] = [];
    snap.forEach((d) => {
      results.push(d.data() as T);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return null;
  }
}
