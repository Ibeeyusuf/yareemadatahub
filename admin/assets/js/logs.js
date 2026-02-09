
class LogsManager {
    constructor() {
        this.api = new YareemaAPI();
        this.currentPage = 1;
        this.limit = 20;
        this.filters = {};
        this.logs = [];
        this.pagination = {};
    }

    async init() {
        this.setupEventListeners();
        await this.loadLogs();
    }

    setupEventListeners() {
        // Action filter
        const actionFilter = document.getElementById('action-filter');
        if (actionFilter) {
            actionFilter.addEventListener('change', () => {
                this.filters.action = actionFilter.value || undefined;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Entity filter
        const entityFilter = document.getElementById('entity-filter');
        if (entityFilter) {
            entityFilter.addEventListener('change', () => {
                this.filters.entity = entityFilter.value || undefined;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value || undefined;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Date range
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        if (startDate && endDate) {
            startDate.addEventListener('change', () => {
                this.filters.startDate = startDate.value || undefined;
                this.currentPage = 1;
                this.loadLogs();
            });
            endDate.addEventListener('change', () => {
                this.filters.endDate = endDate.value || undefined;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Refresh
        const refreshBtn = document.getElementById('refresh-logs');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadLogs());
        }
    }

    async loadLogs() {
        try {
            this.showLoading();

            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            const response = await this.api.getAdminLogs(params);
            
            // API returns: { status: "success", data: { logs: [], pagination: {} } }
            if (response.status === 'success') {
                this.logs = response.data.logs || [];
                this.pagination = response.data.pagination || {};
                
                this.renderLogs();
                this.renderPagination();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load logs error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderLogs() {
        const container = document.getElementById('logs-table-body');
        if (!container) return;

        if (this.logs.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p class="font-medium">No logs found</p>
                            <p class="text-sm">Admin activity logs will appear here</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.logs.map(log => {
            const admin = log.admin || {};
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${admin.firstName || ''} ${admin.lastName || ''}</div>
                        <div class="text-sm text-gray-500">${log.adminEmail || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            ${this.formatAction(log.action)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${this.formatEntity(log.entity)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">${AdminUtils.truncate(log.description || 'N/A', 60)}</div>
                        ${log.errorMessage ? `<div class="text-xs text-red-600 mt-1">${AdminUtils.truncate(log.errorMessage, 60)}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${AdminUtils.getStatusClass(log.status)}">
                            ${log.status || 'N/A'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${log.ipAddress || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${AdminUtils.formatDate(log.createdAt)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="logsManager.viewLog('${log._id}')" class="text-blue-600 hover:text-blue-900">View</button>
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
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> logs
                </div>
                <div class="flex gap-2">
                    <button ${page === 1 ? 'disabled' : ''} onclick="logsManager.goToPage(${page - 1})" 
                        class="px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Previous
                    </button>
                    <button ${page === pages ? 'disabled' : ''} onclick="logsManager.goToPage(${page + 1})" 
                        class="px-3 py-1 border rounded ${page === pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadLogs();
    }

    formatAction(action) {
        if (!action) return 'N/A';
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatEntity(entity) {
        if (!entity) return 'N/A';
        return entity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async viewLog(logId) {
        const log = this.logs.find(l => l._id === logId);
        if (!log) return;

        const admin = log.admin || {};
        const metadata = log.metadata || {};

        Swal.fire({
            title: 'Log Details',
            html: `
                <div class="text-left space-y-3 max-h-96 overflow-y-auto">
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-xs font-semibold text-gray-600 mb-1">Admin</p>
                        <p class="text-sm"><strong>Name:</strong> ${admin.firstName || ''} ${admin.lastName || ''}</p>
                        <p class="text-sm"><strong>Email:</strong> ${log.adminEmail || 'N/A'}</p>
                        <p class="text-sm"><strong>Role:</strong> ${this.formatAction(log.adminRole)}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-xs font-semibold text-gray-600 mb-1">Action Details</p>
                        <p class="text-sm"><strong>Action:</strong> ${this.formatAction(log.action)}</p>
                        <p class="text-sm"><strong>Entity:</strong> ${this.formatEntity(log.entity)}</p>
                        <p class="text-sm"><strong>Entity ID:</strong> ${log.entityId || 'N/A'}</p>
                        <p class="text-sm"><strong>Status:</strong> ${log.status}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-xs font-semibold text-gray-600 mb-1">Description</p>
                        <p class="text-sm">${log.description || 'N/A'}</p>
                        ${log.errorMessage ? `<p class="text-sm text-red-600 mt-2"><strong>Error:</strong> ${log.errorMessage}</p>` : ''}
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-xs font-semibold text-gray-600 mb-1">Request Info</p>
                        <p class="text-sm"><strong>IP Address:</strong> ${log.ipAddress || 'N/A'}</p>
                        <p class="text-sm"><strong>User Agent:</strong> ${AdminUtils.truncate(log.userAgent || 'N/A', 80)}</p>
                        ${metadata.method ? `<p class="text-sm"><strong>Method:</strong> ${metadata.method}</p>` : ''}
                        ${metadata.url ? `<p class="text-sm"><strong>URL:</strong> ${metadata.url}</p>` : ''}
                        ${metadata.statusCode ? `<p class="text-sm"><strong>Status Code:</strong> ${metadata.statusCode}</p>` : ''}
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-xs font-semibold text-gray-600 mb-1">Timestamp</p>
                        <p class="text-sm">${AdminUtils.formatDate(log.createdAt)}</p>
                    </div>
                </div>
            `,
            width: 700,
            confirmButtonText: 'Close'
        });
    }

    showLoading() {
        const loader = document.getElementById('logs-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('logs-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let logsManager;
document.addEventListener('DOMContentLoaded', () => {
    logsManager = new LogsManager();
    logsManager.init();
});
