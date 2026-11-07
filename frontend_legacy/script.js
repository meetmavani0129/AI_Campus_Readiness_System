// Base URL for the Flask Backend API
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Login successful! Redirecting to dashboard...');
            // Optional: Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.innerText = data.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.innerText = 'Network error. Please try again later.';
        errorDiv.style.display = 'block';
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const university = document.getElementById('university').value;
    const degree = document.getElementById('degree').value;
    const year_of_study = document.getElementById('year_of_study').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, university, degree, year_of_study, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            errorDiv.innerText = data.message || 'Registration failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.innerText = 'Network error. Please try again later.';
        errorDiv.style.display = 'block';
    }
}

// ==========================================
// Chart.js Globals
// ==========================================
let radarChartInstance = null;
let doughnutChartInstance = null;

// ==========================================
// Dashboard Logic
// ==========================================

function initCharts() {
    // Colors
    const primaryColor = 'rgba(59, 130, 246, 0.2)';
    const primaryBorder = 'rgba(59, 130, 246, 1)';
    const domainColors = [
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(139, 92, 246, 0.8)', // Purple
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(239, 68, 68, 0.8)'   // Red (Cybersecurity)
    ];

    // Radar Chart INIT (Empty)
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        radarChartInstance = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Programming', 'Algorithms', 'Web/App Dev', 'Machine Learning', 'Communication', 'Academics'],
                datasets: [{
                    label: 'Skill Proficiency',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: primaryColor,
                    borderColor: primaryBorder,
                    pointBackgroundColor: primaryBorder,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: primaryBorder
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.05)' },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        pointLabels: { font: { family: "'Inter', sans-serif" }, color: '#475569' },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Doughnut Chart INIT (Empty)
    const ctxDoughnut = document.getElementById('doughnutChart');
    if (ctxDoughnut) {
        doughnutChartInstance = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Software Engineering', 'Data Science', 'Full Stack', 'DevOps', 'Cybersecurity'],
                datasets: [{
                    data: [20, 20, 20, 20, 20], // Default equal split
                    backgroundColor: domainColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { font: { family: "'Inter', sans-serif" }, color: '#475569', padding: 20, usePointStyle: true, pointStyle: 'circle' } }
                }
            }
        });
    }
}

async function handlePredictionSubmit(event) {
    if (event) event.preventDefault();

    const btn = document.getElementById('calc-btn');
    const errorElem = document.getElementById('calc-error'); // Renamed from 'err' for consistency with instruction
    errorElem.style.display = 'none';
    if(btn) btn.innerText = 'Calculating...';

    // Gather form data
    try {
        const payload = {
            cgpa: document.getElementById('m_cgpa').value,
            programming: document.getElementById('m_programming').value,
            technical: document.getElementById('m_technical').value,
            projects: document.getElementById('m_projects').value,
            internships: document.getElementById('m_internships').value,
            certs: document.getElementById('m_certs').value,
            communication: document.getElementById('m_comm').value,
            skills: document.getElementById('m_skills').value
        };

        const response = await fetch('http://localhost:5000/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardVisuals(data);
        } else {
            const err = await response.json();
            errorElem.innerText = err.message || 'Error calculating prediction.';
            errorElem.style.display = 'block';
        }
    } catch (err) {
        errorElem.innerText = 'Unable to connect to the server.';
        errorElem.style.display = 'block';
        console.error(err);
    } finally {
        if(btn) btn.innerText = 'Calculate Readiness Analytics';
    }
}

