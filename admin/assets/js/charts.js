

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    // Revenue Chart (Dashboard)
    const revenueChartEl = document.getElementById('revenueChart');
    if (revenueChartEl) {
        const ctxRev = revenueChartEl.getContext('2d');
        new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Current Period',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Previous Period',
                    data: [10000, 15000, 12000, 20000, 18000, 24000, 22000],
                    borderColor: '#94a3b8',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Profit Distribution Chart (Dashboard)
    const profitChartEl = document.getElementById('profitChart');
    if (profitChartEl) {
        const ctxProfit = profitChartEl.getContext('2d');
        new Chart(ctxProfit, {
            type: 'doughnut',
            data: {
                labels: ['Data', 'Airtime', 'Bills', 'Other'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // API Request Logs Chart
    const apiChartEl = document.getElementById('apiChart');
    if (apiChartEl) {
        const ctxApi = apiChartEl.getContext('2d');
        new Chart(ctxApi, {
            type: 'bar',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Successful',
                    data: [120, 150, 280, 350, 420, 380],
                    backgroundColor: '#10b981'
                }, {
                    label: 'Failed',
                    data: [5, 8, 12, 15, 10, 8],
                    backgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, stacked: true },
                    x: { stacked: true }
                }
            }
        });
    }
}
