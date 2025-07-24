// Multi-Site Energy Dashboard JavaScript

// Global variables
let currentSite = 'main-facility';
let currentUser = 'Sanjin';
let isAuthenticated = false;
let updateInterval;

// Site configurations
const siteConfigs = {
    'main-facility': {
        name: 'Main Facility',
        icon: 'fas fa-industry',
        buildings: [
            { name: 'Administration Building', power: 45.2, efficiency: 92, status: 'normal' },
            { name: 'Production Hall A', power: 156.8, efficiency: 88, status: 'normal' },
            { name: 'Production Hall B', power: 142.3, efficiency: 85, status: 'warning' },
            { name: 'Warehouse', power: 67.1, efficiency: 94, status: 'normal' },
            { name: 'Quality Control Lab', power: 23.4, efficiency: 96, status: 'normal' },
            { name: 'Maintenance Shop', power: 34.7, efficiency: 89, status: 'normal' }
        ],
        totalPower: 269.5,
        solarGeneration: 302.1,
        energyCost: 1247,
        powerFactor: 0.95,
        sld: {
            title: 'Main Facility - Single Line Diagram',
            description: 'This Single Line Diagram shows the electrical distribution system for the Main Facility, including the main utility feed at 13.8kV, step-down transformer to 480V, main switchboard, motor control centers, lighting panels, emergency generator backup system, and solar PV inverter connection.',
            image: 'sld-main-facility.png'
        }
    },
    'warehouse-north': {
        name: 'Warehouse North',
        icon: 'fas fa-warehouse',
        buildings: [
            { name: 'Storage Area A', power: 78.5, efficiency: 91, status: 'normal' },
            { name: 'Storage Area B', power: 82.3, efficiency: 89, status: 'normal' },
            { name: 'Loading Dock', power: 45.7, efficiency: 87, status: 'warning' },
            { name: 'Office Complex', power: 28.9, efficiency: 95, status: 'normal' },
            { name: 'Cold Storage', power: 156.2, efficiency: 82, status: 'critical' },
            { name: 'Sorting Center', power: 67.8, efficiency: 90, status: 'normal' }
        ],
        totalPower: 459.4,
        solarGeneration: 185.7,
        energyCost: 2156,
        powerFactor: 0.89,
        sld: {
            title: 'Warehouse North - Single Line Diagram',
            description: 'This Single Line Diagram shows the electrical distribution system for Warehouse North, including the utility feed at 4.16kV, step-down transformer to 480V, main distribution panel, warehouse lighting circuits, HVAC systems, conveyor motor feeds, loading dock power, and emergency lighting.',
            image: 'sld-warehouse-north.png'
        }
    },
    'manufacturing-plant': {
        name: 'Manufacturing Plant',
        icon: 'fas fa-cogs',
        buildings: [
            { name: 'Assembly Line 1', power: 234.6, efficiency: 86, status: 'normal' },
            { name: 'Assembly Line 2', power: 245.8, efficiency: 84, status: 'warning' },
            { name: 'Paint Shop', power: 123.4, efficiency: 88, status: 'normal' },
            { name: 'Welding Department', power: 189.7, efficiency: 85, status: 'normal' },
            { name: 'Testing Facility', power: 67.3, efficiency: 93, status: 'normal' },
            { name: 'Tool Room', power: 45.2, efficiency: 91, status: 'normal' }
        ],
        totalPower: 906.0,
        solarGeneration: 425.3,
        energyCost: 4234,
        powerFactor: 0.87,
        sld: {
            title: 'Manufacturing Plant - Single Line Diagram',
            description: 'This Single Line Diagram shows the electrical distribution system for the Manufacturing Plant, including high voltage utility feed at 13.8kV, multiple step-down transformers, main switchgear, motor control centers for production equipment, large industrial motors, process control power, compressed air systems, welding outlets, crane power feeds, and emergency shutdown systems.',
            image: 'sld-manufacturing-plant.png'
        }
    },
    'distribution-center': {
        name: 'Distribution Center',
        icon: 'fas fa-truck',
        buildings: [
            { name: 'Receiving Dock', power: 89.4, efficiency: 90, status: 'normal' },
            { name: 'Sorting Facility', power: 167.8, efficiency: 87, status: 'normal' },
            { name: 'Packaging Center', power: 134.5, efficiency: 89, status: 'normal' },
            { name: 'Shipping Dock', power: 98.7, efficiency: 91, status: 'normal' },
            { name: 'Administrative Offices', power: 34.2, efficiency: 96, status: 'normal' },
            { name: 'Vehicle Maintenance', power: 56.8, efficiency: 88, status: 'warning' }
        ],
        totalPower: 581.4,
        solarGeneration: 267.9,
        energyCost: 2789,
        powerFactor: 0.92,
        sld: {
            title: 'Distribution Center - Single Line Diagram',
            description: 'This Single Line Diagram shows the electrical distribution system for the Distribution Center, including utility feed at 4.16kV, step-down transformers, main distribution boards, automated sorting system power, conveyor belt motors, refrigeration units, loading bay power, office areas, security systems, and backup generator.',
            image: 'sld-distribution-center.png'
        }
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    if (isAuthenticated) {
        initializeDashboard();
    }
});

