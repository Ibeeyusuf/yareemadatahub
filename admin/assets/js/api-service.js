class YareemaAPI {
    constructor() {
        this.baseURL = API_CONFIG?.BASE_URL || 'https://vtu-api-d3q2.onrender.com';
        this.token = this.getToken();
    }

    // Token Management
    getToken() {
        return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }

    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('admin_token', token);
        } else {
            sessionStorage.setItem('admin_token', token);
        }
        this.token = token;
    }

    clearToken() {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
        this.token = null;
    }

    // HTTP Request Handler with proper response handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log(`API Request: ${url} ${config.method}`);
            
            const response = await fetch(url, config);
            
            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                console.log(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            // Try to parse JSON response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                // If we can't parse JSON, create error object
                data = {
                    message: `Server returned ${response.status}: ${response.statusText}`,
                    error: 'Invalid JSON response'
                };
            }

            console.log(`API Response (${response.status}):`, data);

            // Handle HTTP errors
            if (!response.ok) {
                // 401 Unauthorized - Auto logout (but prevent redirect loop)
                if (response.status === 401) {
                    console.error('401 Unauthorized - Logging out');
                    this.clearToken();
                    
                    // Prevent redirect loop - only redirect if not already on login page
                    const currentPage = window.location.pathname.split('/').pop();
                    if (currentPage !== 'login.html' && currentPage !== 'index.html') {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'error',
                                title: 'Session Expired',
                                text: 'Your session has expired. Please login again.',
                                confirmButtonText: 'Go to Login',
                                allowOutsideClick: false
                            }).then(() => {
                                window.location.href = 'login.html';
                            });
                        } else {
                            alert('Session expired. Please login again.');
                            window.location.href = 'login.html';
                        }
                    }
                    throw new Error('Unauthorized - Session expired');
                }

                // 403 Forbidden
                if (response.status === 403) {
                    throw new Error(data.message || 'Access forbidden - insufficient permissions');
                }

                // 404 Not Found
                if (response.status === 404) {
                    throw new Error(data.message || 'Resource not found');
                }

                // 400 Validation Error
                if (response.status === 400) {
                    throw new Error(data.message || 'Invalid request data');
                }

                // 500 Server Error
                if (response.status >= 500) {
                    throw new Error(data.message || 'Server error - please try again later');
                }

                // Generic error
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            // CORS error detection
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network/CORS Error:', error);
                console.error('This could be:');
                console.error('1. Network connection issue');
                console.error('2. CORS policy blocking the request');
                console.error('3. API server is down');
                console.error('API URL:', url);
                throw new Error('Cannot connect to server. Please check:\n1. Your internet connection\n2. API server status\n3. CORS configuration');
            }
            
            // Parse JSON error (API returned non-JSON response)
            if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
                console.error('JSON Parse Error:', error);
                throw new Error('Server error - invalid response format');
            }

            // Re-throw API errors
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================
    
    async login(email, password) {
        const response = await this.request('/api/v1/auth/login', {
            method: 'POST',
            body: { email, password },
            skipAuth: true
        });
        
        console.log('Login API Response:', response);
        
        // Handle different API response structures
        // Structure 1: { status: "success", token, refreshToken, data: { user } }
        // Structure 2: { success: true, token, user }
        // Structure 3: { token, user }
        
        const token = response.token || response.data?.token || response.accessToken;
        const user = response.data?.user || response.user || {};
        const refreshToken = response.refreshToken || response.refresh_token;
        
        if (token) {
            // Store token in BOTH localStorage and sessionStorage for reliability
            localStorage.setItem('admin_token', token);
            sessionStorage.setItem('admin_token', token);
            this.token = token;
            
            // Store refresh token and user data if available
            if (refreshToken) {
                localStorage.setItem('admin_refresh_token', refreshToken);
            }
            if (user && Object.keys(user).length > 0) {
                localStorage.setItem('admin_user', JSON.stringify(user));
            }
            
            console.log('Token stored successfully');
            
            return {
                success: true,
                token: token,
                refreshToken: refreshToken,
                user: user,
                message: response.message || 'Login successful'
            };
        }
        
        // If no token in response, login failed
        const errorMessage = response.message || response.error || 'Login failed - no token received';
        console.error('Login failed:', errorMessage);
        throw new Error(errorMessage);
    }

    async logout() {
        this.clearToken();
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    }

    // ==================== DASHBOARD ====================
    
    async getDashboardStats() {
        const response = await this.request('/api/v1/admin/dashboard');
        // API returns: { status: "success", data: { overview, transactionBreakdown, recentTransactions, revenueTrend, providerStatus, charts } }
        return response;
    }

    // ==================== USER MANAGEMENT ====================
    
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/users${queryString ? '?' + queryString : ''}`);
    }

    async getUserDetails(userId) {
        return await this.request(`/api/v1/admin/users/${userId}`);
    }

    async suspendUser(userId, reason) {
        return await this.request(`/api/v1/admin/users/${userId}/suspend`, {
            method: 'PUT',
            body: { reason }
        });
    }

    async activateUser(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/activate`, {
            method: 'PUT',
            body: {}
        });
    }

    async resetUserPIN(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/reset-pin`, {
            method: 'PUT',
            body: {}
        });
    }

    // ==================== AGENT MANAGEMENT ====================

    // Dedicated agents endpoint — supports commission filters, state, isVerified
    async getAgents(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        ).toString();
        return await this.request(`/api/v1/agents/agents${queryString ? '?' + queryString : ''}`);
    }

    async getAgentDetails(agentId) {
        return await this.request(`/api/v1/agents/agents/${agentId}`);
    }

    async createAgent(agentData) {
        return await this.request('/api/v1/agents/agents', {
            method: 'POST',
            body: agentData
        });
    }

    async updateAgent(agentId, updates) {
        return await this.request(`/api/v1/agents/agents/${agentId}`, {
            method: 'PUT',
            body: updates
        });
    }

    async verifyAgentDocuments(agentId, documentType, status, remarks) {
        return await this.request(`/api/v1/agents/agents/${agentId}/verify-documents`, {
            method: 'POST',
            body: { documentType, status, remarks }
        });
    }

    async getAgentPerformance(agentId, period = 'monthly') {
        return await this.request(`/api/v1/agents/agents/${agentId}/performance?period=${period}`);
    }

    async getAgentCommissionReport(agentId, params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        ).toString();
        return await this.request(`/api/v1/agents/agents/${agentId}/commission-report${queryString ? '?' + queryString : ''}`);
    }

    async processCommissionWithdrawal(agentId, amount, paymentMethod, reference) {
        return await this.request(`/api/v1/agents/agents/${agentId}/withdraw-commission`, {
            method: 'POST',
            body: { amount, paymentMethod, reference }
        });
    }

    async suspendAgent(agentId, reason) {
        return await this.request(`/api/v1/admin/users/${agentId}/suspend`, {
            method: 'PUT',
            body: { reason }
        });
    }

    async activateAgent(agentId) {
        return await this.request(`/api/v1/admin/users/${agentId}/activate`, {
            method: 'PUT',
            body: {}
        });
    }

    // ==================== PENDING AGENTS & ROLE ACTIONS ====================

    async getPendingAgents(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        ).toString();
        return await this.request(`/api/v1/admin/pending-agents${queryString ? '?' + queryString : ''}`);
    }

    async approveAgent(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/approve-agent`, {
            method: 'PUT',
            body: {}
        });
    }

    async rejectAgent(userId, reason) {
        return await this.request(`/api/v1/admin/users/${userId}/reject-agent`, {
            method: 'PUT',
            body: { reason }
        });
    }

    async assignRole(userId, roles) {
        // roles is an array e.g. ["client", "agent"]
        return await this.request(`/api/v1/admin/users/${userId}/assign-role`, {
            method: 'PUT',
            body: { roles }
        });
    }

    async lockAccount(userId, reason) {
        return await this.request(`/api/v1/admin/users/${userId}/lock`, {
            method: 'PUT',
            body: { reason }
        });
    }

    async unlockAccount(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/unlock`, {
            method: 'PUT',
            body: {}
        });
    }

    // ==================== PROVIDER HEALTH ====================

    async checkProviderHealth(providerName) {
        return await this.request(`/api/v1/admin/check-provider/${providerName}`);
    }

    // ==================== WALLET MANAGEMENT ====================
    
    async getWallets(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/wallets${queryString ? '?' + queryString : ''}`);
    }

    async getUserWallet(userId) {
        return await this.request(`/api/v1/admin/wallets/${userId}`);
    }

    async creditWallet(userId, amount, reason, reference) {
        return await this.request(`/api/v1/admin/wallets/${userId}/credit`, {
            method: 'POST',
            body: { amount, reason, reference }
        });
    }

    async debitWallet(userId, amount, reason, reference) {
        return await this.request(`/api/v1/admin/wallets/${userId}/debit`, {
            method: 'POST',
            body: { amount, reason, reference }
        });
    }

    async lockWallet(userId, reason) {
        return await this.request(`/api/v1/admin/wallets/${userId}/lock`, {
            method: 'PUT',
            body: { reason }
        });
    }

    async unlockWallet(userId) {
        return await this.request(`/api/v1/admin/wallets/${userId}/unlock`, {
            method: 'PUT',
            body: {}
        });
    }

    // ==================== TRANSACTION MANAGEMENT ====================
    
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/transactions${queryString ? '?' + queryString : ''}`);
    }

    async getTransactionDetails(transactionId) {
        return await this.request(`/api/v1/admin/transactions/${transactionId}`);
    }

    async refundTransaction(transactionId, reason) {
        return await this.request(`/api/v1/admin/transactions/${transactionId}/refund`, {
            method: 'POST',
            body: { reason }
        });
    }

    async retryFailedTransactions(type, provider, limit = 10) {
        return await this.request('/api/v1/admin/transactions/retry-failed', {
            method: 'POST',
            body: { type, provider, limit }
        });
    }

    // ==================== PRICING MANAGEMENT ====================
    
    async getServicePricing(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/pricing${queryString ? '?' + queryString : ''}`);
    }

    async createServicePricing(pricingData) {
        return await this.request('/api/v1/admin/pricing', {
            method: 'POST',
            body: pricingData
        });
    }

    async updateServicePricing(pricingId, updates) {
        return await this.request(`/api/v1/admin/pricing/${pricingId}`, {
            method: 'PUT',
            body: updates
        });
    }

    async deleteServicePricing(pricingId) {
        return await this.request(`/api/v1/admin/pricing/${pricingId}`, {
            method: 'DELETE'
        });
    }

    // ==================== PROVIDER MANAGEMENT ====================
    
    async getProviders(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/providers${queryString ? '?' + queryString : ''}`);
    }

    async updateProviderStatus(providerName, statusData) {
        return await this.request(`/api/v1/admin/providers/${providerName}/status`, {
            method: 'PUT',
            body: statusData
        });
    }

    // ==================== ADMIN LOGS ====================
    
    async getAdminLogs(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/admin/logs${queryString ? '?' + queryString : ''}`);
    }

    // ==================== NOTIFICATIONS ====================
    
    // POST /api/v1/admin/broadcast — login announcement (popup when user logs in)
    async broadcastNotification(notificationData) {
        return await this.request('/api/v1/admin/broadcast', {
            method: 'POST',
            body: notificationData
        });
    }

    // POST /api/v1/notifications/admin/broadcast — bell notification (user sees in bell modal)
    async bellBroadcast(notificationData) {
        return await this.request('/api/v1/notifications/admin/broadcast', {
            method: 'POST',
            body: notificationData
        });
    }

    // ==================== STAFF MANAGEMENT ====================

    // GET /api/v1/admin/staff?page=1&limit=20&role=admin
    async getStaff(params = {}) {
        const qs = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        ).toString();
        return await this.request(`/api/v1/admin/staff${qs ? '?' + qs : ''}`);
    }

    // GET /api/v1/admin/staff/:id
    async getStaffById(id) {
        return await this.request(`/api/v1/admin/staff/${id}`);
    }

    // POST /api/v1/admin/staff
    // body: { firstName, lastName, email, phoneNumber, role }
    async createStaff(payload) {
        return await this.request('/api/v1/admin/staff', {
            method: 'POST',
            body: payload
        });
    }

    // PUT /api/v1/admin/staff/:id
    // body: { firstName, lastName, email, phoneNumber, role }
    async updateStaff(id, payload) {
        return await this.request(`/api/v1/admin/staff/${id}`, {
            method: 'PUT',
            body: payload
        });
    }

    // DELETE /api/v1/admin/staff/:id
    async deleteStaff(id) {
        return await this.request(`/api/v1/admin/staff/${id}`, {
            method: 'DELETE'
        });
    }

        // ==================== SYSTEM SETTINGS ====================
    
    async getSystemSettings() {
        return await this.request('/api/v1/admin/settings');
    }

    async updateSystemSettings(settings) {
        return await this.request('/api/v1/admin/settings', {
            method: 'PUT',
            body: { settings }
        });
    }

    // ==================== DATA EXPORT ====================
    
    async exportData(exportParams) {
        return await this.request('/api/v1/admin/export', {
            method: 'POST',
            body: exportParams
        });
    }

    // ==================== REPORTS ====================

    async getReportsDashboard() {
        return await this.request('/api/v1/admin/dashboard');
    }

    async getTransactionReport(type = 'monthly') {
        return await this.request(`/api/v1/reports/transactions?type=${type}`);
    }

    async getFinancialReport(type = 'monthly') {
        return await this.request(`/api/v1/reports/financial?type=${type}`);
    }

    async getUserReport(type = 'monthly') {
        return await this.request(`/api/v1/reports/users?type=${type}`);
    }

    async getAgentReport(type = 'monthly') {
        return await this.request(`/api/v1/reports/agents?type=${type}`);
    }

    async getServiceReport(type = 'monthly') {
        return await this.request(`/api/v1/reports/services?type=${type}`);
    }

    // ==================== NOTIFICATIONS ====================

    async getNotifications() {
        return await this.request('/api/v1/notifications');
    }

    async getUnreadNotificationCount() {
        return await this.request('/api/v1/notifications/unread-count');
    }

    async markNotificationRead(notificationId) {
        return await this.request(`/api/v1/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsRead() {
        return await this.request('/api/v1/notifications/mark-all-read', {
            method: 'PUT'
        });
    }

    async deleteNotification(notificationId) {
        return await this.request(`/api/v1/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    }

    async deleteAllNotifications() {
        return await this.request('/api/v1/notifications', {
            method: 'DELETE'
        });
    }

    // ==================== VTU CONSOLE ====================

    // GET /api/v1/console/providers
    async consoleGetProviders() {
        return await this.request('/api/v1/console/providers');
    }

    // GET /api/v1/console/providers/config
    // Returns serviceRouting: { data, airtime, airtimepin, education, electricity, cable, airtime2cash }
    async consoleGetConfig() {
        return await this.request('/api/v1/console/providers/config');
    }

    // POST /api/v1/console/config
    // body: { serviceRouting: { data, airtime, ... } }
    async consoleSaveConfig(serviceRouting) {
        return await this.request('/api/v1/console/config', {
            method: 'POST',
            body: { serviceRouting }
        });
    }

    // POST /api/v1/console/switch
    // body: { service, providerId }  — backend requires 'providerId' not 'provider'
    async consoleSwitchProvider(service, providerId) {
        return await this.request('/api/v1/console/switch', {
            method: 'POST',
            body: { service, providerId }
        });
    }

    // POST /api/v1/console/health  — test all providers
    async consoleHealthCheckAll() {
        return await this.request('/api/v1/console/health', {
            method: 'POST',
            body: {}
        });
    }

    // POST /api/v1/console/providers/:providerId/health  — test one provider
    async consoleHealthCheckOne(providerId) {
        return await this.request(`/api/v1/console/providers/${providerId}/health`, {
            method: 'POST',
            body: {}
        });
    }

    // GET /api/v1/console/balances  — all provider balances
    async consoleGetBalances() {
        return await this.request('/api/v1/console/balances');
    }

    // GET /api/v1/console/logs?page=1&limit=50
    async consoleGetLogs(page = 1, limit = 50) {
        return await this.request(`/api/v1/console/logs?page=${page}&limit=${limit}`);
    }

    // PUT /api/v1/console/providers/:providerId/status
    // body: { status: 'active' | 'maintenance' | 'inactive', maintenanceMessage?, maintenanceStart?, maintenanceEnd? }
    async consoleUpdateProviderStatus(providerId, statusData) {
        return await this.request(`/api/v1/console/providers/${providerId}/status`, {
            method: 'PUT',
            body: statusData
        });
    }

    // GET /api/v1/console/providers/:providerId/stats
    async consoleGetProviderStats(providerId) {
        return await this.request(`/api/v1/console/providers/${providerId}/stats`);
    }

    // GET /api/v1/console/providers/:providerId/balance
    async consoleGetProviderBalance(providerId) {
        return await this.request(`/api/v1/console/providers/${providerId}/balance`);
    }

    // GET /api/v1/console/bill-payment/providers
    async consoleGetBillProviders() {
        return await this.request('/api/v1/console/bill-payment/providers');
    }

    // POST /api/v1/console/bill-payment/switch
    // body: { service: 'electricity' | 'cable_tv', provider: 'smeplug' }
    async consoleSwitchBillProvider(service, provider) {
        return await this.request('/api/v1/console/bill-payment/switch', {
            method: 'POST',
            body: { service, provider }
        });
    }
}

// Create global API instance
const api = new YareemaAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YareemaAPI;
}