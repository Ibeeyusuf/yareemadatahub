// Service Handler - Dynamic Service Pages
const ServiceHandler = {
    currentService: null,
    servicesData: null,
    
    // Initialize page
    async init() {
        try {
            // Get service type from URL
            const params = new URLSearchParams(window.location.search);
            const serviceType = params.get('type');
            
            if (!serviceType) {
                this.showError('No service specified');
                return;
            }
            
            // Load services from API (with fallback)
            await this.loadServices();
            
            // Find service
            const service = this.findService(serviceType);
            
            if (!service) {
                this.showError(`Service "${serviceType}" not found`);
                return;
            }
            
            this.currentService = service;
            
            // Render service
            this.renderService(service);
            
        } catch (error) {
            console.error('[ServiceHandler] Init error:', error);
            this.showError(error.message || 'Failed to load service');
        }
    },
    
    // Load services from API
    async loadServices() {
        try {
            const result = await AgentServices.getServices();
            
            if (result.success && result.data) {
                this.servicesData = result.data;
                console.log('[ServiceHandler] Services loaded:', this.servicesData);
            } else {
                console.warn('[ServiceHandler] API failed, using fallback services');
                this.servicesData = null;
            }
        } catch (error) {
            console.error('[ServiceHandler] Load services error:', error);
            this.servicesData = null;
        }
    },
    
    // Find service by type
    findService(type) {
        const typeLower = type.toLowerCase();
        
        // Try to find from API data first
        if (this.servicesData) {
            let services = [];
            
            // Handle different API response structures
            if (this.servicesData.services && Array.isArray(this.servicesData.services)) {
                services = this.servicesData.services;
            } else if (Array.isArray(this.servicesData)) {
                services = this.servicesData;
            }
            
            if (services.length > 0) {
                const found = services.find(s => 
                    s.type?.toLowerCase() === typeLower || 
                    s.name?.toLowerCase().includes(typeLower) ||
                    s.slug?.toLowerCase() === typeLower
                );
                
                if (found) {
                    console.log('[ServiceHandler] Service found from API:', found);
                    return found;
                }
            }
        }
        
        // Fallback to predefined services
        console.log('[ServiceHandler] Using fallback service for:', type);
        return this.getFallbackService(typeLower);
    },
    
    // Get fallback service when API doesn't return it
    getFallbackService(type) {
        const fallbackServices = {
            'data': {
                type: 'data',
                name: 'Buy Data',
                providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
                commissionRate: 5
            },
            'airtime': {
                type: 'airtime',
                name: 'Buy Airtime',
                providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
                commissionRate: 3
            },
            'electricity': {
                type: 'electricity',
                name: 'Pay Electricity Bill',
                providers: ['AEDC', 'EKEDC', 'IKEDC', 'IBEDC', 'KEDCO', 'PHED', 'JED', 'KAEDCO', 'EEDC'],
                commissionRate: 2
            },
            'cable': {
                type: 'cable',
                name: 'Cable TV Subscription',
                providers: ['DSTV', 'GOTV', 'Startimes'],
                commissionRate: 2
            },
            'education': {
                type: 'education',
                name: 'Education PINs',
                providers: ['WAEC', 'NECO', 'NABTEB', 'JAMB'],
                commissionRate: 5
            },
            'sms': {
                type: 'sms',
                name: 'Bulk SMS',
                providers: [],
                commissionRate: 0
            }
        };
        
        return fallbackServices[type] || null;
    },
    
    // Render service
    renderService(service) {
        // Update page title
        document.getElementById('page-title').textContent = `${service.name} - Yareema Agent Portal`;
        document.getElementById('service-title').textContent = service.name;
        
        // Update header
        updatePageTitle(service.type);
        
        // Generate form fields
        this.generateFormFields(service);
        
        // Setup form submission
        this.setupFormSubmission(service);
        
        // Show content, hide loading
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('service-content').classList.remove('hidden');
        
        // Initialize icons
        lucide.createIcons();
    },
    
    // Generate form fields based on service type
    generateFormFields(service) {
        const container = document.getElementById('form-fields');
        let html = '';
        
        // Common fields based on service type
        if (service.type === 'data' || service.type === 'airtime') {
            html += this.generateTelecomFields(service);
        } else if (service.type === 'electricity') {
            html += this.generateElectricityFields(service);
        } else if (service.type === 'cable') {
            html += this.generateCableFields(service);
        } else if (service.type === 'education') {
            html += this.generateEducationFields(service);
        } else if (service.type === 'sms') {
            html += this.generateSMSFields(service);
        } else {
            html += this.generateGenericFields(service);
        }
        
        container.innerHTML = html;
        
        // Setup event listeners
        this.setupFieldListeners(service);
    },
    
    // Generate telecom fields (data/airtime)
    generateTelecomFields(service) {
        const providers = service.providers || ['MTN', 'Airtel', 'Glo', '9mobile'];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Network</label>
                    <select id="provider" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Choose network...</option>
                        ${providers.map(p => `<option value="${p.toLowerCase()}">${p}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" id="phoneNumber" placeholder="08012345678" pattern="[0-9]{11}" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                ${service.type === 'data' ? `
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Data Plan</label>
                    <select id="plan" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Select network first...</option>
                    </select>
                </div>
                ` : `
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
                    <input type="number" id="amount" placeholder="500" min="50" max="50000" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                `}
            </div>
        `;
    },
    
    // Generate electricity fields
    generateElectricityFields(service) {
        const providers = service.providers || ['AEDC', 'EKEDC', 'IKEDC', 'IBEDC', 'KEDCO', 'PHED', 'JED', 'KAEDCO', 'EEDC'];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Disco</label>
                    <select id="provider" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Choose disco...</option>
                        ${providers.map(p => `<option value="${p.toLowerCase()}">${p}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Meter Type</label>
                    <select id="meterType" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Choose type...</option>
                        <option value="prepaid">Prepaid</option>
                        <option value="postpaid">Postpaid</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Meter Number</label>
                    <input type="text" id="meterNumber" placeholder="12345678901" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" id="phoneNumber" placeholder="08012345678" pattern="[0-9]{11}" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
                    <input type="number" id="amount" placeholder="1000" min="500" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
            </div>
        `;
    },
    
    // Generate cable fields
    generateCableFields(service) {
        const providers = service.providers || ['DSTV', 'GOTV', 'Startimes'];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Provider</label>
                    <select id="provider" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Choose provider...</option>
                        ${providers.map(p => `<option value="${p.toLowerCase()}">${p}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Smart Card Number</label>
                    <input type="text" id="smartCardNumber" placeholder="1234567890" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Package</label>
                    <select id="plan" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Select provider first...</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" id="phoneNumber" placeholder="08012345678" pattern="[0-9]{11}" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
            </div>
        `;
    },
    
    // Generate education fields
    generateEducationFields(service) {
        const providers = service.providers || ['WAEC', 'NECO', 'NABTEB', 'JAMB'];
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Select Exam</label>
                    <select id="provider" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                        <option value="">Choose exam...</option>
                        ${providers.map(p => `<option value="${p.toLowerCase()}">${p}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Quantity</label>
                    <input type="number" id="quantity" placeholder="1" min="1" max="10" value="1" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" id="phoneNumber" placeholder="08012345678" pattern="[0-9]{11}" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
            </div>
        `;
    },
    
    // Generate SMS fields
    generateSMSFields(service) {
        return `
            <div class="grid grid-cols-1 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Numbers</label>
                    <textarea id="phoneNumbers" rows="4" placeholder="Enter phone numbers (one per line or comma-separated)" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea id="message" rows="4" placeholder="Type your message here..." required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full"></textarea>
                </div>
            </div>
        `;
    },
    
    // Generate generic fields
    generateGenericFields(service) {
        return `
            <div class="grid grid-cols-1 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" id="phoneNumber" placeholder="08012345678" pattern="[0-9]{11}" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
                    <input type="number" id="amount" placeholder="1000" min="100" required class="px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yareema-primary focus:border-transparent w-full">
                </div>
            </div>
        `;
    },
    
    // Setup field listeners
    setupFieldListeners(service) {
        // Provider change
        const providerEl = document.getElementById('provider');
        if (providerEl) {
            providerEl.addEventListener('change', () => this.handleProviderChange(service));
        }
        
        // Plan change (for commission preview)
        const planEl = document.getElementById('plan');
        if (planEl) {
            planEl.addEventListener('change', () => this.showCommissionPreview());
        }
        
        // Amount change (for commission preview)
        const amountEl = document.getElementById('amount');
        if (amountEl) {
            amountEl.addEventListener('input', () => this.showCommissionPreview());
        }
    },
    
    // Handle provider change
    async handleProviderChange(service) {
        const provider = document.getElementById('provider')?.value;
        if (!provider) return;
        
        if (service.type === 'data') {
            await this.loadDataPlans(provider);
        } else if (service.type === 'cable') {
            await this.loadCablePlans(provider);
        }
    },
    
    // Load data plans
    async loadDataPlans(network) {
        const planSelect = document.getElementById('plan');
        if (!planSelect) return;
        
        planSelect.innerHTML = '<option value="">Loading plans...</option>';
        planSelect.disabled = true;
        
        try {
            const result = await AgentServices.getDataPlans(network);
            
            if (result.success && result.data && result.data.length > 0) {
                planSelect.innerHTML = '<option value="">Select data plan...</option>';
                
                result.data.forEach((plan) => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify(plan);
                    // Use actual API field names: dataAmount, planName, sellingPrice
                    const label = plan.dataAmount || plan.size || plan.planName || plan.name || plan.plan || 'Data Plan';
                    const validity = plan.validity ? ` (${plan.validity})` : '';
                    const price = plan.sellingPrice || plan.price || plan.amount || 0;
                    option.textContent = `${label}${validity} - ₦${Number(price).toLocaleString()}`;
                    planSelect.appendChild(option);
                });
            } else {
                planSelect.innerHTML = '<option value="">Failed to load plans</option>';
                if (result.message) UI.showToast(result.message, 'error');
            }
        } catch (error) {
            planSelect.innerHTML = '<option value="">Error loading plans</option>';
            UI.showToast('Failed to load data plans', 'error');
        } finally {
            planSelect.disabled = false;
        }
    },
    
    // Load cable plans
    async loadCablePlans(provider) {
        const planSelect = document.getElementById('plan');
        if (!planSelect) return;
        
        planSelect.innerHTML = '<option value="">Loading plans...</option>';
        planSelect.disabled = true;
        
        try {
            const result = await AgentServices.getCablePlans(provider);
            
            if (result.success && result.data) {
                planSelect.innerHTML = '<option value="">Select package...</option>';
                
                result.data.forEach((plan, idx) => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify(plan);
                    // Mirror user's label format: planName/name + price
                    const name = plan.planName || plan.name || plan.description || plan.package || 'Package';
                    const price = plan.sellingPrice || plan.price || plan.amount || 0;
                    option.textContent = `${name} - ₦${Number(price).toLocaleString()}`;
                    planSelect.appendChild(option);
                });
            } else {
                planSelect.innerHTML = '<option value="">Failed to load plans</option>';
                UI.showToast(result.message, 'error');
            }
        } catch (error) {
            planSelect.innerHTML = '<option value="">Error loading plans</option>';
            UI.showToast('Failed to load cable plans', 'error');
        } finally {
            planSelect.disabled = false;
        }
    },
    
    // Show commission preview
    showCommissionPreview() {
        const planEl = document.getElementById('plan');
        const amountEl = document.getElementById('amount');
        const preview = document.getElementById('commission-preview');
        
        let amount = 0;
        let commission = 0;
        let rate = 0;
        
        if (planEl && planEl.value) {
            try {
                const plan = JSON.parse(planEl.value);
                // Actual API uses sellingPrice and profitMargin
                amount = plan.sellingPrice || plan.price || plan.amount || 0;
                rate = plan.profitMargin || plan.commission || plan.commissionRate || this.currentService?.commissionRate || 0;
                commission = (amount * rate / 100);
            } catch (e) {
                console.error('Parse plan error:', e);
            }
        } else if (amountEl && amountEl.value) {
            amount = parseFloat(amountEl.value);
            rate = this.currentService?.commissionRate || 2;
            commission = (amount * rate / 100);
        }
        
        if (amount > 0) {
            document.getElementById('preview-amount').textContent = UI.formatCurrency(amount);
            document.getElementById('preview-commission').textContent = UI.formatCurrency(commission);
            document.getElementById('preview-rate').textContent = `${rate}%`;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    },
    
    // Setup form submission
    setupFormSubmission(service) {
        const form = document.getElementById('service-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(service);
        });
    },
    
    // Handle form submission
    async handleSubmit(service) {
        try {
            const formData = this.collectFormData(service);
            
            if (!formData) {
                UI.showToast('Please fill all required fields', 'error');
                return;
            }
            
            // Show loading
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>Processing...';
            
            // Call appropriate API - Backend will deduct from wallet automatically
            let result;
            
            if (service.type === 'data') {
                result = await AgentServices.purchaseData(formData);
            } else if (service.type === 'airtime') {
                result = await AgentServices.purchaseAirtime(formData);
            } else if (service.type === 'electricity' || service.type === 'cable' || service.type === 'education') {
                // Bill payments
                result = await AgentServices.payBill(formData);
            } else {
                result = await AgentServices.payBill(formData);
            }
            
            // Handle result
            if (result.success) {
                UI.showToast(result.message || 'Purchase successful!', 'success');
                
                // Reset form
                document.getElementById('service-form').reset();
                document.getElementById('commission-preview').classList.add('hidden');
                
                // Refresh wallet balance
                if (typeof updateWalletBalance === 'function') {
                    await updateWalletBalance();
                }
                
                // Show success details
                this.showSuccessMessage(result, service);
                
            } else {
                // Check if insufficient balance
                if (result.message && result.message.toLowerCase().includes('insufficient')) {
                    this.showInsufficientBalanceError(formData.amount || 0);
                } else {
                    UI.showToast(result.message || 'Purchase failed', 'error');
                }
            }
            
            // Restore button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
        } catch (error) {
            console.error('[ServiceHandler] Submit error:', error);
            UI.showToast('An error occurred. Please try again.', 'error');
            
            // Restore button
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Complete Purchase';
            }
        }
    },
    
    // Show success message - persistent modal for tokens/PINs
    showSuccessMessage(result, service) {
        const details = result.data || {};
        const hasToken = details.token || details.pin || details.units;
        
        if (hasToken) {
            // Build persistent modal so agent can copy token/PIN
            let detailsHTML = '';
            if (details.token) {
                detailsHTML += `<div class="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
                    <p class="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Token</p>
                    <p class="text-2xl font-bold text-amber-700 tracking-widest break-all" id="txn-token">${details.token}</p>
                    <button onclick="navigator.clipboard.writeText('${details.token}').then(()=>UI.showToast('Token copied!','success'))" class="mt-2 text-xs text-amber-600 hover:text-amber-800 underline">Copy Token</button>
                </div>`;
            }
            if (details.pin) {
                detailsHTML += `<div class="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl text-center">
                    <p class="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">PIN</p>
                    <p class="text-2xl font-bold text-blue-700 tracking-widest" id="txn-pin">${details.pin}</p>
                    <button onclick="navigator.clipboard.writeText('${details.pin}').then(()=>UI.showToast('PIN copied!','success'))" class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">Copy PIN</button>
                </div>`;
            }
            if (details.units) {
                detailsHTML += `<div class="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-center">
                    <p class="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Units</p>
                    <p class="text-2xl font-bold text-green-700">${details.units}</p>
                </div>`;
            }

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i data-lucide="check-circle" class="w-9 h-9 text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900">${service.name} Successful</h3>
                        <p class="text-sm text-slate-500 mt-1">${result.message || 'Transaction completed successfully'}</p>
                    </div>
                    ${detailsHTML}
                    <button onclick="this.closest('.fixed').remove()" class="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
                        Done
                    </button>
                </div>`;
            document.body.appendChild(modal);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            UI.showToast(result.message || `${service.name} successful!`, 'success');
        }
    },
    
    // Show insufficient balance error with helpful message
    showInsufficientBalanceError(requiredAmount) {
        const message = `
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="wallet-cards" class="w-8 h-8 text-red-600"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">Insufficient Wallet Balance</h3>
                <p class="text-slate-600 mb-4">You need ₦${requiredAmount.toFixed(2)} to complete this purchase.</p>
                <a href="wallet.html" class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    <i data-lucide="plus-circle" class="w-5 h-5"></i>
                    Fund Wallet
                </a>
            </div>
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                ${message}
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => modal.remove(), 5000);
    },
    
    // Collect form data
    collectFormData(service) {
        const data = {};
        
        // Get provider/network
        const provider = document.getElementById('provider')?.value;
        
        // Common fields
        const phoneNumber = document.getElementById('phoneNumber')?.value;
        if (phoneNumber) data.phoneNumber = phoneNumber;
        
        const amount = document.getElementById('amount')?.value;
        if (amount) data.amount = parseFloat(amount);
        
        // Service-specific fields based on type
        if (service.type === 'data') {
            const planEl = document.getElementById('plan');
            if (planEl && planEl.value) {
                try {
                    const plan = JSON.parse(planEl.value);
                    data.network = provider;
                    // Actual API uses _id as plan identifier; also supports planCode
                    data.planId = plan._id || plan.planCode || plan.id || plan.planId;
                    data.planName = plan.planName || plan.name || plan.plan;
                    data.amount = plan.sellingPrice || plan.price || plan.amount;
                    data.phoneNumber = phoneNumber;
                } catch (e) {
                    console.error('Plan parse error:', e);
                    return null;
                }
            }
        } else if (service.type === 'airtime') {
            data.network = provider;
            data.amount = parseFloat(amount);
            data.phoneNumber = phoneNumber;
        } else if (service.type === 'electricity') {
            // Electricity bill payment
            data.serviceType = 'electricity';
            data.disco = provider;
            data.meterNumber = document.getElementById('meterNumber')?.value;
            data.meterType = document.getElementById('meterType')?.value;
            data.customerNumber = document.getElementById('meterNumber')?.value; // API might need this
            data.amount = parseFloat(amount);
            data.customerPhone = phoneNumber;
            
            if (!data.meterNumber || !data.meterType || !data.disco) {
                console.error('Missing electricity data');
                return null;
            }
        } else if (service.type === 'cable') {
            data.serviceType = 'cable';
            data.provider = provider;
            data.smartCardNumber = document.getElementById('smartCardNumber')?.value;
            data.customerNumber = data.smartCardNumber;
            data.customerPhone = phoneNumber;
            
            const planEl = document.getElementById('plan');
            if (planEl && planEl.value) {
                try {
                    const plan = JSON.parse(planEl.value);
                    data.packageId = plan._id || plan.planCode || plan.id || plan.planId;
                    data.packageName = plan.planName || plan.name || plan.package;
                    data.amount = plan.sellingPrice || plan.price || plan.amount;
                } catch (e) {
                    console.error('Cable plan parse error:', e);
                    return null;
                }
            }
            
            if (!data.smartCardNumber || !data.provider) {
                console.error('Missing cable data');
                return null;
            }
        } else if (service.type === 'education') {
            data.serviceType = 'education';
            data.examType = provider;
            data.quantity = parseInt(document.getElementById('quantity')?.value || 1);
            data.phoneNumber = phoneNumber;
        } else if (service.type === 'sms') {
            data.serviceType = 'sms';
            data.phoneNumbers = document.getElementById('phoneNumbers')?.value;
            data.message = document.getElementById('message')?.value;
        }
        
        console.log('[ServiceHandler] Collected data:', data);
        return data;
    },
    
    // Show error
    showError(message) {
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-state').classList.remove('hidden');
        lucide.createIcons();
    }
};
