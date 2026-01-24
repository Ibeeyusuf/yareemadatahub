// Authentication Module
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('agentLoggedIn') === 'true';
    },

    // Get agent data
    getAgentData() {
        const data = localStorage.getItem('agentData');
        return data ? JSON.parse(data) : null;
    },

    // Handle login
    login(agentId, password) {
        // In production, this would make an API call
        // For demo purposes, we'll accept any credentials
        if (agentId && password) {
            const agentData = {
                id: agentId,
                name: 'Musa Ibrahim',
                phone: '08012345678',
                email: 'musa@example.com',
                walletBalance: 45280.50,
                earnings: 128450.75
            };
            
            localStorage.setItem('agentLoggedIn', 'true');
            localStorage.setItem('agentData', JSON.stringify(agentData));
            
            return true;
        }
        return false;
    },

    // Handle logout
    logout() {
        localStorage.removeItem('agentLoggedIn');
        localStorage.removeItem('agentData');
        window.location.href = 'index.html';
    },

    // Protect pages (call this on every protected page)
    protectPage() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
};

// Login form handler (for index.html)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const agentId = document.getElementById('agentId').value;
        const password = document.getElementById('password').value;
        
        if (Auth.login(agentId, password)) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials');
        }
    });
}

// Logout handler (for all pages)
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
}
