// --- Dane i uprawnienia ---
const USERS = [
  { login: 'admin', role: 'admin' },
  { login: 'demo', role: 'user' }
];
let currentUser = USERS[0]; // domyślnie admin

let lists = [
  { name: "Domyślna", tasks: [] }
];
let currentList = 0;
let settings = {
  theme: "light",
  sort: "created-desc"
};
let editingTaskId = null;
let statusFilter = "all";
let priorityFilter = "all";

// -- Elementy DOM --
const userSelect = document.createElement('select');
userSelect.id = 'user-select';
userSelect.style.margin = "0 0 12px 0";
USERS.forEach(u => {
  const opt = document.createElement('option');
  opt.value = u.login;
  opt.textContent = u.login + (u.role === "admin" ? " (admin)" : "");
  userSelect.appendChild(opt);
});
document.querySelector('.container').insertBefore(userSelect, document.querySelector('header'));

userSelect.onchange = () => {
  currentUser = USERS.find(u => u.login === userSelect.value);
  renderTasks();
};

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskDescInput = document.getElementById('task-desc-input');
const taskPriorityInput = document.getElementById('task-priority');
const taskIconInput = document.getElementById('task-icon');
const listsSelect = document.getElementById('lists-select');
const listName = document.getElementById('list-name');
const statAll = document.getElementById('stat-all');
const statDone = document.getElementById('stat-done');
const statOpen = document.getElementById('stat-open');
const statPercent = document.getElementById('stat-percent');
const statusFilterSelect = document.getElementById('status-filter');
const priorityFilterSelect = document.getElementById('priority-filter');

const modalBg = document.getElementById('modal-bg');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTitle = document.getElementById('edit-title');
const editDesc = document.getElementById('edit-desc');
const editPriority = document.getElementById('edit-priority');
const editIcon = document.getElementById('edit-icon');
const cancelEditBtn = document.getElementById('cancel-edit');
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const themeSelect = document.getElementById('theme-select');
const sortSelect = document.getElementById('sort-select');
const addListBtn = document.getElementById('add-list-btn');
const deleteListBtn = document.getElementById('delete-list-btn');

// --- Inicjalizacja ---
window.onload = () => {
  loadLocal();
  renderListsSelect();
  renderTasks();
  updateStats();
  applyTheme();
  statusFilterSelect.value = "all";
  priorityFilterSelect.value = "all";
  userSelect.value = currentUser.login;
};

// --- Funkcje renderujące ---

function renderListsSelect() {
  listsSelect.innerHTML = '';
  lists.forEach((l, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = l.name;
    listsSelect.appendChild(opt);
  });
  listsSelect.value = currentList;
  listName.textContent = lists[currentList].name ? `(${lists[currentList].name})` : '';
}

function getFilteredAndSortedTasks() {
  let tasks = [...lists[currentList].tasks];

  // Filtrowanie po statusie
  if (statusFilter !== "all") {
    tasks = tasks.filter(t => statusFilter === "done" ? t.completed : !t.completed);
  }
  // Filtrowanie po priorytecie
  if (priorityFilter !== "all") {
    tasks = tasks.filter(t => t.priority === priorityFilter);
  }

  // Sortowanie
  switch (settings.sort) {
    case "created-asc":
      tasks.sort((a, b) => a.created - b.created); break;
    case "created-desc":
      tasks.sort((a, b) => b.created - a.created); break;
    case "alpha-asc":
      tasks.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "alpha-desc":
      tasks.sort((a, b) => b.title.localeCompare(a.title)); break;
    case "priority-desc":
      tasks.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority)); break;
    case "priority-asc":
      tasks.sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority)); break;
  }
  return tasks;
}

