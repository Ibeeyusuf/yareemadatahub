// NATIVE HTML MODALS - NO EXTERNAL DEPENDENCIES

// ==================== MODAL CORE ====================

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

document.addEventListener('DOMContentLoaded', createModalHTML);

function showModal(title, bodyHTML, footerHTML = '') {
    createModalHTML();
    const modal = document.getElementById('customModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalFooter').innerHTML = footerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==================== FEEDBACK HELPERS ====================

function showInlineError(message) {
    const existing = document.getElementById('inlineErrorMsg');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'inlineErrorMsg';
    el.style.cssText = `
        background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;
        padding:10px 14px;margin:0 0 12px;color:#dc2626;font-size:13px;
        font-weight:500;display:flex;align-items:flex-start;gap:8px;
        animation:fadeIn .15s ease;
    `;
    el.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
             stroke-width="2" style="flex-shrink:0;margin-top:1px;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style="flex:1;line-height:1.45;">${message}</span>
        <button onclick="this.parentElement.remove()"
            style="background:none;border:none;color:#dc2626;cursor:pointer;
                   font-size:16px;line-height:1;padding:0;flex-shrink:0;">×</button>
    `;

    const footer = document.getElementById('modalFooter');
    if (footer) footer.insertAdjacentElement('beforebegin', el);

    setTimeout(() => el.remove(), 6000);
}

function setSubmitLoading(loading, label = 'Processing...', originalLabel = null) {
    const btn = document.querySelector('#modalFooter .btn-primary');
    if (!btn) return;
    if (loading) {
        btn._originalLabel = btn.textContent;
        btn.disabled = true;
        btn.textContent = label;
        btn.style.opacity = '0.75';
    } else {
        btn.disabled = false;
        btn.textContent = originalLabel || btn._originalLabel || 'Submit';
        btn.style.opacity = '1';
    }
}

function showSuccess(message) {
    showModal('Success!', `
        <div style="text-align:center;padding:32px;">
            <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;
                        background:#dcfce7;display:flex;align-items:center;justify-content:center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                     stroke="#16a34a" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <p style="font-size:16px;color:#0f172a;">${message}</p>
        </div>
    `, `<button onclick="closeModal();window.location.reload();"
            class="btn-primary" style="width:100%;">OK</button>`);
}

function showError(message) {
    showModal('Error', `
        <div style="text-align:center;padding:32px;">
            <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;
                        background:#fee2e2;display:flex;align-items:center;justify-content:center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                     stroke="#dc2626" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <p style="font-size:16px;color:#0f172a;">${message}</p>
        </div>
    `, `<button onclick="closeModal()" class="btn-primary" style="width:100%;">Close</button>`);
}

// ==================== MAIN MODAL ROUTER ====================

function openModal(type) {
    const modalMap = {
        'data':            showDataModal,
        'airtime':         showAirtimeModal,
        'electricity':     showElectricityModal,
        'tv':              showTVModal,
        'education':       showEducationModal,
        'sms':             showSMSModal,
        'swap':            showSwapModal,
        'rechargepin':     showRechargePINModal,
        'remita':          showRemitaModal,
        'alpha':           showAlphaModal,
        'fund':            showFundModal,
        'transfer':        showTransferModal,
        'withdraw':        showWithdrawModal,
        'personaldetails': showPersonalDetailsModal,
        'editprofile':     showEditProfileModal,
        'security':        showSecurityModal,
        'notifications':   showNotificationsModal,
        'devices':         showDevicesModal,
        'referral':        showReferralModal,
        'help':            showHelpModal
    };
    if (modalMap[type]) modalMap[type]();
    else showError('Service not available. Please try again later.');
}

// ==================== DATA MODAL ====================

let selectedNetwork = 'mtn';
let currentDataPlans = [];
let selectedDataType = null;
const dataTypesCache = {};
const dataPlansCache = {};
const dataPlansPromises = {};

async function showDataModal() {
    selectedNetwork = 'mtn';
    currentDataPlans = [];
    selectedDataType = null;

    showModal('Buy Data', `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn active" data-network="mtn"
                    onclick="selectDataNetwork('mtn')"
                    style="background:#FFCC00;color:#000;">MTN</button>
                <button type="button" class="network-btn" data-network="airtel"
                    onclick="selectDataNetwork('airtel')"
                    style="background:#FF0000;color:#fff;">Airtel</button>
                <button type="button" class="network-btn" data-network="glo"
                    onclick="selectDataNetwork('glo')"
                    style="background:#00C300;color:#fff;">Glo</button>
                <button type="button" class="network-btn" data-network="9mobile"
                    onclick="selectDataNetwork('9mobile')"
                    style="background:#006400;color:#fff;">9mobile</button>
            </div>
        </div>
        <div class="form-group" id="dataTypeGroup">
            <label>Data Type</label>
            <div id="dataTypeGrid" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;">
                <span style="color:#94a3b8;font-size:13px;line-height:36px;">Loading types...</span>
            </div>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="dataPhone" placeholder="08012345678"
                   maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <select id="dataPlan" class="form-input" disabled>
                <option value="">Choose a data type first...</option>
            </select>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="dataPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitDataPurchase()" class="btn-primary">Purchase Data</button>
    `);

    await loadDataTypes('mtn');
}

function selectDataNetwork(network) {
    selectedNetwork = network;
    selectedDataType = null;
    currentDataPlans = [];

    document.querySelectorAll('.network-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.network === 'mtn')     btn.style.cssText = 'background:#FFCC00;color:#000;';
        if (btn.dataset.network === 'airtel')  btn.style.cssText = 'background:#FF0000;color:#fff;';
        if (btn.dataset.network === 'glo')     btn.style.cssText = 'background:#00C300;color:#fff;';
        if (btn.dataset.network === '9mobile') btn.style.cssText = 'background:#006400;color:#fff;';
    });
    const selectedBtn = document.querySelector(`[data-network="${network}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
        selectedBtn.style.cssText += ';border:3px solid white;box-shadow:0 0 0 2px #1e3d5c;';
    }

    // Reset plan dropdown
    const planSelect = document.getElementById('dataPlan');
    if (planSelect) {
        planSelect.innerHTML = '<option value="">Choose a data type first...</option>';
        planSelect.disabled = true;
    }

    // Reset type grid to loading state
    const typeGrid = document.getElementById('dataTypeGrid');
    if (typeGrid) typeGrid.innerHTML = '<span style="color:#94a3b8;font-size:13px;line-height:36px;">Loading types...</span>';

    loadDataTypes(network);
}

async function loadDataTypes(network) {
    const typeGrid = document.getElementById('dataTypeGrid');

    try {
        const networkKey = network.toLowerCase();
        const response = dataTypesCache[networkKey] || await api.getDataPlans(network);
        dataTypesCache[networkKey] = response;
        const types = response.availableDataTypes;

        if (!typeGrid) return;
        if (selectedNetwork !== networkKey) return;

        if (!types || !types.length) {
            typeGrid.innerHTML = '<span style="color:#dc2626;font-size:13px;">No data types available for this network</span>';
            return;
        }

        // Render pill buttons — user must pick one before plans load
        typeGrid.innerHTML = types.map(type => `
            <button type="button"
                class="data-type-btn"
                data-type="${type}"
                onclick="selectDataType('${type}')"
                style="padding:7px 16px;border:2px solid #e2e8f0;border-radius:20px;
                       background:white;color:#64748b;font-size:13px;font-weight:600;
                       cursor:pointer;text-transform:capitalize;">
                ${type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
        `).join('');
        preloadDataPlans(networkKey, types);

    } catch (error) {
        console.error('loadDataTypes error:', error);
        const message = error.message && error.message.includes('timed out')
            ? 'Request timed out. Please check your connection and try again.'
            : 'Failed to load data types. Please retry.';
        if (typeGrid) typeGrid.innerHTML = `<span style="color:#dc2626;font-size:13px;">${message}</span>`;
    }
}

function getDataPlansCacheKey(network, dataType) {
    return `${network.toLowerCase()}::${String(dataType).toLowerCase()}`;
}

function dataPlanSizeInMB(plan) {
    const text = String(plan.size || plan.dataAmount || plan.PRODUCT_NAME || plan.planName || plan.name || '').toUpperCase();
    const match = text.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/);
    if (!match) return Number.POSITIVE_INFINITY;
    const value = Number(match[1]);
    return match[2] === 'TB' ? value * 1024 * 1024 : match[2] === 'GB' ? value * 1024 : value;
}

