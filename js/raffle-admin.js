// ============================================
// RAFFLE ADMIN LOGIC
// ============================================

// Storage keys
const STORAGE_KEYS = {
    SETTINGS: 'raffle_settings',
    ENTRIES: 'raffle_entries',
    WINNERS: 'raffle_winners'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadEntries();
    setupEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('raffle-settings-form').addEventListener('submit', saveSettings);
    document.getElementById('add-entry-form').addEventListener('submit', addEntry);
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    const settings = getSettings();

    if (settings) {
        document.getElementById('raffle-title').value = settings.title || '';
        document.getElementById('start-time').value = settings.startTime || '';
        document.getElementById('end-time').value = settings.endTime || '';
        document.getElementById('winner-count').value = settings.winnerCount || 1;

        updateRaffleStatus(settings);
    }
}

function saveSettings(e) {
    e.preventDefault();

    const settings = {
        title: document.getElementById('raffle-title').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        winnerCount: parseInt(document.getElementById('winner-count').value)
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    updateRaffleStatus(settings);
    showNotification('Settings saved successfully!', 'success');
}

function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
}

function updateRaffleStatus(settings) {
    const now = new Date();
    const startTime = new Date(settings.startTime);
    const endTime = new Date(settings.endTime);
    const statusBadge = document.getElementById('raffle-status');
    const drawButton = document.getElementById('draw-button');
    const drawStatus = document.getElementById('draw-status');
    const displayEndTime = document.getElementById('display-end-time');

    // Update display
    displayEndTime.textContent = endTime.toLocaleString();

    // Determine status
    let status = 'not-started';
    let statusText = 'Not Started';
    let canDraw = false;

    if (now < startTime) {
        status = 'not-started';
        statusText = 'Not Started';
        drawStatus.textContent = `Starts ${startTime.toLocaleString()}`;
    } else if (now >= startTime && now < endTime) {
        status = 'active';
        statusText = 'Active';
        drawStatus.textContent = `Ends ${endTime.toLocaleString()}`;
    } else if (now >= endTime) {
        status = 'ended';
        statusText = 'Ended';
        canDraw = true;
        drawStatus.textContent = 'Ready to draw winners';
    }

    // Check if already drawn
    const winners = getWinners();
    if (winners && winners.length > 0) {
        status = 'drawn';
        statusText = 'Winners Drawn';
        canDraw = false;
        drawStatus.textContent = 'Winners already selected';
    }

    // Update UI
    statusBadge.textContent = statusText;
    statusBadge.className = `status-badge ${status}`;
    drawButton.disabled = !canDraw;
}

// ============================================
// ENTRIES MANAGEMENT
// ============================================

function loadEntries() {
    const entries = getEntries();
    renderEntries(entries);
    updateEntryCount(entries.length);
}

