import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDbf-83NL2MXUu7VNM2f3yATz2U736ExuM",
  authDomain: "metric-windows-pt.firebaseapp.com",
  projectId: "metric-windows-pt",
  storageBucket: "metric-windows-pt.firebasestorage.app",
  messagingSenderId: "1023389688954",
  appId: "1:1023389688954:web:9e38ea38e31686a88e87c3",
  measurementId: "G-ZSMF7E2BDM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;