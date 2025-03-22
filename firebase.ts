import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCltRIDYbFwI7FU6tHBhNW2P_N80YCRBWA",
    authDomain: "test-16408.firebaseapp.com",
    databaseURL: "https://test-16408-default-rtdb.firebaseio.com",
    projectId: "test-16408",
    storageBucket: "test-16408.appspot.com",
    messagingSenderId: "279255768738",
    appId: "1:279255768738:web:56a403e34e4564fdfe81fb",
    measurementId: "G-TGCDGQWJSH"
  };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

const db = getFirestore(app)
const storage = getStorage(app)


export { db, storage }