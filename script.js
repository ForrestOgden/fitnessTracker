// Check if service workers are supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}


let bodyWeightData = JSON.parse(localStorage.getItem('bodyWeightData')) || [];

let liftData = JSON.parse(localStorage.getItem('liftData')) || {}; // Load existing liftData or create an empty object

let bodyWeightChart;
let charts = {};

const cyberpunkColors = [
    '#00ffff', // cyan
    '#ff00ff', // magenta
    '#00ff00', // neon green
    '#ff4c4c', // neon red
    '#ffcc00', // yellow
    '#9932cc', // purple
    '#00ced1', // dark cyan
    '#ff4500', // orange-red
    '#4682b4', // steel blue
    '#ff1493', // deep pink
    '#32cd32', // lime green
];

function saveChartConfig(exercise, color) {
    // Get the existing chart configurations from localStorage or create a new object
    const storedConfig = JSON.parse(localStorage.getItem('chartConfig')) || {};

    // Store the color for the specific exercise
    storedConfig[exercise] = color;

    // Save the updated configuration back to localStorage
    localStorage.setItem('chartConfig', JSON.stringify(storedConfig));
}

function getRandomCyberpunkColor(exercise) {
    // Ensure exercise has a color assigned
    if (!liftData[exercise]) {
        liftData[exercise] = {}; // Initialize if it doesn't exist
    }

    if (!liftData[exercise].color) {
        const randomColor = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
        liftData[exercise].color = randomColor; // Assign a random color
        localStorage.setItem('liftData', JSON.stringify(liftData)); // Save the updated liftData
    }

    return liftData[exercise].color; // Return the assigned color
}




function loadChartConfig(exercise) {
    const storedConfig = JSON.parse(localStorage.getItem('chartConfig'));
    if (storedConfig && storedConfig[exercise]) {
        return storedConfig[exercise];
    }
    return null; // Return null if no color is stored for this exercise
}



document.addEventListener('DOMContentLoaded', () => {
    updateAllLiftCharts(); // Call the function when DOM is fully loaded
});

