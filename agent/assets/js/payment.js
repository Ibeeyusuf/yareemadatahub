// Remita Payment Integration Module
// Using Remita Inline SDK for seamless payment processing

const RemitaPayment = {
    
    // Check if Remita SDK is loaded
    isSDKLoaded() {
        return typeof RmPaymentEngine !== 'undefined';
    },
    
    // Load Remita SDK dynamically
    async loadSDK() {
        if (this.isSDKLoaded()) {
            console.log('[Remita] SDK already loaded');
            return true;
        }
        
        return new Promise((resolve, reject) => {
            console.log('[Remita] Loading SDK...');
            
            const script = document.createElement('script');
            script.src = 'https://remitademo.net/payment/v1/remita-pay-inline.bundle.js';
            // For production: 'https://login.remita.net/payment/v1/remita-pay-inline.bundle.js'
            
            script.onload = () => {
                console.log('[Remita] SDK loaded successfully');
                resolve(true);
            };
            
            script.onerror = () => {
                console.error('[Remita] Failed to load SDK');
                reject(new Error('Failed to load Remita SDK'));
            };
            
            document.head.appendChild(script);
        });
    },
    
    // Initialize payment
    async initializePayment(paymentData) {
        try {
            console.log('[Remita] Initializing payment:', paymentData);
            
            // Ensure SDK is loaded
            await this.loadSDK();
            
            // Generate RRR from backend
            const rrrResponse = await this.generateRRR(paymentData);
            
            if (!rrrResponse.success) {
                throw new Error(rrrResponse.message || 'Failed to generate RRR');
            }
            
            const { rrr, orderId } = rrrResponse.data;
            
            console.log('[Remita] RRR generated:', rrr);
            
            // Show Remita payment modal
            return await this.showPaymentModal(rrr, orderId, paymentData);
            
        } catch (error) {
            console.error('[Remita] Initialize error:', error);
            throw error;
        }
    },
    
    // Generate RRR (Remita Retrieval Reference) from backend
    async generateRRR(paymentData) {
        try {
            const payload = {
                amount: paymentData.amount,
                payerName: paymentData.payerName,
                payerEmail: paymentData.payerEmail,
                payerPhone: paymentData.payerPhone,
                description: paymentData.description || 'Wallet Funding',
                serviceType: paymentData.serviceType || 'wallet_funding',
                metadata: paymentData.metadata || {}
            };
            
            const response = await API.post(API_CONFIG.ENDPOINTS.PAYMENT_INITIATE, payload);
            
            console.log('[Remita] RRR response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Failed to generate RRR');
            
        } catch (error) {
            console.error('[Remita] Generate RRR error:', error);
            return {
                success: false,
                message: error.message || 'Failed to generate payment reference'
            };
        }
    },
    
    // Show Remita payment modal
    showPaymentModal(rrr, orderId, paymentData) {
        return new Promise((resolve, reject) => {
            if (!this.isSDKLoaded()) {
                reject(new Error('Remita SDK not loaded'));
                return;
            }
            
            const paymentEngine = RmPaymentEngine.init({
                key: API_CONFIG.REMITA.PUBLIC_KEY,
                processRrr: true,
                transactionId: orderId,
                extendedData: {
                    customFields: [
                        {
                            name: "rrr",
                            value: rrr
                        }
                    ]
                },
                onSuccess: (response) => {
                    console.log('[Remita] Payment successful:', response);
                    this.verifyPayment(rrr, orderId).then(resolve).catch(reject);
                },
                onError: (response) => {
                    console.error('[Remita] Payment error:', response);
                    reject(new Error(response.message || 'Payment failed'));
                },
                onClose: () => {
                    console.log('[Remita] Payment modal closed');
                    reject(new Error('Payment cancelled by user'));
                }
            });
            
            paymentEngine.showPaymentWidget();
        });
    },
    
    // Verify payment on backend
    async verifyPayment(rrr, orderId) {
        try {
            console.log('[Remita] Verifying payment:', rrr);
            
            const response = await API.post(API_CONFIG.ENDPOINTS.PAYMENT_VERIFY, {
                rrr: rrr,
                orderId: orderId
            });
            
            console.log('[Remita] Verification response:', response);
            
            if (response.success || response.status === 'success') {
                return {
                    success: true,
                    message: response.message || 'Payment verified successfully',
                    data: response.data
                };
            }
            
            throw new Error(response.message || 'Payment verification failed');
            
        } catch (error) {
            console.error('[Remita] Verify error:', error);
            return {
                success: false,
                message: error.message || 'Payment verification failed'
            };
        }
    },
    
    // Wallet funding with Remita
    async fundWallet(amount) {
        try {
            const agentData = API.getAgentData();
            
            if (!agentData) {
                throw new Error('Agent data not found. Please login again.');
            }
            
            const paymentData = {
                amount: parseFloat(amount),
                payerName: `${agentData.firstName || ''} ${agentData.lastName || ''}`.trim(),
                payerEmail: agentData.email,
                payerPhone: agentData.phoneNumber || agentData.phone,
                description: `Wallet Funding - ₦${amount}`,
                serviceType: 'wallet_funding',
                metadata: {
                    agentId: agentData._id || agentData.id,
                    purpose: 'wallet_funding'
                }
            };
            
            const result = await this.initializePayment(paymentData);
            
            if (result.success) {
                // Refresh wallet balance
                await updateWalletBalance();
            }
            
            return result;
            
        } catch (error) {
            console.error('[Remita] Fund wallet error:', error);
            return {
                success: false,
                message: error.message || 'Wallet funding failed'
            };
        }
    },
    
    // Payment for services (alternative to wallet)
    async payForService(serviceData) {
        try {
            const agentData = API.getAgentData();
            
            if (!agentData) {
                throw new Error('Agent data not found. Please login again.');
            }
            
            const paymentData = {
                amount: parseFloat(serviceData.amount),
                payerName: `${agentData.firstName || ''} ${agentData.lastName || ''}`.trim(),
                payerEmail: agentData.email,
                payerPhone: agentData.phoneNumber || agentData.phone,
                description: serviceData.description || `${serviceData.serviceType} Purchase`,
                serviceType: serviceData.serviceType,
                metadata: {
                    agentId: agentData._id || agentData.id,
                    serviceType: serviceData.serviceType,
                    serviceDetails: serviceData.details || {}
                }
            };
            
            return await this.initializePayment(paymentData);
            
        } catch (error) {
            console.error('[Remita] Service payment error:', error);
            return {
                success: false,
                message: error.message || 'Service payment failed'
            };
        }
    }
};

