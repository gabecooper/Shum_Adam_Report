// Threshold constants for rating classifications
const HIGH_THRESHOLD = 4;      // Threshold between HIGH and MEDIUM
const MEDIUM_THRESHOLD = 3;    // Threshold between MEDIUM and LOW

document.addEventListener('DOMContentLoaded', function () {
    // SLIDE 03 - Mission Importance Chart (Organizational Priorities)
    const missionCtx = document.getElementById('missionChart').getContext('2d');

    // Use injected data from HTML template
    // missionData is already sorted and provided by the template
    if (!missionData || missionData.length === 0) {
        console.error('missionData not found. Make sure data is injected in the HTML template.');
        return;
    }

    // Assign colors based on thresholds
    const getColor = (mean) => {
        if (mean >= HIGH_THRESHOLD) return 'rgba(44, 144, 196, 0.85)'; // Strong blue (High)
        if (mean >= MEDIUM_THRESHOLD) return 'rgba(112, 195, 233, 0.75)'; // Moderate blue (Middle)
        return 'rgba(173, 216, 230, 0.65)'; // Light blue (Low)
    };

    const getBorderColor = (mean) => {
        if (mean >= HIGH_THRESHOLD) return 'rgba(44, 144, 196, 1)';
        if (mean >= MEDIUM_THRESHOLD) return 'rgba(112, 195, 233, 1)';
        return 'rgba(173, 216, 230, 1)';
    };

    // Plugin to draw background zones - dynamically based on data thresholds
    const backgroundZonesPlugin = {
        id: 'backgroundZones',
        beforeDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            // HIGH zone background
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highTop = bars[0].y - (bars[0].height / 2);
                const highBottom = bars[lastHighIndex].y + (bars[lastHighIndex].height / 2);
                ctx.fillStyle = 'rgba(44, 144, 196, 0.08)';
                ctx.fillRect(chartArea.left, highTop, chartArea.width, highBottom - highTop);
            }

            // MEDIUM zone background
            const medStartIndex = lastHighIndex + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medTop = bars[medStartIndex].y - (bars[medStartIndex].height / 2);
                const medBottom = bars[medEndIndex].y + (bars[medEndIndex].height / 2);
                ctx.fillStyle = 'rgba(112, 195, 233, 0.08)';
                ctx.fillRect(chartArea.left, medTop, chartArea.width, medBottom - medTop);
            }

            // LOW zone background
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowTop = bars[lowStartIndex].y - (bars[lowStartIndex].height / 2);
                const lowBottom = bars[lowEndIndex].y + (bars[lowEndIndex].height / 2);
                ctx.fillStyle = 'rgba(173, 216, 230, 0.08)';
                ctx.fillRect(chartArea.left, lowTop, chartArea.width, lowBottom - lowTop);
            }

            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            ctx.strokeStyle = 'rgba(44, 144, 196, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);

            // Line between HIGH and MEDIUM
            const medStartIndex = lastHighIndex + 1;
            if (lastHighIndex >= 0 && bars[lastHighIndex] && bars[medStartIndex]) {
                const lineY = (bars[lastHighIndex].y + bars[medStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            // Line between MEDIUM and LOW
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medEndIndex] && bars[lowStartIndex]) {
                ctx.strokeStyle = 'rgba(112, 195, 233, 0.4)';
                const lineY = (bars[medEndIndex].y + bars[lowStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            ctx.setLineDash([]);

            ctx.font = '600 12px Manrope';
            ctx.fillStyle = 'rgba(44, 62, 80, 0.8)';
            ctx.textAlign = 'right';

            // HIGH label
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highY = (bars[0].y + bars[lastHighIndex].y) / 2;
                ctx.fillText(`HIGH (≥${HIGH_THRESHOLD})`, chartArea.right - 10, highY);
            }

            // MEDIUM label
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medY = (bars[medStartIndex].y + bars[medEndIndex].y) / 2;
                ctx.fillText(`MEDIUM (${MEDIUM_THRESHOLD}-${HIGH_THRESHOLD})`, chartArea.right - 10, medY);
            }

            // LOW label
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowY = (bars[lowStartIndex].y + bars[lowEndIndex].y) / 2;
                ctx.fillText(`LOW (<${MEDIUM_THRESHOLD})`, chartArea.right - 10, lowY);
            }

            ctx.restore();
        }
    };
    new Chart(missionCtx, {
        type: 'bar',
        data: {
            labels: missionData.map(d => d.name),
            datasets: [{
                label: 'Board/Staff Importance',
                data: missionData.map(d => d.mean),
                backgroundColor: missionData.map(d => getColor(d.mean)),
                borderColor: missionData.map(d => getBorderColor(d.mean)),
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        plugins: [ChartDataLabels, backgroundZonesPlugin],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 12, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => 'Rating: ' + context.parsed.x.toFixed(2)
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value.toFixed(2),
                    color: '#2c3e50',
                    font: { size: 11, weight: '700', family: 'Manrope' },
                    offset: 4
                }
            },
            scales: {
                x: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 0.5,
                        font: { size: 12, family: 'Manrope', weight: '500' },
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.08)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Board/Staff importance ratings (Scale 1-5)',
                        font: { size: 14, weight: '600', family: 'Manrope' },
                        color: '#4B5563',
                        padding: { top: 10 }
                    }
                },
                y: {
                    ticks: {
                        font: { size: 11, weight: '500', family: 'Manrope' },
                        color: '#4B5563',
                        autoSkip: false,
                        padding: 8
                    },
                    grid: { display: false }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 160,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });

    // SLIDE 04 - Program Alignment Chart
    const programAlignmentCtx = document.getElementById('programAlignmentChart').getContext('2d');

    // Use injected dimensionsData to build program alignment data
    // Same order as missionData (sorted by mission mean)
    const programAlignmentData = missionData.map(d => {
        const dim = dimensionsData.find(dim => dim.id === d.dim);
        return {
            dim: d.dim,
            name: d.name,
            mission: d.mean,
            program: dim ? dim.programs.mean : 0
        };
    });

    // Assign colors based on thresholds (for mission bars)
    const getColor2 = (mean) => {
        if (mean >= HIGH_THRESHOLD) return 'rgba(44, 144, 196, 0.85)';
        if (mean >= MEDIUM_THRESHOLD) return 'rgba(112, 195, 233, 0.75)';
        return 'rgba(173, 216, 230, 0.65)';
    };

    const getBorderColor2 = (mean) => {
        if (mean >= HIGH_THRESHOLD) return 'rgba(44, 144, 196, 1)';
        if (mean >= MEDIUM_THRESHOLD) return 'rgba(112, 195, 233, 1)';
        return 'rgba(173, 216, 230, 1)';
    };

    // Background zones plugin (same as slide 3) - dynamically based on data thresholds
    const backgroundZonesPlugin2 = {
        id: 'backgroundZones2',
        beforeDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            // HIGH zone background
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highTop = bars[0].y - (bars[0].height / 2);
                const highBottom = bars[lastHighIndex].y + (bars[lastHighIndex].height / 2);
                ctx.fillStyle = 'rgba(44, 144, 196, 0.08)';
                ctx.fillRect(chartArea.left, highTop, chartArea.width, highBottom - highTop);
            }

            // MEDIUM zone background
            const medStartIndex = lastHighIndex + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medTop = bars[medStartIndex].y - (bars[medStartIndex].height / 2);
                const medBottom = bars[medEndIndex].y + (bars[medEndIndex].height / 2);
                ctx.fillStyle = 'rgba(112, 195, 233, 0.08)';
                ctx.fillRect(chartArea.left, medTop, chartArea.width, medBottom - medTop);
            }

            // LOW zone background
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowTop = bars[lowStartIndex].y - (bars[lowStartIndex].height / 2);
                const lowBottom = bars[lowEndIndex].y + (bars[lowEndIndex].height / 2);
                ctx.fillStyle = 'rgba(173, 216, 230, 0.08)';
                ctx.fillRect(chartArea.left, lowTop, chartArea.width, lowBottom - lowTop);
            }

            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            ctx.strokeStyle = 'rgba(44, 144, 196, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);

            // Line between HIGH and MEDIUM
            const medStartIndex = lastHighIndex + 1;
            if (lastHighIndex >= 0 && bars[lastHighIndex] && bars[medStartIndex]) {
                const lineY = (bars[lastHighIndex].y + bars[medStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            // Line between MEDIUM and LOW
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medEndIndex] && bars[lowStartIndex]) {
                ctx.strokeStyle = 'rgba(112, 195, 233, 0.4)';
                const lineY = (bars[medEndIndex].y + bars[lowStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            ctx.setLineDash([]);

            ctx.font = '600 12px Manrope';
            ctx.fillStyle = 'rgba(44, 62, 80, 0.8)';
            ctx.textAlign = 'right';

            // HIGH label
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highY = (bars[0].y + bars[lastHighIndex].y) / 2;
                ctx.fillText(`HIGH (≥${HIGH_THRESHOLD})`, chartArea.right - 10, highY);
            }

            // MEDIUM label
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medY = (bars[medStartIndex].y + bars[medEndIndex].y) / 2;
                ctx.fillText(`MEDIUM (${MEDIUM_THRESHOLD}-${HIGH_THRESHOLD})`, chartArea.right - 10, medY);
            }

            // LOW label
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowY = (bars[lowStartIndex].y + bars[lowEndIndex].y) / 2;
                ctx.fillText(`LOW (<${MEDIUM_THRESHOLD})`, chartArea.right - 10, lowY);
            }

            ctx.restore();
        }
    };

    new Chart(programAlignmentCtx, {
        type: 'bar',
        data: {
            labels: programAlignmentData.map(d => d.name),
            datasets: [
                {
                    label: 'Organizational Priorities',
                    data: programAlignmentData.map(d => d.mission),
                    backgroundColor: programAlignmentData.map(d => getColor2(d.mission)),
                    borderColor: programAlignmentData.map(d => getBorderColor2(d.mission)),
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                    order: 2
                },
                {
                    label: 'Programs/Offerings',
                    data: programAlignmentData.map(d => d.program),
                    backgroundColor: 'rgba(139, 154, 0, 1)',
                    borderColor: 'rgba(100, 110, 0, 1)',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter',
                    order: 1
                }
            ]
        },
        plugins: [ChartDataLabels, backgroundZonesPlugin2],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        font: { size: 12, family: 'Manrope', weight: '600' },
                        color: '#2c3e50',
                        padding: 15,
                        boxWidth: 15,
                        boxHeight: 15,
                        usePointStyle: true
                    },
                    onClick: function (e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const meta = ci.getDatasetMeta(index);

                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                        ci.update();
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 12, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.x || context.parsed.y;
                            return label + ': ' + value.toFixed(2);
                        }
                    }
                },
                datalabels: {
                    display: (context) => {
                        return context.datasetIndex === 0;
                    },
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value.toFixed(2),
                    color: '#2c3e50',
                    font: { size: 11, weight: '700', family: 'Manrope' },
                    offset: 4
                }
            },
            scales: {
                x: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 0.5,
                        font: { size: 12, family: 'Manrope', weight: '500' },
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.08)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Board/Staff importance ratings (Scale 1-5)',
                        font: { size: 14, weight: '600', family: 'Manrope' },
                        color: '#4B5563',
                        padding: { top: 10 }
                    }
                },
                y: {
                    ticks: {
                        font: { size: 11, weight: '500', family: 'Manrope' },
                        color: '#4B5563',
                        autoSkip: false,
                        padding: 8
                    },
                    grid: { display: false }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 160,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });

    // SLIDE 05 - Community Alignment Chart
    const communityAlignmentCtx = document.getElementById('communityAlignmentChart').getContext('2d');

    // Use injected dimensionsData to build community alignment data
    // Same order as missionData (sorted by mission mean)
    const communityAlignmentData = missionData.map(d => {
        const dim = dimensionsData.find(dim => dim.id === d.dim);
        return {
            dim: d.dim,
            name: d.name,
            mission: d.mean,
            community: dim ? dim.community.mean : 0
        };
    });

    // Create programRatings map for use in chart
    const programRatings = {};
    dimensionsData.forEach(d => {
        programRatings[d.id] = d.programs.mean;
    });

    // Background zones plugin (same as slides 3 & 4) - dynamically based on data thresholds
    const backgroundZonesPlugin3 = {
        id: 'backgroundZones3',
        beforeDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            // HIGH zone background
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highTop = bars[0].y - (bars[0].height / 2);
                const highBottom = bars[lastHighIndex].y + (bars[lastHighIndex].height / 2);
                ctx.fillStyle = 'rgba(44, 144, 196, 0.08)';
                ctx.fillRect(chartArea.left, highTop, chartArea.width, highBottom - highTop);
            }

            // MEDIUM zone background
            const medStartIndex = lastHighIndex + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medTop = bars[medStartIndex].y - (bars[medStartIndex].height / 2);
                const medBottom = bars[medEndIndex].y + (bars[medEndIndex].height / 2);
                ctx.fillStyle = 'rgba(112, 195, 233, 0.08)';
                ctx.fillRect(chartArea.left, medTop, chartArea.width, medBottom - medTop);
            }

            // LOW zone background
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowTop = bars[lowStartIndex].y - (bars[lowStartIndex].height / 2);
                const lowBottom = bars[lowEndIndex].y + (bars[lowEndIndex].height / 2);
                ctx.fillStyle = 'rgba(173, 216, 230, 0.08)';
                ctx.fillRect(chartArea.left, lowTop, chartArea.width, lowBottom - lowTop);
            }

            ctx.restore();
        },
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const meta = chart.getDatasetMeta(0);

            if (!meta.data || meta.data.length === 0) return;

            ctx.save();
            const bars = meta.data;
            const data = chart.data.datasets[0].data;

            // Find zone boundaries based on actual data values
            let lastHighIndex = -1, lastMediumIndex = -1;
            data.forEach((val, i) => {
                if (val >= HIGH_THRESHOLD) lastHighIndex = i;
                else if (val >= MEDIUM_THRESHOLD) lastMediumIndex = i;
            });

            ctx.strokeStyle = 'rgba(44, 144, 196, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);

            // Line between HIGH and MEDIUM
            const medStartIndex = lastHighIndex + 1;
            if (lastHighIndex >= 0 && bars[lastHighIndex] && bars[medStartIndex]) {
                const lineY = (bars[lastHighIndex].y + bars[medStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            // Line between MEDIUM and LOW
            const lowStartIndex = Math.max(lastHighIndex, lastMediumIndex) + 1;
            const medEndIndex = lastMediumIndex >= medStartIndex ? lastMediumIndex : -1;
            if (medEndIndex >= 0 && bars[medEndIndex] && bars[lowStartIndex]) {
                ctx.strokeStyle = 'rgba(112, 195, 233, 0.4)';
                const lineY = (bars[medEndIndex].y + bars[lowStartIndex].y) / 2;
                ctx.beginPath();
                ctx.moveTo(chartArea.left, lineY);
                ctx.lineTo(chartArea.right, lineY);
                ctx.stroke();
            }

            ctx.setLineDash([]);

            ctx.font = '600 12px Manrope';
            ctx.fillStyle = 'rgba(44, 62, 80, 0.8)';
            ctx.textAlign = 'right';

            // HIGH label
            if (lastHighIndex >= 0 && bars[0] && bars[lastHighIndex]) {
                const highY = (bars[0].y + bars[lastHighIndex].y) / 2;
                ctx.fillText(`HIGH (≥${HIGH_THRESHOLD})`, chartArea.right - 10, highY);
            }

            // MEDIUM label
            if (medEndIndex >= 0 && bars[medStartIndex] && bars[medEndIndex]) {
                const medY = (bars[medStartIndex].y + bars[medEndIndex].y) / 2;
                ctx.fillText(`MEDIUM (${MEDIUM_THRESHOLD}-${HIGH_THRESHOLD})`, chartArea.right - 10, medY);
            }

            // LOW label
            const lowEndIndex = data.length - 1;
            if (lowStartIndex <= lowEndIndex && bars[lowStartIndex] && bars[lowEndIndex]) {
                const lowY = (bars[lowStartIndex].y + bars[lowEndIndex].y) / 2;
                ctx.fillText(`LOW (<${MEDIUM_THRESHOLD})`, chartArea.right - 10, lowY);
            }

            ctx.restore();
        }
    };

    new Chart(communityAlignmentCtx, {
        type: 'bar',
        data: {
            labels: communityAlignmentData.map(d => d.name),
            datasets: [
                {
                    label: 'Organizational Priorities',
                    data: communityAlignmentData.map(d => d.mission),
                    backgroundColor: communityAlignmentData.map(d => getColor2(d.mission)),
                    borderColor: communityAlignmentData.map(d => getBorderColor2(d.mission)),
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8,
                    order: 3
                },
                {
                    label: 'Community Priorities',
                    data: communityAlignmentData.map(d => d.community),
                    backgroundColor: 'rgba(218, 140, 15, 1)',
                    borderColor: 'rgba(180, 110, 10, 1)',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter',
                    order: 1
                },
                {
                    label: 'Programs/Offerings',
                    data: communityAlignmentData.map(d => programRatings[d.dim]),
                    backgroundColor: 'rgba(139, 154, 0, 1)',
                    borderColor: 'rgba(100, 110, 0, 1)',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter',
                    order: 2,
                    hidden: true
                }
            ]
        },
        plugins: [ChartDataLabels, backgroundZonesPlugin3],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        font: { size: 12, family: 'Manrope', weight: '600' },
                        color: '#2c3e50',
                        padding: 15,
                        boxWidth: 15,
                        boxHeight: 15,
                        usePointStyle: true
                    },
                    onClick: function (e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const meta = ci.getDatasetMeta(index);

                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                        ci.update();
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 12, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.x || context.parsed.y;
                            return label + ': ' + value.toFixed(2);
                        }
                    }
                },
                datalabels: {
                    display: (context) => {
                        return context.datasetIndex === 0;
                    },
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value.toFixed(2),
                    color: '#2c3e50',
                    font: { size: 11, weight: '700', family: 'Manrope' },
                    offset: 4
                }
            },
            scales: {
                x: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 0.5,
                        font: { size: 12, family: 'Manrope', weight: '500' },
                        color: '#6B7280'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.08)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Importance ratings (Scale 1-5)',
                        font: { size: 14, weight: '600', family: 'Manrope' },
                        color: '#4B5563',
                        padding: { top: 10 }
                    }
                },
                y: {
                    ticks: {
                        font: { size: 11, weight: '500', family: 'Manrope' },
                        color: '#4B5563',
                        autoSkip: false,
                        padding: 8
                    },
                    grid: { display: false }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 160,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });

    // SLIDE 07 - Alignment Matrix Chart
    // NOTE: This chart is initialized in the inline script in slides3_7.html
    // to avoid duplicate initialization and double labeling issues.

});
