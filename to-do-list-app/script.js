let lists = {};
let currentList = "Default";

document.getElementById("add-task-btn").addEventListener("click", addTask);
document.getElementById("add-list-btn").addEventListener("click", addList);
document.getElementById("export-btn").addEventListener("click", exportData);
document.getElementById("import-file").addEventListener("change", importData);

function addTask() {
    const taskInput = document.getElementById("task-input");
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    if (!lists[currentList]) lists[currentList] = [];
    lists[currentList].push({ text: taskText, completed: false });

    taskInput.value = "";
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    lists[currentList]?.forEach((task, index) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task";
        if (task.completed) taskItem.classList.add("completed");

        taskItem.innerHTML = `
            <span class="task-text">${task.text}</span>
            <button class="edit-btn" onclick="editTask(${index})">✎</button>
            <button class="delete-btn" onclick="deleteTask(${index})">🗑</button>
            <input type="checkbox" onclick="toggleComplete(${index})" ${task.completed ? "checked" : ""}>
        `;

        taskList.appendChild(taskItem);
    });
}

function editTask(index) {
    const newText = prompt("Edit your task:", lists[currentList][index].text);
    if (newText !== null) lists[currentList][index].text = newText;
    renderTasks();
}

function deleteTask(index) {
    lists[currentList].splice(index, 1);
    renderTasks();
}

function toggleComplete(index) {
    lists[currentList][index].completed = !lists[currentList][index].completed;
    renderTasks();
}

function addList() {
    const listInput = document.getElementById("list-input");
    const listName = listInput.value.trim();

    if (listName === "" || lists[listName]) {
        alert("Enter a valid, unique list name.");
        return;
    }

    lists[listName] = [];
    listInput.value = "";
    currentList = listName;
    renderLists();
    renderTasks();
}

function renderLists() {
    const listMenu = document.getElementById("list-menu");
    listMenu.innerHTML = "";

    Object.keys(lists).forEach(listName => {
        const listItem = document.createElement("li");
        listItem.textContent = listName;
        listItem.onclick = () => {
            currentList = listName;
            document.getElementById("current-list-title").textContent = listName;
            renderTasks();
        };
        listMenu.appendChild(listItem);
    });
}

function exportData() {
    const dataStr = JSON.stringify(lists);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFile = document.createElement("a");
    exportFile.href = dataUri;
    exportFile.download = "todo-lists.json";
    exportFile.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result);
        lists = importedData;
        currentList = Object.keys(lists)[0] || "Default";
        renderLists();
        renderTasks();
    };
    reader.readAsText(file);
}

// Initialize with a default list
lists["Default"] = [];
renderLists();
renderTasks();
