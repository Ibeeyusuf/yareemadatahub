
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
        } catch (error) {
            console.error('Refresh error:', error);
        }
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
                    ${this.formatServiceType(tx.serviceType)}
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
