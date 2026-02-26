// charts.js — All chart initializations, driven by real API data

const Charts = {
    earningsChart: null,
    commissionChart: null,
    performanceChart: null,

    // Called from dashboard after API data loads
    renderEarningsChart(weeklyData) {
        const ctx = document.getElementById('earningsChart')?.getContext('2d');
        if (!ctx) return;

        if (this.earningsChart) this.earningsChart.destroy();

        const labels = weeklyData.map(d => d.label || d.date || '');
        const values = weeklyData.map(d => d.commission || d.earnings || d.amount || 0);

        this.earningsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Commission Earned',
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [3, 3], color: 'rgba(0,0,0,0.06)' },
                        ticks: { callback: v => '₦' + v.toLocaleString('en-NG') }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderCommissionChart(serviceBreakdown) {
        const ctx = document.getElementById('commissionChart')?.getContext('2d');
        if (!ctx) return;

        if (this.commissionChart) this.commissionChart.destroy();

        const labels = serviceBreakdown.map(s => s.name || s.service || '');
        const data = serviceBreakdown.map(s => s.commission || s.amount || 0);
        const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

        this.commissionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.label + ': ₦' + ctx.parsed.toLocaleString('en-NG')
                        }
                    }
                }
            }
        });
    },

    renderPerformanceChart(weeklyData) {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;

        if (this.performanceChart) this.performanceChart.destroy();

        const labels = weeklyData.map(d => d.label || d.week || '');
        const txns   = weeklyData.map(d => d.count || d.transactions || 0);
        const earn   = weeklyData.map(d => (d.commission || d.earnings || 0) / 1000);

        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Transactions',
                        data: txns,
                        backgroundColor: '#0ea5e9',
                        borderRadius: 6
                    },
                    {
                        label: 'Earnings (₦k)',
                        data: earn,
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { padding: 15, font: { size: 12 } } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [3, 3], color: 'rgba(0,0,0,0.06)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    // Show empty state inside a chart canvas parent
    showEmpty(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const wrapper = canvas.parentElement;
        canvas.style.display = 'none';
        const msg = document.createElement('div');
        msg.className = 'flex items-center justify-center h-full text-slate-400 text-sm';
        msg.textContent = message || 'No data available yet';
        wrapper.appendChild(msg);
    }
};
