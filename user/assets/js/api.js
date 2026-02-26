class YareemaUserAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.token = localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
    }

    getToken() { return this.token; }

    setToken(token) {
        localStorage.setItem('user_token', token);
        this.token = token;
    }

    clearToken() {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        this.token = null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
    
        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
    
        const config = { method: options.method || 'GET', headers };
    
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
    
        try {
            const response = await fetch(url, config);
            let data;
            try { 
                data = await response.json(); 
            } catch(e) { 
                throw new Error('Invalid server response');
            }
    
            // Handle 401 Unauthorized - but check if it's actually a PIN error
            if (response.status === 401) {
                // Check the error message to determine if it's PIN-related
                const errorMsg = (data.message || data.error || '').toLowerCase();
                
                // If the error is about PIN, don't clear the session
                if (errorMsg.includes('pin') || 
                    errorMsg.includes('transaction pin') || 
                    errorMsg.includes('invalid pin')) {
                    
                    // This is a PIN error, not a session error
                    throw new Error(data.message || 'Invalid transaction PIN');
                }
                
                // If it's about token/session, then clear and redirect
                if (errorMsg.includes('token') || 
                    errorMsg.includes('session') || 
                    errorMsg.includes('unauthorized') ||
                    errorMsg.includes('expired')) {
                    
                    this.clearToken();
                    throw new Error('Your session has expired. Please login again.');
                }
                
                throw new Error(data.message || 'You are not authorized to perform this action');
            }
    
            if (!response.ok) {
                switch (response.status) {
                    case 400:
                        throw new Error(data.message || 'Invalid request. Please check your input.');
                    case 403:
                        throw new Error(data.message || 'You don\'t have permission to perform this action');
                    case 404:
                        throw new Error(data.message || 'Service temporarily unavailable');
                    case 422:
                        throw new Error(data.message || 'Validation failed. Please check your input.');
                    case 429:
                        throw new Error('Too many attempts. Please try again later');
                    case 500:
                    case 502:
                    case 503:
                        throw new Error('Service temporarily unavailable. Please try again');
                    default:
                        throw new Error(data.message || data.error || 'Request failed');
                }
            }
    
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ====================

    async login(email, password) {
        const response = await this.request('/api/v1/auth/login', {
            method: 'POST',
            body: { email, password },
            skipAuth: true
        });

        // token is at response.token, user is at response.data.user
        const token = response.token;
        const user  = response.data?.user || {};

        if (token) {
            this.setToken(token);
            localStorage.setItem('user_data', JSON.stringify(user));
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

    // Profile is at /api/v1/auth/profile → response.data.user
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

    async createWalletAccount(payload = {}) {
        return await this.request('/api/v1/wallet/create', {
            method: 'POST',
            body: payload
        });
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

    // ==================== TRANSACTIONS ====================

    async getTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/wallet/transactions${query ? '?' + query : ''}`);
    }

    async getTransactionStatus(reference) {
        return await this.request(`/api/v1/transaction/status/${reference}`);
    }

    // ==================== TELECOM ====================

    async getDataPlans(network = null) {
        const query = network ? `?network=${network}` : '';
        return await this.request(`/api/v1/telecom/data/plans${query}`);
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
            body: { phoneNumber, network: network.toLowerCase(), amount: parseInt(amount), transactionPin }
        });
    }

    async swapAirtime(phoneNumber, network, airtimeAmount, transactionPin) {
        return await this.request('/api/v1/telecom/airtime/swap', {
            method: 'POST',
            body: { phoneNumber, network: network.toLowerCase(), airtimeAmount: parseInt(airtimeAmount), transactionPin }
        });
    }

    // pinType is the denomination: "500", "1000" etc
    async purchaseRechargePIN(network, pinType, quantity, transactionPin) {
        return await this.request('/api/v1/telecom/recharge-pin/purchase', {
            method: 'POST',
            body: { network: network.toLowerCase(), pinType: String(pinType), quantity: parseInt(quantity), transactionPin }
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
            body: { meterNumber, disco: disco.toLowerCase(), amount: parseInt(amount), phoneNumber, transactionPin }
        });
    }

  
    async getCablePlans() {
        return await this.request('/api/v1/bills/cable/plans');
    }

    async purchaseCableTV(smartCardNumber, provider, planId, months, transactionPin) {
        return await this.request('/api/v1/bills/cable/purchase', {
            method: 'POST',
            body: { smartCardNumber, provider: provider.toLowerCase(), planId, months: parseInt(months), transactionPin }
        });
    }

    
    async purchaseEducationPIN(examType, quantity, transactionPin) {
        return await this.request('/api/v1/bills/education/purchase', {
            method: 'POST',
            body: { examType: examType.toUpperCase(), quantity: parseInt(quantity), transactionPin }
        });
    }

    // ==================== REMITA ====================

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

    // ==================== LOGOUT ====================

    logout() {
        this.clearToken();
        window.location.href = '/login.html';
    }
}

const api = new YareemaUserAPI();