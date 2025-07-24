// Charts JavaScript for Multi-Site Energy Dashboard

let charts = {};

// Initialize all charts
function initializeCharts() {
    initializePowerProfileChart();
    initializeEnergyDistributionChart();
    initializeDailyConsumptionChart();
    initializeMonthlyComparisonChart();
    initializeSolarGenerationChart();
    initializeSolarEfficiencyChart();
    initializePredictiveChart();
    initializeCarbonFootprintChart();
}

// Power Profile Chart (Area Chart)
function initializePowerProfileChart() {
    const ctx = document.getElementById('powerProfileChart');
    if (!ctx) return;

    const timeLabels = generateTimeLabels(24);
    const config = siteConfigs[currentSite];

    charts.powerProfile = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Total Consumption',
                    data: generateRandomData(25, config.totalPower * 0.8, config.totalPower * 1.2),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Solar Generation',
                    data: generateRandomData(25, 0, config.solarGeneration * 1.2),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Grid Import',
                    data: generateRandomData(25, 0, config.totalPower * 0.6),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Real-time Energy Profile (kW)'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Power (kW)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Energy Distribution Chart (Doughnut Chart)
function initializeEnergyDistributionChart() {
    const ctx = document.getElementById('energyDistributionChart');
    if (!ctx) return;

    const config = siteConfigs[currentSite];
    const buildingData = config.buildings.map(b => b.power);
    const buildingLabels = config.buildings.map(b => b.name);

    charts.energyDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: buildingLabels,
            datasets: [{
                data: buildingData,
                backgroundColor: [
                    '#0d6efd',
                    '#198754',
                    '#ffc107',
                    '#dc3545',
                    '#6f42c1',
                    '#fd7e14'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Distribution by Building'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Daily Consumption Chart (Line Chart)
function initializeDailyConsumptionChart() {
    const ctx = document.getElementById('dailyConsumptionChart');
    if (!ctx) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const config = siteConfigs[currentSite];

    charts.dailyConsumption = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'This Week',
                    data: generateRandomData(7, config.totalPower * 20, config.totalPower * 28),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Last Week',
                    data: generateRandomData(7, config.totalPower * 18, config.totalPower * 26),
                    borderColor: '#6c757d',
                    backgroundColor: 'rgba(108, 117, 125, 0.1)',
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Energy Consumption (kWh)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)'
                    }
                }
            }
        }
    });
}

// Monthly Comparison Chart (Bar Chart)
function initializeMonthlyComparisonChart() {
    const ctx = document.getElementById('monthlyComparisonChart');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const config = siteConfigs[currentSite];

    charts.monthlyComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Consumption',
                    data: generateRandomData(6, config.totalPower * 600, config.totalPower * 800),
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: 1
                },
                {
                    label: 'Solar Generation',
                    data: generateRandomData(6, config.solarGeneration * 400, config.solarGeneration * 600),
                    backgroundColor: '#ffc107',
                    borderColor: '#ffc107',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Energy Comparison (kWh)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)'
                    }
                }
            }
        }
    });
}

// Solar Generation Chart (Area Chart)
function initializeSolarGenerationChart() {
    const ctx = document.getElementById('solarGenerationChart');
    if (!ctx) return;

    const timeLabels = generateTimeLabels(24);
    const config = siteConfigs[currentSite];

    // Generate solar curve (higher during day, zero at night)
    const solarData = timeLabels.map((label, index) => {
        const hour = parseInt(label.split(':')[0]);
        if (hour >= 6 && hour <= 18) {
            // Daytime - bell curve
            const dayProgress = (hour - 6) / 12;
            const solarIntensity = Math.sin(dayProgress * Math.PI);
            return config.solarGeneration * solarIntensity * (0.8 + Math.random() * 0.4);
        }
        return 0; // Nighttime
    });

    charts.solarGeneration = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Solar Generation',
                    data: solarData,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Solar Capacity',
                    data: new Array(timeLabels.length).fill(config.solarGeneration),
                    borderColor: '#fd7e14',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Solar Generation Profile (kW)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Power (kW)'
                    }
                }
            }
        }
    });
}

// Solar Efficiency Chart (Gauge-style Doughnut)
function initializeSolarEfficiencyChart() {
    const ctx = document.getElementById('solarEfficiencyChart');
    if (!ctx) return;

    const efficiency = 75 + Math.random() * 20; // 75-95% efficiency

    charts.solarEfficiency = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Efficiency', 'Loss'],
            datasets: [{
                data: [efficiency, 100 - efficiency],
                backgroundColor: ['#198754', '#e9ecef'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Solar Panel Efficiency'
                },
                legend: {
                    display: false
                }
            }
        },
        plugins: [{
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#198754";
                
                const text = efficiency.toFixed(1) + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

// Predictive Analytics Chart
function initializePredictiveChart() {
    const ctx = document.getElementById('predictiveChart');
    if (!ctx) return;

    const days = [];
    const actualData = [];
    const predictedData = [];
    
    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        if (i > 7) {
            // Historical data
            actualData.push(generateRandomData(1, 500, 800)[0]);
            predictedData.push(null);
        } else {
            // Predicted data
            actualData.push(null);
            predictedData.push(generateRandomData(1, 520, 780)[0]);
        }
    }

    charts.predictive = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Actual Consumption',
                    data: actualData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: false
                },
                {
                    label: 'Predicted Consumption',
                    data: predictedData,
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Consumption Forecast (kWh)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (kWh)'
                    }
                }
            }
        }
    });
}

// Carbon Footprint Chart
function initializeCarbonFootprintChart() {
    const ctx = document.getElementById('carbonFootprintChart');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    charts.carbonFootprint = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'CO₂ Emissions (tons)',
                    data: generateRandomData(6, 15, 35),
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: 1
                },
                {
                    label: 'CO₂ Saved (Solar)',
                    data: generateRandomData(6, 8, 20),
                    backgroundColor: '#198754',
                    borderColor: '#198754',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Carbon Footprint Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CO₂ (tons)'
                    }
                }
            }
        }
    });
}

// Update all charts with new data
function updateCharts() {
    const config = siteConfigs[currentSite];
    
    // Update power profile chart
    if (charts.powerProfile) {
        const newConsumptionData = generateRandomData(25, config.totalPower * 0.8, config.totalPower * 1.2);
        const newSolarData = generateRandomData(25, 0, config.solarGeneration * 1.2);
        const newGridData = generateRandomData(25, 0, config.totalPower * 0.6);
        
        charts.powerProfile.data.datasets[0].data = newConsumptionData;
        charts.powerProfile.data.datasets[1].data = newSolarData;
        charts.powerProfile.data.datasets[2].data = newGridData;
        charts.powerProfile.update('none');
    }
    
    // Update energy distribution chart
    if (charts.energyDistribution) {
        const buildingData = config.buildings.map(b => b.power);
        charts.energyDistribution.data.datasets[0].data = buildingData;
        charts.energyDistribution.update('none');
    }
    
    // Update solar efficiency
    if (charts.solarEfficiency) {
        const efficiency = 75 + Math.random() * 20;
        charts.solarEfficiency.data.datasets[0].data = [efficiency, 100 - efficiency];
        charts.solarEfficiency.update('none');
    }
}

// Destroy all charts (for cleanup)
function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
}

// Export functions
window.initializeCharts = initializeCharts;
window.updateCharts = updateCharts;
window.destroyCharts = destroyCharts;

