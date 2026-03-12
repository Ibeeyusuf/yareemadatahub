// NATIVE HTML MODALS - NO EXTERNAL DEPENDENCIES

// Modal HTML Structure
function createModalHTML() {
    if (document.getElementById('modalContainer')) return;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = `
        <div id="customModal" class="custom-modal">
            <div class="modal-overlay" onclick="closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modalTitle">Modal Title</h2>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body" id="modalBody"></div>
                <div class="modal-footer" id="modalFooter"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

// Initialize modals on page load
document.addEventListener('DOMContentLoaded', createModalHTML);

// Show Modal
function showModal(title, bodyHTML, footerHTML = '') {
    createModalHTML();
    const modal = document.getElementById('customModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalFooter').innerHTML = footerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Success Message
function showSuccess(message) {
    showModal('Success!', `
        <div style="text-align: center; padding: 32px;">
            <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <p style="font-size: 16px; color: #0f172a;">${message}</p>
        </div>
    `, `<button onclick="closeModal(); window.location.reload();" class="btn-primary" style="width: 100%;">OK</button>`);
}

// Error Message
function showError(message) {
    showModal('Error', `
        <div style="text-align: center; padding: 32px;">
            <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <p style="font-size: 16px; color: #0f172a;">${message}</p>
        </div>
    `, `<button onclick="closeModal()" class="btn-primary" style="width: 100%;">Close</button>`);
}

// Loading State
function showLoading(message = 'Processing...') {
    showModal('Please Wait', `
        <div style="text-align: center; padding: 32px;">
            <div class="spinner"></div>
            <p style="font-size: 16px; color: #64748b; margin-top: 16px;">${message}</p>
        </div>
    `, '');
}

// ==================== MAIN MODAL ROUTER ====================
function openModal(type) {
    const modalMap = {
        'data': showDataModal,
        'airtime': showAirtimeModal,
        'electricity': showElectricityModal,
        'tv': showTVModal,
        'education': showEducationModal,
        'sms': showSMSModal,
        'swap': showSwapModal,
        'rechargepin': showRechargePINModal,
        'remita': showRemitaModal,
        'alpha': showAlphaModal,
        'fund': showFundModal,
        'transfer': showTransferModal,
        'withdraw': showWithdrawModal,
        'personaldetails': showPersonalDetailsModal,
        'editprofile': showEditProfileModal,
        'security': showSecurityModal,
        'notifications': showNotificationsModal,
        'devices': showDevicesModal,
        'referral': showReferralModal,
        'help': showHelpModal
    };

    if (modalMap[type]) {
        modalMap[type]();
    } else {
        showError('Service not available. Please try again later.');
    }
}

// ==================== DATA MODAL ====================
let selectedNetwork = 'mtn';
let currentDataPlans = [];

async function showDataModal() {
    selectedNetwork = 'mtn';
    currentDataPlans = [];
    
    const bodyHTML = `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn active" data-network="mtn" onclick="selectDataNetwork('mtn')" style="background: #FFCC00; color: #000;">MTN</button>
                <button type="button" class="network-btn" data-network="airtel" onclick="selectDataNetwork('airtel')" style="background: #FF0000; color: #fff;">Airtel</button>
                <button type="button" class="network-btn" data-network="glo" onclick="selectDataNetwork('glo')" style="background: #00C300; color: #fff;">Glo</button>
                <button type="button" class="network-btn" data-network="9mobile" onclick="selectDataNetwork('9mobile')" style="background: #006400; color: #fff;">9mobile</button>
            </div>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="dataPhone" placeholder="08012345678" maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <select id="dataPlan" class="form-input">
                <option value="">Loading plans...</option>
            </select>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="dataPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitDataPurchase()" class="btn-primary">Purchase Data</button>
    `;
    
    showModal('Buy Data', bodyHTML, footerHTML);
    
    // Load initial plans for MTN
    await loadDataPlans('mtn');
}

function selectDataNetwork(network) {
    selectedNetwork = network;
    // Update active state
    document.querySelectorAll('.network-btn').forEach(btn => {
        btn.classList.remove('active');
        // Reset styles
        if (btn.dataset.network === 'mtn') btn.style.cssText = 'background: #FFCC00; color: #000;';
        if (btn.dataset.network === 'airtel') btn.style.cssText = 'background: #FF0000; color: #fff;';
        if (btn.dataset.network === 'glo') btn.style.cssText = 'background: #00C300; color: #fff;';
        if (btn.dataset.network === '9mobile') btn.style.cssText = 'background: #006400; color: #fff;';
    });
    
    // Add active class to selected
    const selectedBtn = document.querySelector(`[data-network="${network}"]`);
    selectedBtn.classList.add('active');
    // Highlight active button
    selectedBtn.style.cssText += '; border: 3px solid white; box-shadow: 0 0 0 2px #1e3d5c;';
    
    // Load plans for selected network
    loadDataPlans(network);
}

// Maps UI network name → nellobytes MOBILE_NETWORK key
const NELLO_NETWORK_KEY = {
    'mtn':     'MTN',
    'glo':     'Glo',
    '9mobile': 'm_9mobile',
    'airtel':  'Airtel'
};

async function loadDataPlans(network) {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;

    planSelect.innerHTML = '<option value="">Loading plans...</option>';

    try {
        const response = await api.getDataPlans(network);
        console.log('[Data Plans] raw response:', response);

        const nelloKey = NELLO_NETWORK_KEY[network.toLowerCase()] || network;
        let products = [];

        // Nellobytes structure: response.data.MOBILE_NETWORK.MTN[0].PRODUCT[]
        if (response.data?.MOBILE_NETWORK) {
            const networkData = response.data.MOBILE_NETWORK[nelloKey];
            if (Array.isArray(networkData) && networkData[0]?.PRODUCT) {
                products = networkData[0].PRODUCT;
            }
        }

        if (products.length > 0) {
            currentDataPlans = products;
        } else {
            currentDataPlans = [];
        }

        updateDataPlanDropdown();
    } catch (error) {
        console.error('[Data Plans] error:', error);
        if (planSelect) {
            planSelect.innerHTML = '<option value="">Failed to load plans. Please try again.</option>';
        }
    }
}

function updateDataPlanDropdown() {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;

    if (currentDataPlans.length > 0) {
        planSelect.innerHTML = '<option value="">Choose a plan</option>' +
            currentDataPlans.map((plan, index) => {
                const name   = plan.PRODUCT_NAME || plan.planName || plan.name || 'Data Plan';
                const amount = plan.PRODUCT_AMOUNT || plan.sellingPrice || plan.price || 0;
                const label  = `${name} — ₦${Math.round(Number(amount)).toLocaleString()}`;
                return `<option value="${index}">${label}</option>`;
            }).join('');
    } else {
        planSelect.innerHTML = '<option value="">No plans available for this network</option>';
    }
}

async function submitDataPurchase() {
    const phone = document.getElementById('dataPhone').value.trim();
    const planIndex = document.getElementById('dataPlan').value;
    const pin = document.getElementById('dataPin').value.trim();

    if (!phone || !/^\d{11}$/.test(phone)) {
        showError('Please enter a valid 11-digit phone number'); return;
    }
    if (planIndex === '' || planIndex === null || planIndex === undefined) {
        showError('Please select a data plan'); return;
    }
    if (!currentDataPlans || currentDataPlans.length === 0) {
        showError('No plans loaded. Please close and try again.'); return;
    }
    const selectedPlan = currentDataPlans[planIndex];
    if (!selectedPlan) {
        showError('Invalid plan selected. Please try again.'); return;
    }
    console.log('[Data Purchase] selected plan object:', selectedPlan);

    // Nellobytes PRODUCT_ID e.g. "1000.0" → send "1000" as dataPlan
    const rawId = selectedPlan.PRODUCT_ID || selectedPlan.planId || selectedPlan.planCode || selectedPlan._id || selectedPlan.id;
    console.log('[Data Purchase] raw PRODUCT_ID:', rawId);
    if (!rawId) {
        showError('Could not identify selected plan. Please try again.'); return;
    }
    // Strip trailing ".0" for whole-number IDs; keep decimals like "1000.01" intact
    const planId = String(rawId).replace(/\.0$/, '');
    if (!pin || !/^\d{4}$/.test(pin)) {
        showError('Please enter your 4-digit transaction PIN'); return;
    }

    try {
        showLoading('Purchasing data...');
        const response = await api.purchaseData(phone, selectedNetwork, planId, pin);
        closeModal();
        setTimeout(() => {
            const planName = selectedPlan.PRODUCT_NAME || selectedPlan.planName || 'Data';
            showSuccess(planName + ' purchased successfully for ' + phone + '! ✅');
        }, 300);
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('pin')) showError('Invalid transaction PIN. Please try again.');
            else if (msg.includes('balance') || msg.includes('insufficient')) showError('Insufficient wallet balance. Please fund your wallet.');
            else showError(error.message || 'Purchase failed. Please try again.');
        }, 300);
    }
}

// ==================== AIRTIME MODAL ====================
function showAirtimeModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn-air active" data-network="mtn" onclick="selectAirtimeNetwork('mtn')" style="background: #FFCC00; color: #000;">MTN</button>
                <button type="button" class="network-btn-air" data-network="airtel" onclick="selectAirtimeNetwork('airtel')" style="background: #FF0000; color: #fff;">Airtel</button>
                <button type="button" class="network-btn-air" data-network="glo" onclick="selectAirtimeNetwork('glo')" style="background: #00C300; color: #fff;">Glo</button>
                <button type="button" class="network-btn-air" data-network="9mobile" onclick="selectAirtimeNetwork('9mobile')" style="background: #006400; color: #fff;">9mobile</button>
            </div>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="airtimePhone" placeholder="08012345678" maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" id="airtimeAmount" placeholder="Enter amount (min ₦50)" min="50" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="airtimePin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitAirtimePurchase()" class="btn-primary">Purchase Airtime</button>
    `;
    
    showModal('Buy Airtime', bodyHTML, footerHTML);
    window.selectedAirtimeNetwork = 'mtn';
}

