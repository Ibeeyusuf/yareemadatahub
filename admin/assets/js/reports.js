// ==================== REPORTS PAGE ====================
// All data comes exclusively from API endpoints — no demo/mock data

const _rCharts = {};

function _rChart(id, type, data, opts) {
    if (_rCharts[id]) { _rCharts[id].destroy(); delete _rCharts[id]; }
    const ctx = document.getElementById(id);
    if (!ctx) return;
    // Clear "no data" placeholder if present
    ctx.style.display = 'block';
    const placeholder = ctx.parentElement.querySelector('.chart-placeholder');
    if (placeholder) placeholder.remove();
    _rCharts[id] = new Chart(ctx, { type, data, options: opts });
}

function _rNoChart(id, msg) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (_rCharts[id]) { _rCharts[id].destroy(); delete _rCharts[id]; }
    ctx.style.display = 'none';
    const parent = ctx.parentElement;
    let ph = parent.querySelector('.chart-placeholder');
    if (!ph) {
        ph = document.createElement('div');
        ph.className = 'chart-placeholder';
        ph.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;min-height:200px;color:#94a3b8;font-size:13px;';
        parent.appendChild(ph);
    }
    ph.textContent = msg || 'No chart data available';
}

const rFmt  = n => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
const rFmtN = n => Number(n || 0).toLocaleString();

function rStatCard(label, value, sub, icon, ibg, ic) {
    return `<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase">${label}</p>
                <h3 class="text-2xl font-bold text-slate-900 mt-1">${value}</h3>
                <p class="text-xs text-slate-500 mt-1">${sub || '&nbsp;'}</p>
            </div>
            <div class="p-3 ${ibg} rounded-lg"><i data-lucide="${icon}" class="w-6 h-6 ${ic}"></i></div>
        </div>
    </div>`;
}

function rErrCards(msg) {
    return `<div class="col-span-4 bg-red-50 border border-red-200 rounded-xl p-5 text-center text-red-600 text-sm font-medium">${msg}</div>`;
}

function rEmpty(msg) {
    return `<p class="text-slate-400 text-sm text-center py-10">${msg}</p>`;
}

// Chart colours
const COLORS = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b','#06b6d4'];

// Ensure datasets have colours (Chart.js needs them)
function withColors(data, multi) {
    if (!data || !data.datasets) return data;
    data.datasets = data.datasets.map((ds, i) => {
        const color = COLORS[i % COLORS.length];
        if (multi) {
            // doughnut/pie: each segment a different colour
            if (!ds.backgroundColor || !Array.isArray(ds.backgroundColor)) {
                ds.backgroundColor = (data.labels || []).map((_, j) => COLORS[j % COLORS.length]);
            }
        } else {
            if (!ds.backgroundColor) ds.backgroundColor = color + '33'; // 20% opacity fill
            if (!ds.borderColor)     ds.borderColor     = color;
        }
        if (ds.tension === undefined)   ds.tension  = 0.4;
        if (ds.borderWidth === undefined) ds.borderWidth = 2;
        return ds;
    });
    return data;
}

function hasData(chartData) {
    return chartData && Array.isArray(chartData.labels) && chartData.labels.length > 0
        && Array.isArray(chartData.datasets) && chartData.datasets.length > 0;
}

function lineOpts(yLabel) {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } }, title: { display: !!yLabel, text: yLabel, font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };
}

function barOpts(yLabel) {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } }, title: { display: !!yLabel, text: yLabel, font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };
}

function doughnutOpts() {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } } }
    };
}

// ── Tab state ──
let _rActiveTab = 'dashboard';
const _rLoaded  = {};

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const panel = document.getElementById('tab-' + tab);
    if (panel) panel.classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick') === `switchTab('${tab}')`) btn.classList.add('active');
    });
    _rActiveTab = tab;
    if (!_rLoaded[tab]) rLoadTab(tab);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function onPeriodChange() {
    Object.keys(_rLoaded).forEach(k => delete _rLoaded[k]);
    rLoadTab(_rActiveTab);
}

