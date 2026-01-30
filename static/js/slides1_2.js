




document.addEventListener('DOMContentLoaded', function () {
    // SLIDE 02 - Program Participation Chart
    const programCtx = document.getElementById('programChart').getContext('2d');
    new Chart(programCtx, {
        type: 'bar',
        data: {
            labels: programParticipationData ? programParticipationData.labels : [],
            datasets: [{
                label: 'Participation Rate',
                data: programParticipationData ? programParticipationData.values : [],
                backgroundColor: 'rgba(112, 195, 233, 0.85)',
                borderColor: 'rgba(112, 195, 233, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 14, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 13, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => 'Participation: ' + context.parsed.x.toFixed(1) + '%'
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value.toFixed(1) + '%',
                    color: '#2c3e50',
                    font: { size: 13, weight: '700', family: 'Manrope' },
                    offset: 6
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: (value) => value + '%',
                        font: { size: 12, family: 'Manrope', weight: '500' },
                        color: '#6B7280'
                    },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    title: {
                        display: true,
                        text: 'Percentage of Respondents',
                        font: { size: 13, weight: '600', family: 'Manrope' },
                        color: '#4B5563'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 12, weight: '500', family: 'Manrope' },
                        color: '#4B5563',
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.substr(0, 20) + '...' : label;
                        }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    // SLIDE 02 - Age Distribution Chart
    const ageCtx = document.getElementById('ageChart').getContext('2d');
    new Chart(ageCtx, {
        type: 'bar',
        data: {
            labels: ageData ? ageData.labels : [],
            datasets: [{
                label: 'Age Distribution',
                data: ageData ? ageData.values : [],
                backgroundColor: 'rgba(195, 214, 0, 0.85)',
                borderColor: 'rgba(195, 214, 0, 1)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        plugins: [ChartDataLabels],
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
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => context.parsed.x.toFixed(1) + '%'
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value.toFixed(1) + '%',
                    color: '#2c3e50',
                    font: { size: 11, weight: '700', family: 'Manrope' },
                    offset: 4
                }
            },
            scales: {
                x: {
                    min: 0,
                    suggestedMax: ageData && ageData.values && ageData.values.length > 0
                        ? Math.max(...ageData.values) + 5
                        : 40,
                    ticks: {
                        callback: (value) => value + '%',
                        font: { size: 11, family: 'Manrope', weight: '500' },
                        color: '#6B7280'
                    },
                    grid: { color: 'rgba(0,0,0,0.08)' }
                },
                y: {
                    ticks: {
                        font: { size: 11, weight: '500', family: 'Manrope' },
                        color: '#4B5563',
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.substr(0, 20) + '...' : label;
                        }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    // SLIDE 02 - Gender Chart
    const genderCtx = document.getElementById('genderChart').getContext('2d');
    new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: genderData ? genderData.labels : [],
            datasets: [{
                data: genderData ? genderData.values : [],
                backgroundColor: [
                    'rgba(252, 196, 15, 0.85)',
                    'rgba(112, 195, 233, 0.85)',
                    'rgba(195, 214, 0, 0.85)'
                ],
                borderColor: [
                    'rgba(252, 196, 15, 1)',
                    'rgba(112, 195, 233, 1)',
                    'rgba(195, 214, 0, 1)'
                ],
                borderWidth: 2
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12, family: 'Manrope', weight: '600' },
                        color: '#2c3e50',
                        padding: 15,
                        boxWidth: 15,
                        boxHeight: 15,
                        filter: function (legendItem, chartData) {
                            // Hide legend label if the corresponding value is 0
                            const datasetIndex = legendItem.datasetIndex || 0;
                            const dataIndex = legendItem.index;
                            const value = chartData.datasets[datasetIndex].data[dataIndex];
                            return value !== 0;
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 12, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => context.label + ': ' + context.parsed.toFixed(1) + '%'
                    }
                },
                datalabels: {
                    formatter: (value) => {
                        if (value === 0) return null;
                        return value.toFixed(1) + '%';
                    },
                    color: '#ffffff',
                    font: { size: 14, weight: '700', family: 'Manrope' }
                }
            }
        }
    });

    // SLIDE 02 - Viewpoint/Focus Chart
    const viewpointCtx = document.getElementById('viewpointChart').getContext('2d');
    new Chart(viewpointCtx, {
        type: 'doughnut',
        data: {
            labels: viewpointData ? viewpointData.labels : [],
            datasets: [{
                data: viewpointData ? viewpointData.values : [],
                backgroundColor: [
                    'rgba(209, 34, 63, 0.85)',
                    'rgba(112, 195, 233, 0.85)',
                    'rgba(195, 214, 0, 0.85)'
                ],
                borderColor: [
                    'rgba(209, 34, 63, 1)',
                    'rgba(112, 195, 233, 1)',
                    'rgba(195, 214, 0, 1)'
                ],
                borderWidth: 2
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 11, family: 'Manrope', weight: '600' },
                        color: '#2c3e50',
                        padding: 12,
                        boxWidth: 15,
                        boxHeight: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13, family: 'Manrope', weight: '700' },
                    bodyFont: { size: 12, family: 'Manrope', weight: '500' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => context.label + ': ' + context.parsed.toFixed(1) + '%'
                    }
                },
                datalabels: {
                    formatter: (value) => value.toFixed(1) + '%',
                    color: '#ffffff',
                    font: { size: 13, weight: '700', family: 'Manrope' }
                }
            }
        }
    });


});
