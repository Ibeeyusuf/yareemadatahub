// Services Module - Handles all business logic and data

// Data Plans
const dataPlans = {
    mtn: [
        { name: '500MB - 30 Days', price: 150, commission: 5 },
        { name: '1GB - 30 Days', price: 280, commission: 5 },
        { name: '2GB - 30 Days', price: 560, commission: 5 },
        { name: '5GB - 30 Days', price: 1500, commission: 5 },
        { name: '10GB - 30 Days', price: 2800, commission: 5 }
    ],
    airtel: [
        { name: '500MB - 30 Days', price: 140, commission: 4.5 },
        { name: '1GB - 30 Days', price: 270, commission: 4.5 },
        { name: '2GB - 30 Days', price: 540, commission: 4.5 },
        { name: '5GB - 30 Days', price: 1450, commission: 4.5 },
        { name: '10GB - 30 Days', price: 2700, commission: 4.5 }
    ],
    glo: [
        { name: '500MB - 30 Days', price: 130, commission: 4 },
        { name: '1GB - 30 Days', price: 250, commission: 4 },
        { name: '2GB - 30 Days', price: 500, commission: 4 },
        { name: '5GB - 30 Days', price: 1400, commission: 4 },
        { name: '10GB - 30 Days', price: 2600, commission: 4 }
    ],
    '9mobile': [
        { name: '500MB - 30 Days', price: 135, commission: 4 },
        { name: '1GB - 30 Days', price: 260, commission: 4 },
        { name: '2GB - 30 Days', price: 520, commission: 4 },
        { name: '5GB - 30 Days', price: 1420, commission: 4 },
        { name: '10GB - 30 Days', price: 2650, commission: 4 }
    ]
};

// Education Prices
const educationPrices = {
    waec: { price: 3500, commission: 200 },
    neco: { price: 1000, commission: 50 },
    jamb: { price: 4700, commission: 250 }
};

