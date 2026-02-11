// COMPLETE Yareema Data Hub User API Service
// All User-facing endpoints from Postman collection

class YareemaUserAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    getToken() { return this.token; }
    
    setToken(token) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        this.token = token;
    }

    clearToken() {
        localStorage.clear();
        sessionStorage.clear();
        this.token = null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        
        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = { method: options.method || 'GET', headers, ...options };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 && !window.location.pathname.includes('index.html')) {
                    this.clearToken();
                    window.location.href = '../login.html';
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
            body: { email, password },
            skipAuth: true
        });
        
        const token = response.token || response.data?.token;
        if (token) {
            this.setToken(token);
            localStorage.setItem('user', JSON.stringify(response.user || response.data?.user || {}));
        }
        return response;
    }

    async register(data) {
        return await this.request('/api/v1/auth/register', {
            method: 'POST',
            body: data,
            skipAuth: true
        });
    }

    async verifyOTP(email, otp, verificationType = 'email') {
        return await this.request('/api/v1/auth/verify-otp', {
            method: 'POST',
            body: { email, otp, verificationType },
            skipAuth: true
        });
    }

    async resendOTP(email, verificationType = 'email') {
        return await this.request('/api/v1/auth/resend-otp', {
            method: 'POST',
            body: { email, verificationType },
            skipAuth: true
        });
    }

    async forgotPassword(email) {
        return await this.request('/api/v1/auth/forgot-password', {
            method: 'POST',
            body: { email },
            skipAuth: true
        });
    }

    async resetPassword(token, password) {
        return await this.request(`/api/v1/auth/reset-password/${token}`, {
            method: 'POST',
            body: { password },
            skipAuth: true
        });
    }

    async getProfile() {
        return await this.request('/api/v1/auth/profile');
    }

    async updateProfile(data) {
        return await this.request('/api/v1/auth/profile', {
            method: 'PUT',
            body: data
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/api/v1/auth/change-password', {
            method: 'POST',
            body: { currentPassword, newPassword }
        });
    }

    async setTransactionPIN(transactionPin, confirmPin) {
        return await this.request('/api/v1/auth/set-transaction-pin', {
            method: 'POST',
            body: { transactionPin, confirmPin }
        });
    }

    // ==================== WALLET ====================
    
    async getWalletBalance() {
        return await this.request('/api/v1/wallet/balance');
    }

    async getTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/wallet/transactions${query ? '?' + query : ''}`);
    }

    async fundWallet(data) {
        return await this.request('/api/v1/wallet/fund', {
            method: 'POST',
            body: data
        });
    }

    async withdrawFunds(data) {
        return await this.request('/api/v1/wallet/withdraw', {
            method: 'POST',
            body: data
        });
    }

    async transferFunds(data) {
        return await this.request('/api/v1/wallet/transfer', {
            method: 'POST',
            body: data
        });
    }

    async setWalletPIN(transactionPin, confirmPin) {
        return await this.request('/api/v1/wallet/set-pin', {
            method: 'POST',
            body: { transactionPin, confirmPin }
        });
    }

    // ==================== TELECOM ====================
    
    async getDataPlans(network) {
        return await this.request(`/api/v1/telecom/data/plans?network=${network.toLowerCase()}`);
    }

    async purchaseData(phoneNumber, network, planId, transactionPin) {
        return await this.request('/api/v1/telecom/data/purchase', {
            method: 'POST',
            body: { phoneNumber, network: network.toLowerCase(), planId, transactionPin }
        });
    }

    async purchaseAirtime(phoneNumber, network, amount, transactionPin) {
        return await this.request('/api/v1/telecom/airtime/purchase', {
            method: 'POST',
            body: { phoneNumber, network: network.toLowerCase(), amount, transactionPin }
        });
    }

    async swapAirtime(phoneNumber, network, airtimeAmount, transactionPin) {
        return await this.request('/api/v1/telecom/airtime/swap', {
            method: 'POST',
            body: { phoneNumber, network: network.toLowerCase(), airtimeAmount, transactionPin }
        });
    }

    async purchaseRechargePIN(network, pinType, quantity, transactionPin) {
        return await this.request('/api/v1/telecom/recharge-pin/purchase', {
            method: 'POST',
            body: { network: network.toLowerCase(), pinType, quantity, transactionPin }
        });
    }

    // ==================== BILLS ====================
    
    async verifyElectricityCustomer(meterNumber, disco, meterType = 'prepaid') {
        return await this.request('/api/v1/bills/electricity/verify', {
            method: 'POST',
            body: { meterNumber, disco: disco.toLowerCase(), meterType }
        });
    }

    async purchaseElectricity(meterNumber, disco, amount, phoneNumber, transactionPin) {
        return await this.request('/api/v1/bills/electricity/purchase', {
            method: 'POST',
            body: { meterNumber, disco: disco.toLowerCase(), amount, phoneNumber, transactionPin }
        });
    }

    async getCablePlans(provider) {
        return await this.request(`/api/v1/bills/cable/plans?provider=${provider.toLowerCase()}`);
    }

    async purchaseCableTV(smartCardNumber, provider, planId, months, transactionPin) {
        return await this.request('/api/v1/bills/cable/purchase', {
            method: 'POST',
            body: { smartCardNumber, provider: provider.toLowerCase(), planId, months, transactionPin }
        });
    }

    async purchaseEducationPIN(examType, quantity, transactionPin) {
        return await this.request('/api/v1/bills/education/purchase', {
            method: 'POST',
            body: { examType, quantity, transactionPin }
        });
    }

    // ==================== RRR PAYMENT (REMITA) ====================
    
    async validateRRR(rrr) {
        return await this.request('/api/v1/remita/validate', {
            method: 'POST',
            body: { rrr }
        });
    }

    async processRRRPayment(rrr, transactionPin) {
        return await this.request('/api/v1/remita/payment', {
            method: 'POST',
            body: { rrr, transactionPin }
        });
    }

    // ==================== TRANSACTION ====================
    
    async getTransactionStatus(reference) {
        return await this.request(`/api/v1/transaction/status/${reference}`);
    }

    // ==================== UTILITY ====================
    
    async healthCheck() {
        return await this.request('/api/v1/health', { skipAuth: true });
    }

    // ==================== LOGOUT ====================
    
    async logout() {
        this.clearToken();
        window.location.href = '../login.html';
    }
}

const api = new YareemaUserAPI();
