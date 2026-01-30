




Chart.register(ChartDataLabels);

let currentChart = null;

// Use injected data from HTML template
// allIndicators and dimensionData are provided by the template via inline script in the head section
// These variables are defined globally before this script executes (due to defer attribute)
// If they're not defined, log an error but don't create local variables that would shadow globals
if (typeof allIndicators === 'undefined') {
    console.error('allIndicators not found. Make sure data is injected in the HTML template.');
}
if (typeof dimensionData === 'undefined') {
    console.error('dimensionData not found. Make sure data is injected in the HTML template.');
}

// Label wrapping function
function wrapLabel(label, maxWidth) {
    const words = label.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        if (testLine.length <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function showView(view) {
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const selector = document.getElementById('dimensionSelector');
    const instructions = document.getElementById('dimensionInstructions');
    const select = document.getElementById('dimensionSelect');

    if (view === 'dimension') {
        selector.classList.add('active');
        if (instructions) instructions.style.display = 'block';
        if (select.value) {
            showDimension();
        } else {
            const content = document.getElementById('mainContent');
            content.innerHTML = '<div style="padding: 40px; text-align: center; color: #9CA3AF; font-size: 0.95em;">Select a dimension from the dropdown above to view all opportunities.</div>';
        }
    } else {
        selector.classList.remove('active');
        if (instructions) instructions.style.display = 'none';
        select.value = '';
        showTopGaps();
    }
}

function showTopGaps() {
    const significantGaps = allIndicators.filter(item => item.gap >= 0.5);
    significantGaps.sort((a, b) => b.pctHigh - a.pctHigh);
    // Limit to top 9 items for both chart and table
    const topGaps = significantGaps.slice(0, 9);

    const content = document.getElementById('mainContent');
    content.innerHTML = `
                <div class="chart-container">
                    <div class="chart-wrapper">
                        <canvas id="gapsChart"></canvas>
                    </div>
                </div>
                
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th style="width: 15%;">Dimension</th>
                            <th style="width: 35%;">Opportunity</th>
                            <th style="text-align: center; width: 12%;">Community</th>
                            <th style="text-align: center; width: 12%;">Offerings</th>
                            <th style="text-align: center; width: 10%;">Gap</th>
                            <th style="text-align: center; width: 16%;">% High (4-5)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topGaps.map(item => `
                            <tr>
                                <td><span class="dimension-badge">${item.dimension}</span></td>
                                <td>${item.indicator}</td>
                                <td style="text-align: center; font-weight: 600;">${item.community.toFixed(2)}</td>
                                <td style="text-align: center; font-weight: 600;">${item.offerings.toFixed(2)}</td>
                                <td style="text-align: center;"><span class="gap-positive">+${item.gap.toFixed(2)}</span></td>
                                <td style="text-align: center; font-weight: 700; color: #2C90C4;">${item.pctHigh.toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    createGapsChart(topGaps);
}

function createGapsChart(data) {
    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('gapsChart');
    if (!ctx) return;

    const backgroundColors = data.map(item => {
        if (item.pctHigh >= 50) return '#70C3E9';
        if (item.pctHigh >= 30) return '#2C90C4';
        return '#2C80DE';
    });

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => wrapLabel(item.indicator, 32)),
            datasets: [{
                label: '% Rated 4-5',
                data: data.map(item => item.pctHigh),
                backgroundColor: backgroundColors,
                borderColor: '#2C90C4',
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 160,
                    right: 30,
                    top: 8,
                    bottom: 8
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 11, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 10, family: 'Manrope', weight: '500' },
                    padding: 10,
                    callbacks: {
                        title: function (context) {
                            return data[context[0].dataIndex].indicator;
                        },
                        label: (context) => context.parsed.x.toFixed(1) + '% rated 4-5'
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 3,
                    formatter: (value) => value.toFixed(1) + '%',
                    color: '#2c3e50',
                    font: { size: 10, weight: '700', family: 'Manrope' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0, 0, 0, 0.08)' },
                    ticks: {
                        font: { size: 9, family: 'Manrope', weight: '500' },
                        color: '#6B7280',
                        callback: (value) => value + '%'
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: '700', family: 'Manrope' }, color: '#2c3e50', padding: 6, autoSkip: false }
                }
            }
        }
    });
}