function selectAirtimeNetwork(network) {
    window.selectedAirtimeNetwork = network;
    document.querySelectorAll('.network-btn-air').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.network-btn-air[data-network="${network}"]`).classList.add('active');
}

async function submitAirtimePurchase() {
    const phone = document.getElementById('airtimePhone').value;
    const amount = parseInt(document.getElementById('airtimeAmount').value);
    const pin = document.getElementById('airtimePin').value;
    
    // PIN Validation
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit transaction PIN');
        return;
    }
    if (!/^\d+$/.test(pin)) {
        showError('Transaction PIN must contain only numbers');
        return;
    }
    
    if (!phone || phone.length !== 11) {
        showError('Please enter a valid 11-digit phone number');
        return;
    }
    if (!amount || amount < 50) {
        showError('Amount must be at least ₦50');
        return;
    }
    
    try {
        showLoading('Purchasing airtime...');
        const response = await api.purchaseAirtime(phone, window.selectedAirtimeNetwork, amount, pin);
        
        closeModal();
        setTimeout(() => {
            showSuccess(`
                <div style="text-align: center;">
                    <p style="font-size: 16px; margin-bottom: 8px;">Airtime Purchase Successful! 📱</p>
                    <p style="font-size: 14px; color: #64748b;">₦${amount} airtime sent to ${phone}</p>
                </div>
            `);
        }, 300);
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const errorMsg = error.message || '';
            
            if (errorMsg.toLowerCase().includes('pin')) {
                showError('Invalid transaction PIN. Please try again.');
            } else if (errorMsg.toLowerCase().includes('balance') || errorMsg.toLowerCase().includes('insufficient')) {
                showError('Insufficient wallet balance. Please fund your wallet.');
            } else {
                showError(errorMsg || 'Airtime purchase failed. Please try again.');
            }
        }, 300);
    }
}

// ==================== ELECTRICITY MODAL ====================
let _elecVerified = null; // stores verified customer info

function showElectricityModal() {
    _elecVerified = null;

    const bodyHTML = `
        <div id="elecStep1">
            <div class="form-group">
                <label>Select Disco</label>
                <select id="electricityDisco" class="form-input">
                    <option value="aedc">AEDC - Abuja</option>
                    <option value="ekedc">EKEDC - Eko</option>
                    <option value="ikedc">IKEDC - Ikeja</option>
                    <option value="phed">PHED - Port Harcourt</option>
                    <option value="ibedc">IBEDC - Ibadan</option>
                    <option value="kaedco">KAEDCO - Kaduna</option>
                    <option value="eedc">EEDC - Enugu</option>
                    <option value="bedc">BEDC - Benin</option>
                    <option value="yedc">YEDC - Yola</option>
                    <option value="jedc">JEDC - Jos</option>
                    <option value="kedco">KEDCO - Kano</option>
                </select>
            </div>
            <div class="form-group">
                <label>Meter Type</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <button type="button" id="prepaidBtn" onclick="selectMeterType('prepaid')"
                        style="padding:12px;border:2px solid #1e3d5c;border-radius:8px;background:#1e3d5c;color:white;font-weight:600;cursor:pointer;">
                        Prepaid
                    </button>
                    <button type="button" id="postpaidBtn" onclick="selectMeterType('postpaid')"
                        style="padding:12px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:600;cursor:pointer;">
                        Postpaid
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Meter Number</label>
                <input type="text" id="meterNumber" placeholder="Enter meter number" class="form-input">
            </div>
            <div id="elecVerifyResult" style="display:none;"></div>
        </div>

        <div id="elecStep2" style="display:none;">
            <div id="elecCustomerInfo" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:16px;"></div>
            <div class="form-group">
                <label>Amount (₦)</label>
                <input type="number" id="electricityAmount" placeholder="Min ₦500" min="500" class="form-input">
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="electricityPhone" placeholder="08012345678" maxlength="11" class="form-input">
            </div>
            <div class="form-group">
                <label>Transaction PIN</label>
                <input type="password" id="electricityPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
            </div>
        </div>
    `;

    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="elecPrimaryBtn" onclick="handleElectricityStep()" class="btn-primary">Verify Meter</button>
    `;

    showModal('Pay Electricity', bodyHTML, footerHTML);
    window._elecMeterType = 'prepaid';
}

function selectMeterType(type) {
    window._elecMeterType = type;
    const prepaidBtn  = document.getElementById('prepaidBtn');
    const postpaidBtn = document.getElementById('postpaidBtn');
    const activeStyle   = 'padding:12px;border:2px solid #1e3d5c;border-radius:8px;background:#1e3d5c;color:white;font-weight:600;cursor:pointer;';
    const inactiveStyle = 'padding:12px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:600;cursor:pointer;';
    if (type === 'prepaid')  { prepaidBtn.style.cssText = activeStyle;  postpaidBtn.style.cssText = inactiveStyle; }
    else                     { postpaidBtn.style.cssText = activeStyle; prepaidBtn.style.cssText  = inactiveStyle; }
}

async function handleElectricityStep() {
    if (!_elecVerified) {
        await verifyMeterNumber();
    } else {
        await submitElectricityPayment();
    }
}

