import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyChghgl7trwjnOXYacm1al2zyo_5KaMVhA',
  authDomain: 'crave-auth-c234f.firebaseapp.com',
  projectId: 'crave-auth-c234f',
  storageBucket: 'crave-auth-c234f.firebasestorage.app',
  messagingSenderId: '881299738259',
  appId: '1:881299738259:web:133a5a647193a9b9c9076',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;