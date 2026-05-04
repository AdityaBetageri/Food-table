const { initializeApp } = require('firebase/app');
const { getAuth, sendPasswordResetEmail } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyDS6mQzurVkaSFkUn1K8xzJNZNhDNOmM3I',
  authDomain: 'tabletap-dine.firebaseapp.com',
  projectId: 'tabletap-dine',
  storageBucket: 'tabletap-dine.firebasestorage.app',
  messagingSenderId: '578759018710',
  appId: '1:578759018710:web:660995f664f035d8a72177',
  measurementId: 'G-W7DMDQCNCP',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = 'test@example.com'; // Use a real email to test if possible, or just see the error

sendPasswordResetEmail(auth, email)
  .then(() => {
    console.log('SUCCESS: Email sent');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR:', err.code, err.message);
    process.exit(1);
  });
