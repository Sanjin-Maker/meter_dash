// Sankey Diagram for Energy Flow Visualization

let sankeyChart;
let currentSankeyView = 'realtime';

// Initialize Sankey diagram
function initializeSankeyDiagram() {
    updateSankeyDiagram();
}

// Update Sankey view (realtime, daily, monthly)
function updateSankeyView(view) {
    currentSankeyView = view;
    updateSankeyDiagram();
    
    // Update button states
    document.querySelectorAll('[onclick*="updateSankeyView"]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
    event.target.classList.remove('btn-outline-primary');
    event.target.classList.add('btn-primary');
}

// Generate Sankey data based on current site and view
function generateSankeyData() {
    const config = siteConfigs[currentSite];
    const multiplier = currentSankeyView === 'monthly' ? 720 : currentSankeyView === 'daily' ? 24 : 1;
    
    // Energy sources
    const gridImport = (config.totalPower - config.solarGeneration * 0.8) * multiplier;
    const solarGeneration = config.solarGeneration * multiplier;
    const batteryDischarge = config.totalPower * 0.1 * multiplier;
    
    // Energy consumers (buildings)
    const buildings = config.buildings.map(building => ({
        name: building.name,
        consumption: building.power * multiplier,
        efficiency: building.efficiency
    }));
    
    // Calculate losses
    const transmissionLoss = (gridImport + solarGeneration) * 0.03;
    const conversionLoss = solarGeneration * 0.05;
    
    // Create nodes
    const nodes = [
        // Sources
        { name: 'Grid Import', category: 'source' },
        { name: 'Solar Panels', category: 'source' },
        { name: 'Battery Storage', category: 'source' },
        
        // Distribution
        { name: 'Main Distribution', category: 'distribution' },
        { name: 'Solar Inverter', category: 'distribution' },
        
        // Buildings
        ...buildings.map(b => ({ name: b.name, category: 'consumer' })),
        
        // Losses
        { name: 'Transmission Loss', category: 'loss' },
        { name: 'Conversion Loss', category: 'loss' },
        
        // Export
        { name: 'Grid Export', category: 'export' }
    ];
    
    // Create links
    const links = [
        // From sources to distribution
        { source: 0, target: 3, value: Math.max(0, gridImport) }, // Grid to Main Distribution
        { source: 1, target: 4, value: solarGeneration }, // Solar to Inverter
        { source: 2, target: 3, value: Math.max(0, batteryDischarge) }, // Battery to Main Distribution
        
        // From solar inverter
        { source: 4, target: 3, value: solarGeneration * 0.7 }, // Solar to Main Distribution
        { source: 4, target: nodes.length - 1, value: solarGeneration * 0.2 }, // Solar to Grid Export
        { source: 4, target: nodes.length - 3, value: conversionLoss }, // Solar to Conversion Loss
        
        // From main distribution to buildings
        ...buildings.map((building, index) => ({
            source: 3,
            target: 5 + index, // Building nodes start at index 5
            value: building.consumption
        })),
        
        // Transmission losses
        { source: 3, target: nodes.length - 2, value: transmissionLoss }
    ];
    
    return { nodes, links };
}

// Update Sankey diagram
function updateSankeyDiagram() {
    const data = generateSankeyData();
    
    // Clear previous diagram
    d3.select("#sankeyDiagram").selectAll("*").remove();
    
    // Set dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = document.getElementById('sankeyDiagram').clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select("#sankeyDiagram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create sankey generator
    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .extent([[0, 0], [width, height]]);
    
    // Generate sankey layout
    const { nodes, links } = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d))
    });
    
    // Color scale for different categories
    const colorScale = {
        'source': '#198754',      // Green for sources
        'distribution': '#0d6efd', // Blue for distribution
        'consumer': '#ffc107',     // Yellow for consumers
        'loss': '#dc3545',         // Red for losses
        'export': '#6f42c1'        // Purple for export
    };
    
    // Draw links
    g.append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => {
            const sourceCategory = nodes[d.source.index].category;
            return colorScale[sourceCategory] || '#6c757d';
        })
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("stroke-opacity", 0.6)
        .attr("fill", "none")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke-opacity", 0.8);
            showTooltip(event, `${d.source.name} → ${d.target.name}<br/>Flow: ${formatSankeyValue(d.value)}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("stroke-opacity", 0.6);
            hideTooltip();
        });
    
    // Draw nodes
    g.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => colorScale[d.category] || '#6c757d')
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("rx", 3)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
            showTooltip(event, `${d.name}<br/>Total: ${formatSankeyValue(d.value)}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 1);
            hideTooltip();
        });
    
    // Add node labels
    g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .attr("fill", "#333")
        .text(d => d.name);
    
    // Update flow summary
    updateFlowSummary(data);
    updateFlowAlerts(data);
}

