// Fetch live traction data immediately
function fetchTractionData() {
    console.log('Making API call to traction endpoint');
    fetch('https://api.webobl.com/v1.0/analytics/traction')
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            
            // Handle the actual analytics response structure
            const users = data.users || 758;
            const bobls = data.bobls || 223;
            const posts = data.posts || 34000;
            
            const userCountEl = document.getElementById('userCount');
            const boblCountEl = document.getElementById('boblCount');
            const postCountEl = document.getElementById('postCount');
            
            if (userCountEl) userCountEl.textContent = users.toLocaleString() + '+';
            if (boblCountEl) boblCountEl.textContent = bobls.toLocaleString() + '+';
            
            // Format posts count
            if (postCountEl) {
                if (posts >= 1000) {
                    postCountEl.textContent = Math.floor(posts / 1000) + 'K+';
                } else {
                    postCountEl.textContent = posts.toLocaleString() + '+';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching traction data:', error);
            // Fallback to static values
            const userCountEl = document.getElementById('userCount');
            const boblCountEl = document.getElementById('boblCount');
            const postCountEl = document.getElementById('postCount');
            
            if (userCountEl) userCountEl.textContent = '758+';
            if (boblCountEl) boblCountEl.textContent = '223+';
            if (postCountEl) postCountEl.textContent = '34K+';
        });
}

// Call immediately when script loads
fetchTractionData();

// Modal functions
function openApplicationModal() {
    document.getElementById('applicationModal').style.display = 'block';
}

function closeApplicationModal() {
    document.getElementById('applicationModal').style.display = 'none';
    resetForm();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) {
        closeApplicationModal();
    }
}

// Form handling
document.getElementById('applicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    const form = document.getElementById('applicationForm');
    const successMessage = document.getElementById('successMessage');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoader.classList.remove('hidden');
    
    // Collect form data
    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        portfolio: document.getElementById('portfolio').value,
        experience: document.getElementById('experience').value,
        ask: document.getElementById('ask').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString(),
        source: 'careers_page'
    };
    
    try {
        const response = await fetch('https://api.webobl.com/v1.0/careers/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
            
            // Track application submission
            gtag('event', 'application_submit', {
                'event_category': 'careers',
                'event_label': formData.role
            });
        } else {
            throw new Error('Application submission failed');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('There was an error submitting your application. Please try again or email us directly at careers@webobl.com');
        
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoader.classList.add('hidden');
    }
});

