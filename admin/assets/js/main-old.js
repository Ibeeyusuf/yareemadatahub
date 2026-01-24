// Yareema Admin Panel - Main JavaScript

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    loadPartials();
});

// Load HTML partials
async function loadPartials() {
    const partials = ['sidebar', 'header'];
    
    for (const partial of partials) {
        const element = document.getElementById(`${partial}-placeholder`);
        if (element) {
            try {
                const response = await fetch(`partials/${partial}.html`);
                const html = await response.text();
                element.innerHTML = html;
                lucide.createIcons();
            } catch (error) {
                console.error(`Error loading ${partial}:`, error);
            }
        }
    }
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    lucide.createIcons();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-amber-600'
    };

    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`;
    toast.innerHTML = `
        <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Tab Switching Functions
function switchTransactionTab(tab) {
    document.querySelectorAll('.txn-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');
}

function switchFinancialTab(tab) {
    document.querySelectorAll('.fin-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');

    document.querySelectorAll('.financial-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`financial-${tab}`).classList.remove('hidden');
    lucide.createIcons();
}

function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');
}

function switchNetwork(network) {
    document.querySelectorAll('.network-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');

    document.getElementById('currentNetwork').textContent = network.toUpperCase();
    document.getElementById('currentNetworkLower').textContent = network;
}

// User Management Functions
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function submitAddUser(e) {
    e.preventDefault();
    showToast('User added successfully', 'success');
    closeModal('addUserModal');
    e.target.reset();
}

function submitSuspendUser(e) {
    e.preventDefault();
    showToast('User suspended successfully', 'success');
    closeModal('suspendUserModal');
    e.target.reset();
}

// Wallet Functions
function processCreditWallet(e) {
    e.preventDefault();
    showToast('Wallet credited successfully', 'success');
    e.target.reset();
}

function processDebitWallet(e) {
    e.preventDefault();
    showToast('Wallet debited successfully', 'success');
    e.target.reset();
}

// Transaction Functions
function retryTransaction(txnId) {
    showToast(`Retrying transaction ${txnId}...`, 'info');
    setTimeout(() => {
        showToast('Transaction retry successful', 'success');
    }, 2000);
}

function cancelTransaction(txnId) {
    if (confirm('Are you sure you want to cancel this transaction?')) {
        showToast(`Transaction ${txnId} cancelled`, 'success');
    }
}

// Financial Functions
function calculateProfit(input) {
    const row = input.closest('tr');
    const costInput = row.querySelector('input[type="number"]:nth-of-type(1)');
    const sellingInput = row.querySelector('input[type="number"]:nth-of-type(2)');
    const profitCell = row.querySelector('.profit-cell');
    const marginCell = row.querySelector('.margin-cell');

    const cost = parseFloat(costInput.value) || 0;
    const selling = parseFloat(sellingInput.value) || 0;
    const profit = selling - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;

    profitCell.textContent = `$${profit.toFixed(2)}`;
    marginCell.textContent = `${margin}%`;
}

function applyBulkAdjustment() {
    const type = document.getElementById('bulkAdjustType').value;
    const value = parseFloat(document.getElementById('bulkAdjustValue').value);

    if (!value) {
        showToast('Please enter a value', 'error');
        return;
    }

    const checkboxes = document.querySelectorAll('.price-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Please select at least one item', 'error');
        return;
    }

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const costInput = row.querySelector('input[type="number"]:nth-of-type(1)');
        const sellingInput = row.querySelector('input[type="number"]:nth-of-type(2)');
        const cost = parseFloat(costInput.value) || 0;

        if (type === 'increase') {
            const newSelling = cost * (1 + value / 100);
            sellingInput.value = newSelling.toFixed(2);
        } else if (type === 'decrease') {
            const newSelling = cost * (1 - value / 100);
            sellingInput.value = newSelling.toFixed(2);
        } else if (type === 'margin') {
            const newSelling = cost * (1 + value / 100);
            sellingInput.value = newSelling.toFixed(2);
        }

        calculateProfit(sellingInput);
    });

    showToast(`Bulk adjustment applied to ${checkboxes.length} items`, 'success');
}

function savePricing() {
    showToast('Pricing changes saved successfully', 'success');
}

function updateMarginDisplay(value) {
    document.getElementById('marginDisplay').textContent = value + '%';
}

// API Functions
function testAllAPIs() {
    showToast('Testing all APIs...', 'info');
    setTimeout(() => {
        showToast('All APIs tested successfully', 'success');
    }, 2000);
}

function testAPIConnection() {
    showToast('Testing API connection...', 'info');
    setTimeout(() => {
        showToast('API connection successful', 'success');
    }, 1500);
}

function submitAPIConfig(e) {
    e.preventDefault();
    showToast('API configuration saved', 'success');
    closeModal('apiConfigModal');
}

// Report Functions
function generateReport(type) {
    showToast(`Generating ${type} report...`, 'info');
    setTimeout(() => {
        showToast('Report generated successfully', 'success');
    }, 2000);
}

// Settings Functions
function saveSettings() {
    showToast('Settings saved successfully', 'success');
}

// Modal Click Outside to Close
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
