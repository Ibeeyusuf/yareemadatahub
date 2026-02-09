
// Agent Services API
const AgentServices = {
    
    // Get all available services and plans
    async getServices() {
        try {
            console.log('[Services] Fetching available services');
            
            const response = await API.get(API_CONFIG.ENDPOINTS.AGENT_SERVICES);
            
            console.log('[Services] Response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to load services');
            
        } catch (error) {
            console.error('[Services] Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to load services'
            };
        }
    },
    
    // Get data plans from API
    async getDataPlans(network) {
        try {
            console.log('[Services] Fetching data plans for:', network);
            
            const response = await API.get(`${API_CONFIG.ENDPOINTS.DATA_PLANS}?network=${network}`);
            
            console.log('[Services] Data plans response:', response);
            
            // Handle successful response
            if (response.success || response.status === 'success') {
                const plans = response.data || response.plans || [];
                
                if (plans.length > 0) {
                    return {
                        success: true,
                        data: plans
                    };
                }
            }
            
            console.warn('[Services] API returned no plans, using fallback');
            return this.getFallbackDataPlans(network);
            
        } catch (error) {
            console.error('[Services] Error loading data plans:', error);
            // Use fallback plans on error
            return this.getFallbackDataPlans(network);
        }
    },
    
    // Fallback data plans when API fails
    getFallbackDataPlans(network) {
        console.log('[Services] Using fallback data plans for:', network);
        
        const fallbackPlans = {
            mtn: [
                { id: 'mtn_1gb', name: '1GB - 30 Days', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'mtn_2gb', name: '2GB - 30 Days', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'mtn_3gb', name: '3GB - 30 Days', plan: '3GB', price: 900, amount: 900, validity: '30 days', commission: 5 },
                { id: 'mtn_5gb', name: '5GB - 30 Days', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 },
                { id: 'mtn_10gb', name: '10GB - 30 Days', plan: '10GB', price: 3000, amount: 3000, validity: '30 days', commission: 5 }
            ],
            airtel: [
                { id: 'airtel_1gb', name: '1GB - 30 Days', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'airtel_2gb', name: '2GB - 30 Days', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'airtel_5gb', name: '5GB - 30 Days', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 },
                { id: 'airtel_10gb', name: '10GB - 30 Days', plan: '10GB', price: 3000, amount: 3000, validity: '30 days', commission: 5 }
            ],
            glo: [
                { id: 'glo_1gb', name: '1GB - 30 Days', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'glo_2gb', name: '2GB - 30 Days', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'glo_5gb', name: '5GB - 30 Days', plan: '5GB', price: 1400, amount: 1400, validity: '30 days', commission: 5 },
                { id: 'glo_10gb', name: '10GB - 30 Days', plan: '10GB', price: 2800, amount: 2800, validity: '30 days', commission: 5 }
            ],
            '9mobile': [
                { id: '9mobile_1gb', name: '1GB - 30 Days', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: '9mobile_2gb', name: '2GB - 30 Days', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: '9mobile_5gb', name: '5GB - 30 Days', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 }
            ]
        };
        
        const plans = fallbackPlans[network.toLowerCase()] || fallbackPlans.mtn;
        
        return {
            success: true,
            data: plans,
            fallback: true
        };
    },
    
    // Purchase Data Bundle
    async purchaseData(formData) {
        try {
            console.log('[Services] Purchasing data:', formData);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_PURCHASE_DATA, formData);
            
            console.log('[Services] Purchase response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Data purchase successful',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Data purchase failed');
            
        } catch (error) {
            console.error('[Services] Purchase error:', error);
            return {
                success: false,
                message: error.message || 'Data purchase failed. Please try again.'
            };
        }
    },
    
    // Purchase Airtime
    async purchaseAirtime(formData) {
        try {
            console.log('[Services] Purchasing airtime:', formData);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_PURCHASE_AIRTIME, formData);
            
            console.log('[Services] Purchase response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Airtime purchase successful',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Airtime purchase failed');
            
        } catch (error) {
            console.error('[Services] Purchase error:', error);
            return {
                success: false,
                message: error.message || 'Airtime purchase failed. Please try again.'
            };
        }
    },
    
    // Pay Bill (Electricity, Cable TV, Education, SMS)
    async payBill(formData) {
        try {
            console.log('[Services] Paying bill:', formData);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_PAY_BILL, formData);
            
            console.log('[Services] Bill payment response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Bill payment successful',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Bill payment failed');
            
        } catch (error) {
            console.error('[Services] Bill payment error:', error);
            return {
                success: false,
                message: error.message || 'Bill payment failed. Please try again.'
            };
        }
    },
    
    // Verify Customer
    async verifyCustomer(phoneNumber, network) {
        try {
            console.log('[Services] Verifying customer:', phoneNumber, network);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.AGENT_VERIFY_CUSTOMER, {
                phoneNumber,
                network
            });
            
            console.log('[Services] Verify response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Customer verified',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Customer verification failed');
            
        } catch (error) {
            console.error('[Services] Verification error:', error);
            return {
                success: false,
                message: error.message || 'Customer verification failed'
            };
        }
    },
    
    // Get Cable Plans
    async getCablePlans(provider) {
        try {
            console.log('[Services] Fetching cable plans for:', provider);
            
            const response = await API.get(`${API_CONFIG.ENDPOINTS.CABLE_PLANS}?provider=${provider}`);
            
            console.log('[Services] Cable plans response:', response);
            
            if (response.success || response.status === 'success') {
                const plans = response.data || response.plans || [];
                
                if (plans.length > 0) {
                    return {
                        success: true,
                        data: plans
                    };
                }
            }
            
            // If API returns empty or fails, use fallback plans
            console.warn('[Services] API returned no cable plans, using fallback');
            return this.getFallbackCablePlans(provider);
            
        } catch (error) {
            console.error('[Services] Error loading cable plans:', error);
            return this.getFallbackCablePlans(provider);
        }
    },
    
    // Fallback cable plans
    getFallbackCablePlans(provider) {
        console.log('[Services] Using fallback cable plans for:', provider);
        
        const fallbackPlans = {
            dstv: [
                { id: 'dstv_padi', name: 'DStv Padi', package: 'Padi', price: 2500, amount: 2500, validity: '30 days' },
                { id: 'dstv_yanga', name: 'DStv Yanga', package: 'Yanga', price: 3500, amount: 3500, validity: '30 days' },
                { id: 'dstv_confam', name: 'DStv Confam', package: 'Confam', price: 6200, amount: 6200, validity: '30 days' },
                { id: 'dstv_compact', name: 'DStv Compact', package: 'Compact', price: 10500, amount: 10500, validity: '30 days' },
                { id: 'dstv_compact_plus', name: 'DStv Compact Plus', package: 'Compact Plus', price: 16600, amount: 16600, validity: '30 days' },
                { id: 'dstv_premium', name: 'DStv Premium', package: 'Premium', price: 24500, amount: 24500, validity: '30 days' }
            ],
            gotv: [
                { id: 'gotv_smallie', name: 'GOtv Smallie', package: 'Smallie', price: 1300, amount: 1300, validity: '30 days' },
                { id: 'gotv_jinja', name: 'GOtv Jinja', package: 'Jinja', price: 2250, amount: 2250, validity: '30 days' },
                { id: 'gotv_jolli', name: 'GOtv Jolli', package: 'Jolli', price: 3300, amount: 3300, validity: '30 days' },
                { id: 'gotv_max', name: 'GOtv Max', package: 'Max', price: 4850, amount: 4850, validity: '30 days' },
                { id: 'gotv_supa', name: 'GOtv Supa', package: 'Supa', price: 6400, amount: 6400, validity: '30 days' }
            ],
            startimes: [
                { id: 'startimes_nova', name: 'Startimes Nova', package: 'Nova', price: 900, amount: 900, validity: '30 days' },
                { id: 'startimes_basic', name: 'Startimes Basic', package: 'Basic', price: 1850, amount: 1850, validity: '30 days' },
                { id: 'startimes_smart', name: 'Startimes Smart', package: 'Smart', price: 2600, amount: 2600, validity: '30 days' },
                { id: 'startimes_classic', name: 'Startimes Classic', package: 'Classic', price: 3200, amount: 3200, validity: '30 days' },
                { id: 'startimes_super', name: 'Startimes Super', package: 'Super', price: 5000, amount: 5000, validity: '30 days' }
            ]
        };
        
        const plans = fallbackPlans[provider.toLowerCase()] || fallbackPlans.dstv;
        
        return {
            success: true,
            data: plans,
            fallback: true
        };
    }
};

// Wallet API
const WalletAPI = {
    
    // Get wallet balance
    async getBalance() {
        try {
            console.log('[Wallet] Fetching balance');
            
            const response = await API.get(API_CONFIG.ENDPOINTS.WALLET_BALANCE);
            
            console.log('[Wallet] Balance response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to load balance');
            
        } catch (error) {
            console.error('[Wallet] Balance error:', error);
            return {
                success: false,
                message: error.message || 'Failed to load wallet balance'
            };
        }
    },
    
    // Get wallet transactions
    async getTransactions(filters = {}) {
        try {
            console.log('[Wallet] Fetching transactions', filters);
            
            // Build query string
            const queryParams = new URLSearchParams();
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            
            const queryString = queryParams.toString();
            const endpoint = queryString ? 
                `${API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS}?${queryString}` : 
                API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS;
            
            const response = await API.get(endpoint);
            
            console.log('[Wallet] Transactions response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to load transactions');
            
        } catch (error) {
            console.error('[Wallet] Transactions error:', error);
            return {
                success: false,
                message: error.message || 'Failed to load transactions'
            };
        }
    },
    
    // Fund wallet
    async fundWallet(amount) {
        try {
            console.log('[Wallet] Funding wallet:', amount);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.WALLET_FUND, {
                amount
            });
            
            console.log('[Wallet] Fund response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Wallet funding initiated',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Wallet funding failed');
            
        } catch (error) {
            console.error('[Wallet] Fund error:', error);
            return {
                success: false,
                message: error.message || 'Wallet funding failed'
            };
        }
    },
    
    // Withdraw from wallet
    async withdraw(formData) {
        try {
            console.log('[Wallet] Withdrawing:', formData);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.WALLET_WITHDRAW, formData);
            
            console.log('[Wallet] Withdraw response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Withdrawal request submitted',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Withdrawal failed');
            
        } catch (error) {
            console.error('[Wallet] Withdraw error:', error);
            return {
                success: false,
                message: error.message || 'Withdrawal failed'
            };
        }
    }
};

// Update wallet balance on page
async function updateWalletBalance() {
    const walletElements = document.querySelectorAll('[data-wallet-balance]');
    
    if (walletElements.length === 0) return;
    
    try {
        const result = await WalletAPI.getBalance();
        
        if (result.success && result.data) {
            const balance = result.data.balance || result.data.availableBalance || 0;
            walletElements.forEach(el => {
                el.textContent = UI.formatCurrency(balance);
            });
        }
    } catch (error) {
        console.error('[Wallet] Update balance error:', error);
    }
}

// Load data plans from API
async function loadDataPlans(network) {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;
    
    // Show loading
    planSelect.innerHTML = '<option value="">Loading plans...</option>';
    planSelect.disabled = true;
    
    try {
        const result = await AgentServices.getDataPlans(network);
        
        if (result.success && result.data) {
            planSelect.innerHTML = '<option value="">Select data plan...</option>';
            
            result.data.forEach((plan, index) => {
                const option = document.createElement('option');
                option.value = plan.id || index;
                option.textContent = `${plan.name || plan.plan} - ${UI.formatCurrency(plan.price || plan.amount)}`;
                option.dataset.price = plan.price || plan.amount;
                option.dataset.plan = plan.name || plan.plan;
                option.dataset.planId = plan.id;
                option.dataset.commission = plan.commission || 0;
                planSelect.appendChild(option);
            });
        } else {
            planSelect.innerHTML = '<option value="">Failed to load plans</option>';
            UI.showToast(result.message, 'error');
        }
    } catch (error) {
        planSelect.innerHTML = '<option value="">Error loading plans</option>';
        UI.showToast('Failed to load data plans', 'error');
    } finally {
        planSelect.disabled = false;
    }
}

