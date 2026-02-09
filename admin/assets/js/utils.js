
const AdminUtils = {
    /**
     * Format currency in Nigerian Naira
     * @param {number} amount - Amount in kobo or naira
     * @param {boolean} showSymbol - Whether to show ₦ symbol
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, showSymbol = true) {
        if (amount === null || amount === undefined) return showSymbol ? '₦0.00' : '0.00';
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return showSymbol ? '₦0.00' : '0.00';
        
        const formatted = numAmount.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return showSymbol ? `₦${formatted}` : formatted;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        const numValue = parseFloat(num);
        if (isNaN(numValue)) return '0';
        return numValue.toLocaleString('en-NG');
    },

    /**
     * Format date to readable string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format date to short date only
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDateShort(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format time ago (relative time)
     * @param {string|Date} date - Date to format
     * @returns {string} Relative time string
     */
    timeAgo(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const now = new Date();
        const seconds = Math.floor((now - d) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        
        return this.formatDateShort(date);
    },

    /**
     * Get status badge class
     * @param {string} status - Status value
     * @returns {string} CSS class for badge
     */
    getStatusClass(status) {
        const statusLower = String(status).toLowerCase();
        const statusMap = {
            'success': 'bg-green-100 text-green-800',
            'successful': 'bg-green-100 text-green-800',
            'completed': 'bg-green-100 text-green-800',
            'active': 'bg-green-100 text-green-800',
            'verified': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800',
            'cancelled': 'bg-red-100 text-red-800',
            'rejected': 'bg-red-100 text-red-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'locked': 'bg-red-100 text-red-800',
            'maintenance': 'bg-orange-100 text-orange-800',
            'degraded': 'bg-orange-100 text-orange-800'
        };
        
        return statusMap[statusLower] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Get user full name
     * @param {Object} user - User object
     * @returns {string} Full name
     */
    getUserFullName(user) {
        if (!user) return 'N/A';
        if (user.fullName) return user.fullName;
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @returns {string} Truncated text
     */
    truncate(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Type: success, error, warning, info
     */
    showToast(message, type = 'success') {
        if (typeof Swal !== 'undefined') {
            const icons = {
                success: 'success',
                error: 'error',
                warning: 'warning',
                info: 'info'
            };
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: icons[type] || 'info',
                title: message,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        } else {
            alert(message);
        }
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Parse error message from API response
     * @param {Error|Object} error - Error object
     * @returns {string} Error message
     */
    parseErrorMessage(error) {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.error) return error.error;
        if (error.data?.message) return error.data.message;
        return 'An error occurred. Please try again.';
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        const existing = document.getElementById('global-loader');
        if (existing) return;
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="text-slate-600 mt-4">Loading...</p>
            </div>
        `;
        document.body.appendChild(loader);
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.remove();
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AdminUtils = AdminUtils;
}