function renderTasks() {
  const tasks = getFilteredAndSortedTasks();
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.created);

    // Uprawnienia
    const isOwner = task.owner === currentUser.login;
    const isAdmin = currentUser.role === "admin";
    const canEdit = isAdmin || isOwner;
    const canDelete = isAdmin || isOwner;
    const canComplete = isAdmin || isOwner;

    li.innerHTML = `
      <span class="task-icon" title="Ikonka">${task.icon || "📝"}</span>
      <div class="task-main">
        <span class="task-title">
          ${escapeHtml(task.title)}
          ${task.completed
            ? `<span class="badge done">Zrobione</span>`
            : `<span class="badge open">Otwarte</span>`
          }
          <span class="badge priority-${escapeHtml(task.priority)}" title="Priorytet">
            ${priorityLabel(task.priority)}
          </span>
          <span class="badge" style="background:#bbb;font-size:0.8em;" title="Właściciel">${escapeHtml(task.owner)}</span>
        </span>
        ${task.desc ? `<span class="task-desc">${escapeHtml(task.desc)}</span>` : ''}
        <span class="task-date" title="Data utworzenia">${formatDate(task.created)}</span>
      </div>
      <div class="task-actions">
        <button class="action-btn complete-btn" title="Oznacz jako wykonane" ${canComplete ? "" : "disabled"}>${task.completed ? '↩️' : '✅'}</button>
        <button class="action-btn edit-btn" title="Edytuj" ${canEdit ? "" : "disabled"}>✏️</button>
        <button class="action-btn delete-btn" title="Usuń" ${canDelete ? "" : "disabled"}>🗑️</button>
      </div>
    `;

    const id = task.created;
    if (canComplete) li.querySelector('.complete-btn').onclick = () => toggleTaskById(id);
    if (canEdit) li.querySelector('.edit-btn').onclick = () => openEditModalById(id);
    if (canDelete) li.querySelector('.delete-btn').onclick = () => deleteTaskById(id);

    taskList.appendChild(li);
  });
  updateStats();
  saveLocal();
}

function updateStats() {
  // Statystyki zawsze pokazują pełną listę, nie przefiltrowaną!
  const tasks = lists[currentList].tasks;
  const all = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const open = all - done;
  statAll.textContent = all;
  statDone.textContent = done;
  statOpen.textContent = open;
  statPercent.textContent = all ? Math.round((done / all) * 100) + "%" : "0%";
}

// --- Zadania ---
taskForm.onsubmit = (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  const priority = taskPriorityInput.value || "normal";
  const icon = taskIconInput.value || "📝";
  if (title) {
    lists[currentList].tasks.push({
      title,
      desc,
      completed: false,
      created: Date.now() + Math.floor(Math.random() * 99999),
      priority,
      icon,
      owner: currentUser.login
    });
    taskForm.reset();
    renderTasks();
  }
};

function findTaskIndexById(id) {
  return lists[currentList].tasks.findIndex(t => t.created === id);
}

function toggleTaskById(id) {
  const idx = findTaskIndexById(id);
  if (idx !== -1) {
    if (currentUser.role === "admin" || lists[currentList].tasks[idx].owner === currentUser.login) {
      lists[currentList].tasks[idx].completed = !lists[currentList].tasks[idx].completed;
      renderTasks();
    }
  }
}

function deleteTaskById(id) {
  const idx = findTaskIndexById(id);
  if (idx !== -1) {
    if (currentUser.role === "admin" || lists[currentList].tasks[idx].owner === currentUser.login) {
      if (confirm("Na pewno usunąć to zadanie?")) {
        lists[currentList].tasks.splice(idx, 1);
        renderTasks();
      }
    }
  }
}

// --- Edycja zadania ---
function openEditModalById(id) {
  editingTaskId = id;
  const idx = findTaskIndexById(id);
  if (idx === -1) return;
  const task = lists[currentList].tasks[idx];
  if (currentUser.role !== "admin" && task.owner !== currentUser.login) return;
  editTitle.value = task.title;
  editDesc.value = task.desc || '';
  editPriority.value = task.priority || "normal";
  editIcon.value = task.icon || "📝";
  showModal(editModal);
}
editForm.onsubmit = (e) => {
  e.preventDefault();
  if (editingTaskId !== null) {
    const idx = findTaskIndexById(editingTaskId);
    if (idx !== -1) {
      if (currentUser.role === "admin" || lists[currentList].tasks[idx].owner === currentUser.login) {
        lists[currentList].tasks[idx].title = editTitle.value.trim();
        lists[currentList].tasks[idx].desc = editDesc.value.trim();
        lists[currentList].tasks[idx].priority = editPriority.value;
        lists[currentList].tasks[idx].icon = editIcon.value;
      }
    }
    hideModal(editModal);
    editingTaskId = null;
    renderTasks();
  }
};
cancelEditBtn.onclick = () => {
  hideModal(editModal);
  editingTaskId = null;
};

