// ============================================
// RAFFLE RESULTS DISPLAY (WITH API)
// ============================================

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadResults();
});

// ============================================
// LOAD AND DISPLAY RESULTS
// ============================================

async function loadResults() {
    try {
        const response = await API.getWinners(true); // Get only published winners

        if (!response.winners || response.winners.length === 0) {
            showNoResults();
            return;
        }

        const winners = response.winners;
        const drawInfo = response.draw_info;

        // Update raffle info
        const settings = await API.getSettings();
        if (settings) {
            document.getElementById('raffle-title').textContent = settings.title || 'Raffle Results';
            if (winners[0].drawn_at) {
                document.getElementById('raffle-description').textContent = `Winners drawn on ${new Date(winners[0].drawn_at).toLocaleDateString()}`;
            }
        }

        // Update stats
        if (drawInfo) {
            document.getElementById('total-entries').textContent = drawInfo.total_entries || 0;
            document.getElementById('winner-count').textContent = drawInfo.winner_count || winners.length;
            if (drawInfo.drawn_at) {
                document.getElementById('draw-date').textContent = new Date(drawInfo.drawn_at).toLocaleString();
            }
        }

        // Display winners
        displayWinners(winners);
    } catch (error) {
        console.error('Error loading results:', error);
        showNoResults();
    }
}

function displayWinners(winners) {
    const container = document.getElementById('winners-container');
    const winnersSection = document.getElementById('winners-section');
    const rankEmojis = ['🥇', '🥈', '🥉'];

    container.innerHTML = winners.map((winner, index) => {
        const emoji = rankEmojis[index] || '🏅';

        // Only show email if it's from 'public' or 'admin' entries
        // Hide cookies (submitted_from='cookie') for privacy
        const showEmail = winner.email && winner.submitted_from !== 'cookie';

        return `
            <div class="winner-card animate-in" style="animation-delay: ${index * 0.1}s">
                <div class="winner-rank">${emoji}</div>
                <div class="winner-name">${escapeHtml(winner.name)}</div>
                ${showEmail ? `<div class="winner-email">${escapeHtml(winner.email)}</div>` : ''}
                <div style="margin-top: 12px; font-size: 0.875rem; color: var(--color-text-secondary); font-family: var(--font-mono);">
                    Rank #${winner.winner_rank}
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
