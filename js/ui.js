// Add this near the top of the file
let currentTheme = localStorage.getItem('theme') || 'light';

// Modify the setupEventListeners function
export function setupEventListeners() {
    // ... other event listeners ...
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Apply the current theme when the page loads
    applyTheme(currentTheme);
}

// Update the toggleTheme function
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Add a new function to apply the theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    // Update the toggle button text if needed
    elements.themeToggle.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
}

// Modify the showAuthSection and showDashboard functions
export function showAuthSection() {
    elements.authSection.style.display = 'block';
    elements.dashboardSection.style.display = 'none';
    elements.signOutBtn.style.display = 'none';
    elements.themeToggle.style.display = 'block'; // Ensure theme toggle is visible
}

export function showDashboard() {
    elements.authSection.style.display = 'none';
    elements.dashboardSection.style.display = 'block';
    elements.signOutBtn.style.display = 'inline-block';
    elements.themeToggle.style.display = 'block'; // Ensure theme toggle is visible
    updateDashboard();
}

// Add this at the end of the file or in an initialization function
applyTheme(currentTheme);