function updateDashboardVisuals(data) {
    // 1. Update Core Stats
    // Removed specific score animation logic for simplicity to fix undefined reference error, direct text assignment instead.
    document.getElementById('stat-score').innerText = data.readiness_score + '/100';
    document.getElementById('stat-prob').innerText = data.placement_probability + '%';
    document.getElementById('stat-domain').innerText = data.recommended_domain;
    
    // Add category display if element existed, or append to score
    document.getElementById('stat-score').innerText += ` (${data.readiness_category})`;
    
    // 2. Skill Gap Report
    if (data.skill_gap) {
        document.getElementById('skill-gap-placeholder').style.display = 'none';
        document.getElementById('skill-gap-content').style.display = 'block';
        
        const missingContainer = document.getElementById('missing-skills-container');
        missingContainer.innerHTML = '';
        
        if (data.skill_gap.missing_skills && data.skill_gap.missing_skills.length > 0) {
            data.skill_gap.missing_skills.forEach(skill => {
                const chip = document.createElement('span');
                chip.innerText = skill;
                chip.style.cssText = 'background-color: #fee2e2; color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; border: 1px solid #fecaca;';
                missingContainer.appendChild(chip);
            });
        } else {
            missingContainer.innerHTML = '<span style="color: #10b981; font-weight: 500;">None! You meet all baseline requirements.</span>';
        }
        
        document.getElementById('skill-gap-suggestion').innerText = data.skill_gap.suggestions;
    }
    
    // 3. Recommended Training Programs
    const coursesCont = document.getElementById('courses-container');
    const coursesPlace = document.getElementById('courses-placeholder');
    if (data.recommended_courses && data.recommended_courses.length > 0) {
        coursesPlace.style.display = 'none';
        coursesCont.style.display = 'grid';
        coursesCont.innerHTML = '';
        
        data.recommended_courses.forEach(course => {
            const card = document.createElement('div');
            card.style.cssText = 'border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
            
            // Difficulty color coding
            let diffColor = '#64748b'; // default intermediate
            if(course.difficulty.toLowerCase().includes('beginner')) diffColor = '#10b981';
            if(course.difficulty.toLowerCase().includes('advanced')) diffColor = '#ef4444';
            
            card.innerHTML = `
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #3b82f6; font-weight: 700; margin-bottom: 0.5rem;">Target: ${course.target_skill}</div>
                    <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.75rem 0; line-height: 1.4;">${course.name}</h3>
                </div>
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.875rem; color: #475569; font-weight: 500;">📺 ${course.platform}</span>
                        <span style="font-size: 0.875rem; color: #64748b;">⏳ ${course.duration}</span>
                    </div>
                    <div style="display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${diffColor}20; color: ${diffColor};">
                        ${course.difficulty}
                    </div>
                </div>
            `;
            coursesCont.appendChild(card);
        });
    } else if (data.skill_gap && (!data.skill_gap.missing_skills || data.skill_gap.missing_skills.length === 0)) {
        coursesPlace.style.display = 'block';
        coursesPlace.innerHTML = '<span style="color: #10b981; font-weight: 500;">You are all set! No foundational courses required at this time.</span>';
        coursesCont.style.display = 'none';
    } else {
        coursesPlace.style.display = 'block';
        coursesPlace.innerText = 'Enter your metrics to receive personalized course recommendations.';
        coursesCont.style.display = 'none';
    }

    // 4. Update Progress Bars (Original "2. Update Progress Bars" from the prompt)
    const pb1 = data.chart_data.aptitude;
    const pb2 = data.chart_data.technical;
    const pb3 = data.chart_data.soft_skills;

    document.getElementById('prog-val-1').innerText = `${pb1}%`;
    document.getElementById('prog-fill-1').style.width = `${pb1}%`;

    document.getElementById('prog-val-2').innerText = `${pb2}%`;
    document.getElementById('prog-fill-2').style.width = `${pb2}%`;

    document.getElementById('prog-val-3').innerText = `${pb3}%`;
    document.getElementById('prog-fill-3').style.width = `${pb3}%`;

    // 3. Update Radar Chart
    if (radarChartInstance) {
        radarChartInstance.data.datasets[0].data = data.chart_data.radar;
        radarChartInstance.update();
    }

    // 4. Update Doughnut Chart
    if (doughnutChartInstance) {
        doughnutChartInstance.data.datasets[0].data = data.chart_data.domain_dist;
        doughnutChartInstance.update();
    }
}

// Initialize on dashboard load
window.onload = function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const greetingLabel = document.getElementById('user-greeting');
            if (greetingLabel) greetingLabel.innerText = user.name;
        } catch(e) {}
    }

    if (window.location.pathname.includes('dashboard.html')) {
        initCharts();
    }
};
