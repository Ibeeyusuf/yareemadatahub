// Main JavaScript Module

// Language Management
let currentLanguage = 'en';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ha' : 'en';
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = currentLanguage.toUpperCase();
    }
    
    document.querySelectorAll('[data-en]').forEach(el => {
        if (el.hasAttribute('data-' + currentLanguage)) {
            el.textContent = el.getAttribute('data-' + currentLanguage);
        }
    });

    showToast(currentLanguage === 'en' ? 'Language changed to English' : 'An canza harshe zuwa Hausa', 'info');
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
    toast.className = `toast ${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3`;
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

// Modal Management
function openModal(modalId, data) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // Handle specific modal data
        if (modalId === 'educationModal' && data) {
            window.currentEducationType = data;
            const titles = {
                waec: 'Buy WAEC PIN',
                neco: 'Buy NECO PIN',
                jamb: 'Buy JAMB PIN'
            };
            const titleEl = document.getElementById('educationModalTitle');
            if (titleEl) {
                titleEl.textContent = titles[data];
            }
            const qtyInput = document.getElementById('educationQty');
            if (qtyInput) {
                qtyInput.value = 1;
            }
            if (window.calculateEducationCost) {
                window.calculateEducationCost();
            }
        }
        
        lucide.createIcons();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Sidebar Toggle (Mobile)
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

// Update page title
function updatePageTitle(page) {
    const titles = {
        dashboard:   { en: 'Dashboard',         ha: 'Dashboard' },
        earnings:    { en: 'My Earnings',        ha: 'Kudin Da Na Samu' },
        data:        { en: 'Buy Data',           ha: 'Sayi Data' },
        airtime:     { en: 'Buy Airtime',        ha: 'Sayi Airtime' },
        electricity: { en: 'Pay Bills',          ha: 'Biya Kudin Wuta' },
        cable:       { en: 'Cable TV',           ha: 'Cable TV' },
        education:   { en: 'Education PINs',     ha: 'PIN Karatu' },
        sms:         { en: 'Bulk SMS',           ha: 'SMS Da Yawa' },
        customers:   { en: 'My Customers',       ha: 'Abokan Ciniki Na' },
        wallet:      { en: 'Wallet',             ha: 'Wallet' },
        reports:     { en: 'Reports',            ha: 'Rahotanni' },
        settings:    { en: 'Settings',           ha: 'Saitunan' },
        profile:     { en: 'My Profile',         ha: 'Bayanan Ni' },
        'rrr-payment': { en: 'RRR Payment',      ha: 'RRR Payment' }
    };

    const title = titles[page] || { en: 'Dashboard', ha: 'Dashboard' };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = title[currentLanguage];
    }
}

// Format currency
function formatCurrency(amount) {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize page
function initPage() {
    // Protect page
    if (typeof Auth !== 'undefined') {
        Auth.protectPage();
    }
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Load agent data
    loadAgentData();
}

// ─── Sidebar Integration ──────────────────────────────────────────────────────

/**
 * initSidebar() — call this immediately after injecting sidebar.html into the DOM.
 * Reads agent data from localStorage and populates all sidebar fields.
 * Also highlights the active nav item for the current page.
 */
function initSidebar() {
    // 1. Populate agent info from localStorage
    try {
        var agent = API.getAgentData();
        if (agent) {
            var name = agent.fullName ||
                (agent.firstName ? (agent.firstName + ' ' + (agent.lastName || '')).trim() : null) ||
                agent.name || 'Agent';

            var agentId = (agent.agentInfo && agent.agentInfo.agentId) ||
                           agent.agentId || agent.id || '—';

            // walletBalance stored separately under 'agentWalletBalance' key
            // OR from dashboard stats (stored by AgentDashboard.updateStats)
            var balance = parseFloat(localStorage.getItem('agentWalletBalance') || '0');

            var nameEl   = document.getElementById('sidebarAgentName');
            var idEl     = document.getElementById('sidebarAgentId');
            var avatarEl = document.getElementById('sidebarAgentAvatar');
            var balEl    = document.getElementById('walletBalance');

            if (nameEl)   nameEl.textContent   = name;
            if (idEl)     idEl.textContent     = agentId;
            if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
            if (balEl)    balEl.textContent    = balance.toLocaleString('en-NG', { minimumFractionDigits: 2 });
        }
    } catch (e) {
        console.error('[initSidebar] Error populating agent data:', e);
    }

    // 2. Active nav highlight (handles ?type= query for service.html)
    try {
        var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        var currentType = new URLSearchParams(window.location.search).get('type');

        document.querySelectorAll('.nav-item').forEach(function(link) {
            var lPage = link.getAttribute('data-page');
            var lType = link.getAttribute('data-type');
            var active = false;

            if (lPage === currentPage) {
                active = (currentPage === 'service.html') ? (lType === currentType) : !lType;
            }

            if (active) {
                link.classList.add('bg-slate-700', 'text-white');
                link.classList.remove('text-slate-300');
            }
        });
    } catch (e) {
        console.error('[initSidebar] Error setting active nav:', e);
    }

    // 3. Fetch live wallet balance from API and update display
    updateSidebarBalance();
}

/**
 * updateSidebarBalance() — fetches wallet balance from API and updates sidebar.
 * Stores result in localStorage so it's available instantly on next page load.
 */
async function updateSidebarBalance() {
    try {
        if (typeof WalletAPI === 'undefined') return;
        var result = await WalletAPI.getBalance();
        if (result.success && result.data) {
            var balance = result.data.balance || result.data.availableBalance ||
                          result.data.walletBalance || 0;
            balance = parseFloat(balance);

            // Store so next page load shows correct balance immediately
            localStorage.setItem('agentWalletBalance', balance.toString());

            // Update all balance displays on current page
            var balEl = document.getElementById('walletBalance');
            if (balEl) balEl.textContent = balance.toLocaleString('en-NG', { minimumFractionDigits: 2 });

            document.querySelectorAll('[data-wallet-balance]').forEach(function(el) {
                el.textContent = UI.formatCurrency(balance);
            });
        }
    } catch (e) {
        // Silent — balance display stays at stored value
    }
}

// ─── Legacy compatibility — keep loadAgentData for any page that calls it ─────
function loadAgentData() {
    initSidebar();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page
    if (document.getElementById('appContainer') || document.querySelector('.page-container')) {
        initPage();
    }
});

