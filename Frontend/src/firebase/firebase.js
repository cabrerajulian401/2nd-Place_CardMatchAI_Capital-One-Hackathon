// firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaVew3nBukQ5SVPRl5i1ITZi-tvXQQY_w",
  authDomain: "capital-one-tech-summit.firebaseapp.com",
  projectId: "capital-one-tech-summit",
  storageBucket: "capital-one-tech-summit.firebasestorage.app",
  messagingSenderId: "101824382756",
  appId: "1:101824382756:web:2e17d18701b0f9e70cd5b1",
  measurementId: "G-G0JK6XQ696"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)

