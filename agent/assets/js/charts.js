// Charts Module - Handles all chart initializations

function initCharts() {
    initEarningsChart();
    initCommissionChart();
    initPerformanceChart();
}

function initEarningsChart() {
    const ctx = document.getElementById('earningsChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Daily Earnings',
                data: [1200, 1900, 1500, 2500, 2200, 3000, 2450],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { borderDash: [2, 2] },
                    ticks: {
                        callback: function(value) {
                            return '₦' + value.toLocaleString();
                        }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function initCommissionChart() {
    const ctx = document.getElementById('commissionChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Data', 'Airtime', 'Bills', 'Education'],
            datasets: [{
                data: [45280, 32150, 28420, 22600],
                backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'],
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
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₦' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Transactions',
                data: [45, 52, 48, 61],
                backgroundColor: '#0ea5e9',
                borderRadius: 6
            }, {
                label: 'Earnings (₦1000s)',
                data: [5.2, 6.8, 5.9, 7.5],
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { borderDash: [2, 2] }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only init if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        initCharts();
    }
});
