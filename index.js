const toggleButton = document.querySelector('.toggle-button');
const cancelButton = document.querySelector('.cancel-button');
const form = document.querySelector('.form');
const tasksContainer = document.querySelector('.tasks-container');
const searchInput = document.querySelector('.search-input');
const searchContainer = document.querySelector('.search-container');
const magnifying = document.querySelector('.fa-magnifying-glass');
const micButton = document.querySelector('.mic-button');
const micIcon = document.querySelector('.mic-button > i');
const todoInput = document.querySelector('.todo-input');

let tasks;

//speech api
const synth = window.speechSynthesis;
const utterThis = new SpeechSynthesisUtterance();

const SpeechRecognition = webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'fa-IR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// form Animation
const timeLine = gsap.timeline({
    paused: true,
    defaults: {
        ease: "power4.Out",
        duration: .4
    }
});

timeLine
    .to('.overlay', { y: 0 })
    .to('.form', { 'clip-path': 'polygon(100% 0, 0 0, 0 100%, 100% 100%)' })
    .from('.todo-input', { opacity: 0, y: -100 })
    .from('.cancel-button', { opacity: 0, x: 100 })
    .from('.save-button', { opacity: 0, x: -100 });



// Element Listeners
window.addEventListener('load', init)
toggleButton.addEventListener('click', showOverlay);
cancelButton.addEventListener('click', hiddenOverlay);
form.addEventListener('submit', addTask);
searchInput.addEventListener('input', searchBetweenTasks);
micButton.addEventListener('click', recordAudio);

recognition.addEventListener('result', (event) => {
    const value = event.results[0][0].transcript;
    todoInput.value = value;
    endRecord();
});

recognition.addEventListener('nomatch',endRecord);
recognition.addEventListener('error',endRecord)

searchInput.addEventListener('focus', (e) => {
    e.currentTarget.parentElement.style.width = "90%";
});

searchInput.addEventListener('blur', (e) => {
    if (window.innerWidth <= 1020) {
        e.currentTarget.parentElement.style.width = "55%";
        return;
    }
    e.currentTarget.parentElement.style.width = "15%";
})

function init() {
    tasks = getTasksFromLocalStorage() || [];
    renderTasks(tasks);
}

function endRecord(){
    micButton.classList.remove('active');
    micIcon.classList = 'fa-solid fa-microphone';
    micButton.disabled = false
}

function recordAudio(event) {
    event.currentTarget.disabled = true;
    todoInput.value = "";
    micIcon.className = "fa-solid fa-microphone-lines";
    event.currentTarget.classList.add('active');
    recognition.start();
}

function addTask(event) {
    event.preventDefault();

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

    const taskIndex = tasks.findIndex((task, index) => {
        return index == event.currentTarget.getAttribute('data-index');
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
    div.className = 'task-item';
    div.style.opacity = item.isFinished ? .5 : 1;
    div.style.background = item.isFinished && '#6fa5dd';
    div.setAttribute('data-index', index);

    const checkbutton = document.createElement('input')
    checkbutton.setAttribute('type', 'checkbox')
    div.appendChild(checkbutton)

    checkbutton.addEventListener('click', finishTask)

    const textTask = document.createElement('span');
    textTask.classList = 'text-task';
    textTask.textContent = item.value;
    textTask.style.textDecoration = item.isFinished && 'line-through';
    div.addEventListener('click', finishTask);
    div.appendChild(textTask)

    const taskOptions = document.createElement('div');
    taskOptions.className = "task-options";

    const editButton = document.createElement('button');
    editButton.className = "edit-task";
    editButton.style.display = item.isFinished && 'none';
    editButton.addEventListener('click', editTask);
    editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    taskOptions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = "delete-task";
    deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>'
    deleteButton.addEventListener('click', deleteTask);
    taskOptions.appendChild(deleteButton);

    const speechButton = document.createElement('button');
    speechButton.className = "speech-task";
    speechButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
    speechButton.addEventListener('click', playTaskTitle);
    taskOptions.appendChild(speechButton);

    div.appendChild(taskOptions);

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

    event.stopPropagation();

    const { currentTarget } = event;

    currentTarget.removeEventListener('click', saveChanges);
    currentTarget.addEventListener('click', editTask);

    //get the input
    const input = event.currentTarget.parentElement.parentElement.querySelector('.task-edit-input');
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
    input.addEventListener('click', (event) => event.stopPropagation())
    return input;
}

function playTaskTitle(event) {
    event.stopPropagation();
    event.currentTarget.disabled = true;
    const text = event.currentTarget.parentElement.previousElementSibling.textContent;
    utterThis.text = text;
    synth.speak(utterThis);
    event.currentTarget.disabled = false;
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