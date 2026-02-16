// Yareema Data Hub - User Portal Auth Guard
// Page protection and authentication state management

const AuthGuard = {
    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated() {
        const token = localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
        return !!token;
    },

    /**
     * Get stored user data
     * @returns {Object|null} User data or null
     */
    getUserData() {
        try {
            const data = localStorage.getItem('user_data');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    },

    /**
     * Get user token
     * @returns {string|null} Token or null
     */
    getToken() {
        return localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
    },

    /**
     * Protect page - redirect to login if not authenticated
     * Call this at the top of every protected page
     */
    protectPage() {
        if (!this.isAuthenticated()) {
            // Store intended destination for redirect after login
            const currentPath = window.location.pathname;
            const currentSearch = window.location.search;
            const intendedDestination = currentPath + currentSearch;
            
            sessionStorage.setItem('redirect_after_login', intendedDestination);
            
            console.log('Access denied - redirecting to login');
            window.location.href = '/login.html';
        } else {
            console.log('Access granted - user authenticated');
        }
    },

    /**
     * Redirect authenticated users away from auth pages
     * Call this on login/signup pages
     */
    redirectIfAuthenticated(defaultPage = '/user/index.html') {
        if (this.isAuthenticated()) {
            // Check for stored redirect destination
            const redirect = sessionStorage.getItem('redirect_after_login');
            
            if (redirect) {
                sessionStorage.removeItem('redirect_after_login');
                console.log('Redirecting to intended destination:', redirect);
                window.location.href = redirect;
            } else {
                console.log('Already authenticated - redirecting to:', defaultPage);
                window.location.href = defaultPage;
            }
        }
    },

    /**
     * Clear all authentication data
     */
    clearAuth() {
        localStorage.removeItem('user_token');
        sessionStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        console.log('Auth data cleared');
    },

    /**
     * Handle logout
     * @param {string} redirectUrl - Where to redirect after logout
     */
    logout(redirectUrl = '/login.html') {
        this.clearAuth();
        window.location.href = redirectUrl;
    },

    /**
     * Display user info in UI
     * @param {string} elementId - Element ID to update with user name
     */
    displayUserInfo(elementId) {
        const user = this.getUserData();
        const element = document.getElementById(elementId);
        
        if (element && user) {
            const userName = user.firstName || user.name || user.email || 'User';
            element.textContent = userName;
        }
    }
};

// Auto-initialize logging in development
if (ENV?.isDevelopment) {
    console.log('AuthGuard initialized');
    console.log('Authentication status:', AuthGuard.isAuthenticated() ? 'Logged in' : 'Not logged in');
    
    const user = AuthGuard.getUserData();
    if (user) {
        console.log('Current user:', user.email || user.phone || 'Unknown');
    }
}
