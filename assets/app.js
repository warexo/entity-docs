/**
 * Warexo Entity Docs - Application JavaScript
 * Handles search, filtering, and interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
    initSearch();
});

/**
 * Initialize search functionality on index page
 */
function initSearch() {
    const searchInput = document.querySelector('[x-model="search"]');
    if (!searchInput) return;

    // Debounce search for performance
    let debounceTimer;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterEntities(e.target.value);
        }, 150);
    });
}

/**
 * Filter entities on the index page
 * @param {string} query - Search query
 */
function filterEntities(query = '') {
    const searchInput = document.querySelector('[x-model="search"]');
    const searchTerm = (query || searchInput?.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.entity-card');
    const selectedBundle = getSelectedBundle();
    
    // Track visible entities per bundle for header visibility
    const visiblePerBundle = {};
    let visibleCount = 0;

    cards.forEach(card => {
        const searchable = card.dataset.searchable || '';
        const bundle = card.dataset.bundle || '';
        
        const matchesSearch = !searchTerm || searchable.includes(searchTerm);
        const matchesBundle = selectedBundle === 'all' || bundle === selectedBundle;
        
        const isVisible = matchesSearch && matchesBundle;
        card.classList.toggle('hidden', !isVisible);
        
        if (isVisible) {
            visibleCount++;
            visiblePerBundle[bundle] = (visiblePerBundle[bundle] || 0) + 1;
        }
    });

    // Show/hide bundle headers based on visible entities
    document.querySelectorAll('.bundle-header').forEach(header => {
        const bundle = header.dataset.bundle;
        const hasVisibleEntities = visiblePerBundle[bundle] > 0;
        header.classList.toggle('hidden', !hasVisibleEntities);
    });

    // Update no-results message visibility
    const noResults = document.querySelector('[x-show*="length === 0"]');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

/**
 * Get currently selected bundle from Alpine.js
 * @returns {string}
 */
function getSelectedBundle() {
    // Try to get from Alpine.js component
    const container = document.querySelector('[x-data]');
    if (container && container._x_dataStack) {
        return container._x_dataStack[0]?.selectedBundle || 'all';
    }
    return 'all';
}

/**
 * Filter table rows by search input
 * @param {HTMLInputElement} input - The search input element
 * @param {string} tableId - The ID of the table to filter
 */
function filterTable(input, tableId) {
    const query = input.value.toLowerCase().trim();
    const table = document.getElementById(tableId);
    
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isMatch = !query || text.includes(query);
        row.classList.toggle('hidden', !isMatch);
    });
}

/**
 * Copy text to clipboard with feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button that triggered the copy
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('bg-green-500');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-500');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

/**
 * Highlight search term in text
 * @param {string} text - Original text
 * @param {string} term - Term to highlight
 * @returns {string} HTML with highlighted term
 */
function highlightTerm(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string}
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
