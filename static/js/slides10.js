
// Initialize charts when DOM is ready - matching slides3_7.js pattern
document.addEventListener('DOMContentLoaded', function () {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }

    /**
     * Creates a consensus chart for a specific canvas element
     * @param {string} canvasId - The ID of the canvas element
     * @param {Array} data - Array of consensus data objects
     */
    function createConsensusChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.log(`Canvas ${canvasId} not found, skipping`);
            return;
        }

        if (!data || data.length === 0) {
            console.log(`No data for ${canvasId}, skipping`);
            return;
        }

        console.log(`Creating chart for ${canvasId} with ${data.length} items`);

        const dimensions = data.map(d => d.name);
        const lowPct = data.map(d => d.low);
        const medPct = data.map(d => d.medium);
        const highPct = data.map(d => d.high);

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: dimensions,
                datasets: [
                    {
                        label: 'Low (1-2)',
                        data: lowPct,
                        backgroundColor: 'rgba(173, 216, 230, 0.5)',
                        borderColor: 'rgba(173, 216, 230, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    },
                    {
                        label: 'Medium (3)',
                        data: medPct,
                        backgroundColor: 'rgba(112, 195, 233, 0.7)',
                        borderColor: 'rgba(112, 195, 233, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    },
                    {
                        label: 'High (4-5)',
                        data: highPct,
                        backgroundColor: 'rgba(44, 144, 196, 0.9)',
                        borderColor: 'rgba(44, 144, 196, 1)',
                        borderWidth: 1.5,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.95)',
                        titleFont: { size: 14, family: 'Manrope', weight: '700' },
                        bodyFont: { size: 13, family: 'Manrope', weight: '500' },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            afterTitle: function (context) {
                                const index = context[0].dataIndex;
                                const item = data[index];
                                return `rWG: ${item.rwg.toFixed(3)}`;
                            },
                            label: function (context) {
                                return context.dataset.label + ': ' + context.parsed.x.toFixed(1) + '%';
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value) => value > 5 ? value.toFixed(0) + '%' : '',
                        color: (context) => {
                            return context.datasetIndex === 2 ? 'white' : '#2c3e50';
                        },
                        font: {
                            size: 11,
                            weight: '700',
                            family: 'Manrope'
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage of Board and Staff Members',
                            font: { size: 14, weight: '600', family: 'Manrope' },
                            color: '#4B5563'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { size: 12, family: 'Manrope', weight: '500' },
                            color: '#6B7280',
                            callback: (value) => value + '%'
                        }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            font: { size: 12, weight: '500', family: 'Manrope' },
                            color: '#4B5563',
                            padding: 12
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Create charts for each consensus level
    if (typeof consensusHighData !== 'undefined' && consensusHighData) {
        createConsensusChart('consensusChartHigh', consensusHighData);
    }
    if (typeof consensusMediumData !== 'undefined' && consensusMediumData) {
        createConsensusChart('consensusChartMedium', consensusMediumData);
    }
    if (typeof consensusLowData !== 'undefined' && consensusLowData) {
        createConsensusChart('consensusChartLow', consensusLowData);
    }
});