function updateLiftChartsSection(exercise) {
    // Try to get the data for this exercise
    const data = getExerciseData(exercise);

    if (!data || data.labels.length === 0 || data.values.length === 0) {
        console.log(`No data for ${exercise}. Will retry shortly.`);
        setTimeout(() => updateLiftChartsSection(exercise), 100); // Retry in 100ms if data is not ready
        return;
    }

    // Check if the chart for the exercise already exists
    if (charts[exercise]) {
        charts[exercise].data.labels = data.labels;
        charts[exercise].data.datasets[0].data = data.values;
        charts[exercise].update();
    } else {
        // Create a new canvas if the chart doesn't exist
        const canvas = document.createElement('canvas');
        canvas.id = `${exercise}-chart`;
        canvas.width = 400;
        canvas.height = 200;

        const exerciseChartsDiv = document.getElementById('exercise-charts');
        exerciseChartsDiv.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const color = getRandomCyberpunkColor(exercise);

        charts[exercise] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: exercise,
                    data: data.values,
                    borderColor: color,
                    backgroundColor: `${color}20`, // Lighter color with transparency
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateAllLiftCharts() {
    Object.keys(liftData).forEach(exercise => {
        updateLiftChartsSection(exercise);
    });
}











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


function getCategoryColor(category) {
    const colors = {
        'Chest': '#FF4C4C',      // Red
        'Shoulders': '#FF8C00',  // Orange
        'Back': '#1E90FF',       // Dodger Blue
        'Arms': '#9370DB',       // Medium Purple
        'Legs': '#32CD32',       // Lime Green
        'Cardio': '#FFD700',     // Gold
        'Core': '#FF69B4'        // Hot Pink
    };
    return colors[category] || '#FFFFFF'; // Default to white if category is not found
}

function loadInitialData() {
    // Load body weight data
    bodyWeightData = JSON.parse(localStorage.getItem('bodyWeightData')) || [];

    // Load lift data
    liftData = JSON.parse(localStorage.getItem('liftData')) || {};

    // Filter out any deleted or irrelevant entries
    for (const exercise in liftData) {
        liftData[exercise] = liftData[exercise].filter(entry => {
            // Add logic here to determine if the entry should be kept
            // Assuming you want to keep all existing entries unless specified otherwise
            return entry && entry.date && entry.weight; // Ensure entry has the necessary fields
        });
    }

    // Clear any empty arrays to avoid unnecessary charts
    for (const exercise in liftData) {
        if (liftData[exercise].length === 0) {
            delete liftData[exercise]; // Remove the exercise if no logs are left
        }
    }

    // Save the cleaned liftData back to localStorage
    localStorage.setItem('liftData', JSON.stringify(liftData));

    // Load and render body weight data into the chart
    updateBodyWeightChart(); 

    // Load and render lift data for each exercise
    for (const exercise in liftData) {
        updateLiftChartsSection(exercise);
    }

    // Update the progress list to display current entries
    updateProgressList(); 
}

// Call loadInitialData on page load
window.onload = loadInitialData;


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



function deleteLog(exercise, logId) {
    // Code to delete the log from your database or data structure
    // Assuming logId is the index or unique identifier for the log to delete

    // Update the exercise data
    liftData[exercise].splice(logId, 1); // Remove the entry
    localStorage.setItem('liftData', JSON.stringify(liftData)); // Update localStorage

    // Refresh the chart with updated data
    updateLiftChartsSection(exercise); // Call to refresh the chart after deletion
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
            li.textContent = `Date: ${entry.date},  Exercise: ${exercise}, Sets: ${entry.sets}, Reps: ${entry.reps}, Weight: ${entry.weight} lbs `;
            
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
        'Shoulders': ['Dumbbell Lateral Raises', 'Cable Lateral Raises', 'Dumbbell Shoulder Press', 'Rear Delt Flies (Machine)', 'Rear Delt Flies (Dumbbell)'],
        'Back': ['Pull-Ups', 'Chin Ups', 'Lat Pull Downs', 'Cable Rows', 'Deadlift'],
        'Arms': ['Tricep Push-Downs', 'Overhead Tricep Extensions', 'Bicep Curls', 'Hammer Curls'],
        'Legs': ['Leg Press', 'Barbell Squat', 'Calf Raises'],
        'Cardio': ['Running', 'Cycling', 'Rowing'],
        'Core': ['Planks', 'Crunches']
    };

    for (const category in exercises) {
        const categoryDiv = document.createElement('div');
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title'; // Apply the class for styling
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        exercises[category].forEach(exercise => {
            const button = document.createElement('button');
            button.textContent = exercise;
            button.style.backgroundColor = getCategoryColor(category); // Set the button color
            button.onclick = () => selectExercise(exercise, category); // Pass category to selectExercise
            categoryDiv.appendChild(button);
        });

        exerciseButtons.appendChild(categoryDiv);
    }
}


const exercises = {
    'Chest': ['Dumbbell Bench Press', 'Barbell Bench Press', 'Incline Dumbbell Bench Press', 'Incline Barbell Bench Press', 'Pec-Deck Flies'],
    'Shoulders': ['Dumbbell Lateral Raises', 'Cable Lateral Raises', 'Dumbbell Shoulder Press', 'Rear Delt Flies (Machine)', 'Rear Delt Flies (Dumbbell)'],
    'Back': ['Pull-Ups', 'Chin Ups', 'Lat Pull Downs', 'Cable Rows', 'Deadlift'],
    'Arms': ['Tricep Push-Downs', 'Overhead Tricep Extensions', 'Bicep Curls', 'Hammer Curls'],
    'Legs': ['Leg Press', 'Barbell Squat', 'Calf Raises'],
    'Cardio': ['Running', 'Cycling', 'Rowing'],
    'Core': ['Planks', 'Crunches']
};

function getExerciseData(exercise) {
    const exerciseLogs = liftData[exercise] || [];
    const labels = exerciseLogs.map(log => log.date);
    const values = exerciseLogs.map(log => log.weight); // Assuming you want to plot weight

    return { labels, values };
}



function closeExerciseModal() {
    document.getElementById('exercise-modal').style.display = 'none';
}

function selectExercise(exercise, category) {
    const selectExerciseButton = document.getElementById('select-exercise');
    selectExerciseButton.textContent = exercise;
    selectExerciseButton.style.backgroundColor = getCategoryColor(category); // Set the background color
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


function createOrUpdateChart(exercise) {
    const canvasId = `chart-${exercise}`; // Assuming you have a canvas for each exercise
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // If chart exists, update the data; if not, create a new one
    if (charts[exercise]) {
        // Update existing chart data
        charts[exercise].data.datasets[0].data = getExerciseData(exercise); // Get updated data
        charts[exercise].update(); // Update the chart
    } else {
        // Create a new chart
        const chartData = getExerciseData(exercise); // Function to get initial data for the exercise
        charts[exercise] = new Chart(ctx, {
            type: 'line', // or 'bar' based on your preference
            data: {
                labels: chartData.labels, // Assuming you have labels for the x-axis
                datasets: [{
                    label: exercise,
                    data: chartData.data, // Initial data for the chart
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


function addLog(exercise, logData) {
    // Code to add the log data to your database or data structure
    
    createOrUpdateChart(exercise); // Call to update or create the chart after adding log
}

function refreshPage() {
    location.reload(); // This reloads the current page
}

// Initialize default view
showPage('home');