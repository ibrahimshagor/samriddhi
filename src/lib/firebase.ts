import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// User's Firebase Configuration synced with provisioned environment
export const firebaseConfig = {
  apiKey: firebaseAppletConfig?.apiKey || "AIzaSyBk59R7bH8k4vDVJbi7dv1XDd-7IbRg--8",
  authDomain: firebaseAppletConfig?.authDomain || "gen-lang-client-0442642731.firebaseapp.com",
  projectId: firebaseAppletConfig?.projectId || "gen-lang-client-0442642731",
  storageBucket: firebaseAppletConfig?.storageBucket || "gen-lang-client-0442642731.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || "61531064213",
  appId: firebaseAppletConfig?.appId || "1:61531064213:web:dbb9c6942bace417a2d89c",
};

// Initialize Firebase singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust local caching
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation:', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  // If the browser or environment is offline, avoid throwing network errors
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { connected: false, message: 'Offline mode active' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timed out')), 4000)
    );
    const checkPromise = getDocFromServer(doc(db, 'system', 'connection_test'));
    await Promise.race([checkPromise, timeoutPromise]);
    return { connected: true, message: 'Connected to Firebase Firestore' };
  } catch (error: any) {
    if (
      error?.message?.includes('the client is offline') ||
      error?.message?.includes('timed out') ||
      error?.code === 'unavailable'
    ) {
      return { connected: false, message: 'Offline or server unreachable' };
    }
    // If permission-denied or document not found, the network connection to project was verified
    return { connected: true, message: 'Firebase project online' };
  }
}

export default app;
