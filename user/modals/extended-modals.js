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
            'esim':          showEsimModal,
            'spectranet':       showDataRechargePinModal,
            'data-recharge-pin': showDataRechargePinModal,
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
        return await this.request(`/api/v1/telecom/international/operators/${countryCode}?page=1&size=100&includeBundles=true`);
    },
    async sendIntlTopup(payload) {
        return await this.request('/api/v1/telecom/international/topup', {
            method: 'POST', body: payload
        });
    },
    async quoteIntlTopup(payload) {
        return await this.request('/api/v1/telecom/international/quote', {
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

    // Gift Cards — Reloadly catalog/quote/buy
    async getGiftCardCatalog(countryCode) {
        const q = countryCode ? `?countryCode=${countryCode}` : '';
        return await this.request(`/api/v1/giftcards/catalog${q}`);
    },
    async quoteGiftCard(payload) {
        return await this.request('/api/v1/giftcards/quote', { method: 'POST', body: payload });
    },
    async buyGiftCard(payload) {
        return await this.request('/api/v1/giftcards/buy', { method: 'POST', body: payload });
    },

    // Data Recharge PIN (EPIN)
    async getEpinPlans() {
        return await this.request('/api/v1/telecom/epin/plans');
    },
    async purchaseEpin(payload) {
        return await this.request('/api/v1/telecom/epin/purchase', { method: 'POST', body: payload });
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
    async searchDomesticFlights(data) {
        return await this.request('/api/v1/flights/domestic/search', { method: 'POST', body: data });
    },
    async bookDomesticFlight(data) {
        return await this.request('/api/v1/flights/domestic/book', { method: 'POST', body: data });
    },
    async searchInternationalFlights(data) {
        return await this.request('/api/v1/flights/international/search', { method: 'POST', body: data });
    },
    async bookInternationalFlight(data) {
        return await this.request('/api/v1/flights/international/book', { method: 'POST', body: data });
    },
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

    // eSIM
    async getEsimPackages() {
        return await this.request('/api/v1/esims/packages?locale=en');
    },
    async getEsimCompatibility(deviceName) {
        return await this.request(`/api/v1/esims/compatibility?device=${encodeURIComponent(deviceName)}`);
    },
    async getEsimQuote(payload) {
        return await this.request('/api/v1/esims/quote', { method: 'POST', body: payload });
    },
    async buyEsim(payload) {
        return await this.request('/api/v1/esims/order', { method: 'POST', body: payload });
    },
    async getEsimTopups() {
        return await this.request('/api/v1/esims/topups');
    },
    async getEsimOrderStatus(orderId) {
        return await this.request(`/api/v1/esims/orders/${orderId}`);
    },
});


// ============================================================
// eSIM
// ============================================================
let esimPackages = [];
let selectedEsimPackage = null;
let esimPackageFilter = 'All';
let esimPackageQuery = '';
let esimVisibleLimit = 6;

function showEsimModal() {
    esimPackages = [];
    selectedEsimPackage = null;
    esimPackageFilter = 'All';
    esimPackageQuery = '';
    esimVisibleLimit = 6;

    showModal('eSIM Packages', `
        <div class="form-group">
            <label for="esimPackageSearch">Find a destination or plan</label>
            <input type="search" id="esimPackageSearch" class="form-input" placeholder="Search countries, regions or data size" oninput="filterEsimPackages(this.value)" />
        </div>
        <div id="esimPackageFilters" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;white-space:nowrap;"></div>
        <div class="form-group">
            <label>Select Package</label>
            <div id="esimPackageList" style="display:flex;flex-direction:column;gap:8px;">
                <div style="padding:18px 12px;text-align:center;color:#94a3b8;font-size:13px;">Loading eSIM packages…</div>
            </div>
        </div>
        <div class="form-group">
            <label>Device Compatibility</label>
            <input type="text" id="esimDevice" class="form-input" placeholder="e.g. iPhone 15, Samsung S23" />
        </div>
        <div class="form-group">
            <label>Traveler Name</label>
            <input type="text" id="esimTravelerName" class="form-input" placeholder="Full name" />
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="esimEmail" class="form-input" placeholder="traveler@example.com" />
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="esimPhone" class="form-input" placeholder="+2348012345678" />
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="esimPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric" />
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="esimSubmitBtn" onclick="submitEsimOrder()" class="btn-primary">Buy eSIM</button>
    `);

    loadEsimPackages();
}

async function loadEsimPackages() {
    const container = document.getElementById('esimPackageList');
    if (!container) return;

    try {
        const res = await api.getEsimPackages();
        const data = res?.data?.data || res?.data || res?.items || [];
        esimPackages = Array.isArray(data) ? data : [];

        if (!esimPackages.length) {
            container.innerHTML = '<div style="padding:18px 12px;text-align:center;color:#94a3b8;font-size:13px;">No eSIM packages available right now.</div>';
            return;
        }

        renderEsimPackageFilters();
        renderEsimPackages();
    } catch (e) {
        container.innerHTML = `<div style="padding:18px 12px;text-align:center;color:#dc2626;font-size:13px;">${e.message || 'Failed to load eSIM packages.'}</div>`;
    }
}

function esimPackageCategory(pkg) {
    const coverage = pkg.coverage || pkg.coverageType || pkg.region || pkg.regionName || '';
    const coverageText = typeof coverage === 'string' ? coverage : JSON.stringify(coverage);
    const searchable = `${coverageText} ${pkg.title || ''} ${pkg.name || ''} ${pkg.description || ''}`.toLowerCase();
    const countries = Array.isArray(pkg.countries) ? pkg.countries : [];

    if (/global|worldwide/.test(searchable)) return 'Global';
    if (/regional|region/.test(searchable) || countries.length > 1) return 'Regional';
    return 'Country';
}

function renderEsimPackageFilters() {
    const container = document.getElementById('esimPackageFilters');
    if (!container) return;
    const categories = ['All', ...new Set(esimPackages.map(esimPackageCategory))];
    container.innerHTML = categories.map(category => {
        const active = category === esimPackageFilter;
        return `<button type="button" onclick="setEsimPackageFilter('${category}')" style="flex:0 0 auto;padding:7px 12px;border:1px solid ${active ? '#0e7490' : '#e2e8f0'};border-radius:999px;background:${active ? '#ecfeff' : '#fff'};color:${active ? '#0e7490' : '#475569'};font-size:12px;font-weight:600;cursor:pointer;">${category}</button>`;
    }).join('');
}

function setEsimPackageFilter(category) {
    esimPackageFilter = category;
    esimVisibleLimit = 6;
    renderEsimPackageFilters();
    renderEsimPackages();
}

function filterEsimPackages(query) {
    esimPackageQuery = (query || '').trim().toLowerCase();
    esimVisibleLimit = 6;
    renderEsimPackages();
}

function escapeEsimHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function renderEsimPackages() {
    const container = document.getElementById('esimPackageList');
    if (!container) return;

    const matches = esimPackages.map((pkg, index) => ({ pkg, index })).filter(({ pkg }) => {
        const matchesCategory = esimPackageFilter === 'All' || esimPackageCategory(pkg) === esimPackageFilter;
        const text = [pkg.title, pkg.name, pkg.description, pkg.country, pkg.countryName, pkg.region, pkg.regionName, pkg.data, pkg.benefit, pkg.amount]
            .map(value => typeof value === 'string' ? value : '')
            .join(' ').toLowerCase();
        return matchesCategory && (!esimPackageQuery || text.includes(esimPackageQuery));
    });

    if (!matches.length) {
        container.innerHTML = '<div style="padding:18px 12px;text-align:center;color:#64748b;font-size:13px;">No plans match those filters. Try another search or category.</div>';
        return;
    }

    const visible = matches.slice(0, esimVisibleLimit);
    const cards = visible.map(({ pkg, index }) => {
        const title = escapeEsimHtml(pkg.title || pkg.name || `Package ${index + 1}`);
        const dataLabel = escapeEsimHtml(pkg.data || pkg.benefit || pkg.amount || 'Data plan');
        const destination = escapeEsimHtml(pkg.countryName || pkg.country || pkg.regionName || pkg.region || esimPackageCategory(pkg));
        const price = pkg.retail_price ?? pkg.total_price ?? pkg.price ?? pkg.amount ?? 0;
        return `
            <button type="button" onclick="selectEsimPackage(${index}, this)" data-esim-index="${index}" style="width:100%;padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <span style="min-width:0;">
                    <span style="display:block;font-size:13px;font-weight:700;color:#0f172a;">${title}</span>
                    <span style="display:block;font-size:11px;color:#64748b;margin-top:3px;">${destination} · ${dataLabel}</span>
                </span>
                <span style="flex:0 0 auto;font-size:13px;font-weight:700;color:#0e7490;">₦${Number(price).toLocaleString()}</span>
            </button>
        `;
    }).join('');

    const moreButton = matches.length > esimVisibleLimit
        ? `<button type="button" onclick="showMoreEsimPackages()" style="padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#334155;font-size:12px;font-weight:600;cursor:pointer;">Show ${Math.min(6, matches.length - esimVisibleLimit)} more (${matches.length - esimVisibleLimit} remaining)</button>`
        : '';
    container.innerHTML = `<div style="font-size:11px;color:#64748b;margin:0 0 2px;">Showing ${visible.length} of ${matches.length} plans</div>${cards}${moreButton}`;
}

function showMoreEsimPackages() {
    esimVisibleLimit += 6;
    renderEsimPackages();
}

function selectEsimPackage(index, el) {
    selectedEsimPackage = esimPackages[index] || null;
    document.querySelectorAll('[data-esim-id]').forEach(node => {
        node.style.borderColor = '#e2e8f0';
        node.style.background = '#fff';
    });
    document.querySelectorAll('[data-esim-index]').forEach(node => {
        node.style.borderColor = '#e2e8f0';
        node.style.background = '#fff';
    });
    if (el) {
        el.style.borderColor = '#0e7490';
        el.style.background = '#ecfeff';
    }
}

async function submitEsimOrder() {
    const pkg = selectedEsimPackage;
    const device = document.getElementById('esimDevice')?.value.trim();
    const travelerName = document.getElementById('esimTravelerName')?.value.trim();
    const email = document.getElementById('esimEmail')?.value.trim();
    const phone = document.getElementById('esimPhone')?.value.trim();
    const pin = document.getElementById('esimPin')?.value.trim();

    if (!pkg) {
        showInlineError('Please select an eSIM package');
        return;
    }
    if (!device) {
        showInlineError('Please enter the device name or model');
        return;
    }
    if (!travelerName) {
        showInlineError('Please enter the traveler name');
        return;
    }
    if (!email || !email.includes('@')) {
        showInlineError('Please enter a valid email address');
        return;
    }
    if (!phone) {
        showInlineError('Please enter a phone number');
        return;
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
        showInlineError('Please enter your 4-digit PIN');
        return;
    }

    setSubmitLoading(true, 'Processing…');

    try {
        const payload = {
            packageId: pkg.id || pkg.package_id || pkg.slug,
            deviceName: device,
            travelerName,
            email,
            phone,
            transactionPin: pin,
            notes: 'eSIM purchase request'
        };
        await api.buyEsim(payload);
        closeModal();
        setTimeout(() => showSuccess('eSIM order placed successfully!'), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Buy eSIM');
        showInlineError(e.message || 'eSIM purchase failed. Please try again.');
    }
}


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
            <div class="form-group" id="intlSenderGroup" style="display:none;">
                <label>Your Phone Number <span style="font-size:11px;color:#94a3b8;">(sender)</span></label>
                <input type="tel" id="intlSenderNumber" class="form-input" placeholder="e.g. 08012345678">
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
                    <span style="color:#64748b;">You pay</span><span id="intlReceiptNgn" style="font-weight:600;color:#16a34a;"></span>
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
        const seen = new Set();
        sel.innerHTML = '<option value="">— Choose Country —</option>' +
            intlCountriesList.map(c => {
                const code = String(c.isoName || c.isoCode || c.countryCode || c.iso2 || c.code || '').toUpperCase();
                if (!code || seen.has(code)) return '';
                seen.add(code);
                const name = c.name || c.countryName || c.isoName || code;
                const dial = (c.callingCodes || c.callingCode || [''])[0] || '';
                return `<option value="${code}" data-dial="${dial}">${name}${dial ? ' (' + dial + ')' : ''}</option>`;
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
    document.getElementById('intlSenderGroup').style.display   = 'none';
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
    document.getElementById('intlSenderGroup').style.display = '';
    document.getElementById('intlPinGroup').style.display = '';

    const op = intlSelectedOp;
    const useLocal = intlOpLocal(op);
    const currency = intlOpCurrency(op);
    document.getElementById('intlAmountLabel').textContent = `Amount (${currency})`;

    const hint = [];
    if (op.minAmount != null) hint.push(`Min: ${op.minAmount} ${currency}`);
    if (op.maxAmount != null) hint.push(`Max: ${op.maxAmount} ${currency}`);
    document.getElementById('intlAmountHint').textContent = hint.join('  ·  ');

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

const SENDER_COUNTRY_CODE = 'NG';
let intlQuoteNgn = null, intlQuoteTimer = null;

function intlOpId(op){ return op && (op.operatorId ?? op.id); }
function intlOpCurrency(op){ return (op && (op.senderCurrencyCode || op.currency)) || 'USD'; }
function intlOpLocal(op){ return !!(op && (op.supportsLocalAmounts || op.localAmountsSupported)); }

function intlPickNgn(res){
    const d = (res && res.data) ? res.data : (res || {});
    const named = [d.nairaPrice, d.nairaAmount, d.amountNgn, d.priceNgn, d.totalNgn, d.amountInNgn, d.ngnAmount, d.ngn, d.naira];
    for (const v of named){ const x = Number(v); if (!isNaN(x) && x > 0) return Math.ceil(x); }
    const cur = String(d.currency || d.currencyCode || '').toUpperCase();
    if (cur === 'NGN'){ for (const v of [d.total, d.amount, d.price, d.amountCharged]){ const x = Number(v); if (!isNaN(x) && x > 0) return Math.ceil(x); } }
    return null;
}

function updateIntlReceipt() {
    if (!intlSelectedOp) return;
    const phone   = document.getElementById('intlPhone')?.value.trim() || '';
    const amount  = parseFloat(document.getElementById('intlAmount')?.value) || 0;
    const receipt = document.getElementById('intlReceipt');
    if (!phone || !amount) { receipt.style.display = 'none'; return; }
    const op = intlSelectedOp;
    const currency = intlOpCurrency(op);
    receipt.style.display = '';
    document.getElementById('intlReceiptOp').textContent  = op.name || op.operatorName || '—';
    document.getElementById('intlReceiptNum').textContent = phone;
    document.getElementById('intlReceiptAmt').textContent = `${amount} ${currency}`;
    document.getElementById('intlReceiptNgn').textContent = intlQuoteNgn ? `₦${Number(intlQuoteNgn).toLocaleString()}` : 'Enter recipient number to price';
    runIntlQuote();
}

// Quote needs recipientCountryCode + recipientNumber; runs once those + amount are set.
function runIntlQuote() {
    intlQuoteNgn = null;
    const code   = document.getElementById('intlCountry')?.value || '';
    const phone  = document.getElementById('intlPhone')?.value.trim() || '';
    const amount = parseFloat(document.getElementById('intlAmount')?.value) || 0;
    if (!intlSelectedOp || !amount || !code || phone.length < 4) return;
    const ngnEl = document.getElementById('intlReceiptNgn');
    if (ngnEl) ngnEl.textContent = 'Calculating…';
    clearTimeout(intlQuoteTimer);
    const sender = document.getElementById('intlSenderNumber')?.value.trim() || '';
    intlQuoteTimer = setTimeout(async () => {
        try {
            const res = await api.quoteIntlTopup({
                operatorId:           intlOpId(intlSelectedOp),
                amount,
                useLocalAmount:       intlOpLocal(intlSelectedOp),
                recipientCountryCode: code,
                recipientNumber:      phone,
                senderCountryCode:    SENDER_COUNTRY_CODE,
                senderNumber:         sender,
                amountNgn:            amount
            });
            if (parseFloat(document.getElementById('intlAmount')?.value) !== amount) return;
            intlQuoteNgn = intlPickNgn(res);
            const el = document.getElementById('intlReceiptNgn');
            if (el) el.textContent = intlQuoteNgn ? `₦${Number(intlQuoteNgn).toLocaleString()}` : 'Charged at checkout';
        } catch (e) {
            intlQuoteNgn = null;
            const el = document.getElementById('intlReceiptNgn');
            if (el) el.textContent = 'Charged at checkout';
        }
    }, 400);
}

async function submitIntlAirtime() {
    const sel    = document.getElementById('intlCountry');
    const code   = sel?.value;
    const phone  = document.getElementById('intlPhone')?.value.trim();
    const amount = parseFloat(document.getElementById('intlAmount')?.value);
    const sender = document.getElementById('intlSenderNumber')?.value.trim();
    const pin    = document.getElementById('intlPin')?.value.trim();
    if (!code)                        { showInlineError('Please select a country'); return; }
    if (!intlSelectedOp)              { showInlineError('Please select an operator'); return; }
    if (!phone || phone.length < 4)   { showInlineError('Please enter a valid recipient phone number'); return; }
    if (!amount || amount <= 0)       { showInlineError('Please enter a valid amount'); return; }
    if (!sender || sender.length < 7) { showInlineError('Please enter your (sender) phone number'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.sendIntlTopup({
            operatorId:           intlOpId(intlSelectedOp),
            amount,
            useLocalAmount:       intlOpLocal(intlSelectedOp),
            recipientCountryCode: code,
            recipientNumber:      phone,
            senderCountryCode:    SENDER_COUNTRY_CODE,
            senderNumber:         sender,
            amountNgn:            intlQuoteNgn || amount,
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

let epinAllPlans = {}, epinPlans = [], epinNetwork = '', epinSelectedPlan = null;

function epinExtract(networkData){
    if (!Array.isArray(networkData)) return [];
    for (const entry of networkData){
        const prods = entry?.raw?.PRODUCT || entry?.raw?.product;
        if (Array.isArray(prods) && prods.length){
            return prods.map(p => ({
                id:    String(p.PRODUCT_ID ?? p.productId ?? p.id ?? ''),
                label: p.PRODUCT_NAME ?? p.productName ?? p.name ?? 'Plan',
                price: Number(p.PRODUCT_AMOUNT ?? p.amount ?? p.price ?? 0)
            })).filter(p => p.id);
        }
    }
    return networkData.map(p => ({
        id:    String(p.planId ?? p.dataPlan ?? p.id ?? p.PRODUCT_ID ?? ''),
        label: p.name ?? p.planName ?? p.PRODUCT_NAME ?? 'Plan',
        price: Number(p.price ?? p.amount ?? p.PRODUCT_AMOUNT ?? 0)
    })).filter(p => p.id && p.price > 0);
}

function showDataRechargePinModal() {
    epinAllPlans = {}; epinPlans = []; epinNetwork = ''; epinSelectedPlan = null;
    showModal('Data Recharge PIN', `
        <div class="form-group">
            <label>Network</label>
            <div id="epinNetworks" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
                ${['mtn','glo','airtel','9mobile'].map(n =>
                    `<button type="button" data-net="${n}" onclick="epinPickNetwork('${n}', this)"
                        style="padding:10px 4px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;">${n}</button>`
                ).join('')}
            </div>
        </div>
        <div class="form-group">
            <label>Data Plan</label>
            <select id="epinPlan" class="form-input" onchange="epinOnPlan()" disabled>
                <option value="">Select a network first</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="epinQty" class="form-input" min="1" value="1" oninput="epinUpdTotal()">
        </div>
        <div id="epinTotalRow" style="display:none;padding:10px 14px;background:#f5f3ff;border-radius:8px;margin-bottom:10px;font-size:13px;">
            Total to pay: <strong id="epinTotalAmt" style="color:#7c3aed;float:right;"></strong>
        </div>
        <div class="form-group">
            <label>Transaction PIN</label>
            <input type="password" id="epinPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button onclick="submitEpin()" class="btn-primary">Generate PIN</button>
    `);
    _loadEpinPlans();
}

async function _loadEpinPlans() {
    try {
        const res = await api.getEpinPlans();
        epinAllPlans = res.data || res || {};
    } catch (e) {
        showInlineError('Failed to load plans. Please try again.');
    }
}

function epinPickNetwork(net, btn) {
    epinNetwork = net; epinSelectedPlan = null;
    document.querySelectorAll('#epinNetworks button').forEach(b => { b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; b.style.color = '#0f172a'; });
    btn.style.borderColor = '#7c3aed'; btn.style.background = '#f5f3ff'; btn.style.color = '#7c3aed';
    epinPlans = epinExtract(epinAllPlans[net] || epinAllPlans[net.toLowerCase()] || []);
    const sel = document.getElementById('epinPlan');
    document.getElementById('epinTotalRow').style.display = 'none';
    if (!epinPlans.length) { sel.innerHTML = '<option value="">No plans available</option>'; sel.disabled = true; return; }
    sel.disabled = false;
    sel.innerHTML = '<option value="">Choose a data plan</option>' +
        epinPlans.map((p, i) => `<option value="${i}">${p.label} — ₦${Number(p.price).toLocaleString()}</option>`).join('');
}

function epinOnPlan() {
    const pi = document.getElementById('epinPlan')?.value;
    epinSelectedPlan = (pi === '' || pi == null) ? null : epinPlans[+pi];
    epinUpdTotal();
}

function epinUpdTotal() {
    const row = document.getElementById('epinTotalRow');
    const qty = parseInt(document.getElementById('epinQty')?.value) || 0;
    if (!epinSelectedPlan || qty < 1) { row.style.display = 'none'; return; }
    row.style.display = 'block';
    document.getElementById('epinTotalAmt').textContent = `₦${Number(epinSelectedPlan.price * qty).toLocaleString()}`;
}

async function submitEpin() {
    const qty = parseInt(document.getElementById('epinQty')?.value) || 0;
    const pin = document.getElementById('epinPin')?.value.trim();
    if (!epinNetwork)      { showInlineError('Please select a network'); return; }
    if (!epinSelectedPlan) { showInlineError('Please select a data plan'); return; }
    if (qty < 1)           { showInlineError('Please enter a valid quantity'); return; }
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.purchaseEpin({ network: epinNetwork, dataPlan: epinSelectedPlan.id, quantity: qty, transactionPin: pin });
        closeModal();
        setTimeout(() => showSuccess(`${qty} × ${epinSelectedPlan.label} ${epinNetwork.toUpperCase()} recharge PIN${qty > 1 ? 's' : ''} generated! Check your email.`), 300);
    } catch (e) {
        setSubmitLoading(false, '', 'Generate PIN');
        showInlineError(e.message || 'Purchase failed. Please try again.');
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

let gcCatalog = [], gcSelected = null, gcChosenValue = 0, gcQuoteNgn = null, gcQuoteTimer = null;

function gcName(p){ return p.name || p.productName || p.brand || 'Gift Card'; }
function gcId(p){ return String(p.id ?? p.productId ?? p._id ?? p.code ?? ''); }
function gcCur(p){ return p.currency || p.recipientCurrencyCode || 'USD'; }
function gcFixed(p){ return p.fixed === true || (Array.isArray(p.fixedAmounts) && p.fixedAmounts.length > 0); }
function gcAmounts(p){ const l = p.fixedAmounts || p.fixedRecipientDenominations || p.denominations || []; return Array.isArray(l) ? l.map(Number).filter(v => v > 0) : []; }
function gcMin(p){ return Number(p.minAmount ?? p.minRecipientDenomination ?? p.minValue ?? 1); }
function gcMax(p){ return Number(p.maxAmount ?? p.maxRecipientDenomination ?? p.maxValue ?? 9999); }
function gcPickNgn(res){
    const d = (res && res.data) ? res.data : (res || {});
    const named = [d.nairaAmount, d.nairaPrice, d.amountNgn, d.priceNgn, d.totalNgn, d.amountInNgn, d.ngnAmount, d.ngn, d.naira];
    for (const v of named){ const x = Number(v); if (!isNaN(x) && x > 0) return Math.ceil(x); }
    const cur = String(d.currency || d.currencyCode || '').toUpperCase();
    if (cur === 'NGN'){ for (const v of [d.total, d.amount, d.price, d.amountCharged]){ const x = Number(v); if (!isNaN(x) && x > 0) return Math.ceil(x); } }
    return null;
}

async function showGiftCardsModal() {
    gcCatalog = []; gcSelected = null; gcChosenValue = 0; gcQuoteNgn = null;
    showModal('Gift Cards', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:16px;">
            <button type="button" id="gcTabBuy" onclick="gcSwitchTab('buy')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#ea580c;color:#fff;transition:all .2s;">🎁 Buy</button>
            <button type="button" id="gcTabOrders" onclick="gcSwitchTab('orders')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">📦 My Orders</button>
        </div>

        <div id="gcBuyTab">
            <div class="form-group">
                <label>Select Gift Card</label>
                <select id="gcProductSelect" class="form-input" onchange="onGCProductChange()">
                    <option value="">Loading gift cards…</option>
                </select>
            </div>
            <div id="gcDenomSection" style="display:none;">
                <div class="form-group">
                    <label id="gcValLabel">Select Value</label>
                    <div id="gcDenomGrid" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
                    <input type="number" id="gcRangeInput" class="form-input" placeholder="Enter value" style="margin-top:8px;display:none;" oninput="onGCRangeChange()">
                    <div id="gcValHint" style="font-size:11px;color:#94a3b8;margin-top:4px;"></div>
                </div>
                <div id="gcCostRow" style="display:none;padding:10px 14px;background:#fff7ed;border-radius:8px;margin-bottom:10px;font-size:13px;">
                    You pay: <strong id="gcCostAmt" style="color:#ea580c;float:right;"></strong>
                </div>
                <div class="form-group">
                    <label>Recipient Email</label>
                    <input type="email" id="gcEmail" class="form-input" placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label>Recipient Name</label>
                    <input type="text" id="gcRecipientName" class="form-input" placeholder="Recipient full name">
                </div>
                <div class="form-group">
                    <label>Sender Name</label>
                    <input type="text" id="gcSenderName" class="form-input" placeholder="Your name">
                </div>
                <div class="form-group">
                    <label>Message <span style="font-size:11px;color:#94a3b8;">(optional)</span></label>
                    <input type="text" id="gcMessage" class="form-input" placeholder="Happy gifting!">
                </div>
                <div class="form-group">
                    <label>Transaction PIN</label>
                    <input type="password" id="gcPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
                </div>
            </div>
        </div>

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
    gcLoadCatalog();
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

async function gcLoadCatalog() {
    const sel = document.getElementById('gcProductSelect');
    if (!sel) return;
    try {
        const res = await api.getGiftCardCatalog();
        gcCatalog = res.data?.content || res.data?.products || res.data?.items
                  || (Array.isArray(res.data) ? res.data : null)
                  || res.content || res.products || (Array.isArray(res) ? res : []);
        if (!Array.isArray(gcCatalog)) gcCatalog = [];
        if (!gcCatalog.length) { sel.innerHTML = '<option value="">No gift cards available</option>'; return; }
        sel.innerHTML = '<option value="">— Choose a gift card —</option>' +
            gcCatalog.map((p, i) => `<option value="${i}">${gcName(p)}</option>`).join('');
    } catch (e) {
        sel.innerHTML = '<option value="">Failed to load — click to retry</option>';
        sel.onclick = () => { sel.onclick = null; sel.innerHTML = '<option value="">Loading…</option>'; gcLoadCatalog(); };
    }
}

function onGCProductChange() {
    const idx = document.getElementById('gcProductSelect')?.value;
    const section = document.getElementById('gcDenomSection');
    const grid = document.getElementById('gcDenomGrid');
    const range = document.getElementById('gcRangeInput');
    gcSelected = (idx === '' || idx == null) ? null : gcCatalog[+idx];
    gcChosenValue = 0; gcQuoteNgn = null;
    document.getElementById('gcCostRow').style.display = 'none';
    if (!gcSelected) { if (section) section.style.display = 'none'; return; }
    section.style.display = 'block';
    const cur = gcCur(gcSelected);
    document.getElementById('gcValLabel').textContent = `Select Value (${cur})`;
    const amounts = gcAmounts(gcSelected);
    if (gcFixed(gcSelected) && amounts.length) {
        range.style.display = 'none'; range.value = '';
        grid.innerHTML = amounts.map(v =>
            `<button type="button" onclick="gcSelectDenom(${v}, this)"
                style="padding:8px 16px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;">${cur} ${v}</button>`
        ).join('');
        document.getElementById('gcValHint').textContent = '';
    } else {
        grid.innerHTML = '';
        range.style.display = '';
        const min = gcMin(gcSelected), max = gcMax(gcSelected);
        range.placeholder = `${cur} ${min} – ${max}`; range.min = min; range.max = max;
        document.getElementById('gcValHint').textContent = `Allowed range: ${cur} ${min} – ${max}`;
    }
}

function gcSelectDenom(val, btn) {
    gcChosenValue = val;
    document.querySelectorAll('#gcDenomGrid button').forEach(b => { b.style.borderColor = '#e2e8f0'; b.style.background = '#fff'; });
    btn.style.borderColor = '#ea580c'; btn.style.background = '#fff7ed';
    gcRunQuote();
}

function onGCRangeChange() {
    gcChosenValue = parseFloat(document.getElementById('gcRangeInput')?.value) || 0;
    gcRunQuote();
}

function gcRunQuote() {
    gcQuoteNgn = null;
    const row = document.getElementById('gcCostRow');
    const amt = document.getElementById('gcCostAmt');
    if (!gcSelected || !gcChosenValue || gcChosenValue <= 0) { if (row) row.style.display = 'none'; return; }
    row.style.display = 'block';
    amt.textContent = 'Calculating…';
    clearTimeout(gcQuoteTimer);
    const productId = gcId(gcSelected), amount = gcChosenValue;
    gcQuoteTimer = setTimeout(async () => {
        try {
            const res = await api.quoteGiftCard({ productId, amount });
            if (gcChosenValue !== amount) return;
            gcQuoteNgn = gcPickNgn(res);
            amt.textContent = gcQuoteNgn ? `₦${Number(gcQuoteNgn).toLocaleString()}` : 'Charged at checkout';
        } catch (e) {
            gcQuoteNgn = null;
            amt.textContent = 'Charged at checkout';
        }
    }, 350);
}

async function submitGiftCard() {
    if (!gcSelected)                  { showInlineError('Please select a gift card'); return; }
    if (!gcChosenValue || gcChosenValue <= 0) { showInlineError('Please select a value'); return; }
    const email     = document.getElementById('gcEmail')?.value.trim();
    const recipient = document.getElementById('gcRecipientName')?.value.trim();
    const sender    = document.getElementById('gcSenderName')?.value.trim();
    const message   = document.getElementById('gcMessage')?.value.trim();
    const pin       = document.getElementById('gcPin')?.value.trim();
    if (!email || !email.includes('@')) { showInlineError('Please enter a valid recipient email'); return; }
    if (!recipient)                     { showInlineError('Please enter the recipient name'); return; }
    if (!sender)                        { showInlineError('Please enter the sender name'); return; }
    if (!pin || !/^\d{4}$/.test(pin))   { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    setSubmitLoading(true, 'Processing…');
    try {
        await api.buyGiftCard({
            productId:      gcId(gcSelected),
            amount:         gcChosenValue,
            recipientEmail: email,
            recipientName:  recipient,
            senderName:     sender,
            message:        message || 'Enjoy your gift!',
            transactionPin: pin
        });
        closeModal();
        setTimeout(() => showSuccess(`${gcName(gcSelected)} purchased! Your card will be sent to ${email}.`), 300);
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
let fltSearchResults = [];
let fltSelectedOffer = null;
let fltOfferSearchId = '';
let fltOfferId = '';
let fltTripType = 'oneway';          // 'oneway' | 'roundtrip' | 'multicity'
let fltFlexMatrix = [];
let fltPassengers = { adults: 1, children: 0, infants: 0, childAges: [], infantAges: [] };
let fltPaxList = [];
let fltHoldQuoteId = '';
let fltAirportSearchState = {
    origin: { selected: null, requestId: 0, timer: null },
    destination: { selected: null, requestId: 0, timer: null },
    leg2Origin: { selected: null, requestId: 0, timer: null },
    leg2Destination: { selected: null, requestId: 0, timer: null }
};

const FLT_SUGGESTION_IDS = {
    origin: 'fltOriginSuggestions',
    destination: 'fltDestinationSuggestions',
    leg2Origin: 'fltLeg2OriginSuggestions',
    leg2Destination: 'fltLeg2DestinationSuggestions'
};

function fltResetState() {
    fltSearchResults = [];
    fltSelectedOffer = null;
    fltOfferSearchId = '';
    fltOfferId = '';
    fltTripType = 'oneway';
    fltFlexMatrix = [];
    fltPassengers = { adults: 1, children: 0, infants: 0, childAges: [], infantAges: [] };
    fltPaxList = [];
    fltHoldQuoteId = '';
    fltAirportSearchState = {
        origin: { selected: null, requestId: 0, timer: null },
        destination: { selected: null, requestId: 0, timer: null },
        leg2Origin: { selected: null, requestId: 0, timer: null },
        leg2Destination: { selected: null, requestId: 0, timer: null }
    };
}

function fltAirportCode(field) {
    return fltAirportSearchState[field]?.selected?.code || '';
}

function fltAirportFieldHTML(field, label, placeholder) {
    const listId = FLT_SUGGESTION_IDS[field];
    return `
        <div class="form-group">
            <label>${label}</label>
            <div style="position:relative;">
                <input id="fltInput_${field}" class="form-input" placeholder="${placeholder}" autocomplete="off" spellcheck="false" autocapitalize="characters" oninput="fltSearchAirports(this, '${field}')" aria-autocomplete="list" aria-controls="${listId}">
                <div id="${listId}" role="listbox" style="display:none;position:absolute;z-index:20;top:calc(100% + 4px);left:0;right:0;max-height:220px;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 10px 24px rgba(15,23,42,.12);"></div>
            </div>
        </div>`;
}

function fltPaxStepperHTML(label, key) {
    return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;">
            <span style="font-size:13px;font-weight:600;color:#0f172a;">${label}</span>
            <div style="display:flex;align-items:center;gap:10px;">
                <button type="button" onclick="fltAdjPax('${key}', -1)" style="width:28px;height:28px;border:1px solid #e2e8f0;border-radius:50%;background:#fff;color:#0f172a;font-size:16px;line-height:1;cursor:pointer;">-</button>
                <span id="fltPax_${key}" style="min-width:20px;text-align:center;font-weight:700;font-size:14px;">${fltPassengers[key]}</span>
                <button type="button" onclick="fltAdjPax('${key}', 1)" style="width:28px;height:28px;border:1px solid #e2e8f0;border-radius:50%;background:#fff;color:#0f172a;font-size:16px;line-height:1;cursor:pointer;">+</button>
            </div>
        </div>`;
}

function showFlightsModal() {
    fltResetState();
    const today = new Date().toISOString().split('T')[0];

    showModal('Flight Tickets', `
        <div style="display:flex;gap:0;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:12px;">
            <button type="button" id="fltMainTabSearch" onclick="fltMainTab('search')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;">✈️ Search</button>
            <button type="button" id="fltMainTabBookings" onclick="fltMainTab('bookings')"
                style="flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;">📋 My Bookings</button>
        </div>

        <div id="fltSearchSection">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">
                <button type="button" id="fltTripOneway" onclick="fltSetTripType('oneway')" style="padding:8px;border:1.5px solid #0284c7;border-radius:8px;background:#0284c7;color:#fff;font-weight:600;font-size:12px;cursor:pointer;">One-way</button>
                <button type="button" id="fltTripRoundtrip" onclick="fltSetTripType('roundtrip')" style="padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">Round-trip</button>
                <button type="button" id="fltTripMulticity" onclick="fltSetTripType('multicity')" style="padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">Multi-city</button>
            </div>

            <div id="fltLeg1" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                ${fltAirportFieldHTML('origin', 'From', 'Search airport or IATA code')}
                ${fltAirportFieldHTML('destination', 'To', 'Search airport or IATA code')}
            </div>

            <div id="fltLeg2" style="display:none;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
                ${fltAirportFieldHTML('leg2Origin', 'Leg 2 From', 'Search airport or IATA code')}
                ${fltAirportFieldHTML('leg2Destination', 'Leg 2 To', 'Search airport or IATA code')}
            </div>

            <div id="fltDatesSimple" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label>Departure Date</label>
                    <input type="date" id="fltDate" class="form-input" min="${today}">
                </div>
                <div id="fltReturnDateWrap" class="form-group" style="margin:0;display:none;">
                    <label>Return Date</label>
                    <input type="date" id="fltReturnDate" class="form-input" min="${today}">
                </div>
            </div>

            <div id="fltDatesMulti" style="display:none;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label>Leg 1 Date</label>
                    <input type="date" id="fltLeg1Date" class="form-input" min="${today}">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Leg 2 Date</label>
                    <input type="date" id="fltLeg2Date" class="form-input" min="${today}">
                </div>
            </div>

            <div id="fltFlexWrap" style="margin-top:10px;">
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#0f172a;cursor:pointer;">
                    <input type="checkbox" id="fltFlexible" style="width:16px;height:16px;">
                    <span>Flexible dates (compare ±3 days)</span>
                </label>
            </div>

            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;">
                <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:4px;">Passengers</div>
                ${fltPaxStepperHTML('Adults (18+)', 'adults')}
                ${fltPaxStepperHTML('Children (2–11)', 'children')}
                ${fltPaxStepperHTML('Infants (under 2)', 'infants')}
                <div id="fltChildAges" style="display:none;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px;"></div>
                <div id="fltInfantAges" style="display:none;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px;"></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
                <div class="form-group" style="margin:0;">
                    <label>Cabin Class</label>
                    <select id="fltCabin" class="form-input">
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Filters</label>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:8px;">
                        <label style="font-size:12px;color:#475569;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="fltDirect" style="width:14px;height:14px;"> Direct only</label>
                        <label style="font-size:12px;color:#475569;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="fltRefundable" style="width:14px;height:14px;"> Refundable</label>
                        <label style="font-size:12px;color:#475569;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="fltCheckedBags" style="width:14px;height:14px;"> Checked bags</label>
                    </div>
                </div>
            </div>

            <div id="fltResultsBox" style="margin-top:14px;"></div>

            <div id="fltPassengerSection" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;">
                <div id="fltBookingSummary" style="padding:10px 14px;background:#f0f9ff;border-radius:8px;margin-bottom:12px;font-size:13px;"></div>
                <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">Passenger Details</div>
                <div id="fltPaxForms"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;">
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;">Contact Email</label>
                        <input type="email" id="fltContactEmail" class="form-input" placeholder="email@example.com">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;">Contact Phone</label>
                        <input type="tel" id="fltContactPhone" class="form-input" placeholder="+2348012345678">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                    <div class="form-group" style="margin:0;">
                        <label>Booking Type</label>
                        <select id="fltBookingChoice" class="form-input">
                            <option value="issue">Book now</option>
                            <option value="hold">Hold booking</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Transaction PIN</label>
                        <input type="password" id="fltPin" class="form-input" placeholder="Enter 4-digit PIN" maxlength="4" inputmode="numeric">
                    </div>
                </div>
            </div>
        </div>

        <div id="fltBookingsSection" style="display:none;">
            <div id="fltBookingsList" style="display:flex;flex-direction:column;gap:8px;">
                <div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
                    <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                    Loading bookings...
                </div>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="btn-secondary">Cancel</button>
        <button id="fltPrimaryBtn" onclick="fltHandlePrimary()" class="btn-primary">Search Flights</button>
    `);

    fltRenderAges();
}

function fltMainTab(tab) {
    const ACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:#0284c7;color:#fff;transition:all .2s;';
    const INACTIVE = 'flex:1;padding:9px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;background:transparent;color:#64748b;transition:all .2s;';
    const searchTab = document.getElementById('fltMainTabSearch');
    const bookingsTab = document.getElementById('fltMainTabBookings');
    const searchSection = document.getElementById('fltSearchSection');
    const bookingsSection = document.getElementById('fltBookingsSection');
    const btn = document.getElementById('fltPrimaryBtn');

    if (searchTab) searchTab.style.cssText = tab === 'search' ? ACTIVE : INACTIVE;
    if (bookingsTab) bookingsTab.style.cssText = tab === 'bookings' ? ACTIVE : INACTIVE;
    if (searchSection) searchSection.style.display = tab === 'search' ? '' : 'none';
    if (bookingsSection) bookingsSection.style.display = tab === 'bookings' ? '' : 'none';
    if (btn) btn.style.display = tab === 'search' ? '' : 'none';

    if (tab === 'bookings') fltLoadBookings();
}

function fltSetTripType(type) {
    fltTripType = type;
    const active = 'padding:8px;border:1.5px solid #0284c7;border-radius:8px;background:#0284c7;color:#fff;font-weight:600;font-size:12px;cursor:pointer;';
    const inactive = 'padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;';
    document.getElementById('fltTripOneway').style.cssText = type === 'oneway' ? active : inactive;
    document.getElementById('fltTripRoundtrip').style.cssText = type === 'roundtrip' ? active : inactive;
    document.getElementById('fltTripMulticity').style.cssText = type === 'multicity' ? active : inactive;

    const leg2 = document.getElementById('fltLeg2');
    const datesSimple = document.getElementById('fltDatesSimple');
    const datesMulti = document.getElementById('fltDatesMulti');
    const retWrap = document.getElementById('fltReturnDateWrap');
    const flexWrap = document.getElementById('fltFlexWrap');

    const isMulti = type === 'multicity';
    const isRound = type === 'roundtrip';
    if (leg2) leg2.style.display = isMulti ? 'grid' : 'none';
    if (datesSimple) datesSimple.style.display = isMulti ? 'none' : 'grid';
    if (datesMulti) datesMulti.style.display = isMulti ? 'grid' : 'none';
    if (retWrap) retWrap.style.display = isRound ? '' : 'none';
    if (flexWrap) flexWrap.style.display = isMulti ? 'none' : '';

    // clear results on trip type change
    fltSearchResults = [];
    fltSelectedOffer = null;
    const box = document.getElementById('fltResultsBox');
    if (box) box.innerHTML = '';
    const paxSection = document.getElementById('fltPassengerSection');
    if (paxSection) paxSection.style.display = 'none';
    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) { btn.textContent = 'Search Flights'; btn.disabled = false; }
}

function fltAdjPax(key, delta) {
    const min = key === 'adults' ? 1 : 0;
    const max = 9;
    let v = fltPassengers[key] + delta;
    if (v < min) v = min;
    if (v > max) v = max;
    fltPassengers[key] = v;

    if (key === 'children') {
        fltPassengers.childAges = Array.from({ length: v }, (_, i) => fltPassengers.childAges[i] || 8);
    }
    if (key === 'infants') {
        fltPassengers.infantAges = Array.from({ length: v }, (_, i) => fltPassengers.infantAges[i] || 1);
    }

    const el = document.getElementById('fltPax_' + key);
    if (el) el.textContent = v;
    fltRenderAges();
}

function fltRenderAges() {
    const childBox = document.getElementById('fltChildAges');
    const infantBox = document.getElementById('fltInfantAges');
    if (childBox) {
        if (fltPassengers.children > 0) {
            childBox.style.display = 'grid';
            childBox.innerHTML = fltPassengers.childAges.slice(0, fltPassengers.children).map((age, i) => `
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Child ${i + 1} age</label>
                    <input type="number" min="2" max="11" value="${age}" oninput="fltPassengers.childAges[${i}]=Number(this.value)||0" class="form-input">
                </div>`).join('');
        } else {
            childBox.style.display = 'none';
            childBox.innerHTML = '';
        }
    }
    if (infantBox) {
        if (fltPassengers.infants > 0) {
            infantBox.style.display = 'grid';
            infantBox.innerHTML = fltPassengers.infantAges.slice(0, fltPassengers.infants).map((age, i) => `
                <div class="form-group" style="margin:0;">
                    <label style="font-size:11px;">Infant ${i + 1} age</label>
                    <input type="number" min="0" max="1" value="${age}" oninput="fltPassengers.infantAges[${i}]=Number(this.value)||0" class="form-input">
                </div>`).join('');
        } else {
            infantBox.style.display = 'none';
            infantBox.innerHTML = '';
        }
    }
}

function fltGetPassengerPayload() {
    const p = { adults: fltPassengers.adults };
    if (fltPassengers.children > 0) {
        p.children = fltPassengers.children;
        p.child_ages = fltPassengers.childAges.slice(0, fltPassengers.children).map(Number);
    }
    if (fltPassengers.infants > 0) {
        p.infants = fltPassengers.infants;
        p.infant_ages = fltPassengers.infantAges.slice(0, fltPassengers.infants).map(Number);
    }
    return p;
}

function fltBuildSearchPayload() {
    const cabin = document.getElementById('fltCabin')?.value || 'economy';
    const passengers = fltGetPassengerPayload();
    const filters = {};
    if (document.getElementById('fltDirect')?.checked) filters.direct = true;
    if (document.getElementById('fltRefundable')?.checked) filters.refundable = true;
    if (document.getElementById('fltCheckedBags')?.checked) filters.checked_bags = true;

    const origin = fltAirportCode('origin');
    const destination = fltAirportCode('destination');

    if (fltTripType === 'multicity') {
        return {
            segments: [
                { origin, destination, date: document.getElementById('fltLeg1Date')?.value },
                { origin: fltAirportCode('leg2Origin'), destination: fltAirportCode('leg2Destination'), date: document.getElementById('fltLeg2Date')?.value }
            ],
            cabin_class: cabin,
            passengers,
            ...filters
        };
    }

    const payload = {
        origin,
        destination,
        departure_date: document.getElementById('fltDate')?.value,
        cabin_class: cabin,
        passengers,
        ...filters
    };
    if (fltTripType === 'roundtrip') {
        payload.return_date = document.getElementById('fltReturnDate')?.value;
    }
    return payload;
}

async function fltDoSearch() {
    const origin = fltAirportCode('origin');
    const destination = fltAirportCode('destination');
    if (!origin) { showInlineError('Please select a departure airport from the suggestions'); return; }
    if (!destination) { showInlineError('Please select a destination airport from the suggestions'); return; }
    if (origin === destination) { showInlineError('Origin and destination must be different'); return; }

    if (fltPassengers.infants > fltPassengers.adults) { showInlineError('Infants cannot exceed the number of adults'); return; }

    if (fltTripType === 'multicity') {
        const l2o = fltAirportCode('leg2Origin');
        const l2d = fltAirportCode('leg2Destination');
        const d1 = document.getElementById('fltLeg1Date')?.value;
        const d2 = document.getElementById('fltLeg2Date')?.value;
        if (!l2o) { showInlineError('Please select the leg 2 origin airport'); return; }
        if (!l2d) { showInlineError('Please select the leg 2 destination airport'); return; }
        if (!d1 || !d2) { showInlineError('Please select both leg dates'); return; }
        if (d2 < d1) { showInlineError('The second leg date cannot be before the first'); return; }
    } else {
        const departure = document.getElementById('fltDate')?.value;
        if (!departure) { showInlineError('Please select a departure date'); return; }
        if (fltTripType === 'roundtrip') {
            const ret = document.getElementById('fltReturnDate')?.value;
            if (!ret) { showInlineError('Please select a return date'); return; }
            if (ret < departure) { showInlineError('Return date cannot be before the departure date'); return; }
        }
    }

    const flexible = fltTripType !== 'multicity' && document.getElementById('fltFlexible')?.checked;

    const box = document.getElementById('fltResultsBox');
    if (box) {
        box.innerHTML = `<div style="text-align:center;padding:32px 0;color:#94a3b8;font-size:13px;">
            <div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
            Searching flights...
        </div>`;
    }

    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Searching...'; }

    try {
        const payload = fltBuildSearchPayload();
        let res;
        if (flexible) {
            res = await api.flexibleSearchFlights(payload);
            fltRenderFlexMatrix(res);
            if (btn) { btn.disabled = false; btn.textContent = 'Search Flights'; }
            return;
        }

        res = await api.searchFlights(payload);
        const suppliers = Array.isArray(res?.data?.suppliers) ? res.data.suppliers : [];
        fltSearchResults = suppliers.flatMap(supplier => {
            const offers = Array.isArray(supplier?.results?.offers) ? supplier.results.offers : [];
            return offers.map(offer => ({
                ...offer,
                searchId: supplier.searchId,
                supportHold: Boolean(supplier.supportHold || offer.supportHold)
            }));
        });

        if (!fltSearchResults.length) {
            if (box) {
                box.innerHTML = `<div style="text-align:center;padding:30px 0;color:#64748b;font-size:13px;">No flights found for this route. Try another date or route.</div>`;
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Search Flights'; }
            return;
        }

        fltRenderResults(origin, destination);
        if (btn) { btn.disabled = false; btn.textContent = 'Search Flights'; }
    } catch (error) {
        if (box) {
            box.innerHTML = `<div style="text-align:center;padding:24px 0;">
                <p style="color:#dc2626;font-size:13px;margin-bottom:12px;">${escapeHtml(error.message || 'Search failed. Please try again.')}</p>
                <button onclick="fltDoSearch()" style="padding:8px 20px;background:#0284c7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">Try again</button>
            </div>`;
        }
        if (btn) { btn.disabled = false; btn.textContent = 'Search Flights'; }
    }
}

function fltRenderFlexMatrix(res) {
    const box = document.getElementById('fltResultsBox');
    if (!box) return;
    const suppliers = Array.isArray(res?.data?.suppliers) ? res.data.suppliers : [];
    const entries = [];
    suppliers.forEach(s => {
        const matrix = s?.flexPrices?.matrix;
        if (Array.isArray(matrix)) matrix.forEach(m => entries.push(m));
    });
    fltFlexMatrix = entries;

    if (!entries.length) {
        box.innerHTML = `<div style="text-align:center;padding:30px 0;color:#64748b;font-size:13px;">No flexible date options available.</div>`;
        return;
    }

    box.innerHTML = `<div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">Choose a travel date</div>` + entries.map((m, i) => {
        const available = m.status === 'available' && Number.isFinite(Number(m.finalPrice));
        const price = available ? '₦' + Number(m.finalPrice).toLocaleString() : '—';
        return `<button type="button" onclick="fltPickFlexDate(${i})"
            style="display:block;width:100%;text-align:left;padding:12px 14px;border:1.5px solid ${available ? '#e2e8f0' : '#f1f5f9'};border-radius:10px;background:#fff;margin-bottom:8px;cursor:${available ? 'pointer' : 'default'};">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;font-weight:600;color:#0f172a;">${m.departure}${m.return ? ' → ' + m.return : ''}</span>
                <span style="font-size:14px;font-weight:700;color:${available ? '#0284c7' : '#94a3b8'};">${price}</span>
            </div>
        </button>`;
    }).join('');
}

function fltPickFlexDate(i) {
    const m = fltFlexMatrix[i];
    if (!m || m.status !== 'available') return;
    if (fltTripType === 'roundtrip' && m.return) {
        const ret = document.getElementById('fltReturnDate');
        if (ret) ret.value = m.return;
    }
    const dep = document.getElementById('fltDate');
    if (dep) dep.value = m.departure;
    const flex = document.getElementById('fltFlexible');
    if (flex) flex.checked = false;
    fltDoSearch();
}

function fltRenderResults(origin, destination) {
    const box = document.getElementById('fltResultsBox');
    if (!box) return;

    box.innerHTML = `<div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:10px;">${fltSearchResults.length} flight${fltSearchResults.length !== 1 ? 's' : ''} for ${origin} to ${destination}</div>` + fltSearchResults.slice(0, 10).map((offer, index) => {
        const itinerary = Array.isArray(offer.itinerary) ? offer.itinerary : [];
        const firstLeg = itinerary[0] || {};
        const lastLeg = itinerary[itinerary.length - 1] || {};
        const firstSegment = (firstLeg.segments || [])[0] || {};
        const lastSegment = (lastLeg.segments || []).slice(-1)[0] || {};
        const airline = firstSegment.flight?.carrierName || firstSegment.flight?.carrierCode || 'Airline';
        const departure = firstSegment.departure?.datetime || '';
        const arrival = lastSegment.arrival?.datetime || '';
        const price = Number(offer.pricing?.finalPrice || 0);
        const departureTime = departure ? new Date(departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        const arrivalTime = arrival ? new Date(arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        const totalSegments = itinerary.reduce((count, leg) => count + (Array.isArray(leg.segments) ? leg.segments.length : 0), 0);
        const stops = Math.max(0, totalSegments - 1);

        return `<div onclick="fltSelectOffer(${index}, this)" data-fltidx="${index}" style="padding:14px;border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;background:#fff;margin-bottom:8px;transition:all .2s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <div>
                    <span style="font-size:13px;font-weight:700;color:#0f172a;display:block;">${airline}</span>
                    ${offer.supportHold ? '<span style="font-size:10px;border-radius:9999px;padding:3px 6px;background:#dcfce7;color:#166534;margin-top:4px;display:inline-block;">Hold available</span>' : ''}
                </div>
                <span style="font-size:15px;font-weight:700;color:#0284c7;">₦${price.toLocaleString()}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="text-align:center;min-width:48px;">
                    <div style="font-size:14px;font-weight:700;">${departureTime}</div>
                    <div style="font-size:10px;color:#94a3b8;">${origin}</div>
                </div>
                <div style="flex:1;text-align:center;">
                    <div style="border-top:1.5px solid #e2e8f0;position:relative;">
                        <span style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-size:12px;">✈</span>
                    </div>
                    ${stops > 0 ? `<div style="font-size:10px;color:#f59e0b;margin-top:4px;">${stops} stop${stops > 1 ? 's' : ''}</div>` : ''}
                </div>
                <div style="text-align:center;min-width:48px;">
                    <div style="font-size:14px;font-weight:700;">${arrivalTime}</div>
                    <div style="font-size:10px;color:#94a3b8;">${destination}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function fltSelectOffer(index, el) {
    fltSelectedOffer = fltSearchResults[index];
    fltOfferSearchId = fltSelectedOffer?.searchId || '';
    fltOfferId = fltSelectedOffer?.id || '';

    document.querySelectorAll('[data-fltidx]').forEach(d => {
        d.style.borderColor = '#e2e8f0';
        d.style.background = '#fff';
    });
    if (el) {
        el.style.borderColor = '#0284c7';
        el.style.background = '#f0f9ff';
    }

    const price = Number(fltSelectedOffer?.pricing?.finalPrice || 0);
    const airline = fltSelectedOffer?.itinerary?.[0]?.segments?.[0]?.flight?.carrierName || 'Selected Flight';
    const summary = document.getElementById('fltBookingSummary');
    if (summary) summary.innerHTML = `<strong>${airline}</strong><span style="float:right;font-weight:700;color:#0284c7;">₦${price.toLocaleString()}</span>`;

    const passengerSection = document.getElementById('fltPassengerSection');
    if (passengerSection) passengerSection.style.display = '';

    const bookingChoice = document.getElementById('fltBookingChoice');
    if (bookingChoice) {
        bookingChoice.innerHTML = fltSelectedOffer?.supportHold
            ? '<option value="issue">Book now</option><option value="hold">Hold booking</option>'
            : '<option value="issue">Book now</option>';
    }

    fltPaxList = fltBuildPaxList();
    fltRenderPaxForms();

    const btn = document.getElementById('fltPrimaryBtn');
    if (btn) {
        btn.disabled = false;
        btn.textContent = fltSelectedOffer?.supportHold ? 'Hold / Book' : 'Book Flight';
    }
}

function fltBuildPaxList() {
    const list = [];
    for (let i = 0; i < fltPassengers.adults; i++) list.push({ type: 'adult' });
    for (let i = 0; i < fltPassengers.children; i++) list.push({ type: 'child' });
    for (let i = 0; i < fltPassengers.infants; i++) list.push({ type: 'infant' });
    return list;
}

function fltRenderPaxForms() {
    const container = document.getElementById('fltPaxForms');
    if (!container) return;
    const typeLabels = { adult: 'Adult', child: 'Child (2–11)', infant: 'Infant (under 2)' };
    container.innerHTML = fltPaxList.map((p, i) => `
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:10px;">
            <div style="font-size:12px;font-weight:700;color:#0284c7;margin-bottom:8px;">${typeLabels[p.type]} ${i + 1}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">First name</label><input id="pax_${i}_first" class="form-input" placeholder="First name"></div>
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Last name</label><input id="pax_${i}_last" class="form-input" placeholder="Last name"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Date of birth</label><input type="date" id="pax_${i}_dob" class="form-input"></div>
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Gender</label><select id="pax_${i}_gender" class="form-input"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Passport no.</label><input id="pax_${i}_passport" class="form-input" placeholder="A12345678"></div>
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Passport expiry</label><input type="date" id="pax_${i}_expiry" class="form-input"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Issuing country</label><input id="pax_${i}_country" class="form-input" placeholder="NG" maxlength="2" style="text-transform:uppercase;"></div>
                <div class="form-group" style="margin:0;"><label style="font-size:11px;">Nationality</label><input id="pax_${i}_nationality" class="form-input" placeholder="NG" maxlength="2" style="text-transform:uppercase;"></div>
            </div>
        </div>`).join('');
}

function fltHandlePrimary() {
    if (fltSelectedOffer) {
        fltDoBook();
    } else {
        fltDoSearch();
    }
}

function fltBuildBookingPassengers() {
    return fltPaxList.map((p, i) => ({
        type: p.type,
        gender: document.getElementById(`pax_${i}_gender`)?.value || 'MALE',
        first_name: document.getElementById(`pax_${i}_first`)?.value.trim(),
        last_name: document.getElementById(`pax_${i}_last`)?.value.trim(),
        date_of_birth: document.getElementById(`pax_${i}_dob`)?.value,
        identity_documents: [{
            type: 'passport',
            number: document.getElementById(`pax_${i}_passport`)?.value.trim(),
            issuing_country: (document.getElementById(`pax_${i}_country`)?.value || '').trim().toUpperCase(),
            nationality: (document.getElementById(`pax_${i}_nationality`)?.value || '').trim().toUpperCase(),
            expiry_date: document.getElementById(`pax_${i}_expiry`)?.value
        }]
    }));
}

async function fltDoBook() {
    if (!fltSelectedOffer) { showInlineError('Please select a flight first'); return; }
    if (!fltOfferSearchId || !fltOfferId) { showInlineError('Flight offer is incomplete. Please search again.'); return; }

    const pin = document.getElementById('fltPin')?.value.trim();
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }

    const bookingChoice = document.getElementById('fltBookingChoice')?.value || 'issue';
    if (bookingChoice === 'hold' && !fltSelectedOffer.supportHold) {
        showInlineError('This flight does not support holding. Please book now instead.');
        return;
    }

    const email = document.getElementById('fltContactEmail')?.value.trim();
    const phone = document.getElementById('fltContactPhone')?.value.trim();
    if (!email || !email.includes('@')) { showInlineError('Please enter a valid contact email'); return; }
    if (!phone) { showInlineError('Please enter a contact phone number'); return; }

    // Validate every passenger form
    for (let i = 0; i < fltPaxList.length; i++) {
        const first = document.getElementById(`pax_${i}_first`)?.value.trim();
        const last = document.getElementById(`pax_${i}_last`)?.value.trim();
        const dob = document.getElementById(`pax_${i}_dob`)?.value;
        const passport = document.getElementById(`pax_${i}_passport`)?.value.trim();
        const country = (document.getElementById(`pax_${i}_country`)?.value || '').trim().toUpperCase();
        const nationality = (document.getElementById(`pax_${i}_nationality`)?.value || '').trim().toUpperCase();
        const expiry = document.getElementById(`pax_${i}_expiry`)?.value;

        if (!first || !last) { showInlineError(`Passenger ${i + 1}: please enter first and last name`); return; }
        if (!dob) { showInlineError(`Passenger ${i + 1}: please enter date of birth`); return; }
        if (!passport) { showInlineError(`Passenger ${i + 1}: please enter passport number`); return; }
        if (country.length !== 2) { showInlineError(`Passenger ${i + 1}: issuing country must be a 2-letter code`); return; }
        if (nationality.length !== 2) { showInlineError(`Passenger ${i + 1}: nationality must be a 2-letter code`); return; }
        if (!expiry) { showInlineError(`Passenger ${i + 1}: please enter passport expiry date`); return; }
    }

    setSubmitLoading(true, bookingChoice === 'hold' ? 'Holding booking...' : 'Booking...');

    try {
        const quoteResponse = await api.priceFlightQuote({ search_id: fltOfferSearchId, offer_id: fltOfferId });
        const quote = quoteResponse?.data || quoteResponse;
        const walletPrice = Number(quote?.walletPrice?.amount ?? 0);
        const flightQuoteId = quote?.flightQuoteId;
        if (!flightQuoteId) throw new Error('The quote could not be created for this flight.');

        const payload = {
            flightQuoteId,
            booking_type: bookingChoice,
            transactionPin: pin,
            send_email: true,
            passengers: fltBuildBookingPassengers(),
            contact_details: { email, phone_number: phone }
        };

        const idempotencyKey = `flight_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const res = await api.bookFlight(payload, idempotencyKey);
        const booking = res?.data || res || {};
        const status = (booking.status || '').toLowerCase();
        const amountText = walletPrice ? '₦' + walletPrice.toLocaleString() : 'wallet price';

        closeModal();
        if (status === 'processing' || booking.outcomeUnknown) {
            setTimeout(() => showSuccess(`Your booking is being processed. Check "My Bookings" for the final status.`), 300);
        } else if (status === 'held') {
            setTimeout(() => showSuccess(`Flight held successfully. Your wallet will be charged only when you pay. Estimated amount: ${amountText}`), 300);
        } else {
            setTimeout(() => showSuccess(`Flight booked successfully. Wallet charged: ${amountText}`), 300);
        }
    } catch (error) {
        setSubmitLoading(false, '', bookingChoice === 'hold' ? 'Hold Booking' : 'Book Flight');
        showInlineError(error.message || 'Flight booking failed. Please try again.');
    }
}

function fltRenderAirportMessage(list, message, color = '#64748b') {
    list.replaceChildren();
    const item = document.createElement('div');
    item.textContent = message;
    item.style.cssText = `padding:11px 12px;color:${color};font-size:12px;`;
    list.appendChild(item);
    list.style.display = 'block';
}

async function fltSearchAirports(inputEl, field) {
    const state = fltAirportSearchState[field];
    const list = document.getElementById(FLT_SUGGESTION_IDS[field]);
    if (!state || !list) return;

    const value = (inputEl.value || '').trim();
    if (state.selected?.label === value) return;
    state.selected = null;
    const requestId = ++state.requestId;
    clearTimeout(state.timer);

    if (value.length < 2) {
        list.style.display = 'none';
        list.replaceChildren();
        return;
    }

    fltRenderAirportMessage(list, 'Searching airports...');
    state.timer = setTimeout(async () => {
        try {
            const response = await api.searchAirports(value);
            if (requestId !== state.requestId) return;

            const airports = Array.isArray(response?.data) ? response.data : [];
            if (!airports.length) {
                fltRenderAirportMessage(list, 'No matching airports found.');
                return;
            }

            list.replaceChildren();
            airports.forEach(airport => {
                const code = typeof airport?.ap === 'string' ? airport.ap.trim().toUpperCase() : '';
                const label = String(airport?.displayname || airport?.shortdisplayname || airport?.airportname || code);
                if (code.length !== 3 || !label) return;

                const option = document.createElement('button');
                option.type = 'button';
                option.role = 'option';
                option.textContent = label;
                option.style.cssText = 'display:block;width:100%;padding:11px 12px;border:0;border-bottom:1px solid #f1f5f9;background:#fff;text-align:left;color:#0f172a;font-size:13px;cursor:pointer;';
                option.addEventListener('mouseenter', () => { option.style.background = '#f8fafc'; });
                option.addEventListener('mouseleave', () => { option.style.background = '#fff'; });
                option.addEventListener('mousedown', event => { event.preventDefault(); });
                option.addEventListener('click', () => {
                    state.selected = { code, label };
                    inputEl.value = label;
                    list.style.display = 'none';
                    list.replaceChildren();
                });
                list.appendChild(option);
            });

            if (!list.childElementCount) {
                fltRenderAirportMessage(list, 'Airport results did not include a valid 3-letter airport code.', '#b45309');
            } else {
                list.style.display = 'block';
            }
        } catch (error) {
            if (requestId !== state.requestId) return;
            fltRenderAirportMessage(list, error.message || 'Could not load airports. Please try again.', '#dc2626');
        }
    }, 250);
}

// ============================================================
// 7b. FLIGHT BOOKINGS — history, detail, hold pay, cancel, ticket
// ============================================================

function fltBookingStatusMeta(status) {
    const s = (status || '').toLowerCase();
    const map = {
        processing: { color: '#2563eb', label: 'Processing' },
        held: { color: '#d97706', label: 'Held' },
        paying: { color: '#7c3aed', label: 'Paying' },
        confirmed: { color: '#16a34a', label: 'Confirmed' },
        failed: { color: '#dc2626', label: 'Failed' },
        cancelling: { color: '#64748b', label: 'Cancelling' },
        cancelled: { color: '#64748b', label: 'Cancelled' },
        review: { color: '#ea580c', label: 'Review' }
    };
    return map[s] || { color: '#64748b', label: status || 'Pending' };
}

async function fltLoadBookings() {
    const container = document.getElementById('fltBookingsList');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
        <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
        Loading bookings...</div>`;
    try {
        const response = await api.getFlightBookings(1, 20);
        const bookings = response?.data?.bookings || response?.data || (Array.isArray(response) ? response : []);
        if (!bookings.length) {
            container.innerHTML = '<div style="text-align:center;padding:20px 0;color:#94a3b8;font-size:13px;">No bookings found.</div>';
            return;
        }
        container.innerHTML = bookings.map(booking => {
            const meta = fltBookingStatusMeta(booking.status);
            const price = Number(booking.pricing?.finalPrice || booking.amountNgn || booking.totalAmount || 0);
            const route = booking.origin && booking.destination ? `${booking.origin} → ${booking.destination}` : (booking.pnr || booking.orderId || 'Flight booking');
            const date = booking.createdAt || booking.created_at || '';
            const status = (booking.status || '').toLowerCase();
            const id = booking._id || booking.id || booking.orderId || '';

            let actions = `<button onclick="fltShowBookingDetail('${escapeHtml(id)}')" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#0f172a;font-size:12px;cursor:pointer;">View</button>`;
            if (status === 'held') {
                actions += `<button onclick="fltShowBookingDetail('${escapeHtml(id)}')" style="padding:6px 12px;border:1px solid #16a34a;border-radius:8px;background:#16a34a;color:#fff;font-size:12px;cursor:pointer;margin-left:6px;">Pay</button>`;
            }
            if (status === 'confirmed' || status === 'review') {
                actions += `<button onclick="fltFetchTicket('${escapeHtml(id)}')" style="padding:6px 12px;border:1px solid #0284c7;border-radius:8px;background:#0284c7;color:#fff;font-size:12px;cursor:pointer;margin-left:6px;">Ticket</button>`;
            }

            return `<div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                    <div>
                        <div style="font-size:13px;font-weight:600;color:#0f172a;">${escapeHtml(route)}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${date ? new Date(date).toLocaleDateString() : ''}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">₦${price.toLocaleString()}</div>
                        <div style="font-size:11px;font-weight:600;color:${meta.color};margin-top:2px;">${meta.label}</div>
                    </div>
                </div>
                <div style="margin-top:10px;display:flex;gap:6px;">${actions}</div>
            </div>`;
        }).join('');
    } catch (error) {
        container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">${escapeHtml(error.message || 'Failed to load bookings.')}</div>`;
    }
}

async function fltShowBookingDetail(id) {
    const container = document.getElementById('fltBookingsList');
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:24px 0;color:#94a3b8;font-size:13px;">
        <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
        Loading booking...</div>`;

    try {
        const res = await api.getFlightBookingById(id);
        const data = res?.data || {};
        const local = data.localBooking || data.booking || {};
        fltRenderBookingDetail(local);

        const status = (local.status || '').toLowerCase();
        if (status === 'processing' || status === 'paying' || status === 'cancelling') {
            fltPollBooking(id, container, status);
        }
    } catch (error) {
        container.innerHTML = `<div style="text-align:center;padding:16px;color:#dc2626;font-size:13px;">${escapeHtml(error.message || 'Could not load booking.')}</div>
            <div style="text-align:center;margin-top:10px;"><button onclick="fltLoadBookings()" style="padding:8px 20px;background:#0284c7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">Back to bookings</button></div>`;
    }
}

function fltRenderBookingDetail(local) {
    const container = document.getElementById('fltBookingsList');
    if (!container) return;

    const status = (local.status || '').toLowerCase();
    const meta = fltBookingStatusMeta(status);
    const price = Number(local.pricing?.finalPrice || 0);
    const pnr = local.pnr || '—';
    const orderId = local.orderId || '—';
    const bookingId = local._id || local.id || '';
    const providerBookingId = local.providerBookingId || '';

    const backBtn = `<button onclick="fltLoadBookings()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#0f172a;font-size:13px;cursor:pointer;margin-bottom:10px;">← Back to bookings</button>`;

    let actionHTML = '';
    if (status === 'held') {
        actionHTML = `
            <div id="fltHoldPayBox" style="margin-top:12px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;">Pay this hold</div>
                <div id="fltHoldPrice" style="font-size:12px;color:#64748b;margin-bottom:8px;"><button onclick="fltLoadHoldQuote('${escapeHtml(bookingId)}')" style="padding:6px 12px;background:#0284c7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;">Get payment quote</button></div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="password" id="fltHoldPin" placeholder="4-digit PIN" maxlength="4" inputmode="numeric" style="flex:1;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;">
                    <button onclick="fltPayHold('${escapeHtml(bookingId)}')" style="padding:10px 16px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Pay</button>
                </div>
                <button onclick="fltCancelHold('${escapeHtml(bookingId)}')" style="margin-top:8px;padding:6px 12px;border:1px solid #dc2626;border-radius:8px;background:#fff;color:#dc2626;cursor:pointer;font-size:12px;">Cancel hold</button>
            </div>`;
    } else if (status === 'confirmed' || status === 'review') {
        actionHTML = `<button onclick="fltFetchTicket('${escapeHtml(bookingId)}')" style="margin-top:12px;padding:10px 16px;background:#0284c7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Download ticket PDF</button>`;
    }

    container.innerHTML = `
        ${backBtn}
        <div style="padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">Booking ${escapeHtml(orderId)}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:2px;">PNR: ${escapeHtml(pnr)}</div>
                    ${providerBookingId ? `<div style="font-size:11px;color:#94a3b8;">Provider ID: ${escapeHtml(providerBookingId)}</div>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">₦${price.toLocaleString()}</div>
                    <div style="font-size:12px;font-weight:600;color:${meta.color};margin-top:2px;">${meta.label}</div>
                </div>
            </div>
            ${actionHTML}
        </div>`;
}

function fltPollBooking(id, container, initialStatus) {
    let attempts = 0;
    const maxAttempts = 12;
    const interval = setInterval(async () => {
        attempts++;
        try {
            const res = await api.getFlightBookingById(id);
            const data = res?.data || {};
            const local = data.localBooking || data.booking || {};
            const status = (local.status || '').toLowerCase();
            if (status !== 'processing' && status !== 'paying' && status !== 'cancelling') {
                clearInterval(interval);
                fltRenderBookingDetail(local);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                fltRenderBookingDetail(local);
            }
        } catch (e) {
            if (attempts >= maxAttempts) clearInterval(interval);
        }
    }, 10000);
}

async function fltLoadHoldQuote(id) {
    const priceEl = document.getElementById('fltHoldPrice');
    if (priceEl) priceEl.textContent = 'Getting quote...';
    try {
        const res = await api.getFlightBookingQuote(id);
        const data = res?.data || {};
        const amount = Number(data.walletPrice?.amount || 0);
        fltHoldQuoteId = data.flightQuoteId || '';
        if (!fltHoldQuoteId) throw new Error('Could not obtain a payment quote.');
        if (priceEl) priceEl.innerHTML = `<strong style="color:#0284c7;">Amount to pay: ₦${amount.toLocaleString()}</strong>`;
    } catch (error) {
        if (priceEl) priceEl.textContent = '';
        showInlineError(error.message || 'Could not load payment quote.');
    }
}

async function fltPayHold(id) {
    const pin = document.getElementById('fltHoldPin')?.value.trim();
    if (!pin || !/^\d{4}$/.test(pin)) { showInlineError('Please enter your 4-digit transaction PIN'); return; }
    if (!fltHoldQuoteId) { showInlineError('Please get a payment quote first'); return; }

    const key = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
        const res = await api.payFlightBooking(id, { flightQuoteId: fltHoldQuoteId, transactionPin: pin }, key);
        const data = res?.data || {};
        const local = data.localBooking || data || {};
        const status = (local.status || '').toLowerCase();
        if (status === 'paying' || status === 'processing') {
            showInlineError('Payment is being processed. Check back shortly.');
            fltShowBookingDetail(id);
        } else {
            fltShowBookingDetail(id);
        }
    } catch (error) {
        showInlineError(error.message || 'Payment failed. Please try again.');
    }
}

async function fltCancelHold(id) {
    try {
        await api.cancelFlightBooking(id);
        fltLoadBookings();
    } catch (error) {
        showInlineError(error.message || 'Could not cancel this hold.');
    }
}

async function fltFetchTicket(id) {
    try {
        const res = await api.getFlightTicket(id);
        const data = res?.data || {};
        if (data.ticket_ready && data.download_url) {
            window.open(data.download_url, '_blank');
        } else {
            showInlineError(data.message || 'Ticket is not ready yet. Please try again shortly.');
        }
    } catch (error) {
        showInlineError(error.message || 'Could not retrieve the ticket.');
    }
}