// Update Data Plans dropdown
function updateDataPlans() {
    const network = document.getElementById('dataNetwork')?.value;
    const planSelect = document.getElementById('dataPlan');
    
    if (!planSelect) return;
    
    planSelect.innerHTML = '<option value="">Select data plan...</option>';
    
    if (network && dataPlans[network]) {
        dataPlans[network].forEach((plan, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${plan.name} - ₦${plan.price} (${plan.commission}% commission)`;
            option.dataset.price = plan.price;
            option.dataset.commission = plan.commission;
            planSelect.appendChild(option);
        });
    }
}

// Calculate Commission
function calculateCommission(type) {
    if (type === 'data') {
        const planSelect = document.getElementById('dataPlan');
        const selectedOption = planSelect?.options[planSelect.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.price) {
            const price = parseFloat(selectedOption.dataset.price);
            const commissionRate = parseFloat(selectedOption.dataset.commission);
            const commission = (price * commissionRate / 100).toFixed(2);
            
            const amountEl = document.getElementById('dataAmount');
            const commissionEl = document.getElementById('dataCommission');
            const rateEl = document.getElementById('dataRate');
            const preview = document.getElementById('dataCommissionPreview');
            
            if (amountEl) amountEl.textContent = `₦${price}`;
            if (commissionEl) commissionEl.textContent = `₦${commission}`;
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
            
            if (amountEl) amountEl.textContent = `₦${amount}`;
            if (commissionEl) commissionEl.textContent = `₦${commission}`;
            if (rateEl) rateEl.textContent = `${commissionRate}%`;
            if (preview) preview.classList.remove('hidden');
        }
    }
}

// Calculate Education Cost
function calculateEducationCost() {
    const qtyInput = document.getElementById('educationQty');
    const qty = parseInt(qtyInput?.value) || 1;
    const prices = educationPrices[window.currentEducationType];
    
    if (prices) {
        const totalCost = prices.price * qty;
        const totalCommission = prices.commission * qty;
        
        const costEl = document.getElementById('educationCost');
        const commissionEl = document.getElementById('educationCommission');
        
        if (costEl) costEl.textContent = `₦${totalCost.toLocaleString()}`;
        if (commissionEl) commissionEl.textContent = `₦${totalCommission.toLocaleString()}`;
    }
}

// Update SMS Count
function updateSMSCount() {
    const messageInput = document.getElementById('smsMessage');
    const message = messageInput?.value || '';
    const charCount = message.length;
    const smsCount = Math.ceil(charCount / 160) || 0;
    
    const charCountEl = document.getElementById('charCount');
    const smsCountEl = document.getElementById('smsCount');
    const smsCostEl = document.getElementById('smsCost');
    
    if (charCountEl) charCountEl.textContent = charCount;
    if (smsCountEl) smsCountEl.textContent = smsCount;
    if (smsCostEl) smsCostEl.textContent = `₦${smsCount * 4}`;
}

// Form Handlers with Loading States
function handleDataPurchase(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Processing...';
    lucide.createIcons();
    
    // Simulate API call
    setTimeout(() => {
        showToast('Data purchase successful! Commission credited to your earnings.', 'success');
        form.reset();
        const preview = document.getElementById('dataCommissionPreview');
        if (preview) preview.classList.add('hidden');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
        
        // Update wallet balance (demo)
        updateWalletBalance(75);
    }, 1500);
}

function handleAirtimePurchase(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Processing...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Airtime purchase successful! Commission credited to your earnings.', 'success');
        form.reset();
        const preview = document.getElementById('airtimeCommissionPreview');
        if (preview) preview.classList.add('hidden');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
        
        updateWalletBalance(15);
    }, 1500);
}

function handleBillPayment(e, type) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Processing...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast(`${type === 'electricity' ? 'Electricity' : 'TV'} bill payment successful!`, 'success');
        form.reset();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
        
        updateWalletBalance(100);
    }, 1500);
}

function handleEducationPurchase(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Processing...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Education PIN purchased successfully! Check your email for PIN details.', 'success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
        closeModal('educationModal');
        
        updateWalletBalance(200);
    }, 1500);
}

function handleBulkSMS(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Sending...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Bulk SMS sent successfully to all recipients!', 'success');
        form.reset();
        updateSMSCount();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
    }, 2000);
}

function handleFundWallet(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    const amount = form.querySelector('input[type="number"]').value;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Processing...';
    lucide.createIcons();
    
    showToast('Redirecting to payment gateway...', 'info');
    
    setTimeout(() => {
        showToast(`Payment successful! ₦${parseFloat(amount).toLocaleString()} added to wallet.`, 'success');
        form.reset();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
        
        updateWalletBalance(parseFloat(amount));
    }, 2500);
}

function handleWithdrawal(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Submitting...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Withdrawal request submitted successfully! Funds will be transferred within 24 hours.', 'success');
        form.reset();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
    }, 1500);
}

function handleWithdrawalSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Withdrawal request submitted! Funds will be transferred within 24 hours.', 'success');
        submitBtn.disabled = false;
        closeModal('withdrawModal');
    }, 1000);
}

function handleAddCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Customer added successfully to your database!', 'success');
        submitBtn.disabled = false;
        closeModal('addCustomerModal');
        form.reset();
    }, 1000);
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Updating...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Profile updated successfully!', 'success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
    }, 1000);
}

function handleBankUpdate(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Updating...';
    lucide.createIcons();
    
    setTimeout(() => {
        showToast('Bank details updated successfully!', 'success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        lucide.createIcons();
    }, 1000);
}

function handleChangePIN(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate PINs match
    const newPIN = form.querySelectorAll('input[type="password"]')[1].value;
    const confirmPIN = form.querySelectorAll('input[type="password"]')[2].value;
    
    if (newPIN !== confirmPIN) {
        showToast('PINs do not match!', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Transaction PIN changed successfully!', 'success');
        submitBtn.disabled = false;
        closeModal('changePINModal');
        form.reset();
    }, 1000);
}

function handleChangePassword(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate passwords match
    const newPass = form.querySelectorAll('input[type="password"]')[1].value;
    const confirmPass = form.querySelectorAll('input[type="password"]')[2].value;
    
    if (newPass !== confirmPass) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Password changed successfully!', 'success');
        submitBtn.disabled = false;
        closeModal('changePasswordModal');
        form.reset();
    }, 1000);
}

function generateReport(type) {
    showToast(`Generating ${type} report...`, 'info');
    setTimeout(() => {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully! Check your downloads.`, 'success');
    }, 2000);
}

// Helper function to update wallet balance
function updateWalletBalance(commission) {
    const walletElements = document.querySelectorAll('#walletBalance');
    walletElements.forEach(el => {
        const currentBalance = parseFloat(el.textContent.replace(/,/g, ''));
        const newBalance = currentBalance + commission;
        el.textContent = newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
    
    // Update localStorage
    const agentData = JSON.parse(localStorage.getItem('agentData') || '{}');
    agentData.walletBalance = parseFloat(document.querySelector('#walletBalance').textContent.replace(/,/g, ''));
    localStorage.setItem('agentData', JSON.stringify(agentData));
}
