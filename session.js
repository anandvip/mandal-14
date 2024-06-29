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
    orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Create a new session
export async function createSession(userId, mandalId, duration, notes = "") {
    try {
        const sessionData = {
            userId,
            mandalId,
            duration,
            notes,
            date: new Date(),
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, "sessions"), sessionData);
        return { id: docRef.id, ...sessionData };
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
}

// Get a specific session by ID
export async function getSession(sessionId) {
    try {
        const docRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("No such session exists");
        }
    } catch (error) {
        console.error("Error getting session:", error);
        throw error;
    }
}

// Get all sessions for a specific Mandal
export async function getMandalSessions(mandalId) {
    try {
        const q = query(
            collection(db, "sessions"),
            where("mandalId", "==", mandalId),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting mandal sessions:", error);
        throw error;
    }
}

// Update a session
export async function updateSession(sessionId, updates) {
    try {
        const sessionRef = doc(db, "sessions", sessionId);
        await updateDoc(sessionRef, updates);
        return { id: sessionId, ...updates };
    } catch (error) {
        console.error("Error updating session:", error);
        throw error;
    }
}

// Delete a session
export async function deleteSession(sessionId) {
    try {
        await deleteDoc(doc(db, "sessions", sessionId));
    } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }
}

// Calculate total meditation time for a Mandal
export async function calculateTotalMeditationTime(mandalId) {
    try {
        const sessions = await getMandalSessions(mandalId);
        return sessions.reduce((total, session) => total + session.duration, 0);
    } catch (error) {
        console.error("Error calculating total meditation time:", error);
        throw error;
    }
}

// Calculate average session duration for a Mandal
export async function calculateAverageSessionDuration(mandalId) {
    try {
        const sessions = await getMandalSessions(mandalId);
        if (sessions.length === 0) return 0;
        const totalTime = sessions.reduce((total, session) => total + session.duration, 0);
        return Math.round(totalTime / sessions.length);
    } catch (error) {
        console.error("Error calculating average session duration:", error);
        throw error;
    }
}

// Get meditation streak (consecutive days)
export async function getMeditationStreak(userId) {
    try {
        const q = query(
            collection(db, "sessions"),
            where("userId", "==", userId),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let session of sessions) {
            const sessionDate = new Date(session.date.toDate());
            sessionDate.setHours(0, 0, 0, 0);

            if (sessionDate.getTime() === currentDate.getTime()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (sessionDate.getTime() < currentDate.getTime()) {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error("Error getting meditation streak:", error);
        throw error;
    }
}

// Format duration in seconds to HH:MM:SS
export function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
