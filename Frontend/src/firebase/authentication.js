// src/authentication.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export const loginWithEmailPassword = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmailPassword = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, provider);

export const signupWithGoogle = () => signInWithPopup(auth, provider); // same behavior

export const loginAnonymouslyUser = () => signInAnonymously(auth);

export const logout = () => signOut(auth);