// Authentication functions
function checkAuthentication() {
    const authStatus = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('username');
    
    if (authStatus === 'true' && storedUser) {
        isAuthenticated = true;
        currentUser = storedUser;
        
        // Check if a specific site is selected
        const selectedSite = localStorage.getItem('selectedSite');
        if (selectedSite) {
            // Show the original dashboard for selected site
            currentSite = selectedSite;
            document.getElementById('currentUser').textContent = currentUser;
            // Add Back to Map button to navbar
            addBackToMapButton();
        } else {
            // Show site selection map
            showSiteMap();
        }
    } else {
        showLoginForm();
    }
}

function addBackToMapButton() {
    // Add Back to Map button to the existing navbar
    const navbar = document.querySelector('.navbar-nav.me-auto');
    if (navbar && !document.getElementById('backToMapBtn')) {
        const backButton = document.createElement('button');
        backButton.id = 'backToMapBtn';
        backButton.className = 'btn btn-outline-light btn-sm me-2';
        backButton.onclick = backToMap;
        backButton.innerHTML = '<i class="fas fa-map me-1"></i>Back to Map';
        navbar.appendChild(backButton);
    }
}

function showLoginForm() {
    document.getElementById('app').innerHTML = `
        <div class="container-fluid vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="card shadow-lg" style="width: 400px;">
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <i class="fas fa-bolt fa-3x text-primary mb-3"></i>
                        <h3>Multi-Site Energy Dashboard</h3>
                        <p class="text-muted">Sign in to access your energy monitoring system</p>
                    </div>
                    
                    <form onsubmit="login(event)">
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                <input type="text" class="form-control" id="username" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                        </div>
                        
                        <div id="loginError" class="alert alert-danger d-none"></div>
                        
                        <button type="submit" class="btn btn-primary w-100 mb-3">
                            <i class="fas fa-sign-in-alt me-2"></i>Sign In
                        </button>
                    </form>
                    
                    <div class="alert alert-info">
                        <strong>Demo Credentials:</strong><br>
                        Username: <code>Sanjin</code><br>
                        Password: <code>Sanjin1403</code>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === 'Sanjin' && password === 'Sanjin1403') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        isAuthenticated = true;
        currentUser = username;
        
        // Show the site selection map instead of reloading
        showSiteMap();
    } else {
        errorDiv.textContent = 'Invalid username or password. Please try again.';
        errorDiv.classList.remove('d-none');
    }
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    isAuthenticated = false;
    location.reload();
}

// Dashboard initialization
function initializeDashboard() {
    updateDashboard();
    startRealTimeUpdates();
    
    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 500);
}

function startRealTimeUpdates() {
    // Update data every 5 seconds
    updateInterval = setInterval(() => {
        updateRealTimeData();
    }, 5000);
}

function updateRealTimeData() {
    const config = siteConfigs[currentSite];
    
    // Simulate real-time data changes
    config.totalPower += (Math.random() - 0.5) * 10;
    config.solarGeneration += (Math.random() - 0.5) * 15;
    config.powerFactor += (Math.random() - 0.5) * 0.02;
    
    // Keep values within realistic ranges
    config.totalPower = Math.max(0, config.totalPower);
    config.solarGeneration = Math.max(0, config.solarGeneration);
    config.powerFactor = Math.max(0.8, Math.min(1.0, config.powerFactor));
    
    // Update building data
    config.buildings.forEach(building => {
        building.power += (Math.random() - 0.5) * 5;
        building.power = Math.max(0, building.power);
        
        // Update status based on power consumption
        if (building.power > 200) {
            building.status = 'critical';
        } else if (building.power > 100) {
            building.status = 'warning';
        } else {
            building.status = 'normal';
        }
    });
    
    updateDashboard();
    updateCharts();
}

// Site switching
function switchSite(siteId) {
    currentSite = siteId;
    const config = siteConfigs[siteId];
    
    document.getElementById('currentSiteName').textContent = config.name;
    updateDashboard();
    updateCharts();
    updateSankeyDiagram();
    updateSLD();
}

// Dashboard updates
function updateDashboard() {
    const config = siteConfigs[currentSite];
    
    // Update metric cards
    document.getElementById('currentPower').textContent = `${config.totalPower.toFixed(1)} kW`;
    document.getElementById('solarGeneration').textContent = `${config.solarGeneration.toFixed(1)} kW`;
    document.getElementById('energyCost').textContent = `R ${config.energyCost.toLocaleString()}`;
    document.getElementById('powerFactor').textContent = config.powerFactor.toFixed(2);
    
    // Update building status
    updateBuildingStatus();
    updateConsumptionTable();
}

function updateBuildingStatus() {
    const config = siteConfigs[currentSite];
    const container = document.getElementById('buildingStatus');
    
    container.innerHTML = config.buildings.map(building => `
        <div class="col-md-4 mb-3">
            <div class="building-card ${building.status}-consumption">
                <div class="building-name">
                    <i class="fas fa-building me-2"></i>${building.name}
                </div>
                <div class="building-metrics">
                    <div class="building-power">${building.power.toFixed(1)} kW</div>
                    <div class="building-status status-${building.status}">
                        ${building.status}
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">Efficiency: ${building.efficiency}%</small>
                </div>
            </div>
        </div>
    `).join('');
}

function updateConsumptionTable() {
    const config = siteConfigs[currentSite];
    const tbody = document.getElementById('consumptionTable');
    
    tbody.innerHTML = config.buildings.map(building => `
        <tr>
            <td><i class="fas fa-building me-2"></i>${building.name}</td>
            <td>${building.power.toFixed(1)} kW</td>
            <td>${(building.power * 24).toFixed(1)} kWh</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${building.efficiency > 90 ? 'bg-success' : building.efficiency > 80 ? 'bg-warning' : 'bg-danger'}" 
                         style="width: ${building.efficiency}%">${building.efficiency}%</div>
                </div>
            </td>
            <td>
                <span class="badge ${building.status === 'normal' ? 'bg-success' : building.status === 'warning' ? 'bg-warning' : 'bg-danger'}">
                    ${building.status.toUpperCase()}
                </span>
            </td>
        </tr>
    `).join('');
}

// Utility functions
function generateTimeLabels(hours = 24) {
    const labels = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        }));
    }
    
    return labels;
}

function generateRandomData(length, min, max, trend = 0) {
    const data = [];
    let current = (min + max) / 2;
    
    for (let i = 0; i < length; i++) {
        current += (Math.random() - 0.5) * (max - min) * 0.1 + trend;
        current = Math.max(min, Math.min(max, current));
        data.push(current);
    }
    
    return data;
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(num);
}

function getStatusColor(status) {
    switch (status) {
        case 'normal': return '#198754';
        case 'warning': return '#ffc107';
        case 'critical': return '#dc3545';
        default: return '#6c757d';
    }
}

// Export functions for use in other files
window.switchSite = switchSite;
window.logout = logout;
window.login = login;
window.updateSankeyView = updateSankeyView;
window.updateSLD = updateSLD;
window.siteConfigs = siteConfigs;
window.currentSite = currentSite;
window.generateTimeLabels = generateTimeLabels;
window.generateRandomData = generateRandomData;
window.formatNumber = formatNumber;
window.getStatusColor = getStatusColor;


// SLD update function
function updateSLD() {
    const config = siteConfigs[currentSite];
    if (config && config.sld) {
        const titleElement = document.getElementById('sldTitle');
        const descriptionElement = document.getElementById('sldDescription');
        const imageElement = document.getElementById('sldImage');
        
        if (titleElement) titleElement.textContent = config.sld.title;
        if (descriptionElement) descriptionElement.textContent = config.sld.description;
        if (imageElement) {
            imageElement.src = config.sld.image;
            imageElement.alt = config.sld.title;
        }
    }
}




// Site Map Functions
function showSiteMap() {
    document.getElementById('app').innerHTML = `
        <div class="map-container">
            <div class="map-header">
                <h2><i class="fas fa-bolt me-2"></i>Multi-Site Energy Management</h2>
                <p>Select a site to view its energy dashboard</p>
            </div>
            
            <button class="btn btn-outline-light logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
            </button>
            
            <div class="map-controls">
                <h6><i class="fas fa-map-marker-alt me-2"></i>Sites</h6>
                <div class="site-legend">
                    <div class="legend-item">
                        <div class="legend-icon legend-main"><i class="fas fa-industry"></i></div>
                        <span>Main Facility</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-icon legend-warehouse"><i class="fas fa-warehouse"></i></div>
                        <span>Warehouse North</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-icon legend-manufacturing"><i class="fas fa-cogs"></i></div>
                        <span>Manufacturing Plant</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-icon legend-distribution"><i class="fas fa-truck"></i></div>
                        <span>Distribution Center</span>
                    </div>
                </div>
            </div>
            
            <div id="site-map"></div>
        </div>
    `;
    
    // Initialize the map after DOM is ready
    setTimeout(initializeSiteMap, 100);
}

function initializeSiteMap() {
    // Initialize map centered on South Africa
    const map = L.map('site-map').setView([-28.5, 24.5], 6);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Site locations in South Africa
    const sites = [
        {
            id: 'main-facility',
            name: 'Main Facility',
            location: 'Johannesburg',
            lat: -26.2041,
            lon: 28.0473,
            icon: 'fas fa-industry',
            color: '#dc3545',
            description: 'Primary manufacturing and administrative facility'
        },
        {
            id: 'warehouse-north',
            name: 'Warehouse North',
            location: 'Pretoria',
            lat: -25.7479,
            lon: 28.2293,
            icon: 'fas fa-warehouse',
            color: '#28a745',
            description: 'Northern distribution warehouse and storage facility'
        },
        {
            id: 'manufacturing-plant',
            name: 'Manufacturing Plant',
            location: 'Durban',
            lat: -29.8587,
            lon: 31.0218,
            icon: 'fas fa-cogs',
            color: '#ffc107',
            description: 'Heavy manufacturing and production facility'
        },
        {
            id: 'distribution-center',
            name: 'Distribution Center',
            location: 'Cape Town',
            lat: -33.9249,
            lon: 18.4241,
            icon: 'fas fa-truck',
            color: '#007bff',
            description: 'Southern distribution and logistics center'
        }
    ];
    
    // Add markers for each site
    sites.forEach(site => {
        // Create custom icon
        const customIcon = L.divIcon({
            html: `<div style="background-color: ${site.color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="${site.icon}" style="font-size: 14px;"></i></div>`,
            className: 'custom-site-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([site.lat, site.lon], { icon: customIcon }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="site-popup">
                <h5><i class="${site.icon} me-2"></i>${site.name}</h5>
                <p class="mb-2"><i class="fas fa-map-marker-alt me-1"></i>${site.location}</p>
                <p class="text-muted small mb-3">${site.description}</p>
                <button class="btn btn-primary" onclick="selectSite('${site.id}')">
                    <i class="fas fa-chart-line me-2"></i>View Dashboard
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });
        
        // Add click event to marker
        marker.on('click', function() {
            marker.openPopup();
        });
    });
}

function selectSite(siteId) {
    // Store selected site
    localStorage.setItem('selectedSite', siteId);
    currentSite = siteId;
    
    // Show the original dashboard
    showOriginalDashboard();
}

function showOriginalDashboard() {
    // Reload the page to show the original dashboard
    location.reload();
}

function backToMap() {
    // Clear selected site
    localStorage.removeItem('selectedSite');
    // Show site map
    showSiteMap();
}