function sortDataPlans(plans) {
    // Aggregators sometimes list the same plan twice (duplicate SKUs across
    // upstream routes/providers) with identical name + price. Keep only the
    // first occurrence of each so the dropdown doesn't show repeats.
    const seen = new Set();
    const deduped = plans.filter(plan => {
        const name   = String(plan.PRODUCT_NAME || plan.planName || plan.name || '').trim().toLowerCase();
        const amount = Number(plan.PRODUCT_AMOUNT ?? plan.sellingPrice ?? plan.price ?? plan.amount ?? 0);
        const key = `${name}|${amount}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return [...deduped].sort((left, right) => {
        const leftPrice = Number(left.PRODUCT_AMOUNT ?? left.sellingPrice ?? left.price ?? left.amount ?? 0);
        const rightPrice = Number(right.PRODUCT_AMOUNT ?? right.sellingPrice ?? right.price ?? right.amount ?? 0);
        const priceDifference = leftPrice - rightPrice;
        return priceDifference || dataPlanSizeInMB(left) - dataPlanSizeInMB(right);
    });
}

function normalizeDataPlansResponse(response, network) {
    let plans = [];
    if (Array.isArray(response.data)) {
        plans = response.data.filter(p => (p.price || p.PRODUCT_AMOUNT || p.sellingPrice) > 0);
    } else if (response.data && Array.isArray(response.data[network.toLowerCase()])) {
        plans = response.data[network.toLowerCase()].filter(p => p.price > 0);
    } else if (response.data?.MOBILE_NETWORK) {
        const nelloKey = { mtn:'MTN', glo:'Glo', '9mobile':'m_9mobile', airtel:'Airtel' }[network.toLowerCase()] || network;
        const nd = response.data.MOBILE_NETWORK[nelloKey];
        if (Array.isArray(nd) && nd[0]?.PRODUCT)
            plans = nd[0].PRODUCT.map(p => ({ id: p.PRODUCT_ID, planName: p.PRODUCT_NAME, price: p.PRODUCT_AMOUNT }));
    }
    return sortDataPlans(plans);
}

function getCachedDataPlans(network, dataType) {
    const key = getDataPlansCacheKey(network, dataType);
    if (dataPlansCache[key]) return Promise.resolve(dataPlansCache[key]);
    if (!dataPlansPromises[key]) {
        dataPlansPromises[key] = api.getDataPlans(network, dataType)
            .then(response => {
                const plans = normalizeDataPlansResponse(response, network);
                dataPlansCache[key] = plans;
                return plans;
            })
            .finally(() => {
                delete dataPlansPromises[key];
            });
    }
    return dataPlansPromises[key];
}

function preloadDataPlans(network, types) {
    types.forEach(type => getCachedDataPlans(network, type).catch(() => null));
}

async function selectDataType(type) {
    selectedDataType = type;
    currentDataPlans = [];

    // Update pill button styles
    document.querySelectorAll('.data-type-btn').forEach(btn => {
        const active = btn.dataset.type === type;
        btn.style.cssText = active
            ? 'padding:7px 16px;border:2px solid #1e3d5c;border-radius:20px;background:#1e3d5c;color:white;font-size:13px;font-weight:600;cursor:pointer;text-transform:capitalize;'
            : 'padding:7px 16px;border:2px solid #e2e8f0;border-radius:20px;background:white;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;text-transform:capitalize;';
    });

    // Show loading state in dropdown while fetching
    const planSelect = document.getElementById('dataPlan');
    if (planSelect) {
        planSelect.innerHTML = '<option value="">Loading plans...</option>';
        planSelect.disabled = true;
    }

    await loadDataPlans(selectedNetwork, type);
}

async function loadDataPlans(network, dataType) {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;

    try {
        const plans = await getCachedDataPlans(network, dataType);
        if (selectedNetwork !== network.toLowerCase() || selectedDataType !== dataType) return;

        currentDataPlans = plans;

        if (!plans.length) {
            planSelect.innerHTML = '<option value="">No plans available for this type</option>';
            planSelect.disabled = true;
            return;
        }

        planSelect.disabled = false;
        planSelect.innerHTML = '<option value="">Choose a plan</option>' +
            plans.map((plan, i) => {
                const name   = plan.PRODUCT_NAME || plan.planName || plan.name || 'Data Plan';
                const amount = plan.PRODUCT_AMOUNT || plan.sellingPrice || plan.price || 0;
                return `<option value="${i}">${name} — ₦${Math.round(Number(amount)).toLocaleString()}</option>`;
            }).join('');

    } catch (error) {
        planSelect.innerHTML = '<option value="">Failed to load plans. Please try again.</option>';
        planSelect.disabled = true;
    }
}

async function submitDataPurchase() {
    const phone     = document.getElementById('dataPhone').value.trim();
    const planIndex = document.getElementById('dataPlan').value;
    const pin       = document.getElementById('dataPin').value.trim();

    if (!phone || !/^\d{11}$/.test(phone))                { showInlineError('Please enter a valid 11-digit phone number'); return; }
    if (planIndex === '' || planIndex === null)            { showInlineError('Please select a data plan'); return; }
    if (!currentDataPlans || !currentDataPlans.length)    { showInlineError('No plans loaded. Please close and try again.'); return; }
    const selectedPlan = currentDataPlans[planIndex];
    if (!selectedPlan)                                    { showInlineError('Invalid plan selected. Please try again.'); return; }
    const amount = selectedPlan.PRODUCT_AMOUNT || selectedPlan.sellingPrice || selectedPlan.price || 0;
    if (!amount || amount <= 0)                           { showInlineError('Could not determine plan amount. Please try again.'); return; }
    const rawId  = selectedPlan.PRODUCT_ID || selectedPlan.planId || selectedPlan.planCode || selectedPlan._id || selectedPlan.id;
    if (!rawId)                                           { showInlineError('Could not identify selected plan. Please try again.'); return; }
    const planId = String(rawId).replace(/\.0$/, '');
    if (!pin || !/^\d{4}$/.test(pin))                     { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    setSubmitLoading(true, 'Purchasing...');
    try {
        await api.purchaseData(phone, selectedNetwork, planId, pin, amount);
        closeModal();
        setTimeout(() => {
            const planName = selectedPlan.PRODUCT_NAME || selectedPlan.planName || 'Data';
            showSuccess(`${planName} purchased successfully for ${phone}! ✅<br>Amount: ₦${Math.round(Number(amount)).toLocaleString()}`);
        }, 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Purchase Data');
        showInlineError(error.message || 'Purchase failed. Please try again.');
    }
}

// ==================== AIRTIME MODAL ====================

function showAirtimeModal() {
    showModal('Buy Airtime', `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn-air active" data-network="mtn"
                    onclick="selectAirtimeNetwork('mtn')"
                    style="background:#FFCC00;color:#000;">MTN</button>
                <button type="button" class="network-btn-air" data-network="airtel"
                    onclick="selectAirtimeNetwork('airtel')"
                    style="background:#FF0000;color:#fff;">Airtel</button>
                <button type="button" class="network-btn-air" data-network="glo"
                    onclick="selectAirtimeNetwork('glo')"
                    style="background:#00C300;color:#fff;">Glo</button>
                <button type="button" class="network-btn-air" data-network="9mobile"
                    onclick="selectAirtimeNetwork('9mobile')"
                    style="background:#006400;color:#fff;">9mobile</button>
            </div>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="airtimePhone" placeholder="08012345678"
                   maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" id="airtimeAmount" placeholder="Enter amount (min ₦50)"
                   min="50" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="airtimePin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitAirtimePurchase()" class="btn-primary">Purchase Airtime</button>
    `);
    window.selectedAirtimeNetwork = 'mtn';
}

function selectAirtimeNetwork(network) {
    window.selectedAirtimeNetwork = network;
    document.querySelectorAll('.network-btn-air').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.network-btn-air[data-network="${network}"]`);
    if (btn) btn.classList.add('active');
}

async function submitAirtimePurchase() {
    const phone  = document.getElementById('airtimePhone').value.trim();
    const amount = parseInt(document.getElementById('airtimeAmount').value);
    const pin    = document.getElementById('airtimePin').value.trim();

    if (!pin || !/^\d{4}$/.test(pin))      { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    if (!phone || phone.length !== 11)     { showInlineError('Please enter a valid 11-digit phone number'); return; }
    if (!amount || amount < 50)            { showInlineError('Amount must be at least ₦50'); return; }

    setSubmitLoading(true, 'Purchasing...');
    try {
        await api.purchaseAirtime(phone, window.selectedAirtimeNetwork, amount, pin);
        closeModal();
        setTimeout(() => showSuccess(`
            <div style="text-align:center;">
                <p style="font-size:16px;margin-bottom:8px;">Airtime Purchase Successful! 📱</p>
                <p style="font-size:14px;color:#64748b;">₦${amount} airtime sent to ${phone}</p>
            </div>
        `), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Purchase Airtime');
        showInlineError(error.message || 'Airtime purchase failed. Please try again.');
    }
}

// ==================== ELECTRICITY MODAL ====================
// ==================== ELECTRICITY MODAL ====================

let _elecVerified = null;

async function showElectricityModal() {
    _elecVerified = null;
    showModal('Pay Electricity', `
        <div id="elecStep1">
            <div class="form-group">
                <label>Select Disco</label>
                <select id="electricityDisco" class="form-input">
                    <option value="">Loading discos...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Meter Type</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <button type="button" id="prepaidBtn" onclick="selectMeterType('prepaid')"
                        style="padding:12px;border:2px solid #1e3d5c;border-radius:8px;
                               background:#1e3d5c;color:white;font-weight:600;cursor:pointer;">
                        Prepaid
                    </button>
                    <button type="button" id="postpaidBtn" onclick="selectMeterType('postpaid')"
                        style="padding:12px;border:2px solid #e2e8f0;border-radius:8px;
                               background:white;color:#64748b;font-weight:600;cursor:pointer;">
                        Postpaid
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Meter Number</label>
                <input type="text" id="meterNumber" placeholder="Enter meter number" class="form-input">
            </div>
        </div>
        <div id="elecStep2" style="display:none;">
            <div id="elecCustomerInfo"
                 style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;
                        padding:14px;margin-bottom:16px;"></div>
            <div class="form-group">
                <label>Amount (₦)</label>
                <input type="number" id="electricityAmount" placeholder="Min ₦500"
                       min="500" class="form-input">
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="electricityPhone" placeholder="08012345678"
                       maxlength="11" class="form-input">
            </div>
            <div class="form-group">
                <label>Transaction PIN</label>
                <input type="password" id="electricityPin" placeholder="Enter 4-digit PIN"
                       maxlength="4" class="form-input">
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="elecPrimaryBtn" onclick="handleElectricityStep()" class="btn-primary">Verify Meter</button>
    `);
    window._elecMeterType = 'prepaid';
    await loadElectricityDiscos();
}

async function loadElectricityDiscos() {
    const select = document.getElementById('electricityDisco');
    if (!select) return;
    
    try {
        const response = await api.getElectricityDiscos();
        console.log('Full API response:', response);
        
        // Extract discos from the response structure
        let discos = [];
        if (response.data?.discos) {
            discos = response.data.discos;
        } else if (response.discos) {
            discos = response.discos;
        } else if (response.data?.data?.discos) {
            discos = response.data.data.discos;
        }
        
        console.log('Extracted discos:', discos);
        
        if (!discos || !discos.length) {
            select.innerHTML = '<option value="">No discos available</option>';
            return;
        }
        
        // Build options - use 'key' as the value (e.g., "ekedc") and 'name' as display text
        select.innerHTML = '<option value="">Select Disco</option>';
        
        discos.forEach(disco => {
            // The value should be the 'key' field (e.g., "ekedc", "ikedc", etc.)
            const value = disco.key || disco.serviceID || disco.code || disco.id;
            const name = disco.name || disco.displayName;
            
            if (value && name) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = name;
                select.appendChild(option);
                console.log(`Added disco: value="${value}", name="${name}"`);
            }
        });
        
        console.log('Final select HTML:', select.innerHTML);
        
    } catch (error) {
        console.error('Failed to load discos:', error);
        select.innerHTML = '<option value="">Failed to load discos. Please retry.</option>';
        showInlineError('Could not load electricity providers. Please try again.');
    }
}

function selectMeterType(type) {
    window._elecMeterType = type;
    const active = 'padding:12px;border:2px solid #1e3d5c;border-radius:8px;background:#1e3d5c;color:white;font-weight:600;cursor:pointer;';
    const inactive = 'padding:12px;border:2px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-weight:600;cursor:pointer;';
    
    const prepaidBtn = document.getElementById('prepaidBtn');
    const postpaidBtn = document.getElementById('postpaidBtn');
    
    if (prepaidBtn) prepaidBtn.style.cssText = type === 'prepaid' ? active : inactive;
    if (postpaidBtn) postpaidBtn.style.cssText = type === 'postpaid' ? active : inactive;
}

async function handleElectricityStep() {
    if (!_elecVerified) {
        await verifyMeterNumber();
    } else {
        await submitElectricityPayment();
    }
}

async function verifyMeterNumber() {
    const discoSelect = document.getElementById('electricityDisco');
    const disco = discoSelect?.value;
    const meter = document.getElementById('meterNumber').value.trim();
    const meterType = window._elecMeterType || 'prepaid';
    
    console.log('Verifying meter - Selected disco value:', disco);
    console.log('Selected disco text:', discoSelect?.options[discoSelect.selectedIndex]?.text);
    console.log('Meter number:', meter);
    console.log('Meter type:', meterType);
    
    if (!disco || disco === '') { 
        showInlineError('Please select a disco'); 
        return; 
    }
    if (!meter) { 
        showInlineError('Please enter meter number'); 
        return; 
    }
    
    const btn = document.getElementById('elecPrimaryBtn');
    btn.disabled = true;
    btn.textContent = 'Verifying...';
    
    try {
        const response = await api.verifyElectricityCustomer(meter, disco, meterType);
        console.log('Verification response:', response);
        
        const d = response.data || response;
        
        // Check for errors in response
        if (d.status === 'error' || d.error) {
            btn.disabled = false;
            btn.textContent = 'Verify Meter';
            showInlineError(d.message || d.error || 'Verification failed. Please try again.');
            return;
        }
        
        // Extract customer information from the response structure
        let customerName = null;
        let customerAddress = null;
        let minimumAmount = null;
        
        // Try to get customer info from raw.data.content (pluginng response structure)
        if (d.raw?.data?.content) {
            const content = d.raw.data.content;
            customerName = content.Customer_Name || content.customerName || content.name;
            customerAddress = content.Address || content.address;
            minimumAmount = content.Minimum_Amount || content.minAmount;
        }
        
        // If not found, try other common response structures
        if (!customerName) {
            customerName = d.customerName || d.customer?.name || d.customer?.customerName;
            customerAddress = d.customerAddress || d.customer?.address;
        }
        
        // Check if customer name is null/undefined/N/A
        if (!customerName || customerName === 'N/A' || customerName === null) {
            btn.disabled = false;
            btn.textContent = 'Verify Meter';
            showInlineError('Meter number not found. Please check the number and selected disco.');
            return;
        }
        
        // Store verified data
        _elecVerified = { 
            meter: meter, 
            disco: disco,
            meterType: meterType, 
            customerName: customerName,
            customerAddress: customerAddress,
            minimumAmount: minimumAmount
        };
        
        console.log('Stored verified data:', _elecVerified);
        
        // Display customer info
        const infoDiv = document.getElementById('elecCustomerInfo');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;background:#16a34a;border-radius:50%;
                                display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                        <p style="font-weight:700;color:#15803d;font-size:14px;">${escapeHtml(customerName)}</p>
                        ${customerAddress ? `<p style="color:#64748b;font-size:12px;">${escapeHtml(customerAddress)}</p>` : ''}
                        <p style="color:#64748b;font-size:12px;">
                            Meter: ${escapeHtml(meter)} · ${meterType.charAt(0).toUpperCase() + meterType.slice(1)}
                        </p>
                        ${minimumAmount ? `<p style="color:#f59e0b;font-size:11px;margin-top:4px;">Min. Amount: ₦${minimumAmount.toLocaleString()}</p>` : ''}
                    </div>
                </div>
            `;
        }
        
        // If there's a minimum amount, set it as placeholder or default
        if (minimumAmount && minimumAmount > 0) {
            const amountInput = document.getElementById('electricityAmount');
            if (amountInput) {
                amountInput.placeholder = `Min ₦${minimumAmount.toLocaleString()}`;
                amountInput.min = minimumAmount;
            }
        }
        
        // Show step 2, hide step 1
        const step1 = document.getElementById('elecStep1');
        const step2 = document.getElementById('elecStep2');
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';
        
        btn.disabled = false;
        btn.textContent = 'Pay Now';
        
        const amountInput = document.getElementById('electricityAmount');
        if (amountInput) amountInput.focus();
        
    } catch (error) {
        console.error('Verification error:', error);
        btn.disabled = false;
        btn.textContent = 'Verify Meter';
        showInlineError(error.message || 'Could not verify meter. Please check the number and try again.');
    }
}

async function submitElectricityPayment() {
    // Validate that we have verified data
    if (!_elecVerified) {
        showInlineError('Please verify meter number first');
        return;
    }
    
    const amount = parseInt(document.getElementById('electricityAmount')?.value);
    const phone = document.getElementById('electricityPhone')?.value.trim();
    const pin = document.getElementById('electricityPin')?.value.trim();
    
    console.log('Submitting payment - Verified data:', _elecVerified);
    console.log('Amount:', amount);
    console.log('Phone:', phone);
    
    // Check minimum amount if provided
    if (_elecVerified.minimumAmount && amount < _elecVerified.minimumAmount) {
        showInlineError(`Minimum amount is ₦${_elecVerified.minimumAmount.toLocaleString()}`); 
        return;
    }
    
    if (!amount || amount < 500) { 
        showInlineError('Amount must be at least ₦500'); 
        return; 
    }
    if (!phone || phone.length !== 11) { 
        showInlineError('Please enter a valid 11-digit phone number'); 
        return; 
    }
    if (!pin || !/^\d{4}$/.test(pin)) { 
        showInlineError('Please enter your 4-digit transaction PIN'); 
        return; 
    }
    
    const btn = document.getElementById('elecPrimaryBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    try {
        // Make sure disco is not undefined
        if (!_elecVerified.disco || _elecVerified.disco === 'undefined') {
            throw new Error('Invalid disco selection. Please go back and select a disco again.');
        }
        
        // Prepare the payload according to the sample
        const payload = {
            disco: _elecVerified.disco,
            meterNumber: _elecVerified.meter,
            meterType: _elecVerified.meterType,
            amount: amount,
            phoneNumber: phone,
            transactionPin: pin
        };
        
        console.log('Sending payload:', payload);
        
        const response = await api.purchaseElectricity(
            _elecVerified.meter,
            _elecVerified.disco,
            amount,
            phone,
            pin,
            _elecVerified.meterType
        );
        
        console.log('Purchase response:', response);
        
        // Extract token from response (could be in different places)
        let token = '';
        if (response.data?.token) {
            token = response.data.token;
        } else if (response.data?.purchasedToken) {
            token = response.data.purchasedToken;
        } else if (response.token) {
            token = response.token;
        } else if (response.data?.raw?.data?.content?.Token) {
            token = response.data.raw.data.content.Token;
        } else if (response.data?.raw?.data?.token) {
            token = response.data.raw.data.token;
        }
        
        closeModal();
        
        setTimeout(() => {
            showSuccess(`
                <div style="text-align:center;">
                    <p style="font-size:16px;margin-bottom:6px;">Payment Successful! 💡</p>
                    <p style="font-size:14px;color:#64748b;">
                        ₦${amount.toLocaleString()} credited to meter ${_elecVerified.meter}
                    </p>
                    <p style="font-size:12px;color:#64748b;margin-top:4px;">
                        Customer: ${escapeHtml(_elecVerified.customerName)}
                    </p>
                    ${token ? `
                    <div style="margin-top:12px;padding:10px;background:#f0fdf4;border-radius:8px;">
                        <p style="font-size:11px;color:#64748b;margin-bottom:4px;">TOKEN</p>
                        <p style="font-size:18px;font-weight:700;color:#15803d;letter-spacing:2px;">${escapeHtml(token)}</p>
                        <button onclick="copyToClipboard('${escapeHtml(token)}')" 
                            style="margin-top:8px;padding:4px 12px;background:#16a34a;color:white;
                                   border:none;border-radius:4px;cursor:pointer;font-size:11px;">
                            Copy Token
                        </button>
                    </div>` : ''}
                </div>
            `);
        }, 300);
        
    } catch (error) {
        console.error('Payment error:', error);
        btn.disabled = false;
        btn.textContent = 'Pay Now';
        showInlineError(error.message || 'Payment failed. Please try again.');
    }
}

// Helper function to copy token to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess('Token copied to clipboard!');
    }).catch(() => {
        showInlineError('Failed to copy token');
    });
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==================== TV MODAL ====================

let tvPlans = [];

async function showTVModal() {
    tvPlans = [];
    showModal('Cable TV Subscription', `
        <div class="form-group">
            <label>Select Provider</label>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px;">
                <button type="button" class="tv-provider-btn" data-provider="dstv"
                    onclick="selectTVProvider('dstv')"
                    style="padding:10px 6px;border:2px solid #1e3d5c;border-radius:8px;
                           background:#1e3d5c;color:white;font-weight:700;font-size:13px;cursor:pointer;">
                    DSTV
                </button>
                <button type="button" class="tv-provider-btn" data-provider="gotv"
                    onclick="selectTVProvider('gotv')"
                    style="padding:10px 6px;border:2px solid #e2e8f0;border-radius:8px;
                           background:white;color:#64748b;font-weight:700;font-size:13px;cursor:pointer;">
                    GOTV
                </button>
                <button type="button" class="tv-provider-btn" data-provider="startimes"
                    onclick="selectTVProvider('startimes')"
                    style="padding:10px 6px;border:2px solid #e2e8f0;border-radius:8px;
                           background:white;color:#64748b;font-weight:700;font-size:13px;cursor:pointer;">
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
            <div id="tvPlanPrice"
                 style="display:none;margin-top:6px;padding:8px 12px;background:#f0fdf4;
                        border-radius:6px;color:#15803d;font-size:13px;font-weight:600;"></div>
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
            <input type="password" id="tvPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitTVSubscription()" class="btn-primary">Subscribe</button>
    `);
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
        let plans = [];
        if (response.data?.TV_ID) {
            const providerMap = { dstv:'DStv', gotv:'GOtv', startimes:'Startimes', showmax:'Showmax' };
            const key = providerMap[provider.toLowerCase()];
            if (key && response.data.TV_ID[key]) {
                const d = response.data.TV_ID[key];
                if (Array.isArray(d) && d[0]?.PRODUCT) plans = d[0].PRODUCT;
            }
        }
        if (!plans.length) {
            const cableData = response.data?.CABLE_TV || response.data?.cable || response.data?.plans;
            if (cableData) {
                const pd = cableData[provider.toUpperCase()] || cableData[provider] || cableData[provider.toLowerCase()];
                if (Array.isArray(pd) && pd[0]?.PRODUCT) plans = pd[0].PRODUCT;
                else if (Array.isArray(pd)) plans = pd;
            }
        }
        if (!plans.length && Array.isArray(response.data)) plans = response.data;
        tvPlans = plans;
        if (plans.length > 0) {
            planSelect.innerHTML = '<option value="">Choose package</option>' +
                plans.map((plan, idx) => {
                    const name   = plan.PACKAGE_NAME || plan.PRODUCT_NAME || plan.planName || plan.name || 'Package';
                    const amount = plan.PACKAGE_AMOUNT || plan.PRODUCT_AMOUNT || plan.sellingPrice || plan.price || plan.amount || 0;
                    const planId = plan.PACKAGE_ID || plan.PRODUCT_CODE || plan.planCode || plan._id || plan.id || plan.planId;
                    return `<option value="${idx}" data-amount="${Math.round(Number(amount))}" data-plan-id="${planId}">
                        ${name} — ₦${Math.round(Number(amount)).toLocaleString()}
                    </option>`;
                }).join('');
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
        if (planSelect) planSelect.innerHTML = '<option value="">Failed to load packages. Please try again.</option>';
    }
}

async function submitTVSubscription() {
    const provider  = window._tvProvider || 'dstv';
    const smartCard = document.getElementById('smartCard').value.trim();
    const planIdx   = document.getElementById('tvPlan').value;
    const months    = parseInt(document.getElementById('tvMonths').value) || 1;
    const pin       = document.getElementById('tvPin').value.trim();

    if (!smartCard)                         { showInlineError('Please enter smart card / IUC number'); return; }
    if (planIdx === '' || planIdx === null)  { showInlineError('Please select a package'); return; }
    if (!tvPlans.length)                    { showInlineError('No packages loaded. Please try again.'); return; }
    if (!pin || !/^\d{4}$/.test(pin))       { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    const plan = tvPlans[planIdx];
    if (!plan) { showInlineError('Invalid package selected'); return; }
    const planId = plan.PACKAGE_ID || plan.PRODUCT_CODE || plan.planCode || plan._id || plan.id || plan.planId;
    if (!planId) { showInlineError('Could not identify selected package. Please try again.'); return; }

    setSubmitLoading(true, 'Subscribing...');
    try {
        await api.purchaseCableTV(smartCard, provider, planId, months, pin);
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
        setSubmitLoading(false, '', 'Subscribe');
        showInlineError(error.message || 'Subscription failed. Please try again.');
    }
}

// ==================== EDUCATION MODAL ====================

function showEducationModal() {
    showModal('Education PIN', `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;
                    padding:12px 14px;margin-bottom:16px;">
            <p style="color:#1d4ed8;font-size:13px;margin:0;">
                📚 Scratch cards will be sent to your registered email address after purchase.
            </p>
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
        <div id="eduPriceTag"
             style="display:none;padding:10px 14px;background:#f0fdf4;border-radius:8px;
                    margin-bottom:4px;color:#15803d;font-size:13px;font-weight:600;"></div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="eduPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitEducationPurchase()" class="btn-primary">Purchase</button>
    `);
}

const EDU_PRICES = { waecdirect: 3800, neco: 1000, jamb: 700, nabteb: 900 };

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

    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    if (!quantity || quantity < 1)    { showInlineError('Please select a valid quantity'); return; }

    const examLabels = { waecdirect: 'WAEC', neco: 'NECO', jamb: 'JAMB', nabteb: 'NABTEB' };
    const label = examLabels[examType] || examType.toUpperCase();

    setSubmitLoading(true, 'Purchasing...');
    try {
        await api.purchaseEducationPIN(examType, quantity, pin);
        closeModal();
        setTimeout(() => showSuccess(`
            <div style="text-align:center;">
                <p style="font-size:16px;margin-bottom:6px;">Purchase Successful! 📚</p>
                <p style="font-size:14px;color:#64748b;">
                    ${quantity} × ${label} PIN${quantity > 1 ? 's' : ''} purchased
                </p>
                <p style="font-size:13px;color:#94a3b8;margin-top:6px;">
                    Check your email for the scratch card(s)
                </p>
            </div>
        `), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Purchase');
        showInlineError(error.message || 'Purchase failed. Please try again.');
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
            <input type="password" id="pinTxPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitRechargePIN()" class="btn-primary">Purchase PIN</button>
    `);
}

async function submitRechargePIN() {
    const network  = document.getElementById('pinNetwork').value;
    const amount   = document.getElementById('pinType').value;
    const quantity = parseInt(document.getElementById('pinQuantity').value);
    const pin      = document.getElementById('pinTxPin').value.trim();

    if (!pin || !/^\d{4}$/.test(pin))       { showInlineError('Please enter your valid 4-digit transaction PIN'); return; }
    if (!quantity || quantity < 1 || quantity > 10) { showInlineError('Please enter a valid quantity (1–10)'); return; }

    setSubmitLoading(true, 'Purchasing...');
    try {
        const response = await api.purchaseRechargePIN(network, amount, quantity, pin);
        const pins = response.data?.pins || [];
        const ref  = response.data?.reference || response.data?.orderId || '';

        closeModal();
        setTimeout(() => {
            if (pins.length === 0) {
                showSuccess(`
                    <div style="text-align:center;">
                        <p style="font-size:16px;margin-bottom:6px;">Purchase Successful! 🔐</p>
                        <p style="font-size:14px;color:#64748b;">
                            ${quantity} × ₦${amount} ${network.toUpperCase()} PIN${quantity > 1 ? 's' : ''}
                        </p>
                        <p style="font-size:13px;color:#94a3b8;margin-top:6px;">PINs have been sent to your email</p>
                        ${ref ? `<p style="font-size:11px;color:#cbd5e1;margin-top:4px;">Ref: ${ref}</p>` : ''}
                    </div>
                `);
                return;
            }

            const pinCards = pins.map((p, i) => `
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                            padding:12px 14px;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <p style="font-size:11px;color:#94a3b8;margin:0 0 3px;">
                                PIN ${i + 1} · ${p.mobilenetwork || network.toUpperCase()} · ₦${p.amount || amount}
                            </p>
                            <p style="font-size:20px;font-weight:700;color:#1e3d5c;
                                      letter-spacing:3px;margin:0;" id="rpin_${i}">${p.pin}</p>
                            ${p.sno ? `<p style="font-size:10px;color:#cbd5e1;margin:4px 0 0;">S/N: ${p.sno}</p>` : ''}
                        </div>
                        <button onclick="copyPinToClipboard('rpin_${i}', this)"
                            style="background:#1e3d5c;color:white;border:none;padding:6px 12px;
                                   border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;
                                   white-space:nowrap;flex-shrink:0;margin-left:10px;">
                            Copy
                        </button>
                    </div>
                </div>
            `).join('');

            showModal('🔐 Recharge PINs', `
                <div>
                    <div style="background:#dcfce7;border:1px solid #bbf7d0;border-radius:10px;
                                padding:10px 14px;margin-bottom:14px;
                                display:flex;align-items:center;gap:8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="#16a34a" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style="color:#15803d;font-size:13px;font-weight:600;">
                            ${pins.length} × ₦${amount} ${network.toUpperCase()}
                            PIN${pins.length > 1 ? 's' : ''} purchased
                        </span>
                    </div>
                    ${pinCards}
                    ${ref ? `<p style="font-size:11px;color:#cbd5e1;text-align:center;margin-top:8px;">Ref: ${ref}</p>` : ''}
                </div>
            `, `<button onclick="closeModal()" class="btn-primary" style="width:100%;">Done</button>`);
        }, 300);

    } catch (error) {
        setSubmitLoading(false, '', 'Purchase PIN');
        showInlineError(error.message || 'Purchase failed. Please try again.');
    }
}

function copyPinToClipboard(elemId, btn) {
    const pin = document.getElementById(elemId)?.textContent?.trim();
    if (!pin) return;
    navigator.clipboard.writeText(pin).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = '#16a34a';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = '#1e3d5c'; }, 2000);
    });
}

