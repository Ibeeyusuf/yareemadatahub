// Yareema Data Hub - User Portal API Configuration
const API_CONFIG = {
    // API Base URL
    BASE_URL: 'https://vtu-api-d3q2.onrender.com',
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            REGISTER: '/api/v1/auth/register',
            LOGOUT: '/api/v1/auth/logout',
            VERIFY_OTP: '/api/v1/auth/verify-otp',
            RESEND_OTP: '/api/v1/auth/resend-otp',
            FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
            RESET_PASSWORD: '/api/v1/auth/reset-password',
            CHANGE_PASSWORD: '/api/v1/auth/change-password',
            REFRESH: '/api/v1/auth/refresh'
        },
        USER: {
            PROFILE: '/api/v1/user/profile',
            WALLET: '/api/v1/user/wallet',
            TRANSACTIONS: '/api/v1/user/transactions'
        }
    },
    
    // Request timeout (milliseconds)
    TIMEOUT: 30000,
    
    // Retry configuration
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 1000
    }
};

// Environment detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};

// Development mode logging
if (ENV.isDevelopment) {
    console.log('Running in development mode');
    console.log('API Base URL:', API_CONFIG.BASE_URL);
}
