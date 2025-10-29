// ============================================
// RAFFLE ADMIN LOGIC (WITH API)
// ============================================

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

async function loadSettings() {
    try {
        const settings = await API.getSettings();

        if (settings) {
            document.getElementById('raffle-title').value = settings.title || '';
            document.getElementById('start-time').value = settings.start_time ? settings.start_time.slice(0, 16) : '';
            document.getElementById('end-time').value = settings.end_time ? settings.end_time.slice(0, 16) : '';
            document.getElementById('winner-count').value = settings.winner_count || 1;

            updateRaffleStatus(settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings(e) {
    e.preventDefault();

    const title = document.getElementById('raffle-title').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const winnerCount = parseInt(document.getElementById('winner-count').value);

    try {
        const settings = {
            title,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            winner_count: winnerCount
        };

        await API.saveSettings(settings);
        updateRaffleStatus(settings);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

async function updateRaffleStatus(settings) {
    const now = new Date();
    const startTime = new Date(settings.start_time);
    const endTime = new Date(settings.end_time);
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
    try {
        const response = await API.getWinners();
        if (response.winners && response.winners.length > 0) {
            // Check if published
            const hasPublished = response.winners.some(w => w.published === 1);
            if (hasPublished) {
                status = 'drawn';
                statusText = 'Winners Drawn';
                canDraw = false;
                drawStatus.textContent = 'Winners already published';
            } else {
                drawStatus.textContent = 'Winners drawn but not published';
            }
        }
    } catch (error) {
        console.error('Error checking winners:', error);
    }

    // Update UI
    statusBadge.textContent = statusText;
    statusBadge.className = `status-badge ${status}`;
    drawButton.disabled = !canDraw;
}

// ============================================
// ENTRIES MANAGEMENT
// ============================================

async function loadEntries() {
    try {
        const entries = await API.getEntries();
        renderEntries(entries);
        updateEntryCount(entries.length);
    } catch (error) {
        console.error('Error loading entries:', error);
        renderEntries([]);
        updateEntryCount(0);
    }
}

async function addEntry(e) {
    e.preventDefault();

    const name = document.getElementById('entry-name').value.trim();
    const email = document.getElementById('entry-email').value.trim();

    if (!name) {
        showNotification('Please enter a name', 'error');
        return;
    }

    try {
        const entry = {
            name,
            email: email || null,
            phone: null,
            submitted_from: 'admin'
        };

        await API.addEntry(entry);

        // Reload entries
        await loadEntries();

        // Clear form
        document.getElementById('add-entry-form').reset();
        showNotification('Entry added successfully!', 'success');
    } catch (error) {
        console.error('Error adding entry:', error);
        showNotification(error.message || 'Failed to add entry', 'error');
    }
}

async function removeEntry(id) {
    if (!confirm('Are you sure you want to remove this entry?')) {
        return;
    }

    try {
        await API.deleteEntry(id);
        await loadEntries();
        showNotification('Entry removed', 'success');
    } catch (error) {
        console.error('Error removing entry:', error);
        showNotification('Failed to remove entry', 'error');
    }
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
                ${entry.submitted_from ? `<span class="entry-badge">${entry.submitted_from}</span>` : ''}
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

async function importBulkEntries() {
    const textarea = document.getElementById('bulk-entries');
    const text = textarea.value.trim();

    if (!text) {
        showNotification('Please paste entries to import', 'error');
        return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    const entries = [];

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const email = parts[1] || '';

        if (name) {
            entries.push({
                name,
                email: email || null,
                phone: null
            });
        }
    });

    if (entries.length === 0) {
        showNotification('No valid entries found', 'error');
        return;
    }

    try {
        await API.bulkImport(entries);
        await loadEntries();
        textarea.value = '';
        showNotification(`Imported ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}!`, 'success');
    } catch (error) {
        console.error('Error importing entries:', error);
        showNotification('Failed to import entries', 'error');
    }
}

// ============================================
// DRAW WINNERS
// ============================================

async function drawWinners() {
    try {
        const settings = await API.getSettings();
        const entries = await API.getEntries();

        if (!settings) {
            showNotification('Please save raffle settings first', 'error');
            return;
        }

        if (entries.length === 0) {
            showNotification('No entries to draw from', 'error');
            return;
        }

        if (entries.length < settings.winner_count) {
            showNotification(`Not enough entries. Need at least ${settings.winner_count} entries.`, 'error');
            return;
        }

        // Call API to draw winners
        const response = await API.drawWinners();

        if (response.winners) {
            displayWinnersPreview(response.winners);
        } else {
            showNotification('Failed to draw winners', 'error');
        }
    } catch (error) {
        console.error('Error drawing winners:', error);
        showNotification(error.message || 'Failed to draw winners', 'error');
    }
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

    showNotification('Winners selected! Review and publish.', 'success');
}

async function publishResults() {
    if (!confirm('Are you sure you want to publish these results? This cannot be undone.')) {
        return;
    }

    try {
        const response = await API.publishWinners();

        showNotification('Results published successfully!', 'success');

        // Reload settings to update status
        await loadSettings();

        // Redirect to results page
        setTimeout(() => {
            window.location.href = 'raffle-results.html';
        }, 1500);
    } catch (error) {
        console.error('Error publishing winners:', error);
        showNotification(error.message || 'Failed to publish winners', 'error');
    }
}

// ============================================
// DANGER ZONE
// ============================================

async function clearAllEntries() {
    if (!confirm('Are you sure you want to delete ALL entries? This cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all participant data. Are you absolutely sure?')) {
        return;
    }

    try {
        await API.clearAllEntries();
        await loadEntries();
        showNotification('All entries cleared', 'success');
    } catch (error) {
        console.error('Error clearing entries:', error);
        showNotification('Failed to clear entries', 'error');
    }
}

async function resetRaffle() {
    if (!confirm('This will reset the entire raffle (settings, entries, and winners). Are you sure?')) {
        return;
    }

    if (!confirm('This action cannot be undone. Continue?')) {
        return;
    }

    try {
        // Clear all data via API
        await API.clearAllEntries();
        await API.clearWinners();

        showNotification('Raffle reset successfully', 'success');

        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error resetting raffle:', error);
        showNotification('Failed to reset raffle', 'error');
    }
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
