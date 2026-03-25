class TransactionsManager {
    constructor() {
        this.api = new YareemaAPI();
        this.currentPage = 1;
        this.limit = 20;
        this.filters = {};
        this.transactions = [];
        this.pagination = {};
        this.stats = {};
    }

    async init() {
        this.setupEventListeners();
        await this.loadTransactions();
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('transaction-search');
        if (searchInput) {
            searchInput.addEventListener('input', AdminUtils.debounce(() => {
                this.filters.search = searchInput.value;
                this.currentPage = 1;
                this.loadTransactions();
            }, 500));
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value || undefined;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Service type filter
        const serviceFilter = document.getElementById('service-filter');
        if (serviceFilter) {
            serviceFilter.addEventListener('change', () => {
                this.filters.serviceType = serviceFilter.value || undefined;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Date range
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        if (startDate) {
            startDate.addEventListener('change', () => {
                this.filters.startDate = startDate.value || undefined;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }
        if (endDate) {
            endDate.addEventListener('change', () => {
                this.filters.endDate = endDate.value || undefined;
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Refresh
        const refreshBtn = document.getElementById('refresh-transactions');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTransactions());
        }
    }

    async loadTransactions() {
        try {
            this.showLoading();

            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            const response = await this.api.getTransactions(params);

            if (response.status === 'success') {
                this.transactions = response.data.transactions || [];
                this.pagination = response.data.pagination || {};
                this.stats = response.data.stats || {};

                this.renderTransactions();
                this.renderStats();
                this.renderPagination();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load transactions error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderStats() {
        const totalAmountEl = document.getElementById('total-amount');
        if (totalAmountEl) totalAmountEl.textContent = AdminUtils.formatCurrency(this.stats.totalAmount || 0);

        const totalFeeEl = document.getElementById('total-fee');
        if (totalFeeEl) totalFeeEl.textContent = AdminUtils.formatCurrency(this.stats.totalFee || 0);

        const totalTxEl = document.getElementById('total-transactions-count');
        if (totalTxEl) totalTxEl.textContent = AdminUtils.formatNumber(this.stats.totalTransactions || 0);

        const successRate = this.stats.totalTransactions > 0
            ? ((this.stats.successfulTransactions / this.stats.totalTransactions) * 100).toFixed(2)
            : '0.00';
        const successRateEl = document.getElementById('success-rate');
        if (successRateEl) successRateEl.textContent = `${successRate}%`;
    }

    renderTransactions() {
        const container = document.getElementById('transactions-table-body');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <p class="font-medium">No transactions found</p>
                            <p class="text-sm">Transactions will appear here</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.transactions.map(tx => {
            // API uses tx.type not tx.serviceType
            const serviceLabel = this.formatServiceType(tx.type);
            // Network badge colour
            const networkColor = this.getNetworkColor(tx.service?.network);
            // Provider
            const provider = tx.service?.provider ? `<span class="text-xs text-slate-400">${tx.service.provider}</span>` : '';
            // Phone number from service object
            const phone = tx.service?.phoneNumber || '—';

            return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-mono font-medium text-gray-900 truncate max-w-[160px]" title="${tx.reference || ''}">${tx.reference || 'N/A'}</div>
                    <div class="text-xs text-slate-400 mt-0.5">${AdminUtils.formatDate(tx.createdAt)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${tx.user?.firstName || ''} ${tx.user?.lastName || ''}</div>
                    <div class="text-xs text-gray-500">${tx.user?.email || tx.user?.phoneNumber || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-700 font-medium">${serviceLabel}</div>
                    <div class="flex items-center gap-1 mt-0.5">
                        ${tx.service?.network ? `<span class="px-1.5 py-0.5 text-xs font-bold rounded ${networkColor} uppercase">${tx.service.network}</span>` : ''}
                        ${provider}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-semibold">${phone}</div>
                    ${tx.service?.plan ? `<div class="text-xs text-slate-400">Plan: ${tx.service.plan}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${AdminUtils.formatCurrency(tx.amount || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${AdminUtils.getStatusClass(tx.status)}">
                        ${tx.status || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${AdminUtils.formatCurrency(tx.fee || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="transactionsManager.viewTransaction('${tx._id}')" class="text-blue-600 hover:text-blue-900 font-medium">View</button>
                </td>
            </tr>
        `}).join('');
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
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> transactions
                </div>
                <div class="flex gap-2">
                    <button ${page === 1 ? 'disabled' : ''} onclick="transactionsManager.goToPage(${page - 1})"
                        class="px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Previous
                    </button>
                    <button ${page === pages ? 'disabled' : ''} onclick="transactionsManager.goToPage(${page + 1})"
                        class="px-3 py-1 border rounded ${page === pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadTransactions();
    }

    // tx.type from API e.g. "data_recharge", "airtime_recharge", "fund_wallet"
    formatServiceType(type) {
        if (!type) return 'N/A';
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getNetworkColor(network) {
        if (!network) return '';
        switch (network.toLowerCase()) {
            case 'mtn':     return 'bg-yellow-100 text-yellow-800';
            case 'airtel':  return 'bg-red-100 text-red-700';
            case 'glo':     return 'bg-green-100 text-green-700';
            case '9mobile': return 'bg-teal-100 text-teal-700';
            default:        return 'bg-slate-100 text-slate-600';
        }
    }

    async viewTransaction(txId) {
        try {
            const response = await this.api.getTransactionDetails(txId);

            const tx = response?.data?.transaction
                     || response?.data?.data
                     || response?.data
                     || response?.transaction
                     || null;

            if (!tx) {
                AdminUtils.showToast('Transaction data not found in response', 'error');
                return;
            }

            const statusClass = AdminUtils.getStatusClass ? AdminUtils.getStatusClass(tx.status) : '';
            const networkColor = this.getNetworkColor(tx.service?.network);

            // Build status history HTML
            const historyHTML = tx.statusHistory && tx.statusHistory.length > 0
                ? tx.statusHistory.map(h => `
                    <div class="flex items-start gap-2 text-xs">
                        <span class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${h.status === 'successful' ? 'bg-green-500' : h.status === 'failed' ? 'bg-red-500' : 'bg-yellow-400'}"></span>
                        <div>
                            <span class="font-medium capitalize">${h.status}</span>
                            <span class="text-slate-400 ml-1">${AdminUtils.formatDate(h.timestamp)}</span>
                            ${h.note ? `<p class="text-slate-500">${h.note}</p>` : ''}
                        </div>
                    </div>`).join('')
                : '<p class="text-xs text-slate-400">No history available</p>';

            Swal.fire({
                title: 'Transaction Details',
                html: `
                    <div class="text-left space-y-3 text-sm">

                        <!-- Reference & Status -->
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Reference</p>
                                <p class="font-mono font-semibold text-slate-800 break-all text-xs">${tx.reference || 'N/A'}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Status</p>
                                <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass}">${tx.status || 'N/A'}</span>
                            </div>
                        </div>

                        <!-- User -->
                        <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-xs text-slate-400 mb-1">User</p>
                            <p class="font-medium text-slate-800">${tx.user?.firstName || ''} ${tx.user?.lastName || ''}</p>
                            <p class="text-slate-500 text-xs">${tx.user?.email || 'N/A'} &bull; ${tx.user?.phoneNumber || 'N/A'}</p>
                        </div>

                        <!-- Service Info -->
                        <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-xs text-slate-400 mb-2">Service Details</p>
                            <div class="grid grid-cols-2 gap-y-1 text-xs">
                                <span class="text-slate-500">Type</span>
                                <span class="font-medium text-slate-800">${this.formatServiceType(tx.type)}</span>

                                ${tx.service?.network ? `
                                <span class="text-slate-500">Network</span>
                                <span><span class="px-1.5 py-0.5 rounded font-bold uppercase ${networkColor}">${tx.service.network}</span></span>
                                ` : ''}

                                ${tx.service?.provider ? `
                                <span class="text-slate-500">Provider</span>
                                <span class="font-medium text-slate-800">${tx.service.provider}</span>
                                ` : ''}

                                ${tx.service?.plan ? `
                                <span class="text-slate-500">Plan</span>
                                <span class="font-medium text-slate-800">${tx.service.plan}</span>
                                ` : ''}

                                ${tx.service?.phoneNumber ? `
                                <span class="text-slate-500">Recipient</span>
                                <span class="font-medium text-slate-800">${tx.service.phoneNumber}</span>
                                ` : ''}

                                ${tx.service?.orderId ? `
                                <span class="text-slate-500">Order ID</span>
                                <span class="font-mono text-slate-700 break-all">${tx.service.orderId}</span>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Amount Breakdown -->
                        <div class="grid grid-cols-3 gap-2">
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Amount</p>
                                <p class="font-bold text-slate-900">${AdminUtils.formatCurrency(tx.amount || 0)}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Fee</p>
                                <p class="font-semibold text-slate-700">${AdminUtils.formatCurrency(tx.fee || 0)}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Total</p>
                                <p class="font-bold text-slate-900">${AdminUtils.formatCurrency(tx.totalAmount || tx.amount || 0)}</p>
                            </div>
                        </div>

                        <!-- Balance change -->
                        ${tx.previousBalance != null ? `
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">Previous Balance</p>
                                <p class="font-semibold text-slate-700">${AdminUtils.formatCurrency(tx.previousBalance)}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-3">
                                <p class="text-xs text-slate-400 mb-1">New Balance</p>
                                <p class="font-semibold text-slate-700">${AdminUtils.formatCurrency(tx.newBalance)}</p>
                            </div>
                        </div>` : ''}

                        <!-- Description -->
                        ${tx.description ? `
                        <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-xs text-slate-400 mb-1">Description</p>
                            <p class="text-slate-700">${tx.description}</p>
                        </div>` : ''}

                        <!-- Status History -->
                        <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-xs text-slate-400 mb-2">Status History</p>
                            <div class="space-y-2">${historyHTML}</div>
                        </div>

                        <!-- Date -->
                        <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-xs text-slate-400 mb-1">Created At</p>
                            <p class="text-slate-700">${AdminUtils.formatDate(tx.createdAt)}</p>
                        </div>
                    </div>
                `,
                width: 580,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Close'
            });

        } catch (error) {
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
        }
    }

    showLoading() {
        const loader = document.getElementById('transactions-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('transactions-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let transactionsManager;
document.addEventListener('DOMContentLoaded', () => {
    transactionsManager = new TransactionsManager();
    transactionsManager.init();
});