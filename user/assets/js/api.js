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

        // Always re-read token from storage (in case it was saved after construction)
        const currentToken = localStorage.getItem('user_token') || sessionStorage.getItem('user_token') || this.token;
        if (currentToken && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${currentToken}`;
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

            if (response.status === 401 && !options.skipAuth) {
                const msg = (data.message || data.error || data.msg || '').toLowerCase();
            
                // Endpoints that use 401 for business errors (wrong PIN, insufficient balance,
                // invalid sender, etc.) — should NEVER trigger a logout redirect
                const isServiceEndpoint = endpoint.includes('/sms/') ||
                                          endpoint.includes('/telecom/') ||
                                          endpoint.includes('/bills/') ||
                                          endpoint.includes('/wallet/') ||
                                          endpoint.includes('/remita/');
            
                if (isServiceEndpoint) {
                    // Just surface the error message to the UI — don't touch the session
                    throw new Error(data.message || data.error || data.msg || 'Request failed');
                }
            
                const isTokenError = msg.includes('token') || msg.includes('jwt') ||
                                     msg.includes('expired') || msg.includes('unauthorized') ||
                                     msg.includes('not authenticated') || msg.includes('no token') ||
                                     msg === '' || msg === 'unauthorized';
                const isPinError  = msg.includes('pin') || msg.includes('incorrect') ||
                                    msg.includes('wrong') || msg.includes('invalid pin') ||
                                    msg.includes('transaction');
            
                if (isTokenError && !isPinError) {
                    this.clearToken();
                    window.location.href = '/login.html';
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || data.error || data.msg || 'Invalid credentials');
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || data.msg || 'Request failed';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ====================

    async login(email, password) {
        try {
            const response = await this.request('/api/v1/auth/login', {
                method: 'POST',
                body: { email, password },
                skipAuth: true
            });

            console.log('Login response:', response);

            const token = response.token || response.data?.token || response.accessToken;

            let user = {};
            if (response.data?.user) {
                user = response.data.user;
            } else if (response.user) {
                user = response.user;
            } else if (response.data) {
                user = response.data;
            }

            if (token) {
                this.setToken(token);
                if (Object.keys(user).length > 0) {
                    localStorage.setItem('user_data', JSON.stringify(user));
                }
            }

            return {
                success: true,
                token,
                user,
                wallet: response.data?.wallet ?? null,
                message: response.message || 'Login successful'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed. Please check your credentials.'
            };
        }
    }

    async register(data) {
        try {
            const response = await this.request('/api/v1/auth/register', {
                method: 'POST',
                body: data,
                skipAuth: true
            });
            return { success: true, ...response };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
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
        return await this.request('/api/v1/auth/set-pin', {
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

    // Pass dataType to filter plans by category (e.g. 'sme', 'direct', 'awoof', 'other')
    // When dataType is null/omitted, returns availableDataTypes for the network
    async getDataPlans(network, dataType = null) {
        let url = `/api/v1/telecom/data/plans?network=${network.toLowerCase()}`;
        if (dataType) url += `&dataType=${dataType}`;
        return await this.request(url);
    }

    async purchaseData(phoneNumber, network, dataPlan, transactionPin, amount) {
        return await this.request('/api/v1/telecom/data/purchase', {
            method: 'POST',
            body: { phoneNumber, network: network.toLowerCase(), dataPlan, transactionPin, amount }
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

    // ==================== RECHARGE PIN ====================

    async purchaseRechargePIN(network, pinType, quantity, transactionPin) {
        return await this.request('/api/v1/telecom/recharge-pin/purchase', {
            method: 'POST',
            body: {
                network: network.toLowerCase(),
                pinType: String(pinType),
                quantity,
                transactionPin
            }
        });
    }

    // ==================== BILLS ====================

    async verifyElectricityCustomer(meterNumber, disco, meterType = 'prepaid') {
        return await this.request('/api/v1/bills/electricity/verify', {
            method: 'POST',
            body: { meterNumber, disco: disco.toLowerCase(), meterType }
        });
    }

    async purchaseElectricity(meterNumber, disco, amount, phoneNumber, transactionPin, meterType = 'prepaid') {
        return await this.request('/api/v1/bills/electricity/purchase', {
            method: 'POST',
            body: { meterNumber, disco: disco.toLowerCase(), meterType, amount, phoneNumber, transactionPin }
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

    // ==================== BULK SMS ====================

    async sendBulkSMS(from, to, body, transactionPin, gateway = 'direct-corporate', appendSender = 'hosted') {
        return await this.request('/api/v1/sms/send', {
            method: 'POST',
            body: { from, to, body, gateway, appendSender, transactionPin }
        });
    }

    // async getSMSBalance() {
    //     return await this.request('/api/v1/sms/balance');
    // }

    // ==================== NOTIFICATIONS ====================

    async getNotifications() {
        return await this.request('/api/v1/notifications');
    }

    async getUnreadCount() {
        return await this.request('/api/v1/notifications/unread-count');
    }

    async markNotificationRead(id) {
        return await this.request(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
    }

    async markAllNotificationsRead() {
        return await this.request('/api/v1/notifications/mark-all-read', { method: 'PUT' });
    }

    async deleteNotification(id) {
        return await this.request(`/api/v1/notifications/${id}`, { method: 'DELETE' });
    }

    async deleteAllNotifications() {
        return await this.request('/api/v1/notifications', { method: 'DELETE' });
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