function resetForm() {
    const form = document.getElementById('applicationForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Reset form
    form.reset();
    form.style.display = 'block';
    successMessage.classList.add('hidden');
    
    // Reset button state
    submitBtn.disabled = false;
    submitText.classList.remove('hidden');
    submitLoader.classList.add('hidden');
}

// Smooth scrolling for anchor links
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
document.querySelectorAll('.opportunity-card, .tech-category, .role-card, .transparency-card, .benefit-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Fetch and display growth projections
async function fetchGrowthProjections() {
    try {
        console.log('Making API call for growth projections');
        const response = await fetch('https://api.webobl.com/v1.0/analytics/traction');
        const data = await response.json();
        
        // Handle the actual analytics response structure
        const currentUsers = data.users || 758;
        const currentBobls = data.bobls || 223;
        const currentPosts = data.posts || 34000;
        const currentRevenue = calculateCurrentRevenue(currentUsers, currentBobls, currentPosts);
        
        // Calculate 5-year projections (8x annual growth)
        const year5Users = Math.floor(currentUsers * Math.pow(8, 5));
        const year5Revenue = Math.floor(currentRevenue * Math.pow(8, 5));
        const marketPenetration = ((year5Users / 150000000) * 100).toFixed(1);
        
        // Update projection summary (check if elements exist)
        const year5RevenueEl = document.getElementById('year5Revenue');
        const year5UsersEl = document.getElementById('year5Users');
        const marketPenetrationEl = document.getElementById('marketPenetration');
        const companyValuationEl = document.getElementById('companyValuation');
        const projectedGrowthEl = document.getElementById('projectedGrowth');
        
        if (year5RevenueEl) year5RevenueEl.textContent = formatCurrency(year5Revenue);
        if (year5UsersEl) year5UsersEl.textContent = year5Users.toLocaleString();
        if (marketPenetrationEl) marketPenetrationEl.textContent = marketPenetration + '%';
        
        // Update company valuation using exact pitch methodology
        const fundingRequest = 243600000; // ₦243,600,000
        
        // Calculate current metrics with dynamic data period
        const launchDate = new Date('2025-09-18');
        const currentDate = new Date();
        const dataCollectionDays = Math.ceil((currentDate - launchDate) / (1000 * 60 * 60 * 24));
        const dailyUserGrowth = currentUsers / dataCollectionDays;
        const monthlyRecurringRevenue = calculateMRR(currentUsers, currentBobls, currentPosts);
        
        // Valuation using multiple methods
        const revenueMultiple = 15; // SaaS companies trade at 10-20x ARR
        const userValueMultiple = 83333; // ₦83,333 per user for social platforms
        
        const arrValuation = monthlyRecurringRevenue * 12 * revenueMultiple;
        const userValuation = currentUsers * userValueMultiple;
        const growthAdjustedValuation = (arrValuation + userValuation) / 2 * 1.5; // 50% growth premium
        
        // Conservative valuation (taking lower end)
        const currentValuation = Math.min(growthAdjustedValuation, 1333333333); // Cap at ₦1.33B for seed stage
        
        const equityPercentage = (fundingRequest / (currentValuation + fundingRequest)) * 100;
        
        // 5-year projection for ROI
        const year5RevenueForROI = calculateYear5Revenue(currentUsers, currentBobls, currentPosts);
        const year5Valuation = year5RevenueForROI * 8; // Conservative 8x revenue multiple
        const potentialReturn = ((year5Valuation * (equityPercentage / 100)) / fundingRequest);
        
        const projectedGrowth = `${potentialReturn.toFixed(1)}x`;
        
        if (companyValuationEl) companyValuationEl.textContent = formatCurrency(currentValuation);
        if (projectedGrowthEl) projectedGrowthEl.textContent = projectedGrowth;
        
        // Update methodology text
        const methodologyEl = document.getElementById('methodologyText');
        if (methodologyEl) {
            methodologyEl.innerHTML = `
                <p>Our projections are based on <strong>real user activity data</strong> collected since launch (18/09/25). With current growth rates showing <strong>8x year-over-year expansion</strong>, we project:</p>
                <ul>
                    <li><strong>User Growth:</strong> From ${currentUsers.toLocaleString()} to ${year5Users.toLocaleString()} users by Year 5</li>
                    <li><strong>Revenue Growth:</strong> From ${formatCurrency(currentRevenue)} to ${formatCurrency(year5Revenue)} annually</li>
                    <li><strong>Market Share:</strong> Capturing ${marketPenetration}% of our serviceable market</li>
                </ul>
            `;
        }
        
        // Update opportunity text
        const opportunityEl = document.getElementById('opportunityText');
        if (opportunityEl) {
            opportunityEl.innerHTML = `
                <p>As an early employee, you're joining at a critical growth phase where your contributions will directly impact our trajectory toward a <strong>${formatCurrency(currentValuation)} valuation</strong>.</p>
                <ul>
                    <li><strong>High Impact Role:</strong> Your work will shape a platform used by millions</li>
                    <li><strong>Growth Opportunity:</strong> Be part of a ${projectedGrowth} revenue growth story</li>
                    <li><strong>Market Leadership:</strong> Help us capture a significant share of the 150M+ user market</li>
                    <li><strong>Career Acceleration:</strong> Gain experience scaling from startup to major platform</li>
                </ul>
            `;
        }
        
        // Create projection chart
        const chartEl = document.getElementById('projectionChart');
        if (chartEl) {
            createProjectionChart(currentUsers, currentRevenue);
        }
    } catch (error) {
        console.error('Error fetching growth projections:', error);
        // Fallback values
        document.getElementById('year5Revenue').textContent = '₦2.1B';
        document.getElementById('year5Users').textContent = '2.5M';
        document.getElementById('marketPenetration').textContent = '1.7%';
        document.getElementById('companyValuation').textContent = '₦1.33B';
        document.getElementById('projectedGrowth').textContent = '2800x';
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

function calculateCurrentRevenue(currentUsers, currentBobls, currentPosts) {
    // Dynamic data collection period since launch
    const launchDate = new Date('2025-09-18');
    const currentDate = new Date();
    const dataCollectionDays = Math.ceil((currentDate - launchDate) / (1000 * 60 * 60 * 24));
    
    // Calculate actual activity rates per day
    const boblsPerUserPerDay = currentBobls / currentUsers / dataCollectionDays;
    const postsPerUserPerDay = currentPosts / currentUsers / dataCollectionDays;
    
    // Annualized activity rates
    const boblsPerUserPerYear = boblsPerUserPerDay * 365;
    const postsPerUserPerYear = postsPerUserPerDay * 365;
    
    // Revenue model
    const inAppAdRevenue = 250;
    const pushNotificationRevenue = 583;
    const serviceFeePaidEvents = 2000;
    
    // Monthly calculations
    const adsPerUserPerMonth = Math.round(postsPerUserPerYear / 12 * 0.3);
    const notificationsPerUserPerMonth = Math.round(boblsPerUserPerYear / 12 * 2);
    const paidEventParticipationRate = Math.min(0.4, boblsPerUserPerYear / 12 * 0.2);
    const avgTicketsPerParticipant = 1.5;
    
    const adRevenue = currentUsers * adsPerUserPerMonth * inAppAdRevenue;
    const notificationRevenue = currentUsers * notificationsPerUserPerMonth * pushNotificationRevenue;
    const serviceRevenue = currentUsers * paidEventParticipationRate * avgTicketsPerParticipant * serviceFeePaidEvents;
    
    return (adRevenue + notificationRevenue + serviceRevenue) * 12;
}

function calculateYear5Revenue(users, bobls, posts) {
    const yearlyGrowthRate = 8;
    const year5Users = Math.min(users * Math.pow(yearlyGrowthRate, 5), 7500000);
    return calculateMRR(year5Users, bobls * (year5Users / users), posts * (year5Users / users)) * 12;
}

function formatCurrency(amount) {
    if (amount >= 1000000000) {
        return '₦' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return '₦' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '₦' + (amount / 1000).toFixed(0) + 'K';
    }
    return '₦' + amount.toLocaleString();
}

function createProjectionChart(currentUsers, currentRevenue) {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    
    const years = ['Current', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const userProjections = [currentUsers];
    const revenueProjections = [currentRevenue];
    
    for (let i = 1; i <= 5; i++) {
        userProjections.push(Math.floor(currentUsers * Math.pow(8, i)));
        revenueProjections.push(Math.floor(currentRevenue * Math.pow(8, i)));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Users',
                data: userProjections,
                borderColor: '#87CEEB',
                backgroundColor: 'rgba(135, 206, 235, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Revenue (₦)',
                data: revenueProjections,
                borderColor: '#B0E0E6',
                backgroundColor: 'rgba(176, 224, 230, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Users'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Revenue (₦)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Initialize growth projections
fetchGrowthProjections();

function showFallbackProjections() {
    const year5RevenueEl = document.getElementById('year5Revenue');
    const year5UsersEl = document.getElementById('year5Users');
    const marketPenetrationEl = document.getElementById('marketPenetration');
    const companyValuationEl = document.getElementById('companyValuation');
    const projectedGrowthEl = document.getElementById('projectedGrowth');
    const methodologyEl = document.getElementById('methodologyText');
    const opportunityEl = document.getElementById('opportunityText');
    
    if (year5RevenueEl) year5RevenueEl.textContent = '₦2.1B';
    if (year5UsersEl) year5UsersEl.textContent = '2.5M';
    if (marketPenetrationEl) marketPenetrationEl.textContent = '1.7%';
    if (companyValuationEl) companyValuationEl.textContent = '₦1.33B';
    if (projectedGrowthEl) projectedGrowthEl.textContent = '2800x';
    
    if (methodologyEl) {
        methodologyEl.innerHTML = `
            <p>Our projections are based on <strong>real user activity data</strong> collected since launch (18/09/25). With current growth rates showing <strong>8x year-over-year expansion</strong>, we project:</p>
            <ul>
                <li><strong>User Growth:</strong> From 758 to 2.5M users by Year 5</li>
                <li><strong>Revenue Growth:</strong> From ₦133K to ₦2.1B annually</li>
                <li><strong>Market Share:</strong> Capturing 1.7% of our serviceable market</li>
            </ul>
        `;
    }
    
    if (opportunityEl) {
        opportunityEl.innerHTML = `
            <p>As an early employee, you're joining at a critical growth phase where your contributions will directly impact our trajectory toward a <strong>₦1.33B valuation</strong>.</p>
            <ul>
                <li><strong>High Impact Role:</strong> Your work will shape a platform used by millions</li>
                <li><strong>Growth Opportunity:</strong> Be part of a 2800x revenue growth story</li>
                <li><strong>Market Leadership:</strong> Help us capture a significant share of the 150M+ user market</li>
                <li><strong>Career Acceleration:</strong> Gain experience scaling from startup to major platform</li>
            </ul>
        `;
    }
}

// Show fallback data after timeout if API fails
setTimeout(() => {
    // Fallback for hero stats if still loading
    const userCountEl = document.getElementById('userCount');
    const boblCountEl = document.getElementById('boblCount');
    const postCountEl = document.getElementById('postCount');
    
    if (userCountEl && userCountEl.textContent === 'Loading...') userCountEl.textContent = '758+';
    if (boblCountEl && boblCountEl.textContent === 'Loading...') boblCountEl.textContent = '223+';
    if (postCountEl && postCountEl.textContent === 'Loading...') postCountEl.textContent = '34K+';
    
    // Fallback for projections if still loading
    if (document.getElementById('year5Revenue') && document.getElementById('year5Revenue').textContent === 'Loading...') {
        showFallbackProjections();
    }
}, 1000);