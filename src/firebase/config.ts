import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDyJdJl7qfBhVXrQhlZdbVxjLYjGThOuQo',
  authDomain: 'kadronu-kur.firebaseapp.com',
  databaseURL: 'https://kadronu-kur-default-rtdb.firebaseio.com',
  projectId: 'kadronu-kur',
  storageBucket: 'kadronu-kur.firebasestorage.app',
  messagingSenderId: '282630901925',
  appId: '1:282630901925:web:56b5e6124b62249ca27d4c',
  measurementId: 'G-T0BSB5H6HC',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
