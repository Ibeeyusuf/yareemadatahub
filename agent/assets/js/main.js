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
        dashboard: { en: 'Dashboard', ha: 'Dashboard' },
        earnings: { en: 'My Earnings', ha: 'Kudin Da Na Samu' },
        data: { en: 'Buy Data', ha: 'Sayi Data' },
        airtime: { en: 'Buy Airtime', ha: 'Sayi Airtime' },
        bills: { en: 'Pay Bills', ha: 'Biya Kudin Wuta' },
        education: { en: 'Education PINs', ha: 'PIN Karatu' },
        sms: { en: 'Bulk SMS', ha: 'SMS Da Yawa' },
        customers: { en: 'My Customers', ha: 'Abokan Ciniki Na' },
        wallet: { en: 'Wallet', ha: 'Wallet' },
        reports: { en: 'Reports', ha: 'Rahotanni' },
        settings: { en: 'Settings', ha: 'Saitunan' }
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

// Load agent data into UI
function loadAgentData() {
    if (typeof Auth !== 'undefined') {
        const agentData = Auth.getAgentData();
        if (agentData) {
            // Update wallet balance
            const walletBalance = document.getElementById('walletBalance');
            if (walletBalance) {
                walletBalance.textContent = agentData.walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 });
            }
            
            // Update agent name
            document.querySelectorAll('.agent-name').forEach(el => {
                el.textContent = agentData.name;
            });
            
            // Update agent ID
            document.querySelectorAll('.agent-id').forEach(el => {
                el.textContent = agentData.id;
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page
    if (document.getElementById('appContainer') || document.querySelector('.page-container')) {
        initPage();
    }
});
