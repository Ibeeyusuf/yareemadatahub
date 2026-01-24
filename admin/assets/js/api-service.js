// Yareema Data Hub API Service
// Complete API Integration for Admin Panel

class YareemaAPI {
    constructor() {
        this.baseURL = 'https://vtu-api-d3q2.onrender.com';
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

    // HTTP Request Handler
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
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    window.location.href = 'login.html';
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================
    
    async login(email, password) {
        const response = await this.request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true
        });
        
        if (response.data && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async logout() {
        this.clearToken();
        window.location.href = 'login.html';
    }

    // ==================== DASHBOARD ====================
    
    async getDashboardStats() {
        return await this.request('/api/v1/admin/dashboard', {
            method: 'GET'
        });
    }

    // ==================== USER MANAGEMENT ====================
    
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/users?${queryString}`, {
            method: 'GET'
        });
    }

    async getUserDetails(userId) {
        return await this.request(`/api/v1/admin/users/${userId}`, {
            method: 'GET'
        });
    }

    async suspendUser(userId, reason) {
        return await this.request(`/api/v1/admin/users/${userId}/suspend`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    }

    async activateUser(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/activate`, {
            method: 'PUT',
            body: JSON.stringify({})
        });
    }

    async resetUserPIN(userId) {
        return await this.request(`/api/v1/admin/users/${userId}/reset-pin`, {
            method: 'PUT',
            body: JSON.stringify({})
        });
    }

    // ==================== WALLET MANAGEMENT ====================
    
    async getWallets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/wallets?${queryString}`, {
            method: 'GET'
        });
    }

    async getUserWallet(userId) {
        return await this.request(`/api/v1/admin/wallets/${userId}`, {
            method: 'GET'
        });
    }

    async creditWallet(userId, amount, reason, reference) {
        return await this.request(`/api/v1/admin/wallets/${userId}/credit`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason, reference })
        });
    }

    async debitWallet(userId, amount, reason, reference) {
        return await this.request(`/api/v1/admin/wallets/${userId}/debit`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason, reference })
        });
    }

    async lockWallet(userId, reason) {
        return await this.request(`/api/v1/admin/wallets/${userId}/lock`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    }

    async unlockWallet(userId) {
        return await this.request(`/api/v1/admin/wallets/${userId}/unlock`, {
            method: 'PUT',
            body: JSON.stringify({})
        });
    }

    // ==================== TRANSACTION MANAGEMENT ====================
    
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/transactions?${queryString}`, {
            method: 'GET'
        });
    }

    async getTransactionDetails(transactionId) {
        return await this.request(`/api/v1/admin/transactions/${transactionId}`, {
            method: 'GET'
        });
    }

    async refundTransaction(transactionId, reason) {
        return await this.request(`/api/v1/admin/transactions/${transactionId}/refund`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    async retryFailedTransactions(type, provider, limit = 10) {
        return await this.request('/api/v1/admin/transactions/retry-failed', {
            method: 'POST',
            body: JSON.stringify({ type, provider, limit })
        });
    }

    // ==================== PRICING MANAGEMENT ====================
    
    async getServicePricing(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/pricing?${queryString}`, {
            method: 'GET'
        });
    }

    async createServicePricing(pricingData) {
        return await this.request('/api/v1/admin/pricing', {
            method: 'POST',
            body: JSON.stringify(pricingData)
        });
    }

    async updateServicePricing(pricingId, updates) {
        return await this.request(`/api/v1/admin/pricing/${pricingId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteServicePricing(pricingId) {
        return await this.request(`/api/v1/admin/pricing/${pricingId}`, {
            method: 'DELETE'
        });
    }

    // ==================== PROVIDER MANAGEMENT ====================
    
    async getProviders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/providers?${queryString}`, {
            method: 'GET'
        });
    }

    async updateProviderStatus(providerName, statusData) {
        return await this.request(`/api/v1/admin/providers/${providerName}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    // ==================== ADMIN LOGS ====================
    
    async getAdminLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/admin/logs?${queryString}`, {
            method: 'GET'
        });
    }

    // ==================== NOTIFICATIONS ====================
    
    async broadcastNotification(notificationData) {
        return await this.request('/api/v1/admin/broadcast', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    }

    // ==================== SYSTEM SETTINGS ====================
    
    async getSystemSettings() {
        return await this.request('/api/v1/admin/settings', {
            method: 'GET'
        });
    }

    async updateSystemSettings(settings) {
        return await this.request('/api/v1/admin/settings', {
            method: 'PUT',
            body: JSON.stringify({ settings })
        });
    }

    // ==================== DATA EXPORT ====================
    
    async exportData(exportParams) {
        return await this.request('/api/v1/admin/export', {
            method: 'POST',
            body: JSON.stringify(exportParams)
        });
    }
}

// Create global API instance
const api = new YareemaAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YareemaAPI;
}