function showDimension() {
    const select = document.getElementById('dimensionSelect');
    const dimId = select.value;

    if (!dimId || !dimensionData[dimId]) {
        document.getElementById('mainContent').innerHTML = '<div style="padding: 40px; text-align: center; color: #9CA3AF; font-size: 0.95em;">Select a dimension from the dropdown above.</div>';
        return;
    }

    const dim = dimensionData[dimId];
    const sortedIndicators = [...dim.indicators].sort((a, b) => b.pctHigh - a.pctHigh);

    const content = document.getElementById('mainContent');
    content.innerHTML = `
                <div class="chart-container">
                    <div class="chart-wrapper">
                        <canvas id="dimensionChart"></canvas>
                    </div>
                </div>
                
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th style="width: 40%;">Opportunity</th>
                            <th style="text-align: center; width: 15%;">Community</th>
                            <th style="text-align: center; width: 15%;">Offerings</th>
                            <th style="text-align: center; width: 12%;">Gap</th>
                            <th style="text-align: center; width: 18%;">% High (4-5)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedIndicators.map(item => {
        let gapClass = '';
        let gapSign = '';
        if (Math.abs(item.gap) >= 0.5) {
            if (item.gap > 0) {
                gapClass = 'gap-positive';
                gapSign = '+';
            } else {
                gapClass = 'gap-negative';
            }
        } else {
            gapClass = 'font-weight: 600; color: #6B7280;';
            gapSign = item.gap > 0 ? '+' : '';
        }
        return `
                                <tr>
                                    <td style="font-weight: 500;">${item.name}</td>
                                    <td style="text-align: center; font-weight: 600;">${item.community.toFixed(2)}</td>
                                    <td style="text-align: center; font-weight: 600;">${item.offerings.toFixed(2)}</td>
                                    <td style="text-align: center;"><span class="${gapClass}">${gapSign}${item.gap.toFixed(2)}</span></td>
                                    <td style="text-align: center; font-weight: 600;">${item.pctHigh.toFixed(1)}%</td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            `;

    createDimensionChart(sortedIndicators);
}

function createDimensionChart(data) {
    if (currentChart) {
        currentChart.destroy();
    }

    const ctx = document.getElementById('dimensionChart');
    if (!ctx) return;

    // Color bars by percentage (same as top gaps)
    const backgroundColors = data.map(item => {
        if (item.pctHigh >= 50) return '#70C3E9';
        if (item.pctHigh >= 30) return '#2C90C4';
        return '#2C80DE';
    });

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => wrapLabel(item.name, 30)),
            datasets: [{
                label: '% Rated 4-5',
                data: data.map(item => item.pctHigh),
                backgroundColor: backgroundColors,
                borderColor: '#2C90C4',
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 160,
                    right: 40,
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 11, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 10, family: 'Manrope', weight: '500' },
                    padding: 10,
                    callbacks: {
                        title: function (context) {
                            return data[context[0].dataIndex].name;
                        },
                        label: function (context) {
                            const item = data[context.dataIndex];
                            return [
                                '% High (4-5): ' + item.pctHigh.toFixed(1) + '%',
                                'Community: ' + item.community.toFixed(2),
                                'Offerings: ' + item.offerings.toFixed(2),
                                'Gap: ' + (item.gap > 0 ? '+' : '') + item.gap.toFixed(2)
                            ];
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 3,
                    formatter: (value) => value.toFixed(1) + '%',
                    color: '#2c3e50',
                    font: { size: 10, weight: '700', family: 'Manrope' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0, 0, 0, 0.08)' },
                    ticks: {
                        font: { size: 9, family: 'Manrope', weight: '500' },
                        color: '#6B7280',
                        callback: (value) => value + '%'
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, weight: '700', family: 'Manrope' },
                        color: '#2c3e50',
                        padding: 8,
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function initSlide09() {
    // Check if data is available before initializing
    if (typeof allIndicators === 'undefined' || typeof dimensionData === 'undefined') {
        console.error('Chart data not available. Cannot initialize slide 09.');
        const content = document.getElementById('mainContent');
        if (content) {
            content.innerHTML = '<div style="padding: 40px; text-align: center; color: #EF4444; font-size: 0.95em;">Error: Chart data not loaded. Please refresh the page.</div>';
        }
        return;
    }

    const select = document.getElementById('dimensionSelect');
    if (!select) {
        console.error('dimensionSelect element not found');
        return;
    }

    Object.keys(dimensionData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = dimensionData[key].name;
        select.appendChild(option);
    });

    showTopGaps();
}

// Initialize - wait for DOM and data to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        // Small delay to ensure inline scripts have executed
        setTimeout(initSlide09, 0);
    });
} else {
    // DOM already loaded, but wait a tick for inline scripts
    setTimeout(initSlide09, 0);
}