async function verifyMeterNumber() {
    const disco      = document.getElementById('electricityDisco').value;
    const meter      = document.getElementById('meterNumber').value.trim();
    const meterType  = window._elecMeterType || 'prepaid';

    if (!meter) { showError('Please enter meter number'); return; }

    const btn = document.getElementById('elecPrimaryBtn');
    btn.disabled = true; btn.textContent = 'Verifying...';

    try {
        const response = await api.verifyElectricityCustomer(meter, disco, meterType);
        console.log('[Electricity] verify response:', response);

        const customer = response.data?.customer || response.data || response;
        const name     = customer.customerName || customer.name || customer.accountName || 'Customer Verified';
        const address  = customer.customerAddress || customer.address || '';
        const acctNum  = customer.accountNumber || customer.meterNumber || meter;

        _elecVerified = { meter, disco, meterType, customerName: name };

        // Show customer info
        document.getElementById('elecCustomerInfo').innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                    <p style="font-weight:700;color:#15803d;font-size:14px;">${name}</p>
                    ${address ? `<p style="color:#64748b;font-size:12px;">${address}</p>` : ''}
                    <p style="color:#64748b;font-size:12px;">Meter: ${acctNum} · ${meterType.charAt(0).toUpperCase()+meterType.slice(1)}</p>
                </div>
            </div>
        `;

        // Switch to step 2
        document.getElementById('elecStep1').style.display = 'none';
        document.getElementById('elecStep2').style.display = 'block';
        btn.disabled = false; btn.textContent = 'Pay Now';
        document.getElementById('electricityAmount').focus();

    } catch (error) {
        btn.disabled = false; btn.textContent = 'Verify Meter';
        const result = document.getElementById('elecVerifyResult');
        result.style.display = 'block';
        result.innerHTML = `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px;color:#dc2626;font-size:13px;">
            ❌ ${error.message || 'Could not verify meter. Please check the number and try again.'}
        </div>`;
    }
}

async function submitElectricityPayment() {
    const amount = parseInt(document.getElementById('electricityAmount').value);
    const phone  = document.getElementById('electricityPhone').value.trim();
    const pin    = document.getElementById('electricityPin').value.trim();

    if (!amount || amount < 500) { showError('Amount must be at least ₦500'); return; }
    if (!phone || phone.length !== 11) { showError('Please enter a valid 11-digit phone number'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showError('Please enter your 4-digit transaction PIN'); return; }

    try {
        showLoading('Processing payment...');
        const response = await api.purchaseElectricity(
            _elecVerified.meter, _elecVerified.disco, amount, phone, pin, _elecVerified.meterType
        );
        const token = response.data?.token || response.data?.purchasedToken || '';
        closeModal();
        setTimeout(() => {
            showSuccess(`
                <div style="text-align:center;">
                    <p style="font-size:16px;margin-bottom:6px;">Payment Successful! 💡</p>
                    <p style="font-size:14px;color:#64748b;">₦${amount.toLocaleString()} credited to meter ${_elecVerified.meter}</p>
                    ${token ? `<div style="margin-top:12px;padding:10px;background:#f0fdf4;border-radius:8px;">
                        <p style="font-size:11px;color:#64748b;margin-bottom:4px;">TOKEN</p>
                        <p style="font-size:18px;font-weight:700;color:#15803d;letter-spacing:2px;">${token}</p>
                    </div>` : ''}
                </div>
            `);
            _elecVerified = null;
        }, 300);
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('pin'))     showError('Invalid transaction PIN. Please try again.');
            else if (msg.includes('balance')) showError('Insufficient wallet balance.');
            else showError(error.message || 'Payment failed. Please try again.');
        }, 300);
    }
}

// ==================== TV MODAL ====================
let tvPlans = [];

async function showTVModal() {
    tvPlans = [];

    const bodyHTML = `
        <div class="form-group">
            <label>Select Provider</label>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px;">
                <button type="button" class="tv-provider-btn" data-provider="dstv" onclick="selectTVProvider('dstv')"
                    style="padding:10px 6px;border:2px solid #1e3d5c;border-radius:8px;background:#1e3d5c;color:white;font-weight:700;font-size:13px;cursor:pointer;">
                    DSTV
                </button>
                <button type="button" class="tv-provider-btn" data-provider="gotv" onclick="selectTVProvider('gotv')"
                    style="padding:10px 6px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:700;font-size:13px;cursor:pointer;">
                    GOTV
                </button>
                <button type="button" class="tv-provider-btn" data-provider="startimes" onclick="selectTVProvider('startimes')"
                    style="padding:10px 6px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:700;font-size:13px;cursor:pointer;">
                    Startimes
                </button>
            </div>
        </div>
        <div class="form-group">
            <label>Smart Card / IUC Number</label>
            <input type="text" id="smartCard" placeholder="Enter smart card number" class="form-input">
        </div>
        <div class="form-group">
            <label>Select Package</label>
            <select id="tvPlan" class="form-input">
                <option value="">Loading packages...</option>
            </select>
            <div id="tvPlanPrice" style="display:none;margin-top:6px;padding:8px 12px;background:#f0fdf4;border-radius:6px;color:#15803d;font-size:13px;font-weight:600;"></div>
        </div>
        <div class="form-group">
            <label>Duration (Months)</label>
            <select id="tvMonths" class="form-input">
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
            </select>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="tvPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;

    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitTVSubscription()" class="btn-primary">Subscribe</button>
    `;

    showModal('Cable TV Subscription', bodyHTML, footerHTML);
    window._tvProvider = 'dstv';
    await loadTVPlans('dstv');
}

function selectTVProvider(provider) {
    window._tvProvider = provider;
    document.querySelectorAll('.tv-provider-btn').forEach(btn => {
        const isActive = btn.dataset.provider === provider;
        btn.style.cssText = isActive
            ? 'padding:10px 6px;border:2px solid #1e3d5c;border-radius:8px;background:#1e3d5c;color:white;font-weight:700;font-size:13px;cursor:pointer;'
            : 'padding:10px 6px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:700;font-size:13px;cursor:pointer;';
    });
    loadTVPlans(provider);
}

async function loadTVPlans(provider) {
    const planSelect = document.getElementById('tvPlan');
    const priceTag   = document.getElementById('tvPlanPrice');
    if (!planSelect) return;

    planSelect.innerHTML = '<option value="">Loading packages...</option>';
    if (priceTag) priceTag.style.display = 'none';

    try {
        const response = await api.getCablePlans(provider);
        console.log('[Cable TV] plans response:', response);

        let plans = [];

        // Check if the response has the expected structure
        if (response.data?.TV_ID) {
            // Map provider names to the keys in the response
            const providerMap = {
                'dstv': 'DStv',
                'gotv': 'GOtv',
                'startimes': 'Startimes',
                'showmax': 'Showmax'
            };
            
            const responseProviderKey = providerMap[provider.toLowerCase()];
            
            if (responseProviderKey && response.data.TV_ID[responseProviderKey]) {
                const providerData = response.data.TV_ID[responseProviderKey];
                if (Array.isArray(providerData) && providerData[0]?.PRODUCT) {
                    plans = providerData[0].PRODUCT;
                }
            }
        }
        
        // Fallback: try alternative paths if the above didn't work
        if (!plans.length) {
            // Try other possible paths
            const cableData = response.data?.CABLE_TV || response.data?.cable || response.data?.plans;
            if (cableData) {
                const providerKey = provider.toUpperCase();
                const providerData = cableData[providerKey] || cableData[provider] || cableData[provider.toLowerCase()];
                if (Array.isArray(providerData) && providerData[0]?.PRODUCT) {
                    plans = providerData[0].PRODUCT;
                } else if (Array.isArray(providerData)) {
                    plans = providerData;
                }
            }
        }

        // Final fallback: flat array at response.data
        if (!plans.length && Array.isArray(response.data)) {
            plans = response.data;
        }

        tvPlans = plans;
        console.log('[Cable TV] extracted plans:', plans);

        if (plans.length > 0) {
            planSelect.innerHTML = '<option value="">Choose package</option>' +
                plans.map((plan, idx) => {
                    // Note: In your sample, fields are PACKAGE_NAME, PACKAGE_AMOUNT, PACKAGE_ID
                    // (not PRODUCT_NAME, PRODUCT_AMOUNT, PRODUCT_CODE)
                    const name   = plan.PACKAGE_NAME || plan.PRODUCT_NAME || plan.planName || plan.name || 'Package';
                    const amount = plan.PACKAGE_AMOUNT || plan.PRODUCT_AMOUNT || plan.sellingPrice || plan.price || plan.amount || 0;
                    const planId = plan.PACKAGE_ID || plan.PRODUCT_CODE || plan.planCode || plan._id || plan.id || plan.planId;
                    
                    return `<option value="${idx}" data-amount="${Math.round(Number(amount))}" data-plan-id="${planId}">${name} — ₦${Math.round(Number(amount)).toLocaleString()}</option>`;
                }).join('');

            // Show price on select
            planSelect.onchange = () => {
                const opt = planSelect.options[planSelect.selectedIndex];
                const amt = opt?.dataset?.amount;
                if (amt && priceTag) {
                    priceTag.style.display = 'block';
                    const months = parseInt(document.getElementById('tvMonths')?.value || 1);
                    priceTag.textContent = `Total: ₦${(parseInt(amt) * months).toLocaleString()}`;
                } else if (priceTag) {
                    priceTag.style.display = 'none';
                }
            };
        } else {
            planSelect.innerHTML = '<option value="">No packages available for this provider</option>';
        }
    } catch (error) {
        console.error('[Cable TV] error:', error);
        planSelect.innerHTML = '<option value="">Failed to load packages. Please try again.</option>';
    }
}

async function submitTVSubscription() {
    const provider  = window._tvProvider || 'dstv';
    const smartCard = document.getElementById('smartCard').value.trim();
    const planIdx   = document.getElementById('tvPlan').value;
    const months    = parseInt(document.getElementById('tvMonths').value) || 1;
    const pin       = document.getElementById('tvPin').value.trim();

    if (!smartCard)                        { showError('Please enter smart card / IUC number'); return; }
    if (planIdx === '' || planIdx === null) { showError('Please select a package'); return; }
    if (!tvPlans.length)                   { showError('No packages loaded. Please try again.'); return; }
    if (!pin || !/^\d{4}$/.test(pin))      { showError('Please enter your 4-digit transaction PIN'); return; }

    const plan = tvPlans[planIdx];
    if (!plan) { showError('Invalid package selected'); return; }

    // Use the correct field name from your sample response
    const planId = plan.PACKAGE_ID || plan.PRODUCT_CODE || plan.planCode || plan._id || plan.id || plan.planId;
    if (!planId) { 
        console.error('Plan object:', plan);
        showError('Could not identify selected package. Please try again.'); 
        return; 
    }

    try {
        showLoading('Processing subscription...');
        const response = await api.purchaseCableTV(smartCard, provider, planId, months, pin);

        closeModal();
        setTimeout(() => {
            const planName = plan.PACKAGE_NAME || plan.PRODUCT_NAME || plan.planName || 'Package';
            showSuccess(`
                <div style="text-align:center;">
                    <p style="font-size:16px;margin-bottom:6px;">Subscription Successful! 📺</p>
                    <p style="font-size:14px;color:#64748b;">${planName}</p>
                    <p style="font-size:14px;color:#64748b;">${provider.toUpperCase()} · ${smartCard}</p>
                </div>
            `);
        }, 300);
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('pin'))          showError('Invalid transaction PIN. Please try again.');
            else if (msg.includes('smart') || msg.includes('card') || msg.includes('iuc'))
                                              showError('Invalid smart card number. Please verify.');
            else if (msg.includes('balance')) showError('Insufficient wallet balance.');
            else                              showError(error.message || 'Subscription failed. Please try again.');
        }, 300);
    }
}

// ==================== EDUCATION MODAL ====================
function showEducationModal() {
    const bodyHTML = `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin-bottom:16px;">
            <p style="color:#1d4ed8;font-size:13px;margin:0;">📚 Scratch cards will be sent to your registered email address after purchase.</p>
        </div>
        <div class="form-group">
            <label>Exam Type</label>
            <select id="examType" class="form-input" onchange="updateEduPrice()">
                <option value="waecdirect">WAEC Result Checker</option>
                <option value="neco">NECO Result Checker</option>
                <option value="jamb">JAMB E-PIN</option>
                <option value="nabteb">NABTEB Result Checker</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <select id="eduQuantity" class="form-input" onchange="updateEduPrice()">
                <option value="1">1 PIN</option>
                <option value="2">2 PINs</option>
                <option value="3">3 PINs</option>
                <option value="5">5 PINs</option>
                <option value="10">10 PINs</option>
            </select>
        </div>
        <div id="eduPriceTag" style="display:none;padding:10px 14px;background:#f0fdf4;border-radius:8px;margin-bottom:4px;color:#15803d;font-size:13px;font-weight:600;"></div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="eduPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;

    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitEducationPurchase()" class="btn-primary">Purchase</button>
    `;

    showModal('Education PIN', bodyHTML, footerHTML);
}

// Exam prices (approximate — backend confirms actual price)
const EDU_PRICES = {
    waecdirect: 3800,
    neco:       1000,
    jamb:       700,
    nabteb:     900
};

function updateEduPrice() {
    const examType = document.getElementById('examType')?.value;
    const quantity = parseInt(document.getElementById('eduQuantity')?.value || 1);
    const priceTag = document.getElementById('eduPriceTag');
    if (!priceTag || !examType) return;
    const unitPrice = EDU_PRICES[examType];
    if (unitPrice) {
        priceTag.style.display = 'block';
        priceTag.textContent = `Estimated Total: ₦${(unitPrice * quantity).toLocaleString()} (${quantity} × ₦${unitPrice.toLocaleString()})`;
    } else {
        priceTag.style.display = 'none';
    }
}

async function submitEducationPurchase() {
    const examType = document.getElementById('examType').value;
    const quantity = parseInt(document.getElementById('eduQuantity').value);
    const pin      = document.getElementById('eduPin').value.trim();

    if (!pin || !/^\d{4}$/.test(pin)) {
        showError('Please enter your 4-digit transaction PIN'); return;
    }
    if (!quantity || quantity < 1) {
        showError('Please select a valid quantity'); return;
    }

    const examLabels = { waecdirect: 'WAEC', neco: 'NECO', jamb: 'JAMB', nabteb: 'NABTEB' };
    const label = examLabels[examType] || examType.toUpperCase();

    try {
        showLoading(`Purchasing ${label} PIN${quantity > 1 ? 's' : ''}...`);
        const response = await api.purchaseEducationPIN(examType, quantity, pin);

        closeModal();
        setTimeout(() => {
            showSuccess(`
                <div style="text-align:center;">
                    <p style="font-size:16px;margin-bottom:6px;">Purchase Successful! 📚</p>
                    <p style="font-size:14px;color:#64748b;">${quantity} × ${label} PIN${quantity > 1 ? 's' : ''} purchased</p>
                    <p style="font-size:13px;color:#94a3b8;margin-top:6px;">Check your email for the scratch card(s)</p>
                </div>
            `);
        }, 300);
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('pin'))          showError('Invalid transaction PIN. Please try again.');
            else if (msg.includes('balance')) showError('Insufficient wallet balance.');
            else                              showError(error.message || 'Purchase failed. Please try again.');
        }, 300);
    }
}

// ==================== RECHARGE PIN MODAL ====================
function showRechargePINModal() {
    showModal('Recharge PIN', `
        <div class="form-group">
            <label>Select Network</label>
            <select id="pinNetwork" class="form-input">
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
                <option value="glo">Glo</option>
                <option value="9mobile">9mobile</option>
            </select>
        </div>
        <div class="form-group">
            <label>Denomination (₦)</label>
            <select id="pinType" class="form-input">
                <option value="100">₦100</option>
                <option value="200">₦200</option>
                <option value="500">₦500</option>
                <option value="1000">₦1,000</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="pinQuantity" value="1" min="1" max="10" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="pinTxPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitRechargePIN()" class="btn-primary">Purchase PIN</button>
    `);
}

async function submitRechargePIN() {
    const network = document.getElementById('pinNetwork').value;
    const amount = document.getElementById('pinType').value;
    const quantity = parseInt(document.getElementById('pinQuantity').value);
    const pin = document.getElementById('pinTxPin').value;

    // PIN Validation
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit transaction PIN');
        return;
    }
    if (!/^\d+$/.test(pin)) {
        showError('Transaction PIN must contain only numbers');
        return;
    }

    if (!quantity || quantity < 1) {
        showError('Please enter a valid quantity');
        return;
    }

    // Map network names to their IDs based on the backend structure
    const networkIdMap = {
        'mtn': '01',
        'glo': '02',
        '9mobile': '03',
        'airtel': '04'
    };

    const networkId = networkIdMap[network];
    
    if (!networkId) {
        showError('Invalid network selected');
        return;
    }

    try {
        showLoading('Purchasing recharge PIN...');
        
        // Use the new epin purchase endpoint with networkId
        const response = await api.purchaseEpin(networkId, amount, quantity, pin);
        
        closeModal();
        
        // Handle success
        setTimeout(() => {
            if (response.TXN_EPIN && response.TXN_EPIN.length > 0) {
                // Show success with the first PIN as example
                showSuccess(`
                    <div style="text-align: center;">
                        <p style="font-size: 16px; margin-bottom: 8px;">PIN Purchase Successful! 🔐</p>
                        <p style="font-size: 14px; color: #64748b;">${quantity} x ₦${amount} ${network.toUpperCase()} PIN(s) purchased</p>
                        <p style="font-size: 13px; color: #94a3b8; margin-top: 8px;">PINs have been sent to your email</p>
                    </div>
                `);
            } else {
                showSuccess(`
                    <div style="text-align: center;">
                        <p style="font-size: 16px; margin-bottom: 8px;">PIN Purchase Successful! 🔐</p>
                        <p style="font-size: 14px; color: #64748b;">${quantity} x ₦${amount} ${network.toUpperCase()} PIN(s) purchased</p>
                    </div>
                `);
            }
        }, 300);
        
    } catch (error) {
        closeModal();
        setTimeout(() => {
            const errorMsg = error.message || '';
            
            if (errorMsg.toLowerCase().includes('pin')) {
                showError('Invalid transaction PIN. Please try again.');
            } else if (errorMsg.toLowerCase().includes('balance')) {
                showError('Insufficient wallet balance.');
            } else {
                showError(errorMsg || 'Purchase failed. Please try again.');
            }
        }, 300);
    }
}

// ==================== SWAP/AIRTIME2CASH MODAL ====================
function showSwapModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Network</label>
            <select id="swapNetwork" class="form-input">
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
                <option value="glo">Glo</option>
                <option value="9mobile">9mobile</option>
            </select>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="swapPhone" placeholder="08012345678" maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Airtime Amount</label>
            <input type="number" id="swapAmount" placeholder="Enter amount (min ₦500)" min="500" class="form-input" oninput="updateSwapPreview()">
        </div>
        <div id="swapPreview" style="padding: 16px; background: #fef3c7; border-radius: 8px; margin-bottom: 16px; display: none;">
            <p style="font-size: 14px; color: #92400e;">You will receive: <strong id="swapReceive">₦0.00</strong> (85% of airtime value)</p>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="swapPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitAirtimeSwap()" class="btn-primary">Convert to Cash</button>
    `;
    
    showModal('Airtime to Cash', bodyHTML, footerHTML);
}

function updateSwapPreview() {
    const amount = parseInt(document.getElementById('swapAmount').value) || 0;
    const receive = amount * 0.85;
    document.getElementById('swapReceive').textContent = `₦${receive.toLocaleString()}`;
    document.getElementById('swapPreview').style.display = amount > 0 ? 'block' : 'none';
}

async function submitAirtimeSwap() {
    const network = document.getElementById('swapNetwork').value;
    const phone = document.getElementById('swapPhone').value;
    const amount = parseInt(document.getElementById('swapAmount').value);
    const pin = document.getElementById('swapPin').value;
    
    // Validate PIN format first (client-side)
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit transaction PIN');
        return;
    }
    if (!/^\d+$/.test(pin)) {
        showError('Transaction PIN must contain only numbers');
        return;
    }
    
    // Other validations
    if (!phone || phone.length !== 11) {
        showError('Please enter a valid 11-digit phone number');
        return;
    }
    if (!amount || amount < 500) {
        showError('Minimum swap amount is ₦500');
        return;
    }
    
    try {
        showLoading('Processing your swap...');
        
        const response = await api.swapAirtime(phone, network, amount, pin);
        
        // Success
        const cashValue = amount * 0.85;
        closeModal();
        setTimeout(() => {
            showSuccess(`
                <div style="text-align: center;">
                    <p style="font-size: 16px; margin-bottom: 8px;">Swap Successful! 🎉</p>
                    <p style="font-size: 14px; color: #64748b;">₦${amount.toLocaleString()} airtime converted to</p>
                    <p style="font-size: 24px; font-weight: 700; color: #16a34a;">₦${cashValue.toLocaleString()}</p>
                </div>
            `);
        }, 300);
        
    } catch (error) {
        console.error('Swap error:', error);
        
        const errorMsg = error.message || '';
        
        // Close loading modal
        closeModal();
        
        // Show appropriate error message after a tiny delay
        setTimeout(() => {
            // Check for PIN-related errors
            if (errorMsg.toLowerCase().includes('pin')) {
                showError(`
                    <div style="text-align: center;">
                        <p style="margin-bottom: 8px;">Invalid Transaction PIN</p>
                        <p style="font-size: 13px; color: #64748b;">Please check your PIN and try again</p>
                    </div>
                `);
            }
            // Check for balance errors
            else if (errorMsg.toLowerCase().includes('balance') || errorMsg.toLowerCase().includes('insufficient')) {
                showError(`
                    <div style="text-align: center;">
                        <p style="margin-bottom: 8px;">Insufficient Balance</p>
                        <p style="font-size: 13px; color: #64748b;">Please fund your wallet and try again</p>
                    </div>
                `);
            }
            // Session expired
            else if (errorMsg.toLowerCase().includes('session') || errorMsg.toLowerCase().includes('login')) {
                showError(`
                    <div style="text-align: center;">
                        <p style="margin-bottom: 8px;">Session Expired</p>
                        <p style="font-size: 13px; color: #64748b;">Please login again to continue</p>
                    </div>
                `);
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            }
            else {
                showError(`
                    <div style="text-align: center;">
                        <p>Unable to complete swap</p>
                        <p style="font-size: 13px; color: #64748b; margin-top: 4px;">${errorMsg || 'Please try again'}</p>
                    </div>
                `);
            }
        }, 300);
    }
}

