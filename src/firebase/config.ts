// =====================================================
// Firebase Configuration — Placeholder
// =====================================================
// Firebase entegrasyonu için bu dosyayı kullanacağız.
// Şimdilik sadece yapı hazır, aktif bağlantı yok.
//
// Kurulum adımları:
// 1. Firebase Console'dan yeni proje oluştur
// 2. Aşağıdaki config değerlerini kendi projen ile değiştir
// 3. `npm install firebase` (zaten yüklü olacak)
// 4. Firestore Database oluştur (test mode)
// =====================================================

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firebase başlatma — config doldurulunca aktif edilecek
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
//
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
