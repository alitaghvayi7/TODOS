const toggleButton = document.querySelector('.toggle-button');
const cancelButton = document.querySelector('.cancel-button');
const form = document.querySelector('.form');
const tasksContainer = document.querySelector('.tasks-container');
const searchInput = document.querySelector('.search-input');

let tasks;

// form Animation
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



// Element Listeners
window.addEventListener('load', init)
toggleButton.addEventListener('click', showOverlay);
cancelButton.addEventListener('click', hiddenOverlay);
form.addEventListener('submit', addTask);
searchInput.addEventListener('input', searchBetweenTasks);

function init() {
    tasks = getTasksFromLocalStorage() || [];
    renderTasks(tasks);
}

function addTask(event) {
    event.preventDefault();
    const todoInput = document.querySelector('.todo-input');

    if (!todoInput.value) return;

    tasks.push({ value: todoInput.value, isFinished: false });
    todoInput.value = "";

    hiddenOverlay();
    renderTasks(tasks);
    setTasksToLocalStorage(tasks);
}

function editTask(event) {

    event.stopPropagation();

    const { currentTarget } = event;

    const taskElement = event.currentTarget.closest('.task-item');
    const index = taskElement.getAttribute('data-index');

    currentTarget.removeEventListener("click", editTask);
    currentTarget.addEventListener('click', saveChanges.bind(null, index));

    currentTarget.innerHTML = '<i class="fa-solid fa-check"></i>';

    //hidden the span tag that show task value
    currentTarget.parentElement.previousElementSibling.style.display = "none";
    const { value } = tasks[index];
    taskElement.prepend(createInputBox(value));

}

function deleteTask(event) {
    event.stopPropagation();
    const index = event.currentTarget.closest('.task-item').getAttribute('data-index');
    tasks.splice(index, 1);
    renderTasksAndSaveToLocalStorage(tasks)
}

function finishTask(event) {

    const taskIndex = tasks.findIndex((task) => {
        return task.value === event.currentTarget.textContent;
    });

    if (tasks[taskIndex].isFinished) return;

    tasks[taskIndex].isFinished = true;

    renderTasksAndSaveToLocalStorage(tasks)
}

function searchBetweenTasks(event) {

    const value = event.currentTarget.value;

    const results = tasks.filter((task) => {
        return task.value.includes(value);
    });

    if (results.length === 0) {
        tasksContainer.textContent = "موردی برای نمایش وجود ندارد";
        return
    }

    renderTasks(results);
}

function createTaskItem(item, index) {
    const div = document.createElement('div');
    div.className = item.isFinished === true ? 'task-item completed' : 'task-item';
    div.setAttribute('data-index', index);
    div.addEventListener('click', finishTask);

    const textTask = document.createElement('span');
    textTask.classList = 'text-task';
    textTask.textContent = item.value;
    div.appendChild(textTask)


    const taskOptions = document.createElement('div');
    taskOptions.className = "task-options";

    const editButton = document.createElement('button');
    editButton.className = "edit-task";
    editButton.addEventListener('click', editTask);
    editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    taskOptions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = "delete-task";
    deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>'
    deleteButton.addEventListener('click', deleteTask);
    taskOptions.appendChild(deleteButton);

    div.appendChild(taskOptions)

    return div;
}

function renderTasksAndSaveToLocalStorage(tasks) {
    renderTasks(tasks);
    setTasksToLocalStorage(tasks);
}

function renderTasks(array) {
    tasksContainer.textContent = ""
    const elements = array.map((task, index) => {
        return createTaskItem(task, index);
    });

    elements.forEach((elem) => {
        tasksContainer.append(elem)
    });
}

function saveChanges(index, event) {

    const { currentTarget } = event;

    currentTarget.removeEventListener('click', saveChanges);
    currentTarget.addEventListener('click', editTask);
    // currentTarget.textContent = "e";

    //get the input
    const input = event.currentTarget.parentElement.previousElementSibling.previousElementSibling;
    //get the span
    const span = event.currentTarget.parentElement.previousElementSibling;

    const currentObject = tasks[index];
    const newObject = { value: input.value, isFinished: currentObject.isFinished };

    input.remove();
    span.style.display = "block";

    tasks.splice(index, 1, newObject);
    renderTasksAndSaveToLocalStorage(tasks);

}

function createInputBox(value) {
    const input = document.createElement('input');
    input.className = "task-edit-input";
    input.type = "text";
    input.setAttribute('value', value);
    input.style.display = "block";
    return input;
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