// SMS, Remita, Alpha services
function showSMSModal() { 
    showModal('Bulk SMS', `
        <form id="smsForm" style="padding: 24px;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Sender ID</label>
                <input type="text" id="smsSender" placeholder="e.g., YareemaData" maxlength="11" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Max 11 characters</p>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Phone Numbers</label>
                <textarea id="smsPhones" placeholder="Enter phone numbers separated by commas&#10;e.g., 08012345678, 08087654321" rows="4" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; resize: vertical;"></textarea>
                <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Separate multiple numbers with commas</p>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Message</label>
                <textarea id="smsMessage" placeholder="Type your message here..." rows="5" maxlength="160" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; resize: vertical;"></textarea>
                <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                    <p style="color: #64748b; font-size: 12px;">Max 160 characters per page</p>
                    <p id="smsCharCount" style="color: #64748b; font-size: 12px;">0/160</p>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 14px;">Recipients:</span>
                    <span id="smsRecipientCount" style="color: #1e3d5c; font-weight: 600;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 14px;">Pages:</span>
                    <span id="smsPageCount" style="color: #1e3d5c; font-weight: 600;">1</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #64748b; font-size: 14px;">Estimated Cost:</span>
                    <span id="smsCost" style="color: #1e3d5c; font-weight: 600;">₦0.00</span>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Transaction PIN</label>
                <input type="password" id="smsPin" placeholder="Enter 4-digit PIN" maxlength="4" pattern="[0-9]{4}" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
        </form>
    `, `
        <button type="button" onclick="closeModal()" style="padding: 12px 24px; background: #f1f5f9; border: none; border-radius: 8px; cursor: pointer; margin-right: 8px;">Cancel</button>
        <button type="submit" form="smsForm" class="btn-primary" style="padding: 12px 24px;">Send SMS</button>
    `);

    // Add character counter
    document.getElementById('smsMessage').addEventListener('input', function() {
        const length = this.value.length;
        document.getElementById('smsCharCount').textContent = length + '/160';
        const pages = Math.ceil(length / 160) || 1;
        document.getElementById('smsPageCount').textContent = pages;
        calculateSMSCost();
    });

    // Add recipient counter
    document.getElementById('smsPhones').addEventListener('input', calculateSMSCost);

    document.getElementById('smsForm').addEventListener('submit', handleSMSSend);
}

