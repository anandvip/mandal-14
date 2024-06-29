// Import functions from other modules
// Note: In a module-based setup, you'd use import statements here
// For now, we assume these functions are globally available from other script files

// Application State
let state = {
    user: null,
    activeMandal: null,
    sessions: [],
    timerInterval: null,
    seconds: 0
};

// DOM Elements
const elements = {
    userName: document.getElementById('userName'),
    userEmail: document.getElementById('userEmail'),
    signoutBtn: document.getElementById('signoutBtn'),
    themeToggle: document.getElementById('themeToggle'),
    feedbackBtn: document.getElementById('feedbackBtn'),
    mandalCreation: document.getElementById('mandalCreation'),
    activeMandalInfo: document.getElementById('activeMandalInfo'),
    sessionHistory: document.getElementById('sessionHistory'),
    createMandalBtn: document.getElementById('createMandal'),
    startSessionBtn: document.getElementById('startSession'),
    stopSessionBtn: document.getElementById('stopSession'),
    deleteMandalBtn: document.getElementById('deleteMandal'),
    timerDisplay: document.getElementById('timer')
};

// Event Listeners
function setupEventListeners() {
    elements.signoutBtn.addEventListener('click', signOut);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.feedbackBtn.addEventListener('click', showFeedbackForm);
    elements.createMandalBtn.addEventListener('click', createMandal);
    elements.startSessionBtn.addEventListener('click', startSession);
    elements.stopSessionBtn.addEventListener('click', stopSession);
    elements.deleteMandalBtn.addEventListener('click', confirmDeleteMandal);
    elements.userName.addEventListener('blur', saveUserName);
}

// Initialize Application
function initializeApp() {
    setupEventListeners();
    
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            state.user = user;
            elements.userEmail.textContent = user.email;
            loadUserData(user.uid);
        } else {
            // Redirect to login page if not authenticated
            window.location.href = 'index.html';
        }
    });
}

// Load User Data
function loadUserData(userId) {
    loadActiveMandal(userId)
        .then(() => loadSessions(userId))
        .then(() => {
            updateUI();
            startPeriodicUpdate();
        })
        .catch(error => {
            console.error("Error loading user data:", error);
            showToast('Error loading data. Please refresh the page.');
        });
}

// Periodic Update
function startPeriodicUpdate() {
    setInterval(() => {
        if (state.activeMandal) {
            updateDashboard();
        }
    }, 60000); // Update every minute
}

// Create Mandal
function createMandal() {
    const name = document.getElementById('mandalName').value;
    const duration = parseInt(document.getElementById('mandalDuration').value);
    const startDate = new Date(document.getElementById('startDate').value);

    createNewMandal(state.user.uid, name, duration, startDate)
        .then(mandal => {
            state.activeMandal = mandal;
            state.sessions = [];
            updateUI();
            showToast('Mandal created successfully!');
        })
        .catch(error => {
            console.error("Error creating mandal:", error);
            showToast('Error creating mandal. Please try again.');
        });
}

// Start Session
function startSession() {
    if (!state.activeMandal) {
        showToast('Please create a Mandal first.');
        return;
    }

    state.seconds = 0;
    state.timerInterval = setInterval(updateTimer, 1000);
    elements.startSessionBtn.style.display = 'none';
    elements.stopSessionBtn.style.display = 'inline-block';
    showToast('Session started.');
}

// Stop Session
function stopSession() {
    clearInterval(state.timerInterval);
    const sessionData = {
        mandalId: state.activeMandal.id,
        duration: state.seconds,
        date: new Date(),
        notes: ''
    };

    addSession(state.user.uid, sessionData)
        .then(session => {
            state.sessions.push(session);
            updateUI();
            elements.startSessionBtn.style.display = 'inline-block';
            elements.stopSessionBtn.style.display = 'none';
            state.seconds = 0;
            updateTimerDisplay();
            showToast('Session stopped and saved.');
        })
        .catch(error => {
            console.error("Error saving session:", error);
            showToast('Error saving session. Please try again.');
        });
}

// Update Timer
function updateTimer() {
    state.seconds++;
    updateTimerDisplay();
}

// Update UI
function updateUI() {
    updateDashboard();
    displaySessionHistory();
    updateMandalCreationVisibility();
}

// Confirm Delete Mandal
function confirmDeleteMandal() {
    showIntrusiveToast('Are you sure you want to delete this Mandal and all its sessions?', deleteMandal);
}

// Delete Mandal
function deleteMandal() {
    if (!state.activeMandal) return;

    deleteMandal(state.user.uid, state.activeMandal.id)
        .then(() => {
            state.activeMandal = null;
            state.sessions = [];
            updateUI();
            showToast('Mandal and associated sessions deleted.');
        })
        .catch(error => {
            console.error("Error deleting mandal:", error);
            showToast('Error deleting mandal. Please try again.');
        });
}

// Save User Name
function saveUserName() {
    const newName = elements.userName.textContent.trim();
    if (newName && newName !== state.user.displayName) {
        updateUserProfile(state.user.uid, { displayName: newName })
            .then(() => {
                state.user.displayName = newName;
                showToast('User name updated.');
            })
            .catch(error => {
                console.error("Error updating user name:", error);
                showToast('Error updating user name. Please try again.');
            });
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
