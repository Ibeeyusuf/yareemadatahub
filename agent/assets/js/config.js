// Guard against duplicate script loading (e.g. browser cache replay or double injection)
if (typeof API_CONFIG === 'undefined') {
    var API_CONFIG = {
        BASE_URL: 'https://vtu-api-d3q2.onrender.com/api/v1',
        
        ENDPOINTS: {
            AGENT_LOGIN: '/agent/login',
            AGENT_REGISTER: '/agent/register',
            
            AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
            AUTH_VERIFY_OTP: '/auth/verify-otp',
            AUTH_RESET_PASSWORD: '/auth/reset-password',
            AUTH_CHANGE_PASSWORD: '/auth/change-password',
            AUTH_PROFILE: '/auth/profile',
            
            AGENT_DASHBOARD: '/agent/dashboard',
            AGENT_PROFILE: '/agent/profile',
            AGENT_SERVICES: '/agent/services',
            AGENT_VERIFY_CUSTOMER: '/agent/verify-customer',
            
            AGENT_PURCHASE_AIRTIME: '/agent/purchase/airtime',
            AGENT_PURCHASE_DATA: '/agent/purchase/data',
            AGENT_PAY_BILL: '/agent/pay-bill',
            
            WALLET_BALANCE: '/wallet/balance',
            WALLET_TRANSACTIONS: '/wallet/transactions',
            WALLET_FUND: '/wallet/fund',
            WALLET_WITHDRAW: '/wallet/withdraw',
            WALLET_TRANSFER: '/wallet/transfer',
            
            DATA_PLANS: '/telecom/data/plans',
            CABLE_PLANS: '/bills/cable/plans',
            ELECTRICITY_VERIFY: '/bills/electricity/verify',
            CABLE_VERIFY: '/bills/cable/verify',
            
            PAYMENT_INITIATE: '/payment/initiate',
            PAYMENT_VERIFY: '/payment/verify',
            
            TRANSACTION_STATUS: '/transaction/status',
            
            WEBHOOK_REMITA: '/webhook/remita',
            WEBHOOK_PROVIDER: '/webhook/provider'
        },
        
        REMITA: {
            PUBLIC_KEY: 'REMITA_PUBLIC_KEY',
            MERCHANT_ID: 'MERCHANT_ID',
            API_BASE: 'https://remitademo.net/remita',
        },
        
        PAYMENT_GATEWAYS: {
            REMITA: 'remita',
            WALLET: 'wallet'
        },
        
        TIMEOUT: 30000,
        
        STORAGE_KEYS: {
            TOKEN: 'agentToken',
            AGENT_DATA: 'agentData',
            REFRESH_TOKEN: 'agentRefreshToken'
        }
    }; // end API_CONFIG
    } // end if (typeof API_CONFIG === 'undefined')
    
    if (typeof API === 'undefined') {
    var API = {
        getToken() {
            return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        },
        
        setToken(token) {
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, token);
        },
        
        removeToken() {
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            // NOTE: keep agentData so pin status persists across logout/login
            // Only clear sensitive fields
            try {
                const d = JSON.parse(localStorage.getItem(API_CONFIG.STORAGE_KEYS.AGENT_DATA) || '{}');
                const safe = { _id: d._id, id: d.id, pin: d.pin };
                localStorage.setItem(API_CONFIG.STORAGE_KEYS.AGENT_DATA, JSON.stringify(safe));
            } catch(e) {}
        },
        
        getAgentData() {
            try {
                const data = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AGENT_DATA);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AGENT_DATA);
                return null;
            }
        },
        
        setAgentData(data) {
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.AGENT_DATA, JSON.stringify(data));
        },
        
        async request(endpoint, options = {}) {
            const url = `${API_CONFIG.BASE_URL}${endpoint}`;
            const token = this.getToken();
            
            const defaultHeaders = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const config = {
                method: options.method || 'GET',
                headers: { ...defaultHeaders, ...options.headers },
                ...options
            };
            
            if (options.body && config.method !== 'GET') {
                config.body = JSON.stringify(options.body);
            }
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = { message: text };
                    }
                }
                
                if (!response.ok) {
                    const isLoginRequest = endpoint.includes('/login');
                    const errorMessage = data.message || data.error || data.msg || `Error: ${response.status}`;
                    
                    if (response.status === 401) {
                        if (isLoginRequest) {
                            throw new Error(errorMessage);
                        }
                        // Only treat as session expired if it's a REAL token error.
                        // Business-logic 401s (pending approval, wrong PIN, access denied)
                        // must surface as error messages to the UI — NOT log the user out.
                        const _msg = (data.message || data.error || data.msg || '').toLowerCase();
    
                        // Broad list of business-logic keywords — checked FIRST (takes priority)
                        const _isBusinessError = _msg.includes('pin') ||
                                                 _msg.includes('approv') ||   // covers: approved, approval, not approved
                                                 _msg.includes('pending') ||
                                                 _msg.includes('contact admin') ||
                                                 _msg.includes('access') ||
                                                 _msg.includes('permission') ||
                                                 _msg.includes('wrong') ||
                                                 _msg.includes('incorrect') ||
                                                 _msg.includes('insufficient') ||
                                                 _msg.includes('not active') ||
                                                 _msg.includes('suspended') ||
                                                 _msg.includes('disabled') ||
                                                 _msg.includes('account');
    
                        // Token errors — only if no business keyword matched
                        const _isTokenError = !_isBusinessError && (
                            _msg.includes('token') ||
                            _msg.includes('jwt') ||
                            _msg.includes('expired') ||
                            _msg.includes('not authenticated') ||
                            _msg.includes('no token') ||
                            _msg.includes('invalid token') ||
                            _msg === ''
                        );
    
                        if (_isTokenError) {
                            this.removeToken();
                            if (!window.location.pathname.includes('index.html') &&
                                !window.location.pathname.includes('register.html') &&
                                !window.location.pathname.includes('forgot-password.html')) {
                                UI.showToast('Session expired. Please login again.', 'error');
                                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                            }
                            throw new Error('Session expired. Please login again.');
                        }
                        // Business-logic 401 — throw the real message so the UI can display it
                        throw new Error(errorMessage || 'Access denied');
                    }
                    
                    if (response.status === 403) {
                        throw new Error(errorMessage || 'Access denied');
                    }
                    
                    if (response.status === 404) {
                        throw new Error(errorMessage || 'Resource not found');
                    }
                    
                    if (response.status === 500) {
                        throw new Error(errorMessage || 'Server error. Please try again.');
                    }
                    
                    throw new Error(errorMessage);
                }
                
                return data;
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout. Please check your internet connection.');
                }
                
                if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                    throw new Error('Network error. Please check your internet connection.');
                }
                
                throw error;
            }
        },
        
        async get(endpoint) {
            return this.request(endpoint, { method: 'GET' });
        },
        
        async post(endpoint, body) {
            return this.request(endpoint, { method: 'POST', body });
        },
        
        async put(endpoint, body) {
            return this.request(endpoint, { method: 'PUT', body });
        },
        
        async patch(endpoint, body) {
            return this.request(endpoint, { method: 'PATCH', body });
        },
        
        async delete(endpoint) {
            return this.request(endpoint, { method: 'DELETE' });
        }
    }; // end API
    } // end if (typeof API === 'undefined')
    
    if (typeof UI === 'undefined') {
    var UI = {
        showLoading(buttonId, spinnerId) {
            const button = document.getElementById(buttonId);
            const spinner = document.getElementById(spinnerId);
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-75', 'cursor-not-allowed');
            }
            if (spinner) {
                spinner.classList.remove('hidden');
            }
        },
        
        hideLoading(buttonId, spinnerId) {
            const button = document.getElementById(buttonId);
            const spinner = document.getElementById(spinnerId);
            if (button) {
                button.disabled = false;
                button.classList.remove('opacity-75', 'cursor-not-allowed');
            }
            if (spinner) {
                spinner.classList.add('hidden');
            }
        },
        
        showError(elementId, message) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <span class="flex-1">${message}</span>
                    </div>
                `;
                element.style.display = 'block';
                element.classList.add('error-message');
                element.classList.remove('success-message');
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        },
        
        showSuccess(elementId, message) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span class="flex-1">${message}</span>
                    </div>
                `;
                element.style.display = 'block';
                element.classList.add('success-message');
                element.classList.remove('error-message');
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        },
        
        hideMessage(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'none';
                element.innerHTML = '';
            }
        },
        
        formatCurrency(amount) {
            return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
        
        formatNumber(number) {
            return parseFloat(number).toLocaleString('en-NG');
        },
        
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-NG', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        showToast(message, type = 'info', duration = 5000) {
            const existingToasts = document.querySelectorAll('.toast-notification');
            existingToasts.forEach(toast => toast.remove());
            
            const toast = document.createElement('div');
            toast.className = `toast-notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white max-w-md animate-slide-in`;
            
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };
            toast.classList.add(colors[type] || colors.info);
            
            const icons = {
                success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
                error: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
                warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
                info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
            };
            
            toast.innerHTML = `
                <div class="flex items-start gap-3">
                    ${icons[type] || icons.info}
                    <p class="flex-1 text-sm font-medium">${message}</p>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-75 transition-opacity">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }; // end UI
    } // end if (typeof UI === 'undefined')
    
    if (typeof Utils === 'undefined') {
    var Utils = {
        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        isValidPhone(phone) {
            const re = /^0[789][01]\d{8}$/;
            return re.test(phone);
        },
        
        isStrongPassword(password) {
            const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return re.test(password);
        },
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }; // end Utils
    } // end if (typeof Utils === 'undefined')
    
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out;
            }
            .toast-notification {
                transition: opacity 0.3s, transform 0.3s;
            }
        `;
        document.head.appendChild(style);
    }