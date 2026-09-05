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

        const timeoutMs = options.timeout || API_CONFIG.TIMEOUT || 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const config = {
            method: options.method || 'GET',
            headers,
            signal: controller.signal,
        };

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

            // Handle 401 Unauthorized - but ONLY for authenticated requests
            if (response.status === 401 && !options.skipAuth) {
                // Endpoints that use 401 for normal business errors (wrong PIN,
                // invalid sender, OTP/session expired, insufficient balance,
                // etc.) must NEVER force a logout — only surface the message.
                const isServiceEndpoint = endpoint.includes('/sms/') ||
                                          endpoint.includes('/telecom/') ||
                                          endpoint.includes('/bills/') ||
                                          endpoint.includes('/wallet/') ||
                                          endpoint.includes('/remita/') ||
                                          endpoint.includes('/airtime2cash/');
                if (isServiceEndpoint) {
                    throw new Error(data.message || data.error || data.msg || 'Request failed');
                }
                this.clearToken();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }

            // For login/signup endpoints, don't treat 401 as session expired
            if (!response.ok) {
                // Extract error message from response
                const errorMessage = data.message || data.error || data.msg || 'Request failed';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your connection and try again.');
            }
            console.error('API Error:', error);
            throw error;
        } finally {
            clearTimeout(timeoutId);
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

            console.log('Login response:', response); // For debugging

            // Extract token - try different possible paths
            const token = response.token || response.data?.token || response.accessToken;
            
            // Extract user data - try different possible paths
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

            // pin can live on user object OR at response.data level — check both
            const pinValue = user?.pin ?? response.data?.pin ?? response.pin ?? undefined;

            // Save pin in stored user_data so dashboard can read it
            if (pinValue !== undefined && Object.keys(user).length > 0) {
                user.pin = pinValue;
                localStorage.setItem('user_data', JSON.stringify(user));
            }

            return {
                success: true,
                token,
                user,
                pin: pinValue,   // true = PIN set, false/undefined = not set
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
            
            return {
                success: true,
                ...response
            };
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

    async resetPassword(email, otp, password) {
        return await this.request('/api/v1/auth/reset-password', {
            method: 'POST',
            body: { email, otp, password },
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

    async getDataPlans(network, dataType = null) {
        let url = `/api/v1/telecom/data/plans?network=${network.toLowerCase()}`;
        if (dataType) url += `&dataType=${dataType}`;
        return await this.request(url);
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

    // ==================== AIRTIME2CASH (3-step: OTP -> verify -> convert) ====================
    // Networks: mtn, airtel only (per current spec).

    async getAirtimeToCashLimits() {
        return await this.request('/api/v1/airtime2cash/network-limits');
    }

    async requestAirtimeToCashOTP(network, phoneNumber) {
        return await this.request('/api/v1/airtime2cash/request-otp', {
            method: 'POST',
            body: { network: network.toLowerCase(), phoneNumber }
        });
    }

    async verifyAirtimeToCashOTP(network, phoneNumber, otp) {
        return await this.request('/api/v1/airtime2cash/verify-otp', {
            method: 'POST',
            body: { network: network.toLowerCase(), phoneNumber, otp }
        });
    }

    // Compatibility aliases for older/newer Airtime-to-Cash flows that were
    // implemented in different versions of the frontend. These keep both call
    // styles working against the same backend contract.
    async generateAirtimeToCashOTP(network, sender) {
        return await this.requestAirtimeToCashOTP(network, sender);
    }

    async loginAirtimeToCashSession(networkName, sender, sessionId) {
        return await this.request('/api/v1/airtime2cash/login-session', {
            method: 'POST',
            body: { networkName: networkName.toUpperCase(), sender, sessionId }
        });
    }

    async checkAirtimeToCashQuota(networkName, amount) {
        return await this.request('/api/v1/airtime2cash/check-quota', {
            method: 'POST',
            body: { networkName: networkName.toUpperCase(), amount }
        });
    }

    async transferAirtimeToCash(networkName, sender, amount, transactionPin, sessionId) {
        return await this.request('/api/v1/airtime2cash/transfer', {
            method: 'POST',
            body: {
                networkName: networkName.toUpperCase(),
                sender,
                amount,
                pin: transactionPin,
                sessionId,
                transactionPin
            }
        });
    }

    // simPin = the SIM PIN that authorizes the airtime share (required by the
    // network, NOT the wallet PIN). transactionPin = the user's own wallet PIN.
    // These are two different secrets and both are required.
    async convertAirtimeToCash(network, identifier, amount, simPin, phoneNumber, transactionPin) {
        return await this.request('/api/v1/airtime2cash/convert', {
            method: 'POST',
            body: {
                network: network.toLowerCase(),
                identifier,
                amount,
                pin: simPin,
                phoneNumber,
                transactionPin
            }
        });
    }

    async getAirtimeToCashTransaction(reference) {
        return await this.request('/api/v1/airtime2cash/transaction-history', {
            method: 'POST',
            body: { reference }
        });
    }

    async getAirtimeToCashConversions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/api/v1/airtime2cash/conversions${query ? '?' + query : ''}`);
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

    // ==================== REMITA (biller bill-payment flow) ====================
    // Replaces the old validateRRR/processRRRPayment "pay an existing RRR"
    // flow. This one generates its own RRR internally: browse billers,
    // browse a biller's products, validate the customer, generate an RRR,
    // then pay it.

    async getRemitaBillers(page = 0, size = 2000) {
        return await this.request(`/api/v1/remita/billers?page=${page}&size=${size}`);
    }

    async getRemitaBillerProducts(billerId) {
        return await this.request(`/api/v1/remita/biller/${billerId}/products`);
    }

    async validateRemitaCustomer(billPaymentProductId, customerId) {
        return await this.request('/api/v1/remita/validate-customer', {
            method: 'POST',
            body: { billPaymentProductId, customerId }
        });
    }

    async initiateRemitaTransaction({ billPaymentProductId, amount, name, paymentIdentifier, email, phoneNumber, customerId, metadata }) {
        return await this.request('/api/v1/remita/biller/initiate', {
            method: 'POST',
            body: { billPaymentProductId, amount, name, paymentIdentifier, email, phoneNumber, customerId, metadata }
        });
    }

    async processRemitaTransaction(rrr, paymentIdentifier, amount) {
        return await this.request('/api/v1/remita/process', {
            method: 'POST',
            body: { rrr, paymentIdentifier, amount }
        });
    }

    async checkRemitaStatus(rrr) {
        return await this.request(`/api/v1/remita/status/${rrr}`);
    }

    async lookupRemitaTransaction(rrr) {
        return await this.request(`/api/v1/remita/lookup/${rrr}`);
    }

    // ==================== LOGOUT ====================

    logout() {
        this.clearToken();
        window.location.href = '/login.html';
    }
}

const api = new YareemaUserAPI();
