let lists = {};
let folders = {};
let currentFolder = null;
let currentList = "Default";

document.getElementById("add-task-btn").addEventListener("click", addTask);
document.getElementById("add-folder-btn").addEventListener("click", addFolder);
document.getElementById("export-btn").addEventListener("click", exportData);
document.getElementById("import-file").addEventListener("change", importData);

function addFolder() {
    const folderInput = document.getElementById("folder-input");
    const folderName = folderInput.value.trim();
    if (folderName === "") return alert("Please enter a folder name.");
    if (folders[folderName]) return alert("Folder already exists.");

    folders[folderName] = {};
    currentFolder = folderName;
    renderFolders();
}

function renderFolders() {
    const foldersEl = document.getElementById("folders");
    foldersEl.innerHTML = "";

    for (const folderName in folders) {
        const folderItem = document.createElement("li");
        folderItem.className = "folder";
        folderItem.innerHTML = `
            <span class="folder-title">${folderName}</span>
            <button onclick="deleteFolder('${folderName}')">❌</button>
        `;
        folderItem.onclick = () => {
            currentFolder = folderName;
            renderLists();
        };
        foldersEl.appendChild(folderItem);
    }
}

function deleteFolder(folderName) {
    delete folders[folderName];
    currentFolder = null;
    renderFolders();
    renderLists();
}

function addList() {
    const listInput = document.getElementById("list-input");
    const listName = listInput.value.trim();
    const emoji = prompt("Choose an emoji for this list:");
    const listTitle = emoji ? `${emoji} ${listName}` : listName;

    if (!folders[currentFolder]) return alert("Please select a folder.");
    folders[currentFolder][listName] = [];
    renderLists();
}

function renderLists() {
    const listMenu = document.getElementById("list-menu");
    listMenu.innerHTML = "";

    if (currentFolder && folders[currentFolder]) {
        for (const listName in folders[currentFolder]) {
            const listItem = document.createElement("li");
            listItem.className = "list";
            listItem.innerHTML = `
                <span>${listName}</span>
                <button onclick="openListOptions('${listName}')">⚙️</button>
            `;
            listMenu.appendChild(listItem);
        }
    }
}

function openListOptions(listName) {
    const confirm = window.confirm(`Delete the list '${listName}'?`);
    if (confirm) deleteList(listName);
}

function deleteList(listName) {
    delete folders[currentFolder][listName];
    renderLists();
}

// Implement task handling functions similarly to lists, and then add import/export as shown earlier.
