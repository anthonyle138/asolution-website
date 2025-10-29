// ============================================
// RAFFLE RESULTS DISPLAY
// ============================================

const STORAGE_KEYS = {
    SETTINGS: 'raffle_settings',
    ENTRIES: 'raffle_entries',
    WINNERS: 'raffle_winners'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadResults();
});

// ============================================
// LOAD AND DISPLAY RESULTS
// ============================================

function loadResults() {
    const settings = getSettings();
    const entries = getEntries();
    const winners = getWinners();

    if (!winners || winners.length === 0) {
        showNoResults();
        return;
    }

    // Update raffle info
    if (settings) {
        document.getElementById('raffle-title').textContent = settings.title || 'Raffle Results';
        document.getElementById('raffle-description').textContent = `Winners drawn on ${new Date(winners[0].drawnAt).toLocaleDateString()}`;
    }

    // Update stats
    document.getElementById('total-entries').textContent = entries.length;
    document.getElementById('winner-count').textContent = winners.length;
    document.getElementById('draw-date').textContent = new Date(winners[0].drawnAt).toLocaleString();

    // Display winners
    displayWinners(winners);
}

function displayWinners(winners) {
    const container = document.getElementById('winners-container');
    const winnersSection = document.getElementById('winners-section');
    const rankEmojis = ['🥇', '🥈', '🥉'];

    container.innerHTML = winners.map((winner, index) => {
        const emoji = rankEmojis[index] || '🏅';
        return `
            <div class="winner-card animate-in" style="animation-delay: ${index * 0.1}s">
                <div class="winner-rank">${emoji}</div>
                <div class="winner-name">${escapeHtml(winner.name)}</div>
                ${winner.email ? `<div class="winner-email">${escapeHtml(winner.email)}</div>` : ''}
                <div style="margin-top: 12px; font-size: 0.875rem; color: var(--color-text-secondary); font-family: var(--font-mono);">
                    Rank #${winner.rank}
                </div>
            </div>
        `;
    }).join('');

    winnersSection.style.display = 'block';
}

function showNoResults() {
    document.getElementById('winners-section').style.display = 'none';
    document.getElementById('no-results').style.display = 'block';

    // Hide raffle info
    document.querySelector('.raffle-info-card').style.display = 'none';
}

// ============================================
// DATA RETRIEVAL
// ============================================

function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
}

function getEntries() {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
}

function getWinners() {
    const data = localStorage.getItem(STORAGE_KEYS.WINNERS);
    return data ? JSON.parse(data) : null;
}

// ============================================
// UTILITIES
// ============================================

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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
    }

    .winner-card {
        transition: all 0.3s ease;
    }

    .winner-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
    }
`;
document.head.appendChild(style);
