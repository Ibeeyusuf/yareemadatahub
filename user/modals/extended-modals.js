// ==================== EXTENDED MODALS ====================
(function patchOpenModal() {
    const _orig = window.openModal;
    window.openModal = function(type) {
        const extMap = {
            'intl-airtime':  showIntlAirtimeModal,
            'smile':         showSmileModal,
            'alpha-caller':  showAlphaCallerModal,
            'kirani':        showKiraniModal,
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
// EXTEND API — new methods patched onto existing api instance
// ============================================================
Object.assign(api.__proto__, {

    // Spectranet
    async getSpectranetPackages() {
        return await this.request('/api/v1/telecom/spectranet/packages');
    },
    async purchaseSpectranet(deviceId, planId, transactionPin) {
        return await this.request('/api/v1/telecom/spectranet/purchase', {
            method: 'POST', body: { deviceId, planId, transactionPin }
        });
    },

    // Smile
    async getSmilePackages() {
        return await this.request('/api/v1/telecom/smile/packages');
    },
    async purchaseSmile(accountId, planId, transactionPin) {
        return await this.request('/api/v1/telecom/smile/purchase', {
            method: 'POST', body: { accountId, planId, transactionPin }
        });
    },

    // International Airtime
    async getIntlCountries() {
        return await this.request('/api/v1/telecom/international/countries');
    },
    async getIntlOperators(countryCode) {
        return await this.request(`/api/v1/telecom/international/operators/${countryCode}?page=1&size=100`);
    },
    async sendIntlTopup(payload) {
        return await this.request('/api/v1/telecom/international/topup', {
            method: 'POST', body: payload
        });
    },
    async getIntlTransactions(page = 0, size = 20) {
        return await this.request(`/api/v1/telecom/international/transactions?page=${page}&size=${size}`);
    },
    async getIntlTransactionByRef(reference) {
        return await this.request(`/api/v1/telecom/international/transactions/${reference}`);
    },

    // Gift Cards — Prestmit
    async getGiftCardCategories() {
        return await this.request('/api/v1/giftcards/categories');
    },
    async getGiftCardOrders(page = 1, limit = 20) {
        return await this.request(`/api/v1/giftcards/orders?page=${page}&limit=${limit}`);
    },
    async getGiftCardOrderById(orderId) {
        return await this.request(`/api/v1/giftcards/orders/${orderId}`);
    },

    // Gift Cards — Zendit
    async getZenditProducts(limit = 50, offset = 0, country = 'NG') {
        return await this.request(`/api/v1/giftcards/zendit/products?limit=${limit}&offset=${offset}&country=${country}`);
    },
    async getZenditProductById(offerId) {
        return await this.request(`/api/v1/giftcards/zendit/products/${offerId}`);
    },
    async purchaseZenditGiftCard(payload) {
        return await this.request('/api/v1/giftcards/zendit/purchase', {
            method: 'POST', body: payload
        });
    },
    async getZenditOrderStatus(transactionId) {
        return await this.request(`/api/v1/giftcards/zendit/orders/${transactionId}`);
    },

    // Flights extra
    async getDomesticAirlines() {
        return await this.request('/api/v1/flights/domestic/airlines');
    },
    async getDomesticBookings() {
        return await this.request('/api/v1/flights/domestic/bookings');
    },
    async getIntlBookings(limit = 20, offset = 0) {
        return await this.request(`/api/v1/flights/international/bookings?limit=${limit}&offset=${offset}`);
    },
    async getIntlBookingById(orderId) {
        return await this.request(`/api/v1/flights/international/bookings/${orderId}`);
    },
});


// ============================================================
// 1. INTERNATIONAL AIRTIME
// ============================================================
let intlCountriesList = [];
let intlOperatorsList = [];
let intlSelectedOp    = null;

function showIntlAirtimeModal() {
    intlCountriesList = [];
    intlOperatorsList = [];
    intlSelectedOp    = null;

    showModal('International Airtime', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:16px;">
            <button type="button" id="intlTabTopup" onclick="intlSwitchTab('topup')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#2563eb;color:#fff;transition:all .2s;">📤 Top-Up</button>
            <button type="button" id="intlTabHistory" onclick="intlSwitchTab('history')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">📋 History</button>
            <button type="button" id="intlTabLookup" onclick="intlSwitchTab('lookup')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">🔍 Lookup</button>
        </div>

        <!-- TOP-UP TAB -->
        <div id="intlTopupTab">
            <div class="form-group">
                <label>Select Country</label>
                <select id="intlCountry" class="form-input" onchange="onIntlCountryChange()">
                    <option value="">Loading countries…</option>
                </select>
            </div>
            <div class="form-group" id="intlOperatorGroup" style="display:none;">
                <label>Select Operator</label>
                <div id="intlOperatorList" style="display:flex;flex-direction:column;gap:8px;"></div>
            </div>
            <div class="form-group" id="intlPhoneGroup" style="display:none;">
                <label>Recipient Phone Number <span style="font-size:11px;color:#94a3b8;">(without country code)</span></label>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span id="intlDialCode" style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-weight:600;color:#1e3d5c;white-space:nowrap;">—</span>
                    <input type="tel" id="intlPhone" class="form-input" placeholder="e.g. 241234567" style="flex:1;" oninput="updateIntlReceipt()">
                </div>
            </div>
            <div class="form-group" id="intlAmountGroup" style="display:none;">
                <label id="intlAmountLabel">Amount</label>
                <div id="intlFixedDenoms" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;"></div>
                <input type="number" id="intlAmount" class="form-input" placeholder="Enter amount" oninput="updateIntlReceipt()">
                <div id="intlAmountHint" style="font-size:11px;color:#94a3b8;margin-top:4px;"></div>
            </div>
            <div class="form-group" id="intlNgnGroup" style="display:none;">
                <label id="intlNgnLabel">NGN Amount to Debit from Wallet</label>
                <input type="number" id="intlAmountNgn" class="form-input" placeholder="e.g. 8500" oninput="updateIntlReceipt()">
            </div>
            <div id="intlReceipt" style="display:none;background:#f8fafc;border-radius:10px;padding:14px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                    <span style="color:#64748b;">Operator</span><span id="intlReceiptOp" style="font-weight:600;color:#0f172a;"></span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                    <span style="color:#64748b;">Number</span><span id="intlReceiptNum" style="font-weight:600;color:#0f172a;"></span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                    <span style="color:#64748b;">Amount</span><span id="intlReceiptAmt" style="font-weight:600;color:#0f172a;"></span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                    <span style="color:#64748b;">NGN Debit</span><span id="intlReceiptNgn" style="font-weight:600;color:#16a34a;"></span>
                </div>
            </div>
            <div class="form-group" id="intlPinGroup" style="display:none;">
                <label>Transaction PIN</label>
                <input type="password" id="intlPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
            </div>
        </div>

        <!-- HISTORY TAB -->
        <div id="intlHistoryTab" style="display:none;">
            <div id="intlHistoryList" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading transactions…
                </div>
            </div>
        </div>

        <!-- LOOKUP TAB -->
        <div id="intlLookupTab" style="display:none;">
            <div class="form-group">
                <label>Transaction Reference</label>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="intlLookupRef" class="form-input" placeholder="Enter reference" style="flex:1;">
                    <button onclick="lookupIntlTransaction()"
                        style="padding:0 16px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">Search</button>
                </div>
            </div>
            <div id="intlLookupResult" style="display:none;"></div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="intlSubmitBtn" onclick="submitIntlAirtime()" class="btn-primary">Top-Up Now</button>
    `);
    _loadIntlCountries();
}

function intlSwitchTab(tab) {
    const ACTIVE   = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#2563eb;color:#fff;transition:all .2s;';
    const INACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('intlTabTopup').style.cssText   = tab === 'topup'   ? ACTIVE : INACTIVE;
    document.getElementById('intlTabHistory').style.cssText = tab === 'history' ? ACTIVE : INACTIVE;
    document.getElementById('intlTabLookup').style.cssText  = tab === 'lookup'  ? ACTIVE : INACTIVE;
    document.getElementById('intlTopupTab').style.display   = tab === 'topup'   ? '' : 'none';
    document.getElementById('intlHistoryTab').style.display = tab === 'history' ? '' : 'none';
    document.getElementById('intlLookupTab').style.display  = tab === 'lookup'  ? '' : 'none';
    const btn = document.getElementById('intlSubmitBtn');
    if (btn) btn.style.display = tab === 'topup' ? '' : 'none';
    if (tab === 'history') _loadIntlHistory();
}

async function _loadIntlCountries() {
    try {
        const res = await api.getIntlCountries();
        intlCountriesList = res.data || res.countries || (Array.isArray(res) ? res : []);
        const sel = document.getElementById('intlCountry');
        if (!sel) return;
        if (!intlCountriesList.length) { sel.innerHTML = '<option value="">No countries available</option>'; return; }
        sel.innerHTML = '<option value="">— Choose Country —</option>' +
            intlCountriesList.map(c => {
                const code = c.isoCode || c.countryCode || c.iso2 || c.code || '';
                const name = c.name || c.isoName || c.countryName || code;
                const dial = (c.callingCodes || c.callingCode || ['+?'])[0] || '+?';
                return `<option value="${code}" data-dial="${dial}">${name} (${dial})</option>`;
            }).join('');
    } catch (e) {
        const sel = document.getElementById('intlCountry');
        if (sel) sel.innerHTML = '<option value="">Failed to load — retry</option>';
    }
}

async function onIntlCountryChange() {
    const sel  = document.getElementById('intlCountry');
    const code = sel.value;
    const dial = sel.options[sel.selectedIndex]?.dataset?.dial || '—';
    intlOperatorsList = [];
    intlSelectedOp    = null;
    document.getElementById('intlDialCode').textContent = dial;
    document.getElementById('intlOperatorGroup').style.display = 'none';
    document.getElementById('intlPhoneGroup').style.display    = 'none';
    document.getElementById('intlAmountGroup').style.display   = 'none';
    document.getElementById('intlNgnGroup').style.display      = 'none';
    document.getElementById('intlPinGroup').style.display      = 'none';
    document.getElementById('intlReceipt').style.display       = 'none';
    if (!code) return;

    const opList = document.getElementById('intlOperatorList');
    document.getElementById('intlOperatorGroup').style.display = '';
    opList.innerHTML = `<div style="text-align:center;padding:20px 0;color:#94a3b8;font-size:13px;">
        <div style="width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 8px;"></div>
        Loading operators…
    </div>`;
    try {
        const res = await api.getIntlOperators(code);
        intlOperatorsList = res.data?.content || res.data || res.operators || (Array.isArray(res) ? res : []);
        if (!intlOperatorsList.length) {
            opList.innerHTML = '<div style="font-size:13px;color:#94a3b8;text-align:center;padding:12px 0;">No operators found for this country.</div>';
            return;
        }
        opList.innerHTML = intlOperatorsList.map((op, i) => {
            const name = op.name || op.operatorName || `Operator ${i + 1}`;
            const fx   = op.fxRate ? `1 USD ≈ ₦${Number(op.fxRate).toLocaleString(undefined, {maximumFractionDigits:2})}` : '';
            const minMax = [
                op.minAmount != null ? `Min: ${op.minAmount}` : '',
                op.maxAmount != null ? `Max: ${op.maxAmount}` : ''
            ].filter(Boolean).join(' · ');
            return `<div onclick="selectIntlOperator(${i}, this)" data-opidx="${i}"
                style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;
                       border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;transition:all .2s;">
                <div>
                    <div style="font-size:13px;font-weight:600;color:#0f172a;">${name}</div>
                    ${fx ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${fx}</div>` : ''}
                </div>
                <div style="font-size:11px;color:#2563eb;font-weight:600;">${minMax}</div>
            </div>`;
        }).join('');
    } catch (e) {
        opList.innerHTML = `<div style="font-size:13px;color:#dc2626;text-align:center;padding:12px 0;">${e.message || 'Failed to load operators.'}</div>`;
    }
}

function selectIntlOperator(idx, el) {
    intlSelectedOp = intlOperatorsList[idx];
    document.querySelectorAll('[data-opidx]').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#2563eb'; el.style.background = '#eff6ff';

    document.getElementById('intlPhoneGroup').style.display = '';
    document.getElementById('intlAmountGroup').style.display = '';
    document.getElementById('intlNgnGroup').style.display = '';
    document.getElementById('intlPinGroup').style.display = '';

    const op = intlSelectedOp;
    const useLocal = !!op.localAmountsSupported;
    const currency = useLocal ? (op.destinationCurrencyCode || 'Local') : 'USD';
    document.getElementById('intlAmountLabel').textContent = `Amount (${currency})`;

    const hint = [];
    if (op.minAmount != null) hint.push(`Min: ${op.minAmount} ${currency}`);
    if (op.maxAmount != null) hint.push(`Max: ${op.maxAmount} ${currency}`);
    document.getElementById('intlAmountHint').textContent = hint.join('  ·  ');

    const ngnLabel = document.getElementById('intlNgnLabel');
    if (ngnLabel && op.fxRate) {
        ngnLabel.innerHTML = `NGN Amount to Debit from Wallet <span style="font-size:11px;color:#94a3b8;">(FX: 1 USD ≈ ₦${Number(op.fxRate).toLocaleString(undefined, {maximumFractionDigits:2})})</span>`;
    }

    const denoms = op.denominationType === 'FIXED' ? (op.fixedAmounts || op.fixedAmountsList || []) : [];
    const denomContainer = document.getElementById('intlFixedDenoms');
    if (denoms.length) {
        denomContainer.innerHTML = denoms.slice(0, 8).map(d =>
            `<button type="button" onclick="selectIntlFixedDenom(${d}, this)"
                style="padding:7px 14px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;">
                ${currency} ${d}
            </button>`
        ).join('');
        document.getElementById('intlAmount').placeholder = 'Or type custom amount';
    } else {
        denomContainer.innerHTML = '';
        document.getElementById('intlAmount').placeholder = `Amount in ${currency}`;
    }
    updateIntlReceipt();
}

function selectIntlFixedDenom(val, btn) {
    document.querySelectorAll('#intlFixedDenoms button').forEach(b => { b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; });
    btn.style.borderColor = '#2563eb'; btn.style.background = '#eff6ff';
    document.getElementById('intlAmount').value = val;
    updateIntlReceipt();
}

function updateIntlReceipt() {
    if (!intlSelectedOp) return;
    const phone     = document.getElementById('intlPhone')?.value || '';
    const amount    = parseFloat(document.getElementById('intlAmount')?.value) || 0;
    const amountNgn = parseFloat(document.getElementById('intlAmountNgn')?.value) || 0;
    const receipt   = document.getElementById('intlReceipt');
    if (!phone || !amount || !amountNgn) { receipt.style.display = 'none'; return; }
    const op       = intlSelectedOp;
    const useLocal = !!op.localAmountsSupported;
    const currency = useLocal ? (op.destinationCurrencyCode || '') : 'USD';
    receipt.style.display = '';
    document.getElementById('intlReceiptOp').textContent  = op.name || op.operatorName || '—';
    document.getElementById('intlReceiptNum').textContent = phone;
    document.getElementById('intlReceiptAmt').textContent = `${amount} ${currency}`;
    document.getElementById('intlReceiptNgn').textContent = `₦${Number(amountNgn).toLocaleString()}`;
}

async function submitIntlAirtime() {
    const sel       = document.getElementById('intlCountry');
    const code      = sel?.value;
    const phone     = document.getElementById('intlPhone')?.value.trim();
    const amount    = parseFloat(document.getElementById('intlAmount')?.value);
    const amountNgn = parseFloat(document.getElementById('intlAmountNgn')?.value);
    const pin       = document.getElementById('intlPin')?.value.trim();
    if (!code)                        { showInlineError('Please select a country'); return; }
    if (!intlSelectedOp)              { showInlineError('Please select an operator'); return; }
    if (!phone || phone.length < 4)   { showInlineError('Please enter a valid recipient phone number'); return; }
    if (!amount || amount <= 0)       { showInlineError('Please enter a valid amount'); return; }
    if (!amountNgn || amountNgn <= 0) { showInlineError('Please enter the NGN amount to debit from your wallet'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.sendIntlTopup({
            operatorId:           intlSelectedOp.id || intlSelectedOp.operatorId,
            amount,
            useLocalAmount:       !!intlSelectedOp.localAmountsSupported,
            recipientCountryCode: code,
            recipientNumber:      phone,
            amountNgn,
            transactionPin:       pin
        });
        closeModal();
        const opName = intlSelectedOp.name || intlSelectedOp.operatorName || 'Operator';
        setTimeout(() => showSuccess(`${amount} top-up sent to ${phone} via ${opName}!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Top-Up Now');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}

async function _loadIntlHistory() {
    const container = document.getElementById('intlHistoryList');
    if (!container) return;
    try {
        const res  = await api.getIntlTransactions(0, 20);
        const txns = res.data?.content || res.data?.transactions || res.data || (Array.isArray(res) ? res : []);
        if (!txns.length) {
            container.innerHTML = '<div style="text-align:center;padding:20px 0;color:#94a3b8;font-size:13px;">No transactions found.</div>';
            return;
        }
        container.innerHTML = txns.map(t => {
            const status    = (t.status || t.transactionStatus || '').toLowerCase();
            const statusColor = status === 'successful' || status === 'success' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#f59e0b';
            const date = t.createdAt || t.transactionDate || '';
            return `<div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:13px;font-weight:600;color:#0f172a;">${t.operatorName || t.operator || '—'}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${t.recipientPhone || t.recipientNumber || '—'} · ${date ? new Date(date).toLocaleDateString() : ''}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">₦${Number(t.amountNgn || t.requestedAmount || 0).toLocaleString()}</div>
                        <div style="font-size:11px;font-weight:600;color:${statusColor};margin-top:2px;">${status || 'pending'}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">${e.message || 'Failed to load history.'}</div>`;
    }
}

async function lookupIntlTransaction() {
    const ref = document.getElementById('intlLookupRef')?.value.trim();
    if (!ref) { showInlineError('Please enter a transaction reference'); return; }
    const result = document.getElementById('intlLookupResult');
    result.style.display = '';
    result.innerHTML = `<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">
        <div style="width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 8px;"></div>
        Looking up…
    </div>`;
    try {
        const res = await api.getIntlTransactionByRef(ref);
        const t   = res.data || res;
        const status = (t.status || t.transactionStatus || '').toLowerCase();
        const statusColor = status === 'successful' || status === 'success' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#f59e0b';
        result.innerHTML = `<div style="background:#f8fafc;border-radius:10px;padding:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Reference</span><span style="font-weight:600;">${t.customIdentifier || t.transactionId || ref}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Operator</span><span style="font-weight:600;">${t.operatorName || t.operator || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Recipient</span><span style="font-weight:600;">${t.recipientPhone || t.recipientNumber || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Amount</span><span style="font-weight:600;">₦${Number(t.amountNgn || t.requestedAmount || 0).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
                <span style="color:#64748b;">Status</span><span style="font-weight:700;color:${statusColor};">${status || 'unknown'}</span>
            </div>
        </div>`;
    } catch (e) {
        result.innerHTML = `<div style="padding:12px 14px;background:#fee2e2;border-radius:8px;font-size:13px;color:#dc2626;">${e.message || 'Transaction not found.'}</div>`;
    }
}


// ============================================================
// 2. SMILE
// ============================================================
let smilePkgList        = [];
let selectedSmilePlanObj = null;

function showSmileModal() {
    smilePkgList         = [];
    selectedSmilePlanObj = null;
    showModal('Smile Internet', `
        <div class="form-group">
            <label>Smile Account ID</label>
            <input type="text" id="smileAccount" class="form-input" placeholder="e.g. 0712345678" maxlength="15">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="smilePlans" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#ca8a04;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading plans…
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="smilePin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitSmile()" class="btn-primary">Purchase Plan</button>
    `);
    _loadSmilePlans();
}

async function _loadSmilePlans() {
    try {
        const res = await api.getSmilePackages();
        smilePkgList = res.data?.plans || res.data?.packages || res.data || res.plans || res.packages || (Array.isArray(res) ? res : []);
        const container = document.getElementById('smilePlans');
        if (!container) return;
        if (!smilePkgList.length) { container.innerHTML = '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No plans available.</div>'; return; }
        container.innerHTML = smilePkgList.map((p, i) => {
            const name     = p.name || p.planName || p.description || `Plan ${i + 1}`;
            const price    = Number(p.price || p.amount || p.planPrice || 0);
            const validity = p.validity || p.duration || p.period || '';
            const planId   = p.id || p.planId || p._id || String(i);
            return `<div onclick="selectSmilePkgItem('${planId}', ${i}, this)" data-smileidx="${i}"
                style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;
                       border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;transition:all .2s;">
                <div>
                    <div style="font-size:13px;font-weight:600;color:#0f172a;">${name}</div>
                    ${validity ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Validity: ${validity}</div>` : ''}
                </div>
                <div style="font-size:14px;font-weight:700;color:#ca8a04;">₦${price.toLocaleString()}</div>
            </div>`;
        }).join('');
    } catch (e) {
        const container = document.getElementById('smilePlans');
        if (container) container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">
            Failed to load plans. <span style="cursor:pointer;color:#ca8a04;" onclick="_loadSmilePlans()">Retry</span>
        </div>`;
    }
}

function selectSmilePkgItem(planId, idx, el) {
    selectedSmilePlanObj = { planId, ...smilePkgList[idx] };
    document.querySelectorAll('[data-smileidx]').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#ca8a04'; el.style.background = '#fef9c3';
}

async function submitSmile() {
    const accountId = document.getElementById('smileAccount')?.value.trim();
    const pin       = document.getElementById('smilePin')?.value.trim();
    if (!accountId)                   { showInlineError('Please enter your Smile Account ID'); return; }
    if (!selectedSmilePlanObj)        { showInlineError('Please select a plan'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.purchaseSmile(accountId, selectedSmilePlanObj.planId, pin);
        closeModal();
        const name = selectedSmilePlanObj.name || selectedSmilePlanObj.planName || 'Plan';
        setTimeout(() => showSuccess(`Smile ${name} activated on ${accountId}!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase Plan');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 3. SPECTRANET
// ============================================================
let spectranetPkgList        = [];
let selectedSpectranetPkgObj = null;

function showSpectranetModal() {
    spectranetPkgList        = [];
    selectedSpectranetPkgObj = null;
    showModal('Spectranet', `
        <div class="form-group">
            <label>Spectranet Device ID</label>
            <input type="text" id="spectranetDevice" class="form-input" placeholder="e.g. 07012345678">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="spectranetPlans" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0d9488;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading packages…
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="spectranetPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitSpectranet()" class="btn-primary">Subscribe</button>
    `);
    _loadSpectranetPackages();
}

async function _loadSpectranetPackages() {
    try {
        const res = await api.getSpectranetPackages();
        spectranetPkgList = res.data?.plans || res.data?.packages || res.data || res.plans || res.packages || (Array.isArray(res) ? res : []);
        const container = document.getElementById('spectranetPlans');
        if (!container) return;
        if (!spectranetPkgList.length) { container.innerHTML = '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No packages available.</div>'; return; }
        container.innerHTML = spectranetPkgList.map((p, i) => {
            const name     = p.name || p.planName || p.description || `Package ${i + 1}`;
            const price    = Number(p.price || p.amount || p.planPrice || 0);
            const validity = p.validity || p.duration || p.period || '';
            const planId   = p.id || p.planId || p._id || String(i);
            return `<div onclick="selectSpectranetPkgItem('${planId}', ${i}, this)" data-specidx="${i}"
                style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;
                       border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;transition:all .2s;">
                <div>
                    <div style="font-size:13px;font-weight:600;color:#0f172a;">${name}</div>
                    ${validity ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">Validity: ${validity}</div>` : ''}
                </div>
                <div style="font-size:14px;font-weight:700;color:#0d9488;">₦${price.toLocaleString()}</div>
            </div>`;
        }).join('');
    } catch (e) {
        const container = document.getElementById('spectranetPlans');
        if (container) container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">
            Failed to load packages. <span style="cursor:pointer;color:#0d9488;" onclick="_loadSpectranetPackages()">Retry</span>
        </div>`;
    }
}

function selectSpectranetPkgItem(planId, idx, el) {
    selectedSpectranetPkgObj = { planId, ...spectranetPkgList[idx] };
    document.querySelectorAll('[data-specidx]').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#0d9488'; el.style.background = '#f0fdfa';
}

async function submitSpectranet() {
    const deviceId = document.getElementById('spectranetDevice')?.value.trim();
    const pin      = document.getElementById('spectranetPin')?.value.trim();
    if (!deviceId)                    { showInlineError('Please enter your Spectranet Device ID'); return; }
    if (!selectedSpectranetPkgObj)    { showInlineError('Please select a package'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.purchaseSpectranet(deviceId, selectedSpectranetPkgObj.planId, pin);
        closeModal();
        const name = selectedSpectranetPkgObj.name || selectedSpectranetPkgObj.planName || 'Package';
        setTimeout(() => showSuccess(`Spectranet ${name} activated on ${deviceId}!`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Subscribe');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 4. ALPHA CALLER
// ============================================================
let selectedAlphaPlan = null;

function showAlphaCallerModal() {
    selectedAlphaPlan = null;
    showModal('Alpha Caller', `
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="alphaPhone" class="form-input" placeholder="e.g. 08012345678" maxlength="11">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="alphaPlans" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#9333ea;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading plans…
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="alphaPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitAlpha()" class="btn-primary">Purchase</button>
    `);
    loadAlphaPlans();
}

async function loadAlphaPlans() {
    try {
        const res   = await api.getAlphaPlans();
        const plans = res.data?.plans || res.data || res.plans || [];
        const container = document.getElementById('alphaPlans');
        if (!container) return;
        if (!plans.length) { container.innerHTML = '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No plans available</div>'; return; }
        container.innerHTML = plans.map(p =>
            `<div onclick="selectAlphaPlanItem('${p.id || p._id}', this)" data-planid="${p.id || p._id}"
                style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;
                       border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;transition:all .2s;">
                <div>
                    <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.name || p.title || p.description || 'Plan ' + (p.id || p._id)}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${p.validity || p.duration || '30 Days'}</div>
                </div>
                <div style="font-size:14px;font-weight:700;color:#9333ea;">₦${Number(p.price || p.amount || 0).toLocaleString()}</div>
            </div>`
        ).join('');
    } catch (e) {
        const container = document.getElementById('alphaPlans');
        if (container) container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">Failed to load plans. Please try again.</div>`;
    }
}

function selectAlphaPlanItem(id, el) {
    selectedAlphaPlan = id;
    document.querySelectorAll('#alphaPlans > div').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#9333ea'; el.style.background = '#faf5ff';
}

async function submitAlpha() {
    const phone = document.getElementById('alphaPhone')?.value.trim();
    const pin   = document.getElementById('alphaPin')?.value.trim();
    if (!phone || phone.length < 10)  { showInlineError('Please enter a valid phone number'); return; }
    if (!selectedAlphaPlan)           { showInlineError('Please select a plan'); return; }
    if (!pin || pin.length < 4)       { showInlineError('Please enter your 4-digit PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.purchaseAlpha(phone, String(selectedAlphaPlan), pin);
        closeModal();
        setTimeout(() => showSuccess('Alpha Caller plan purchased successfully!'), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 5. GIFT CARDS (Prestmit + Zendit, with Orders tab)
// ============================================================
let gcProducts      = [];
let gcSelectedDenom = null;
let gcActiveProvider = 'prestmit'; // 'prestmit' | 'zendit'
let gcZenditProducts = [];
let gcZenditSelectedDenom = null;
let gcOrders        = [];

async function showGiftCardsModal() {
    gcProducts            = [];
    gcSelectedDenom       = null;
    gcZenditProducts      = [];
    gcZenditSelectedDenom = null;
    gcOrders              = [];
    gcActiveProvider      = 'prestmit';

    showModal('Gift Cards', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:16px;">
            <button type="button" id="gcTabBuy" onclick="gcSwitchTab('buy')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#ea580c;color:#fff;transition:all .2s;">🎁 Buy</button>
            <button type="button" id="gcTabOrders" onclick="gcSwitchTab('orders')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">📦 My Orders</button>
        </div>

        <!-- BUY TAB -->
        <div id="gcBuyTab">
            <!-- Provider toggle -->
            <div style="display:flex;gap:8px;margin-bottom:14px;">
                <button type="button" id="gcProvPrestmit" onclick="gcSwitchProvider('prestmit')"
                    style="flex:1;padding:8px;border:1.5px solid #ea580c;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff7ed;color:#ea580c;">Prestmit</button>
                <button type="button" id="gcProvZendit" onclick="gcSwitchProvider('zendit')"
                    style="flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748b;">Zendit (16k+ products)</button>
            </div>

            <!-- PRESTMIT -->
            <div id="gcPrestmitSection">
                <div class="form-group">
                    <label>Select Gift Card</label>
                    <select id="gcProductSelect" class="form-input" onchange="onGCProductChange()">
                        <option value="">Loading gift cards…</option>
                    </select>
                </div>
                <div id="gcDenomSection" style="display:none;">
                    <div class="form-group">
                        <label>Select Value</label>
                        <div id="gcDenomGrid" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
                        <input type="number" id="gcRangeInput" class="form-input" placeholder="Enter value" style="margin-top:8px;display:none;" oninput="onGCRangeChange()">
                    </div>
                    <div id="gcCostRow" style="display:none;padding:10px 14px;background:#fff7ed;border-radius:8px;margin-bottom:4px;font-size:13px;">
                        You pay: <strong id="gcCostAmt" style="color:#ea580c;float:right;"></strong>
                    </div>
                    <div class="form-group">
                        <label>NGN Amount to Debit from Wallet</label>
                        <input type="number" id="gcAmountNgn" class="form-input" placeholder="e.g. 16500">
                    </div>
                    <div class="form-group">
                        <label>Recipient Email</label>
                        <input type="email" id="gcEmail" class="form-input" placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label>Transaction PIN</label>
                        <input type="password" id="gcPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
                    </div>
                </div>
            </div>

            <!-- ZENDIT -->
            <div id="gcZenditSection" style="display:none;">
                <div class="form-group">
                    <label>Select Gift Card</label>
                    <select id="gcZenditSelect" class="form-input" onchange="onZenditProductChange()">
                        <option value="">Loading gift cards…</option>
                    </select>
                </div>
                <div id="gcZenditDenomSection" style="display:none;">
                    <div class="form-group">
                        <label>Select Value</label>
                        <div id="gcZenditDenomGrid" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
                        <input type="number" id="gcZenditRangeInput" class="form-input" placeholder="Enter value" style="margin-top:8px;display:none;">
                    </div>
                    <div class="form-group">
                        <label>NGN Amount to Debit from Wallet</label>
                        <input type="number" id="gcZenditAmountNgn" class="form-input" placeholder="e.g. 16500">
                    </div>
                    <div class="form-group">
                        <label>Recipient Email</label>
                        <input type="email" id="gcZenditEmail" class="form-input" placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label>Transaction PIN</label>
                        <input type="password" id="gcZenditPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
                    </div>
                </div>
            </div>
        </div>

        <!-- ORDERS TAB -->
        <div id="gcOrdersTab" style="display:none;">
            <div id="gcOrdersList" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#ea580c;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading orders…
                </div>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="gcSubmitBtn" onclick="submitGiftCard()" class="btn-primary">Purchase</button>
    `);
    gcLoadProducts();
}

function gcSwitchTab(tab) {
    const ACTIVE   = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#ea580c;color:#fff;transition:all .2s;';
    const INACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('gcTabBuy').style.cssText    = tab === 'buy'    ? ACTIVE : INACTIVE;
    document.getElementById('gcTabOrders').style.cssText = tab === 'orders' ? ACTIVE : INACTIVE;
    document.getElementById('gcBuyTab').style.display    = tab === 'buy'    ? '' : 'none';
    document.getElementById('gcOrdersTab').style.display = tab === 'orders' ? '' : 'none';
    const btn = document.getElementById('gcSubmitBtn');
    if (btn) btn.style.display = tab === 'buy' ? '' : 'none';
    if (tab === 'orders') _loadGCOrders();
}

function gcSwitchProvider(provider) {
    gcActiveProvider = provider;
    document.getElementById('gcProvPrestmit').style.cssText = provider === 'prestmit'
        ? 'flex:1;padding:8px;border:1.5px solid #ea580c;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff7ed;color:#ea580c;'
        : 'flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748b;';
    document.getElementById('gcProvZendit').style.cssText = provider === 'zendit'
        ? 'flex:1;padding:8px;border:1.5px solid #ea580c;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff7ed;color:#ea580c;'
        : 'flex:1;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748b;';
    document.getElementById('gcPrestmitSection').style.display = provider === 'prestmit' ? '' : 'none';
    document.getElementById('gcZenditSection').style.display   = provider === 'zendit'   ? '' : 'none';
    if (provider === 'zendit' && !gcZenditProducts.length) gcLoadZenditProducts();
}

// Prestmit
async function gcLoadProducts() {
    const sel = document.getElementById('gcProductSelect');
    if (!sel) return;
    try {
        const res = await api.getGiftCardProducts();
        gcProducts = res.data?.products || res.data || res.products || res.items || [];
        if (!Array.isArray(gcProducts)) gcProducts = [];
        if (!gcProducts.length) { sel.innerHTML = '<option value="">No products available</option>'; return; }
        sel.innerHTML = '<option value="">— Choose a gift card —</option>' +
            gcProducts.map((p, i) => `<option value="${i}">${p.name || p.productName || p.title || 'Gift Card'}</option>`).join('');
    } catch (e) {
        sel.innerHTML = '<option value="">Failed to load — click to retry</option>';
        sel.onclick = () => { sel.onclick = null; sel.innerHTML = '<option value="">Loading…</option>'; gcLoadProducts(); };
    }
}

function onGCProductChange() {
    const idx     = document.getElementById('gcProductSelect')?.value;
    const section = document.getElementById('gcDenomSection');
    const costRow = document.getElementById('gcCostRow');
    const denomGrid  = document.getElementById('gcDenomGrid');
    const rangeInput = document.getElementById('gcRangeInput');
    gcSelectedDenom = null;
    if (costRow) costRow.style.display = 'none';
    if (!idx || idx === '') { if (section) section.style.display = 'none'; return; }
    const product = gcProducts[parseInt(idx)];
    if (!product) return;
    if (section) section.style.display = 'block';
    const denoms   = product.denominations || product.fixedValues || product.values || [];
    const currency = product.currency || 'USD';
    if (denoms.length) {
        if (rangeInput) rangeInput.style.display = 'none';
        if (denomGrid) denomGrid.innerHTML = denoms.map(d => {
            const val = typeof d === 'object' ? (d.value || d.amount) : d;
            const ngn = typeof d === 'object' ? (d.priceNgn || d.amountNgn || null) : null;
            return `<button type="button" onclick="gcSelectDenom(${val}, ${ngn || 'null'}, this)"
                style="padding:8px 16px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;">
                ${currency} ${val}${ngn ? `<div style="font-size:10px;font-weight:400;color:#94a3b8;margin-top:1px;">≈ ₦${Number(ngn).toLocaleString()}</div>` : ''}
            </button>`;
        }).join('');
    } else {
        if (denomGrid) denomGrid.innerHTML = '';
        if (rangeInput) {
            rangeInput.style.display = '';
            const min = product.minValue || 1, max = product.maxValue || 9999;
            rangeInput.placeholder = `${currency} ${min} – ${max}`;
            rangeInput.min = min; rangeInput.max = max;
        }
    }
}

function gcSelectDenom(val, priceNgn, btn) {
    gcSelectedDenom = { val, priceNgn };
    document.querySelectorAll('#gcDenomGrid button').forEach(b => { b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; });
    btn.style.borderColor = '#ea580c'; btn.style.background = '#fff7ed';
    const row = document.getElementById('gcCostRow');
    const amt = document.getElementById('gcCostAmt');
    if (row) row.style.display = 'block';
    if (amt) amt.textContent = priceNgn ? `₦${Number(priceNgn).toLocaleString()}` : 'Enter NGN amount below';
    if (priceNgn) {
        const ngnInput = document.getElementById('gcAmountNgn');
        if (ngnInput) ngnInput.value = priceNgn;
    }
}

function onGCRangeChange() {
    const v = parseFloat(document.getElementById('gcRangeInput')?.value) || 0;
    gcSelectedDenom = v > 0 ? { val: v, priceNgn: null } : null;
}

async function submitGiftCard() {
    if (gcActiveProvider === 'zendit') { submitZenditGiftCard(); return; }
    const idx       = document.getElementById('gcProductSelect')?.value;
    if (!idx || idx === '')            { showInlineError('Please select a gift card'); return; }
    if (!gcSelectedDenom)              { showInlineError('Please select a value'); return; }
    const amountNgn = parseFloat(document.getElementById('gcAmountNgn')?.value);
    const email     = document.getElementById('gcEmail')?.value.trim();
    const pin       = document.getElementById('gcPin')?.value.trim();
    if (!amountNgn || amountNgn <= 0)      { showInlineError('Please enter the NGN amount to debit'); return; }
    if (!email || !email.includes('@'))    { showInlineError('Please enter a valid recipient email'); return; }
    if (!pin || !/^\d{4}$/.test(pin))      { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        const product   = gcProducts[parseInt(idx)];
        const productId = product.id || product.productId || product._id;
        await api.purchaseGiftCard({ productId, value: gcSelectedDenom.val, quantity: 1, amountNgn, recipientEmail: email, transactionPin: pin });
        closeModal();
        const name = product.name || product.productName || 'Gift card';
        setTimeout(() => showSuccess(`${name} purchased! Your card will be sent to ${email}.`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase');
        showInlineError(e.message || 'Purchase failed. Please try again.');
    }
}

// Zendit
async function gcLoadZenditProducts() {
    const sel = document.getElementById('gcZenditSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Loading…</option>';
    try {
        const res = await api.getZenditProducts(50, 0, 'NG');
        gcZenditProducts = res.data?.products || res.data || res.products || (Array.isArray(res) ? res : []);
        if (!gcZenditProducts.length) { sel.innerHTML = '<option value="">No products available</option>'; return; }
        sel.innerHTML = '<option value="">— Choose a gift card —</option>' +
            gcZenditProducts.map((p, i) => `<option value="${i}">${p.title || p.name || p.offerId || 'Gift Card'}</option>`).join('');
    } catch (e) {
        sel.innerHTML = '<option value="">Failed to load — click to retry</option>';
        sel.onclick = () => { sel.onclick = null; gcLoadZenditProducts(); };
    }
}

function onZenditProductChange() {
    const idx     = document.getElementById('gcZenditSelect')?.value;
    const section = document.getElementById('gcZenditDenomSection');
    const denomGrid  = document.getElementById('gcZenditDenomGrid');
    const rangeInput = document.getElementById('gcZenditRangeInput');
    gcZenditSelectedDenom = null;
    if (!idx || idx === '') { if (section) section.style.display = 'none'; return; }
    const product = gcZenditProducts[parseInt(idx)];
    if (!product) return;
    if (section) section.style.display = 'block';

    const pricingType = (product.pricingType || product.denominationType || '').toUpperCase();
    const denoms = product.denominations || product.fixedValues || [];
    const currency = product.currency || 'USD';

    if (pricingType === 'FIXED' && denoms.length) {
        if (rangeInput) rangeInput.style.display = 'none';
        denomGrid.innerHTML = denoms.map(d => {
            const val = typeof d === 'object' ? (d.value || d.price) : d;
            return `<button type="button" onclick="selectZenditDenom(${val}, this)"
                style="padding:8px 16px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;">
                ${currency} ${val}
            </button>`;
        }).join('');
    } else {
        denomGrid.innerHTML = '';
        if (rangeInput) {
            rangeInput.style.display = '';
            const min = product.minValue || product.minPrice || 1;
            const max = product.maxValue || product.maxPrice || 9999;
            rangeInput.placeholder = `${currency} ${min} – ${max}`;
            rangeInput.min = min; rangeInput.max = max;
            rangeInput.oninput = () => {
                const v = parseFloat(rangeInput.value) || 0;
                gcZenditSelectedDenom = v > 0 ? v : null;
            };
        }
    }
}

function selectZenditDenom(val, btn) {
    gcZenditSelectedDenom = val;
    document.querySelectorAll('#gcZenditDenomGrid button').forEach(b => { b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; });
    btn.style.borderColor = '#ea580c'; btn.style.background = '#fff7ed';
}

async function submitZenditGiftCard() {
    const idx = document.getElementById('gcZenditSelect')?.value;
    if (!idx || idx === '')              { showInlineError('Please select a gift card'); return; }
    if (!gcZenditSelectedDenom)         { showInlineError('Please select a value'); return; }
    const amountNgn = parseFloat(document.getElementById('gcZenditAmountNgn')?.value);
    const email     = document.getElementById('gcZenditEmail')?.value.trim();
    const pin       = document.getElementById('gcZenditPin')?.value.trim();
    if (!amountNgn || amountNgn <= 0)   { showInlineError('Please enter the NGN amount to debit'); return; }
    if (!email || !email.includes('@')) { showInlineError('Please enter a valid recipient email'); return; }
    if (!pin || !/^\d{4}$/.test(pin))   { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        const product = gcZenditProducts[parseInt(idx)];
        const offerId = product.offerId || product.id || product._id;
        const pricingType = (product.pricingType || product.denominationType || '').toUpperCase();
        const body = {
            offerId,
            quantity: 1,
            amountNgn,
            transactionPin: pin,
            fields: [{ key: 'email address', value: email }]
        };
        // Only include value for RANGE type
        if (pricingType !== 'FIXED') body.value = gcZenditSelectedDenom;
        await api.purchaseZenditGiftCard(body);
        closeModal();
        const name = product.title || product.name || 'Gift card';
        setTimeout(() => showSuccess(`${name} purchased! Your card will be sent to ${email}.`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase');
        showInlineError(e.message || 'Purchase failed. Please try again.');
    }
}

// Orders
async function _loadGCOrders() {
    const container = document.getElementById('gcOrdersList');
    if (!container) return;
    try {
        const res  = await api.getGiftCardOrders(1, 20);
        const orders = res.data?.orders || res.data || (Array.isArray(res) ? res : []);
        if (!orders.length) { container.innerHTML = '<div style="text-align:center;padding:20px 0;color:#94a3b8;font-size:13px;">No orders found.</div>'; return; }
        container.innerHTML = orders.map(o => {
            const status      = (o.status || '').toLowerCase();
            const statusColor = status === 'successful' || status === 'success' || status === 'completed' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#f59e0b';
            const date = o.createdAt || o.orderDate || '';
            return `<div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:13px;font-weight:600;color:#0f172a;">${o.productName || o.name || o.giftCardName || '—'}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${o.recipientEmail || o.email || '—'} · ${date ? new Date(date).toLocaleDateString() : ''}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">₦${Number(o.amountNgn || o.amount || 0).toLocaleString()}</div>
                        <div style="font-size:11px;font-weight:600;color:${statusColor};margin-top:2px;">${status || 'pending'}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">${e.message || 'Failed to load orders.'}</div>`;
    }
}


// ============================================================
// 6. KIRANI
// ============================================================
let selectedKiraniPlan = null;

function showKiraniModal() {
    selectedKiraniPlan = null;
    showModal('Kirani', `
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="kiraniPhone" class="form-input" placeholder="e.g. 08012345678" maxlength="11">
        </div>
        <div class="form-group">
            <label>Select Plan</label>
            <div id="kiraniPlans" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0891b2;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading plans…
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="kiraniPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitKirani()" class="btn-primary">Purchase</button>
    `);
    loadKiraniPlans();
}

async function loadKiraniPlans() {
    try {
        const res   = await api.getKiraniPlans();
        const plans = res.data?.plans || res.data || res.plans || [];
        const container = document.getElementById('kiraniPlans');
        if (!container) return;
        if (!plans.length) { container.innerHTML = '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No plans available</div>'; return; }
        container.innerHTML = plans.map(p =>
            `<div onclick="selectKiraniPlanItem('${p.id || p._id}', this)" data-planid="${p.id || p._id}"
                style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;
                       border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;transition:all .2s;">
                <div>
                    <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.name || p.title || p.description || 'Plan ' + (p.id || p._id)}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${p.validity || p.duration || '30 Days'}</div>
                </div>
                <div style="font-size:14px;font-weight:700;color:#0891b2;">₦${Number(p.price || p.amount || 0).toLocaleString()}</div>
            </div>`
        ).join('');
    } catch (e) {
        const container = document.getElementById('kiraniPlans');
        if (container) container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">Failed to load plans. Please try again.</div>`;
    }
}

function selectKiraniPlanItem(id, el) {
    selectedKiraniPlan = id;
    document.querySelectorAll('#kiraniPlans > div').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#0891b2'; el.style.background = '#ecfeff';
}

async function submitKirani() {
    const phone = document.getElementById('kiraniPhone')?.value.trim();
    const pin   = document.getElementById('kiraniPin')?.value.trim();
    if (!phone || phone.length < 10)  { showInlineError('Please enter a valid phone number'); return; }
    if (!selectedKiraniPlan)          { showInlineError('Please select a plan'); return; }
    if (!pin || pin.length < 4)       { showInlineError('Please enter your 4-digit PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.purchaseKirani(phone, String(selectedKiraniPlan), pin);
        closeModal();
        setTimeout(() => showSuccess('Kirani plan purchased successfully!'), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Purchase');
        showInlineError(e.message || 'Transaction failed. Please try again.');
    }
}


// ============================================================
// 7. FLIGHTS
// ============================================================
const FLT_DOM_AIRPORTS = [
    { iata: 'LOS', name: 'Lagos (Murtala Muhammed)' },
    { iata: 'ABV', name: 'Abuja (Nnamdi Azikiwe)' },
    { iata: 'KAN', name: 'Kano (Mallam Aminu)' },
    { iata: 'PHC', name: 'Port Harcourt' },
    { iata: 'ENE', name: 'Enugu (Akanu Ibiam)' },
    { iata: 'QOW', name: 'Owerri (Sam Mbakwe)' },
    { iata: 'ILR', name: 'Ilorin' },
    { iata: 'BNI', name: 'Benin City' },
    { iata: 'YOL', name: 'Yola' },
    { iata: 'SKO', name: 'Sokoto' },
    { iata: 'MIU', name: 'Maiduguri' },
];

let fltMode          = 'domestic';
let fltSearchResults = [];
let fltSelectedOffer = null;
let fltCurrentStep   = 1;

function showFlightsModal() {
    fltMode = 'domestic'; fltSearchResults = []; fltSelectedOffer = null; fltCurrentStep = 1;
    const today   = new Date().toISOString().split('T')[0];
    const domOpts = FLT_DOM_AIRPORTS.map(a => `<option value="${a.iata}">${a.iata} – ${a.name}</option>`).join('');
    showModal('Flight Tickets', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:12px;">
            <button type="button" id="fltMainTabSearch" onclick="fltMainTab('search')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;">✈️ Search</button>
            <button type="button" id="fltMainTabBookings" onclick="fltMainTab('bookings')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">📋 My Bookings</button>
        </div>

        <!-- SEARCH + BOOK FLOW -->
        <div id="fltSearchSection">
            <div id="fltStep1">
                <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:16px;">
                    <button type="button" id="fltTabDom" onclick="fltSwitchMode('domestic')"
                        style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;">🇳🇬 Domestic</button>
                    <button type="button" id="fltTabIntl" onclick="fltSwitchMode('international')"
                        style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">🌍 International</button>
                </div>
                <div id="fltDomFields">
                    <div class="form-group"><label>From</label>
                        <select id="fltDomFrom" class="form-input"><option value="">— Select departure —</option>${domOpts}</select></div>
                    <div class="form-group"><label>To</label>
                        <select id="fltDomTo" class="form-input"><option value="">— Select destination —</option>${domOpts}</select></div>
                </div>
                <div id="fltIntlFields" style="display:none;">
                    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#1d4ed8;">
                        Enter IATA airport codes (e.g. LOS, LHR, JFK, DXB)
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;"><label>From (IATA)</label>
                            <input type="text" id="fltIntlFrom" class="form-input" placeholder="e.g. LOS" maxlength="3" style="text-transform:uppercase;"></div>
                        <div class="form-group" style="margin:0;"><label>To (IATA)</label>
                            <input type="text" id="fltIntlTo" class="form-input" placeholder="e.g. LHR" maxlength="3" style="text-transform:uppercase;"></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                    <div class="form-group" style="margin:0;"><label>Departure Date</label>
                        <input type="date" id="fltDate" class="form-input" min="${today}"></div>
                    <div class="form-group" style="margin:0;"><label>Adults</label>
                        <select id="fltAdults" class="form-input">
                            ${[1,2,3,4,5,6].map(n=>`<option value="${n}">${n} Adult${n>1?'s':''}</option>`).join('')}
                        </select></div>
                </div>
                <div class="form-group" style="margin-top:12px;"><label>Cabin Class</label>
                    <select id="fltCabin" class="form-input">
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                    </select></div>
            </div>
            <div id="fltStep2" style="display:none;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;cursor:pointer;" onclick="fltBackToSearch()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                    <span style="font-size:13px;color:#64748b;">New search</span>
                </div>
                <div id="fltResultsBox"></div>
                <div id="fltPassengerSection" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;">
                    <div id="fltBookingSummary" style="padding:10px 14px;background:#f0f9ff;border-radius:8px;margin-bottom:14px;font-size:13px;"></div>
                    <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">Passenger Details</div>
                    <div id="fltDomPax">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">First Name</label><input type="text" id="paxFirst" class="form-input" placeholder="First name"></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Last Name</label><input type="text" id="paxLast" class="form-input" placeholder="Last name"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Date of Birth</label><input type="date" id="paxDob" class="form-input"></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Gender</label><select id="paxGender" class="form-input"><option value="male">Male</option><option value="female">Female</option></select></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Email</label><input type="email" id="paxEmail" class="form-input" placeholder="email@example.com"></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Phone</label><input type="tel" id="paxPhone" class="form-input" placeholder="+2348012345678"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Document Type</label>
                                <select id="paxDocType" class="form-input"><option value="passport">Passport</option><option value="nin">NIN</option><option value="drivers_license">Driver's License</option></select></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Document No.</label><input type="text" id="paxDocNum" class="form-input" placeholder="Document number"></div>
                        </div>
                    </div>
                    <div id="fltIntlPax" style="display:none;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Given Name</label><input type="text" id="paxGiven" class="form-input" placeholder="Given name"></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Family Name</label><input type="text" id="paxFamily" class="form-input" placeholder="Family name"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Title</label>
                                <select id="paxTitle" class="form-input"><option value="mr">Mr</option><option value="ms">Ms</option><option value="mrs">Mrs</option><option value="dr">Dr</option></select></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Gender</label>
                                <select id="paxGenderIntl" class="form-input"><option value="male">Male</option><option value="female">Female</option></select></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Date of Birth</label><input type="date" id="paxDobIntl" class="form-input"></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Email</label><input type="email" id="paxEmailIntl" class="form-input" placeholder="email@example.com"></div>
                            <div class="form-group" style="margin:0;"><label style="font-size:11px;">Phone</label><input type="tel" id="paxPhoneIntl" class="form-input" placeholder="+2348012345678"></div>
                        </div>
                    </div>
                    <div class="form-group" style="margin-top:12px;"><label>Transaction PIN</label>
                        <input type="password" id="fltPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric"></div>
                </div>
            </div>
        </div>

        <!-- MY BOOKINGS -->
        <div id="fltBookingsSection" style="display:none;">
            <div id="fltBookingsList" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading bookings…
                </div>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="fltPrimaryBtn" onclick="fltHandlePrimary()" class="btn-primary">Search Flights</button>
    `);
}

function fltMainTab(tab) {
    const ACTIVE   = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;';
    const INACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('fltMainTabSearch').style.cssText   = tab === 'search'   ? ACTIVE : INACTIVE;
    document.getElementById('fltMainTabBookings').style.cssText = tab === 'bookings' ? ACTIVE : INACTIVE;
    document.getElementById('fltSearchSection').style.display   = tab === 'search'   ? '' : 'none';
    document.getElementById('fltBookingsSection').style.display = tab === 'bookings' ? '' : 'none';
    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) btn.style.display = tab === 'search' ? '' : 'none';
    if (tab === 'bookings') _loadFltBookings();
}

async function _loadFltBookings() {
    const container = document.getElementById('fltBookingsList');
    if (!container) return;
    try {
        const [domRes, intlRes] = await Promise.allSettled([
            api.getDomesticBookings(),
            api.getIntlBookings(20, 0)
        ]);
        const domBookings  = domRes.status  === 'fulfilled' ? (domRes.value.data?.bookings  || domRes.value.data  || []) : [];
        const intlBookings = intlRes.status === 'fulfilled' ? (intlRes.value.data?.bookings || intlRes.value.data || []) : [];
        const all = [
            ...domBookings.map(b => ({ ...b, _type: 'domestic' })),
            ...intlBookings.map(b => ({ ...b, _type: 'international' }))
        ];
        if (!all.length) { container.innerHTML = '<div style="text-align:center;padding:20px 0;color:#94a3b8;font-size:13px;">No bookings found.</div>'; return; }
        container.innerHTML = all.map(b => {
            const status = (b.status || b.bookingStatus || '').toLowerCase();
            const statusColor = status === 'confirmed' || status === 'success' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : '#f59e0b';
            const route = b.origin && b.destination ? `${b.origin} → ${b.destination}` : (b.flightNumber || b.orderId || '—');
            const date  = b.departureDate || b.departing_at || b.createdAt || '';
            return `<div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:13px;font-weight:600;color:#0f172a;">${route}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${b._type} · ${date ? new Date(date).toLocaleDateString() : ''}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">₦${Number(b.amountNgn || b.totalAmount || b.amount || 0).toLocaleString()}</div>
                        <div style="font-size:11px;font-weight:600;color:${statusColor};margin-top:2px;">${status || 'pending'}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">${e.message || 'Failed to load bookings.'}</div>`;
    }
}

function fltSwitchMode(mode) {
    fltMode = mode;
    const ACTIVE   = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;';
    const INACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    document.getElementById('fltTabDom').style.cssText  = mode === 'domestic'      ? ACTIVE : INACTIVE;
    document.getElementById('fltTabIntl').style.cssText = mode === 'international' ? ACTIVE : INACTIVE;
    document.getElementById('fltDomFields').style.display  = mode === 'domestic'      ? '' : 'none';
    document.getElementById('fltIntlFields').style.display = mode === 'international' ? '' : 'none';
}

function fltHandlePrimary() {
    if (fltCurrentStep === 1) fltDoSearch(); else fltDoBook();
}

function fltBackToSearch() {
    fltCurrentStep = 1; fltSelectedOffer = null;
    document.getElementById('fltStep1').style.display = '';
    document.getElementById('fltStep2').style.display = 'none';
    document.getElementById('fltPassengerSection').style.display = 'none';
    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) { btn.textContent = 'Search Flights'; btn.disabled = false; }
}

async function fltDoSearch() {
    let origin, destination;
    if (fltMode === 'domestic') {
        origin      = document.getElementById('fltDomFrom')?.value;
        destination = document.getElementById('fltDomTo')?.value;
        if (!origin)      { showInlineError('Please select a departure airport'); return; }
        if (!destination) { showInlineError('Please select a destination airport'); return; }
    } else {
        origin      = (document.getElementById('fltIntlFrom')?.value || '').trim().toUpperCase();
        destination = (document.getElementById('fltIntlTo')?.value   || '').trim().toUpperCase();
        if (!origin      || origin.length      !== 3) { showInlineError('Please enter a valid 3-letter departure code'); return; }
        if (!destination || destination.length !== 3) { showInlineError('Please enter a valid 3-letter destination code'); return; }
    }
    if (origin === destination) { showInlineError('Departure and destination cannot be the same'); return; }
    const departureDate = document.getElementById('fltDate')?.value;
    if (!departureDate) { showInlineError('Please select a departure date'); return; }
    const adults     = parseInt(document.getElementById('fltAdults')?.value) || 1;
    const cabinClass = document.getElementById('fltCabin')?.value || 'economy';

    document.getElementById('fltStep1').style.display = 'none';
    document.getElementById('fltStep2').style.display = '';
    document.getElementById('fltPassengerSection').style.display = 'none';
    document.getElementById('fltResultsBox').innerHTML = `<div style="text-align:center;padding:32px 0;color:#94a3b8;font-size:13px;">
        <div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
        Searching ${origin} → ${destination}…
    </div>`;
    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Searching…'; }
    try {
        const payload = { origin, destination, departureDate, returnDate: null, adults, children: 0, infants: 0, cabinClass };
        const res = fltMode === 'domestic'
            ? await api.searchDomesticFlights(payload)
            : await api.searchInternationalFlights(payload);
        fltSearchResults = res.data?.offers || res.data?.flights || res.offers || res.flights || (Array.isArray(res.data) ? res.data : []);
        if (!Array.isArray(fltSearchResults)) fltSearchResults = [];
        fltCurrentStep = 2;
        fltRenderResults(origin, destination);
        if (btn) { btn.textContent = 'Confirm Booking'; btn.disabled = true; }
    } catch (e) {
        document.getElementById('fltResultsBox').innerHTML = `<div style="text-align:center;padding:24px 0;">
            <p style="color:#dc2626;font-size:13px;margin-bottom:12px;">${e.message || 'Search failed. Please try again.'}</p>
            <button onclick="fltBackToSearch()" style="padding:8px 20px;background:#0284c7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">← Back to Search</button>
        </div>`;
        if (btn) { btn.textContent = 'Confirm Booking'; btn.disabled = true; }
    }
}

function fltRenderResults(origin, destination) {
    const box = document.getElementById('fltResultsBox');
    if (!box) return;
    if (!fltSearchResults.length) {
        box.innerHTML = `<div style="text-align:center;padding:32px 0;font-size:13px;color:#64748b;">
            No flights found for ${origin} → ${destination}.<br>
            <span style="cursor:pointer;color:#0284c7;" onclick="fltBackToSearch()">Try different dates.</span>
        </div>`;
        return;
    }
    box.innerHTML = `<div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">
        ${fltSearchResults.length} flight${fltSearchResults.length !== 1 ? 's' : ''} · ${origin} → ${destination}
    </div>` + fltSearchResults.slice(0, 10).map((f, i) => {
        const airline  = f.owner?.name || f.airline || f.airlineName || 'Airline';
        const price    = f.total_amount || f.priceNgn || f.price || f.amount || 0;
        const segments = f.slices?.[0]?.segments || [];
        const seg0 = segments[0], segN = segments[segments.length - 1];
        const d0 = seg0?.departing_at || f.departureTime || '';
        const dN = segN?.arriving_at  || f.arrivalTime   || '';
        const dTime = d0 ? new Date(d0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        const aTime = dN ? new Date(dN).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        const stops = Math.max(0, segments.length - 1);
        return `<div onclick="fltSelectOffer(${i}, this)" data-fltidx="${i}"
            style="padding:14px;border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;margin-bottom:8px;transition:all .2s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <span style="font-size:13px;font-weight:700;color:#0f172a;">${airline}</span>
                <span style="font-size:15px;font-weight:700;color:#0284c7;">₦${Number(price).toLocaleString()}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="text-align:center;min-width:48px;">
                    <div style="font-size:14px;font-weight:700;">${dTime}</div>
                    <div style="font-size:10px;color:#94a3b8;">${origin}</div>
                </div>
                <div style="flex:1;text-align:center;">
                    <div style="border-top:1.5px solid #e2e8f0;position:relative;">
                        <span style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-size:12px;">✈️</span>
                    </div>
                    ${stops > 0 ? `<div style="font-size:10px;color:#f59e0b;margin-top:4px;">${stops} stop${stops > 1 ? 's' : ''}</div>` : ''}
                </div>
                <div style="text-align:center;min-width:48px;">
                    <div style="font-size:14px;font-weight:700;">${aTime}</div>
                    <div style="font-size:10px;color:#94a3b8;">${destination}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function fltSelectOffer(i, el) {
    fltSelectedOffer = fltSearchResults[i];
    document.querySelectorAll('[data-fltidx]').forEach(d => { d.style.borderColor = '#e2e8f0'; d.style.background = '#fff'; });
    el.style.borderColor = '#0284c7'; el.style.background = '#f0f9ff';
    const price   = fltSelectedOffer.total_amount || fltSelectedOffer.priceNgn || fltSelectedOffer.price || 0;
    const airline = fltSelectedOffer.owner?.name  || fltSelectedOffer.airline  || 'Selected Flight';
    const summary = document.getElementById('fltBookingSummary');
    if (summary) summary.innerHTML = `<strong>${airline}</strong><span style="float:right;font-weight:700;color:#0284c7;">₦${Number(price).toLocaleString()}</span>`;
    document.getElementById('fltDomPax').style.display  = fltMode === 'domestic'      ? '' : 'none';
    document.getElementById('fltIntlPax').style.display = fltMode === 'international' ? '' : 'none';
    document.getElementById('fltPassengerSection').style.display = '';
    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm Booking'; }
}

async function fltDoBook() {
    if (!fltSelectedOffer) { showInlineError('Please select a flight first'); return; }
    const pin = document.getElementById('fltPin')?.value.trim();
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    const price   = fltSelectedOffer.total_amount || fltSelectedOffer.priceNgn || fltSelectedOffer.price || 0;
    const offerId = fltSelectedOffer.id || fltSelectedOffer.offerId || fltSelectedOffer._id;
    setSubmitLoading(true, 'Booking…');
    try {
        if (fltMode === 'domestic') {
            const firstName = document.getElementById('paxFirst')?.value.trim();
            const lastName  = document.getElementById('paxLast')?.value.trim();
            const dob       = document.getElementById('paxDob')?.value;
            const gender    = document.getElementById('paxGender')?.value;
            const email     = document.getElementById('paxEmail')?.value.trim();
            const phone     = document.getElementById('paxPhone')?.value.trim();
            const docType   = document.getElementById('paxDocType')?.value;
            const docNum    = document.getElementById('paxDocNum')?.value.trim();
            if (!firstName || !lastName) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter passenger name'); return; }
            if (!dob)                    { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter date of birth'); return; }
            if (!email || !email.includes('@')) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter a valid email'); return; }
            if (!phone)  { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter a phone number'); return; }
            if (!docNum) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter document number'); return; }
            await api.bookDomesticFlight({
                offerId, amountNgn: Number(price), contactEmail: email, contactPhone: phone, transactionPin: pin,
                passengers: [{ firstName, lastName, dateOfBirth: dob, gender,
                    title: gender === 'female' ? 'Ms' : 'Mr', email, phone, documentType: docType, documentNumber: docNum }]
            });
        } else {
            const givenName  = document.getElementById('paxGiven')?.value.trim();
            const familyName = document.getElementById('paxFamily')?.value.trim();
            const title      = document.getElementById('paxTitle')?.value;
            const gender     = document.getElementById('paxGenderIntl')?.value;
            const dob        = document.getElementById('paxDobIntl')?.value;
            const email      = document.getElementById('paxEmailIntl')?.value.trim();
            const phone      = document.getElementById('paxPhoneIntl')?.value.trim();
            const passengerId = fltSelectedOffer.passengers?.[0]?.id;
            if (!givenName || !familyName) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter passenger name'); return; }
            if (!dob)  { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter date of birth'); return; }
            if (!email || !email.includes('@')) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter a valid email'); return; }
            if (!phone) { setSubmitLoading(false,'','Confirm Booking'); showInlineError('Please enter phone number'); return; }
            await api.bookInternationalFlight({
                offerId, amountNgn: Number(price), transactionPin: pin,
                passengers: [{ id: passengerId, given_name: givenName, family_name: familyName,
                    born_on: dob, gender, title, email, phone_number: phone }],
                services: []
            });
        }
        closeModal();
        setTimeout(() => showSuccess('Flight booked successfully! Your e-ticket will be sent to your email.'), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Confirm Booking');
        showInlineError(e.message || 'Booking failed. Please try again.');
    }
}