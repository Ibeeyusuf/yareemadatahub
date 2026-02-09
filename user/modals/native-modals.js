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
        showError('This feature is coming soon!');
    }
}

// ==================== DATA MODAL ====================
let selectedNetwork = 'MTN';
let selectedPlan = null;
let dataPlans = [];

async function showDataModal() {
    selectedNetwork = 'MTN';
    await loadDataPlans('MTN');
    
    const bodyHTML = `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn active" data-network="MTN" onclick="selectDataNetwork('MTN')" style="background: #FFCC00; color: #000;">MTN</button>
                <button type="button" class="network-btn" data-network="AIRTEL" onclick="selectDataNetwork('AIRTEL')" style="background: #FF0000; color: #fff;">Airtel</button>
                <button type="button" class="network-btn" data-network="GLO" onclick="selectDataNetwork('GLO')" style="background: #00C300; color: #fff;">Glo</button>
                <button type="button" class="network-btn" data-network="9MOBILE" onclick="selectDataNetwork('9MOBILE')" style="background: #006400; color: #fff;">9mobile</button>
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
    updateDataPlanDropdown();
}

function selectDataNetwork(network) {
    selectedNetwork = network;
    document.querySelectorAll('.network-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-network="${network}"]`).classList.add('active');
    loadDataPlans(network);
}

async function loadDataPlans(network) {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;
    
    planSelect.innerHTML = '<option value="">Loading plans...</option>';
    
    try {
        const response = await api.getDataPlans(network);
        dataPlans = response.data?.plans || response.plans || [];
        updateDataPlanDropdown();
    } catch (error) {
        console.error('Error loading plans:', error);
        planSelect.innerHTML = '<option value="">Error loading plans</option>';
    }
}

function updateDataPlanDropdown() {
    const planSelect = document.getElementById('dataPlan');
    if (!planSelect) return;
    
    if (dataPlans.length > 0) {
        planSelect.innerHTML = '<option value="">Choose a plan</option>' + 
            dataPlans.map((plan, idx) => `<option value="${idx}">${plan.name} - ₦${plan.price.toLocaleString()}</option>`).join('');
    } else {
        planSelect.innerHTML = '<option value="">No plans available</option>';
    }
}

