const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'tabletap-dine.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'tabletap-dine',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tabletap-dine.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '578759018710',
  appId: process.env.FIREBASE_APP_ID || '1:578759018710:web:660995f664f035d8a72177',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-W7DMDQCNCP',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Convert a Firestore document snapshot to a plain object with _id
 * Maintains compatibility with the frontend which expects MongoDB-style _id
 */
function docToObj(docSnap) {
  if (!docSnap.exists()) return null;
  return { _id: docSnap.id, ...docSnap.data() };
}

/**
 * Convert an array of query snapshots to plain objects
 */
function docsToArray(querySnap) {
  const results = [];
  querySnap.forEach((d) => results.push({ _id: d.id, ...d.data() }));
  return results;
}

module.exports = {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  docToObj,
  docsToArray,
  auth,
};