// ==================== AIRTIME2CASH MODAL (3-step: OTP -> verify -> convert) ====================
// Networks: MTN and Airtel only.

let _a2c = { network: 'mtn', phone: '', amount: 0, identifier: null, balance: null, limits: null, skipOtp: false };

async function showSwapModal() {
    _a2c = { network: 'mtn', phone: '', amount: 0, identifier: null, balance: null, limits: null, skipOtp: false };
    showModal('Airtime to Cash', `
        <div style="text-align:center;padding:32px 0;">
            <p style="font-size:13px;color:#64748b;">Loading network limits...</p>
        </div>
    `, '');
    try {
        const res = await api.getAirtimeToCashLimits();
        _a2c.limits = res.data || res;
    } catch (e) {
        _a2c.limits = null; // still let them try even if this call fails
    }
    renderA2CStepDetails();
}

function a2cLimitFor(network) {
    const l = _a2c.limits;
    if (!l) return null;
    return l[network] || l[(network || '').toUpperCase()] || l[(network || '').toLowerCase()] || null;
}

function a2cLimitHint(network) {
    const lim = a2cLimitFor(network);
    return lim ? `Min ₦${lim.min.toLocaleString()} — Max ₦${lim.max.toLocaleString()}` : 'Enter amount';
}

function renderA2CStepDetails() {
    showModal('Airtime to Cash', `
        <p style="font-size:12px;color:#94a3b8;margin:-4px 0 16px;">Step 1 of 3 — Details</p>
        <div class="form-group">
            <label>Network</label>
            <select id="a2cNetwork" class="form-input" onchange="onA2CNetworkChange()">
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
            </select>
        </div>
        <div class="form-group">
            <label>Phone Number (line with the airtime)</label>
            <input type="tel" id="a2cPhone" placeholder="08012345678" maxlength="11"
                   class="form-input" value="${_a2c.phone}">
        </div>
        <div class="form-group">
            <label>Amount to Convert</label>
            <input type="number" id="a2cAmount" placeholder="Enter amount"
                   class="form-input" value="${_a2c.amount || ''}">
            <p id="a2cLimitHint" style="font-size:12px;color:#94a3b8;margin-top:4px;">${a2cLimitHint(_a2c.network)}</p>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitA2CDetails()" class="btn-primary">Send OTP</button>
    `);
    const sel = document.getElementById('a2cNetwork');
    if (sel) sel.value = _a2c.network;
}