async function submitDataPurchase() {
    const phone = document.getElementById('dataPhone').value;
    const planIdx = document.getElementById('dataPlan').value;
    const pin = document.getElementById('dataPin').value;
    
    if (!phone || phone.length !== 11) {
        showError('Please enter a valid 11-digit phone number');
        return;
    }
    if (!planIdx) {
        showError('Please select a data plan');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    const plan = dataPlans[planIdx];
    if (!plan) {
        showError('Invalid plan selected');
        return;
    }
    
    try {
        showLoading('Purchasing data...');
        const response = await api.purchaseData(phone, selectedNetwork, plan._id || plan.id, pin);
        showSuccess(response.message || 'Data purchased successfully!');
    } catch (error) {
        showError(error.message || 'Purchase failed. Please try again.');
    }
}

// ==================== AIRTIME MODAL ====================
function showAirtimeModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Select Network</label>
            <div class="network-grid">
                <button type="button" class="network-btn-air active" data-network="MTN" onclick="selectAirtimeNetwork('MTN')" style="background: #FFCC00; color: #000;">MTN</button>
                <button type="button" class="network-btn-air" data-network="AIRTEL" onclick="selectAirtimeNetwork('AIRTEL')" style="background: #FF0000; color: #fff;">Airtel</button>
                <button type="button" class="network-btn-air" data-network="GLO" onclick="selectAirtimeNetwork('GLO')" style="background: #00C300; color: #fff;">Glo</button>
                <button type="button" class="network-btn-air" data-network="9MOBILE" onclick="selectAirtimeNetwork('9MOBILE')" style="background: #006400; color: #fff;">9mobile</button>
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
    window.selectedAirtimeNetwork = 'MTN';
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
    
    if (!phone || phone.length !== 11) {
        showError('Please enter a valid 11-digit phone number');
        return;
    }
    if (!amount || amount < 50) {
        showError('Amount must be at least ₦50');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    try {
        showLoading('Purchasing airtime...');
        const response = await api.purchaseAirtime(phone, window.selectedAirtimeNetwork, amount, pin);
        showSuccess(response.message || 'Airtime purchased successfully!');
    } catch (error) {
        showError(error.message || 'Purchase failed. Please try again.');
    }
}

// ==================== ELECTRICITY MODAL ====================
function showElectricityModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Select Disco</label>
            <select id="electricityDisco" class="form-input">
                <option value="aedc">AEDC - Abuja</option>
                <option value="ekedc">EKEDC - Eko</option>
                <option value="ikedc">IKEDC - Ikeja</option>
                <option value="phed">PHED - Port Harcourt</option>
                <option value="ibedc">IBEDC - Ibadan</option>
                <option value="kaedco">KAEDCO - Kaduna</option>
            </select>
        </div>
        <div class="form-group">
            <label>Meter Number</label>
            <input type="text" id="meterNumber" placeholder="Enter meter number" class="form-input">
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" id="electricityAmount" placeholder="Enter amount (min ₦1,000)" min="1000" class="form-input">
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="electricityPhone" placeholder="08012345678" maxlength="11" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="electricityPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitElectricityPayment()" class="btn-primary">Pay Electricity</button>
    `;
    
    showModal('Pay Electricity', bodyHTML, footerHTML);
}

async function submitElectricityPayment() {
    const disco = document.getElementById('electricityDisco').value;
    const meter = document.getElementById('meterNumber').value;
    const amount = parseInt(document.getElementById('electricityAmount').value);
    const phone = document.getElementById('electricityPhone').value;
    const pin = document.getElementById('electricityPin').value;
    
    if (!meter) {
        showError('Please enter meter number');
        return;
    }
    if (!amount || amount < 1000) {
        showError('Amount must be at least ₦1,000');
        return;
    }
    if (!phone || phone.length !== 11) {
        showError('Please enter a valid phone number');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    try {
        showLoading('Processing payment...');
        const response = await api.purchaseElectricity(meter, disco, amount, phone, pin);
        showSuccess(response.message || 'Electricity payment successful!');
    } catch (error) {
        showError(error.message || 'Payment failed. Please try again.');
    }
}

// ==================== TV MODAL ====================
let tvPlans = [];

async function showTVModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Select Provider</label>
            <select id="tvProvider" class="form-input" onchange="loadTVPlans(this.value)">
                <option value="dstv">DSTV</option>
                <option value="gotv">GOTV</option>
                <option value="startimes">Startimes</option>
            </select>
        </div>
        <div class="form-group">
            <label>Smart Card Number</label>
            <input type="text" id="smartCard" placeholder="Enter smart card number" class="form-input">
        </div>
        <div class="form-group">
            <label>Select Package</label>
            <select id="tvPlan" class="form-input">
                <option value="">Loading packages...</option>
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
    await loadTVPlans('dstv');
}

async function loadTVPlans(provider) {
    const planSelect = document.getElementById('tvPlan');
    if (!planSelect) return;
    
    planSelect.innerHTML = '<option value="">Loading packages...</option>';
    
    try {
        const response = await api.getCablePlans(provider);
        tvPlans = response.data?.plans || response.plans || [];
        
        if (tvPlans.length > 0) {
            planSelect.innerHTML = '<option value="">Choose package</option>' + 
                tvPlans.map((plan, idx) => `<option value="${idx}">${plan.name} - ₦${plan.price.toLocaleString()}</option>`).join('');
        } else {
            planSelect.innerHTML = '<option value="">No packages available</option>';
        }
    } catch (error) {
        planSelect.innerHTML = '<option value="">Error loading packages</option>';
    }
}

async function submitTVSubscription() {
    const provider = document.getElementById('tvProvider').value;
    const smartCard = document.getElementById('smartCard').value;
    const planIdx = document.getElementById('tvPlan').value;
    const pin = document.getElementById('tvPin').value;
    
    if (!smartCard) {
        showError('Please enter smart card number');
        return;
    }
    if (!planIdx) {
        showError('Please select a package');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    const plan = tvPlans[planIdx];
    if (!plan) {
        showError('Invalid package selected');
        return;
    }
    
    try {
        showLoading('Processing subscription...');
        const response = await api.purchaseCableTV(smartCard, provider, plan._id || plan.id, 1, pin);
        showSuccess(response.message || 'Subscription successful!');
    } catch (error) {
        showError(error.message || 'Subscription failed. Please try again.');
    }
}

// ==================== EDUCATION MODAL ====================
function showEducationModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Exam Type</label>
            <select id="examType" class="form-input">
                <option value="waec">WAEC Result Checker</option>
                <option value="neco">NECO Result Checker</option>
                <option value="jamb">JAMB E-PIN</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="eduQuantity" value="1" min="1" max="10" class="form-input">
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="eduPin" placeholder="Enter 4-digit PIN" maxlength="4" class="form-input">
        </div>
    `;
    
    const footerHTML = `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitEducationPurchase()" class="btn-primary">Purchase</button>
    `;
    
    showModal('Education Services', bodyHTML, footerHTML);
}

