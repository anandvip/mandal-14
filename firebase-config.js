// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsT9k97TNP8ehqZ9wRMRNv5IjFHpI5FTY",
  authDomain: "mandal-app-ad7cf.firebaseapp.com",
  projectId: "mandal-app-ad7cf",
  storageBucket: "mandal-app-ad7cf.appspot.com",
  messagingSenderId: "979459887132",
  appId: "1:979459887132:web:d1324a6a3e00c149248fd9",
  measurementId: "G-31ZYTXZQEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the Firebase services
export { auth, db };

// Optional: Function to get the current authenticated user
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

// Optional: Function to check if a user is authenticated
export function isUserAuthenticated() {
  return auth.currentUser !== null;
}

// Optional: Function to sign out the current user
export function signOut() {
  return auth.signOut();
}

// Optional: Function to get a document reference
export function getDocRef(collection, docId) {
  return doc(db, collection, docId);
}

// Optional: Function to get a collection reference
export function getCollectionRef(collection) {
  return collection(db, collection);
}

// You can add more Firebase-related utility functions here as needed
