// ==================== EXTENDED MODALS ====================
// Patch openModal to include new services
(function patchOpenModal() {
    const _orig = window.openModal;
    window.openModal = function(type) {
        const extMap = {
            'intl-airtime':  showIntlAirtimeModal,
            'smile':         showSmileModal,
            'alpha-caller':  showAlphaCallerModal,
            'giftcards':     showGiftCardsModal,
            'spectranet':    showSpectranetModal,
            'flights':       showFlightsModal,
        };
        if (extMap[type]) extMap[type]();
        else if (_orig) _orig(type);
        else showError('Service not available. Please try again later.');
    };
})();

// ============================================================
// 1. INTERNATIONAL AIRTIME TOP-UP
// ============================================================

const INTL_COUNTRIES = [
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', dial: '+233' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', dial: '+254' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dial: '+27' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dial: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dial: '+1' },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳', dial: '+221' },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲', dial: '+237' },
    { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '+225' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', dial: '+49' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91' },
];

const INTL_AMOUNTS = [500, 1000, 2000, 3000, 5000];

function showIntlAirtimeModal() {
    showModal('International Airtime', `
        <div class="form-group">
            <label>Select Country</label>
            <select id="intlCountry" class="form-input" onchange="onIntlCountryChange()">
                <option value="">-- Choose Country --</option>
                ${INTL_COUNTRIES.map(c => `<option value="${c.code}" data-dial="${c.dial}">${c.flag} ${c.name} (${c.dial})</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <div style="display:flex;gap:8px;align-items:center;">
                <span id="intlDialCode" style="padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;
                    border-radius:8px;font-size:14px;font-weight:600;color:#1e3d5c;white-space:nowrap;min-width:60px;text-align:center;">
                    —
                </span>
                <input type="tel" id="intlPhone" class="form-input" placeholder="Phone number" style="flex:1;">
            </div>
            <div id="intlOperator" style="margin-top:8px;display:none;padding:8px 12px;background:#eff6ff;
                border-radius:8px;font-size:12px;font-weight:600;color:#1e3d5c;"></div>
        </div>
        <div class="form-group">
            <label>Amount (₦)</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                ${INTL_AMOUNTS.map(a => `
                    <button type="button" onclick="selectIntlAmount(${a}, this)"
                        style="padding:8px 14px;border:1.5px solid #e2e8f0;border-radius:8px;
                               background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;">
                        ₦${a.toLocaleString()}
                    </button>`).join('')}
            </div>
            <input type="number" id="intlAmount" class="form-input" placeholder="Or enter custom amount">
        </div>
        <div id="intlReceipt" style="display:none;background:#f8fafc;border-radius:10px;padding:14px;margin-top:-8px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Destination</span>
                <span id="intlReceiptDest" style="font-weight:600;color:#0f172a;"></span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Amount</span>
                <span id="intlReceiptAmt" style="font-weight:600;color:#0f172a;"></span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Payment</span>
                <span style="font-weight:600;color:#16a34a;">Wallet</span>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitIntlAirtime()" class="btn-primary">Top-Up Now</button>
    `);
}

function onIntlCountryChange() {
    const sel = document.getElementById('intlCountry');
    const opt = sel.options[sel.selectedIndex];
    const dial = opt.dataset.dial || '—';
    document.getElementById('intlDialCode').textContent = dial;
    const phoneInput = document.getElementById('intlPhone');
    if (phoneInput) phoneInput.addEventListener('input', detectIntlOperator);
}

function detectIntlOperator() {
    const phone = document.getElementById('intlPhone').value;
    const opDiv = document.getElementById('intlOperator');
    if (phone.length >= 4) {
        opDiv.style.display = 'block';
        opDiv.textContent = '📡 Auto-detecting network operator...';
        setTimeout(() => { opDiv.textContent = '✅ Operator detected'; }, 800);
    } else {
        opDiv.style.display = 'none';
    }
}

function selectIntlAmount(amount, btn) {
    document.querySelectorAll('#modalBody button[onclick^="selectIntlAmount"]').forEach(b => {
        b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; b.style.color = '#0f172a';
    });
    btn.style.borderColor = '#1e3d5c'; btn.style.background = '#eff6ff'; btn.style.color = '#1e3d5c';
    document.getElementById('intlAmount').value = amount;
    updateIntlReceipt();
}

function updateIntlReceipt() {
    const country = document.getElementById('intlCountry');
    const phone = document.getElementById('intlPhone').value;
    const amount = document.getElementById('intlAmount').value;
    const receipt = document.getElementById('intlReceipt');
    if (country.value && phone && amount) {
        const opt = country.options[country.selectedIndex];
        receipt.style.display = 'block';
        document.getElementById('intlReceiptDest').textContent = `${opt.dataset.dial || ''} ${phone}`;
        document.getElementById('intlReceiptAmt').textContent = `₦${Number(amount).toLocaleString()}`;
    }
}

async function submitIntlAirtime() {
    const country = document.getElementById('intlCountry').value;
    const phone = document.getElementById('intlPhone').value;
    const amount = document.getElementById('intlAmount').value;
    if (!country) { showInlineError('Please select a country'); return; }
    if (!phone || phone.length < 5) { showInlineError('Please enter a valid phone number'); return; }
    if (!amount || Number(amount) < 100) { showInlineError('Minimum amount is ₦100'); return; }
    setSubmitLoading(true, 'Processing...');
    try {
        await new Promise(r => setTimeout(r, 1500)); // replace with actual API call
        closeModal();
        setTimeout(() => showSuccess(`₦${Number(amount).toLocaleString()} airtime sent to ${phone} successfully!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Top-Up Now');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 2. SMILE DATA & VOICE
// ============================================================

const SMILE_PLANS = {
    data: [
        { id: 'sm-1gb-d', label: '1GB Daily', price: 200, validity: '1 Day' },
        { id: 'sm-2gb-w', label: '2GB Weekly', price: 500, validity: '7 Days' },
        { id: 'sm-5gb-m', label: '5GB Monthly', price: 1200, validity: '30 Days' },
        { id: 'sm-10gb-m', label: '10GB Monthly', price: 2200, validity: '30 Days' },
        { id: 'sm-unl-m', label: 'Unlimited Monthly', price: 4500, validity: '30 Days' },
    ],
    voice: [
        { id: 'sm-v50-d', label: '50 Mins Daily', price: 150, validity: '1 Day' },
        { id: 'sm-v200-w', label: '200 Mins Weekly', price: 500, validity: '7 Days' },
        { id: 'sm-v500-m', label: '500 Mins Monthly', price: 1000, validity: '30 Days' },
        { id: 'sm-unl-v', label: 'Unlimited Calls', price: 3500, validity: '30 Days' },
    ]
};

let smileTab = 'data';

function showSmileModal() {
    smileTab = 'data';
    showModal('Smile Data & Voice', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:18px;">
            <button id="smileTabData" onclick="switchSmileTab('data')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:#1e3d5c;color:#fff;transition:all .2s;">
                📶 Data Bundles
            </button>
            <button id="smileTabVoice" onclick="switchSmileTab('voice')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">
                📞 Voice Recharge
            </button>
        </div>
        <div class="form-group">
            <label>Smile Account Number</label>
            <input type="text" id="smileAccount" class="form-input" placeholder="e.g. 0712345678" maxlength="12">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="smilePlans" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
        <div id="smileHistory" style="display:none;margin-top:4px;">
            <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px;">Recent Transactions</div>
            <div style="font-size:12px;color:#94a3b8;text-align:center;padding:12px 0;">No recent transactions</div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitSmile()" class="btn-primary">Purchase Plan</button>
    `);
    renderSmilePlans('data');
}

function switchSmileTab(tab) {
    smileTab = tab;
    document.getElementById('smileTabData').style.cssText = tab === 'data'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#1e3d5c;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('smileTabVoice').style.cssText = tab === 'voice'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#1e3d5c;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    renderSmilePlans(tab);
}

let selectedSmilePlan = null;

function renderSmilePlans(tab) {
    selectedSmilePlan = null;
    const plans = SMILE_PLANS[tab];
    const container = document.getElementById('smilePlans');
    container.innerHTML = plans.map(p => `
        <div onclick="selectSmilePlan('${p.id}', this)" data-planid="${p.id}"
            style="display:flex;justify-content:space-between;align-items:center;
                   padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
                   cursor:pointer;background:#fff;transition:all .2s;">
            <div>
                <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.label}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Validity: ${p.validity}</div>
            </div>
            <div style="font-size:14px;font-weight:700;color:#1e3d5c;">₦${p.price.toLocaleString()}</div>
        </div>`).join('');
}

function selectSmilePlan(id, el) {
    selectedSmilePlan = SMILE_PLANS[smileTab].find(p => p.id === id);
    document.querySelectorAll('#smilePlans > div').forEach(d => {
        d.style.borderColor = '#e2e8f0'; d.style.background = '#fff';
    });
    el.style.borderColor = '#1e3d5c'; el.style.background = '#eff6ff';
}

async function submitSmile() {
    const account = document.getElementById('smileAccount').value.trim();
    if (!account) { showInlineError('Please enter your Smile account number'); return; }
    if (!selectedSmilePlan) { showInlineError('Please select a plan'); return; }
    setSubmitLoading(true, 'Processing...');
    try {
        await new Promise(r => setTimeout(r, 1500));
        closeModal();
        setTimeout(() => showSuccess(`${selectedSmilePlan.label} activated on ${account}!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase Plan');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 3. ALPHA CALLER
// ============================================================

const ALPHA_CREDIT_PACKS = [
    { id: 'ac-500', label: '₦500 Credit', minutes: 60, price: 500 },
    { id: 'ac-1000', label: '₦1,000 Credit', minutes: 130, price: 1000 },
    { id: 'ac-2000', label: '₦2,000 Credit', minutes: 270, price: 2000 },
    { id: 'ac-5000', label: '₦5,000 Credit', minutes: 700, price: 5000 },
];

let selectedAlphaPack = null;
let alphaCallerTab = 'topup';

function showAlphaCallerModal() {
    alphaCallerTab = 'topup';
    showModal('Alpha Caller', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:18px;">
            <button id="alphaTabTopup" onclick="switchAlphaTab('topup')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;
                       background:#1e3d5c;color:#fff;transition:all .2s;">💳 Top-Up</button>
            <button id="alphaTabMins" onclick="switchAlphaTab('minutes')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">⏱ Minutes</button>
            <button id="alphaTabHistory" onclick="switchAlphaTab('history')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">📋 History</button>
        </div>
        <div id="alphaTabContent"></div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="alphaSubmitBtn" onclick="submitAlpha()" class="btn-primary">Continue</button>
    `);
    renderAlphaTab('topup');
}

function switchAlphaTab(tab) {
    alphaCallerTab = tab;
    ['topup','minutes','history'].forEach(t => {
        const btn = document.getElementById('alphaTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (!btn) return;
        btn.style.cssText = t === tab
            ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;background:#1e3d5c;color:#fff;transition:all .2s;'
            : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    });
    renderAlphaTab(tab);
    const submitBtn = document.getElementById('alphaSubmitBtn');
    if (submitBtn) submitBtn.style.display = tab === 'history' ? 'none' : '';
}

function renderAlphaTab(tab) {
    const content = document.getElementById('alphaTabContent');
    if (tab === 'topup') {
        content.innerHTML = `
            <div class="form-group">
                <label>Alpha Caller Username / ID</label>
                <input type="text" id="alphaUserId" class="form-input" placeholder="Enter your Alpha Caller ID">
            </div>
            <div class="form-group">
                <label>Select Credit Pack</label>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${ALPHA_CREDIT_PACKS.map(p => `
                        <div onclick="selectAlphaPack('${p.id}', this)" data-packid="${p.id}"
                            style="display:flex;justify-content:space-between;align-items:center;
                                   padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
                                   cursor:pointer;background:#fff;transition:all .2s;">
                            <div>
                                <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.label}</div>
                                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">~${p.minutes} minutes</div>
                            </div>
                            <div style="font-size:14px;font-weight:700;color:#1e3d5c;">₦${p.price.toLocaleString()}</div>
                        </div>`).join('')}
                </div>
            </div>`;
    } else if (tab === 'minutes') {
        content.innerHTML = `
            <div class="form-group">
                <label>Alpha Caller Username / ID</label>
                <input type="text" id="alphaUserIdMin" class="form-input" placeholder="Enter your Alpha Caller ID">
            </div>
            <div class="form-group">
                <label>Minutes to Purchase</label>
                <input type="number" id="alphaMinutes" class="form-input" placeholder="e.g. 100" min="10">
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Rate: ₦7/minute</div>
            </div>
            <div id="alphaMinsCalc" style="display:none;padding:12px;background:#eff6ff;border-radius:8px;font-size:13px;">
                <span style="color:#64748b;">Total Cost:</span>
                <strong id="alphaMinsTotal" style="color:#1e3d5c;float:right;"></strong>
            </div>`;
        setTimeout(() => {
            const inp = document.getElementById('alphaMinutes');
            if (inp) inp.addEventListener('input', () => {
                const mins = Number(inp.value) || 0;
                const calc = document.getElementById('alphaMinsCalc');
                const total = document.getElementById('alphaMinsTotal');
                if (mins >= 10) {
                    calc.style.display = 'block';
                    total.textContent = `₦${(mins * 7).toLocaleString()}`;
                } else calc.style.display = 'none';
            });
        }, 100);
    } else {
        content.innerHTML = `
            <div style="text-align:center;padding:32px 0;">
                <div style="width:48px;height:48px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p style="color:#64748b;font-size:13px;font-weight:600;">No usage history yet</p>
                <p style="color:#94a3b8;font-size:11px;margin-top:4px;">Your call logs will appear here</p>
            </div>`;
    }
}

function selectAlphaPack(id, el) {
    selectedAlphaPack = ALPHA_CREDIT_PACKS.find(p => p.id === id);
    document.querySelectorAll('#alphaTabContent > div:last-child > div').forEach(d => {
        d.style.borderColor = '#e2e8f0'; d.style.background = '#fff';
    });
    el.style.borderColor = '#1e3d5c'; el.style.background = '#eff6ff';
}

async function submitAlpha() {
    setSubmitLoading(true, 'Processing...');
    try {
        await new Promise(r => setTimeout(r, 1500));
        closeModal();
        setTimeout(() => showSuccess('Alpha Caller credit added successfully!'), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Continue');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 4. GIFT CARDS
// ============================================================

const GIFT_CARD_BRANDS = [
    { id: 'amazon', name: 'Amazon', emoji: '📦', color: '#FF9900', bg: '#fff8ee' },
    { id: 'apple', name: 'Apple', emoji: '🍎', color: '#555', bg: '#f5f5f7' },
    { id: 'google', name: 'Google Play', emoji: '🎮', color: '#0F9D58', bg: '#f0fdf4' },
    { id: 'steam', name: 'Steam', emoji: '🎲', color: '#1b2838', bg: '#e8f0fe' },
    { id: 'netflix', name: 'Netflix', emoji: '🎬', color: '#E50914', bg: '#fff0f0' },
];

const GIFT_CARD_DENOMINATIONS = [25, 50, 100, 200, 500];
let gcMode = 'buy';
let selectedGCBrand = null;

function showGiftCardsModal() {
    gcMode = 'buy';
    selectedGCBrand = null;
    showModal('Gift Cards', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:18px;">
            <button id="gcTabBuy" onclick="switchGCTab('buy')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:#1e3d5c;color:#fff;transition:all .2s;">🛒 Buy</button>
            <button id="gcTabSell" onclick="switchGCTab('sell')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">💰 Sell</button>
        </div>
        <div class="form-group">
            <label>Select Brand</label>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px;" id="gcBrands">
                ${GIFT_CARD_BRANDS.map(b => `
                    <div onclick="selectGCBrand('${b.id}', this)" data-brandid="${b.id}"
                        style="text-align:center;padding:12px 6px;border:1.5px solid #e2e8f0;
                               border-radius:10px;cursor:pointer;background:${b.bg};transition:all .2s;">
                        <div style="font-size:22px;margin-bottom:4px;">${b.emoji}</div>
                        <div style="font-size:10px;font-weight:600;color:#0f172a;">${b.name}</div>
                    </div>`).join('')}
            </div>
        </div>
        <div id="gcMainForm"></div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitGiftCard()" class="btn-primary">Continue</button>
    `);
    renderGCForm();
}

function switchGCTab(mode) {
    gcMode = mode;
    document.getElementById('gcTabBuy').style.cssText = mode === 'buy'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#1e3d5c;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('gcTabSell').style.cssText = mode === 'sell'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#1e3d5c;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    renderGCForm();
}

function selectGCBrand(id, el) {
    selectedGCBrand = GIFT_CARD_BRANDS.find(b => b.id === id);
    document.querySelectorAll('#gcBrands > div').forEach(d => {
        d.style.borderColor = '#e2e8f0';
    });
    el.style.borderColor = '#1e3d5c';
    renderGCForm();
}

function renderGCForm() {
    const container = document.getElementById('gcMainForm');
    if (!container) return;
    if (gcMode === 'buy') {
        container.innerHTML = `
            <div class="form-group">
                <label>Denomination (USD)</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                    ${GIFT_CARD_DENOMINATIONS.map(d => `
                        <button type="button" onclick="selectGCDenom(${d}, this)"
                            style="padding:8px 14px;border:1.5px solid #e2e8f0;border-radius:8px;
                                   background:#fff;font-size:13px;font-weight:600;cursor:pointer;">
                            $${d}
                        </button>`).join('')}
                </div>
                <input type="number" id="gcCustomDenom" class="form-input" placeholder="Or enter custom ($)">
            </div>
            <div class="form-group">
                <label>Delivery Email</label>
                <input type="email" id="gcEmail" class="form-input" placeholder="Email to receive card">
            </div>
            <div id="gcRateBox" style="display:none;padding:12px;background:#eff6ff;border-radius:8px;font-size:13px;">
                Rate: <strong id="gcRate" style="color:#1e3d5c;"></strong> &nbsp;|&nbsp; 
                You pay: <strong id="gcTotal" style="color:#1e3d5c;"></strong>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="form-group">
                <label>Card Code</label>
                <input type="text" id="gcCode" class="form-input" placeholder="Enter gift card code">
            </div>
            <div class="form-group">
                <label>Card Value (USD)</label>
                <input type="number" id="gcSellValue" class="form-input" placeholder="e.g. 100" oninput="calcGCSell()">
            </div>
            <div id="gcSellCalc" style="display:none;padding:12px;background:#f0fdf4;border-radius:8px;font-size:13px;">
                You receive: <strong id="gcSellReceive" style="color:#16a34a;"></strong>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Subject to admin approval · Credited to wallet</div>
            </div>`;
    }
}

function selectGCDenom(d, btn) {
    document.querySelectorAll('#gcMainForm button[onclick^="selectGCDenom"]').forEach(b => {
        b.style.borderColor = '#e2e8f0'; b.style.background = '#fff';
    });
    btn.style.borderColor = '#1e3d5c'; btn.style.background = '#eff6ff';
    document.getElementById('gcCustomDenom').value = d;
    const rate = 1650;
    document.getElementById('gcRateBox').style.display = 'block';
    document.getElementById('gcRate').textContent = `₦${rate.toLocaleString()}/$`;
    document.getElementById('gcTotal').textContent = `₦${(d * rate).toLocaleString()}`;
}

function calcGCSell() {
    const val = Number(document.getElementById('gcSellValue').value) || 0;
    const calc = document.getElementById('gcSellCalc');
    if (val > 0) {
        calc.style.display = 'block';
        document.getElementById('gcSellReceive').textContent = `₦${(val * 1550).toLocaleString()}`;
    } else calc.style.display = 'none';
}

async function submitGiftCard() {
    setSubmitLoading(true, 'Processing...');
    try {
        await new Promise(r => setTimeout(r, 1500));
        closeModal();
        const msg = gcMode === 'buy' ? 'Gift card purchase submitted! Check your email shortly.' : 'Gift card submitted for review. Wallet will be credited after approval.';
        setTimeout(() => showSuccess(msg), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Continue');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 5. SPECTRANET
// ============================================================

const SPECTRANET_PLANS = {
    home: [
        { id: 'sp-5gb', label: '5GB', price: 2500, validity: '30 Days' },
        { id: 'sp-10gb', label: '10GB', price: 4000, validity: '30 Days' },
        { id: 'sp-20gb', label: '20GB', price: 7500, validity: '30 Days' },
        { id: 'sp-unl', label: 'Unlimited', price: 15000, validity: '30 Days' },
    ],
    sme: [
        { id: 'sp-sme-50gb', label: '50GB SME', price: 18000, validity: '30 Days' },
        { id: 'sp-sme-100gb', label: '100GB SME', price: 30000, validity: '30 Days' },
        { id: 'sp-sme-unl', label: 'Unlimited SME', price: 50000, validity: '30 Days' },
    ]
};

let spectranetPlanType = 'home';
let selectedSpectranetPlan = null;

function showSpectranetModal() {
    spectranetPlanType = 'home';
    selectedSpectranetPlan = null;
    showModal('Spectranet', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:18px;">
            <button id="spTabHome" onclick="switchSpectranetTab('home')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:#0d9488;color:#fff;transition:all .2s;">🏠 Home</button>
            <button id="spTabSME" onclick="switchSpectranetTab('sme')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">🏢 SME</button>
        </div>
        <div class="form-group">
            <label>Spectranet Account Number</label>
            <div style="display:flex;gap:8px;">
                <input type="text" id="spectranetAccount" class="form-input" placeholder="e.g. 07012345678" style="flex:1;">
                <button onclick="validateSpectranetAccount()" 
                    style="padding:0 16px;background:#0d9488;color:#fff;border:none;border-radius:8px;
                           font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">Validate</button>
            </div>
            <div id="spectranetValidation" style="display:none;margin-top:6px;padding:8px 12px;border-radius:8px;font-size:12px;"></div>
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="spectranetPlans" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitSpectranet()" class="btn-primary">Subscribe</button>
    `);
    renderSpectranetPlans('home');
}

function switchSpectranetTab(type) {
    spectranetPlanType = type;
    document.getElementById('spTabHome').style.cssText = type === 'home'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0d9488;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('spTabSME').style.cssText = type === 'sme'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0d9488;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    renderSpectranetPlans(type);
}

function renderSpectranetPlans(type) {
    selectedSpectranetPlan = null;
    const plans = SPECTRANET_PLANS[type];
    const container = document.getElementById('spectranetPlans');
    container.innerHTML = plans.map(p => `
        <div onclick="selectSpectranetPlan('${p.id}', this)" data-planid="${p.id}"
            style="display:flex;justify-content:space-between;align-items:center;
                   padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
                   cursor:pointer;background:#fff;transition:all .2s;">
            <div>
                <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.label}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Validity: ${p.validity}</div>
            </div>
            <div style="font-size:14px;font-weight:700;color:#0d9488;">₦${p.price.toLocaleString()}</div>
        </div>`).join('');
}

function selectSpectranetPlan(id, el) {
    selectedSpectranetPlan = [...SPECTRANET_PLANS.home, ...SPECTRANET_PLANS.sme].find(p => p.id === id);
    document.querySelectorAll('#spectranetPlans > div').forEach(d => {
        d.style.borderColor = '#e2e8f0'; d.style.background = '#fff';
    });
    el.style.borderColor = '#0d9488'; el.style.background = '#f0fdfa';
}

function validateSpectranetAccount() {
    const acc = document.getElementById('spectranetAccount').value.trim();
    const div = document.getElementById('spectranetValidation');
    if (!acc) { div.style.display = 'block'; div.style.background = '#fee2e2'; div.style.color = '#dc2626'; div.textContent = 'Please enter an account number'; return; }
    div.style.display = 'block'; div.style.background = '#fef9c3'; div.style.color = '#92400e'; div.textContent = '🔄 Validating account...';
    setTimeout(() => {
        div.style.background = '#f0fdf4'; div.style.color = '#15803d';
        div.textContent = '✅ Account validated – Name: Spectranet User';
    }, 1200);
}

async function submitSpectranet() {
    const account = document.getElementById('spectranetAccount').value.trim();
    if (!account) { showInlineError('Please enter your Spectranet account number'); return; }
    if (!selectedSpectranetPlan) { showInlineError('Please select a data plan'); return; }
    setSubmitLoading(true, 'Processing...');
    try {
        await new Promise(r => setTimeout(r, 1500));
        closeModal();
        setTimeout(() => showSuccess(`Spectranet ${selectedSpectranetPlan.label} plan activated on ${account}!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Subscribe');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 6. FLIGHT TICKETS
// ============================================================

const POPULAR_AIRPORTS = [
    'Lagos (LOS)', 'Abuja (ABV)', 'Kano (KAN)', 'Port Harcourt (PHC)',
    'Enugu (ENU)', 'Benin (BNI)', 'Calabar (CBQ)', 'Owerri (QOW)'
];

let flightType = 'oneway';
let flightResults = [];

function showFlightsModal() {
    flightType = 'oneway';
    flightResults = [];
    showModal('Flight Tickets', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:18px;">
            <button id="fltTabOne" onclick="switchFlightType('oneway')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:#0284c7;color:#fff;transition:all .2s;">✈️ One-Way</button>
            <button id="fltTabReturn" onclick="switchFlightType('return')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;
                       background:transparent;color:#64748b;transition:all .2s;">🔄 Return</button>
        </div>
        <div class="form-group">
            <label>From</label>
            <select id="fltFrom" class="form-input">
                <option value="">-- Departure Airport --</option>
                ${POPULAR_AIRPORTS.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>To</label>
            <select id="fltTo" class="form-input">
                <option value="">-- Arrival Airport --</option>
                ${POPULAR_AIRPORTS.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group" style="margin:0;">
                <label>Departure Date</label>
                <input type="date" id="fltDepart" class="form-input" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group" id="fltReturnGroup" style="margin:0;display:none;">
                <label>Return Date</label>
                <input type="date" id="fltReturn" class="form-input">
            </div>
        </div>
        <div class="form-group" style="margin-top:14px;">
            <label>Passengers</label>
            <select id="fltPassengers" class="form-input">
                ${[1,2,3,4,5,6].map(n => `<option value="${n}">${n} Passenger${n>1?'s':''}</option>`).join('')}
            </select>
        </div>
        <div id="fltResults" style="margin-top:4px;"></div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="searchFlights()" class="btn-primary">Search Flights</button>
    `);
}

function switchFlightType(type) {
    flightType = type;
    document.getElementById('fltTabOne').style.cssText = type === 'oneway'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('fltTabReturn').style.cssText = type === 'return'
        ? 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;'
        : 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('fltReturnGroup').style.display = type === 'return' ? 'block' : 'none';
}

async function searchFlights() {
    const from = document.getElementById('fltFrom').value;
    const to = document.getElementById('fltTo').value;
    const depart = document.getElementById('fltDepart').value;
    if (!from) { showInlineError('Please select departure airport'); return; }
    if (!to) { showInlineError('Please select arrival airport'); return; }
    if (from === to) { showInlineError('Departure and arrival cannot be the same'); return; }
    if (!depart) { showInlineError('Please select a departure date'); return; }

    const btn = document.querySelector('#modalFooter .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Searching...'; }

    const resultsDiv = document.getElementById('fltResults');
    resultsDiv.innerHTML = `<div style="text-align:center;padding:24px 0;">
        <div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0284c7;
                    border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
        <p style="color:#64748b;font-size:13px;">Searching available flights...</p>
    </div>`;

    await new Promise(r => setTimeout(r, 1800));

    const mockFlights = [
        { airline: 'Air Peace', code: 'P4 781', depart: '07:00', arrive: '08:15', price: 28500, seats: 4 },
        { airline: 'Ibom Air', code: 'IB 205', depart: '10:30', arrive: '11:45', price: 32000, seats: 2 },
        { airline: 'Dana Air', code: 'DA 414', depart: '14:00', arrive: '15:15', price: 25000, seats: 6 },
    ];

    resultsDiv.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">
            ${mockFlights.length} flights found · ${from.split(' ')[0]} → ${to.split(' ')[0]}
        </div>
        ${mockFlights.map((f, i) => `
            <div onclick="selectFlight(${i}, this)" data-fi="${i}"
                style="padding:14px;border:1.5px solid #e2e8f0;border-radius:12px;
                       margin-bottom:8px;cursor:pointer;background:#fff;transition:all .2s;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">${f.airline}</div>
                        <div style="font-size:11px;color:#94a3b8;">${f.code}</div>
                    </div>
                    <div style="font-size:15px;font-weight:700;color:#0284c7;">₦${f.price.toLocaleString()}</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
                    <div style="text-align:center;">
                        <div style="font-size:15px;font-weight:700;">${f.depart}</div>
                        <div style="font-size:10px;color:#94a3b8;">${from.split(' ')[0]}</div>
                    </div>
                    <div style="flex:1;text-align:center;">
                        <div style="height:2px;background:#e2e8f0;position:relative;">
                            <span style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:14px;">✈️</span>
                        </div>
                        <div style="font-size:10px;color:#94a3b8;margin-top:6px;">1h 15m</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:15px;font-weight:700;">${f.arrive}</div>
                        <div style="font-size:10px;color:#94a3b8;">${to.split(' ')[0]}</div>
                    </div>
                </div>
                <div style="font-size:11px;color:#16a34a;margin-top:8px;">${f.seats} seats left</div>
            </div>`).join('')}`;

    window._mockFlights = mockFlights;
    if (btn) { btn.disabled = false; btn.textContent = 'Book Selected'; btn.onclick = bookFlight; }
}

let selectedFlightIndex = null;

function selectFlight(i, el) {
    selectedFlightIndex = i;
    document.querySelectorAll('[data-fi]').forEach(d => {
        d.style.borderColor = '#e2e8f0'; d.style.background = '#fff';
    });
    el.style.borderColor = '#0284c7'; el.style.background = '#f0f9ff';
}

async function bookFlight() {
    if (selectedFlightIndex === null) { showInlineError('Please select a flight first'); return; }
    const flight = window._mockFlights[selectedFlightIndex];
    setSubmitLoading(true, 'Booking...');
    await new Promise(r => setTimeout(r, 2000));
    closeModal();
    setTimeout(() => showSuccess(`${flight.airline} flight booked! Your e-ticket will be sent to your email.`), 300);
}