function calculateSMSCost() {
    const phonesText = document.getElementById('smsPhones').value;
    const message = document.getElementById('smsMessage').value;
    
    const phones = phonesText.split(',').map(p => p.trim()).filter(p => p.length > 0);
    const recipientCount = phones.length;
    const pages = Math.ceil(message.length / 160) || 1;
    const costPerPage = 4; // ₦4 per page
    const totalCost = recipientCount * pages * costPerPage;

    document.getElementById('smsRecipientCount').textContent = recipientCount;
    document.getElementById('smsPageCount').textContent = pages;
    document.getElementById('smsCost').textContent = '₦' + totalCost.toFixed(2);
}

async function handleSMSSend(e) {
    e.preventDefault();
    
    const sender = document.getElementById('smsSender').value;
    const phonesText = document.getElementById('smsPhones').value;
    const message = document.getElementById('smsMessage').value;
    const pin = document.getElementById('smsPin').value;

    const phones = phonesText.split(',').map(p => p.trim()).filter(p => p.length > 0);

    if (phones.length === 0) {
        showError('Please enter at least one phone number');
        return;
    }

    if (message.length === 0) {
        showError('Please enter a message');
        return;
    }

    if (pin.length !== 4) {
        showError('Transaction PIN must be 4 digits');
        return;
    }

    showLoading('Sending SMS...');

    try {
        // This would call api.sendBulkSMS() when backend implements it
        const response = await api.request('/api/v1/sms/send', {
            method: 'POST',
            body: {
                sender: sender,
                recipients: phones,
                message: message,
                transactionPin: pin
            }
        });

        closeModal();
        showSuccess(response.message || 'SMS sent successfully!');
    } catch (error) {
        closeModal();
        showError(error.message || 'Failed to send SMS. Please try again.');
    }
}

function showRemitaModal() { 
    window.location.href = 'rrr-payment.html';
}

function showAlphaModal() { 
    showError('This service is currently unavailable. Please contact support.'); 
}

// ==================== FUND WALLET MODAL ====================
// Helpers
function _fundStep(show) {
    ['fundLoadingStep','fundVerifyStep','fundAccountStep'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === show) ? 'block' : 'none';
    });
}

function _walletCacheKey() {
    try {
        const u = JSON.parse(localStorage.getItem('user_data') || '{}');
        const uid = u._id || u.id || '';
        return uid ? 'wallet_accounts_' + uid : null;
    } catch(e) { return null; }
}

function _saveWalletAccounts(accounts) {
    try {
        const key = _walletCacheKey();
        if (key) localStorage.setItem(key, JSON.stringify(accounts));
        // Also save legacy key for set-pin.html compatibility
        localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
    } catch(e) {}
}

function _loadWalletAccounts() {
    try {
        // Prefer user-specific key
        const key = _walletCacheKey();
        if (key) {
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);
        }
        // Fallback: only use generic cache if it belongs to current user
        const generic = localStorage.getItem('wallet_accounts');
        if (!generic) return null;
        const accounts = JSON.parse(generic);
        // Validate: account name should match current user's name
        const u = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userName = (u.firstName || '').toLowerCase();
        if (userName && accounts[0]?.accountName) {
            if (!accounts[0].accountName.toLowerCase().includes(userName)) {
                // This cache belongs to a different user — clear it
                localStorage.removeItem('wallet_accounts');
                return null;
            }
        }
        return accounts;
    } catch(e) { return null; }
}

function showFundModal() {
    showModal('Fund Wallet', `
        <div id="fundModalWrap" style="padding:4px 0;">

            <!-- Step: Loading -->
            <div id="fundLoadingStep" style="text-align:center;padding:48px 0;">
                <div style="width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#1e3d5c;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
                <p style="color:#1e3d5c;font-weight:600;font-size:15px;" id="fundLoadingText">Checking your wallet...</p>
            </div>

                        <div id="fundVerifyStep" style="display:none;"></div>

            <!-- Step: Account Details -->
            <div id="fundAccountStep" style="display:none;">
                <p style="color:#64748b;margin-bottom:14px;font-size:13px;font-weight:500;">
                    Transfer to any of your dedicated accounts below:
                </p>
                <div id="fundAccountsList"></div>

                <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;border-left:3px solid #f59e0b;margin-bottom:16px;">
                    <p style="color:#92400e;font-size:12px;margin:0;line-height:1.5;">⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes of transfer</p>
                </div>

                <button onclick="closeModal()" class="btn-primary" style="width:100%;margin-top:4px;">Close</button>
            </div>

        </div>
    `, '');

    _initFundModal();
}

async function _initFundModal() {
    // 1. Check localStorage cache first — instant, no API call
    const cached = _loadWalletAccounts();
    if (cached && cached.length > 0) {
        _renderFundAccounts(cached);
        return;
    }

    // 2. No cache — fetch from wallet balance endpoint
    _fundStep('fundLoadingStep');
    try {
        const response = await api.getWalletBalance();
        const wallet = response.data?.wallet || response.data || {};

        // Backend returns wallet.virtualAccount{} OR wallet.accounts[]
        let accounts = [];
        if (wallet.accounts?.length > 0) {
            accounts = wallet.accounts;
        } else if (wallet.virtualAccount?.accountNumber) {
            accounts = [{ ...wallet.virtualAccount, isDefault: true }];
        }

        if (accounts.length > 0) {
            _saveWalletAccounts(accounts);
            _renderFundAccounts(accounts);
        } else {
            // No accounts yet — try wallet create
            _fundStep('fundLoadingStep');
            document.getElementById('fundLoadingText').textContent = 'Setting up your accounts...';
            try {
                const createResp = await api.createWalletAccount({});
                const w = createResp.data?.wallet || createResp.data || {};
                let accs = [];
                if (w.accounts?.length > 0) {
                    accs = w.accounts;
                } else if (w.virtualAccount?.accountNumber) {
                    accs = [{ ...w.virtualAccount, isDefault: true }];
                }
                if (accs.length > 0) {
                    _saveWalletAccounts(accs);
                    _renderFundAccounts(accs);
                } else {
                    _showFundError('Your wallet accounts are being prepared. Please try again in a few minutes.');
                }
            } catch (e) {
                _showFundError(e.message || 'Could not load account details. Please try again.');
            }
        }
    } catch (err) {
        _showFundError(err.message || 'Could not connect. Please check your connection and try again.');
    }
}

