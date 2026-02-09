
class UsersManager {
    constructor() {
        this.api = new YareemaAPI();
        this.currentPage = 1;
        this.limit = 20;
        this.filters = {};
        this.users = [];
        this.pagination = {};
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadUsers();
        } catch (error) {
            console.error('Users manager initialization error:', error);
            AdminUtils.showToast('Failed to initialize users manager', 'error');
        }
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', AdminUtils.debounce(() => {
                this.filters.search = searchInput.value;
                this.currentPage = 1;
                this.loadUsers();
            }, 500));
        }

        // Filter by role
        const roleFilter = document.getElementById('role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', () => {
                this.filters.role = roleFilter.value || undefined;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        // Filter by status
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value || undefined;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-users');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUsers());
        }
    }

    async loadUsers() {
        try {
            this.showLoading();

            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            const response = await this.api.getUsers(params);
            
            // API returns: { status: "success", data: { users: [], pagination: {} } }
            if (response.status === 'success') {
                this.users = response.data.users || [];
                this.pagination = response.data.pagination || {};
                this.renderUsers();
                this.renderPagination();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load users error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderUsers() {
        const container = document.getElementById('users-table-body');
        if (!container) return;

        if (this.users.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <p class="font-medium">No users found</p>
                            <p class="text-sm">Try adjusting your filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                                ${this.getInitials(user)}
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${user.firstName || ''} ${user.lastName || ''}
                            </div>
                            <div class="text-sm text-gray-500">${user.email || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${user.phoneNumber || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${this.formatRole(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getKYCStatusClass(user.kycStatus)}">
                        ${this.formatKYCStatus(user.kycStatus)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${AdminUtils.formatDateShort(user.createdAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="usersManager.viewUser('${user._id}')" class="text-blue-600 hover:text-blue-900">View</button>
                    ${user.isActive ? 
                        `<button onclick="usersManager.suspendUser('${user._id}')" class="text-red-600 hover:text-red-900">Suspend</button>` :
                        `<button onclick="usersManager.activateUser('${user._id}')" class="text-green-600 hover:text-green-900">Activate</button>`
                    }
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        const { page, pages, total } = this.pagination;
        if (!pages || pages <= 1) {
            container.innerHTML = '';
            return;
        }

        const startItem = ((page - 1) * this.limit) + 1;
        const endItem = Math.min(page * this.limit, total);

        container.innerHTML = `
            <div class="flex items-center justify-between px-6 py-3">
                <div class="text-sm text-gray-700">
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> users
                </div>
                <div class="flex gap-2">
                    <button ${page === 1 ? 'disabled' : ''} onclick="usersManager.goToPage(${page - 1})" 
                        class="px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Previous
                    </button>
                    ${this.renderPageNumbers(page, pages)}
                    <button ${page === pages ? 'disabled' : ''} onclick="usersManager.goToPage(${page + 1})" 
                        class="px-3 py-1 border rounded ${page === pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    renderPageNumbers(current, total) {
        let pages = [];
        const maxPages = 5;
        
        if (total <= maxPages) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }

        return pages.map(page => {
            if (page === '...') {
                return '<span class="px-3 py-1">...</span>';
            }
            return `<button onclick="usersManager.goToPage(${page})" 
                class="px-3 py-1 border rounded ${page === current ? 'bg-primary text-white' : 'hover:bg-gray-50'}">
                ${page}
            </button>`;
        }).join('');
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadUsers();
    }

    getInitials(user) {
        const first = user.firstName?.charAt(0) || '';
        const last = user.lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || 'U';
    }

    formatRole(role) {
        if (!role) return 'User';
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatKYCStatus(status) {
        if (!status) return 'Pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    getKYCStatusClass(status) {
        const statusLower = String(status).toLowerCase();
        if (statusLower === 'verified') return 'bg-green-100 text-green-800';
        if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
        if (statusLower === 'rejected') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    }

    async viewUser(userId) {
        try {
            AdminUtils.showLoading();
            
            // Fetch user details from API
            const response = await this.api.getUserDetails(userId);
            
            if (response.status === 'success' && response.data) {
                const user = response.data.user || response.data;
                
                // Populate and show the modal
                this.showUserDetailModal(user);
            } else {
                AdminUtils.showToast('Failed to load user details', 'error');
            }
            
            AdminUtils.hideLoading();
        } catch (error) {
            console.error('View user error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            AdminUtils.hideLoading();
        }
    }
    
    showUserDetailModal(user) {
        // Get the modal
        const modal = document.getElementById('userDetailModal');
        if (!modal) {
            console.error('User detail modal not found');
            return;
        }
        
        // Populate modal with user data
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        const userEmail = user.email || 'N/A';
        const userPhone = user.phoneNumber || 'N/A';
        const isActive = user.isActive || false;
        const role = this.formatRole(user.role);
        const walletBalance = AdminUtils.formatCurrency(user.walletBalance || user.wallet?.balance || 0);
        const totalTransactions = user.totalTransactions || user.transactionCount || 0;
        const memberSince = AdminUtils.formatDateShort(user.createdAt);
        const kycStatus = this.formatKYCStatus(user.kycStatus);
        const kycStatusClass = this.getKYCStatusClass(user.kycStatus);
        
        // Get initials for avatar
        const initials = this.getInitials(user);
        
        // Update modal content
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 class="text-xl font-bold text-slate-900">User Details</h3>
                    <button onclick="closeModal('userDetailModal')" class="text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex items-start gap-6 mb-6">
                        <div class="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                            ${initials}
                        </div>
                        <div class="flex-1">
                            <h4 class="text-2xl font-bold text-slate-900">${userName}</h4>
                            <p class="text-slate-500">${userEmail}</p>
                            <p class="text-slate-500 text-sm">${userPhone}</p>
                            <div class="flex gap-2 mt-3">
                                <span class="px-3 py-1 text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">
                                    ${isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">${role}</span>
                                <span class="px-3 py-1 text-xs font-medium ${kycStatusClass} rounded-full">KYC: ${kycStatus}</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            ${isActive ? 
                                `<button onclick="usersManager.suspendUser('${user._id}'); closeModal('userDetailModal')" class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                                    <i data-lucide="user-x" class="w-4 h-4 inline mr-1"></i> Suspend
                                </button>` :
                                `<button onclick="usersManager.activateUser('${user._id}'); closeModal('userDetailModal')" class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                    <i data-lucide="user-check" class="w-4 h-4 inline mr-1"></i> Activate
                                </button>`
                            }
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="p-4 bg-slate-50 rounded-lg">
                            <p class="text-xs text-slate-500 mb-1">Wallet Balance</p>
                            <p class="text-xl font-bold text-slate-900">${walletBalance}</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-lg">
                            <p class="text-xs text-slate-500 mb-1">Total Transactions</p>
                            <p class="text-xl font-bold text-slate-900">${totalTransactions}</p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-lg">
                            <p class="text-xs text-slate-500 mb-1">Member Since</p>
                            <p class="text-xl font-bold text-slate-900">${memberSince}</p>
                        </div>
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <h5 class="font-semibold text-slate-900 mb-3">Additional Information</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-slate-500">User ID:</span>
                                <span class="font-medium text-slate-900 ml-2">${user._id || user.id}</span>
                            </div>
                            <div>
                                <span class="text-slate-500">Referral Code:</span>
                                <span class="font-medium text-slate-900 ml-2">${user.referralCode || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-slate-500">Last Login:</span>
                                <span class="font-medium text-slate-900 ml-2">${user.lastLogin ? AdminUtils.formatDateShort(user.lastLogin) : 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-slate-500">Email Verified:</span>
                                <span class="font-medium text-slate-900 ml-2">${user.isEmailVerified ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        modal.classList.add('active');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    async editUser(userId) {
        // Implementation for editing user
        window.location.href = `edit-user.html?id=${userId}`;
    }

    async suspendUser(userId) {
        const confirmed = await Swal.fire({
            title: 'Suspend User?',
            text: 'This user will not be able to access their account',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, suspend',
            cancelButtonText: 'Cancel'
        });

        if (confirmed.isConfirmed) {
            try {
                await this.api.suspendUser(userId);
                AdminUtils.showToast('User suspended successfully', 'success');
                this.loadUsers();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async activateUser(userId) {
        try {
            await this.api.activateUser(userId);
            AdminUtils.showToast('User activated successfully', 'success');
            this.loadUsers();
        } catch (error) {
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
        }
    }

    showLoading() {
        const loader = document.getElementById('users-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('users-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let usersManager;
document.addEventListener('DOMContentLoaded', () => {
    usersManager = new UsersManager();
    usersManager.init();
});
