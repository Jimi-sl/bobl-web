// Currency conversion functionality (global scope)
const exchangeRates = {
    NGN: 1,
    GBP: 0.0006,
    USD: 0.00067,
    CAD: 0.00092,
    JPY: 0.095
};

const currencySymbols = {
    NGN: '₦',
    GBP: '£',
    USD: '$',
    CAD: 'C$',
    JPY: '¥'
};

function formatCurrency(amount, currency) {
    const symbol = currencySymbols[currency];
    if (currency === 'JPY') {
        return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function convertCurrency(baseAmount, targetCurrency) {
    return baseAmount * exchangeRates[targetCurrency];
}

// Chart configurations and data
document.addEventListener('DOMContentLoaded', function() {
    
    // Set fixed end date for proof of concept
    const endDate = '22/10/25';
    // Remove the currentDate update since we're using a fixed period
    
    // Fetch live traction data
    fetch('https://api.webobl.com/v1.0/analytics/traction')
        .then(response => response.json())
        .then(data => {
            document.getElementById('userCount').textContent = data.users.toLocaleString();
            document.getElementById('boblCount').textContent = data.bobls.toLocaleString();
            document.getElementById('postCount').textContent = data.posts.toLocaleString();
            
            // Update traction chart with live data
            updateTractionChart(data.users, data.bobls, data.posts);
            
            // Generate 5-year projections
            generateProjections(data.users, data.bobls, data.posts);
            
            // Calculate equity valuation
            calculateEquityValuation(data.users, data.bobls, data.posts);
        })
        .catch(error => {
            console.error('Error fetching traction data:', error);
            // Fallback to static data
            document.getElementById('userCount').textContent = '758';
            document.getElementById('boblCount').textContent = '223';
            document.getElementById('postCount').textContent = '34,069';
        });
    
    function updateTractionChart(users, bobls, posts) {
        const tractionCtx = document.getElementById('tractionChart').getContext('2d');
        new Chart(tractionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Users', 'Bobls', 'Posts'],
                datasets: [{
                    data: [users, bobls, posts],
                    backgroundColor: ['#87CEEB', '#B0E0E6', '#E0F6FF'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Comfortaa',
                                size: 14
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // Interactive competitor hover effects
    const competitorItems = document.querySelectorAll('[data-competitor]');
    
    competitorItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const competitor = this.dataset.competitor;
            highlightCompetitor(competitor);
        });
        
        item.addEventListener('mouseleave', function() {
            clearHighlight();
        });
    });
    
    function highlightCompetitor(competitor) {
        const supports = document.querySelectorAll(`.support.${competitor}`);
        supports.forEach(support => {
            support.style.transform = 'scale(1.3)';
            support.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
        });
    }
    
    function clearHighlight() {
        const allSupports = document.querySelectorAll('.support');
        allSupports.forEach(support => {
            support.style.transform = 'scale(1)';
            support.style.boxShadow = 'none';
        });
    }

    // Traction Chart will be created by updateTractionChart function

    // Market Chart
    const marketCtx = document.getElementById('marketChart').getContext('2d');
    new Chart(marketCtx, {
        type: 'bar',
        data: {
            labels: ['TAM', 'SAM', 'SOM'],
            datasets: [{
                label: 'Market Size (Millions)',
                data: [3000, 150, 7.5],
                backgroundColor: ['#87CEEB', '#B0E0E6', '#E0F6FF'],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Comfortaa'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Comfortaa',
                            size: 14
                        }
                    }
                }
            }
        }
    });

    // Runway Chart
    const runwayCtx = document.getElementById('runwayChart').getContext('2d');
    window.runwayChart = new Chart(runwayCtx, {
        type: 'pie',
        data: {
            labels: ['CTO', 'Senior Full Stack Dev', 'Full Stack Dev', 'Marketing', 'Server & Ops', 'Contingencies/Miscellaneous'],
            datasets: [{
                data: [2000000, 1500000, 1500000, 4000000, 1500000, 2033333],
                backgroundColor: [
                    'rgba(255, 255, 255, 0.9)',
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.7)',
                    'rgba(255, 255, 255, 0.6)',
                    'rgba(255, 255, 255, 0.5)',
                    'rgba(255, 255, 255, 0.4)'
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'white',
                        font: {
                            family: 'Comfortaa',
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            const currentCurrency = document.getElementById('currencySelect')?.value || 'NGN';
                            const convertedValue = convertCurrency(value, currentCurrency);
                            return `${label}: ${formatCurrency(convertedValue, currentCurrency)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.feature-card, .problem-card, .solution-card, .stat-card, .market-card, .revenue-card, .contact-card, .review-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Review image modal functionality
    const reviewModal = document.getElementById('reviewModal');
    const reviewModalImage = document.getElementById('reviewModalImage');
    const reviewModalClose = document.querySelector('.review-modal-close');
    
    // Add click listeners to all review images
    document.querySelectorAll('.review-image').forEach(img => {
        img.addEventListener('click', function() {
            reviewModal.style.display = 'block';
            reviewModalImage.src = this.src;
        });
    });
    
    // Close modal functionality
    reviewModalClose.addEventListener('click', function() {
        reviewModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the image
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reviewModal.style.display === 'block') {
            reviewModal.style.display = 'none';
        }
    });
});

// Modal functions
function openUseCaseModal() {
    document.getElementById('useCaseModal').style.display = 'block';
}

function closeUseCaseModal() {
    document.getElementById('useCaseModal').style.display = 'none';
}

function openValuationModal() {
    document.getElementById('valuationModal').style.display = 'block';
}

function closeValuationModal() {
    document.getElementById('valuationModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('useCaseModal');
    if (event.target === modal) {
        closeUseCaseModal();
    }
}

// Global variables for valuation data
let currentValuationData = null;
let currentValuationMode = 'capped';

// Toggle function for capped/uncapped valuation
function toggleValuation(mode) {
    currentValuationMode = mode;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update mode indicator
    document.getElementById('valuationMode').textContent = `(${mode.charAt(0).toUpperCase() + mode.slice(1)})`;
    
    // Recalculate with current data
    if (currentValuationData) {
        calculateEquityValuation(currentValuationData.users, currentValuationData.bobls, currentValuationData.posts);
    }
}

// Equity Valuation Calculator
function calculateEquityValuation(currentUsers, currentBobls, currentPosts) {
    // Store current data for toggle functionality
    currentValuationData = { users: currentUsers, bobls: currentBobls, posts: currentPosts };
    
    const fundingRequest = 243600000; // ₦243,600,000
    
    // Calculate current metrics with fixed data period for proof of concept
    const launchDate = new Date('2025-09-18');
    const endDate = new Date('2025-10-22');
    const dataCollectionDays = Math.ceil((endDate - launchDate) / (1000 * 60 * 60 * 24));
    const dailyUserGrowth = currentUsers / dataCollectionDays;
    const monthlyRecurringRevenue = calculateMRR(currentUsers, currentBobls, currentPosts);
    
    // Valuation using multiple methods
    const revenueMultiple = 15; // SaaS companies trade at 10-20x ARR
    const userValueMultiple = 83333; // ₦83,333 per user for social platforms
    
    const arrValuation = monthlyRecurringRevenue * 12 * revenueMultiple;
    const userValuation = currentUsers * userValueMultiple;
    const growthAdjustedValuation = (arrValuation + userValuation) / 2 * 1.5; // 50% growth premium
    
    // Apply capped or uncapped valuation
    const currentValuation = currentValuationMode === 'capped' 
        ? Math.min(growthAdjustedValuation, 1333333333) // Cap at ₦1.33B for seed stage
        : growthAdjustedValuation; // Uncapped valuation
    
    const equityPercentage = (fundingRequest / (currentValuation + fundingRequest)) * 100;
    
    // 5-year projection for ROI
    const year5Revenue = calculateYear5Revenue(currentUsers, currentBobls, currentPosts);
    const year5Valuation = year5Revenue * 8; // Conservative 8x revenue multiple
    const potentialReturn = ((year5Valuation * (equityPercentage / 100)) / fundingRequest);
    
    // Update UI
    const valuationElement = document.getElementById('companyValuation');
    valuationElement.innerHTML = `<span class="currency-value" data-base-value="${Math.round(currentValuation)}">₦${Math.round(currentValuation).toLocaleString()}</span>`;
    document.getElementById('equityOffered').textContent = `${equityPercentage.toFixed(1)}%`;
    document.getElementById('projectedReturn').textContent = `${potentialReturn.toFixed(1)}x`;
    
    // Valuation methodology with mode-specific text
    const capText = currentValuationMode === 'capped' 
        ? '<p><strong>Conservative Cap:</strong> Valuation capped at ₦1.33B for seed-stage appropriateness</p>'
        : '<p><strong>Uncapped Valuation:</strong> Full growth-adjusted valuation without conservative limits</p>';
    
    const methodology = `
        <p><strong>Revenue-Based Valuation:</strong> <span class="currency-value" data-base-value="${Math.round(arrValuation)}">₦${Math.round(arrValuation).toLocaleString()}</span> (${revenueMultiple}x ARR of <span class="currency-value" data-base-value="${Math.round(monthlyRecurringRevenue * 12)}">₦${Math.round(monthlyRecurringRevenue * 12).toLocaleString()}</span>)</p>
        <p><strong>User-Based Valuation:</strong> <span class="currency-value" data-base-value="${Math.round(userValuation)}">₦${Math.round(userValuation).toLocaleString()}</span> (<span class="currency-value" data-base-value="${userValueMultiple}">₦${userValueMultiple.toLocaleString()}</span>/user × ${currentUsers.toLocaleString()} users)</p>
        <p><strong>Growth Premium:</strong> Applied 50% premium for ${((dailyUserGrowth * 365 / currentUsers) * 100).toFixed(0)}% projected annual user growth</p>
        ${capText}
        <p><strong>Investment Terms:</strong> <span class="currency-value" data-base-value="${fundingRequest}">₦${fundingRequest.toLocaleString()}</span> for ${equityPercentage.toFixed(1)}% equity with ${potentialReturn.toFixed(1)}x potential return based on Year 5 projections</p>
    `;
    
    document.getElementById('valuationText').innerHTML = methodology;
    
    // Update currency values if not in NGN
    const currentCurrency = document.getElementById('currencySelected')?.querySelector('span:nth-child(2)')?.textContent || 'NGN';
    if (currentCurrency !== 'NGN') {
        updateAllCurrencyValues(currentCurrency);
    }
}

function calculateMRR(users, bobls, posts) {
    const adsPerUserPerMonth = Math.round((posts / users / 14) * 30 * 0.3);
    const notificationsPerUserPerMonth = Math.round((bobls / users / 14) * 30 * 2);
    const paidEventParticipationRate = Math.min(0.4, (bobls / users / 14) * 30 * 0.2);
    
    const adRevenue = users * adsPerUserPerMonth * 250;
    const notificationRevenue = users * notificationsPerUserPerMonth * 583;
    const serviceRevenue = users * paidEventParticipationRate * 1.5 * 2000;
    
    return adRevenue + notificationRevenue + serviceRevenue;
}

function calculateYear5Revenue(users, bobls, posts) {
    const yearlyGrowthRate = 8;
    const year5Users = Math.min(users * Math.pow(yearlyGrowthRate, 5), 7500000);
    return calculateMRR(year5Users, bobls * (year5Users / users), posts * (year5Users / users)) * 12;
}

// 5-Year Projection Generator
function generateProjections(currentUsers, currentBobls, currentPosts) {
    // Fixed data collection period for proof of concept
    const launchDate = new Date('2025-09-18');
    const endDate = new Date('2025-10-22');
    const dataCollectionDays = Math.ceil((endDate - launchDate) / (1000 * 60 * 60 * 24));
    
    // Calculate actual activity rates per day
    const boblsPerUserPerDay = currentBobls / currentUsers / dataCollectionDays;
    const postsPerUserPerDay = currentPosts / currentUsers / dataCollectionDays;
    
    // Annualized activity rates (accounting for high engagement)
    const boblsPerUserPerYear = boblsPerUserPerDay * 365;
    const postsPerUserPerYear = postsPerUserPerDay * 365;
    
    // Growth assumptions based on viral coefficient and network effects
    const yearlyGrowthRate = 8; // 800% year-over-year growth (viral social platforms)
    
    // Revenue model (static) - converted to NGN base
    const inAppAdRevenue = 250; // ₦250 per ad
    const pushNotificationRevenue = 583; // ₦583 per notification
    const serviceFeePaidEvents = 2000; // ₦2000 per ticket
    
    // Enhanced assumptions based on high activity rates
    const adsPerUserPerMonth = Math.round(postsPerUserPerYear / 12 * 0.3); // 30% of posts generate ad views
    const notificationsPerUserPerMonth = Math.round(boblsPerUserPerYear / 12 * 2); // 2 notifications per bobl
    const paidEventParticipationRate = Math.min(0.4, boblsPerUserPerYear / 12 * 0.2); // 20% of bobls are paid, capped at 40%
    const avgTicketsPerParticipant = 1.5; // Higher engagement = more tickets
    
    const projections = [];
    const som = 7500000; // Serviceable Obtainable Market
    
    for (let year = 1; year <= 5; year++) {
        const projectedUsers = Math.min(currentUsers * Math.pow(yearlyGrowthRate, year), som);
        const projectedBobls = projectedUsers * boblsPerUserPerYear;
        const projectedPosts = projectedUsers * postsPerUserPerYear;
        
        // Revenue calculations (annual)
        const adRevenue = projectedUsers * adsPerUserPerMonth * 12 * inAppAdRevenue;
        const notificationRevenue = projectedUsers * notificationsPerUserPerMonth * 12 * pushNotificationRevenue;
        const serviceRevenue = projectedUsers * paidEventParticipationRate * avgTicketsPerParticipant * 12 * serviceFeePaidEvents;
        
        const totalRevenue = adRevenue + notificationRevenue + serviceRevenue;
        
        projections.push({
            year: year,
            users: Math.round(projectedUsers),
            bobls: Math.round(projectedBobls),
            posts: Math.round(projectedPosts),
            revenue: Math.round(totalRevenue)
        });
    }
    
    // Update methodology text
    const methodology = `
        <p><strong>Proof of Concept Period:</strong> Based on ${dataCollectionDays} days (18/09/25 to 22/10/25) showing ${currentUsers.toLocaleString()} users generating ${currentBobls.toLocaleString()} bobls and ${currentPosts.toLocaleString()} posts.</p>
        <p><strong>Activity Analysis:</strong></p>
        <ul>
            <li>Bobls per user per day: ${boblsPerUserPerDay.toFixed(3)} (${boblsPerUserPerYear.toFixed(1)}/year)</li>
            <li>Posts per user per day: ${postsPerUserPerDay.toFixed(1)} (${postsPerUserPerYear.toFixed(0)}/year)</li>
            <li>Growth rate: ${yearlyGrowthRate}x annually (viral social platform trajectory)</li>
        </ul>
        <p><strong>Revenue Model:</strong></p>
        <ul>
            <li>In-app ads: ${adsPerUserPerMonth} ads/user/month at <span class="currency-value" data-base-value="${inAppAdRevenue}">₦${inAppAdRevenue.toLocaleString()}</span> each</li>
            <li>Push notifications: ${notificationsPerUserPerMonth} notifications/user/month at <span class="currency-value" data-base-value="${pushNotificationRevenue}">₦${pushNotificationRevenue.toLocaleString()}</span> each</li>
            <li>Service fees: ${(paidEventParticipationRate * 100).toFixed(1)}% participation rate, ${avgTicketsPerParticipant} tickets/participant/month at <span class="currency-value" data-base-value="${serviceFeePaidEvents}">₦${serviceFeePaidEvents.toLocaleString()}</span> each</li>
        </ul>
    `;
    
    document.getElementById('methodologyText').innerHTML = methodology;
    
    // Update summary cards
    const year5 = projections[4];
    const year5RevenueElement = document.getElementById('year5Revenue');
    year5RevenueElement.innerHTML = `<span class="currency-value" data-base-value="${year5.revenue}">₦${year5.revenue.toLocaleString()}</span>`;
    document.getElementById('year5Users').textContent = year5.users.toLocaleString();
    document.getElementById('marketPenetration').textContent = `${((year5.users / som) * 100).toFixed(1)}%`;
    
    // Create projection chart
    const projectionCtx = document.getElementById('projectionChart').getContext('2d');
    window.projectionChart = new Chart(projectionCtx, {
        type: 'line',
        data: {
            labels: projections.map(p => `Year ${p.year}`),
            datasets: [{
                label: 'Revenue (£)',
                data: projections.map(p => p.revenue),
                borderColor: '#87CEEB',
                backgroundColor: 'rgba(135, 206, 235, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            }, {
                label: 'Users',
                data: projections.map(p => p.users),
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Comfortaa'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const currentCurrency = document.getElementById('currencySelect')?.value || 'NGN';
                            
                            if (label.includes('Revenue')) {
                                const convertedValue = convertCurrency(value, currentCurrency);
                                return `${label}: ${formatCurrency(convertedValue, currentCurrency)}`;
                            } else {
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (₦)',
                        font: {
                            family: 'Comfortaa'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'Comfortaa'
                        },
                        callback: function(value) {
                            return '₦' + value.toLocaleString();
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Users',
                        font: {
                            family: 'Comfortaa'
                        }
                    },
                    ticks: {
                        font: {
                            family: 'Comfortaa'
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Comfortaa'
                        }
                    }
                }
            }
        }
    });
    
    // Currency update functions
    
    function updateAllCurrencyValues(selectedCurrency) {
        document.querySelectorAll('.currency-value').forEach(element => {
            const baseValue = parseFloat(element.dataset.baseValue);
            const convertedValue = convertCurrency(baseValue, selectedCurrency);
            element.textContent = formatCurrency(convertedValue, selectedCurrency);
        });
        
        // Update chart axis labels
        updateChartCurrency(selectedCurrency);
    }
    
    // Make updateAllCurrencyValues globally accessible for toggle functionality
    window.updateAllCurrencyValues = updateAllCurrencyValues;
    
    // Custom dropdown functionality
    const currencySelected = document.getElementById('currencySelected');
    const currencyOptions = document.getElementById('currencyOptions');
    const currencyDropdown = document.querySelector('.currency-dropdown');
    
    if (currencySelected && currencyOptions && currencyDropdown) {
        currencySelected.addEventListener('click', function() {
            currencyDropdown.classList.toggle('open');
            currencyOptions.classList.toggle('show');
        });
        
        document.querySelectorAll('.currency-option').forEach(option => {
            option.addEventListener('click', function() {
                const value = this.dataset.value;
                const flagClass = this.querySelector('.fi').className;
                const text = this.querySelector('span:last-child').textContent;
                
                currencySelected.querySelector('.fi').className = flagClass;
                currencySelected.querySelector('span:nth-child(2)').textContent = text;
                
                currencyDropdown.classList.remove('open');
                currencyOptions.classList.remove('show');
                
                updateAllCurrencyValues(value);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!currencyDropdown.contains(e.target)) {
                currencyDropdown.classList.remove('open');
                currencyOptions.classList.remove('show');
            }
        });
    }
    
    function updateChartCurrency(currency) {
        const symbol = currencySymbols[currency];
        // Update projection chart y-axis label
        if (window.projectionChart) {
            window.projectionChart.options.scales.y.title.text = `Revenue (${symbol})`;
            window.projectionChart.options.scales.y.ticks.callback = function(value) {
                const convertedValue = convertCurrency(value, currency);
                return formatCurrency(convertedValue, currency);
            };
            window.projectionChart.update();
        }
        
        // Update runway chart tooltips
        if (window.runwayChart) {
            window.runwayChart.update();
        }
    }
    

}