// --- Listy ---
listsSelect.onchange = () => {
  currentList = Number(listsSelect.value);
  renderListsSelect();
  renderTasks();
};

addListBtn.onclick = () => {
  if (currentUser.role !== "admin") {
    alert("Tylko admin może dodawać listy!");
    return;
  }
  const name = prompt("Nazwa nowej listy:");
  if (name && name.trim()) {
    lists.push({ name: name.trim(), tasks: [] });
    currentList = lists.length - 1;
    renderListsSelect();
    renderTasks();
  }
};
deleteListBtn.onclick = () => {
  if (currentUser.role !== "admin") {
    alert("Tylko admin może usuwać listy!");
    return;
  }
  if (lists.length === 1) {
    alert("Nie można usunąć ostatniej listy!");
    return;
  }
  if (confirm("Na pewno usunąć tę listę zadań?")) {
    lists.splice(currentList, 1);
    if (currentList > 0) currentList--;
    renderListsSelect();
    renderTasks();
  }
};

// --- Ustawienia ---
openSettingsBtn.onclick = () => {
  themeSelect.value = settings.theme;
  sortSelect.value = settings.sort;
  showModal(settingsModal);
};
closeSettingsBtn.onclick = () => {
  hideModal(settingsModal);
};
themeSelect.onchange = () => {
  settings.theme = themeSelect.value;
  applyTheme();
  saveLocal();
};
sortSelect.onchange = () => {
  settings.sort = sortSelect.value;
  renderTasks();
  saveLocal();
};

function applyTheme() {
  document.body.setAttribute('data-theme', settings.theme);
}

// --- Filtrowanie ---
statusFilterSelect.onchange = () => {
  statusFilter = statusFilterSelect.value;
  renderTasks();
};
priorityFilterSelect.onchange = () => {
  priorityFilter = priorityFilterSelect.value;
  renderTasks();
};

// --- Modal obsługa ---
function showModal(modal) {
  modalBg.classList.remove('hidden');
  modal.classList.remove('hidden');
}
function hideModal(modal) {
  modalBg.classList.add('hidden');
  modal.classList.add('hidden');
}
modalBg.onclick = () => {
  [editModal, settingsModal].forEach(hideModal);
  editingTaskId = null;
};
window.onkeydown = (e) => {
  if (e.key === "Escape") {
    [editModal, settingsModal].forEach(hideModal);
    editingTaskId = null;
  }
};

// --- Utils ---
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m];
  });
}
function getPriorityWeight(priority) {
  switch(priority) {
    case "high": return 2;
    case "normal": return 1;
    case "low": return 0;
    default: return 1;
  }
}
function priorityLabel(priority) {
  switch(priority) {
    case "high": return "Wysoki";
    case "normal": return "Średni";
    case "low": return "Niski";
    default: return "Średni";
  }
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

// --- LocalStorage ---
function saveLocal() {
  localStorage.setItem('taskManagerLists', JSON.stringify(lists));
  localStorage.setItem('taskManagerCurrentList', currentList);
  localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
}
function loadLocal() {
  const l = localStorage.getItem('taskManagerLists');
  const s = localStorage.getItem('taskManagerSettings');
  const cl = localStorage.getItem('taskManagerCurrentList');
  if (l) lists = JSON.parse(l);
  if (cl) currentList = Number(cl);
  if (s) settings = { ...settings, ...JSON.parse(s) };
}
