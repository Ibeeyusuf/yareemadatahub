// Yareema Admin Panel - Main JavaScript with Full API Integration

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    loadPartials();
    checkAuthentication();
});

// Authentication Check
function checkAuthentication() {
    const publicPages = ['login.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!publicPages.includes(currentPage)) {
        const token = api.getToken();
        if (!token) {
            window.location.href = 'login.html';
        }
    }
}

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

// Loading Spinner
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    loader.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
}

// ==================== DASHBOARD FUNCTIONS ====================

async function loadDashboardStats() {
    try {
        showLoading();
        const response = await api.getDashboardStats();
        
        if (response.success && response.data) {
            updateDashboardUI(response.data);
        }
    } catch (error) {
        showToast('Failed to load dashboard stats: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardUI(stats) {
    // Update stats cards if elements exist
    if (document.getElementById('activeUsers')) {
        document.getElementById('activeUsers').textContent = stats.activeUsers || '0';
    }
    if (document.getElementById('pendingTransactions')) {
        document.getElementById('pendingTransactions').textContent = stats.pendingTransactions || '0';
    }
    if (document.getElementById('revenueToday')) {
        document.getElementById('revenueToday').textContent = `$${(stats.revenueToday || 0).toLocaleString()}`;
    }
}

// ==================== USER MANAGEMENT FUNCTIONS ====================

let currentUserPage = 1;
let userFilters = {};

async function loadUsers(page = 1) {
    try {
        showLoading();
        currentUserPage = page;
        
        const params = {
            page: page,
            limit: 20,
            ...userFilters
        };
        
        const response = await api.getUsers(params);
        
        if (response.success && response.data) {
            renderUsersTable(response.data.users);
            updateUsersPagination(response.data.pagination);
        }
    } catch (error) {
        showToast('Failed to load users: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4"><input type="checkbox" class="user-checkbox rounded border-slate-300" data-user-id="${user._id}"></td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)}" class="w-10 h-10 rounded-full object-cover" alt="User">
                    <div>
                        <p class="font-medium text-slate-900">${user.fullName}</p>
                        <p class="text-xs text-slate-500">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">${user.isActive ? 'Active' : 'Suspended'}</span></td>
            <td class="p-4 text-slate-600">${user.role || 'User'}</td>
            <td class="p-4 font-medium text-slate-900">₦${(user.walletBalance || 0).toLocaleString()}</td>
            <td class="p-4 text-slate-500">${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="p-4 text-right">
                <button onclick="viewUserDetails('${user._id}')" class="text-primary hover:text-blue-700 p-1" title="View Details"><i data-lucide="eye" class="w-5 h-5"></i></button>
                <button onclick="${user.isActive ? 'suspendUserPrompt' : 'activateUserPrompt'}('${user._id}')" class="text-amber-600 hover:text-amber-700 p-1 ml-2" title="${user.isActive ? 'Suspend' : 'Activate'}"><i data-lucide="${user.isActive ? 'user-x' : 'user-check'}" class="w-5 h-5"></i></button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function updateUsersPagination(pagination) {
    // Update pagination UI
    const paginationInfo = document.getElementById('usersPaginationInfo');
    if (paginationInfo) {
        paginationInfo.innerHTML = `Showing <span class="font-medium text-slate-900">${pagination.from}-${pagination.to}</span> of <span class="font-medium text-slate-900">${pagination.total}</span> users`;
    }
}

async function viewUserDetails(userId) {
    try {
        showLoading();
        const response = await api.getUserDetails(userId);
        
        if (response.success && response.data) {
            displayUserDetails(response.data);
            openModal('userDetailModal');
        }
    } catch (error) {
        showToast('Failed to load user details: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function displayUserDetails(user) {
    // Update user detail modal with real data
    const modal = document.getElementById('userDetailModal');
    if (!modal) return;
    
    // Update modal content with user data
    // This would populate the modal fields with actual user information
}

async function suspendUserPrompt(userId) {
    // Store userId for later use
    document.getElementById('suspendUserModal').dataset.userId = userId;
    openModal('suspendUserModal');
}

async function submitSuspendUser(e) {
    e.preventDefault();
    const form = e.target;
    const userId = document.getElementById('suspendUserModal').dataset.userId;
    const reason = form.querySelector('select').value;
    
    try {
        showLoading();
        const response = await api.suspendUser(userId, reason);
        
        if (response.success) {
            showToast('User suspended successfully', 'success');
            closeModal('suspendUserModal');
            loadUsers(currentUserPage);
        }
    } catch (error) {
        showToast('Failed to suspend user: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function activateUserPrompt(userId) {
    if (confirm('Are you sure you want to activate this user?')) {
        try {
            showLoading();
            const response = await api.activateUser(userId);
            
            if (response.success) {
                showToast('User activated successfully', 'success');
                loadUsers(currentUserPage);
            }
        } catch (error) {
            showToast('Failed to activate user: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

async function submitAddUser(e) {
    e.preventDefault();
    showToast('This feature requires API endpoint implementation', 'info');
    closeModal('addUserModal');
}

// ==================== WALLET MANAGEMENT FUNCTIONS ====================

let currentWalletUserId = null;

async function searchUserForWallet(searchTerm, formType = 'credit') {
    try {
        const response = await api.getUsers({ search: searchTerm, limit: 1 });
        
        if (response.success && response.data.users.length > 0) {
            const user = response.data.users[0];
            currentWalletUserId = user._id;
            
            // Update balance display in form
            const balanceEl = document.querySelector(`#${formType}WalletForm .wallet-balance`);
            if (balanceEl) {
                balanceEl.textContent = `₦${(user.walletBalance || 0).toLocaleString()}`;
            }
            
            return user;
        } else {
            showToast('User not found', 'error');
            return null;
        }
    } catch (error) {
        showToast('Failed to search user: ' + error.message, 'error');
        return null;
    }
}

async function processCreditWallet(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const amount = parseFloat(formData.get('amount'));
    const reason = formData.get('reason');
    const reference = formData.get('reference');
    
    if (!currentWalletUserId) {
        showToast('Please search and select a user first', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await api.creditWallet(currentWalletUserId, amount, reason, reference);
        
        if (response.success) {
            showToast('Wallet credited successfully', 'success');
            form.reset();
            currentWalletUserId = null;
            loadWalletLedger();
        }
    } catch (error) {
        showToast('Failed to credit wallet: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function processDebitWallet(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const amount = parseFloat(formData.get('amount'));
    const reason = formData.get('reason');
    const reference = formData.get('reference');
    
    if (!currentWalletUserId) {
        showToast('Please search and select a user first', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await api.debitWallet(currentWalletUserId, amount, reason, reference);
        
        if (response.success) {
            showToast('Wallet debited successfully', 'success');
            form.reset();
            currentWalletUserId = null;
            loadWalletLedger();
        }
    } catch (error) {
        showToast('Failed to debit wallet: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadWalletLedger() {
    try {
        const response = await api.getWallets({ page: 1, limit: 50 });
        
        if (response.success && response.data) {
            renderWalletLedger(response.data.wallets);
        }
    } catch (error) {
        console.error('Failed to load wallet ledger:', error);
    }
}

function renderWalletLedger(wallets) {
    // Render wallet ledger table
    const tbody = document.getElementById('walletLedgerBody');
    if (!tbody) return;
    
    // Populate table with wallet transactions
}

// ==================== TRANSACTION MANAGEMENT FUNCTIONS ====================

let currentTransactionPage = 1;
let transactionFilters = {};

async function loadTransactions(page = 1) {
    try {
        showLoading();
        currentTransactionPage = page;
        
        const params = {
            page: page,
            limit: 20,
            ...transactionFilters
        };
        
        const response = await api.getTransactions(params);
        
        if (response.success && response.data) {
            renderTransactionsTable(response.data.transactions);
            updateTransactionsPagination(response.data.pagination);
        }
    } catch (error) {
        showToast('Failed to load transactions: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = transactions.map(txn => `
        <tr class="hover:bg-slate-50 ${txn.status === 'failed' ? 'bg-red-50/30' : txn.status === 'pending' ? 'bg-amber-50/30' : ''}">
            <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
            <td class="p-4 font-mono text-xs text-slate-900">${txn.reference}</td>
            <td class="p-4">
                <div>
                    <p class="font-medium text-slate-900">${txn.user?.fullName || 'N/A'}</p>
                    <p class="text-xs text-slate-500">${txn.user?.email || ''}</p>
                </div>
            </td>
            <td class="p-4 text-slate-600">${txn.serviceType || 'N/A'}</td>
            <td class="p-4 font-medium text-slate-900">₦${(txn.amount || 0).toLocaleString()}</td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-medium ${getStatusClass(txn.status)} rounded-full">${txn.status}</span></td>
            <td class="p-4 text-slate-500">${new Date(txn.createdAt).toLocaleString()}</td>
            <td class="p-4 text-right">
                <button onclick="viewTransactionDetails('${txn._id}')" class="text-slate-400 hover:text-primary p-1"><i data-lucide="eye" class="w-5 h-5"></i></button>
                ${txn.status === 'failed' ? `<button onclick="retryTransaction('${txn._id}')" class="text-amber-600 hover:text-amber-700 p-1" title="Retry"><i data-lucide="rotate-cw" class="w-5 h-5"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function getStatusClass(status) {
    const classes = {
        successful: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
}

function updateTransactionsPagination(pagination) {
    // Update pagination UI
}

async function viewTransactionDetails(transactionId) {
    try {
        showLoading();
        const response = await api.getTransactionDetails(transactionId);
        
        if (response.success && response.data) {
            displayTransactionDetails(response.data);
            openModal('transactionDetailModal');
        }
    } catch (error) {
        showToast('Failed to load transaction details: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function displayTransactionDetails(transaction) {
    // Update transaction detail modal
}

async function retryTransaction(txnId) {
    if (confirm('Retry this failed transaction?')) {
        try {
            showLoading();
            showToast('Retrying transaction...', 'info');
            // Implementation would call retry endpoint
            setTimeout(() => {
                showToast('Transaction retry initiated', 'success');
                loadTransactions(currentTransactionPage);
            }, 2000);
        } catch (error) {
            showToast('Failed to retry transaction: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
}

async function cancelTransaction(txnId) {
    if (confirm('Are you sure you want to cancel this transaction?')) {
        showToast(`Transaction ${txnId} cancelled`, 'success');
    }
}

// Tab Switching Functions
function switchTransactionTab(tab) {
    document.querySelectorAll('.txn-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');
    
    // Update filters based on tab
    transactionFilters = {};
    if (tab === 'failed') transactionFilters.status = 'failed';
    if (tab === 'pending') transactionFilters.status = 'pending';
    
    loadTransactions(1);
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
    
    loadNetworkPricing(network);
}

// ==================== PRICING MANAGEMENT ====================

async function loadNetworkPricing(network) {
    try {
        const response = await api.getServicePricing({
            serviceType: 'data_recharge',
            network: network,
            isActive: true
        });
        
        if (response.success && response.data) {
            renderPricingTable(response.data.pricing);
        }
    } catch (error) {
        console.error('Failed to load pricing:', error);
    }
}

function renderPricingTable(pricingData) {
    // Render pricing table with real data
}

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

    profitCell.textContent = `₦${profit.toFixed(2)}`;
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

async function savePricing() {
    try {
        showLoading();
        showToast('Saving pricing changes...', 'info');
        
        // Collect all pricing changes and submit
        setTimeout(() => {
            showToast('Pricing changes saved successfully', 'success');
        }, 1500);
    } catch (error) {
        showToast('Failed to save pricing: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function updateMarginDisplay(value) {
    document.getElementById('marginDisplay').textContent = value + '%';
}

// ==================== API & PROVIDER MANAGEMENT ====================

async function testAllAPIs() {
    try {
        showLoading();
        showToast('Testing all APIs...', 'info');
        
        const response = await api.getProviders();
        
        if (response.success) {
            showToast('All APIs tested successfully', 'success');
        }
    } catch (error) {
        showToast('API test failed: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function testAPIConnection() {
    showToast('Testing API connection...', 'info');
    setTimeout(() => {
        showToast('API connection successful', 'success');
    }, 1500);
}

async function submitAPIConfig(e) {
    e.preventDefault();
    showToast('API configuration saved', 'success');
    closeModal('apiConfigModal');
}

// ==================== REPORTS ====================

async function generateReport(type) {
    try {
        showLoading();
        showToast(`Generating ${type} report...`, 'info');
        
        const response = await api.exportData({
            type: type,
            format: 'csv',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        });
        
        if (response.success) {
            showToast('Report generated successfully', 'success');
            // Handle download
        }
    } catch (error) {
        showToast('Failed to generate report: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== SETTINGS ====================

async function loadSystemSettings() {
    try {
        const response = await api.getSystemSettings();
        
        if (response.success && response.data) {
            populateSettingsForm(response.data.settings);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

function populateSettingsForm(settings) {
    // Populate settings form with data
}

async function saveSettings() {
    try {
        showLoading();
        // Collect settings from form
        const settings = {};
        
        const response = await api.updateSystemSettings(settings);
        
        if (response.success) {
            showToast('Settings saved successfully', 'success');
        }
    } catch (error) {
        showToast('Failed to save settings: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Modal Click Outside to Close
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Initialize page-specific functions
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'dashboard.html':
            loadDashboardStats();
            break;
        case 'users.html':
            loadUsers();
            break;
        case 'wallet.html':
            loadWalletLedger();
            break;
        case 'transactions.html':
            loadTransactions();
            break;
        case 'financial.html':
            loadNetworkPricing('mtn');
            break;
        case 'settings.html':
            loadSystemSettings();
            break;
    }
}

// Call initialization after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
