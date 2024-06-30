import { signIn, signUp, signOut } from './auth.js';
import { createMandal, getActiveMandal, updateMandal } from './mandal.js';
import { createSession, getMandalSessions, deleteSession, calculateTotalMeditationTime, calculateAverageSessionDuration } from './session.js';

const elements = {
    authSection: document.getElementById('authSection'),
    signInForm: document.getElementById('signInForm'),
    signUpForm: document.getElementById('signUpForm'),
    dashboardSection: document.getElementById('dashboardSection'),
    userInfo: document.getElementById('userInfo'),
    mandalCreation: document.getElementById('mandalCreation'),
    activeMandal: document.getElementById('activeMandal'),
    sessionHistory: document.getElementById('sessionHistory'),
    themeToggle: document.getElementById('themeToggle'),
    signOutBtn: document.getElementById('signOutBtn'),
    userName: document.getElementById('userName'),
    mandalName: document.getElementById('mandalName'),
    mandalDuration: document.getElementById('mandalDuration'),
    createMandalBtn: document.getElementById('createMandalBtn'),
    activeMandalName: document.getElementById('activeMandalName'),
    mandalProgress: document.getElementById('mandalProgress'),
    daysRemaining: document.getElementById('daysRemaining'),
    startSessionBtn: document.getElementById('startSessionBtn'),
    stopSessionBtn: document.getElementById('stopSessionBtn'),
    timer: document.getElementById('timer'),
    sessionList: document.getElementById('sessionList'),
    progressCircle: document.getElementById('progress-circle'),
    progressText: document.getElementById('progress-text'),
    totalSessions: document.getElementById('totalSessions'),
    totalTime: document.getElementById('totalTime'),
    averageSession: document.getElementById('averageSession')
};

let currentMandalId = null;
let timerInterval;
let sessionStartTime;

export function setupEventListeners() {
    elements.signInForm.addEventListener('submit', handleSignIn);
    elements.signUpForm.addEventListener('submit', handleSignUp);
    elements.createMandalBtn.addEventListener('click', handleCreateMandal);
    elements.startSessionBtn.addEventListener('click', handleStartSession);
    elements.stopSessionBtn.addEventListener('click', handleStopSession);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.signOutBtn.addEventListener('click', handleSignOut);
}

function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    signIn(email, password)
        .then(() => showDashboard())
        .catch(error => showError(error.message));
}

function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    signUp(name, email, password)
        .then(() => showDashboard())
        .catch(error => showError(error.message));
}

function handleSignOut() {
    signOut()
        .then(() => showAuthSection())
        .catch(error => showError(error.message));
}

function handleCreateMandal() {
    const name = elements.mandalName.value;
    const duration = parseInt(elements.mandalDuration.value);
    createMandal(name, duration)
        .then(() => updateDashboard())
        .catch(error => showError(error.message));
}

function handleStartSession() {
    elements.startSessionBtn.style.display = 'none';
    elements.stopSessionBtn.style.display = 'inline-block';
    startTimer();
}

function handleStopSession() {
    elements.startSessionBtn.style.display = 'inline-block';
    elements.stopSessionBtn.style.display = 'none';
    stopTimer();
    createSession(currentMandalId, getSessionDuration())
        .then(() => updateDashboard())
        .catch(error => showError(error.message));
}

function startTimer() {
    sessionStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    elements.timer.textContent = formatTime(elapsedTime);
}

function getSessionDuration() {
    return Math.floor((Date.now() - sessionStartTime) / 1000);
}

export function showAuthSection() {
    elements.authSection.style.display = 'block';
    elements.dashboardSection.style.display = 'none';
    elements.signOutBtn.style.display = 'none';
}

export function showDashboard() {
    elements.authSection.style.display = 'none';
    elements.dashboardSection.style.display = 'block';
    elements.signOutBtn.style.display = 'inline-block';
    updateDashboard();
}

export function updateDashboard() {
    getActiveMandal()
        .then(mandal => {
            if (mandal) {
                currentMandalId = mandal.id;
                showActiveMandal(mandal);
                updateMandalProgress(mandal);
                updateSessionHistory(mandal.id);
            } else {
                showMandalCreation();
            }
        })
        .catch(error => showError(error.message));
}

function showActiveMandal(mandal) {
    elements.mandalCreation.style.display = 'none';
    elements.activeMandal.style.display = 'block';
    elements.activeMandalName.textContent = mandal.name;
    updateMandalProgress(mandal);
}

function showMandalCreation() {
    elements.mandalCreation.style.display = 'block';
    elements.activeMandal.style.display = 'none';
}

function updateMandalProgress(mandal) {
    const now = new Date();
    const totalDays = (mandal.endDate - mandal.startDate) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - mandal.startDate) / (1000 * 60 * 60 * 24);
    const progress = Math.min(100, Math.round((daysPassed / totalDays) * 100));
    const daysRemaining = Math.max(0, Math.ceil(totalDays - daysPassed));

    elements.mandalProgress.textContent = `${progress}%`;
    elements.daysRemaining.textContent = daysRemaining;
    updateProgressCircle(progress);
}

function updateProgressCircle(progress) {
    const circle = elements.progressCircle;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    elements.progressText.textContent = `${progress}%`;
}

function updateSessionHistory(mandalId) {
    getMandalSessions(mandalId)
        .then(sessions => {
            elements.sessionList.innerHTML = sessions.map((session, index) => `
                <li class="session-entry">
                    <span class="session-date">${formatDate(session.date)}</span>
                    <span class="session-duration">${formatTime(session.duration)}</span>
                    ${session.notes ? `<p class="session-notes">${session.notes}</p>` : ''}
                    <button class="delete-note-btn" data-index="${index}">Delete Note</button>
                </li>
            `).join('');

            document.querySelectorAll('.delete-note-btn').forEach(button => {
                button.addEventListener('click', handleDeleteNote);
            });

            return Promise.all([
                calculateTotalMeditationTime(mandalId),
                calculateAverageSessionDuration(mandalId)
            ]);
        })
        .then(([totalTime, averageTime]) => {
            elements.totalSessions.textContent = sessions.length;
            elements.totalTime.textContent = formatTime(totalTime);
            elements.averageSession.textContent = formatTime(averageTime);
        })
        .catch(error => showError(error.message));
}

function handleDeleteNote(event) {
    const index = event.target.dataset.index;
    deleteSession(currentMandalId, index)
        .then(() => updateSessionHistory(currentMandalId))
        .catch(error => showError(error.message));
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function showError(message) {
    console.error(message);
    // Implement user-facing error display here
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

setupEventListeners();
