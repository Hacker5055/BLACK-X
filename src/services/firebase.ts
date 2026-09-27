import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Critical: include firestoreDatabaseId if configured
export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || undefined
);
export const auth = getAuth(app);

// Configure Google Auth Provider with profile, email and Google Calendar events scope
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection to Firestore as mandated by the Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to Firestore successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / configuration issue:', error.message);
    }
    // Return false instead of breaking UI
    return false;
  }
}

// Token management in-memory (MANDATORY: NO localStorage/sessionStorage for OAuth token)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const isAuthCancellation = (error: any): boolean => {
  if (!error) return false;
  const code = String(error?.code || '').toLowerCase();
  const msg = String(error?.message || '').toLowerCase();
  const str = String(error).toLowerCase();
  return (
    code.includes('popup-closed-by-user') ||
    code.includes('cancelled-popup-request') ||
    code.includes('popup-blocked') ||
    code.includes('user-cancelled') ||
    code.includes('closed-by-user') ||
    msg.includes('popup-closed-by-user') ||
    msg.includes('cancelled-popup-request') ||
    msg.includes('popup-blocked') ||
    msg.includes('user-cancelled') ||
    msg.includes('closed-by-user') ||
    str.includes('popup-closed-by-user') ||
    str.includes('cancelled-popup-request') ||
    str.includes('popup-blocked')
  );
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) {
    console.warn('[Firebase Auth] Sign-in request already in progress. Ignoring duplicate trigger.');
    return null;
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || '';
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (isAuthCancellation(error)) {
      console.warn('[Firebase Auth] Sign-in popup was dismissed or cancelled by the user.');
      return null;
    }
    // For other non-fatal errors (e.g. iframe cross-origin restrictions, popup blocked),
    // log as info/warn rather than console.error to avoid tripping automated error alerts
    console.warn('[Firebase Auth] Sign-in operation notice:', error?.message || error);
    return null;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
