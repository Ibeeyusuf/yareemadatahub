// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://vtu-api-d3q2.onrender.com',
    
    // Endpoints 
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            LOGOUT: '/api/v1/auth/logout',
            REFRESH: '/api/v1/auth/refresh'
        },
        ADMIN: {
            DASHBOARD: '/api/v1/admin/dashboard',
            USERS: '/api/v1/admin/users',
            WALLETS: '/api/v1/admin/wallets',
            TRANSACTIONS: '/api/v1/admin/transactions',
            PRICING: '/api/v1/admin/pricing',
            PROVIDERS: '/api/v1/admin/providers',
            LOGS: '/api/v1/admin/logs',
            BROADCAST: '/api/v1/notifications/admin/broadcast',
            SETTINGS: '/api/v1/admin/settings',
            EXPORT: '/api/v1/admin/export'
        }
    },
    
    // Request timeout (in milliseconds)
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
