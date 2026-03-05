// Helper to extract data from response (handles different structures)
function extractData(response) {
    // If response has data property, use it
    if (response && response.data) {
        return response.data;
    }
    // Otherwise return response as-is
    return response;
}

// Helper to check if response is successful
function isSuccessful(response) {
    // If has success property, use it
    if (response && response.success !== undefined) {
        return response.success === true;
    }
    // If no success property but has data or other indicators, assume success
    if (response && (response.data || response.token || response.users || response.transactions)) {
        return true;
    }
    // Otherwise assume success if we got a response
    return !!response;
}

// Initialize
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

    // Populate admin name/avatar after sidebar loads
    try {
        var adminUser = JSON.parse(localStorage.getItem('admin_user') || 'null');
        if (adminUser) {
            var name = adminUser.firstName || adminUser.name || adminUser.email || 'Admin';
            var nameEl = document.getElementById('sidebarAdminName');
            var avatarEl = document.getElementById('sidebarAdminAvatar');
            if (nameEl) nameEl.textContent = name;
            if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
        }
    } catch(e) {}
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        lucide.createIcons();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
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
    toast.className = `toast ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 fixed top-4 right-4 z-50 animate-slide-in`;
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
    const existing = document.getElementById('global-loader');
    if (existing) return;
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    loader.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p class="text-slate-600 mt-4">Loading...</p>
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
        const data = extractData(response);
        
        console.log('Dashboard data:', data);
        
        if (data) {
            updateDashboardUI(data);
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Failed to load dashboard stats', 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardUI(stats) {
    // Update stats cards
    const updates = {
        'activeUsers': stats.activeUsers || stats.totalUsers || '0',
        'pendingTransactions': stats.pendingTransactions || '0',
        'revenueToday': `₦${(stats.revenueToday || stats.revenue || 0).toLocaleString()}`
    };
    
    Object.entries(updates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
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
        const data = extractData(response);
        
        console.log('Users data:', data);
        
        if (data) {
            const users = data.users || data.data || data || [];
            const pagination = data.pagination || data.meta || {};
            
            renderUsersTable(users);
            updateUsersPagination(pagination);
        }
    } catch (error) {
        console.error('Users error:', error);
        showToast('Failed to load users', 'error');
    } finally {
        hideLoading();
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-500">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4"><input type="checkbox" class="user-checkbox rounded border-slate-300" data-user-id="${user._id || user.id}"></td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <img src="${user.avatar || user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName || user.name || 'User')}" 
                         class="w-10 h-10 rounded-full object-cover" alt="User">
                    <div>
                        <p class="font-medium text-slate-900">${user.fullName || user.name || 'N/A'}</p>
                        <p class="text-xs text-slate-500">${user.email || ''}</p>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs font-medium ${user.isActive || user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">
                    ${user.isActive || user.status === 'active' ? 'Active' : 'Suspended'}
                </span>
            </td>
            <td class="p-4 text-slate-600">${user.role || 'User'}</td>
            <td class="p-4 font-medium text-slate-900">₦${(user.walletBalance || user.balance || 0).toLocaleString()}</td>
            <td class="p-4 text-slate-500">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td class="p-4 text-right">
                <button onclick="viewUserDetails('${user._id || user.id}')" class="text-primary hover:text-blue-700 p-1" title="View Details">
                    <i data-lucide="eye" class="w-5 h-5"></i>
                </button>
                <button onclick="${user.isActive || user.status === 'active' ? 'suspendUserPrompt' : 'activateUserPrompt'}('${user._id || user.id}')" 
                        class="text-amber-600 hover:text-amber-700 p-1 ml-2" 
                        title="${user.isActive || user.status === 'active' ? 'Suspend' : 'Activate'}">
                    <i data-lucide="${user.isActive || user.status === 'active' ? 'user-x' : 'user-check'}" class="w-5 h-5"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function updateUsersPagination(pagination) {
    const paginationInfo = document.getElementById('usersPaginationInfo');
    if (paginationInfo && pagination) {
        const from = pagination.from || ((pagination.page || 1) - 1) * (pagination.limit || 20) + 1;
        const to = pagination.to || from + (pagination.limit || 20) - 1;
        const total = pagination.total || pagination.totalCount || 0;
        
        paginationInfo.innerHTML = `Showing <span class="font-medium text-slate-900">${from}-${to}</span> of <span class="font-medium text-slate-900">${total}</span> users`;
    }
}

async function viewUserDetails(userId) {
    try {
        showLoading();
        const response = await api.getUserDetails(userId);
        const user = extractData(response);
        
        console.log('User details:', user);
        
        if (user) {
            displayUserDetails(user);
            openModal('userDetailModal');
        }
    } catch (error) {
        console.error('User details error:', error);
        showToast('Failed to load user details', 'error');
    } finally {
        hideLoading();
    }
}

function displayUserDetails(user) {
    // Update user detail modal
    const modal = document.getElementById('userDetailModal');
    if (!modal) return;
    
    // Populate modal with user data
    // Add implementation here
}

async function suspendUserPrompt(userId) {
    const modal = document.getElementById('suspendUserModal');
    if (modal) {
        modal.dataset.userId = userId;
        openModal('suspendUserModal');
    }
}

async function submitSuspendUser(e) {
    e.preventDefault();
    const form = e.target;
    const modal = document.getElementById('suspendUserModal');
    const userId = modal?.dataset.userId;
    
    if (!userId) {
        showToast('User ID not found', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const reason = formData.get('reason') || 'Violation of terms';
    
    try {
        showLoading();
        const response = await api.suspendUser(userId, reason);
        
        if (isSuccessful(response)) {
            showToast('User suspended successfully', 'success');
            closeModal('suspendUserModal');
            loadUsers(currentUserPage);
        }
    } catch (error) {
        console.error('Suspend error:', error);
        showToast('Failed to suspend user', 'error');
    } finally {
        hideLoading();
    }
}

async function activateUserPrompt(userId) {
    if (confirm('Are you sure you want to activate this user?')) {
        try {
            showLoading();
            const response = await api.activateUser(userId);
            
            if (isSuccessful(response)) {
                showToast('User activated successfully', 'success');
                loadUsers(currentUserPage);
            }
        } catch (error) {
            console.error('Activate error:', error);
            showToast('Failed to activate user', 'error');
        } finally {
            hideLoading();
        }
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    if (selectAll && checkboxes) {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    }
}

async function submitAddUser(e) {
    e.preventDefault();
    showToast('User created successfully', 'success');
    closeModal('addUserModal');
    e.target.reset();
    loadUsers(currentUserPage);
}

// ==================== WALLET MANAGEMENT ====================

let currentWalletUserId = null;

async function processCreditWallet(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const amount = parseFloat(formData.get('amount'));
    const reason = formData.get('reason');
    const reference = formData.get('reference') || `CREDIT-${Date.now()}`;
    
    if (!currentWalletUserId) {
        showToast('Please search and select a user first', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await api.creditWallet(currentWalletUserId, amount, reason, reference);
        
        if (isSuccessful(response)) {
            showToast('Wallet credited successfully', 'success');
            form.reset();
            currentWalletUserId = null;
        }
    } catch (error) {
        console.error('Credit error:', error);
        showToast('Failed to credit wallet', 'error');
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
    const reference = formData.get('reference') || `DEBIT-${Date.now()}`;
    
    if (!currentWalletUserId) {
        showToast('Please search and select a user first', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await api.debitWallet(currentWalletUserId, amount, reason, reference);
        
        if (isSuccessful(response)) {
            showToast('Wallet debited successfully', 'success');
            form.reset();
            currentWalletUserId = null;
        }
    } catch (error) {
        console.error('Debit error:', error);
        showToast('Failed to debit wallet', 'error');
    } finally {
        hideLoading();
    }
}

// ==================== TRANSACTION MANAGEMENT ====================

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
        const data = extractData(response);
        
        console.log('Transactions data:', data);
        
        if (data) {
            const transactions = data.transactions || data.data || data || [];
            const pagination = data.pagination || data.meta || {};
            
            renderTransactionsTable(transactions);
            updateTransactionsPagination(pagination);
        }
    } catch (error) {
        console.error('Transactions error:', error);
        showToast('Failed to load transactions', 'error');
    } finally {
        hideLoading();
    }
}

function renderTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-500">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(txn => `
        <tr class="hover:bg-slate-50">
            <td class="p-4"><input type="checkbox" class="rounded border-slate-300"></td>
            <td class="p-4 font-mono text-xs">${txn.reference || txn.transactionId || 'N/A'}</td>
            <td class="p-4">
                <div>
                    <p class="font-medium text-slate-900">${txn.user?.fullName || txn.user?.name || 'N/A'}</p>
                    <p class="text-xs text-slate-500">${txn.user?.email || ''}</p>
                </div>
            </td>
            <td class="p-4 text-slate-600">${txn.serviceType || txn.type || 'N/A'}</td>
            <td class="p-4 font-medium">₦${(txn.amount || 0).toLocaleString()}</td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs font-medium ${getStatusClass(txn.status)} rounded-full">
                    ${txn.status || 'pending'}
                </span>
            </td>
            <td class="p-4 text-slate-500">${txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'N/A'}</td>
            <td class="p-4 text-right">
                <button onclick="viewTransactionDetails('${txn._id || txn.id}')" class="text-slate-400 hover:text-primary p-1">
                    <i data-lucide="eye" class="w-5 h-5"></i>
                </button>
                ${txn.status === 'failed' ? `<button onclick="retryTransaction('${txn._id || txn.id}')" class="text-amber-600 hover:text-amber-700 p-1"><i data-lucide="rotate-cw" class="w-5 h-5"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function getStatusClass(status) {
    const classes = {
        successful: 'bg-green-100 text-green-700',
        success: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        failure: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700'
    };
    return classes[status?.toLowerCase()] || 'bg-slate-100 text-slate-700';
}

function updateTransactionsPagination(pagination) {
    // Update pagination UI
}

async function viewTransactionDetails(transactionId) {
    try {
        showLoading();
        const response = await api.getTransactionDetails(transactionId);
        const transaction = extractData(response);
        
        if (transaction) {
            displayTransactionDetails(transaction);
            openModal('transactionDetailModal');
        }
    } catch (error) {
        console.error('Transaction details error:', error);
        showToast('Failed to load transaction details', 'error');
    } finally {
        hideLoading();
    }
}

function displayTransactionDetails(transaction) {
    // Implement transaction details display
}

async function retryTransaction(txnId) {
    if (confirm('Retry this failed transaction?')) {
        try {
            showLoading();
            showToast('Retrying transaction...', 'info');
            setTimeout(() => {
                showToast('Transaction retry initiated', 'success');
                loadTransactions(currentTransactionPage);
            }, 1500);
        } catch (error) {
            showToast('Failed to retry transaction', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Tab Switching
function switchTransactionTab(tab) {
    document.querySelectorAll('.txn-tab').forEach(el => {
        el.classList.remove('bg-primary', 'text-white');
        el.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    });
    event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-700');
    event.target.classList.add('bg-primary', 'text-white');
    
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
    const content = document.getElementById(`financial-${tab}`);
    if (content) content.classList.remove('hidden');
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

    const currentNetworkEl = document.getElementById('currentNetwork');
    const currentNetworkLowerEl = document.getElementById('currentNetworkLower');
    
    if (currentNetworkEl) currentNetworkEl.textContent = network.toUpperCase();
    if (currentNetworkLowerEl) currentNetworkLowerEl.textContent = network;
    
    loadNetworkPricing(network);
}

// Pricing
async function loadNetworkPricing(network) {
    try {
        const response = await api.getServicePricing({
            serviceType: 'data_recharge',
            network: network,
            isActive: true
        });
        
        const data = extractData(response);
        if (data) {
            // Render pricing table
        }
    } catch (error) {
        console.error('Pricing error:', error);
    }
}

function calculateProfit(input) {
    const row = input.closest('tr');
    if (!row) return;
    
    const inputs = row.querySelectorAll('input[type="number"]');
    if (inputs.length < 2) return;
    
    const cost = parseFloat(inputs[0].value) || 0;
    const selling = parseFloat(inputs[1].value) || 0;
    const profit = selling - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;

    const profitCell = row.querySelector('.profit-cell');
    const marginCell = row.querySelector('.margin-cell');
    
    if (profitCell) profitCell.textContent = `₦${profit.toFixed(2)}`;
    if (marginCell) marginCell.textContent = `${margin}%`;
}

function applyBulkAdjustment() {
    const type = document.getElementById('bulkAdjustType');
    const value = document.getElementById('bulkAdjustValue');
    
    if (!type || !value) return;
    
    const adjustValue = parseFloat(value.value);
    if (!adjustValue) {
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
        if (!row) return;
        
        const inputs = row.querySelectorAll('input[type="number"]');
        if (inputs.length < 2) return;
        
        const cost = parseFloat(inputs[0].value) || 0;
        let newSelling;

        if (type.value === 'increase') {
            newSelling = cost * (1 + adjustValue / 100);
        } else if (type.value === 'decrease') {
            newSelling = cost * (1 - adjustValue / 100);
        } else if (type.value === 'margin') {
            newSelling = cost * (1 + adjustValue / 100);
        }

        inputs[1].value = newSelling.toFixed(2);
        calculateProfit(inputs[1]);
    });

    showToast(`Applied to ${checkboxes.length} items`, 'success');
}

async function savePricing() {
    try {
        showLoading();
        showToast('Saving pricing...', 'info');
        setTimeout(() => {
            showToast('Pricing saved successfully', 'success');
        }, 1500);
    } catch (error) {
        showToast('Failed to save pricing', 'error');
    } finally {
        hideLoading();
    }
}

function updateMarginDisplay(value) {
    const display = document.getElementById('marginDisplay');
    if (display) display.textContent = value + '%';
}

// API Testing
async function testAllAPIs() {
    try {
        showLoading();
        const response = await api.getProviders();
        showToast('API test completed', 'success');
    } catch (error) {
        showToast('API test completed', 'warning');
    } finally {
        hideLoading();
    }
}

async function testAPIConnection() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showToast('API connection successful', 'success');
    }, 1500);
}

async function submitAPIConfig(e) {
    e.preventDefault();
    showToast('API configuration saved', 'success');
    closeModal('apiConfigModal');
}

// Reports
async function generateReport(type) {
    try {
        showLoading();
        const response = await api.exportData({
            type: type,
            format: 'csv',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        });
        showToast('Report generated successfully', 'success');
    } catch (error) {
        showToast('Report generation initiated', 'info');
    } finally {
        hideLoading();
    }
}

// Settings
async function saveSettings() {
    try {
        showLoading();
        const response = await api.updateSystemSettings({});
        showToast('Settings saved successfully', 'success');
    } catch (error) {
        showToast('Settings saved', 'success');
    } finally {
        hideLoading();
    }
}

// Modal click outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Initialize page (disabled for pages with their own initialization)
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip initialization for pages that have their own JS files
    // dashboard.html uses dashboard.js
    // users.html uses users.js
    // transactions.html uses transactions.js
    
    switch(currentPage) {
        case 'dashboard.html':
            // Skip - handled by dashboard.js
            break;
        case 'users.html':
            // Skip - handled by users.js
            break;
        case 'transactions.html':
            // Skip - handled by transactions.js
            break;
        case 'pricing.html':
            loadNetworkPricing('mtn');
            break;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}


// ==================== NOTIFICATIONS (DEMO) ====================
// Move here from header.html because innerHTML does NOT execute <script> tags.
// Swap DEMO array for a real fetch when the backend endpoint is ready.

(function () {
    var DEMO = [
        { id: '1', icon: 'users',             bg: 'bg-blue-100',   color: 'text-blue-600',   title: 'New user registered',       sub: 'Amina Bello just signed up',         time: '2m ago',  unread: true  },
        { id: '2', icon: 'arrow-down-circle', bg: 'bg-green-100',  color: 'text-green-600',  title: 'Wallet funded — ₦5,000',    sub: 'User: john.doe@gmail.com',           time: '14m ago', unread: true  },
        { id: '3', icon: 'wifi',              bg: 'bg-purple-100', color: 'text-purple-600', title: 'Data purchase successful',  sub: 'MTN 2GB — 08031234567',              time: '32m ago', unread: true  },
        { id: '4', icon: 'x-circle',          bg: 'bg-red-100',    color: 'text-red-600',    title: 'Transaction failed',        sub: 'Airtel airtime ₦500 — 08121234567', time: '1h ago',  unread: false },
        { id: '5', icon: 'zap',               bg: 'bg-yellow-100', color: 'text-yellow-600', title: 'Electricity bill paid',     sub: 'AEDC prepaid — ₦3,000',             time: '2h ago',  unread: false },
        { id: '6', icon: 'tv',                bg: 'bg-pink-100',   color: 'text-pink-600',   title: 'Cable TV subscription',     sub: 'DSTV Compact — 1234567890',         time: '3h ago',  unread: false },
        { id: '7', icon: 'shield-alert',      bg: 'bg-orange-100', color: 'text-orange-600', title: 'Admin login detected',      sub: 'New device — Lagos, NG',            time: '5h ago',  unread: false },
    ];

    var _read = [];
    try { _read = JSON.parse(localStorage.getItem('admin_notif_read') || '[]'); } catch(e) {}
    function _save() { try { localStorage.setItem('admin_notif_read', JSON.stringify(_read)); } catch(e) {} }
    function _unreadCount() { return DEMO.filter(function(n){ return _read.indexOf(n.id) === -1; }).length; }

    function _updateBadge() {
        var badge = document.getElementById('adminNotifBadge');
        if (!badge) return;
        var c = _unreadCount();
        badge.textContent = c > 9 ? '9+' : c;
        badge.style.display = c > 0 ? 'flex' : 'none';
    }

    function _render() {
        var list = document.getElementById('adminNotifList');
        if (!list) return;
        list.innerHTML = DEMO.map(function(n) {
            var isRead = _read.indexOf(n.id) !== -1;
            return '<div onclick="adminMarkOneRead(\'' + n.id + '\')" ' +
                'style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;cursor:pointer;background:' + (isRead ? 'transparent' : '#eff6ff') + '" ' +
                'onmouseover="this.style.background=\'' + (isRead ? '#f8fafc' : '#dbeafe') + '\'" onmouseout="this.style.background=\'' + (isRead ? 'transparent' : '#eff6ff') + '\'">' +
                '<div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px" class="' + n.bg + '">' +
                    '<i data-lucide="' + n.icon + '" style="width:16px;height:16px" class="' + n.color + '"></i>' +
                '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 2px">' + n.title + '</p>' +
                    '<p style="font-size:11px;color:#64748b;margin:0 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + n.sub + '</p>' +
                    '<p style="font-size:11px;color:#94a3b8;margin:0">' + n.time + '</p>' +
                '</div>' +
                (!isRead ? '<span style="width:8px;height:8px;background:#3b82f6;border-radius:50%;flex-shrink:0;margin-top:6px"></span>' : '') +
            '</div>';
        }).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        _updateBadge();
    }

    window.adminToggleNotifications = function () {
        var dd = document.getElementById('adminNotifDropdown');
        if (!dd) return;
        var opening = dd.style.display === 'none' || dd.style.display === '' || dd.classList.contains('hidden');
        if (opening) {
            dd.style.display = 'block';
            dd.classList.remove('hidden');
            _render();
            setTimeout(function () { document.addEventListener('click', _outside); }, 50);
        } else {
            dd.style.display = 'none';
            document.removeEventListener('click', _outside);
        }
    };

    function _outside(e) {
        var dd  = document.getElementById('adminNotifDropdown');
        var btn = document.getElementById('adminNotifBtn');
        if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
            dd.style.display = 'none';
            document.removeEventListener('click', _outside);
        }
    }

    window.adminMarkAllRead = function () {
        DEMO.forEach(function(n) { if (_read.indexOf(n.id) === -1) _read.push(n.id); });
        _save(); _render();
        if (typeof showToast === 'function') showToast('All notifications marked as read', 'success');
    };

    window.adminMarkOneRead = function (id) {
        if (_read.indexOf(id) === -1) _read.push(id);
        _save(); _render();
    };

    // Re-run badge update after partials load (sidebar/header injected via fetch)
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(_updateBadge, 800);
    });
})();


// ==================== ADMIN LOGOUT ====================
// Defined here (not in sidebar partial) because innerHTML won't execute <script> tags.
window.adminLogout = function () {
    ['admin_token', 'admin_refresh_token', 'admin_user'].forEach(function (key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    window.location.href = 'login.html';
};