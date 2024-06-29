import { 
    auth, 
    db,
    getCurrentUser,
    signOut as firebaseSignOut
} from './firebase-config.js';

import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

import { 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Sign up a new user
export async function signUp(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email,
            displayName,
            createdAt: new Date()
        });
        return userCredential.user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
}

// Sign in an existing user
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
}

// Sign out the current user
export async function signOut() {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}

// Send a password reset email
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(user, profileData) {
    try {
        await updateProfile(user, profileData);
        await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

// Get the current authenticated user
export function getAuthenticatedUser() {
    return getCurrentUser();
}

// Listen for authentication state changes
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Check if user is authenticated
export function isAuthenticated() {
    return auth.currentUser !== null;
}

// Get user token for API requests
export async function getUserToken() {
    const user = auth.currentUser;
    if (user) {
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error("Error getting user token:", error);
            throw error;
        }
    }
    return null;
}