async function submitEducationPurchase() {
    const examType = document.getElementById('examType').value;
    const quantity = parseInt(document.getElementById('eduQuantity').value);
    const pin = document.getElementById('eduPin').value;
    
    if (!quantity || quantity < 1) {
        showError('Please enter valid quantity');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    try {
        showLoading('Processing purchase...');
        const response = await api.purchaseEducationPIN(examType, quantity, pin);
        showSuccess(response.message || 'Purchase successful! PINs sent to your email.');
    } catch (error) {
        showError(error.message || 'Purchase failed. Please try again.');
    }
}

// ==================== SWAP/AIRTIME2CASH MODAL ====================
function showSwapModal() {
    const bodyHTML = `
        <div class="form-group">
            <label>Network</label>
            <select id="swapNetwork" class="form-input">
                <option value="MTN">MTN</option>
                <option value="AIRTEL">Airtel</option>
                <option value="GLO">Glo</option>
                <option value="9MOBILE">9mobile</option>
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
    
    if (!phone || phone.length !== 11) {
        showError('Please enter valid phone number');
        return;
    }
    if (!amount || amount < 500) {
        showError('Amount must be at least ₦500');
        return;
    }
    if (!pin || pin.length !== 4) {
        showError('Please enter your 4-digit PIN');
        return;
    }
    
    try {
        showLoading('Processing swap...');
        const response = await api.swapAirtime(phone, network, amount, pin);
        showSuccess(response.message || `Swap successful! ₦${(amount * 0.85).toLocaleString()} credited to your wallet.`);
    } catch (error) {
        showError(error.message || 'Swap failed. Please try again.');
    }
}

// Simple placeholders for coming soon features
function showSMSModal() { showError('Bulk SMS service coming soon!'); }
function showRemitaModal() { showError('Remita payment coming soon!'); }
function showAlphaModal() { showError('Alpha service coming soon!'); }

// WALLET MODALS
function showFundModal() { showError('Fund wallet feature coming soon!'); }
function showTransferModal() { showError('Transfer feature coming soon!'); }
function showWithdrawModal() { showError('Withdrawal feature coming soon!'); }

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
    const bodyHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="notification-item">
                <div><strong>Welcome to Yareema!</strong><br><small style="color: #64748b;">Your account has been created successfully</small></div>
                <small style="color: #94a3b8;">2 hours ago</small>
            </div>
            <div class="notification-item">
                <div><strong>System Update</strong><br><small style="color: #64748b;">New features available</small></div>
                <small style="color: #94a3b8;">1 day ago</small>
            </div>
        </div>
    `;
    
    showModal('Notifications', bodyHTML, '<button onclick="closeModal()" class="btn-primary" style="width: 100%;">Close</button>');
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