function onA2CNetworkChange() {
    _a2c.network = document.getElementById('a2cNetwork').value;
    const hintEl = document.getElementById('a2cLimitHint');
    if (hintEl) hintEl.textContent = a2cLimitHint(_a2c.network);
}

async function submitA2CDetails() {
    const network = document.getElementById('a2cNetwork').value;
    const phone   = document.getElementById('a2cPhone').value.trim();
    const amount  = parseInt(document.getElementById('a2cAmount').value);

    if (!phone || phone.length !== 11) { showInlineError('Please enter a valid 11-digit phone number'); return; }
    if (!amount || amount <= 0)        { showInlineError('Please enter an amount'); return; }

    const lim = a2cLimitFor(network);
    if (lim && (amount < lim.min || amount > lim.max)) {
        showInlineError(`Amount must be between ₦${lim.min.toLocaleString()} and ₦${lim.max.toLocaleString()} for ${network.toUpperCase()}`);
        return;
    }

    _a2c.network = network;
    _a2c.phone   = phone;
    _a2c.amount  = amount;

    setSubmitLoading(true, 'Requesting OTP...');
    try {
        const res = await api.requestAirtimeToCashOTP(network, phone);
        const data = res.data || res;
        setSubmitLoading(false);

        if (data.skipOtp) {
            // SIM already active — identifier is already usable, skip straight to convert.
            _a2c.identifier = data.identifier;
            renderA2CStepConvert();
        } else {
            renderA2CStepOTP(res.message);
        }
    } catch (error) {
        setSubmitLoading(false, '', 'Send OTP');
        showInlineError(error.message || 'Unable to request OTP. Please try again.');
    }
}

