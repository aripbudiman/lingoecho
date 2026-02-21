import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, updateProfile } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: "https://my-app-89f18-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
};
export const logout = () => signOut(auth);

export const saveTranslation = async (userId: string, sessionId: string | null, indonesian: string, english: string, explanation: string, mode: string) => {
  let sid = sessionId;
  if (!sid) {
    const sessionsRef = ref(db, `lingoecho/users/${userId}/sessions`);
    const newSessionRef = push(sessionsRef);
    sid = newSessionRef.key;
    await set(newSessionRef, {
      title: indonesian.slice(0, 30) + (indonesian.length > 30 ? '...' : ''),
      timestamp: Date.now()
    });
  }

  const messagesRef = ref(db, `lingoecho/users/${userId}/messages/${sid}`);
  await push(messagesRef, {
    indonesian,
    english,
    explanation,
    mode,
    timestamp: Date.now()
  });

  return sid;
};

export const getSessions = (userId: string, callback: (data: any) => void) => {
  const sessionsRef = ref(db, `lingoecho/users/${userId}/sessions`);
  onValue(sessionsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value })).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
  });
};

export const getMessages = (userId: string, sessionId: string, callback: (data: any) => void) => {
  const messagesRef = ref(db, `lingoecho/users/${userId}/messages/${sessionId}`);
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value })).sort((a: any, b: any) => a.timestamp - b.timestamp) : []);
  });
};

export const saveQuizScore = async (userId: string, theme: string, score: number, total: number) => {
  const scoresRef = ref(db, `lingoecho/users/${userId}/quiz_scores`);
  await push(scoresRef, {
    theme,
    score,
    total,
    timestamp: Date.now()
  });
};

export const getQuizScores = (userId: string, callback: (data: any) => void) => {
  const scoresRef = ref(db, `lingoecho/users/${userId}/quiz_scores`);
  onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value })).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
  });
};
