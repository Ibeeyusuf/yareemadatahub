class AdminDashboard {
    constructor() {
        this.api = new YareemaAPI();
        this.isLoading = false;
        this.dashboardData = null;
    }

    async init() {
        try {
            // Show loading state
            this.showLoading();
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Render all components
            this.renderOverviewCards();
            this.renderRecentTransactions();
            this.renderProviderStatus();
            this.renderCharts();
            
            // Load provider profit data
            this.loadProviderProfit();
            
            // Hide loading state
            this.hideLoading();
            
            // Setup auto-refresh (every 30 seconds)
            setInterval(() => this.refreshData(), 30000);
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('Failed to load dashboard data');
            this.hideLoading();
        }
    }

    async loadDashboardData() {
        const response = await this.api.getDashboardStats();
        
        if (response.status === 'success') {
            this.dashboardData = response.data;
        } else {
            throw new Error('Failed to load dashboard data');
        }
    }

    async refreshData() {
        if (this.isLoading) return;
        
        try {
            await this.loadDashboardData();
            this.renderOverviewCards();
            this.renderRecentTransactions();
            this.renderProviderStatus();
            this.loadProviderProfit();
        } catch (error) {
            console.error('Refresh error:', error);
        }
    }

    async loadProviderProfit() {
        const container = document.getElementById('provider-profit-container');
        if (!container) return;
        try {
            const response = await this.api.consoleGetProviderProfiles();
            if (response.status === 'success') {
                this.renderProviderProfit(response.data.profiles);
            }
        } catch (error) {
            console.error('Provider profit load error:', error);
            if (container) container.innerHTML = `<div class="col-span-4 text-center py-6 text-red-400 text-sm">Failed to load provider profit data</div>`;
        }
    }

    renderProviderProfit(profiles) {
        const container = document.getElementById('provider-profit-container');
        if (!container) return;

        const colorMap = {
            clubkonnect: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
            airtimenigeria: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
            smeplug: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
            pluginng: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' }
        };

        container.innerHTML = profiles.map(provider => {
            const p = provider.accumulatedProfile;
            const profit = p.successfulAmount || 0;
            const rate = p.successRate || 0;
            const colors = colorMap[provider.providerId] || { bg: 'bg-slate-50', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' };
            const balanceDisplay = provider.balance.available
                ? `₦${AdminUtils.formatNumber(provider.balance.amount)}`
                : 'N/A';

            return `
                <div class="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-semibold text-slate-800 truncate">${provider.displayName}</span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}">${provider.status}</span>
                    </div>
                    <div class="space-y-2">
                        <div>
                            <p class="text-xs text-slate-500">Profit (Successful)</p>
                            <p class="text-xl font-bold text-emerald-600">₦${AdminUtils.formatNumber(profit)}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="bg-slate-50 rounded-lg p-2">
                                <p class="text-slate-500">Success Rate</p>
                                <p class="font-semibold text-slate-800 mt-0.5">${rate.toFixed(2)}%</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-2">
                                <p class="text-slate-500">Wallet Balance</p>
                                <p class="font-semibold text-slate-800 mt-0.5">${balanceDisplay}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-2">
                                <p class="text-slate-500">Total Txns</p>
                                <p class="font-semibold text-slate-800 mt-0.5">${p.transactionsCount}</p>
                            </div>
                            <div class="bg-slate-50 rounded-lg p-2">
                                <p class="text-slate-500">Failed</p>
                                <p class="font-semibold text-red-500 mt-0.5">${p.failedCount}</p>
                            </div>
                        </div>
                    </div>
                    ${provider.isDefault ? '<div class="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1"><i data-lucide="star" class="w-3 h-3"></i> Default Provider</div>' : ''}
                </div>
            `;
        }).join('');

        // Re-init lucide icons for newly inserted elements
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    renderOverviewCards() {
        const overview = this.dashboardData?.overview || {};
        
        // Total Users
        this.updateCard('total-users', overview.totalUsers || 0);
        this.updateCard('new-users-today', overview.newUsersToday || 0);
        this.updateCard('active-users', overview.activeUsers || 0);
        
        // Transactions
        this.updateCard('total-transactions', AdminUtils.formatNumber(overview.totalTransactions || 0));
        this.updateCard('transactions-today', AdminUtils.formatNumber(overview.transactionsToday || 0));
        this.updateCard('success-rate', `${overview.successRate || '0.00'}%`);
        
        // Revenue
        this.updateCard('total-revenue', AdminUtils.formatCurrency(overview.totalRevenue || 0));
        this.updateCard('revenue-today', AdminUtils.formatCurrency(overview.revenueToday || 0));
        
        // Wallets
        this.updateCard('total-wallets', overview.totalWallets || 0);
        this.updateCard('locked-wallets', overview.lockedWallets || 0);
        this.updateCard('pending-kyc', overview.pendingKYC || 0);
    }

    updateCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    renderRecentTransactions() {
        const transactions = this.dashboardData?.recentTransactions || [];
        const container = document.getElementById('recent-transactions-container');
        
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                            <p>No transactions yet</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = transactions.map(tx => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${tx.reference || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${tx.user?.email || tx.user?.phoneNumber || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatServiceType(tx.type)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${AdminUtils.formatCurrency(tx.amount || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${AdminUtils.getStatusClass(tx.status)}">
                        ${tx.status || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${AdminUtils.timeAgo(tx.createdAt)}
                </td>
            </tr>
        `).join('');
    }

    renderProviderStatus() {
        const providers = this.dashboardData?.providerStatus || [];
        const container = document.getElementById('provider-status-container');
        
        if (!container) return;
        
        if (providers.length === 0) {
            container.innerHTML = `
                <div class="col-span-4 text-center py-8 text-gray-500">
                    No provider data available
                </div>
            `;
            return;
        }
        
        container.innerHTML = providers.map(provider => `
            <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-900 uppercase">${provider.name}</h4>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${AdminUtils.getStatusClass(provider.status)}">
                        ${provider.status}
                    </span>
                </div>
                <div class="space-y-1 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Success Rate:</span>
                        <span class="font-medium text-gray-900">${provider.successRate}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Total Requests:</span>
                        <span class="font-medium text-gray-900">${AdminUtils.formatNumber(provider.totalRequests || 0)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderUserGrowthChart();
        
        this.renderDailyTransactionsChart();
        
        this.renderRevenueByServiceChart();
    }

    renderUserGrowthChart() {
        const chartData = this.dashboardData?.charts?.userGrowth;
        if (!chartData || !chartData.labels || chartData.labels.length === 0) return;
        
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;
        
        // Destroy existing chart if any
        if (window.userGrowthChartInstance) {
            window.userGrowthChartInstance.destroy();
        }
        
        window.userGrowthChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets.map(dataset => ({
                    ...dataset,
                    type: dataset.type || 'bar'
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDailyTransactionsChart() {
        const chartData = this.dashboardData?.charts?.dailyTransactions;
        if (!chartData || !chartData.labels || chartData.labels.length === 0) {
            // Hide chart container if no data
            const container = document.getElementById('daily-transactions-chart-container');
            if (container) container.style.display = 'none';
            return;
        }
        
        const ctx = document.getElementById('dailyTransactionsChart');
        if (!ctx) return;
        
        if (window.dailyTransactionsChartInstance) {
            window.dailyTransactionsChartInstance.destroy();
        }
        
        window.dailyTransactionsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderRevenueByServiceChart() {
        const chartData = this.dashboardData?.charts?.revenueByService;
        if (!chartData || !chartData.labels || chartData.labels.length === 0) {
            const container = document.getElementById('revenue-by-service-chart-container');
            if (container) container.style.display = 'none';
            return;
        }
        
        const ctx = document.getElementById('revenueByServiceChart');
        if (!ctx) return;
        
        if (window.revenueByServiceChartInstance) {
            window.revenueByServiceChartInstance.destroy();
        }
        
        window.revenueByServiceChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    formatServiceType(serviceType) {
        if (!serviceType) return 'N/A';
        return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showLoading() {
        this.isLoading = true;
        const loader = document.getElementById('dashboard-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        const loader = document.getElementById('dashboard-loader');
        if (loader) loader.classList.add('hidden');
    }

    showError(message) {
        AdminUtils.showToast(message, 'error');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AdminDashboard();
    dashboard.init();
});