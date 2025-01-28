// DOM elements for the to-do list
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filters = document.querySelectorAll('.filters button');
const searchInput = document.getElementById('search-input');
const clock = document.getElementById('clock');

// To-do list tasks array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to show the current time in the digital clock and check alarm
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;

    checkAlarm(hours, minutes);
}
setInterval(updateClock, 1000);
updateClock();  // Initial call to display time right away

// Check if the current time matches the alarm time
function checkAlarm(currentHours, currentMinutes) {
    const alarmTime = localStorage.getItem('alarmTime');
    if (alarmTime) {
        const [alarmHours, alarmMinutes] = alarmTime.split(':');
        if (alarmHours === currentHours && alarmMinutes === currentMinutes) {
            alert("Wake up! Your alarm is ringing!");
            localStorage.removeItem('alarmTime');  // Reset alarm after it rings
        }
    }
}

// Add a new task
addTaskBtn.addEventListener('click', addTask);

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        dueDate: new Date(Date.now() + 86400000) // Example due date: 1 day later
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

// Render tasks with filter and search
function renderTasks(filter = 'all', search = '') {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        const matchFilter = filter === 'all' || (filter === 'completed' && task.completed) || (filter === 'pending' && !task.completed);
        const matchSearch = task.text.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;
        li.classList.toggle('completed', task.completed);
        li.setAttribute('draggable', true);

        li.addEventListener('click', () => toggleTaskCompletion(task.id));
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const task = tasks.find(task => task.id === taskId);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filters
filters.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        renderTasks(filter, searchInput.value);
    });
});

// Real-time search
searchInput.addEventListener('input', () => {
    renderTasks('all', searchInput.value);
});

// Drag-and-drop functionality for reordering tasks
let draggedTask;

function handleDragStart(e) {
    draggedTask = this;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    if (draggedTask !== this) {
        const draggedIndex = Array.from(taskList.children).indexOf(draggedTask);
        const targetIndex = Array.from(taskList.children).indexOf(this);

        tasks.splice(targetIndex, 0, tasks.splice(draggedIndex, 1)[0]);
        saveTasks();
        renderTasks();
    }
}

// Function for setting the alarm from the alarm setting page
function setAlarm(alarmTime) {
    localStorage.setItem('alarmTime', alarmTime);
    alert(`Alarm set for ${alarmTime}`);
    window.location.href = 'index.html';  // Redirect back to the main page
}

// Optional: Include code to set alarm when the 'save alarm' button is clicked
if (document.getElementById('save-alarm-btn')) {
    document.getElementById('save-alarm-btn').addEventListener('click', () => {
        const alarmTime = document.getElementById('alarm-time').value;
        if (alarmTime) {
            setAlarm(alarmTime);
        } else {
            alert("Please select a valid time.");
        }
    });
}

// Initial render of tasks
renderTasks();
