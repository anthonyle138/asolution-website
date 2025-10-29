// ============================================
// RAFFLE ENTRIES PAGE - PARTICIPANT SUBMISSION
// ============================================

const STORAGE_KEYS = {
    SETTINGS: 'raffle_settings',
    ENTRIES: 'raffle_entries'
};

let currentEntryMode = 'normal'; // 'normal' or 'cookie'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRaffleInfo();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('entry-form').addEventListener('submit', submitEntry);
}

// ============================================
// LOAD RAFFLE INFO
// ============================================

function loadRaffleInfo() {
    const settings = getSettings();

    if (!settings) {
        showClosedMessage('Raffle has not been set up yet. Please check back later.');
        return;
    }

    // Update page title and description
    document.getElementById('raffle-title').textContent = settings.title || 'Enter Raffle';
    document.getElementById('raffle-description').textContent = 'Fill out the form below to enter';

    // Update info display
    const startTime = new Date(settings.startTime);
    const endTime = new Date(settings.endTime);

    document.getElementById('start-time-display').textContent = startTime.toLocaleString();
    document.getElementById('end-time-display').textContent = endTime.toLocaleString();
    document.getElementById('winner-count-display').textContent = settings.winnerCount;

    // Check raffle status
    const now = new Date();
    let status = '';
    let canEnter = false;

    if (now < startTime) {
        status = 'not-started';
        showClosedMessage(`Raffle starts on ${startTime.toLocaleString()}`);
    } else if (now >= startTime && now < endTime) {
        status = 'active';
        canEnter = true;
        updateStatusBadge('Active', 'active');
    } else {
        status = 'ended';
        showClosedMessage(`Raffle ended on ${endTime.toLocaleString()}`);
    }

    if (!canEnter) {
        document.getElementById('entry-form-card').style.display = 'none';
    }
}

function updateStatusBadge(text, className) {
    const badge = document.getElementById('raffle-status');
    badge.textContent = text;
    badge.className = `status-badge ${className}`;
}

function showClosedMessage(message) {
    document.getElementById('entry-form-card').style.display = 'none';
    document.getElementById('closed-card').style.display = 'block';
    document.getElementById('closed-message').textContent = message;
}

// ============================================
// ENTRY MODE SWITCHING
// ============================================

function switchEntryMode(mode) {
    currentEntryMode = mode;

    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Toggle field visibility
    const emailGroup = document.getElementById('email-group');
    const cookieGroup = document.getElementById('cookie-group');
    const emailInput = document.getElementById('participant-email');
    const cookieInput = document.getElementById('participant-cookie');

    if (mode === 'cookie') {
        emailGroup.style.display = 'none';
        cookieGroup.style.display = 'block';
        emailInput.required = false;
        cookieInput.required = true;
    } else {
        emailGroup.style.display = 'block';
        cookieGroup.style.display = 'none';
        emailInput.required = true;
        cookieInput.required = false;
    }
}

// ============================================
// ENTRY SUBMISSION
// ============================================

function submitEntry(e) {
    e.preventDefault();

    const name = document.getElementById('participant-name').value.trim();
    const phone = document.getElementById('participant-phone').value.trim();
    const agreeTerms = document.getElementById('agree-terms').checked;

    let email = '';
    let cookie = '';

    // Get email or cookie based on mode
    if (currentEntryMode === 'cookie') {
        cookie = document.getElementById('participant-cookie').value.trim();
        // Use cookie as the unique identifier (stored as email)
        email = cookie; // Cookie will be stored as email
    } else {
        email = document.getElementById('participant-email').value.trim();
    }

    // Validation
    if (!name || !email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!agreeTerms) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }

    // Check for duplicate
    const entries = getEntries();
    const duplicate = entries.find(entry => entry.email === email);

    if (duplicate) {
        showNotification(currentEntryMode === 'cookie' ? 'This cookie has already been entered in the raffle' : 'This email has already been entered in the raffle', 'error');
        return;
    }

    // Create entry
    const entry = {
        id: Date.now(),
        name,
        email, // For cookie mode, this contains the cookie
        phone,
        timestamp: new Date().toISOString(),
        submittedFrom: currentEntryMode === 'cookie' ? 'cookie' : 'public',
        isCookieEntry: currentEntryMode === 'cookie'
    };

    // Save entry
    entries.push(entry);
    saveEntries(entries);

    // Show success
    if (currentEntryMode === 'cookie') {
        showSuccess('your cookie submission');
    } else {
        showSuccess(email);
    }
    showNotification('Entry submitted successfully!', 'success');
}

function showSuccess(email) {
    document.getElementById('entry-form-card').style.display = 'none';
    document.getElementById('success-card').style.display = 'block';
    document.getElementById('confirmation-email').textContent = `A confirmation has been sent to ${email}`;

    // Scroll to success message
    document.getElementById('success-card').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function submitAnother() {
    document.getElementById('entry-form-card').style.display = 'block';
    document.getElementById('success-card').style.display = 'none';
    document.getElementById('entry-form').reset();

    // Scroll to form
    document.getElementById('entry-form-card').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ============================================
// DATA MANAGEMENT
// ============================================

function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
}

function getEntries() {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

// ============================================
// UTILITIES
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        background: type === 'success' ? 'rgba(34, 197, 94, 0.9)' : type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(139, 92, 246, 0.9)',
        color: 'white',
        borderRadius: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: '600',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