function _showFundError(message) {
    const body = document.getElementById('modalBody');
    if (!body) return;
    body.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <div style="width:56px;height:56px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p style="font-weight:600;color:#0f172a;margin-bottom:6px;">Unable to Load Account</p>
            <p style="font-size:13px;color:#64748b;line-height:1.5;">${message}</p>
            <button onclick="closeModal()" class="btn-primary" style="margin-top:20px;padding:10px 24px;">Close</button>
        </div>
    `;
}

function _renderFundAccounts(accounts) {
    const container = document.getElementById('fundAccountsList');
    if (!container) return;

    container.innerHTML = accounts.map((acc, i) => `
        <div style="background:${acc.isDefault ? 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' : '#f8fafc'};
             border:${acc.isDefault ? '1.5px solid #7dd3fc' : '1px solid #e2e8f0'};
             border-radius:14px;padding:16px;margin-bottom:10px;position:relative;">
            ${acc.isDefault ? `<span style="position:absolute;top:10px;right:12px;background:#0284c7;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:0.5px;">PRIMARY</span>` : ''}
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:36px;height:36px;background:${acc.isDefault ? '#0284c7' : '#1e3d5c'};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                    <div style="font-weight:700;color:#0f172a;font-size:14px;">${acc.bankName || 'Bank'}</div>
                    <div style="color:#64748b;font-size:12px;">${acc.accountName || ''}</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:white;border-radius:8px;padding:10px 14px;border:1px solid #e2e8f0;">
                <span style="font-size:22px;font-weight:700;color:#1e3d5c;letter-spacing:3px;" id="accNum_${i}">${acc.accountNumber}</span>
                <button onclick="copyFundAccount('accNum_${i}', this)"
                    style="background:#1e3d5c;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;white-space:nowrap;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                </button>
            </div>
        </div>
    `).join('');

    _fundStep('fundAccountStep');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function copyFundAccount(elemId, btn) {
    const num = document.getElementById(elemId)?.textContent?.trim();
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = '#16a34a';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = '#1e3d5c'; }, 2000);
    });
}

let _selectedIdType = 'nin';

function selectIdType(type) {
    _selectedIdType = type;
    const ninBtn = document.getElementById('ninBtn');
    const bvnBtn = document.getElementById('bvnBtn');
    const label  = document.getElementById('idInputLabel');
    const input  = document.getElementById('idNumberInput');

    const activeStyle  = 'padding:14px;border:2px solid #1e3d5c;border-radius:10px;background:#1e3d5c;color:white;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;';
    const inactiveStyle = 'padding:14px;border:2px solid #e2e8f0;border-radius:10px;background:white;color:#64748b;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;';

    if (type === 'nin') {
        ninBtn.style.cssText = activeStyle;  bvnBtn.style.cssText = inactiveStyle;
        ninBtn.textContent = '🪪 NIN';       bvnBtn.textContent = '🏦 BVN';
        label.textContent = 'NIN (11 digits)';
        input.placeholder = 'Enter your NIN';
        input.maxLength   = 11;
    } else {
        bvnBtn.style.cssText = activeStyle;  ninBtn.style.cssText = inactiveStyle;
        bvnBtn.textContent = '🏦 BVN';       ninBtn.textContent = '🪪 NIN';
        label.textContent = 'BVN (11 digits)';
        input.placeholder = 'Enter your BVN';
        input.maxLength   = 11;
    }
}

async function submitIdVerification() {
    const idNumber = document.getElementById('idNumberInput').value.trim();
    if (!/^\d{11}$/.test(idNumber)) {
        // Inline error — don't use showError which would replace the modal
        const input = document.getElementById('idNumberInput');
        input.style.borderColor = '#dc2626';
        input.style.boxShadow   = '0 0 0 3px rgba(220,38,38,0.1)';
        const existing = document.getElementById('idInlineError');
        if (existing) existing.remove();
        const err = document.createElement('p');
        err.id = 'idInlineError';
        err.style.cssText = 'color:#dc2626;font-size:12px;margin-top:6px;';
        err.textContent = _selectedIdType.toUpperCase() + ' must be exactly 11 digits';
        input.parentNode.appendChild(err);
        return;
    }

    const btn = document.getElementById('verifySubmitBtn');
    btn.disabled    = true;
    btn.textContent = 'Setting up your account...';
    btn.style.opacity = '0.7';
    _fundStep('fundLoadingStep');
    document.getElementById('fundLoadingText').textContent = 'Creating your wallet accounts...';

    try {
        const payload  = _selectedIdType === 'nin' ? { nin: idNumber } : { bvn: idNumber };
        const response = await api.createWalletAccount(payload);

        // Only proceed on success status
        if (response.status !== 'success' && !response.data) {
            throw new Error(response.message || 'Wallet creation failed');
        }

        const wallet   = response.data?.wallet || response.data || response;
        const accounts = wallet.accounts || [];

        if (accounts.length > 0) {
            _saveWalletAccounts(accounts);
            // Show success screen BEFORE account details
            _showWalletCreatedSuccess(wallet, accounts);
        } else {
            throw new Error('No accounts were created. Please try again or contact support.');
        }
    } catch (err) {
        // Come back to verify form with inline error — never flash success
        _fundStep('fundVerifyStep');
        const btn2 = document.getElementById('verifySubmitBtn');
        if (btn2) { btn2.disabled = false; btn2.textContent = 'Create My Wallet Account →'; btn2.style.opacity = '1'; }
        const existing = document.getElementById('idInlineError');
        if (existing) existing.remove();
        const errEl = document.createElement('div');
        errEl.id = 'idInlineError';
        errEl.style.cssText = 'background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px;margin-top:12px;color:#dc2626;font-size:13px;';
        errEl.innerHTML = `<strong>Setup Failed</strong><br>${err.message || 'Please check your details and try again.'}`;
        document.getElementById('fundVerifyStep').appendChild(errEl);
    }
}

function _showWalletCreatedSuccess(wallet, accounts) {
    const primaryAcc = accounts.find(a => a.isDefault) || accounts[0];
    document.getElementById('modalTitle').textContent = '🎉 Wallet Created!';
    document.getElementById('modalBody').innerHTML = `
        <div style="text-align:center;padding:8px 0 20px;">
            <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#dcfce7,#bbf7d0);display:flex;align-items:center;justify-content:center;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:6px;">Wallet Created Successfully!</h3>
            <p style="color:#64748b;font-size:14px;">Your dedicated bank accounts are ready. Transfer money to fund your wallet instantly.</p>
        </div>

        <div style="margin-bottom:16px;">
            <p style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Your Accounts (${accounts.length})</p>
            ${accounts.map((acc, i) => `
                <div style="background:${acc.isDefault ? 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' : '#f8fafc'};
                     border:${acc.isDefault ? '1.5px solid #7dd3fc' : '1px solid #e2e8f0'};
                     border-radius:14px;padding:14px;margin-bottom:8px;position:relative;">
                    ${acc.isDefault ? `<span style="position:absolute;top:10px;right:12px;background:#0284c7;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">PRIMARY</span>` : ''}
                    <div style="font-weight:700;color:#0f172a;font-size:14px;margin-bottom:2px;">${acc.bankName}</div>
                    <div style="color:#64748b;font-size:12px;margin-bottom:8px;">${acc.accountName}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;background:white;border-radius:8px;padding:8px 12px;border:1px solid #e2e8f0;">
                        <span style="font-size:20px;font-weight:700;color:#1e3d5c;letter-spacing:3px;" id="succNum_${i}">${acc.accountNumber}</span>
                        <button onclick="copyFundAccount('succNum_${i}', this)"
                            style="background:#1e3d5c;color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">
                            Copy
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;border-left:3px solid #f59e0b;">
            <p style="color:#92400e;font-size:12px;margin:0;">⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes</p>
        </div>
    `;
    document.getElementById('modalFooter').innerHTML = `
        <button onclick="closeModal()" class="btn-secondary" style="flex:1;">Close</button>
        <button onclick="_goToFundAccountStep()" class="btn-primary" style="flex:1;">Fund Now →</button>
    `;
    document.getElementById('modalFooter').style.display = 'flex';
    document.getElementById('modalFooter').style.gap = '10px';
}

function _goToFundAccountStep() {
    const cached = _loadWalletAccounts();
    if (!cached) { closeModal(); return; }
    document.getElementById('modalTitle').textContent = 'Fund Wallet';
    document.getElementById('modalFooter').innerHTML  = '';
    document.getElementById('modalBody').innerHTML    = `
        <div id="fundModalWrap" style="padding:4px 0;">
            <div id="fundLoadingStep" style="display:none;"></div>
            <div id="fundVerifyStep"  style="display:none;"></div>
            <div id="fundAccountStep" style="display:none;">
                <p style="color:#64748b;margin-bottom:14px;font-size:13px;font-weight:500;">Transfer to any account below:</p>
                <div id="fundAccountsList"></div>
                <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;border-left:3px solid #f59e0b;margin-bottom:16px;">
                    <p style="color:#92400e;font-size:12px;margin:0;">⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes</p>
                </div>
                <button onclick="closeModal()" class="btn-primary" style="width:100%;margin-top:4px;">Close</button>
            </div>
        </div>
    `;
    _renderFundAccounts(cached);
}

// ==================== PAYMENT POLLING ====================
let _pollInterval = null;
let _pollAttempts = 0;
const POLL_MAX = 24; // 24 x 5s = 2 minutes

function startPaymentPolling() {
    _pollAttempts = 0;
    const btn = document.getElementById('confirmedTransferBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Checking...'; }
    document.getElementById('paymentConfirmSection').style.display = 'block';

    api.getWalletBalance().then(w => {
        window._balanceBeforeFund = parseFloat(w.data?.balance || w.balance || 0);
    }).catch(() => { window._balanceBeforeFund = 0; });

    _pollInterval = setInterval(_checkPaymentReceived, 5000);
}

async function _checkPaymentReceived() {
    _pollAttempts++;
    const progress = (_pollAttempts / POLL_MAX) * 100;
    const bar = document.getElementById('pollProgressBar');
    if (bar) bar.style.width = progress + '%';

    try {
        const w = await api.getWalletBalance();
        const newBalance = parseFloat(w.data?.balance || w.balance || 0);
        const credited   = newBalance - (window._balanceBeforeFund || 0);
        if (credited > 0) {
            clearInterval(_pollInterval);
            closeModal();
            showPaymentSuccess(newBalance, credited);
            return;
        }
    } catch (e) { console.warn('Poll check error:', e); }

    if (_pollAttempts >= POLL_MAX) {
        clearInterval(_pollInterval);
        const statusEl = document.getElementById('pollStatusText');
        const subEl    = document.getElementById('pollSubText');
        const spinner  = document.getElementById('pollSpinner');
        if (statusEl) statusEl.textContent = 'Taking longer than expected';
        if (subEl)    subEl.textContent    = 'Your balance will update automatically. Check transaction history in a few minutes.';
        if (spinner)  spinner.style.borderTopColor = '#f59e0b';
        const btn = document.getElementById('confirmedTransferBtn');
        if (btn) { btn.disabled = false; btn.textContent = 'Retry'; btn.onclick = startPaymentPolling; }
    } else {
        const statusEl = document.getElementById('pollStatusText');
        if (statusEl) statusEl.textContent = `Waiting for payment... (${_pollAttempts}/${POLL_MAX})`;
    }
}

// Silent poll — used after Paystack/Flutterwave redirect back
function startSilentPoll() {
    api.getWalletBalance().then(w => {
        window._balanceBeforeFund = parseFloat(w.data?.balance || w.balance || 0);
    }).catch(() => {});
    let attempts = 0;
    const silentInterval = setInterval(async () => {
        attempts++;
        try {
            const w = await api.getWalletBalance();
            const newBalance = parseFloat(w.data?.balance || w.balance || 0);
            const credited   = newBalance - (window._balanceBeforeFund || 0);
            if (credited > 0) { clearInterval(silentInterval); showPaymentSuccess(newBalance, credited); }
        } catch (e) {}
        if (attempts >= 24) clearInterval(silentInterval);
    }, 5000);
}

function showPaymentSuccess(newBalance, credited) {
    const fmt    = (n) => '₦' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
    showModal('Payment Received! 🎉', `
        <div style="text-align:center;padding:32px;">
            <div style="width:80px;height:80px;margin:0 auto 20px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <p style="color:#64748b;font-size:14px;margin-bottom:6px;">Amount Credited</p>
            <p style="font-size:36px;font-weight:700;color:#16a34a;margin-bottom:4px;">${fmt(credited)}</p>
            <p style="color:#64748b;font-size:14px;">New Balance: <strong style="color:#1e3d5c;">${fmt(newBalance)}</strong></p>
        </div>
    `, `<button onclick="closeModal(); location.reload();" class="btn-primary" style="width:100%;">Done</button>`);

    const balEl = document.getElementById('balance');
    if (balEl) balEl.textContent = fmt(newBalance);
}

function showTransferModal() {
    showModal('Transfer Funds', `
        <form id="transferForm" style="padding: 24px;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Recipient Email or Phone</label>
                <input type="text" id="transferRecipient" placeholder="Enter email or phone number" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Amount</label>
                <input type="number" id="transferAmount" placeholder="0.00" min="100" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Transaction PIN</label>
                <input type="password" id="transferPin" placeholder="Enter 4-digit PIN" maxlength="4" pattern="[0-9]{4}" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Narration (Optional)</label>
                <input type="text" id="transferNarration" placeholder="What's this for?"
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
        </form>
    `, `
        <button type="button" onclick="closeModal()" style="padding: 12px 24px; background: #f1f5f9; border: none; border-radius: 8px; cursor: pointer; margin-right: 8px;">Cancel</button>
        <button type="submit" form="transferForm" class="btn-primary" style="padding: 12px 24px;">Transfer</button>
    `);

    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
}

async function handleTransfer(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('transferRecipient').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const pin = document.getElementById('transferPin').value;
    const narration = document.getElementById('transferNarration').value;

    if (amount < 100) {
        showError('Minimum transfer amount is ₦100');
        return;
    }

    if (pin.length !== 4) {
        showError('Transaction PIN must be 4 digits');
        return;
    }

    showLoading('Processing transfer...');

    try {
        const response = await api.transferFunds({
            recipientEmail: recipient,
            description: narration,
            amount: amount,
            transactionPin: pin,
        });

        closeModal();
        showSuccess(response.message || 'Transfer successful!');
    } catch (error) {
        closeModal();
        showError(error.message || 'Transfer failed. Please try again.');
    }
}

function showWithdrawModal() {
    showModal('Withdraw Funds', `
        <form id="withdrawForm" style="padding: 24px;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Bank</label>
                <select id="withdrawBank" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                    <option value="">Select Bank</option>
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Account Number</label>
                <input type="text" id="withdrawAccountNumber" placeholder="0123456789" maxlength="10" pattern="[0-9]{10}" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                <div id="accountNameDisplay" style="margin-top: 8px; color: #16a34a; font-size: 14px;"></div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Amount</label>
                <input type="number" id="withdrawAmount" placeholder="0.00" min="1000" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Minimum: ₦1,000</p>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #64748b; font-size: 14px; margin-bottom: 8px;">Transaction PIN</label>
                <input type="password" id="withdrawPin" placeholder="Enter 4-digit PIN" maxlength="4" pattern="[0-9]{4}" required
                    style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
        </form>
    `, `
        <button type="button" onclick="closeModal()" style="padding: 12px 24px; background: #f1f5f9; border: none; border-radius: 8px; cursor: pointer; margin-right: 8px;">Cancel</button>
        <button type="submit" form="withdrawForm" class="btn-primary" style="padding: 12px 24px;">Withdraw</button>
    `);

    loadBanks();
    document.getElementById('withdrawForm').addEventListener('submit', handleWithdraw);
    document.getElementById('withdrawAccountNumber').addEventListener('blur', verifyAccountNumber);
}

async function loadBanks() {
    // Load Nigerian banks
    const banks = [
        'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank',
        'Ecobank', 'Fidelity Bank', 'FCMB', 'Sterling Bank', 'Union Bank',
        'Stanbic IBTC', 'Polaris Bank', 'Wema Bank', 'Keystone Bank'
    ];
    
    const select = document.getElementById('withdrawBank');
    banks.forEach(bank => {
        const option = document.createElement('option');
        option.value = bank.toLowerCase().replace(/\s+/g, '-');
        option.textContent = bank;
        select.appendChild(option);
    });
}

async function verifyAccountNumber() {
    const accountNumber = document.getElementById('withdrawAccountNumber').value;
    const bank = document.getElementById('withdrawBank').value;
    const display = document.getElementById('accountNameDisplay');

    if (accountNumber.length !== 10 || !bank) {
        display.textContent = '';
        return;
    }

    display.textContent = 'Verifying account...';

    // This would call a real API to verify account
    // For now, show placeholder
    setTimeout(() => {
        display.textContent = 'Account Name: [Verification pending]';
    }, 1000);
}

async function handleWithdraw(e) {
    e.preventDefault();
    
    const bank = document.getElementById('withdrawBank').value;
    const accountNumber = document.getElementById('withdrawAccountNumber').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const pin = document.getElementById('withdrawPin').value;

    if (amount < 1000) {
        showError('Minimum withdrawal amount is ₦1,000');
        return;
    }

    if (pin.length !== 4) {
        showError('Transaction PIN must be 4 digits');
        return;
    }

    showLoading('Processing withdrawal...');

    try {
        const response = await api.withdrawFunds({
            bankCode: bank,
            accountNumber: accountNumber,
            amount: amount,
            transactionPin: pin
        });

        closeModal();
        showSuccess(response.message || 'Withdrawal request submitted!');
    } catch (error) {
        closeModal();
        showError(error.message || 'Withdrawal failed. Please try again.');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Account number copied!');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSuccess('Account number copied!');
    }
}

// ==================== PROFILE MODALS ====================
function showPersonalDetailsModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const bodyHTML = `
        <div class="profile-details">
            <div class="detail-row">
                <span class="detail-label">Full Name</span>
                <span class="detail-value">${user.firstName || ''} ${user.lastName || ''}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${user.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone Number</span>
                <span class="detail-value">${user.phoneNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Account Created</span>
                <span class="detail-value">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    `;
    
    showModal('Personal Details', bodyHTML, '<button onclick="closeModal()" class="btn-primary" style="width: 100%;">Close</button>');
}

function showEditProfileModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const bodyHTML = `
        <div class="form-group">
            <label>First Name</label>
            <input type="text" id="editFirstName" value="${user.firstName || ''}" class="form-input">
        </div>
        <div class="form-group">
            <label>Last Name</label>
            <input type="text" id="editLastName" value="${user.lastName || ''}" class="form-input">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="editEmail" value="${user.email || ''}" class="form-input" disabled>
            <small style="color: #64748b;">Email cannot be changed</small>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="editPhone" value="${user.phoneNumber || ''}" class="form-input" disabled>
            <small style="color: #64748b;">Phone cannot be changed</small>
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitProfileEdit()" class="btn-primary">Save Changes</button>
    `;
    
    showModal('Edit Profile', bodyHTML, footerHTML);
}