// ─── Modal Handler Functions ──────────────────────────────────────────────────

function _modalMsg(id, message, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'text-sm p-3 rounded-lg ' + (type === 'success'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200');
    el.textContent = message;
    el.classList.remove('hidden');
    if (type === 'success') setTimeout(() => el.classList.add('hidden'), 4000);
}

function _modalBtnLoading(id, loading, label) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Please wait...'
        : '<span>' + label + '</span>';
}

async function handleWithdrawalSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    if (!amount || amount < 1000) {
        _modalMsg('withdrawMsg', 'Minimum withdrawal amount is ₦1,000', 'error');
        return;
    }
    _modalBtnLoading('withdrawSubmitBtn', true, 'Confirm Withdrawal');
    try {
        const result = await WalletAPI.withdraw({ amount });
        if (result.success) {
            _modalMsg('withdrawMsg', result.message || 'Withdrawal request submitted!', 'success');
            document.getElementById('withdrawAmount').value = '';
            setTimeout(() => closeModal('withdrawModal'), 2000);
        } else {
            _modalMsg('withdrawMsg', result.message || 'Withdrawal failed. Please try again.', 'error');
        }
    } catch (err) {
        _modalMsg('withdrawMsg', err.message || 'An error occurred. Please try again.', 'error');
    } finally {
        _modalBtnLoading('withdrawSubmitBtn', false, 'Confirm Withdrawal');
    }
}

function calculateEducationCost() {
    const qty = parseInt(document.getElementById('educationQty')?.value || 1);
    const pricePerPin = window._educationPinPrice || 3500;
    const commissionRate = window._educationCommissionRate || 5;
    const cost = qty * pricePerPin;
    const commission = cost * commissionRate / 100;
    const costEl = document.getElementById('educationCost');
    const commEl = document.getElementById('educationCommission');
    if (costEl) costEl.textContent = UI.formatCurrency(cost);
    if (commEl) commEl.textContent = UI.formatCurrency(commission);
}

async function handleEducationPurchase(e) {
    e.preventDefault();
    const phone = document.getElementById('educationPhone')?.value.trim();
    const qty   = parseInt(document.getElementById('educationQty')?.value || 1);
    const examType = window.currentEducationType || 'waec';

    if (!phone || phone.length < 10) {
        _modalMsg('educationMsg', 'Please enter a valid phone number.', 'error');
        return;
    }
    _modalBtnLoading('educationSubmitBtn', true, 'Buy PIN');
    try {
        const result = await AgentServices.payBill({ serviceType: 'education', examType, quantity: qty, phoneNumber: phone });
        if (result.success) {
            _modalMsg('educationMsg', result.message || 'Education PIN purchased successfully!', 'success');
            setTimeout(() => closeModal('educationModal'), 2000);
        } else {
            _modalMsg('educationMsg', result.message || 'Purchase failed. Please try again.', 'error');
        }
    } catch (err) {
        _modalMsg('educationMsg', err.message || 'An error occurred. Please try again.', 'error');
    } finally {
        _modalBtnLoading('educationSubmitBtn', false, 'Buy PIN');
    }
}