function renderA2CStepOTP(sentMessage) {
    showModal('Verify OTP', `
        <p style="font-size:12px;color:#94a3b8;margin:-4px 0 16px;">Step 2 of 3 — Verify OTP</p>
        <p style="font-size:13px;color:#64748b;margin-bottom:16px;">
            ${sentMessage || `We sent a code to ${_a2c.phone}`}
        </p>
        <div class="form-group">
            <label>Enter OTP</label>
            <input type="text" id="a2cOtp" placeholder="123456" maxlength="6" inputmode="numeric"
                   class="form-input" style="letter-spacing:4px;text-align:center;font-size:18px;">
        </div>
        <p style="text-align:center;font-size:12px;">
            <a href="#" onclick="resendA2COTP();return false;" style="color:#1e3d5c;font-weight:600;">Resend OTP</a>
        </p>
    `, `
        <button onclick="renderA2CStepDetails()" class="btn-secondary">Back</button>
        <button onclick="submitA2COTP()" class="btn-primary">Verify</button>
    `);
}

async function resendA2COTP() {
    try {
        await api.requestAirtimeToCashOTP(_a2c.network, _a2c.phone);
        showInlineError('A new OTP has been sent.');
    } catch (error) {
        showInlineError(error.message || 'Unable to resend OTP. Please try again.');
    }
}

async function submitA2COTP() {
    const otp = document.getElementById('a2cOtp').value.trim();
    if (!otp || otp.length < 4) { showInlineError('Please enter the OTP sent to your phone'); return; }

    setSubmitLoading(true, 'Verifying...');
    try {
        const res  = await api.verifyAirtimeToCashOTP(_a2c.network, _a2c.phone, otp);
        const data = res.data || res;
        _a2c.identifier = data.identifier;
        _a2c.balance    = data.airtimeBalance;

        setSubmitLoading(false);
        renderA2CStepConvert();
    } catch (error) {
        setSubmitLoading(false, '', 'Verify');
        showInlineError(error.message || 'Invalid or expired OTP. Please try again.');
    }
}

function renderA2CStepConvert() {
    showModal('Confirm Conversion', `
        <p style="font-size:12px;color:#94a3b8;margin:-4px 0 16px;">Step 3 of 3 — Confirm</p>
        <div style="padding:14px;background:#f8fafc;border-radius:10px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Network</span><strong>${_a2c.network.toUpperCase()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Phone</span><strong>${_a2c.phone}</strong>
            </div>
            ${_a2c.balance != null ? `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Airtime Balance</span><strong>₦${Number(_a2c.balance).toLocaleString()}</strong>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Amount to Convert</span><strong>₦${_a2c.amount.toLocaleString()}</strong>
            </div>
        </div>
        <div class="form-group">
            <label>SIM PIN</label>
            <input type="password" id="a2cSimPin" placeholder="Enter your SIM PIN" maxlength="4" class="form-input">
            <p style="font-size:12px;color:#94a3b8;margin-top:4px;">The PIN that authorizes sharing airtime from this line — not your app PIN.</p>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="a2cTxPin" placeholder="Enter your 4-digit app PIN" maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitA2CConvert()" class="btn-primary">Convert to Cash</button>
    `);
}

async function submitA2CConvert() {
    const simPin = document.getElementById('a2cSimPin').value.trim();
    const txPin  = document.getElementById('a2cTxPin').value.trim();
    if (!simPin || !/^\d{4}$/.test(simPin)) { showInlineError('Please enter your 4-digit SIM PIN'); return; }
    if (!txPin  || !/^\d{4}$/.test(txPin))  { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    setSubmitLoading(true, 'Processing...');
    try {
        const res  = await api.convertAirtimeToCash(_a2c.network, _a2c.identifier, _a2c.amount, simPin, _a2c.phone, txPin);
        const data = res.data || res;
        closeModal();

        if (data.status === 'pending') {
            setTimeout(() => showSuccess(`
                Your conversion of ₦${_a2c.amount.toLocaleString()} airtime is <strong>pending</strong>.
                We'll notify you once it's confirmed.
            `), 300);
        } else {
            const received = data.amountConverted != null ? data.amountConverted : _a2c.amount;
            setTimeout(() => showSuccess(`
                ₦${_a2c.amount.toLocaleString()} airtime converted to<br>
                <span style="font-size:24px;font-weight:700;color:#16a34a;">₦${received.toLocaleString()}</span>
            `), 300);
        }
    } catch (error) {
        setSubmitLoading(false, '', 'Convert to Cash');
        showInlineError(error.message || 'Conversion failed. Please try again.');
    }
}

// ==================== BULK SMS MODAL ====================

async function showSMSModal() {
    let smsBalance = null;
    try {
        const balRes = await api.getSMSBalance();
        smsBalance = balRes.data?.balance ?? balRes.balance ?? balRes.data?.units ?? balRes.units ?? null;
    } catch(e) { /* silent */ }

    showModal('Bulk SMS', `
        <div class="form-group">
            <label>Sender ID
                <span style="color:#94a3b8;font-weight:400;font-size:12px;">(max 11 chars)</span>
            </label>
            <input type="text" id="smsSender" value="Yareema" maxlength="11"
                   class="form-input" placeholder="e.g. YareemaData">
        </div>
        <div class="form-group">
            <label>Recipients
                <span style="color:#94a3b8;font-weight:400;font-size:12px;">(comma-separated)</span>
            </label>
            <textarea id="smsPhones" rows="3" class="form-input"
                placeholder="08012345678, 09050030090, ..."
                style="resize:vertical;" oninput="calcSMSCost()"></textarea>
            <small style="color:#94a3b8;">Separate multiple numbers with commas</small>
        </div>
        <div class="form-group">
            <label>Message</label>
            <textarea id="smsMessage" rows="4" maxlength="160" class="form-input"
                placeholder="Type your message here..."
                style="resize:vertical;" oninput="calcSMSCost()"></textarea>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <small style="color:#94a3b8;">Max 160 chars per page</small>
                <small id="smsCharCount" style="color:#94a3b8;">0 / 160</small>
            </div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                    padding:12px 14px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#64748b;font-size:13px;">Recipients</span>
                <span id="smsRecipientCount" style="color:#1e3d5c;font-weight:700;font-size:13px;">0</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#64748b;font-size:13px;">Pages</span>
                <span id="smsPageCount" style="color:#1e3d5c;font-weight:700;font-size:13px;">1</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;font-size:13px;">Est. Units Used</span>
                <span id="smsUnitsUsed" style="color:#1e3d5c;font-weight:700;font-size:13px;">0</span>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="smsPin" maxlength="4"
                   placeholder="Enter 4-digit PIN" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitBulkSMS()" class="btn-primary">Send SMS</button>
    `);

    document.getElementById('smsMessage')?.addEventListener('input', function() {
        const el = document.getElementById('smsCharCount');
        if (el) el.textContent = this.value.length + ' / 160';
        calcSMSCost();
    });
}

function calcSMSCost() {
    const phones = (document.getElementById('smsPhones')?.value || '')
                       .split(',').map(p => p.trim()).filter(Boolean);
    const msgLen = (document.getElementById('smsMessage')?.value || '').length;
    const pages  = Math.max(1, Math.ceil(msgLen / 160));
    const units  = phones.length * pages;
    const rc = document.getElementById('smsRecipientCount');
    const pc = document.getElementById('smsPageCount');
    const uc = document.getElementById('smsUnitsUsed');
    if (rc) rc.textContent = phones.length;
    if (pc) pc.textContent = pages;
    if (uc) uc.textContent = units;
}

async function submitBulkSMS() {
    const sender  = (document.getElementById('smsSender')?.value  || '').trim();
    const phones  = (document.getElementById('smsPhones')?.value  || '')
                        .split(',').map(p => p.trim()).filter(Boolean);
    const message = (document.getElementById('smsMessage')?.value || '').trim();
    const pin     = (document.getElementById('smsPin')?.value     || '').trim();

    if (!sender)              { showInlineError('Please enter a Sender ID'); return; }
    if (sender.length > 11)   { showInlineError('Sender ID must be max 11 characters'); return; }
    if (phones.length === 0)  { showInlineError('Please enter at least one recipient number'); return; }
    if (!message)             { showInlineError('Please enter a message'); return; }
    if (!/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    const invalid = phones.filter(p => !/^\d{10,14}$/.test(p));
    if (invalid.length > 0) {
        showInlineError(`Invalid number(s): ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`);
        return;
    }

    setSubmitLoading(true, 'Sending...');
    try {
        const response = await api.sendBulkSMS(sender, phones.join(','), message, pin);
        closeModal();
        setTimeout(() => {
            const sent = response.data?.sent ?? response.data?.messageCount ?? phones.length;
            showSuccess(`
                <div style="text-align:center;">
                    <p style="font-size:16px;margin-bottom:6px;">SMS Sent Successfully! 📨</p>
                    <p style="font-size:14px;color:#64748b;">
                        ${sent} message${sent !== 1 ? 's' : ''} delivered
                    </p>
                    ${response.data?.reference
                        ? `<p style="font-size:11px;color:#cbd5e1;margin-top:6px;">Ref: ${response.data.reference}</p>`
                        : ''}
                </div>
            `);
        }, 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Send SMS');
        showInlineError(error.message || 'Failed to send SMS. Please try again.');
    }
}

// ==================== OTHER SERVICES ====================

function showRemitaModal() { window.location.href = 'rrr-payment.html'; }
function showAlphaModal()  { showError('This service is currently unavailable. Please contact support.'); }

// ==================== FUND WALLET MODAL ====================

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
        localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
    } catch(e) {}
}

function _loadWalletAccounts() {
    try {
        const key = _walletCacheKey();
        if (key) {
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);
        }
        const generic = localStorage.getItem('wallet_accounts');
        if (!generic) return null;
        const accounts = JSON.parse(generic);
        const u = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userName = (u.firstName || '').toLowerCase();
        if (userName && accounts[0]?.accountName) {
            if (!accounts[0].accountName.toLowerCase().includes(userName)) {
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
            <div id="fundLoadingStep" style="text-align:center;padding:48px 0;">
                <div style="width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#1e3d5c;
                            border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
                <p style="color:#1e3d5c;font-weight:600;font-size:15px;" id="fundLoadingText">
                    Checking your wallet...
                </p>
            </div>
            <div id="fundVerifyStep" style="display:none;"></div>
            <div id="fundAccountStep" style="display:none;">
                <p style="color:#64748b;margin-bottom:14px;font-size:13px;font-weight:500;">
                    Transfer to any of your dedicated accounts below:
                </p>
                <div id="fundAccountsList"></div>
                <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;
                            border-left:3px solid #f59e0b;margin-bottom:16px;">
                    <p style="color:#92400e;font-size:12px;margin:0;line-height:1.5;">
                        ⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes of transfer
                    </p>
                </div>
                <button onclick="closeModal()" class="btn-primary" style="width:100%;margin-top:4px;">Close</button>
            </div>
        </div>
    `, '');
    _initFundModal();
}

