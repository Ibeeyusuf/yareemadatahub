// Yareema Data Hub - User Portal API Service
// Complete API Integration for User Authentication & Services

class UserAPI {
    constructor() {
        this.baseURL = API_CONFIG?.BASE_URL || 'https://vtu-api-d3q2.onrender.com';
        this.token = this.getToken();
    }

    // ==================== TOKEN MANAGEMENT ====================
    
    getToken() {
        return localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
    }

    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('user_token', token);
            sessionStorage.removeItem('user_token');
        } else {
            sessionStorage.setItem('user_token', token);
            localStorage.removeItem('user_token');
        }
        this.token = token;
    }

    clearToken() {
        localStorage.removeItem('user_token');
        sessionStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        this.token = null;
    }

    // ==================== HTTP REQUEST HANDLER ====================
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization header if token exists and not skipped
        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        // Add body if provided
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log('🌐 API Request:', url, config.method);
            
            const response = await fetch(url, config);
            
            // Parse JSON response
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('❌ Failed to parse JSON response:', e);
                throw new Error('Invalid response format from server');
            }

            console.log('📡 API Response:', response.status, data);

            // Handle 401 Unauthorized - session expired
            if (response.status === 401) {
                this.clearToken();
                // Only redirect if not already on login/signup pages
                const currentPage = window.location.pathname;
                if (!currentPage.includes('login.html') && 
                    !currentPage.includes('signup.html') &&
                    !currentPage.includes('verify-otp.html') &&
                    !currentPage.includes('forgot-password.html') &&
                    !currentPage.includes('reset-password.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error('Session expired. Please login again.');
            }

            // Handle non-2xx responses
            if (!response.ok) {
                const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;

        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION METHODS ====================
    
    /**
     * Login user
     * @param {string} email - User email or phone
     * @param {string} password - User password
     * @param {boolean} remember - Remember user (use localStorage)
     * @returns {Promise<Object>} Login response with token and user data
     */
    async login(email, password, remember = false) {
        const response = await this.request('/api/v1/auth/login', {
            method: 'POST',
            body: { email, password },
            skipAuth: true
        });
        
        // Handle different response structures
        const token = response.token || response.data?.token || response.accessToken;
        const user = response.user || response.data?.user || response.data || {};
        
        if (token) {
            this.setToken(token, remember);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            return {
                success: true,
                token: token,
                user: user,
                requiresVerification: response.requiresVerification || response.data?.requiresVerification || false,
                message: response.message || 'Login successful'
            };
        }
        
        // If response has explicit success field
        if (response.success !== undefined) {
            return response;
        }
        
        throw new Error('Invalid login response structure');
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        const response = await this.request('/api/v1/auth/register', {
            method: 'POST',
            body: userData,
            skipAuth: true
        });
        
        return response;
    }

    /**
     * Verify OTP
     * @param {string} email - User email
     * @param {string} otp - OTP code
     * @param {string} verificationType - Type: 'email' or 'phone'
     * @returns {Promise<Object>} Verification response
     */
    async verifyOTP(email, otp, verificationType = 'email') {
        const response = await this.request('/api/v1/auth/verify-otp', {
            method: 'POST',
            body: { email, otp, verificationType },
            skipAuth: true
        });
        
        return response;
    }

    /**
     * Resend OTP
     * @param {string} email - User email
     * @param {string} verificationType - Type: 'email' or 'phone'
     * @returns {Promise<Object>} Resend response
     */
    async resendOTP(email, verificationType = 'email') {
        const response = await this.request('/api/v1/auth/resend-otp', {
            method: 'POST',
            body: { email, verificationType },
            skipAuth: true
        });
        
        return response;
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Forgot password response
     */
    async forgotPassword(email) {
        const response = await this.request('/api/v1/auth/forgot-password', {
            method: 'POST',
            body: { email },
            skipAuth: true
        });
        
        return response;
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token from email
     * @param {string} password - New password
     * @returns {Promise<Object>} Reset password response
     */
    async resetPassword(token, password) {
        const response = await this.request(`/api/v1/auth/reset-password/${token}`, {
            method: 'POST',
            body: { password },
            skipAuth: true
        });
        
        return response;
    }

    /**
     * Change password (authenticated user)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Change password response
     */
    async changePassword(currentPassword, newPassword) {
        const response = await this.request('/api/v1/auth/change-password', {
            method: 'POST',
            body: { currentPassword, newPassword }
        });
        
        return response;
    }

    /**
     * Logout user
     */
    logout() {
        this.clearToken();
        window.location.href = 'login.html';
    }

    // ==================== USER PROFILE METHODS ====================
    
    /**
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return await this.request('/api/v1/user/profile');
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated profile
     */
    async updateProfile(profileData) {
        return await this.request('/api/v1/user/profile', {
            method: 'PUT',
            body: profileData
        });
    }

    // ==================== WALLET METHODS ====================
    
    /**
     * Get wallet balance
     * @returns {Promise<Object>} Wallet data
     */
    async getWallet() {
        return await this.request('/api/v1/user/wallet');
    }

    // ==================== TRANSACTION METHODS ====================
    
    /**
     * Get user transactions
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Transactions list
     */
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v != null)
        ).toString();
        return await this.request(`/api/v1/user/transactions${queryString ? '?' + queryString : ''}`);
    }
}

// Initialize API instance
const api = new UserAPI();

// Log initialization in development
if (ENV.isDevelopment) {
    console.log('✅ UserAPI initialized');
    console.log('🔐 Token present:', !!api.token);
}
