document.getElementById("add-task-btn").addEventListener("click", addTask);

function addTask() {
    const taskInput = document.getElementById("task-input");
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const taskList = document.getElementById("task-list");
    const taskItem = document.createElement("li");

    taskItem.innerHTML = `
        ${taskText}
        <button class="delete-btn">X</button>
    `;

    taskList.appendChild(taskItem);
    taskInput.value = "";

    // Add delete functionality
    taskItem.querySelector(".delete-btn").addEventListener("click", function() {
        taskItem.remove();
    });
}