async function submitProfileEdit() {
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    
    if (!firstName || !lastName) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        showLoading('Saving changes...');
        await api.updateProfile({ firstName, lastName });
        
        // Update local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.firstName = firstName;
        user.lastName = lastName;
        localStorage.setItem('user', JSON.stringify(user));
        
        showSuccess('Profile updated successfully!');
    } catch (error) {
        showError(error.message || 'Failed to update profile');
    }
}

function showSecurityModal() {
    const bodyHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <button onclick="closeModal(); setTimeout(() => changePassword(), 300)" class="security-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Change Password</span>
            </button>
            <button onclick="closeModal(); setTimeout(() => setTransactionPIN(), 300)" class="security-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <span>Set Transaction PIN</span>
            </button>
        </div>
    `;
    
    showModal('Security Settings', bodyHTML, '<button onclick="closeModal()" class="btn-secondary" style="width: 100%;">Close</button>');
}

function changePassword() {
    const bodyHTML = `
        <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="currentPassword" class="form-input">
        </div>
        <div class="form-group">
            <label>New Password</label>
            <input type="password" id="newPassword" class="form-input">
        </div>
        <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="confirmPassword" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitPasswordChange()" class="btn-primary">Change Password</button>
    `;
    
    showModal('Change Password', bodyHTML, footerHTML);
}

async function submitPasswordChange() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || !newPass || !confirm) {
        showError('Please fill in all fields');
        return;
    }
    if (newPass !== confirm) {
        showError('Passwords do not match');
        return;
    }
    if (newPass.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showLoading('Changing password...');
        await api.changePassword(current, newPass);
        showSuccess('Password changed successfully!');
    } catch (error) {
        showError(error.message || 'Failed to change password');
    }
}

function setTransactionPIN() {
    const bodyHTML = `
        <div class="form-group">
            <label>New PIN</label>
            <input type="password" id="newPIN" maxlength="4" placeholder="Enter 4-digit PIN" class="form-input">
        </div>
        <div class="form-group">
            <label>Confirm PIN</label>
            <input type="password" id="confirmPIN" maxlength="4" placeholder="Re-enter PIN" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitPINChange()" class="btn-primary">Set PIN</button>
    `;
    
    showModal('Set Transaction PIN', bodyHTML, footerHTML);
}

async function submitPINChange() {
    const newPin = document.getElementById('newPIN').value;
    const confirmPin = document.getElementById('confirmPIN').value;
    
    if (!newPin || !confirmPin) {
        showError('Please fill in all fields');
        return;
    }
    if (newPin.length !== 4) {
        showError('PIN must be 4 digits');
        return;
    }
    if (newPin !== confirmPin) {
        showError('PINs do not match');
        return;
    }
    
    try {
        showLoading('Setting PIN...');
        await api.setTransactionPIN(newPin, confirmPin);
        showSuccess('Transaction PIN set successfully!');
    } catch (error) {
        showError(error.message || 'Failed to set PIN');
    }
}

function showNotificationsModal() {
    showModal('Notifications', `
        <div id="notifLoadingState" style="text-align:center;padding:40px 0;">
            <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#1e3d5c;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
            <p style="color:#64748b;font-size:14px;">Loading notifications...</p>
        </div>
        <div id="notifList" style="display:none;"></div>
    `, `
        <button onclick="markAllNotifsRead()" id="markAllBtn" class="btn-secondary" style="flex:1;">Mark all read</button>
        <button onclick="closeModal()" class="btn-primary" style="flex:1;">Close</button>
    `);
    document.getElementById('modalFooter').style.display = 'flex';
    document.getElementById('modalFooter').style.gap = '10px';
    _loadNotifications();
}

async function _loadNotifications() {
    try {
        const response = await api.getNotifications();
        console.log('[Notifications] response:', response);
        const notifications = response.data?.notifications || response.data || response.notifications || [];
        _renderNotifications(notifications);
    } catch (err) {
        document.getElementById('notifLoadingState').innerHTML = `
            <p style="color:#dc2626;font-size:14px;text-align:center;padding:32px 0;">
                Failed to load notifications
            </p>`;
    }
}

function _renderNotifications(notifications) {
    const loading = document.getElementById('notifLoadingState');
    const list    = document.getElementById('notifList');
    if (loading) loading.style.display = 'none';
    if (!list) return;

    if (!notifications.length) {
        list.style.display = 'block';
        list.innerHTML = `
            <div style="text-align:center;padding:48px 0;">
                <div style="width:56px;height:56px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <p style="color:#64748b;font-size:14px;">No notifications yet</p>
            </div>`;
        return;
    }

    list.style.display = 'block';
    list.innerHTML = notifications.map(n => {
        const id       = n._id || n.id;
        const isRead   = n.isRead || n.read || false;
        const title    = n.title || n.subject || 'Notification';
        const message  = n.message || n.body || n.content || '';
        const time     = n.createdAt ? _timeAgoNotif(n.createdAt) : '';
        const typeIcon = _notifIcon(n.type || n.category || '');

        return `
        <div id="notif_${id}" onclick="readNotif('${id}', this)"
            style="display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #f1f5f9;cursor:pointer;
                   background:${isRead ? 'transparent' : '#f8faff'};border-radius:8px;padding:12px;margin-bottom:4px;transition:background .15s;">
            <div style="width:38px;height:38px;border-radius:50%;background:${isRead ? '#f1f5f9' : '#dbeafe'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${typeIcon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <p style="font-weight:${isRead ? '500' : '700'};color:#0f172a;font-size:14px;margin:0;">${title}</p>
                    ${!isRead ? '<span style="width:8px;height:8px;background:#2563eb;border-radius:50%;flex-shrink:0;"></span>' : ''}
                </div>
                <p style="color:#64748b;font-size:13px;margin:3px 0 0;line-height:1.4;">${message}</p>
                <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">${time}</p>
            </div>
        </div>`;
    }).join('');
}

function _notifIcon(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('success') || t.includes('credit') || t.includes('fund'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    if (t.includes('fail') || t.includes('error') || t.includes('debit'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    if (t.includes('warn') || t.includes('pending'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
}

function _timeAgoNotif(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60)    return 'Just now';
    if (s < 3600)  return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
}

async function readNotif(id, el) {
    if (!el.querySelector('span[style*="background:#2563eb"]')) return; // already read
    try {
        await api.markNotificationRead(id);
        el.style.background = 'transparent';
        const dot = el.querySelector('span[style*="background:#2563eb"]');
        if (dot) dot.remove();
        const title = el.querySelector('p');
        if (title) title.style.fontWeight = '500';
    } catch (e) { /* silent */ }
}

async function markAllNotifsRead() {
    const btn = document.getElementById('markAllBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Marking...'; }
    try {
        await api.markAllNotificationsRead();
        document.querySelectorAll('#notifList > div').forEach(el => {
            el.style.background = 'transparent';
            const dot = el.querySelector('span[style*="background:#2563eb"]');
            if (dot) dot.remove();
            const title = el.querySelector('p');
            if (title) title.style.fontWeight = '500';
        });
        if (btn) { btn.disabled = false; btn.textContent = 'All read ✓'; }
    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Mark all read'; }
    }
}

function showDevicesModal() {
    const bodyHTML = `
        <div class="device-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3d5c" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <div style="flex: 1;">
                <div><strong>Current Device</strong></div>
                <small style="color: #64748b;">Last active: Just now</small>
            </div>
            <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 12px; font-size: 12px; font-weight: 600;">Active</span>
        </div>
    `;
    
    showModal('Device Management', bodyHTML, '<button onclick="closeModal()" class="btn-primary" style="width: 100%;">Close</button>');
}

function showReferralModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const referralCode = user.referralCode || 'REF123456';
    
    const bodyHTML = `
        <div style="text-align: center;">
            <p style="color: #64748b; margin-bottom: 24px;">Share your referral code and earn rewards!</p>
            <div style="padding: 24px; background: #eff6ff; border-radius: 12px; margin-bottom: 24px;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Your Referral Code</p>
                <p style="font-size: 32px; font-weight: 700; color: #1e3d5c; letter-spacing: 2px;">${referralCode}</p>
            </div>
            <button onclick="copyReferralCode('${referralCode}')" class="btn-primary" style="width: 100%; margin-bottom: 24px;">
                Copy Code
            </button>
            <div style="text-align: left;">
                <p style="font-weight: 600; margin-bottom: 12px;">How it works:</p>
                <ul style="color: #64748b; padding-left: 20px;">
                    <li>Share your code with friends</li>
                    <li>They sign up using your code</li>
                    <li>You both get ₦500 bonus!</li>
                </ul>
            </div>
        </div>
    `;
    
    showModal('Referral Program', bodyHTML, '<button onclick="closeModal()" class="btn-secondary" style="width: 100%;">Close</button>');
}

function copyReferralCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showSuccess('Referral code copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy code');
    });
}

function showHelpModal() {
    const bodyHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="help-item">
                <strong>📞 Contact Support</strong>
                <p style="color: #64748b; margin-top: 4px;">support@yareemadata.com</p>
            </div>
            <div class="help-item">
                <strong>💬 Live Chat</strong>
                <p style="color: #64748b; margin-top: 4px;">Chat with our support team</p>
            </div>
            <div class="help-item">
                <strong>📖 FAQ</strong>
                <p style="color: #64748b; margin-top: 4px;">Find answers to common questions</p>
            </div>
        </div>
    `;
    
    showModal('Help & Support', bodyHTML, '<button onclick="closeModal()" class="btn-primary" style="width: 100%;">Close</button>');
}