function getEntries() {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

function addEntry(e) {
    e.preventDefault();

    const name = document.getElementById('entry-name').value.trim();
    const email = document.getElementById('entry-email').value.trim();

    if (!name) {
        showNotification('Please enter a name', 'error');
        return;
    }

    const entries = getEntries();
    entries.push({
        id: Date.now(),
        name,
        email,
        timestamp: new Date().toISOString()
    });

    saveEntries(entries);
    renderEntries(entries);
    updateEntryCount(entries.length);

    // Clear form
    document.getElementById('add-entry-form').reset();
    showNotification('Entry added successfully!', 'success');
}

function removeEntry(id) {
    if (!confirm('Are you sure you want to remove this entry?')) {
        return;
    }

    const entries = getEntries().filter(entry => entry.id !== id);
    saveEntries(entries);
    renderEntries(entries);
    updateEntryCount(entries.length);
    showNotification('Entry removed', 'success');
}

function renderEntries(entries) {
    const container = document.getElementById('entries-list');

    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 40px;">No entries yet. Add some entries to get started.</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-name">${escapeHtml(entry.name)}</div>
                ${entry.email ? `<div class="entry-email">${escapeHtml(entry.email)}</div>` : ''}
            </div>
            <div class="entry-actions">
                <button class="btn-icon" onclick="removeEntry(${entry.id})" title="Remove">
                    ✕
                </button>
            </div>
        </div>
    `).join('');
}

function updateEntryCount(count) {
    document.getElementById('entry-count').textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
}

// ============================================
// BULK IMPORT
// ============================================

function importBulkEntries() {
    const textarea = document.getElementById('bulk-entries');
    const text = textarea.value.trim();

    if (!text) {
        showNotification('Please paste entries to import', 'error');
        return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    const entries = getEntries();
    let imported = 0;

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const email = parts[1] || '';

        if (name) {
            entries.push({
                id: Date.now() + imported,
                name,
                email,
                timestamp: new Date().toISOString()
            });
            imported++;
        }
    });

    saveEntries(entries);
    renderEntries(entries);
    updateEntryCount(entries.length);
    textarea.value = '';
    showNotification(`Imported ${imported} ${imported === 1 ? 'entry' : 'entries'}!`, 'success');
}

// ============================================
// DRAW WINNERS
// ============================================

function drawWinners() {
    const settings = getSettings();
    const entries = getEntries();

    if (!settings) {
        showNotification('Please save raffle settings first', 'error');
        return;
    }

    if (entries.length === 0) {
        showNotification('No entries to draw from', 'error');
        return;
    }

    if (entries.length < settings.winnerCount) {
        showNotification(`Not enough entries. Need at least ${settings.winnerCount} entries.`, 'error');
        return;
    }

    // Shuffle and select winners
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, settings.winnerCount).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        drawnAt: new Date().toISOString()
    }));

    // Show winners preview
    displayWinnersPreview(winners);
}

function displayWinnersPreview(winners) {
    const preview = document.getElementById('winners-preview');
    const grid = document.getElementById('winners-grid');

    const rankEmojis = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'];

    grid.innerHTML = winners.map((winner, index) => `
        <div class="winner-card">
            <div class="winner-rank">${rankEmojis[index] || '🏅'}</div>
            <div class="winner-name">${escapeHtml(winner.name)}</div>
            ${winner.email ? `<div class="winner-email">${escapeHtml(winner.email)}</div>` : ''}
        </div>
    `).join('');

    preview.style.display = 'block';

    // Temporarily store winners
    sessionStorage.setItem('temp_winners', JSON.stringify(winners));

    showNotification('Winners selected! Review and publish.', 'success');
}

function publishResults() {
    const tempWinners = sessionStorage.getItem('temp_winners');

    if (!tempWinners) {
        showNotification('No winners to publish', 'error');
        return;
    }

    if (!confirm('Are you sure you want to publish these results? This cannot be undone.')) {
        return;
    }

    const winners = JSON.parse(tempWinners);
    localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(winners));
    sessionStorage.removeItem('temp_winners');

    // Update status
    const settings = getSettings();
    if (settings) {
        updateRaffleStatus(settings);
    }

    showNotification('Results published successfully!', 'success');

    // Redirect to results page
    setTimeout(() => {
        window.location.href = 'raffle-results.html';
    }, 1500);
}

function getWinners() {
    const data = localStorage.getItem(STORAGE_KEYS.WINNERS);
    return data ? JSON.parse(data) : null;
}

// ============================================
// DANGER ZONE
// ============================================

function clearAllEntries() {
    if (!confirm('Are you sure you want to delete ALL entries? This cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all participant data. Are you absolutely sure?')) {
        return;
    }

    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    renderEntries([]);
    updateEntryCount(0);
    showNotification('All entries cleared', 'success');
}

function resetRaffle() {
    if (!confirm('This will reset the entire raffle (settings, entries, and winners). Are you sure?')) {
        return;
    }

    if (!confirm('This action cannot be undone. Continue?')) {
        return;
    }

    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.WINNERS);
    sessionStorage.removeItem('temp_winners');

    showNotification('Raffle reset successfully', 'success');

    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ============================================
// UTILITIES
// ============================================

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style
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

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