// Wallet Payment (existing wallet balance)
const WalletPayment = {
    
    // Check wallet balance
    async checkBalance() {
        try {
            const result = await WalletAPI.getBalance();
            
            if (result.success && result.data) {
                return {
                    success: true,
                    balance: result.data.balance || result.data.availableBalance || 0
                };
            }
            
            return {
                success: false,
                message: 'Failed to fetch wallet balance'
            };
            
        } catch (error) {
            console.error('[Wallet] Check balance error:', error);
            return {
                success: false,
                message: error.message || 'Failed to check balance'
            };
        }
    },
    
    // Pay from wallet
    async pay(amount) {
        try {
            // Check balance first
            const balanceCheck = await this.checkBalance();
            
            if (!balanceCheck.success) {
                return {
                    success: false,
                    message: balanceCheck.message
                };
            }
            
            if (balanceCheck.balance < amount) {
                return {
                    success: false,
                    message: `Insufficient balance. You have ₦${balanceCheck.balance.toFixed(2)} but need ₦${amount.toFixed(2)}`,
                    insufficientFunds: true
                };
            }
            
            return {
                success: true,
                message: 'Payment from wallet approved',
                balance: balanceCheck.balance
            };
            
        } catch (error) {
            console.error('[Wallet] Pay error:', error);
            return {
                success: false,
                message: error.message || 'Wallet payment failed'
            };
        }
    }
};

// Payment Gateway Selector
const PaymentGateway = {
    
    // Show payment options modal
    async selectPaymentMethod(amount, onSelect) {
        return new Promise((resolve, reject) => {
            // Check wallet balance
            WalletPayment.checkBalance().then(balanceResult => {
                const hasBalance = balanceResult.success && balanceResult.balance >= amount;
                
                // Create modal HTML
                const modalHTML = `
                    <div id="payment-method-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-bold text-slate-900">Select Payment Method</h3>
                                <button onclick="closePaymentModal()" class="text-slate-400 hover:text-slate-600">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            
                            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p class="text-sm text-slate-600 mb-1">Amount to pay</p>
                                <p class="text-2xl font-bold text-slate-900">${UI.formatCurrency(amount)}</p>
                            </div>
                            
                            <div class="space-y-3">
                                <button onclick="selectWalletPayment()" class="w-full p-4 border-2 ${hasBalance ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'} rounded-xl text-left hover:shadow-md transition-all ${!hasBalance ? 'opacity-50' : ''}">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <i data-lucide="wallet" class="w-6 h-6 text-green-600"></i>
                                            </div>
                                            <div>
                                                <p class="font-semibold text-slate-900">Wallet Balance</p>
                                                <p class="text-sm text-slate-500">${hasBalance ? `Available: ${UI.formatCurrency(balanceResult.balance)}` : 'Insufficient funds'}</p>
                                            </div>
                                        </div>
                                        ${hasBalance ? '<i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>' : ''}
                                    </div>
                                </button>
                                
                                <button onclick="selectRemitaPayment()" class="w-full p-4 border-2 border-slate-200 rounded-xl text-left hover:border-blue-500 hover:shadow-md transition-all">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i data-lucide="credit-card" class="w-6 h-6 text-blue-600"></i>
                                        </div>
                                        <div>
                                            <p class="font-semibold text-slate-900">Remita Payment</p>
                                            <p class="text-sm text-slate-500">Pay with Card, Bank, USSD</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add to DOM
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHTML;
                document.body.appendChild(modalContainer);
                
                // Initialize icons
                lucide.createIcons();
                
                // Setup handlers
                window.closePaymentModal = () => {
                    modalContainer.remove();
                    reject(new Error('Payment cancelled'));
                };
                
                window.selectWalletPayment = () => {
                    if (!hasBalance) {
                        UI.showToast('Insufficient wallet balance', 'error');
                        return;
                    }
                    modalContainer.remove();
                    resolve('wallet');
                };
                
                window.selectRemitaPayment = () => {
                    modalContainer.remove();
                    resolve('remita');
                };
            });
        });
    },
    
    // Process payment with selected gateway
    async processPayment(method, amount, serviceData = {}) {
        try {
            if (method === 'wallet') {
                return await WalletPayment.pay(amount);
            } else if (method === 'remita') {
                return await RemitaPayment.payForService({
                    amount: amount,
                    ...serviceData
                });
            } else {
                throw new Error('Invalid payment method');
            }
        } catch (error) {
            console.error('[PaymentGateway] Process error:', error);
            return {
                success: false,
                message: error.message || 'Payment processing failed'
            };
        }
    }
};
