import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBVl7CxWeKN9P9AGGK6vIT1HMRMMwtSTOM",
    authDomain: "biolink-app-789e6.firebaseapp.com",
    projectId: "biolink-app-789e6",
    storageBucket: "biolink-app-789e6.firebasestorage.app",
    messagingSenderId: "599986828511",
    appId: "1:599986828511:web:dab0d02753355cbe11256a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
