import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbEUdQJO_66xmbBYhPbjXBgAQrWtcf-sY",
  authDomain: "qomaraa-403b2.firebaseapp.com",
  databaseURL: "https://qomaraa-403b2-default-rtdb.firebaseio.com",
  projectId: "qomaraa-403b2",
  storageBucket: "qomaraa-403b2.appspot.com",
  messagingSenderId: "365576236185",
  appId: "1:365576236185:web:3ca18ed9e273023d575c08",
  measurementId: "G-HXKDDYVP60",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { db, storage, analytics, auth };