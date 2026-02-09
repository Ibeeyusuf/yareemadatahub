class ProvidersManager {
    constructor() {
        this.api = new YareemaAPI();
        this.providers = [];
        this.stats = {};
    }

    async init() {
        await this.loadProviders();
        this.setupRefresh();
    }

    setupRefresh() {
        const refreshBtn = document.getElementById('refresh-providers');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProviders());
        }

        // Auto-refresh every minute
        setInterval(() => this.loadProviders(), 60000);
    }

    async loadProviders() {
        try {
            this.showLoading();

            const response = await this.api.getProviders({});
            
            // API returns: { status: "success", data: { providers: [], stats: {} } }
            if (response.status === 'success') {
                this.providers = response.data.providers || [];
                this.stats = response.data.stats || {};
                
                this.renderProviders();
                this.renderStats();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load providers error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderStats() {
        const totalEl = document.getElementById('total-providers');
        if (totalEl) totalEl.textContent = this.stats.total || 0;

        const activeEl = document.getElementById('active-providers');
        if (activeEl) activeEl.textContent = this.stats.active || 0;

        const inactiveEl = document.getElementById('inactive-providers');
        if (inactiveEl) inactiveEl.textContent = this.stats.inactive || 0;

        const maintenanceEl = document.getElementById('maintenance-providers');
        if (maintenanceEl) maintenanceEl.textContent = (this.stats.maintenance || 0) + (this.stats.degraded || 0);
    }

    renderProviders() {
        const container = document.getElementById('providers-container');
        if (!container) return;

        if (this.providers.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <svg class="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                    </svg>
                    <p class="mt-2 font-medium">No providers available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.providers.map(provider => {
            const statusColor = this.getStatusColor(provider.status);
            const uptimeColor = provider.uptime >= 99 ? 'text-green-600' : provider.uptime >= 95 ? 'text-yellow-600' : 'text-red-600';
            const successRateColor = provider.successRate >= 99 ? 'text-green-600' : provider.successRate >= 95 ? 'text-yellow-600' : 'text-red-600';
            
            return `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 uppercase">${provider.providerName}</h3>
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}">
                            ${provider.status}
                        </span>
                    </div>
                    
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Description:</span>
                            <span class="font-medium text-gray-900">${provider.description || 'N/A'}</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Uptime:</span>
                            <span class="font-semibold ${uptimeColor}">${provider.uptime}%</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Success Rate:</span>
                            <span class="font-semibold ${successRateColor}">${provider.successRate}%</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Requests:</span>
                            <span class="font-medium text-gray-900">${AdminUtils.formatNumber(provider.totalRequests || 0)}</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Successful:</span>
                            <span class="font-medium text-green-600">${AdminUtils.formatNumber(provider.successfulRequests || 0)}</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Failed:</span>
                            <span class="font-medium text-red-600">${AdminUtils.formatNumber(provider.failedRequests || 0)}</span>
                        </div>
                        
                        <div class="flex justify-between">
                            <span class="text-gray-600">Priority:</span>
                            <span class="font-medium text-gray-900">${provider.priority}</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-xs text-gray-600 mb-2">Supported Services:</p>
                        <div class="flex flex-wrap gap-1">
                            ${provider.supportedServices.map(service => `
                                <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    ${this.formatServiceType(service)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        ${provider.status === 'active' ? `
                            <button onclick="providersManager.updateProviderStatus('${provider.providerName}', 'inactive')" 
                                class="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                                Deactivate
                            </button>
                        ` : `
                            <button onclick="providersManager.updateProviderStatus('${provider.providerName}', 'active')" 
                                class="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                                Activate
                            </button>
                        `}
                        <button onclick="providersManager.updateProviderStatus('${provider.providerName}', 'maintenance')" 
                            class="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                            Maintenance
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusColor(status) {
        const statusLower = String(status).toLowerCase();
        const colors = {
            'active': { bg: 'bg-green-100', text: 'text-green-800' },
            'inactive': { bg: 'bg-gray-100', text: 'text-gray-800' },
            'maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            'degraded': { bg: 'bg-orange-100', text: 'text-orange-800' }
        };
        return colors[statusLower] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    }

    formatServiceType(serviceType) {
        if (!serviceType) return 'N/A';
        return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async updateProviderStatus(providerName, newStatus) {
        try {
            await this.api.updateProviderStatus(providerName, { status: newStatus });
            AdminUtils.showToast(`Provider status updated to ${newStatus}`, 'success');
            this.loadProviders();
        } catch (error) {
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
        }
    }

    showLoading() {
        const loader = document.getElementById('providers-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('providers-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let providersManager;
document.addEventListener('DOMContentLoaded', () => {
    providersManager = new ProvidersManager();
    providersManager.init();
});
