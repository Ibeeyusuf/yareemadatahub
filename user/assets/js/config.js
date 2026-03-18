const API_CONFIG = {
    BASE_URL: 'https://vtu-api-d3q2.onrender.com',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            REGISTER: '/api/v1/auth/register',
            PROFILE: '/api/v1/auth/profile',
            CHANGE_PASSWORD: '/api/v1/auth/change-password',
            SET_PIN: '/api/v1/auth/set-pin'
        },
        WALLET: {
            BALANCE: '/api/v1/wallet/balance',
            TRANSACTIONS: '/api/v1/wallet/transactions',
            FUND: '/api/v1/wallet/fund',
            WITHDRAW: '/api/v1/wallet/withdraw',
            TRANSFER: '/api/v1/wallet/transfer'
        },
        TELECOM: {
            NETWORKS: '/api/v1/telecom/networks',
            DATA_PLANS: '/api/v1/telecom/data-plans',
            AIRTIME: '/api/v1/telecom/airtime',
            DATA: '/api/v1/telecom/data',
            SMS: '/api/v1/telecom/sms'
        },
        BILLS: {
            TV: '/api/v1/bills/tv',
            ELECTRICITY: '/api/v1/bills/electricity',
            INTERNET: '/api/v1/bills/internet'
        },
        EDUCATION: '/api/v1/education',
        REMITA: '/api/v1/remita',
        NOTIFICATIONS: '/api/v1/notifications'
    },
    TIMEOUT: 30000
};
