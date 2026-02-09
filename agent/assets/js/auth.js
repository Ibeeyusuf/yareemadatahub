// Authentication Module - CORRECTED API Integration
const Auth = {
    
    // Check if agent is logged in
    isLoggedIn() {
        const token = API.getToken();
        const agentData = API.getAgentData();
        return !!(token && agentData);
    },
    
    // Get current agent data
    getAgentData() {
        return API.getAgentData();
    },
    
    // Agent Login - CORRECTED
    async login(email, password) {
        try {
            console.log('[Auth] Logging in agent:', email);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_LOGIN, {
                email,
                password
            });
            
            console.log('[Auth] Login response:', response);
            
            // Handle different response structures
            if (response.success || response.status === 'success') {
                const token = response.token || response.data?.token;
                const user = response.user || response.data?.user || response.data?.agent || response.data;
                
                if (token) {
                    API.setToken(token);
                    console.log('[Auth] Token stored successfully');
                }
                
                if (response.refreshToken) {
                    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
                }
                
                if (user) {
                    API.setAgentData(user);
                    console.log('[Auth] Agent data stored successfully');
                }
                
                return {
                    success: true,
                    message: 'Login successful',
                    data: response.data || response
                };
            }
            
            throw new Error(response.message || 'Login failed');
            
        } catch (error) {
            console.error('[Auth] Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed. Please check your credentials and try again.'
            };
        }
    },
    
    // Agent Registration - CORRECTED
    async register(formData) {
        try {
            console.log('[Auth] Registering agent:', formData.email);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_REGISTER, formData);
            
            console.log('[Auth] Registration response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Registration successful. Please check your email for verification.',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Registration failed');
            
        } catch (error) {
            console.error('[Auth] Registration error:', error);
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
    },
    
    // Forgot Password - Uses general auth endpoint
    async forgotPassword(email) {
        try {
            console.log('[Auth] Requesting password reset for:', email);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AUTH_FORGOT_PASSWORD, {
                email
            });
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'OTP sent to your email',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to send OTP');
            
        } catch (error) {
            console.error('[Auth] Forgot password error:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP. Please try again.'
            };
        }
    },
    
    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.AUTH_VERIFY_OTP, {
                email,
                otp,
                verificationType: 'email'
            });
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'OTP verified successfully',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Invalid OTP');
            
        } catch (error) {
            console.error('[Auth] OTP verification error:', error);
            return {
                success: false,
                message: error.message || 'OTP verification failed. Please try again.'
            };
        }
    },
    
    // Reset Password
    async resetPassword(token, newPassword) {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.AUTH_RESET_PASSWORD.replace(':token', token), {
                password: newPassword
            });
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Password reset successful',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Password reset failed');
            
        } catch (error) {
            console.error('[Auth] Reset password error:', error);
            return {
                success: false,
                message: error.message || 'Password reset failed. Please try again.'
            };
        }
    },
    
    // Logout
    logout() {
        console.log('[Auth] Logging out agent');
        API.removeToken();
        window.location.href = 'index.html';
    },
    
    // Protect page - redirect to login if not authenticated
    protectPage() {
        if (!this.isLoggedIn()) {
            console.log('[Auth] Not logged in, redirecting to login');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },
    
    // Initialize auth state on page load
    init() {
        // Check if on login/register pages
        const publicPages = ['index.html', 'register.html', 'forgot-password.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        console.log('[Auth] Initializing on page:', currentPage);
        
        // If logged in and on public page, redirect to dashboard
        if (this.isLoggedIn() && publicPages.includes(currentPage)) {
            console.log('[Auth] Already logged in, redirecting to dashboard');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // If not logged in and on protected page, redirect to login
        if (!this.isLoggedIn() && !publicPages.includes(currentPage)) {
            console.log('[Auth] Not logged in, redirecting to login');
            this.protectPage();
        }
    }
};

// Agent Dashboard API
const AgentDashboard = {
    
    // Get dashboard data
    async getDashboardData() {
        try {
            console.log('[Dashboard] Fetching dashboard data');
            
            const response = await API.get(API_CONFIG.ENDPOINTS.AGENT_DASHBOARD);
            
            console.log('[Dashboard] Response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to load dashboard');
            
        } catch (error) {
            console.error('[Dashboard] Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to load dashboard data'
            };
        }
    },
    
    // Load and display dashboard
    async loadDashboard() {
        try {
            const result = await this.getDashboardData();
            
            if (!result.success) {
                UI.showToast(result.message, 'error');
                return;
            }
            
            const { stats, recentTransactions, serviceBreakdown } = result.data;
            
            // Update stats
            if (stats) {
                this.updateStats(stats);
            }
            
            // Update recent transactions
            if (recentTransactions) {
                this.updateRecentTransactions(recentTransactions);
            }
            
            // Update service breakdown
            if (serviceBreakdown) {
                this.updateServiceBreakdown(serviceBreakdown);
            }
            
        } catch (error) {
            console.error('[Dashboard] Load error:', error);
            UI.showToast('Failed to load dashboard', 'error');
        }
    },
    
    // Update stats cards
    updateStats(stats) {
        // Today's earnings
        const todayEarnings = document.getElementById('today-earnings');
        const todayCount = document.getElementById('today-count');
        
        if (todayEarnings) todayEarnings.textContent = UI.formatCurrency(stats.today?.commission || 0);
        if (todayCount) todayCount.textContent = UI.formatNumber(stats.today?.count || 0);
        
        // Monthly stats
        const monthlyCount = document.getElementById('monthly-count');
        if (monthlyCount) monthlyCount.textContent = UI.formatNumber(stats.monthly?.count || 0);
        
        // Total stats
        const totalEarnings = document.getElementById('total-earnings');
        const totalCount = document.getElementById('total-count');
        const totalAmount = document.getElementById('total-amount');
        
        if (totalEarnings) totalEarnings.textContent = UI.formatCurrency(stats.total?.commission || 0);
        if (totalCount) totalCount.textContent = UI.formatNumber(stats.total?.count || 0);
        if (totalAmount) totalAmount.textContent = UI.formatCurrency(stats.total?.amount || 0);
        
        // Referrals & Commission
        const referralsCount = document.getElementById('referrals-count');
        const availableCommission = document.getElementById('available-commission');
        const totalCommissionEarned = document.getElementById('total-commission-earned');
        
        if (referralsCount) referralsCount.textContent = UI.formatNumber(stats.referrals || 0);
        if (availableCommission) availableCommission.textContent = UI.formatCurrency(stats.availableCommission || 0);
        if (totalCommissionEarned) totalCommissionEarned.textContent = UI.formatCurrency(stats.totalCommissionEarned || 0);
        
        // Wallet balance
        const walletBalanceElements = document.querySelectorAll('[data-wallet-balance]');
        walletBalanceElements.forEach(el => {
            el.textContent = UI.formatCurrency(stats.walletBalance || 0);
        });
    },
    
    // Update recent transactions
    updateRecentTransactions(transactions) {
        const container = document.getElementById('recent-transactions-table');
        if (!container) return;
        
        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500">
                        <svg class="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p>No recent transactions</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const transactionsHTML = transactions.map(txn => {
            const service = txn.service || txn.serviceType || txn.type || 'Transaction';
            const description = txn.description || txn.details || service;
            const customer = txn.customerName || txn.phoneNumber || txn.recipient || 'N/A';
            
            return `
                <tr class="hover:bg-slate-50">
                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            ${this.getServiceIconHTML(service)}
                            <span class="font-medium text-slate-900">${description}</span>
                        </div>
                    </td>
                    <td class="p-4 text-slate-600">${customer}</td>
                    <td class="p-4 font-medium text-slate-900">${UI.formatCurrency(txn.amount || 0)}</td>
                    <td class="p-4 font-bold text-green-600">${UI.formatCurrency(txn.commission || txn.agentCommission || 0)}</td>
                    <td class="p-4">${this.getStatusBadge(txn.status)}</td>
                    <td class="p-4 text-slate-500">${UI.formatDate(txn.createdAt || txn.date)}</td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = transactionsHTML;
    },
    
    // Helper: Get service icon HTML for table
    getServiceIconHTML(service) {
        const serviceLower = (service || '').toLowerCase();
        
        if (serviceLower.includes('data')) {
            return '<i data-lucide="wifi" class="w-4 h-4 text-blue-600"></i>';
        } else if (serviceLower.includes('airtime')) {
            return '<i data-lucide="phone" class="w-4 h-4 text-green-600"></i>';
        } else if (serviceLower.includes('electricity') || serviceLower.includes('power')) {
            return '<i data-lucide="zap" class="w-4 h-4 text-amber-600"></i>';
        } else if (serviceLower.includes('cable') || serviceLower.includes('tv')) {
            return '<i data-lucide="tv" class="w-4 h-4 text-purple-600"></i>';
        } else if (serviceLower.includes('education') || serviceLower.includes('exam')) {
            return '<i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>';
        } else if (serviceLower.includes('sms')) {
            return '<i data-lucide="message-square" class="w-4 h-4 text-pink-600"></i>';
        } else {
            return '<i data-lucide="circle" class="w-4 h-4 text-slate-600"></i>';
        }
    },
    
    // Helper: Get status badge HTML
    getStatusBadge(status) {
        const statusLower = (status || 'pending').toLowerCase();
        
        if (statusLower === 'success' || statusLower === 'successful' || statusLower === 'completed') {
            return '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Success</span>';
        } else if (statusLower === 'pending' || statusLower === 'processing') {
            return '<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>';
        } else if (statusLower === 'failed' || statusLower === 'error') {
            return '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Failed</span>';
        } else {
            return `<span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">${status}</span>`;
        }
    },
    
    // Update service breakdown
    updateServiceBreakdown(services) {
        const container = document.getElementById('service-breakdown');
        if (!container) return;
        
        if (!services || services.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <p>No service data available</p>
                </div>
            `;
            return;
        }
        
        const servicesHTML = services.map(service => `
            <div class="flex items-center justify-between p-3 hover:bg-slate-50 rounded transition-colors">
                <div class="flex items-center gap-3">
                    ${this.getServiceIcon(service.name)}
                    <span class="text-sm font-medium">${service.name}</span>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold">${UI.formatNumber(service.count || 0)}</p>
                    <p class="text-xs text-slate-500">${UI.formatCurrency(service.amount || 0)}</p>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = servicesHTML;
    },
    
    // Helper: Get service icon SVG
    getServiceIcon(service) {
        const serviceLower = (service || '').toLowerCase();
        
        if (serviceLower.includes('data')) {
            return '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>';
        } else if (serviceLower.includes('airtime')) {
            return '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
        } else if (serviceLower.includes('electricity') || serviceLower.includes('power')) {
            return '<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
        } else if (serviceLower.includes('cable') || serviceLower.includes('tv')) {
            return '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
        } else if (serviceLower.includes('education') || serviceLower.includes('exam')) {
            return '<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l-9-5v9a2 2 0 002 2h14a2 2 0 002-2V9l-9 5z"/></svg>';
        } else if (serviceLower.includes('sms')) {
            return '<svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>';
        }
        
        return '<svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>';
    },
    
    // Helper: Get service color
    getServiceColor(service) {
        const serviceLower = (service || '').toLowerCase();
        
        if (serviceLower.includes('data')) return 'bg-blue-100';
        if (serviceLower.includes('airtime')) return 'bg-green-100';
        if (serviceLower.includes('electricity')) return 'bg-yellow-100';
        if (serviceLower.includes('cable')) return 'bg-purple-100';
        if (serviceLower.includes('education')) return 'bg-indigo-100';
        if (serviceLower.includes('sms')) return 'bg-pink-100';
        
        return 'bg-slate-100';
    },
    
    // Helper: Get status class
    getStatusClass(status) {
        const statusLower = (status || '').toLowerCase();
        const classes = {
            'success': 'bg-green-100 text-green-700',
            'completed': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'processing': 'bg-blue-100 text-blue-700',
            'failed': 'bg-red-100 text-red-700',
            'cancelled': 'bg-slate-100 text-slate-700'
        };
        return classes[statusLower] || 'bg-slate-100 text-slate-700';
    }
};

// Agent Profile API
const AgentProfile = {
    
    // Get profile data
    async getProfileData() {
        try {
            console.log('[Profile] Fetching profile data');
            
            const response = await API.get(API_CONFIG.ENDPOINTS.AGENT_PROFILE);
            
            console.log('[Profile] Response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to load profile');
            
        } catch (error) {
            console.error('[Profile] Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to load profile data'
            };
        }
    },
    
    // Populate profile UI
    async populateProfile() {
        try {
            const result = await this.getProfileData();
            
            if (!result.success) {
                UI.showToast(result.message, 'error');
                return;
            }
            
            const agent = result.data.agent || result.data;
            const agentInfo = agent.agentInfo || {};
            
            // Basic Info
            this.updateElement('profile-name', agent.fullName || `${agent.firstName} ${agent.lastName}`);
            this.updateElement('profile-email', agent.email);
            this.updateElement('profile-phone', agent.phoneNumber);
            this.updateElement('profile-agent-id', agentInfo.agentId);
            this.updateElement('profile-referral-code', agentInfo.referralCode);
            
            // Status
            this.updateElement('profile-kyc-status', agent.kycStatus);
            this.updateElement('profile-is-verified', agentInfo.isVerified ? 'Verified' : 'Not Verified');
            this.updateElement('profile-is-active', agent.isActive ? 'Active' : 'Inactive');
            
            // Assigned Area
            if (agentInfo.assignedArea) {
                this.updateElement('profile-state', agentInfo.assignedArea.state);
                this.updateElement('profile-city', agentInfo.assignedArea.city);
            }
            
            // Bank Details
            if (agentInfo.bankDetails) {
                this.updateElement('profile-bank-name', agentInfo.bankDetails.bankName);
                this.updateElement('profile-account-number', agentInfo.bankDetails.accountNumber);
                this.updateElement('profile-account-name', agentInfo.bankDetails.accountName);
                this.updateElement('profile-bank-verified', agentInfo.bankDetails.isVerified ? 'Verified' : 'Not Verified');
            }
            
            // Commission & Performance
            this.updateElement('profile-commission-rate', `${agentInfo.commissionRate || 0}%`);
            this.updateElement('profile-total-commission', UI.formatCurrency(agentInfo.totalCommissionEarned || 0));
            this.updateElement('profile-available-commission', UI.formatCurrency(agentInfo.availableCommission || 0));
            this.updateElement('profile-total-transactions', UI.formatNumber(agentInfo.totalTransactions || 0));
            this.updateElement('profile-total-amount', UI.formatCurrency(agentInfo.totalTransactionAmount || 0));
            this.updateElement('profile-performance-rating', agentInfo.performanceRating || 'N/A');
            this.updateElement('profile-activation-date', UI.formatDate(agentInfo.activationDate));
            
        } catch (error) {
            console.error('[Profile] Population error:', error);
            UI.showToast('Failed to load profile', 'error');
        }
    },
    
    // Helper: Update element text content
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 'N/A';
        }
    }
};

// Global logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
