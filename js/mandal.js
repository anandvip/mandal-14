import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Create a new Mandal
export async function createMandal(userId, name, duration, startDate) {
    try {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const mandalData = {
            userId,
            name,
            duration,
            startDate,
            endDate,
            createdAt: new Date(),
            isActive: true
        };

        const docRef = await addDoc(collection(db, "mandals"), mandalData);
        return { id: docRef.id, ...mandalData };
    } catch (error) {
        console.error("Error creating mandal:", error);
        throw error;
    }
}

// Get a specific Mandal by ID
export async function getMandal(mandalId) {
    try {
        const docRef = doc(db, "mandals", mandalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("No such mandal exists");
        }
    } catch (error) {
        console.error("Error getting mandal:", error);
        throw error;
    }
}

// Get the active Mandal for a user
export async function getActiveMandal(userId) {
    try {
        const q = query(
            collection(db, "mandals"),
            where("userId", "==", userId),
            where("isActive", "==", true),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting active mandal:", error);
        throw error;
    }
}

// Update a Mandal
export async function updateMandal(mandalId, updates) {
    try {
        const mandalRef = doc(db, "mandals", mandalId);
        await updateDoc(mandalRef, updates);
        return { id: mandalId, ...updates };
    } catch (error) {
        console.error("Error updating mandal:", error);
        throw error;
    }
}

// Delete a Mandal
export async function deleteMandal(mandalId) {
    try {
        await deleteDoc(doc(db, "mandals", mandalId));
    } catch (error) {
        console.error("Error deleting mandal:", error);
        throw error;
    }
}

// Get all Mandals for a user
export async function getUserMandals(userId) {
    try {
        const q = query(
            collection(db, "mandals"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting user mandals:", error);
        throw error;
    }
}

// Calculate Mandal progress
export function calculateMandalProgress(mandal) {
    const now = new Date();
    const totalDays = (mandal.endDate - mandal.startDate) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - mandal.startDate) / (1000 * 60 * 60 * 24);
    const progress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
    return progress;
}

// Check if a Mandal is completed
export function isMandalCompleted(mandal) {
    return new Date() > mandal.endDate;
}

// Activate a Mandal (and deactivate others)
export async function activateMandal(userId, mandalId) {
    try {
        // Deactivate all Mandals for the user
        const userMandals = await getUserMandals(userId);
        const deactivatePromises = userMandals.map(mandal => 
            updateMandal(mandal.id, { isActive: false })
        );
        await Promise.all(deactivatePromises);

        // Activate the selected Mandal
        await updateMandal(mandalId, { isActive: true });
    } catch (error) {
        console.error("Error activating mandal:", error);
        throw error;
    }
}
