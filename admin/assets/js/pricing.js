
class PricingManager {
    constructor() {
        this.api = new YareemaAPI();
        this.currentPage = 1;
        this.limit = 20;
        this.filters = {};
        this.pricing = [];
        this.pagination = {};
    }

    async init() {
        this.setupEventListeners();
        await this.loadPricing();
    }

    setupEventListeners() {
        // Service type filter
        const serviceFilter = document.getElementById('service-type-filter');
        if (serviceFilter) {
            serviceFilter.addEventListener('change', () => {
                this.filters.serviceType = serviceFilter.value || undefined;
                this.currentPage = 1;
                this.loadPricing();
            });
        }

        // Provider filter
        const providerFilter = document.getElementById('provider-filter');
        if (providerFilter) {
            providerFilter.addEventListener('change', () => {
                this.filters.provider = providerFilter.value || undefined;
                this.currentPage = 1;
                this.loadPricing();
            });
        }

        // Network filter
        const networkFilter = document.getElementById('network-filter');
        if (networkFilter) {
            networkFilter.addEventListener('change', () => {
                this.filters.network = networkFilter.value || undefined;
                this.currentPage = 1;
                this.loadPricing();
            });
        }

        // Active status filter
        const activeFilter = document.getElementById('active-filter');
        if (activeFilter) {
            activeFilter.addEventListener('change', () => {
                const value = activeFilter.value;
                if (value === '') {
                    delete this.filters.isActive;
                } else {
                    this.filters.isActive = value === 'true';
                }
                this.currentPage = 1;
                this.loadPricing();
            });
        }

        // Add pricing button
        const addBtn = document.getElementById('add-pricing-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddPricingModal());
        }

        // Refresh
        const refreshBtn = document.getElementById('refresh-pricing');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadPricing());
        }
    }

    async loadPricing() {
        try {
            this.showLoading();

            const params = {
                page: this.currentPage,
                limit: this.limit,
                ...this.filters
            };

            const response = await this.api.getServicePricing(params);
            
            // API returns: { status: "success", data: { pricing: [], pagination: {} } }
            if (response.status === 'success') {
                this.pricing = response.data.pricing || [];
                this.pagination = response.data.pagination || {};
                
                this.renderPricing();
                this.renderPagination();
            }

            this.hideLoading();
        } catch (error) {
            console.error('Load pricing error:', error);
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            this.hideLoading();
        }
    }

    renderPricing() {
        const container = document.getElementById('pricing-table-body');
        if (!container) return;

        if (this.pricing.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="10" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="font-medium">No pricing configured</p>
                            <button onclick="pricingManager.showAddPricingModal()" class="mt-2 px-4 py-2 bg-primary text-white rounded-lg">
                                Add Pricing
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.pricing.map(price => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="font-medium">${price.planName || 'N/A'}</div>
                    <div class="text-xs text-gray-500">${price.planCode || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatServiceType(price.serviceType)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    ${price.provider || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    ${price.network || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${price.dataAmount || price.validity || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${AdminUtils.formatCurrency(price.costPrice || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${AdminUtils.formatCurrency(price.sellingPrice || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ${AdminUtils.formatCurrency(price.profitMargin || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${price.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${price.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="pricingManager.editPricing('${price._id}')" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onclick="pricingManager.togglePricing('${price._id}', ${!price.isActive})" class="text-${price.isActive ? 'red' : 'green'}-600 hover:text-${price.isActive ? 'red' : 'green'}-900">
                        ${price.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="pricingManager.deletePricing('${price._id}')" class="text-red-600 hover:text-red-900">Delete</button>
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
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> pricing items
                </div>
                <div class="flex gap-2">
                    <button ${page === 1 ? 'disabled' : ''} onclick="pricingManager.goToPage(${page - 1})" 
                        class="px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Previous
                    </button>
                    <button ${page === pages ? 'disabled' : ''} onclick="pricingManager.goToPage(${page + 1})" 
                        class="px-3 py-1 border rounded ${page === pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadPricing();
    }

    formatServiceType(serviceType) {
        if (!serviceType) return 'N/A';
        return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async showAddPricingModal() {
        const { value: formValues } = await Swal.fire({
            title: 'Add Service Pricing',
            html: `
                <div class="space-y-3 text-left">
                    <select id="serviceType" class="swal2-input">
                        <option value="">Select Service Type</option>
                        <option value="data_recharge">Data Recharge</option>
                        <option value="airtime_recharge">Airtime Recharge</option>
                        <option value="cable_tv">Cable TV</option>
                        <option value="electricity">Electricity</option>
                    </select>
                    <select id="provider" class="swal2-input">
                        <option value="">Select Provider</option>
                        <option value="mtn">MTN</option>
                        <option value="airtel">Airtel</option>
                        <option value="glo">Glo</option>
                        <option value="9mobile">9mobile</option>
                    </select>
                    <input id="planName" class="swal2-input" placeholder="Plan Name">
                    <input id="planCode" class="swal2-input" placeholder="Plan Code">
                    <input id="dataAmount" class="swal2-input" placeholder="Data Amount (e.g., 1GB)">
                    <input id="validity" class="swal2-input" placeholder="Validity (e.g., 30 days)">
                    <input id="costPrice" class="swal2-input" type="number" placeholder="Cost Price (₦)" step="0.01">
                    <input id="sellingPrice" class="swal2-input" type="number" placeholder="Selling Price (₦)" step="0.01">
                </div>
            `,
            width: 600,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Create',
            preConfirm: () => {
                const serviceType = document.getElementById('serviceType').value;
                const provider = document.getElementById('provider').value;
                const planName = document.getElementById('planName').value;
                const planCode = document.getElementById('planCode').value;
                const dataAmount = document.getElementById('dataAmount').value;
                const validity = document.getElementById('validity').value;
                const costPrice = parseFloat(document.getElementById('costPrice').value);
                const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
                
                if (!serviceType || !provider || !planName || !costPrice || !sellingPrice) {
                    Swal.showValidationMessage('Please fill in all required fields');
                    return false;
                }
                
                return {
                    serviceType,
                    provider,
                    network: provider,
                    planName,
                    planCode,
                    dataAmount,
                    validity,
                    costPrice,
                    sellingPrice,
                    profitMargin: sellingPrice - costPrice,
                    discount: 0,
                    vat: 7.5,
                    isActive: true,
                    isAvailable: true,
                    priority: 1
                };
            }
        });

        if (formValues) {
            try {
                const response = await this.api.createServicePricing(formValues);
                if (response.status === 'success') {
                    AdminUtils.showToast('Pricing created successfully', 'success');
                    this.loadPricing();
                }
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async editPricing(pricingId) {
        // Get current pricing details
        const pricing = this.pricing.find(p => p._id === pricingId);
        if (!pricing) return;

        const { value: formValues } = await Swal.fire({
            title: 'Edit Pricing',
            html: `
                <div class="space-y-3 text-left">
                    <input id="costPrice" class="swal2-input" type="number" placeholder="Cost Price (₦)" value="${pricing.costPrice}" step="0.01">
                    <input id="sellingPrice" class="swal2-input" type="number" placeholder="Selling Price (₦)" value="${pricing.sellingPrice}" step="0.01">
                    <input id="discount" class="swal2-input" type="number" placeholder="Discount (%)" value="${pricing.discount || 0}" step="0.01">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: () => {
                const costPrice = parseFloat(document.getElementById('costPrice').value);
                const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
                const discount = parseFloat(document.getElementById('discount').value);
                
                return {
                    costPrice,
                    sellingPrice,
                    profitMargin: sellingPrice - costPrice,
                    discount
                };
            }
        });

        if (formValues) {
            try {
                await this.api.updateServicePricing(pricingId, formValues);
                AdminUtils.showToast('Pricing updated successfully', 'success');
                this.loadPricing();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    async togglePricing(pricingId, newStatus) {
        try {
            await this.api.updateServicePricing(pricingId, { isActive: newStatus });
            AdminUtils.showToast(`Pricing ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            this.loadPricing();
        } catch (error) {
            AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
        }
    }

    async deletePricing(pricingId) {
        const confirmed = await Swal.fire({
            title: 'Delete Pricing?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#ef4444'
        });

        if (confirmed.isConfirmed) {
            try {
                await this.api.deleteServicePricing(pricingId);
                AdminUtils.showToast('Pricing deleted successfully', 'success');
                this.loadPricing();
            } catch (error) {
                AdminUtils.showToast(AdminUtils.parseErrorMessage(error), 'error');
            }
        }
    }

    showLoading() {
        const loader = document.getElementById('pricing-loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('pricing-loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Initialize
let pricingManager;
document.addEventListener('DOMContentLoaded', () => {
    pricingManager = new PricingManager();
    pricingManager.init();
});
