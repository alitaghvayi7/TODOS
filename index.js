
const toggleButton = document.querySelector('.toggle-button');
const cancelButton = document.querySelector('.cancel-button');
const saveButton = document.querySelector('.save-button');
const tasksContainer = document.querySelector('.tasks-container');
const searchInput = document.querySelector('.search-input');

let tasks;


const timeLine = gsap.timeline({
    paused: true,
    defaults: {
        ease: "power4.Out",
    }
});

timeLine
    .to('.overlay', { y: 0 })
    .to('.form', { 'clip-path': 'polygon(100% 0, 0 0, 0 100%, 100% 100%)', duration: 1, })
    .from('.todo-input', { opacity: 0, y: -100 })
    .from('.cancel-button', { opacity: 0, x: 100 })
    .from('.save-button', { opacity: 0, x: -100 });


window.addEventListener('load', init)
toggleButton.addEventListener('click', showOverlay);
cancelButton.addEventListener('click', hiddenOverlay);
saveButton.addEventListener('click', addTask);
searchInput.addEventListener('input', searchBetweenTasks);


function addTask() {
    const todoInput = document.querySelector('.todo-input');

    if (!todoInput.value) return;

    tasks.push({ value: todoInput.value, isFinished: false });
    todoInput.value = "";

    hiddenOverlay();
    renderTasks(tasks);
    setTasksToLocalStorage(tasks);
}

function searchBetweenTasks(event) {

    const value = event.currentTarget.value;

    const results = tasks.filter((task) => {
        return task.value.includes(value);
    });

    if (results.length === 0) {
        tasksContainer.textContent = "موردی برای نمایش وجد ندارد";
        return
    }

    renderTasks(results);
}

function renderTasks(array) {
    tasksContainer.textContent = ""
    const elements = array.map((task) => {
        return createTaskItem(task);
    });

    elements.forEach((elem) => {
        tasksContainer.append(elem)
    });
}

function createTaskItem(item) {
    const div = document.createElement('div');
    div.className = item.isFinished === true ? 'task-item completed' : 'task-item';
    div.textContent = item.value;
    div.addEventListener('click', finishTask);
    return div;
}

function finishTask(event) {

    const taskIndex = tasks.findIndex((task) => {
        return task.value === event.currentTarget.textContent;
    });

    if (tasks[taskIndex].isFinished) return;

    console.log('return');

    tasks[taskIndex].isFinished = true;

    renderTasks(tasks);
    setTasksToLocalStorage(tasks);
}

function init() {
    tasks = getTasksFromLocalStorage() || [];
    renderTasks(tasks);
}

function showOverlay(e) {
    e.currentTarget.disabled = true;
    timeLine.play();
    e.currentTarget.disabled = false;
}

function hiddenOverlay() {
    timeLine.reverse();
}

function getTasksFromLocalStorage() {
    let tasks = localStorage.getItem('tasks');
    tasks = JSON.parse(tasks);
    return tasks;
}


function setTasksToLocalStorage(item) {
    const value = JSON.stringify(item);
    localStorage.setItem('tasks', value);
    return true;
}