
class WalletsManager {
    constructor() {
        this.api = new YareemaAPI();
        this.currentPage = 1;
        this.limit = 20;
        this.filters = {};
        this.wallets = [];
        this.pagination = {};
        this.summary = {};
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadWallets();
        } catch (error) {
            console.error('Wallets manager initialization error:', error);
            AdminUtils.showToast('Failed to initialize wallets manager', 'error');
        }
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('wallet-search');
        if (searchInput) {
            searchInput.addEventListener('input', AdminUtils.debounce(() => {
                this.filters.search = searchInput.value;
                this.currentPage = 1;
                this.loadWallets();
            }, 500));
        }

        // Filter by locked status
        const lockedFilter = document.getElementById('locked-filter');
        if (lockedFilter) {
            lockedFilter.addEventListener('change', () => {
                const value = lockedFilter.value;
                if (value === '') {
                    delete this.filters.locked;
                } else {
                    this.filters.locked = value === 'true';
                }
                this.currentPage = 1;
                this.loadWallets();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-wallets');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadWallets());
        }
    }

    async loadWallets() {
        try {
            this.showLoading();

            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            const response = await this.api.getWallets(params);
            
            // API returns: { status: "success", data: { wallets: [], pagination: {}, summary: {} } }
            if (response.status === 'success') {
                this.wallets = response.data.wallets || [];
                this.pagination = response.data.pagination || {};
                this.summary = response.data.summary || {};
                
                this.renderWallets();
                this.renderSummary();
                this.renderPagination();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load wallets error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderSummary() {
        // Total Balance
        const totalBalanceEl = document.getElementById('total-balance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = AdminUtils.formatCurrency(this.summary.totalBalance || 0);
        }

        // Average Balance
        const avgBalanceEl = document.getElementById('average-balance');
        if (avgBalanceEl) {
            avgBalanceEl.textContent = AdminUtils.formatCurrency(this.summary.averageBalance || 0);
        }

        // Locked Wallets
        const lockedWalletsEl = document.getElementById('locked-wallets-count');
        if (lockedWalletsEl) {
            lockedWalletsEl.textContent = AdminUtils.formatNumber(this.summary.lockedWallets || 0);
        }
    }

    renderWallets() {
        const container = document.getElementById('wallets-table-body');
        if (!container) return;

        if (this.wallets.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                            <p class="font-medium">No wallets found</p>
                            <p class="text-sm">Try adjusting your filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.wallets.map(wallet => {
            const user = wallet.user;
            const userDisplay = user ? `
                <div class="text-sm font-medium text-gray-900">
                    ${user.firstName || ''} ${user.lastName || ''}
                </div>
                <div class="text-sm text-gray-500">${user.email || user.phoneNumber || 'N/A'}</div>
            ` : `
                <div class="text-sm text-gray-500 italic">Orphaned Wallet</div>
            `;

            return `
                <tr class="hover:bg-gray-50 ${wallet.locked ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${userDisplay}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${AdminUtils.formatCurrency(wallet.balance || 0)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${AdminUtils.formatCurrency(wallet.totalFunded || 0)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${AdminUtils.formatCurrency(wallet.totalSpent || 0)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${AdminUtils.formatCurrency(wallet.totalWithdrawn || 0)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wallet.locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                            ${wallet.locked ? 'Locked' : 'Active'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${AdminUtils.formatDateShort(wallet.createdAt)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        ${user ? `
                            <button onclick="walletsManager.creditWallet('${user._id}')" class="text-green-600 hover:text-green-900">Credit</button>
                            
                            ${wallet.locked ? 
                                `<button onclick="walletsManager.unlockWallet('${user._id}')" class="text-blue-600 hover:text-blue-900">Unlock</button>` :
                                `<button onclick="walletsManager.lockWallet('${user._id}')" class="text-red-600 hover:text-red-900">Lock</button>`
                            }
                        ` : '<span class="text-gray-400">No Actions</span>'}
                    </td>
                </tr>
            `;
        }).join('');
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
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> wallets
                </div>
                <div class="flex gap-2">
                    <button ${page === 1 ? 'disabled' : ''} onclick="walletsManager.goToPage(${page - 1})" 
                        class="px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Previous
                    </button>
                    <button ${page === pages ? 'disabled' : ''} onclick="walletsManager.goToPage(${page + 1})" 
                        class="px-3 py-1 border rounded ${page === pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadWallets();
    }

    async creditWallet(userId) {
        const { value: formValues } = await Swal.fire({
            title: 'Credit Wallet',
            html: `
                <input id="amount" class="swal2-input" placeholder="Amount (₦)" type="number" min="1" step="0.01">
                <input id="reason" class="swal2-input" placeholder="Reason">
                <input id="reference" class="swal2-input" placeholder="Reference (optional)">
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const amount = document.getElementById('amount').value;
                const reason = document.getElementById('reason').value;
                const reference = document.getElementById('reference').value;
                
                if (!amount || !reason) {
                    Swal.showValidationMessage('Please fill in amount and reason');
                    return false;
                }
                
                return { amount: parseFloat(amount), reason, reference };
            }
        });

        if (formValues) {
            try {
                await this.api.creditWallet(userId, formValues.amount, formValues.reason, formValues.reference);
                AdminUtils.showToast('Wallet credited successfully', 'success');
                this.loadWallets();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async debitWallet(userId) {
        const { value: formValues } = await Swal.fire({
            title: 'Debit Wallet',
            html: `
                <input id="amount" class="swal2-input" placeholder="Amount (₦)" type="number" min="1" step="0.01">
                <input id="reason" class="swal2-input" placeholder="Reason">
                <input id="reference" class="swal2-input" placeholder="Reference (optional)">
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const amount = document.getElementById('amount').value;
                const reason = document.getElementById('reason').value;
                const reference = document.getElementById('reference').value;
                
                if (!amount || !reason) {
                    Swal.showValidationMessage('Please fill in amount and reason');
                    return false;
                }
                
                return { amount: parseFloat(amount), reason, reference };
            }
        });

        if (formValues) {
            try {
                await this.api.debitWallet(userId, formValues.amount, formValues.reason, formValues.reference);
                AdminUtils.showToast('Wallet debited successfully', 'success');
                this.loadWallets();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async lockWallet(userId) {
        const { value: reason } = await Swal.fire({
            title: 'Lock Wallet',
            input: 'text',
            inputLabel: 'Reason for locking',
            inputPlaceholder: 'Enter reason...',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to provide a reason!';
                }
            }
        });

        if (reason) {
            try {
                await this.api.lockWallet(userId, reason);
                AdminUtils.showToast('Wallet locked successfully', 'success');
                this.loadWallets();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async unlockWallet(userId) {
        const confirmed = await Swal.fire({
            title: 'Unlock Wallet?',
            text: 'This user will be able to use their wallet again',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, unlock'
        });

        if (confirmed.isConfirmed) {
            try {
                await this.api.unlockWallet(userId);
                AdminUtils.showToast('Wallet unlocked successfully', 'success');
                this.loadWallets();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    showLoading() {
        const loader = document.getElementById('wallets-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('wallets-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let walletsManager;
document.addEventListener('DOMContentLoaded', () => {
    walletsManager = new WalletsManager();
    walletsManager.init();
});
