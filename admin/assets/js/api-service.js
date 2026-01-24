// Yareema Data Hub API Service - PROPERLY INTEGRATED
// Complete API Integration for Admin Panel

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
            console.log('API Request:', url, config);
            const response = await fetch(url, config);
            
            // Try to parse JSON response
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error('Invalid response format from server');
            }

            console.log('API Response:', response.status, data);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.clearToken();
                if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error('Session expired. Please login again.');
            }

            // Check if response is ok (200-299)
            if (!response.ok) {
                throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
            }

            // Return the data as-is (whether it has success field or not)
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
            body: { email, password },
            skipAuth: true
        });
        
        // Handle different response structures
        if (response.token || (response.data && response.data.token)) {
            const token = response.token || response.data.token;
            const user = response.user || response.data?.user || {};
            
            this.setToken(token);
            
            return {
                success: true,
                data: { token, user },
                message: 'Login successful'
            };
        }
        
        // If response has success field, use it
        if (response.success !== undefined) {
            if (response.success && response.data?.token) {
                this.setToken(response.data.token);
            }
            return response;
        }
        
        // Otherwise assume it's successful if we got here
        return {
            success: true,
            data: response,
            message: 'Login successful'
        };
    }

    async logout() {
        this.clearToken();
        window.location.href = 'login.html';
    }

    // ==================== DASHBOARD ====================
    
    async getDashboardStats() {
        return await this.request('/api/v1/admin/dashboard');
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
    
    async broadcastNotification(notificationData) {
        return await this.request('/api/v1/admin/broadcast', {
            method: 'POST',
            body: notificationData
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
}

// Create global API instance
const api = new YareemaAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YareemaAPI;
}