function refreshAll() {
    Object.keys(_rLoaded).forEach(k => delete _rLoaded[k]);
    rLoadTab(_rActiveTab);
}

function rLoadTab(tab) {
    _rLoaded[tab] = true;
    const p = (document.getElementById('periodFilter') || {}).value || 'monthly';
    const map = { dashboard: rLoadDashboard, transactions: rLoadTransactions, financial: rLoadFinancial, users: rLoadUsers, agents: rLoadAgents, services: rLoadServices };
    if (map[tab]) map[tab](p);
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD  →  GET /api/v1/reports/dashboard
// ─────────────────────────────────────────────────────────────
async function rLoadDashboard() {
    try {
        const res = await api.getReportsDashboard();
        console.log('[Reports] dashboard raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        // Stat cards
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('dash-revenue',          rFmt(ov.totalRevenue || ov.revenue || 0));
        setText('dash-revenue-sub',      ov.revenueGrowth ? `${ov.revenueGrowth > 0 ? '+' : ''}${ov.revenueGrowth}% vs last period` : 'All time');
        setText('dash-users',            rFmtN(ov.totalUsers || ov.users || 0));
        setText('dash-users-sub',        ov.newUsers ? `+${rFmtN(ov.newUsers)} new` : 'Registered');
        setText('dash-transactions',     rFmtN(ov.totalTransactions || ov.transactions || 0));
        setText('dash-transactions-sub', ov.pendingTransactions ? `${rFmtN(ov.pendingTransactions)} pending` : 'All time');
        setText('dash-success-rate',     `${ov.successRate || 0}%`);
        setText('dash-success-sub',      ov.failedTransactions ? `${rFmtN(ov.failedTransactions)} failed` : '');

        const c = d.charts || {};

        // User growth chart
        const ugData = c.userGrowth || c.userGrowthChart;
        if (hasData(ugData)) _rChart('userGrowthChart', 'line', withColors(ugData, false), lineOpts('Users'));
        else _rNoChart('userGrowthChart', 'No user growth data for this period');

        // Transaction volume chart
        const tvData = c.dailyTransactions || c.transactionVolume || c.transactions || c.txnVolume;
        if (hasData(tvData)) _rChart('txnVolumeChart', 'bar', withColors(tvData, false), barOpts('Transactions'));
        else _rNoChart('txnVolumeChart', 'No transaction volume data for this period');

        // Revenue by service chart
        const rsData = c.revenueByService || c.serviceRevenue;
        if (hasData(rsData)) _rChart('revenueByServiceChart', 'doughnut', withColors(rsData, true), doughnutOpts());
        else _rNoChart('revenueByServiceChart', 'No service revenue data for this period');

        // Provider performance list
        const providers = d.providerStatus || d.providers || [];
        const pp = document.getElementById('provider-performance');
        if (pp) {
            pp.innerHTML = providers.length
                ? providers.map(p => `
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <p class="text-sm font-semibold text-slate-800 uppercase">${p.name || p.provider || '—'}</p>
                            <p class="text-xs text-slate-500">${rFmtN(p.totalRequests || p.requests || 0)} requests</p>
                        </div>
                        <div class="text-right">
                            <span class="text-base font-bold text-green-600">${p.successRate || 0}%</span>
                            <p class="text-xs text-slate-400">${p.status || ''}</p>
                        </div>
                    </div>`).join('')
                : rEmpty('No provider data available');
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error('[Reports] dashboard error:', err);
        ['dash-revenue','dash-users','dash-transactions','dash-success-rate'].forEach(id => {
            const el = document.getElementById(id); if (el) el.textContent = '—';
        });
        ['userGrowthChart','txnVolumeChart','revenueByServiceChart'].forEach(id => _rNoChart(id, 'Failed to load'));
        const pp = document.getElementById('provider-performance');
        if (pp) pp.innerHTML = rEmpty('Failed to load: ' + (err.message || ''));
    }
}

// ─────────────────────────────────────────────────────────────
// TRANSACTIONS  →  GET /api/v1/reports/transactions?type=
// ─────────────────────────────────────────────────────────────
async function rLoadTransactions(period = 'monthly') {
    const container = document.getElementById('txn-cards');
    container.innerHTML = '<div class="skeleton h-24 rounded-xl"></div>'.repeat(4);
    try {
        const res = await api.getTransactionReport(period);
        console.log('[Reports] transactions raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        container.innerHTML =
            rStatCard('Total',      rFmtN(ov.total || ov.totalTransactions || 0), `${rFmtN(ov.successful || 0)} successful`, 'arrow-left-right', 'bg-purple-50', 'text-purple-600') +
            rStatCard('Successful', rFmtN(ov.successful || ov.success || 0),       `${ov.successRate || 0}% rate`,            'check-circle',     'bg-green-50',  'text-green-600') +
            rStatCard('Failed',     rFmtN(ov.failed || 0),                         `${ov.failRate || 0}% fail rate`,          'x-circle',         'bg-red-50',    'text-red-600')   +
            rStatCard('Pending',    rFmtN(ov.pending || 0),                        'Awaiting confirmation',                   'clock',            'bg-amber-50',  'text-amber-600');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const ch = d.charts || {};

        const trendData = ch.trend || ch.timeline || ch.volume || ch.daily;
        if (hasData(trendData)) _rChart('txnTrendChart', 'line', withColors(trendData, false), lineOpts('Count'));
        else _rNoChart('txnTrendChart', 'No trend data for this period');

        const statusData = ch.statusBreakdown || ch.status || ch.byStatus;
        if (hasData(statusData)) _rChart('txnStatusChart', 'doughnut', withColors(statusData, true), doughnutOpts());
        else _rNoChart('txnStatusChart', 'No status breakdown data for this period');

    } catch (err) {
        console.error('[Reports] transactions error:', err);
        container.innerHTML = rErrCards('Failed to load transaction report: ' + (err.message || ''));
        ['txnTrendChart','txnStatusChart'].forEach(id => _rNoChart(id, 'Failed to load'));
    }
}

// ─────────────────────────────────────────────────────────────
// FINANCIAL  →  GET /api/v1/reports/financial?type=
// ─────────────────────────────────────────────────────────────
async function rLoadFinancial(period = 'monthly') {
    const container = document.getElementById('fin-cards');
    container.innerHTML = '<div class="skeleton h-24 rounded-xl"></div>'.repeat(4);
    try {
        const res = await api.getFinancialReport(period);
        console.log('[Reports] financial raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        container.innerHTML =
            rStatCard('Total Revenue',    rFmt(ov.totalRevenue || ov.revenue || 0),         ov.revenueGrowth ? `${ov.revenueGrowth > 0 ? '+' : ''}${ov.revenueGrowth}% growth` : '', 'banknote',    'bg-green-50', 'text-green-600') +
            rStatCard('Total Expenses',   rFmt(ov.totalExpenses || ov.expenses || 0),       'Costs & fees',                                                                              'receipt',     'bg-red-50',   'text-red-600')   +
            rStatCard('Net Profit',       rFmt(ov.netProfit || ov.profit || 0),             ov.profitMargin ? `${ov.profitMargin}% margin` : '',                                         'trending-up', 'bg-blue-50',  'text-blue-600')  +
            rStatCard('Commissions Paid', rFmt(ov.commissions || ov.totalCommissions || 0), 'Agent payouts',                                                                             'coins',       'bg-amber-50', 'text-amber-600');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const ch = d.charts || {};

        const revData = ch.revenueVsExpenses || ch.comparison || ch.revenueTrend || ch.revenue;
        if (hasData(revData)) _rChart('finRevenueChart', 'bar', withColors(revData, false), barOpts('Amount (₦)'));
        else _rNoChart('finRevenueChart', 'No revenue data for this period');

        const profitData = ch.profitMargin || ch.profit || ch.profitTrend;
        if (hasData(profitData)) _rChart('finProfitChart', 'line', withColors(profitData, false), lineOpts('Profit (₦)'));
        else _rNoChart('finProfitChart', 'No profit data for this period');

    } catch (err) {
        console.error('[Reports] financial error:', err);
        container.innerHTML = rErrCards('Failed to load financial report: ' + (err.message || ''));
        ['finRevenueChart','finProfitChart'].forEach(id => _rNoChart(id, 'Failed to load'));
    }
}

// ─────────────────────────────────────────────────────────────
// USERS  →  GET /api/v1/reports/users?type=
// ─────────────────────────────────────────────────────────────
async function rLoadUsers(period = 'monthly') {
    const container = document.getElementById('usr-cards');
    container.innerHTML = '<div class="skeleton h-24 rounded-xl"></div>'.repeat(4);
    try {
        const res = await api.getUserReport(period);
        console.log('[Reports] users raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        container.innerHTML =
            rStatCard('Total Users',  rFmtN(ov.total || ov.totalUsers || 0),   'All registered',      'users',    'bg-blue-50',   'text-blue-600')   +
            rStatCard('New Users',    rFmtN(ov.newUsers || ov.new || 0),        `This ${period}`,      'user-plus','bg-green-50',  'text-green-600')  +
            rStatCard('Active Users', rFmtN(ov.activeUsers || ov.active || 0),  'Transacted recently', 'activity', 'bg-purple-50', 'text-purple-600') +
            rStatCard('Suspended',    rFmtN(ov.suspended || 0),                 'Restricted accounts', 'user-x',   'bg-red-50',    'text-red-600');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const ch = d.charts || {};

        const growthData = ch.growth || ch.registrations || ch.newUsers || ch.userGrowth;
        if (hasData(growthData)) _rChart('usrGrowthChart', 'bar', withColors(growthData, false), barOpts('New Users'));
        else _rNoChart('usrGrowthChart', 'No registration data for this period');

        const activity = d.recentActivity || d.topUsers || [];
        document.getElementById('usr-activity').innerHTML = activity.length
            ? activity.slice(0, 8).map(u => `
                <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                        <p class="text-sm font-medium text-slate-800">${u.name || u.fullName || u.email || '—'}</p>
                        <p class="text-xs text-slate-400">${rFmtN(u.transactions || u.txnCount || 0)} transactions</p>
                    </div>
                    <span class="text-sm font-semibold text-green-600">${rFmt(u.totalAmount || u.amount || 0)}</span>
                </div>`).join('')
            : rEmpty('No top user data available');

    } catch (err) {
        console.error('[Reports] users error:', err);
        container.innerHTML = rErrCards('Failed to load user report: ' + (err.message || ''));
        _rNoChart('usrGrowthChart', 'Failed to load');
    }
}

// ─────────────────────────────────────────────────────────────
// AGENTS  →  GET /api/v1/reports/agents?type=
// ─────────────────────────────────────────────────────────────
async function rLoadAgents(period = 'monthly') {
    const container = document.getElementById('agt-cards');
    container.innerHTML = '<div class="skeleton h-24 rounded-xl"></div>'.repeat(4);
    try {
        const res = await api.getAgentReport(period);
        console.log('[Reports] agents raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        container.innerHTML =
            rStatCard('Total Agents',     rFmtN(ov.total || ov.totalAgents || 0),          'Registered',         'user-check',  'bg-blue-50',   'text-blue-600')   +
            rStatCard('Active Agents',    rFmtN(ov.active || ov.activeAgents || 0),        'Transacted recently','activity',   'bg-green-50',  'text-green-600')  +
            rStatCard('Total Commission', rFmt(ov.totalCommission || ov.commissions || 0), `This ${period}`,     'coins',       'bg-amber-50',  'text-amber-600')  +
            rStatCard('Avg Commission',   rFmt(ov.avgCommission || 0),                     'Per agent',          'trending-up', 'bg-purple-50', 'text-purple-600');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const ch = d.charts || {};

        const commData = ch.commissions || ch.earnings || ch.commissionTrend;
        if (hasData(commData)) _rChart('agtCommissionChart', 'bar', withColors(commData, false), barOpts('Commission (₦)'));
        else _rNoChart('agtCommissionChart', 'No commission data for this period');

        const topAgents = d.topAgents || d.agents || [];
        document.getElementById('top-agents').innerHTML = topAgents.length
            ? topAgents.slice(0, 8).map((a, i) => `
                <div class="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">${i + 1}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-800 truncate">${a.name || a.fullName || a.email || '—'}</p>
                        <p class="text-xs text-slate-400">${rFmtN(a.transactions || a.txnCount || 0)} txns</p>
                    </div>
                    <span class="text-sm font-semibold text-green-600 flex-shrink-0">${rFmt(a.commission || a.totalCommission || 0)}</span>
                </div>`).join('')
            : rEmpty('No agent data available');

    } catch (err) {
        console.error('[Reports] agents error:', err);
        container.innerHTML = rErrCards('Failed to load agent report: ' + (err.message || ''));
        _rNoChart('agtCommissionChart', 'Failed to load');
    }
}

// ─────────────────────────────────────────────────────────────
// SERVICES  →  GET /api/v1/reports/services?type=
// ─────────────────────────────────────────────────────────────
async function rLoadServices(period = 'monthly') {
    const container = document.getElementById('svc-cards');
    container.innerHTML = '<div class="skeleton h-24 rounded-xl"></div>'.repeat(4);
    try {
        const res = await api.getServiceReport(period);
        console.log('[Reports] services raw:', JSON.stringify(res));

        const d  = res.data || res;
        const ov = d.overview || d.summary || d;

        container.innerHTML =
            rStatCard('Data Purchases', rFmtN(ov.dataPurchases || ov.data || 0),   'Bundles sold',       'wifi',    'bg-purple-50', 'text-purple-600') +
            rStatCard('Airtime Sales',  rFmtN(ov.airtimeSales || ov.airtime || 0), 'Top service',        'phone',   'bg-green-50',  'text-green-600')  +
            rStatCard('Bill Payments',  rFmtN(ov.billPayments || ov.bills || 0),   'Elec + Cable + Edu', 'zap',     'bg-amber-50',  'text-amber-600')  +
            rStatCard('Total Revenue',  rFmt(ov.totalRevenue || ov.revenue || 0),  'From all services',  'banknote','bg-blue-50',   'text-blue-600');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const ch = d.charts || {};

        const usageData = ch.usage || ch.serviceUsage || ch.breakdown || ch.byService;
        if (hasData(usageData)) _rChart('svcUsageChart', 'doughnut', withColors(usageData, true), doughnutOpts());
        else _rNoChart('svcUsageChart', 'No service usage data for this period');

        const revData = ch.revenue || ch.serviceRevenue || ch.revenueByService;
        if (hasData(revData)) _rChart('svcRevenueChart', 'bar', withColors(revData, false), barOpts('Revenue (₦)'));
        else _rNoChart('svcRevenueChart', 'No service revenue data for this period');

    } catch (err) {
        console.error('[Reports] services error:', err);
        container.innerHTML = rErrCards('Failed to load service report: ' + (err.message || ''));
        ['svcUsageChart','svcRevenueChart'].forEach(id => _rNoChart(id, 'Failed to load'));
    }
}

// ── Boot: wait for main.js loadPartials() to finish ──
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        rLoadDashboard();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 300);
});