async function _initFundModal() {
    const cached = _loadWalletAccounts();
    if (cached && cached.length > 0) { _renderFundAccounts(cached); return; }

    _fundStep('fundLoadingStep');
    try {
        const response = await api.getWalletBalance();
        const wallet   = response.data?.wallet || response.data || {};
        let accounts   = [];
        if (wallet.accounts?.length > 0) accounts = wallet.accounts;
        else if (wallet.virtualAccount?.accountNumber) accounts = [{ ...wallet.virtualAccount, isDefault: true }];

        if (accounts.length > 0) {
            _saveWalletAccounts(accounts);
            _renderFundAccounts(accounts);
        } else {
            _fundStep('fundLoadingStep');
            document.getElementById('fundLoadingText').textContent = 'Setting up your accounts...';
            try {
                const createResp = await api.createWalletAccount({});
                const w   = createResp.data?.wallet || createResp.data || {};
                let accs  = [];
                if (w.accounts?.length > 0) accs = w.accounts;
                else if (w.virtualAccount?.accountNumber) accs = [{ ...w.virtualAccount, isDefault: true }];
                if (accs.length > 0) { _saveWalletAccounts(accs); _renderFundAccounts(accs); }
                else _showFundError('Your wallet accounts are being prepared. Please try again in a few minutes.');
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
            <div style="width:56px;height:56px;background:#fee2e2;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
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
            ${acc.isDefault ? `<span style="position:absolute;top:10px;right:12px;background:#0284c7;color:white;
                font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:0.5px;">
                PRIMARY</span>` : ''}
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:36px;height:36px;background:${acc.isDefault ? '#0284c7' : '#1e3d5c'};
                            border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                </div>
                <div>
                    <div style="font-weight:700;color:#0f172a;font-size:14px;">${acc.bankName || 'Bank'}</div>
                    <div style="color:#64748b;font-size:12px;">${acc.accountName || ''}</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:white;
                        border-radius:8px;padding:10px 14px;border:1px solid #e2e8f0;">
                <span style="font-size:22px;font-weight:700;color:#1e3d5c;letter-spacing:3px;"
                      id="accNum_${i}">${acc.accountNumber}</span>
                <button onclick="copyFundAccount('accNum_${i}', this)"
                    style="background:#1e3d5c;color:white;border:none;padding:6px 12px;border-radius:6px;
                           cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;
                           gap:4px;white-space:nowrap;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                </button>
            </div>
        </div>
    `).join('');
    _fundStep('fundAccountStep');
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
    const activeStyle   = 'padding:14px;border:2px solid #1e3d5c;border-radius:10px;background:#1e3d5c;color:white;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;';
    const inactiveStyle = 'padding:14px;border:2px solid #e2e8f0;border-radius:10px;background:white;color:#64748b;cursor:pointer;font-weight:700;font-size:14px;transition:all 0.2s;';
    if (type === 'nin') {
        ninBtn.style.cssText = activeStyle;  bvnBtn.style.cssText = inactiveStyle;
        ninBtn.textContent = '🪪 NIN'; bvnBtn.textContent = '🏦 BVN';
        label.textContent = 'NIN (11 digits)'; input.placeholder = 'Enter your NIN'; input.maxLength = 11;
    } else {
        bvnBtn.style.cssText = activeStyle;  ninBtn.style.cssText = inactiveStyle;
        bvnBtn.textContent = '🏦 BVN'; ninBtn.textContent = '🪪 NIN';
        label.textContent = 'BVN (11 digits)'; input.placeholder = 'Enter your BVN'; input.maxLength = 11;
    }
}

async function submitIdVerification() {
    const idNumber = document.getElementById('idNumberInput').value.trim();
    if (!/^\d{11}$/.test(idNumber)) {
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
    btn.disabled = true; btn.textContent = 'Setting up your account...'; btn.style.opacity = '0.7';
    _fundStep('fundLoadingStep');
    document.getElementById('fundLoadingText').textContent = 'Creating your wallet accounts...';
    try {
        const payload  = _selectedIdType === 'nin' ? { nin: idNumber } : { bvn: idNumber };
        const response = await api.createWalletAccount(payload);
        if (response.status !== 'success' && !response.data)
            throw new Error(response.message || 'Wallet creation failed');
        const wallet   = response.data?.wallet || response.data || response;
        const accounts = wallet.accounts || [];
        if (accounts.length > 0) { _saveWalletAccounts(accounts); _showWalletCreatedSuccess(wallet, accounts); }
        else throw new Error('No accounts were created. Please try again or contact support.');
    } catch (err) {
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
    document.getElementById('modalTitle').textContent = '🎉 Wallet Created!';
    document.getElementById('modalBody').innerHTML = `
        <div style="text-align:center;padding:8px 0 20px;">
            <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;
                        background:linear-gradient(135deg,#dcfce7,#bbf7d0);
                        display:flex;align-items:center;justify-content:center;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                     stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:6px;">
                Wallet Created Successfully!
            </h3>
            <p style="color:#64748b;font-size:14px;">
                Your dedicated bank accounts are ready. Transfer money to fund your wallet instantly.
            </p>
        </div>
        <div style="margin-bottom:16px;">
            <p style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:10px;
                       text-transform:uppercase;letter-spacing:0.5px;">
                Your Accounts (${accounts.length})
            </p>
            ${accounts.map((acc, i) => `
                <div style="background:${acc.isDefault ? 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' : '#f8fafc'};
                     border:${acc.isDefault ? '1.5px solid #7dd3fc' : '1px solid #e2e8f0'};
                     border-radius:14px;padding:14px;margin-bottom:8px;position:relative;">
                    ${acc.isDefault ? `<span style="position:absolute;top:10px;right:12px;background:#0284c7;
                        color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">
                        PRIMARY</span>` : ''}
                    <div style="font-weight:700;color:#0f172a;font-size:14px;margin-bottom:2px;">${acc.bankName}</div>
                    <div style="color:#64748b;font-size:12px;margin-bottom:8px;">${acc.accountName}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;background:white;
                                border-radius:8px;padding:8px 12px;border:1px solid #e2e8f0;">
                        <span style="font-size:20px;font-weight:700;color:#1e3d5c;letter-spacing:3px;"
                              id="succNum_${i}">${acc.accountNumber}</span>
                        <button onclick="copyFundAccount('succNum_${i}', this)"
                            style="background:#1e3d5c;color:white;border:none;padding:5px 10px;
                                   border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">
                            Copy
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;border-left:3px solid #f59e0b;">
            <p style="color:#92400e;font-size:12px;margin:0;">
                ⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes
            </p>
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
                <p style="color:#64748b;margin-bottom:14px;font-size:13px;font-weight:500;">
                    Transfer to any account below:
                </p>
                <div id="fundAccountsList"></div>
                <div style="background:#fef3c7;padding:12px 14px;border-radius:8px;
                            border-left:3px solid #f59e0b;margin-bottom:16px;">
                    <p style="color:#92400e;font-size:12px;margin:0;">
                        ⚡ <strong>Instant funding</strong> — funds reflect within 1–5 minutes
                    </p>
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
const POLL_MAX = 24;

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
    const bar = document.getElementById('pollProgressBar');
    if (bar) bar.style.width = ((_pollAttempts / POLL_MAX) * 100) + '%';
    try {
        const w          = await api.getWalletBalance();
        const newBalance = parseFloat(w.data?.balance || w.balance || 0);
        const credited   = newBalance - (window._balanceBeforeFund || 0);
        if (credited > 0) { clearInterval(_pollInterval); closeModal(); showPaymentSuccess(newBalance, credited); return; }
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

function startSilentPoll() {
    api.getWalletBalance().then(w => {
        window._balanceBeforeFund = parseFloat(w.data?.balance || w.balance || 0);
    }).catch(() => {});
    let attempts = 0;
    const silentInterval = setInterval(async () => {
        attempts++;
        try {
            const w          = await api.getWalletBalance();
            const newBalance = parseFloat(w.data?.balance || w.balance || 0);
            const credited   = newBalance - (window._balanceBeforeFund || 0);
            if (credited > 0) { clearInterval(silentInterval); showPaymentSuccess(newBalance, credited); }
        } catch (e) {}
        if (attempts >= 24) clearInterval(silentInterval);
    }, 5000);
}

function showPaymentSuccess(newBalance, credited) {
    const fmt = (n) => '₦' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
    showModal('Payment Received! 🎉', `
        <div style="text-align:center;padding:32px;">
            <div style="width:80px;height:80px;margin:0 auto 20px;border-radius:50%;background:#dcfce7;
                        display:flex;align-items:center;justify-content:center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <p style="color:#64748b;font-size:14px;margin-bottom:6px;">Amount Credited</p>
            <p style="font-size:36px;font-weight:700;color:#16a34a;margin-bottom:4px;">${fmt(credited)}</p>
            <p style="color:#64748b;font-size:14px;">New Balance: <strong style="color:#1e3d5c;">${fmt(newBalance)}</strong></p>
        </div>
    `, `<button onclick="closeModal();location.reload();" class="btn-primary" style="width:100%;">Done</button>`);
    const balEl = document.getElementById('balance');
    if (balEl) balEl.textContent = fmt(newBalance);
}

// ==================== TRANSFER MODAL ====================

function showTransferModal() {
    showModal('Transfer Funds', `
        <div class="form-group">
            <label>Recipient Email or Phone</label>
            <input type="text" id="transferRecipient"
                   placeholder="Enter email or phone number" class="form-input">
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" id="transferAmount" placeholder="0.00" min="100" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="transferPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
        <div class="form-group">
            <label>Narration (Optional)</label>
            <input type="text" id="transferNarration" placeholder="What's this for?" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="handleTransfer()" class="btn-primary">Transfer</button>
    `);
}

async function handleTransfer() {
    const recipient = document.getElementById('transferRecipient').value.trim();
    const amount    = parseFloat(document.getElementById('transferAmount').value);
    const pin       = document.getElementById('transferPin').value.trim();
    const narration = document.getElementById('transferNarration').value.trim();

    if (!recipient)                   { showInlineError('Please enter recipient email or phone'); return; }
    if (!amount || amount < 100)      { showInlineError('Minimum transfer amount is ₦100'); return; }
    if (!/^\d{4}$/.test(pin))         { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    setSubmitLoading(true, 'Transferring...');
    try {
        const response = await api.transferFunds({
            recipientEmail: recipient, description: narration, amount, transactionPin: pin
        });
        closeModal();
        setTimeout(() => showSuccess(response.message || 'Transfer successful!'), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Transfer');
        showInlineError(error.message || 'Transfer failed. Please try again.');
    }
}

// ==================== WITHDRAW MODAL ====================

function showWithdrawModal() {
    showModal('Withdraw Funds', `
        <div class="form-group">
            <label>Bank</label>
            <select id="withdrawBank" class="form-input">
                <option value="">Select Bank</option>
            </select>
        </div>
        <div class="form-group">
            <label>Account Number</label>
            <input type="text" id="withdrawAccountNumber" placeholder="0123456789"
                   maxlength="10" class="form-input">
            <div id="accountNameDisplay" style="margin-top:8px;color:#16a34a;font-size:14px;"></div>
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" id="withdrawAmount" placeholder="0.00" min="1000" class="form-input">
            <small style="color:#64748b;">Minimum: ₦1,000</small>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="withdrawPin" placeholder="Enter 4-digit PIN"
                   maxlength="4" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="handleWithdraw()" class="btn-primary">Withdraw</button>
    `);
    loadBanks();
    document.getElementById('withdrawAccountNumber').addEventListener('blur', verifyAccountNumber);
}

async function loadBanks() {
    const banks = [
        'Access Bank','GTBank','First Bank','UBA','Zenith Bank','Ecobank',
        'Fidelity Bank','FCMB','Sterling Bank','Union Bank','Stanbic IBTC',
        'Polaris Bank','Wema Bank','Keystone Bank'
    ];
    const select = document.getElementById('withdrawBank');
    if (!select) return;
    banks.forEach(bank => {
        const opt = document.createElement('option');
        opt.value = bank.toLowerCase().replace(/\s+/g, '-');
        opt.textContent = bank;
        select.appendChild(opt);
    });
}

async function verifyAccountNumber() {
    const accountNumber = document.getElementById('withdrawAccountNumber').value;
    const bank          = document.getElementById('withdrawBank').value;
    const display       = document.getElementById('accountNameDisplay');
    if (accountNumber.length !== 10 || !bank) { display.textContent = ''; return; }
    display.textContent = 'Verifying account...';
    setTimeout(() => { display.textContent = 'Account Name: [Verification pending]'; }, 1000);
}

async function handleWithdraw() {
    const bank          = document.getElementById('withdrawBank').value;
    const accountNumber = document.getElementById('withdrawAccountNumber').value.trim();
    const amount        = parseFloat(document.getElementById('withdrawAmount').value);
    const pin           = document.getElementById('withdrawPin').value.trim();

    if (!bank)                        { showInlineError('Please select a bank'); return; }
    if (accountNumber.length !== 10)  { showInlineError('Please enter a valid 10-digit account number'); return; }
    if (!amount || amount < 1000)     { showInlineError('Minimum withdrawal amount is ₦1,000'); return; }
    if (!/^\d{4}$/.test(pin))         { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    setSubmitLoading(true, 'Processing...');
    try {
        const response = await api.withdrawFunds({ bankCode: bank, accountNumber, amount, transactionPin: pin });
        closeModal();
        setTimeout(() => showSuccess(response.message || 'Withdrawal request submitted!'), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Withdraw');
        showInlineError(error.message || 'Withdrawal failed. Please try again.');
    }
}

// ==================== PROFILE MODALS ====================

function showPersonalDetailsModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    showModal('Personal Details', `
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
                <span class="detail-value">
                    ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
            </div>
        </div>
    `, `<button onclick="closeModal()" class="btn-primary" style="width:100%;">Close</button>`);
}

function showEditProfileModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    showModal('Edit Profile', `
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
            <small style="color:#64748b;">Email cannot be changed</small>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="editPhone" value="${user.phoneNumber || ''}" class="form-input" disabled>
            <small style="color:#64748b;">Phone cannot be changed</small>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitProfileEdit()" class="btn-primary">Save Changes</button>
    `);
}

async function submitProfileEdit() {
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName  = document.getElementById('editLastName').value.trim();
    if (!firstName || !lastName) { showInlineError('Please fill in all fields'); return; }
    setSubmitLoading(true, 'Saving...');
    try {
        await api.updateProfile({ firstName, lastName });
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.firstName = firstName; user.lastName = lastName;
        localStorage.setItem('user', JSON.stringify(user));
        closeModal();
        setTimeout(() => showSuccess('Profile updated successfully!'), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Save Changes');
        showInlineError(error.message || 'Failed to update profile');
    }
}

function showSecurityModal() {
    showModal('Security Settings', `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <button onclick="closeModal();setTimeout(()=>changePassword(),300)" class="security-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Change Password</span>
            </button>
            <button onclick="closeModal();setTimeout(()=>setTransactionPIN(),300)" class="security-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <span>Set Transaction PIN</span>
            </button>
        </div>
    `, `<button onclick="closeModal()" class="btn-secondary" style="width:100%;">Close</button>`);
}

function changePassword() {
    showModal('Change Password', `
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
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitPasswordChange()" class="btn-primary">Change Password</button>
    `);
}

async function submitPasswordChange() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (!current || !newPass || !confirm) { showInlineError('Please fill in all fields'); return; }
    if (newPass !== confirm)              { showInlineError('Passwords do not match'); return; }
    if (newPass.length < 6)              { showInlineError('Password must be at least 6 characters'); return; }
    setSubmitLoading(true, 'Changing...');
    try {
        await api.changePassword(current, newPass);
        closeModal();
        setTimeout(() => showSuccess('Password changed successfully!'), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Change Password');
        showInlineError(error.message || 'Failed to change password');
    }
}

function setTransactionPIN() {
    showModal('Set Transaction PIN', `
        <div class="form-group">
            <label>New PIN</label>
            <input type="password" id="newPIN" maxlength="4"
                   placeholder="Enter 4-digit PIN" class="form-input">
        </div>
        <div class="form-group">
            <label>Confirm PIN</label>
            <input type="password" id="confirmPIN" maxlength="4"
                   placeholder="Re-enter PIN" class="form-input">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitPINChange()" class="btn-primary">Set PIN</button>
    `);
}

async function submitPINChange() {
    const newPin     = document.getElementById('newPIN').value;
    const confirmPin = document.getElementById('confirmPIN').value;
    if (!newPin || !confirmPin) { showInlineError('Please fill in all fields'); return; }
    if (newPin.length !== 4)    { showInlineError('PIN must be 4 digits'); return; }
    if (newPin !== confirmPin)  { showInlineError('PINs do not match'); return; }
    setSubmitLoading(true, 'Setting...');
    try {
        await api.setTransactionPIN(newPin, confirmPin);
        closeModal();
        setTimeout(() => showSuccess('Transaction PIN set successfully!'), 300);
    } catch (error) {
        setSubmitLoading(false, '', 'Set PIN');
        showInlineError(error.message || 'Failed to set PIN');
    }
}

// ==================== NOTIFICATIONS MODAL ====================

function showNotificationsModal() {
    showModal('Notifications', `
        <div id="notifLoadingState" style="text-align:center;padding:40px 0;">
            <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#1e3d5c;
                        border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
            <p style="color:#64748b;font-size:14px;">Loading notifications...</p>
        </div>
        <div id="notifList" style="display:none;"></div>
    `, `
        <button onclick="markAllNotifsRead()" id="markAllBtn" class="btn-secondary" style="flex:1;">
            Mark all read
        </button>
        <button onclick="closeModal()" class="btn-primary" style="flex:1;">Close</button>
    `);
    document.getElementById('modalFooter').style.display = 'flex';
    document.getElementById('modalFooter').style.gap = '10px';
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
    _loadNotifications();
}

async function _loadNotifications() {
    try {
        const response = await api.getNotifications();
        let notifications = [];
        const d = response?.data;
        if (Array.isArray(d?.notifications))          notifications = d.notifications;
        else if (Array.isArray(d?.data))              notifications = d.data;
        else if (Array.isArray(d))                    notifications = d;
        else if (Array.isArray(response?.notifications)) notifications = response.notifications;
        else if (Array.isArray(response?.results))    notifications = response.results;
        _renderNotifications(notifications);
    } catch (err) {
        const el = document.getElementById('notifLoadingState');
        if (el) el.innerHTML = `
            <div style="text-align:center;padding:40px 0;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"
                     style="margin:0 auto 10px;display:block;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style="color:#dc2626;font-size:14px;margin:0;">Failed to load notifications</p>
                <p style="color:#94a3b8;font-size:12px;margin:6px 0 0;">${err.message || 'Please try again'}</p>
                <button onclick="_loadNotifications()"
                    style="margin-top:14px;padding:8px 20px;background:#1e3d5c;color:#fff;
                           border:none;border-radius:8px;font-size:13px;cursor:pointer;">
                    Retry
                </button>
            </div>`;
    }
}

function _renderNotifications(notifications) {
    const loading = document.getElementById('notifLoadingState');
    const list    = document.getElementById('notifList');
    if (loading) loading.style.display = 'none';
    if (!list) return;

    if (!notifications || !notifications.length) {
        list.style.display = 'block';
        list.innerHTML = `
            <div style="text-align:center;padding:48px 0;">
                <div style="width:56px;height:56px;background:#f1f5f9;border-radius:50%;
                            display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="#94a3b8" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                </div>
                <p style="color:#64748b;font-size:14px;font-weight:600;margin:0;">No notifications yet</p>
                <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Broadcasts from admin will appear here</p>
            </div>`;
        return;
    }

    list.style.display = 'block';
    list.innerHTML = notifications.map(n => {
        const id      = n._id || n.id || '';
        const isRead  = n.isRead || n.read || n.seen || false;
        const title   = n.title || n.subject || 'Notification';
        const message = n.message || n.body || n.content || n.description || '';
        const time    = n.createdAt || n.timestamp || n.date || null;
        return `
        <div id="notif_${id}" onclick="readNotif('${id}', this)"
            style="display:flex;align-items:flex-start;gap:12px;
                   background:${isRead ? 'transparent' : '#f0f7ff'};
                   border-radius:10px;padding:12px;margin-bottom:6px;cursor:pointer;
                   border:1px solid ${isRead ? 'transparent' : '#dbeafe'};">
            <div style="width:38px;height:38px;border-radius:50%;
                        background:${isRead ? '#f1f5f9' : '#dbeafe'};
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${_notifIcon(n.type || n.category || n.notificationType || '')}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <p style="font-weight:${isRead ? '500' : '700'};color:#0f172a;font-size:14px;margin:0;
                               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</p>
                    ${!isRead ? '<span style="width:8px;height:8px;min-width:8px;background:#2563eb;border-radius:50%;"></span>' : ''}
                </div>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0;line-height:1.45;">${message}</p>
                ${time ? `<p style="color:#94a3b8;font-size:11px;margin:5px 0 0;">${_timeAgoNotif(time)}</p>` : ''}
            </div>
        </div>`;
    }).join('');
}

function _notifIcon(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('success') || t.includes('credit') || t.includes('fund') || t.includes('bonus'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    if (t.includes('fail') || t.includes('error') || t.includes('debit'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    if (t.includes('warn') || t.includes('pending') || t.includes('alert'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    if (t.includes('broadcast') || t.includes('promo') || t.includes('update'))
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
}

function _timeAgoNotif(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60)     return 'Just now';
    if (s < 3600)   return Math.floor(s / 60) + 'm ago';
    if (s < 86400)  return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

async function readNotif(id, el) {
    if (!id || el.dataset.read === 'true') return;
    try {
        await api.markNotificationRead(id);
        el.dataset.read     = 'true';
        el.style.background = 'transparent';
        el.style.border     = '1px solid transparent';
        const dot     = el.querySelector('span[style*="background:#2563eb"]');
        const iconBox = el.querySelector('div[style*="background:#dbeafe"]');
        const titleEl = el.querySelector('p');
        if (dot)     dot.remove();
        if (iconBox) iconBox.style.background = '#f1f5f9';
        if (titleEl) titleEl.style.fontWeight = '500';
    } catch (e) { /* silent */ }
}

async function markAllNotifsRead() {
    const btn = document.getElementById('markAllBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Marking...'; }
    try {
        await api.markAllNotificationsRead();
        document.querySelectorAll('#notifList > div[id^="notif_"]').forEach(el => {
            el.dataset.read     = 'true';
            el.style.background = 'transparent';
            el.style.border     = '1px solid transparent';
            const dot     = el.querySelector('span[style*="background:#2563eb"]');
            const iconBox = el.querySelector('div[style*="background:#dbeafe"]');
            const titleEl = el.querySelector('p');
            if (dot)     dot.remove();
            if (iconBox) iconBox.style.background = '#f1f5f9';
            if (titleEl) titleEl.style.fontWeight = '500';
        });
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        if (btn) { btn.disabled = false; btn.textContent = 'All read ✓'; }
    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Mark all read'; }
    }
}

// ==================== REMAINING PROFILE MODALS ====================

function showDevicesModal() {
    showModal('Device Management', `
        <div class="device-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                 stroke="#1e3d5c" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <div style="flex:1;">
                <div><strong>Current Device</strong></div>
                <small style="color:#64748b;">Last active: Just now</small>
            </div>
            <span style="padding:4px 12px;background:#dcfce7;color:#16a34a;
                         border-radius:12px;font-size:12px;font-weight:600;">Active</span>
        </div>
    `, `<button onclick="closeModal()" class="btn-primary" style="width:100%;">Close</button>`);
}

function showReferralModal() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const referralCode = user.referralCode || 'REF123456';
    showModal('Referral Program', `
        <div style="text-align:center;">
            <p style="color:#64748b;margin-bottom:24px;">Share your referral code and earn rewards!</p>
            <div style="padding:24px;background:#eff6ff;border-radius:12px;margin-bottom:24px;">
                <p style="font-size:12px;color:#64748b;margin-bottom:8px;">Your Referral Code</p>
                <p style="font-size:32px;font-weight:700;color:#1e3d5c;letter-spacing:2px;">${referralCode}</p>
            </div>
            <button onclick="copyReferralCode('${referralCode}')"
                    class="btn-primary" style="width:100%;margin-bottom:24px;">
                Copy Code
            </button>
            <div style="text-align:left;">
                <p style="font-weight:600;margin-bottom:12px;">How it works:</p>
                <ul style="color:#64748b;padding-left:20px;">
                    <li>Share your code with friends</li>
                    <li>They sign up using your code</li>
                    <li>You both get ₦500 bonus!</li>
                </ul>
            </div>
        </div>
    `, `<button onclick="closeModal()" class="btn-secondary" style="width:100%;">Close</button>`);
}

function copyReferralCode(code) {
    navigator.clipboard.writeText(code)
        .then(() => showSuccess('Referral code copied to clipboard!'))
        .catch(() => showError('Failed to copy code'));
}

function showHelpModal() {
    showModal('Help & Support', `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="help-item">
                <strong>📞 Contact Support</strong>
                <p style="color:#64748b;margin-top:4px;">support@yareemadata.com</p>
            </div>
            <div class="help-item">
                <strong>💬 Live Chat</strong>
                <p style="color:#64748b;margin-top:4px;">Chat with our support team</p>
            </div>
            <div class="help-item">
                <strong>📖 FAQ</strong>
                <p style="color:#64748b;margin-top:4px;">Find answers to common questions</p>
            </div>
        </div>
    `, `<button onclick="closeModal()" class="btn-primary" style="width:100%;">Close</button>`);
}

// ==================== AIRTIME2CASH WHATSAPP MODAL ====================

const WHATSAPP_NUMBER = '2348130228200';

function openWhatsAppLang() {
    showModal('Airtime to Cash', `
        <div style="text-align:center;padding:8px 0 4px;">
            <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.486a.5.5 0 0 0 .612.612l5.63-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 0 1-5.097-1.395l-.364-.217-3.773.989.989-3.772-.218-.365A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
            </div>
            <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.6;">
                Please select your preferred language to continue on WhatsApp.
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button onclick="launchWhatsApp('english')"
                    style="padding:14px 10px;border-radius:10px;border:1.5px solid #e2e8f0;
                           background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#0f172a;">
                    🇬🇧 English
                </button>
                <button onclick="launchWhatsApp('hausa')"
                    style="padding:14px 10px;border-radius:10px;border:1.5px solid #e2e8f0;
                           background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#0f172a;">
                    🇳🇬 Hausa
                </button>
            </div>
        </div>
    `, `<button onclick="closeModal()" class="btn-secondary" style="flex:1;">Cancel</button>`);
}

function launchWhatsApp(lang) {
    const messages = {
        english: 'Hello, I would like to convert my airtime to cash.',
        hausa:   'Sannu, ina son canza airtime na zuwa kudi.'
    };
    const msg = encodeURIComponent(messages[lang] || messages.english);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    const body   = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');
    if (body) {
        body.innerHTML = `
            <div style="text-align:center;padding:8px 0;">
                <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;
                            display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.486a.5.5 0 0 0 .612.612l5.63-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 0 1-5.097-1.395l-.364-.217-3.773.989.989-3.772-.218-.365A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                </div>
                <p style="font-size:14px;color:#374151;line-height:1.65;margin-bottom:6px;">
                    Chat the number below for your <strong>Airtime to Cash</strong>
                </p>
                <div style="font-size:22px;font-weight:700;color:#1e3d5c;letter-spacing:1px;margin-bottom:4px;">
                    0813 022 8200
                </div>
                <p style="font-size:12px;color:#94a3b8;">You'll be redirected to WhatsApp</p>
            </div>`;
    }
    if (footer) {
        footer.style.display = 'flex';
        footer.innerHTML = `
            <button onclick="closeModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            <button onclick="window.open('${url}','_blank');closeModal();"
                style="flex:2;padding:12px 24px;background:#16a34a;color:#fff;border:none;
                       border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;
                       display:flex;align-items:center;justify-content:center;gap:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.486a.5.5 0 0 0 .612.612l5.63-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 0 1-5.097-1.395l-.364-.217-3.773.989.989-3.772-.218-.365A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Chat on WhatsApp
            </button>`;
    }
}

// ==================== WHATSAPP FLOATING BUTTON ====================

(function injectWhatsAppFAB() {
    if (!document.getElementById('wa-fab-style')) {
        const style = document.createElement('style');
        style.id = 'wa-fab-style';
        style.textContent = `
            #wa-fab {
                position:fixed;bottom:24px;right:20px;z-index:9999;
                width:52px;height:52px;background:#25d366;border-radius:50%;
                box-shadow:0 4px 16px rgba(37,211,102,0.45);
                display:flex;align-items:center;justify-content:center;
                cursor:pointer;border:none;transition:transform .2s,box-shadow .2s;
            }
            #wa-fab:hover { transform:scale(1.1); box-shadow:0 6px 20px rgba(37,211,102,0.55); }
            #wa-fab-tooltip {
                position:fixed;bottom:84px;right:20px;z-index:9998;
                background:#1e3d5c;color:#fff;font-size:12px;font-weight:600;
                padding:6px 12px;border-radius:20px;white-space:nowrap;
                pointer-events:none;opacity:0;transform:translateY(6px);
                transition:opacity .2s,transform .2s;
            }
            #wa-fab:hover + #wa-fab-tooltip { opacity:1; transform:translateY(0); }
        `;
        document.head.appendChild(style);
    }
    function injectButton() {
        if (document.getElementById('wa-fab')) return;
        const btn = document.createElement('button');
        btn.id = 'wa-fab';
        btn.title = 'Chat us on WhatsApp';
        btn.setAttribute('aria-label', 'Chat on WhatsApp');
        btn.onclick = () => window.open('https://wa.me/2348021580029', '_blank');
        btn.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.486a.5.5 0 0 0 .612.612l5.63-1.476A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 0 1-5.097-1.395l-.364-.217-3.773.989.989-3.772-.218-.365A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>`;
        const tooltip = document.createElement('div');
        tooltip.id = 'wa-fab-tooltip';
        tooltip.textContent = 'Chat us on WhatsApp';
        document.body.appendChild(btn);
        document.body.appendChild(tooltip);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectButton);
    else injectButton();
})();