async function handleAddCustomer(e) {
    e.preventDefault();
    const name  = document.getElementById('customerName')?.value.trim();
    const phone = document.getElementById('customerPhone')?.value.trim();
    const email = document.getElementById('customerEmail')?.value.trim();

    if (!name)  { _modalMsg('addCustomerMsg', 'Please enter the customer name.', 'error'); return; }
    if (!phone || phone.length < 10) { _modalMsg('addCustomerMsg', 'Please enter a valid phone number.', 'error'); return; }

    _modalBtnLoading('addCustomerSubmitBtn', true, 'Add Customer');
    try {
        const result = await API.post('/agent/customers', { fullName: name, phoneNumber: phone, email: email || undefined });
        if (result.success || result.status === 'success') {
            _modalMsg('addCustomerMsg', result.message || 'Customer added successfully!', 'success');
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('customerEmail').value = '';
            if (typeof loadCustomers === 'function') setTimeout(loadCustomers, 1500);
            setTimeout(() => closeModal('addCustomerModal'), 2000);
        } else {
            _modalMsg('addCustomerMsg', result.message || 'Failed to add customer.', 'error');
        }
    } catch (err) {
        _modalMsg('addCustomerMsg', err.message || 'An error occurred. Please try again.', 'error');
    } finally {
        _modalBtnLoading('addCustomerSubmitBtn', false, 'Add Customer');
    }
}

async function handleChangePIN(e) {
    e.preventDefault();
    const current = document.getElementById('currentPIN')?.value;
    const newPin  = document.getElementById('newPIN')?.value;
    const confirm = document.getElementById('confirmPIN')?.value;

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        _modalMsg('changePINMsg', 'PIN must be exactly 4 digits.', 'error'); return;
    }
    if (newPin !== confirm) {
        _modalMsg('changePINMsg', 'New PIN and confirmation do not match.', 'error'); return;
    }
    _modalBtnLoading('changePINSubmitBtn', true, 'Update PIN');
    try {
        const result = await API.put('/agent/change-pin', { currentPin: current, newPin });
        if (result.success || result.status === 'success') {
            _modalMsg('changePINMsg', result.message || 'PIN updated successfully!', 'success');
            ['currentPIN', 'newPIN', 'confirmPIN'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            setTimeout(() => closeModal('changePINModal'), 2000);
        } else {
            _modalMsg('changePINMsg', result.message || 'Failed to update PIN.', 'error');
        }
    } catch (err) {
        _modalMsg('changePINMsg', err.message || 'An error occurred. Please try again.', 'error');
    } finally {
        _modalBtnLoading('changePINSubmitBtn', false, 'Update PIN');
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword')?.value;
    const newPass  = document.getElementById('newPassword')?.value;
    const confirm  = document.getElementById('confirmPassword')?.value;

    if (!newPass || newPass.length < 8) {
        _modalMsg('changePasswordMsg', 'New password must be at least 8 characters.', 'error'); return;
    }
    if (newPass !== confirm) {
        _modalMsg('changePasswordMsg', 'Passwords do not match.', 'error'); return;
    }
    _modalBtnLoading('changePasswordSubmitBtn', true, 'Update Password');
    try {
        const result = await API.put('/agent/change-password', { currentPassword: current, newPassword: newPass });
        if (result.success || result.status === 'success') {
            _modalMsg('changePasswordMsg', result.message || 'Password updated successfully!', 'success');
            ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            setTimeout(() => closeModal('changePasswordModal'), 2000);
        } else {
            _modalMsg('changePasswordMsg', result.message || 'Failed to update password.', 'error');
        }
    } catch (err) {
        _modalMsg('changePasswordMsg', err.message || 'An error occurred. Please try again.', 'error');
    } finally {
        _modalBtnLoading('changePasswordSubmitBtn', false, 'Update Password');
    }
}

// Populate withdraw modal balance when opened — hook into openModal
const _openModal_orig = openModal;
window.openModal = function openModal(modalId, data) {
    _openModal_orig(modalId, data);
    if (modalId === 'withdrawModal' && typeof WalletAPI !== 'undefined') {
        WalletAPI.getBalance().then(r => {
            if (r.success && r.data) {
                const b = r.data.balance || r.data.availableBalance || 0;
                const el = document.getElementById('withdrawAvailableBalance');
                if (el) el.textContent = UI.formatCurrency(b);
                const input = document.getElementById('withdrawAmount');
                if (input) input.max = b;
            }
        }).catch(() => {});
    }
};
