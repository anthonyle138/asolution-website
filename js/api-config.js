// ============================================
// API CONFIGURATION
// ============================================

// IMPORTANT: Update this to your server's API URL
const API_BASE_URL = 'http://128.199.133.218/api';  // Your lazada server

const API_ENDPOINTS = {
    SETTINGS: `${API_BASE_URL}/settings.php`,
    ENTRIES: `${API_BASE_URL}/entries.php`,
    WINNERS: `${API_BASE_URL}/winners.php`,
    BULK: `${API_BASE_URL}/bulk.php`
};

// API Helper Functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Specific API methods
const API = {
    // Settings
    getSettings: () => apiRequest(API_ENDPOINTS.SETTINGS),
    saveSettings: (settings) => apiRequest(API_ENDPOINTS.SETTINGS, {
        method: 'POST',
        body: JSON.stringify(settings)
    }),

    // Entries
    getEntries: () => apiRequest(API_ENDPOINTS.ENTRIES),
    addEntry: (entry) => apiRequest(API_ENDPOINTS.ENTRIES, {
        method: 'POST',
        body: JSON.stringify(entry)
    }),
    deleteEntry: (id) => apiRequest(`${API_ENDPOINTS.ENTRIES}?id=${id}`, {
        method: 'DELETE'
    }),

    // Winners
    getWinners: (publishedOnly = false) => apiRequest(`${API_ENDPOINTS.WINNERS}?published=${publishedOnly}`),
    drawWinners: () => apiRequest(API_ENDPOINTS.WINNERS, {
        method: 'POST',
        body: JSON.stringify({ action: 'draw' })
    }),
    publishWinners: () => apiRequest(API_ENDPOINTS.WINNERS, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish' })
    }),
    clearWinners: () => apiRequest(API_ENDPOINTS.WINNERS, {
        method: 'DELETE'
    }),

    // Bulk operations
    importEntries: (entries) => apiRequest(API_ENDPOINTS.BULK, {
        method: 'POST',
        body: JSON.stringify({ action: 'import_entries', entries })
    }),
    clearAllEntries: () => apiRequest(API_ENDPOINTS.BULK, {
        method: 'POST',
        body: JSON.stringify({ action: 'clear_entries' })
    }),
    resetRaffle: () => apiRequest(API_ENDPOINTS.BULK, {
        method: 'POST',
        body: JSON.stringify({ action: 'reset_raffle' })
    })
};
