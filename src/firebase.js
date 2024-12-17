import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/*const firebaseConfig = {
  apiKey: "AIzaSyDwEtE5ZqxN1PXsVb_k3LXLsjHFb0Z5UeA",
  authDomain: "cs1-adc90.firebaseapp.com",
  projectId: "cs1-adc90",
  storageBucket: "cs1-adc90.firebasestorage.app",
  messagingSenderId: "670048387987",
  appId: "1:670048387987:web:a19affdf9f4a792a319e66",
  measurementId: "G-SZV166M3JV"
};*/
const firebaseConfig = {
  apiKey: "AIzaSyDtFhZZNJOcrU1lwWsp-n80kzcAfCpz7Qk",
  authDomain: "casestudy-83cf6.firebaseapp.com",
  projectId: "casestudy-83cf6",
  storageBucket: "casestudy-83cf6.firebasestorage.app",
  messagingSenderId: "691576649896",
  appId: "1:691576649896:web:483c5ecc4594279ad8ea9d",
  measurementId: "G-JCZKELYBVE"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };