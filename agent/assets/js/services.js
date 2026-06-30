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
            
            let plans = [];
            
            // ACTUAL API returns: { status:'success', data: { services: { data_recharge: [...] } } }
            // Each plan has a `provider` / `network` field — filter by selected network
            if (response.data && response.data.services && response.data.services.data_recharge) {
                const allPlans = response.data.services.data_recharge;
                plans = allPlans.filter(p =>
                    (p.network || p.provider || '').toLowerCase() === network.toLowerCase()
                );
                // If no network-filtered results, return all (API may already filter by query param)
                if (plans.length === 0) plans = allPlans;
            }
            // Fallback shapes from other API versions
            else if (response.data && response.data[network]) {
                plans = response.data[network];
            } else if (response.data && response.data.plans && response.data.plans[network]) {
                plans = response.data.plans[network];
            } else if (response[network]) {
                plans = response[network];
            } else if (Array.isArray(response.data)) {
                plans = response.data.filter(p =>
                    (p.network || p.provider || '').toLowerCase() === network.toLowerCase()
                );
                if (plans.length === 0) plans = response.data;
            } else if (Array.isArray(response)) {
                plans = response;
            }
            
            if (plans.length > 0) {
                return { success: true, data: plans };
            }
            
            console.warn('[Services] API returned no plans, using fallback');
            return this.getFallbackDataPlans(network);
            
        } catch (error) {
            console.error('[Services] Error loading data plans:', error);
            return this.getFallbackDataPlans(network);
        }
    },
    
    // Fallback data plans when API fails
    getFallbackDataPlans(network) {
        console.log('[Services] Using fallback data plans for:', network);
        
        const fallbackPlans = {
            mtn: [
                { id: 'mtn_1gb', planName: '1GB - 30 Days', name: '1GB - 30 Days', size: '1GB', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'mtn_2gb', planName: '2GB - 30 Days', name: '2GB - 30 Days', size: '2GB', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'mtn_3gb', planName: '3GB - 30 Days', name: '3GB - 30 Days', size: '3GB', plan: '3GB', price: 900, amount: 900, validity: '30 days', commission: 5 },
                { id: 'mtn_5gb', planName: '5GB - 30 Days', name: '5GB - 30 Days', size: '5GB', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 },
                { id: 'mtn_10gb', planName: '10GB - 30 Days', name: '10GB - 30 Days', size: '10GB', plan: '10GB', price: 3000, amount: 3000, validity: '30 days', commission: 5 }
            ],
            airtel: [
                { id: 'airtel_1gb', planName: '1GB - 30 Days', name: '1GB - 30 Days', size: '1GB', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'airtel_2gb', planName: '2GB - 30 Days', name: '2GB - 30 Days', size: '2GB', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'airtel_5gb', planName: '5GB - 30 Days', name: '5GB - 30 Days', size: '5GB', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 },
                { id: 'airtel_10gb', planName: '10GB - 30 Days', name: '10GB - 30 Days', size: '10GB', plan: '10GB', price: 3000, amount: 3000, validity: '30 days', commission: 5 }
            ],
            glo: [
                { id: 'glo_1gb', planName: '1GB - 30 Days', name: '1GB - 30 Days', size: '1GB', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: 'glo_2gb', planName: '2GB - 30 Days', name: '2GB - 30 Days', size: '2GB', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: 'glo_5gb', planName: '5GB - 30 Days', name: '5GB - 30 Days', size: '5GB', plan: '5GB', price: 1400, amount: 1400, validity: '30 days', commission: 5 },
                { id: 'glo_10gb', planName: '10GB - 30 Days', name: '10GB - 30 Days', size: '10GB', plan: '10GB', price: 2800, amount: 2800, validity: '30 days', commission: 5 }
            ],
            '9mobile': [
                { id: '9mobile_1gb', planName: '1GB - 30 Days', name: '1GB - 30 Days', size: '1GB', plan: '1GB', price: 300, amount: 300, validity: '30 days', commission: 5 },
                { id: '9mobile_2gb', planName: '2GB - 30 Days', name: '2GB - 30 Days', size: '2GB', plan: '2GB', price: 600, amount: 600, validity: '30 days', commission: 5 },
                { id: '9mobile_5gb', planName: '5GB - 30 Days', name: '5GB - 30 Days', size: '5GB', plan: '5GB', price: 1500, amount: 1500, validity: '30 days', commission: 5 }
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
            
            // Try with provider param first
            let response;
            try {
                response = await API.get(`${API_CONFIG.ENDPOINTS.CABLE_PLANS}?provider=${provider}`);
            } catch (e) {
                response = await API.get(API_CONFIG.ENDPOINTS.CABLE_PLANS);
            }
            
            console.log('[Services] Cable plans response:', response);
            
            let plans = [];
            
            // ACTUAL API shape: { data: { services: { cable_tv: [...] } } }
            if (response.data && response.data.services) {
                const svc = response.data.services;
                const cablePlans = svc.cable_tv || svc.cable || svc.cabletv || [];
                plans = cablePlans.filter(p =>
                    (p.provider || p.network || '').toLowerCase() === provider.toLowerCase()
                );
                if (plans.length === 0) plans = cablePlans;
            }
            // Fallback shapes
            else if (response.data && response.data.plans && response.data.plans[provider]) {
                plans = response.data.plans[provider];
            } else if (response.data && response.data[provider]) {
                plans = response.data[provider];
            } else if (response[provider]) {
                plans = response[provider];
            } else if (Array.isArray(response.data)) {
                plans = response.data.filter(p =>
                    (p.provider || '').toLowerCase() === provider.toLowerCase()
                );
                if (plans.length === 0) plans = response.data;
            } else if (Array.isArray(response)) {
                plans = response;
            }
            
            if (plans.length > 0) {
                return { success: true, data: plans };
            }
            
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
                { id: 'dstv_padi', planName: 'DStv Padi', name: 'DStv Padi', package: 'Padi', sellingPrice: 2500, price: 2500, amount: 2500, validity: '30 days' },
                { id: 'dstv_yanga', planName: 'DStv Yanga', name: 'DStv Yanga', package: 'Yanga', sellingPrice: 3500, price: 3500, amount: 3500, validity: '30 days' },
                { id: 'dstv_confam', planName: 'DStv Confam', name: 'DStv Confam', package: 'Confam', sellingPrice: 6200, price: 6200, amount: 6200, validity: '30 days' },
                { id: 'dstv_compact', planName: 'DStv Compact', name: 'DStv Compact', package: 'Compact', sellingPrice: 10500, price: 10500, amount: 10500, validity: '30 days' },
                { id: 'dstv_compact_plus', planName: 'DStv Compact Plus', name: 'DStv Compact Plus', package: 'Compact Plus', sellingPrice: 16600, price: 16600, amount: 16600, validity: '30 days' },
                { id: 'dstv_premium', planName: 'DStv Premium', name: 'DStv Premium', package: 'Premium', sellingPrice: 24500, price: 24500, amount: 24500, validity: '30 days' }
            ],
            gotv: [
                { id: 'gotv_smallie', planName: 'GOtv Smallie', name: 'GOtv Smallie', package: 'Smallie', sellingPrice: 1300, price: 1300, amount: 1300, validity: '30 days' },
                { id: 'gotv_jinja', planName: 'GOtv Jinja', name: 'GOtv Jinja', package: 'Jinja', sellingPrice: 2250, price: 2250, amount: 2250, validity: '30 days' },
                { id: 'gotv_jolli', planName: 'GOtv Jolli', name: 'GOtv Jolli', package: 'Jolli', sellingPrice: 3300, price: 3300, amount: 3300, validity: '30 days' },
                { id: 'gotv_max', planName: 'GOtv Max', name: 'GOtv Max', package: 'Max', sellingPrice: 4850, price: 4850, amount: 4850, validity: '30 days' },
                { id: 'gotv_supa', planName: 'GOtv Supa', name: 'GOtv Supa', package: 'Supa', sellingPrice: 6400, price: 6400, amount: 6400, validity: '30 days' }
            ],
            startimes: [
                { id: 'startimes_nova', planName: 'Startimes Nova', name: 'Startimes Nova', package: 'Nova', sellingPrice: 900, price: 900, amount: 900, validity: '30 days' },
                { id: 'startimes_basic', planName: 'Startimes Basic', name: 'Startimes Basic', package: 'Basic', sellingPrice: 1850, price: 1850, amount: 1850, validity: '30 days' },
                { id: 'startimes_smart', planName: 'Startimes Smart', name: 'Startimes Smart', package: 'Smart', sellingPrice: 2600, price: 2600, amount: 2600, validity: '30 days' },
                { id: 'startimes_classic', planName: 'Startimes Classic', name: 'Startimes Classic', package: 'Classic', sellingPrice: 3200, price: 3200, amount: 3200, validity: '30 days' },
                { id: 'startimes_super', planName: 'Startimes Super', name: 'Startimes Super', package: 'Super', sellingPrice: 5000, price: 5000, amount: 5000, validity: '30 days' }
            ]
        };
        
        const plans = fallbackPlans[provider.toLowerCase()] || fallbackPlans.dstv;
        
        return {
            success: true,
            data: plans,
            fallback: true
        };
    },

    // Purchase Airtime PIN (ePIN / Recharge Card)
    async purchaseAirtimePin(formData) {
        try {
            const response = await API.post('/api/v1/telecom/recharge-pin/purchase', {
                network: formData.network,
                pinType: formData.denomination,
                quantity: formData.quantity,
                transactionPin: formData.transactionPin
            });

            if (response.success || response.status === 'success') {
                // Flatten TXN_EPIN to top-level data so showSuccessMessage can find it
                const respData = response.data || {};
                return {
                    success: true,
                    message: response.message || `${formData.quantity} x ₦${formData.denomination} ${(formData.network || '').toUpperCase()} PIN(s) purchased`,
                    data: respData.TXN_EPIN ? respData : { TXN_EPIN: respData.TXN_EPIN || [], ...respData }
                };
            }

            throw new Error(response.message || 'Purchase failed');
        } catch (error) {
            console.error('[AirtimePin] Purchase error:', error);
            return { success: false, message: error.message };
        }
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
    },

    // Provision wallet / virtual account (same flow as user module: POST /wallet/create)
    async createWalletAccount(payload = {}) {
        try {
            const response = await API.post('/wallet/create', payload);
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Failed to create wallet');
        } catch (error) {
            console.error('[Wallet] createWalletAccount error:', error);
            return { success: false, message: error.message || 'Failed to create wallet account' };
        }
    },

    // Available commission balance (GET /agent/commission/balance; falls back to dashboard stats)
    async getCommissionBalance() {
        try {
            const response = await API.get('/agent/commission/balance');
            if (response.success || response.status === 'success') {
                const d = response.data || {};
                const bal = d.balance ?? d.availableCommission ?? d.available ?? d.commission ?? 0;
                return { success: true, balance: Number(bal) || 0, data: d };
            }
            throw new Error(response.message || 'Failed to load commission balance');
        } catch (error) {
            // Fallback so the card still shows something using existing dashboard data
            try {
                const dash = await API.get(API_CONFIG.ENDPOINTS.AGENT_DASHBOARD);
                const sObj = (dash && (dash.data || dash)) || {};
                const bal = sObj.availableCommission ?? sObj.available_commission ?? (sObj.commission && sObj.commission.available) ?? 0;
                return { success: true, balance: Number(bal) || 0, data: sObj, fallback: true };
            } catch (e2) {
                return { success: false, balance: 0, message: error.message || 'Failed to load commission balance' };
            }
        }
    },

    // Withdraw commission into wallet (POST /agent/commission/withdraw { amount })
    async withdrawCommission(amount) {
        try {
            const response = await API.post('/agent/commission/withdraw', { amount });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Commission moved to your wallet', data: response.data };
            }
            throw new Error(response.message || 'Commission withdrawal failed');
        } catch (error) {
            console.error('[Wallet] withdrawCommission error:', error);
            return { success: false, message: error.message || 'Commission withdrawal failed' };
        }
    }
};

// Update wallet balance on page
async function updateWalletBalance() {
    try {
        let result = await WalletAPI.getBalance();

        // Auto-provision the wallet if a new agent has none yet (same flow as user module)
        const hasWallet = result.success && result.data && (
            result.data.balance != null || result.data.availableBalance != null ||
            result.data.walletBalance != null ||
            (result.data.wallet || result.data.accounts || result.data.virtualAccount)
        );
        if (!hasWallet) {
            const created = await WalletAPI.createWalletAccount({});
            if (created.success) {
                result = await WalletAPI.getBalance();
            }
        }

        if (result.success && result.data) {
            const balance = parseFloat(
                result.data.balance || result.data.availableBalance || result.data.walletBalance || 0
            );
            const formatted = UI.formatCurrency(balance);
            const rawFormatted = balance.toLocaleString('en-NG', { minimumFractionDigits: 2 });

            // Store in dedicated key — initSidebar() reads this
            localStorage.setItem('agentWalletBalance', balance.toString());

            // Update all [data-wallet-balance] elements
            document.querySelectorAll('[data-wallet-balance]').forEach(el => {
                el.textContent = formatted;
            });

            // Update sidebar balance span directly
            const sidebarBal = document.getElementById('walletBalance');
            if (sidebarBal) sidebarBal.textContent = rawFormatted;

            // Show account number on the dashboard wallet card (#agentWalletAccount)
            const acctEl = document.getElementById('agentWalletAccount');
            if (acctEl) {
                const w = (result.data && (result.data.wallet || result.data)) || {};
                let acc = null;
                if (Array.isArray(w.accounts) && w.accounts.length) acc = w.accounts[0];
                else if (w.virtualAccount && w.virtualAccount.accountNumber) acc = w.virtualAccount;
                else if (result.data && result.data.virtualAccount && result.data.virtualAccount.accountNumber) acc = result.data.virtualAccount;
                if (acc && acc.accountNumber) {
                    acctEl.textContent = (acc.bankName || acc.bank || 'Acct') + ' • ' + acc.accountNumber;
                } else {
                    acctEl.textContent = 'No account yet';
                }
            }

            return balance;
        }
    } catch (error) {
        console.error('[Wallet] updateWalletBalance error:', error);
    }
    return 0;
}

// Load data plans from API
async function loadDataPlans(network) {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;
    
    planSelect.innerHTML = '<option value="">Loading plans...</option>';
    planSelect.disabled = true;
    
    try {
        const result = await AgentServices.getDataPlans(network);
        
        if (result.success && result.data && result.data.length > 0) {
            planSelect.innerHTML = '<option value="">Select data plan...</option>';
            
            result.data.forEach((plan, index) => {
                const option = document.createElement('option');
                option.value = plan._id || plan.id || index;
                // Actual API fields: dataAmount, planName, sellingPrice, validity
                const label = plan.dataAmount || plan.size || plan.planName || plan.name || plan.plan || 'Data Plan';
                const validity = plan.validity ? ` (${plan.validity})` : '';
                const price = plan.sellingPrice || plan.price || plan.amount || 0;
                option.textContent = `${label}${validity} - ₦${Number(price).toLocaleString()}`;
                option.dataset.price = price;
                option.dataset.plan = plan.planName || plan.name || plan.plan;
                option.dataset.planId = plan._id || plan.id;
                option.dataset.planCode = plan.planCode || '';
                option.dataset.commission = plan.profitMargin || plan.commission || 0;
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
}

// Load cable plans from API
async function loadCablePlans(provider) {
    const planSelect = document.getElementById('cablePlan');
    if (!planSelect) return;
    
    planSelect.innerHTML = '<option value="">Loading plans...</option>';
    planSelect.disabled = true;
    
    try {
        const result = await AgentServices.getCablePlans(provider);
        
        if (result.success && result.data && result.data.length > 0) {
            planSelect.innerHTML = '<option value="">Select cable plan...</option>';
            
            result.data.forEach((plan, index) => {
                const option = document.createElement('option');
                option.value = plan._id || plan.planCode || plan.id || index;
                const name = plan.planName || plan.name || plan.package || 'Plan';
                const price = plan.sellingPrice || plan.price || plan.amount || 0;
                option.textContent = `${name} - ₦${Number(price).toLocaleString()}`;
                option.dataset.price = price;
                option.dataset.plan = name;
                option.dataset.planId = plan._id || plan.id;
                option.dataset.planCode = plan.planCode || '';
                planSelect.appendChild(option);
            });
        } else {
            planSelect.innerHTML = '<option value="">Failed to load plans</option>';
            if (result.message) UI.showToast(result.message, 'error');
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

// ==================== MISSING SERVICES (ported from User module) ====================

// Airtime Swap (User: swapAirtime)
const AgentAirtimeSwap = {
    async swap(phoneNumber, network, airtimeAmount, transactionPin) {
        try {
            const response = await API.post('/api/v1/agent/airtime/swap', {
                phoneNumber,
                network: network.toLowerCase(),
                airtimeAmount,
                transactionPin
            });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Airtime swap successful', data: response.data };
            }
            throw new Error(response.message || 'Airtime swap failed');
        } catch (error) {
            return { success: false, message: error.message || 'Airtime swap failed. Please try again.' };
        }
    }
};

// ePIN Purchase (User: purchaseEpin)
const AgentEpin = {
    async purchase(network, amount, quantity, transactionPin) {
        try {
            const response = await API.post('/api/v1/telecom/epin/purchase', {
                network,
                amount,
                quantity,
                transactionPin
            });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'ePIN purchase successful', data: response.data };
            }
            throw new Error(response.message || 'ePIN purchase failed');
        } catch (error) {
            return { success: false, message: error.message || 'ePIN purchase failed. Please try again.' };
        }
    }
};

// Electricity (dedicated methods matching User: verifyElectricityCustomer + purchaseElectricity)
const AgentElectricity = {
    async verify(meterNumber, disco, meterType = 'prepaid') {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.ELECTRICITY_VERIFY, {
                meterNumber,
                disco: disco.toLowerCase(),
                meterType
            });
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Meter verification failed');
        } catch (error) {
            return { success: false, message: error.message || 'Meter verification failed' };
        }
    },

    async purchase(meterNumber, disco, amount, phoneNumber, transactionPin, meterType = 'prepaid') {
        try {
            const response = await API.post('/api/v1/agent/bills/electricity/purchase', {
                meterNumber,
                disco: disco.toLowerCase(),
                meterType,
                amount,
                phoneNumber,
                transactionPin
            });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Electricity purchase successful', data: response.data };
            }
            throw new Error(response.message || 'Electricity purchase failed');
        } catch (error) {
            return { success: false, message: error.message || 'Electricity purchase failed. Please try again.' };
        }
    }
};

// Cable TV (dedicated purchase matching User: purchaseCableTV)
const AgentCableTV = {
    async verify(smartCardNumber, provider) {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.CABLE_VERIFY, {
                smartCardNumber,
                provider: provider.toLowerCase()
            });
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Smart card verification failed');
        } catch (error) {
            return { success: false, message: error.message || 'Smart card verification failed' };
        }
    },

    async purchase(smartCardNumber, provider, planId, months, transactionPin) {
        try {
            const response = await API.post('/api/v1/agent/bills/cable/purchase', {
                smartCardNumber,
                provider: provider.toLowerCase(),
                planId,
                months,
                transactionPin
            });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Cable TV subscription successful', data: response.data };
            }
            throw new Error(response.message || 'Cable TV subscription failed');
        } catch (error) {
            return { success: false, message: error.message || 'Cable TV subscription failed. Please try again.' };
        }
    }
};

// Education PIN (dedicated matching User: purchaseEducationPIN)
const AgentEducation = {
    async purchase(examType, quantity, transactionPin) {
        try {
            const response = await API.post('/api/v1/agent/bills/education/purchase', {
                examType,
                quantity,
                transactionPin
            });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Education PIN purchase successful', data: response.data };
            }
            throw new Error(response.message || 'Education PIN purchase failed');
        } catch (error) {
            return { success: false, message: error.message || 'Education PIN purchase failed. Please try again.' };
        }
    }
};

// Notifications (matching User: getNotifications, markNotificationRead, etc.)
const AgentNotifications = {
    async getAll() {
        try {
            const response = await API.get('/api/v1/notifications');
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Failed to load notifications');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async getUnreadCount() {
        try {
            const response = await API.get('/api/v1/notifications/unread-count');
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Failed to get unread count');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async markRead(id) {
        try {
            const response = await API.put(`/api/v1/notifications/${id}/read`);
            if (response.success || response.status === 'success') {
                return { success: true };
            }
            throw new Error(response.message || 'Failed to mark as read');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async markAllRead() {
        try {
            const response = await API.put('/api/v1/notifications/mark-all-read');
            if (response.success || response.status === 'success') {
                return { success: true };
            }
            throw new Error(response.message || 'Failed to mark all as read');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async delete(id) {
        try {
            const response = await API.delete(`/api/v1/notifications/${id}`);
            if (response.success || response.status === 'success') {
                return { success: true };
            }
            throw new Error(response.message || 'Failed to delete notification');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async deleteAll() {
        try {
            const response = await API.delete('/api/v1/notifications');
            if (response.success || response.status === 'success') {
                return { success: true };
            }
            throw new Error(response.message || 'Failed to delete all notifications');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

// Remita RRR Payment (matching User: validateRRR + processRRRPayment)
const AgentRemita = {
    async validate(rrr) {
        try {
            const response = await API.post('/api/v1/remita/validate', { rrr });
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'RRR validation failed');
        } catch (error) {
            return { success: false, message: error.message || 'RRR validation failed' };
        }
    },

    async processPayment(rrr, transactionPin) {
        try {
            const response = await API.post('/api/v1/remita/payment', { rrr, transactionPin });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'RRR payment successful', data: response.data };
            }
            throw new Error(response.message || 'RRR payment failed');
        } catch (error) {
            return { success: false, message: error.message || 'RRR payment failed. Please try again.' };
        }
    }
};

// Wallet — extend WalletAPI with missing methods (User: createWalletAccount, transferFunds, setWalletPIN)
const AgentWalletExtended = {
    async createAccount(payload = {}) {
        try {
            const response = await API.post('/api/v1/wallet/create', payload);
            if (response.success || response.status === 'success') {
                return { success: true, data: response.data };
            }
            throw new Error(response.message || 'Wallet creation failed');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async transfer(data) {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.WALLET_TRANSFER, data);
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Transfer successful', data: response.data };
            }
            throw new Error(response.message || 'Transfer failed');
        } catch (error) {
            return { success: false, message: error.message || 'Transfer failed. Please try again.' };
        }
    },

    async setWalletPIN(transactionPin, confirmPin) {
        try {
            const response = await API.post('/api/v1/wallet/set-pin', { transactionPin, confirmPin });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Wallet PIN set successfully' };
            }
            throw new Error(response.message || 'Failed to set wallet PIN');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

// Auth — extend with missing methods (User: resendOTP, updateProfile, changePassword, setTransactionPIN)
const AgentAuthExtended = {
    async resendOTP(email, verificationType = 'email') {
        try {
            const response = await API.post('/api/v1/auth/resend-otp', { email, verificationType });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'OTP resent successfully' };
            }
            throw new Error(response.message || 'Failed to resend OTP');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async updateProfile(data) {
        try {
            const response = await API.put(API_CONFIG.ENDPOINTS.AUTH_PROFILE, data);
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Profile updated successfully', data: response.data };
            }
            throw new Error(response.message || 'Profile update failed');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await API.post(API_CONFIG.ENDPOINTS.AUTH_CHANGE_PASSWORD, { currentPassword, newPassword });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Password changed successfully' };
            }
            throw new Error(response.message || 'Password change failed');
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async setTransactionPIN(transactionPin, confirmPin) {
        try {
            const response = await API.post('/api/v1/agents/wallet/set-pin', { transactionPin, confirmPin });
            if (response.success || response.status === 'success') {
                return { success: true, message: response.message || 'Transaction PIN set successfully' };
            }
            throw new Error(response.message || 'Failed to set transaction PIN');
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

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