// Load cable plans from API
async function loadCablePlans(provider) {
    const planSelect = document.getElementById('cablePlan');
    if (!planSelect) return;
    
    // Show loading
    planSelect.innerHTML = '<option value="">Loading plans...</option>';
    planSelect.disabled = true;
    
    try {
        const result = await AgentServices.getCablePlans(provider);
        
        if (result.success && result.data) {
            planSelect.innerHTML = '<option value="">Select cable plan...</option>';
            
            result.data.forEach((plan, index) => {
                const option = document.createElement('option');
                option.value = plan.id || index;
                option.textContent = `${plan.name || plan.package} - ${UI.formatCurrency(plan.price || plan.amount)}`;
                option.dataset.price = plan.price || plan.amount;
                option.dataset.plan = plan.name || plan.package;
                option.dataset.planId = plan.id;
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
}

// Update data plans dropdown
function updateDataPlans() {
    const network = document.getElementById('dataNetwork')?.value;
    if (network) {
        loadDataPlans(network);
    }
}

// Update cable plans dropdown
function updateCablePlans() {
    const provider = document.getElementById('cableProvider')?.value;
    if (provider) {
        loadCablePlans(provider);
    }
}

// Calculate Commission (works with both hardcoded and API data)
function calculateCommission(type) {
    if (type === 'data') {
        const planSelect = document.getElementById('dataPlan');
        const selectedOption = planSelect?.options[planSelect.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.price) {
            const price = parseFloat(selectedOption.dataset.price);
            const commissionRate = parseFloat(selectedOption.dataset.commission || 0);
            const commission = (price * commissionRate / 100).toFixed(2);
            
            const amountEl = document.getElementById('dataAmount');
            const commissionEl = document.getElementById('dataCommission');
            const rateEl = document.getElementById('dataRate');
            const preview = document.getElementById('dataCommissionPreview');
            
            if (amountEl) amountEl.textContent = UI.formatCurrency(price);
            if (commissionEl) commissionEl.textContent = UI.formatCurrency(commission);
            if (rateEl) rateEl.textContent = `${commissionRate}%`;
            if (preview) preview.classList.remove('hidden');
        }
    } else if (type === 'airtime') {
        const networkSelect = document.getElementById('airtimeNetwork');
        const amountInput = document.getElementById('airtimeAmount');
        const selectedOption = networkSelect?.options[networkSelect.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.rate && amountInput?.value) {
            const amount = parseFloat(amountInput.value);
            const commissionRate = parseFloat(selectedOption.dataset.rate);
            const commission = (amount * commissionRate / 100).toFixed(2);
            
            const amountEl = document.getElementById('airtimeAmountDisplay');
            const commissionEl = document.getElementById('airtimeCommission');
            const rateEl = document.getElementById('airtimeRate');
            const preview = document.getElementById('airtimeCommissionPreview');
            
            if (amountEl) amountEl.textContent = UI.formatCurrency(amount);
            if (commissionEl) commissionEl.textContent = UI.formatCurrency(commission);
            if (rateEl) rateEl.textContent = `${commissionRate}%`;
            if (preview) preview.classList.remove('hidden');
        }
    }
}

// Transaction status checker
async function checkTransactionStatus(reference) {
    try {
        const response = await API.get(`${API_CONFIG.ENDPOINTS.TRANSACTION_STATUS}/${reference}`);
        
        if (response.success || response.status === 'success') {
            return {
                success: true,
                data: response.data
            };
        }
        
        throw new Error(response.message || 'Failed to check status');
    } catch (error) {
        console.error('[Transaction] Status check error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Initialize wallet balance on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update wallet balance if elements exist
    if (document.querySelectorAll('[data-wallet-balance]').length > 0) {
        updateWalletBalance();
    }
});
