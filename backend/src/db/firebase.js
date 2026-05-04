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
  apiKey: 'AIzaSyDS6mQzurVkaSFkUn1K8xzJNZNhDNOmM3I',
  authDomain: 'tabletap-dine.firebaseapp.com',
  projectId: 'tabletap-dine',
  storageBucket: 'tabletap-dine.firebasestorage.app',
  messagingSenderId: '578759018710',
  appId: '1:578759018710:web:660995f664f035d8a72177',
  measurementId: 'G-W7DMDQCNCP',
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
