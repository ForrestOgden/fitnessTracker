let bodyWeightData = JSON.parse(localStorage.getItem('bodyWeightData')) || [];
let liftData = JSON.parse(localStorage.getItem('liftData')) || {};
let bodyWeightChart;
let charts = {};

// Function to log body weight and exercises
document.getElementById('workout-form').onsubmit = function(event) {
    event.preventDefault();
    
    const date = new Date().toLocaleDateString('en-US');
    const bodyWeight = document.getElementById('body-weight').value; 
    const exercise = document.getElementById('select-exercise').textContent; 

    // Handle body weight logging
    if (bodyWeight && exercise === 'Select Exercise') {
        const parsedBodyWeight = parseFloat(bodyWeight);
        if (!isNaN(parsedBodyWeight)) {
            bodyWeightData.push({ date: date, weight: parsedBodyWeight });
            localStorage.setItem('bodyWeightData', JSON.stringify(bodyWeightData)); // Save to localStorage
            updateBodyWeightChart(); 
            updateProgressList(); 
        }
    } else if (exercise !== 'Select Exercise') {
        // Handle exercise logging
        const sets = document.getElementById('sets').value;
        const reps = document.getElementById('reps').value;
        const weight = document.getElementById('weight').value;

        if (!liftData[exercise]) {
            liftData[exercise] = [];
        }
        liftData[exercise].push({ date: date, sets, reps, weight });
        localStorage.setItem('liftData', JSON.stringify(liftData)); // Save to localStorage
        updateLiftChartsSection(exercise);
        updateProgressList();
    }
   
    showSuccessPopup();
    this.reset();
    document.getElementById('select-exercise').textContent = 'Select Exercise'; 
};


// Load initial data for charts and progress
function loadInitialData() {
    // Load and render body weight data
    bodyWeightData.forEach(entry => {
        const date = entry.date; // Adjust as needed based on how you're saving
        const weight = entry.weight;
        // Push to chart data and render it
    });
    
    // Load and render lift data
    for (const exercise in liftData) {
        liftData[exercise].forEach(entry => {
            // Push to chart data and render it
        });
    }

    updateBodyWeightChart(); 
    updateProgressList(); 
}

// Call loadInitialData on page load
window.onload = loadInitialData;

function updateBodyWeightChart() {
    const ctx = document.getElementById('bodyWeightChart').getContext('2d');
    
    const labels = bodyWeightData.map(data => data.date);
    const weights = bodyWeightData.map(data => data.weight);

    if (bodyWeightChart) {
        bodyWeightChart.destroy();
    }

    bodyWeightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Body Weight (lbs)',
                data: weights,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.5)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

function updateLiftChartsSection(exercise) {
    const liftChartsDiv = document.getElementById('progress');
    
    if (!charts[exercise]) {
        charts[exercise] = {
            chart: null,
            data: []
        };
    }

    const exerciseData = liftData[exercise].map(log => ({
        date: log.date,
        weight: parseFloat(log.weight)
    }));

    charts[exercise].data = exerciseData;

    const chartId = `chart-${exercise}`;
    let chartCanvas = liftChartsDiv.querySelector(`#${chartId}`);
    
    if (!chartCanvas) {
        chartCanvas = document.createElement('canvas');
        chartCanvas.id = chartId;
        chartCanvas.width = 400;
        chartCanvas.height = 200;
        liftChartsDiv.appendChild(chartCanvas);
    }

    const ctx = chartCanvas.getContext('2d');

    if (charts[exercise].chart) {
        charts[exercise].chart.destroy();
    }

    charts[exercise].chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: exerciseData.map(data => data.date),
            datasets: [{
                label: exercise,
                data: exerciseData.map(data => data.weight),
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

function updateProgressList() {
    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '';

    // Render body weight logs
    bodyWeightData.forEach((entry, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex'; // Use flexbox for alignment
        li.style.justifyContent = 'space-between'; // Space between text and button
        li.textContent = `Date: ${entry.date}, Body Weight: ${entry.weight} lbs `;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete'; // Apply delete class
        deleteButton.onclick = () => {
            bodyWeightData.splice(index, 1); // Remove the entry
            localStorage.setItem('bodyWeightData', JSON.stringify(bodyWeightData)); // Update localStorage
            updateBodyWeightChart(); // Update chart
            updateProgressList(); // Refresh the progress list
        };

        li.appendChild(deleteButton);
        workoutList.appendChild(li);
    });

    // Render lift logs
    for (const exercise in liftData) {
        liftData[exercise].forEach((entry, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex'; // Use flexbox for alignment
            li.style.justifyContent = 'space-between'; // Space between text and button
            li.textContent = `Date: ${entry.date}, Exercise: ${exercise}, Sets: ${entry.sets}, Reps: ${entry.reps}, Weight: ${entry.weight} lbs `;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete'; // Apply delete class
            deleteButton.onclick = () => {
                liftData[exercise].splice(index, 1); // Remove the entry
                localStorage.setItem('liftData', JSON.stringify(liftData)); // Update localStorage
                updateLiftChartsSection(exercise); // Update chart
                updateProgressList(); // Refresh the progress list
            };

            li.appendChild(deleteButton);
            workoutList.appendChild(li);
        });
    }
}


function showExerciseModal() {
    const modal = document.getElementById('exercise-modal');
    modal.style.display = 'block';
    const exerciseButtons = document.getElementById('exercise-buttons');

    exerciseButtons.innerHTML = ''; // Clear previous buttons
    const exercises = {
        'Chest': ['Dumbbell Bench Press', 'Barbell Bench Press', 'Incline Dumbbell Bench Press', 'Incline Barbell Bench Press', 'Pec-Deck Flies'],
        'Back': ['Pull-Ups', 'Chin Ups', 'Lat Pull Downs', 'Cable Rows', 'Deadlift'],
        'Arms': ['Tricep Push-Downs', 'Overhead Tricep Extensions', 'Bicep Curls', 'Hammer Curls'],
        'Legs': ['Leg Press', 'Barbell Squat', 'Calf Raises'],
        'Cardio': ['Running', 'Cycling', 'Rowing'],
        'Core': ['Planks', 'Crunches']
    };

    for (const category in exercises) {
        const categoryDiv = document.createElement('div');
        categoryDiv.innerHTML = `<h3>${category}</h3>`;
        
        exercises[category].forEach(exercise => {
            const button = document.createElement('button');
            button.textContent = exercise;
            button.onclick = () => selectExercise(exercise);
            categoryDiv.appendChild(button);
        });

        exerciseButtons.appendChild(categoryDiv);
    }
}

function closeExerciseModal() {
    document.getElementById('exercise-modal').style.display = 'none';
}

function selectExercise(exercise) {
    document.getElementById('select-exercise').textContent = exercise;
    closeExerciseModal();
}

function showSuccessPopup() {
    const popup = document.getElementById('success-popup');
    popup.style.display = 'block';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}

// Initialize default view
showPage('home');