// Format values for Sankey diagram
function formatSankeyValue(value) {
    const unit = currentSankeyView === 'monthly' ? 'MWh' : 'kWh';
    const divisor = currentSankeyView === 'monthly' ? 1000 : 1;
    return `${(value / divisor).toFixed(1)} ${unit}`;
}

// Update flow summary
function updateFlowSummary(data) {
    const config = siteConfigs[currentSite];
    const multiplier = currentSankeyView === 'monthly' ? 720 : currentSankeyView === 'daily' ? 24 : 1;
    
    const totalConsumption = config.totalPower * multiplier;
    const solarGeneration = config.solarGeneration * multiplier;
    const gridImport = Math.max(0, totalConsumption - solarGeneration * 0.8);
    const solarUtilization = (solarGeneration * 0.8 / totalConsumption * 100);
    
    const summaryHtml = `
        <div class="flow-summary-item">
            <span class="flow-summary-label">Total Consumption</span>
            <span class="flow-summary-value">${formatSankeyValue(totalConsumption)}</span>
        </div>
        <div class="flow-summary-item">
            <span class="flow-summary-label">Solar Generation</span>
            <span class="flow-summary-value">${formatSankeyValue(solarGeneration)}</span>
        </div>
        <div class="flow-summary-item">
            <span class="flow-summary-label">Grid Import</span>
            <span class="flow-summary-value">${formatSankeyValue(gridImport)}</span>
        </div>
        <div class="flow-summary-item">
            <span class="flow-summary-label">Solar Utilization</span>
            <span class="flow-summary-value">${solarUtilization.toFixed(1)}%</span>
        </div>
        <div class="flow-summary-item">
            <span class="flow-summary-label">Energy Efficiency</span>
            <span class="flow-summary-value">${(97 - Math.random() * 3).toFixed(1)}%</span>
        </div>
    `;
    
    document.getElementById('flowSummary').innerHTML = summaryHtml;
}

// Update flow alerts
function updateFlowAlerts(data) {
    const config = siteConfigs[currentSite];
    const alerts = [];
    
    // Check for high consumption buildings
    const highConsumptionBuildings = config.buildings.filter(b => b.power > 150);
    if (highConsumptionBuildings.length > 0) {
        alerts.push({
            type: 'warning',
            message: `High consumption detected in ${highConsumptionBuildings.length} building(s): ${highConsumptionBuildings.map(b => b.name).join(', ')}`
        });
    }
    
    // Check solar utilization
    const solarUtilization = (config.solarGeneration * 0.8 / config.totalPower * 100);
    if (solarUtilization < 60) {
        alerts.push({
            type: 'info',
            message: `Solar utilization is ${solarUtilization.toFixed(1)}%. Consider energy storage or load shifting.`
        });
    }
    
    // Check power factor
    if (config.powerFactor < 0.9) {
        alerts.push({
            type: 'warning',
            message: `Power factor is ${config.powerFactor.toFixed(2)}. Consider power factor correction.`
        });
    }
    
    // Check for critical buildings
    const criticalBuildings = config.buildings.filter(b => b.status === 'critical');
    if (criticalBuildings.length > 0) {
        alerts.push({
            type: 'danger',
            message: `Critical status in ${criticalBuildings.map(b => b.name).join(', ')}. Immediate attention required.`
        });
    }
    
    // Default message if no alerts
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            message: 'All energy flows are operating within normal parameters.'
        });
    }
    
    const alertsHtml = alerts.map(alert => `
        <div class="flow-alert ${alert.type}">
            <i class="fas fa-${alert.type === 'danger' ? 'exclamation-triangle' : alert.type === 'warning' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${alert.message}
        </div>
    `).join('');
    
    document.getElementById('flowAlerts').innerHTML = alertsHtml;
}

// Tooltip functions
function showTooltip(event, content) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .html(content);
    
    tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
}

function hideTooltip() {
    d3.selectAll(".tooltip").remove();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Sankey diagram when the flow tab is shown
    document.getElementById('flow-tab').addEventListener('shown.bs.tab', function() {
        setTimeout(initializeSankeyDiagram, 100);
    });
});

// Export functions
window.updateSankeyView = updateSankeyView;
window.initializeSankeyDiagram = initializeSankeyDiagram;
window.updateSankeyDiagram = updateSankeyDiagram;

