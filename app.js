// ====== JĘZYKI ======
const LANGUAGES = {
  en: {
    brand: "TaskMaster",
    subtitle: "Your task manager",
    stats_all: "All",
    stats_done: "Done",
    stats_open: "Open",
    stats_percent: "Completed",
    list: "List",
    add_list: "Add list",
    del_list: "Delete list",
    settings: "Settings",
    title_ph: "Task title...",
    desc_ph: "Description (optional)",
    priority: "Priority",
    priority_low: "Low",
    priority_normal: "Normal",
    priority_high: "High",
    icon: "Icon",
    add: "Add",
    status: "Status",
    filter_all: "All",
    filter_open: "Open",
    filter_done: "Done",
    filter_priority: "Priority",
    edit: "Edit",
    delete: "Delete",
    mark_done: "Mark done",
    revert: "Reopen",
    comments: "Comments",
    deadline: "Deadline",
    attachment: "Attachment link",
    overdue: "Overdue",
    owner: "Owner",
    created: "Created",
    completed: "Completed",
    attach: "Attachment",
    comment_add: "Add comment...",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    theme: "Theme",
    sorting: "Sorting",
    user: "User",
    admin: "admin",
    demo: "demo",
    language: "Language",
    confirm_del_list: "Are you sure you want to delete this list?",
    confirm_del_task: "Are you sure you want to delete this task?",
    last_list: "Cannot remove the last list!",
    only_admin_list: "Only admin can add/delete lists!",
    no_comments: "No comments.",
    history: "History",
    comment: "comment",
    edited: "edited",
    created_label: "created",
    completed_label: "completed",
    restored: "restored",
    overdue_label: "Overdue ",
    quick_add: "Quick Add",
    search: "Search",
    bulk_actions: "Bulk Actions",
    export: "Export",
    search_placeholder: "Search tasks...",
    no_results: "No tasks found matching your search.",
    ctrl_n: "Ctrl+N",
    ctrl_f: "Ctrl+F"
  },
  pl: {
    brand: "TaskMaster",
    subtitle: "Twój menedżer zadań",
    stats_all: "Wszystkie",
    stats_done: "Ukończone",
    stats_open: "Otwarte",
    stats_percent: "Zrealizowano",
    list: "Lista",
    add_list: "Dodaj listę",
    del_list: "Usuń listę",
    settings: "Ustawienia",
    title_ph: "Tytuł zadania...",
    desc_ph: "Opis (opcjonalnie)",
    priority: "Priorytet",
    priority_low: "Niski",
    priority_normal: "Średni",
    priority_high: "Wysoki",
    icon: "Ikona",
    add: "Dodaj",
    status: "Status",
    filter_all: "Wszystkie",
    filter_open: "Otwarte",
    filter_done: "Zrobione",
    filter_priority: "Priorytet",
    edit: "Edytuj",
    delete: "Usuń",
    mark_done: "Ukończ",
    revert: "Przywróć",
    comments: "Komentarze",
    deadline: "Termin",
    attachment: "Link do załącznika",
    overdue: "Przeterminowane",
    owner: "Właściciel",
    created: "Utworzone",
    completed: "Zakończone",
    attach: "Załącznik",
    comment_add: "Dodaj komentarz...",
    close: "Zamknij",
    save: "Zapisz",
    cancel: "Anuluj",
    theme: "Motyw",
    sorting: "Sortowanie",
    user: "Użytkownik",
    admin: "admin",
    demo: "demo",
    language: "Język",
    confirm_del_list: "Na pewno usunąć tę listę?",
    confirm_del_task: "Na pewno usunąć to zadanie?",
    last_list: "Nie można usunąć ostatniej listy!",
    only_admin_list: "Tylko admin może dodawać/usuwać listy!",
    no_comments: "Brak komentarzy.",
    history: "Historia zmian",
    comment: "komentarz",
    edited: "edytowano",
    created_label: "utworzone",
    completed_label: "ukończone",
    restored: "przywrócone",
    overdue_label: "Przeterminowane",
    quick_add: "Szybkie Dodaj",
    search: "Szukaj",
    bulk_actions: "Akcje Grupowe",
    export: "Eksport",
    search_placeholder: "Szukaj zadań...",
    no_results: "Nie znaleziono zadań pasujących do wyszukiwania.",
    ctrl_n: "Ctrl+N",
    ctrl_f: "Ctrl+F"
  }
};
let lang = "en";

// ====== UŻYTKOWNICY & UPRAWNIENIA ======
const USERS = [
  { login: 'admin', role: 'admin' },
  { login: 'demo', role: 'user' }
];
let currentUser = USERS[0];

let lists = [
  { name: "Default", tasks: [] }
];
let currentList = 0;
let settings = {
  theme: "light",
  sort: "created-desc",
  lang: "en"
};
let editingTaskId = null;
let statusFilter = "all";
let priorityFilter = "all";

// ----------- DOM ELEMENTS -----------
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
  applyLanguage();
};

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskDescInput = document.getElementById('task-desc-input');
const taskPriorityInput = document.getElementById('task-priority');
const taskIconInput = document.getElementById('task-icon');
const taskDeadlineInput = document.createElement('input');
taskDeadlineInput.type = "date";
taskDeadlineInput.id = "task-deadline";
taskDeadlineInput.style.flex = "1 1 110px";
taskDeadlineInput.className = "task-deadline";
taskForm.insertBefore(taskDeadlineInput, taskForm.querySelector('button'));

const taskAttachmentInput = document.createElement('input');
taskAttachmentInput.type = "url";
taskAttachmentInput.id = "task-attachment";
taskAttachmentInput.placeholder = "Attachment link";
taskAttachmentInput.style.flex = "2 1 140px";
taskAttachmentInput.className = "task-attachment";
taskForm.insertBefore(taskAttachmentInput, taskForm.querySelector('button'));

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
const langSelect = document.getElementById('lang-select');
const addListBtn = document.getElementById('add-list-btn');
const deleteListBtn = document.getElementById('delete-list-btn');

// Quick Actions Elements
const quickAddBtn = document.getElementById('quick-add-btn');
const searchBtn = document.getElementById('search-btn');
const bulkActionsBtn = document.getElementById('bulk-actions-btn');
const exportBtn = document.getElementById('export-btn');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const closeSearchBtn = document.getElementById('close-search-btn');

let searchTerm = '';
let isSearchActive = false;

// --- Komentarze / historia ---
const commentsModal = document.createElement('div');
commentsModal.className = "modal hidden";
commentsModal.id = "comments-modal";
commentsModal.innerHTML = `
  <h2 id="comments-modal-title">Comments & history</h2>
  <div id="comments-history" style="max-height:220px;overflow-y:auto;margin-bottom:10px;"></div>
  <form id="comments-form" style="display:flex;gap:7px;">
    <input id="comment-input" type="text" placeholder="Add comment..." style="flex:3;border-radius:7px;padding:7px;border:1px solid #e0e6ed;">
    <button type="submit" style="flex:1;border-radius:7px;">Add</button>
  </form>
  <button id="close-comments" style="margin-top:7px;">Close</button>
`;
document.body.appendChild(commentsModal);
const commentsHistory = commentsModal.querySelector("#comments-history");
const commentsForm = commentsModal.querySelector("#comments-form");
const commentInput = commentsModal.querySelector("#comment-input");
const closeCommentsBtn = commentsModal.querySelector("#close-comments");
let activeCommentsTaskId = null;

closeCommentsBtn.onclick = () => {
  hideModal(commentsModal);
  activeCommentsTaskId = null;
};
modalBg.onclick = () => {
  [editModal, settingsModal, commentsModal].forEach(hideModal);
  editingTaskId = null;
  activeCommentsTaskId = null;
};
window.onkeydown = (e) => {
  if (e.key === "Escape") {
    [editModal, settingsModal, commentsModal].forEach(hideModal);
    editingTaskId = null;
    activeCommentsTaskId = null;
  }
};

// --- JĘZYK: zmiana
langSelect.onchange = () => {
  lang = langSelect.value;
  settings.lang = lang;
  saveLocal();
  applyLanguage();
};

function applyLanguage() {
  // Branding
  document.querySelector('.branding-logo').innerHTML = `${LANGUAGES[lang].brand} <span style="color:#f7b731;">PRO</span>`;
  document.querySelector('.branding-sub').textContent = LANGUAGES[lang].subtitle;
  // Statystyki
  document.getElementById('stat-all-label').childNodes[0].nodeValue = LANGUAGES[lang].stats_all + ": ";
  document.getElementById('stat-done-label').childNodes[0].nodeValue = LANGUAGES[lang].stats_done + ": ";
  document.getElementById('stat-open-label').childNodes[0].nodeValue = LANGUAGES[lang].stats_open + ": ";
  document.getElementById('stat-percent-label').childNodes[0].nodeValue = LANGUAGES[lang].stats_percent + ": ";
  // List bar
  document.getElementById('label-list').textContent = LANGUAGES[lang].list + ":";
  addListBtn.title = LANGUAGES[lang].add_list;
  deleteListBtn.title = LANGUAGES[lang].del_list;
  // Filtry
  document.getElementById('label-status').childNodes[0].nodeValue = LANGUAGES[lang].status + ":";
  document.getElementById('label-priority').childNodes[0].nodeValue = LANGUAGES[lang].priority + ":";
  statusFilterSelect.options[0].text = LANGUAGES[lang].filter_all;
  statusFilterSelect.options[1].text = LANGUAGES[lang].filter_open;
  statusFilterSelect.options[2].text = LANGUAGES[lang].filter_done;
  priorityFilterSelect.options[0].text = LANGUAGES[lang].filter_all;
  priorityFilterSelect.options[1].text = LANGUAGES[lang].priority_high;
  priorityFilterSelect.options[2].text = LANGUAGES[lang].priority_normal;
  priorityFilterSelect.options[3].text = LANGUAGES[lang].priority_low;
  // Task form
  taskTitleInput.placeholder = LANGUAGES[lang].title_ph;
  taskDescInput.placeholder = LANGUAGES[lang].desc_ph;
  taskPriorityInput.options[0].text = LANGUAGES[lang].priority + ": " + LANGUAGES[lang].priority_normal;
  taskPriorityInput.options[1].text = LANGUAGES[lang].priority_low;
  taskPriorityInput.options[2].text = LANGUAGES[lang].priority_high;
  taskIconInput.title = LANGUAGES[lang].icon;
  taskDeadlineInput.placeholder = LANGUAGES[lang].deadline;
  taskAttachmentInput.placeholder = LANGUAGES[lang].attachment;
  taskForm.querySelector("button[type='submit']").textContent = LANGUAGES[lang].add;
  // Edit modal
  document.getElementById('edit-modal-title').textContent = LANGUAGES[lang].edit + " " + LANGUAGES[lang].title_ph.toLowerCase();
  editDesc.placeholder = LANGUAGES[lang].desc_ph;
  editPriority.options[0].text = LANGUAGES[lang].priority + ": " + LANGUAGES[lang].priority_normal;
  editPriority.options[1].text = LANGUAGES[lang].priority_low;
  editPriority.options[2].text = LANGUAGES[lang].priority_high;
  editIcon.title = LANGUAGES[lang].icon;
  editForm.querySelector("button[type='submit']").textContent = LANGUAGES[lang].save;
  cancelEditBtn.textContent = LANGUAGES[lang].cancel;
  // Settings
  document.getElementById('settings-modal-title').textContent = LANGUAGES[lang].settings;
  document.getElementById('label-theme').textContent = LANGUAGES[lang].theme + ":";
  document.getElementById('label-sorting').textContent = LANGUAGES[lang].sorting + ":";
  document.getElementById('label-language').textContent = LANGUAGES[lang].language + ":";
  closeSettingsBtn.textContent = LANGUAGES[lang].close;
  langSelect.options[0].text = "English";
  langSelect.options[1].text = "Polski";
  // Comments modal
  document.getElementById('comments-modal-title').textContent = LANGUAGES[lang].comments + " & " + LANGUAGES[lang].history;
  commentsForm.querySelector("button[type='submit']").textContent = LANGUAGES[lang].add;
  commentInput.placeholder = LANGUAGES[lang].comment_add;
  closeCommentsBtn.textContent = LANGUAGES[lang].close;
  // User select
  userSelect.options[0].textContent = LANGUAGES[lang].admin + " (admin)";
  userSelect.options[1].textContent = LANGUAGES[lang].demo + " (" + LANGUAGES[lang].user + ")";
  
  // Quick Actions
  quickAddBtn.textContent = "⚡ " + LANGUAGES[lang].quick_add;
  quickAddBtn.title = LANGUAGES[lang].quick_add + " (" + LANGUAGES[lang].ctrl_n + ")";
  searchBtn.textContent = "🔍 " + LANGUAGES[lang].search;
  searchBtn.title = LANGUAGES[lang].search + " (" + LANGUAGES[lang].ctrl_f + ")";
  bulkActionsBtn.textContent = "📋 " + LANGUAGES[lang].bulk_actions;
  bulkActionsBtn.title = LANGUAGES[lang].bulk_actions;
  exportBtn.textContent = "📤 " + LANGUAGES[lang].export;
  exportBtn.title = LANGUAGES[lang].export;
  searchInput.placeholder = LANGUAGES[lang].search_placeholder;
  
  // Render everything else
  renderListsSelect();
  renderTasks();
  updateStats();
}

// --- INICJALIZACJA ---
window.onload = () => {
  loadLocal();
  if (settings.lang) lang = settings.lang;
  langSelect.value = lang;
  applyLanguage();
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

  if (statusFilter !== "all") {
    tasks = tasks.filter(t => statusFilter === "done" ? t.completed : !t.completed);
  }
  if (priorityFilter !== "all") {
    tasks = tasks.filter(t => t.priority === priorityFilter);
  }
  
  // Search filtering
  if (searchTerm && searchTerm.trim() !== '') {
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm) ||
      (t.desc && t.desc.toLowerCase().includes(searchTerm)) ||
      (t.owner && t.owner.toLowerCase().includes(searchTerm))
    );
  }

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

    // Deadline
    let deadlineBadge = '';
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const today = new Date();
      if (!task.completed && deadlineDate < new Date(today.toDateString())) {
        deadlineBadge = `<span class="badge" style="background:#e64c3c;">${LANGUAGES[lang].overdue}</span>`;
      } else if (!task.completed) {
        deadlineBadge = `<span class="badge" style="background:#218cfa;">${LANGUAGES[lang].deadline}: ${escapeHtml(task.deadline)}</span>`;
      } else {
        deadlineBadge = `<span class="badge" style="background:#aaa;">${LANGUAGES[lang].completed}: ${escapeHtml(task.deadline)}</span>`;
      }
    }

    // Załącznik
    let attachmentLink = '';
    if (task.attachment) {
      attachmentLink = `<a href="${escapeHtml(task.attachment)}" target="_blank" style="margin-left:7px;font-size:1.1em;" title="${LANGUAGES[lang].attach}">📎</a>`;
    }

    li.innerHTML = `
      <span class="task-icon" title="${LANGUAGES[lang].icon}">${task.icon || "📝"}</span>
      <div class="task-main">
        <span class="task-title">
          ${escapeHtml(task.title)}
          ${task.completed
            ? `<span class="badge done">${LANGUAGES[lang].stats_done}</span>`
            : `<span class="badge open">${LANGUAGES[lang].stats_open}</span>`
          }
          <span class="badge priority-${escapeHtml(task.priority)}" title="${LANGUAGES[lang].priority}">
            ${priorityLabel(task.priority)}
          </span>
          <span class="badge" style="background:#bbb;font-size:0.8em;" title="${LANGUAGES[lang].owner}">${escapeHtml(task.owner)}</span>
          ${deadlineBadge}
          ${attachmentLink}
        </span>
        ${task.desc ? `<span class="task-desc">${escapeHtml(task.desc)}</span>` : ''}
        <span class="task-date" title="${LANGUAGES[lang].created}">${formatDate(task.created)}</span>
      </div>
      <div class="task-actions">
        <button class="action-btn complete-btn" title="${canComplete ? LANGUAGES[lang].mark_done : ''}" ${canComplete ? "" : "disabled"}>${task.completed ? '↩️' : '✅'}</button>
        <button class="action-btn edit-btn" title="${canEdit ? LANGUAGES[lang].edit : ''}" ${canEdit ? "" : "disabled"}>✏️</button>
        <button class="action-btn delete-btn" title="${canDelete ? LANGUAGES[lang].delete : ''}" ${canDelete ? "" : "disabled"}>🗑️</button>
        <button class="action-btn comments-btn" title="${LANGUAGES[lang].comments}">💬</button>
      </div>
    `;

    const id = task.created;
    if (canComplete) li.querySelector('.complete-btn').onclick = () => toggleTaskById(id);
    if (canEdit) li.querySelector('.edit-btn').onclick = () => openEditModalById(id);
    if (canDelete) li.querySelector('.delete-btn').onclick = () => deleteTaskById(id);
    li.querySelector('.comments-btn').onclick = () => openCommentsModal(id);

    taskList.appendChild(li);
  });
  
  // Show "no results" message if search is active and no tasks found
  if (searchTerm && searchTerm.trim() !== '' && tasks.length === 0) {
    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'no-results';
    noResultsDiv.style.cssText = `
      text-align: center;
      padding: 30px;
      color: var(--text-light);
      font-size: 1.1rem;
      background: var(--card-bg);
      border-radius: 17px;
      border: 2px dashed var(--border);
      margin: 20px 0;
    `;
    noResultsDiv.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
      <div>${LANGUAGES[lang].no_results}</div>
      <div style="font-size: 0.9rem; margin-top: 10px; color: var(--text-light);">
        ${LANGUAGES[lang].search}: "<strong>${escapeHtml(searchTerm)}</strong>"
      </div>
    `;
    taskList.appendChild(noResultsDiv);
  }
  
  updateStats();
  saveLocal();
}

function updateStats() {
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
  const deadline = taskDeadlineInput.value || '';
  const attachment = taskAttachmentInput.value.trim();
  if (title) {
    lists[currentList].tasks.push({
      title,
      desc,
      completed: false,
      created: Date.now() + Math.floor(Math.random() * 99999),
      priority,
      icon,
      deadline,
      attachment,
      owner: currentUser.login,
      comments: [],
      history: [
        { type: LANGUAGES[lang].created_label, date: Date.now(), who: currentUser.login }
      ]
    });
    taskForm.reset();
    taskDeadlineInput.value = '';
    taskAttachmentInput.value = '';
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
      lists[currentList].tasks[idx].history = lists[currentList].tasks[idx].history || [];
      lists[currentList].tasks[idx].history.push({
        type: lists[currentList].tasks[idx].completed ? LANGUAGES[lang].completed_label : LANGUAGES[lang].restored,
        date: Date.now(),
        who: currentUser.login
      });
      renderTasks();
    }
  }
}

function deleteTaskById(id) {
  const idx = findTaskIndexById(id);
  if (idx !== -1) {
    if (currentUser.role === "admin" || lists[currentList].tasks[idx].owner === currentUser.login) {
      if (confirm(LANGUAGES[lang].confirm_del_task)) {
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

  // deadline + attachment do modala
  if (!editForm.querySelector("#edit-deadline")) {
    const editDeadline = document.createElement('input');
    editDeadline.type = "date";
    editDeadline.id = "edit-deadline";
    editDeadline.style.borderRadius = "8px";
    editDeadline.style.border = "1px solid #e0e6ed";
    editDeadline.style.padding = "7px";
    editDeadline.style.fontSize = "1rem";
    editDeadline.style.background = "var(--main-bg)";
    editDeadline.className = "edit-deadline";
    editForm.insertBefore(editDeadline, editForm.querySelector('button'));
  }
  if (!editForm.querySelector("#edit-attachment")) {
    const editAttachment = document.createElement('input');
    editAttachment.type = "url";
    editAttachment.id = "edit-attachment";
    editAttachment.placeholder = LANGUAGES[lang].attachment;
    editAttachment.style.borderRadius = "8px";
    editAttachment.style.border = "1px solid #e0e6ed";
    editAttachment.style.padding = "7px";
    editAttachment.style.fontSize = "1rem";
    editAttachment.style.background = "var(--main-bg)";
    editAttachment.className = "edit-attachment";
    editForm.insertBefore(editAttachment, editForm.querySelector('button'));
  }
  editForm.querySelector("#edit-deadline").value = (task.deadline || '');
  editForm.querySelector("#edit-attachment").value = (task.attachment || '');

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
        // deadline + attachment
        lists[currentList].tasks[idx].deadline = editForm.querySelector("#edit-deadline").value || '';
        lists[currentList].tasks[idx].attachment = editForm.querySelector("#edit-attachment").value.trim();
        lists[currentList].tasks[idx].history = lists[currentList].tasks[idx].history || [];
        lists[currentList].tasks[idx].history.push({
          type: LANGUAGES[lang].edited,
          date: Date.now(),
          who: currentUser.login
        });
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

// --- Komentarze / historia ---
function openCommentsModal(taskId) {
  activeCommentsTaskId = taskId;
  const idx = findTaskIndexById(taskId);
  if (idx === -1) return;
  const task = lists[currentList].tasks[idx];
  // Komentarze
  let html = "";
  if (task.comments && task.comments.length > 0) {
    html += `<div><b>${LANGUAGES[lang].comments}:</b></div>`;
    task.comments.forEach(c =>
      html += `<div style="margin-bottom:4px;">
        <span style="font-weight:500;">${escapeHtml(c.who)}</span>:
        <span>${escapeHtml(c.text)}</span>
        <span style="color:#888;font-size:0.88em;">(${formatDate(c.date)})</span>
      </div>`
    );
  } else {
    html += `<div style="color:#aaa;">${LANGUAGES[lang].no_comments}</div>`;
  }
  // Historia
  if (task.history && task.history.length > 0) {
    html += `<hr style="margin:10px 0;">`;
    html += `<div><b>${LANGUAGES[lang].history}:</b></div>`;
    task.history.forEach(h =>
      html += `<div style="margin-bottom:3px;">
        <span style="font-weight:500;">${escapeHtml(h.who)}</span> 
        <span>${escapeHtml(h.type)}</span>
        <span style="color:#888;font-size:0.88em;">(${formatDate(h.date)})</span>
      </div>`
    );
  }
  commentsHistory.innerHTML = html;
  commentInput.value = "";
  showModal(commentsModal);
}
commentsForm.onsubmit = (e) => {
  e.preventDefault();
  if (activeCommentsTaskId !== null && commentInput.value.trim()) {
    const idx = findTaskIndexById(activeCommentsTaskId);
    if (idx !== -1) {
      lists[currentList].tasks[idx].comments = lists[currentList].tasks[idx].comments || [];
      lists[currentList].tasks[idx].comments.push({
        who: currentUser.login,
        text: commentInput.value.trim(),
        date: Date.now()
      });
      lists[currentList].tasks[idx].history = lists[currentList].tasks[idx].history || [];
      lists[currentList].tasks[idx].history.push({
        type: LANGUAGES[lang].comment,
        date: Date.now(),
        who: currentUser.login
      });
      openCommentsModal(activeCommentsTaskId);
    }
    commentInput.value = "";
    saveLocal();
  }
};

// --- Listy ---
listsSelect.onchange = () => {
  currentList = Number(listsSelect.value);
  renderListsSelect();
  renderTasks();
};

addListBtn.onclick = () => {
  if (currentUser.role !== "admin") {
    alert(LANGUAGES[lang].only_admin_list);
    return;
  }
  const name = prompt(LANGUAGES[lang].add_list + ":");
  if (name && name.trim()) {
    lists.push({ name: name.trim(), tasks: [] });
    currentList = lists.length - 1;
    renderListsSelect();
    renderTasks();
  }
};
deleteListBtn.onclick = () => {
  if (currentUser.role !== "admin") {
    alert(LANGUAGES[lang].only_admin_list);
    return;
  }
  if (lists.length === 1) {
    alert(LANGUAGES[lang].last_list);
    return;
  }
  if (confirm(LANGUAGES[lang].confirm_del_list)) {
    lists.splice(currentList, 1);
    if (currentList > 0) currentList--;
    renderListsSelect();
    renderTasks();
  }
};

// --- Quick Actions ---
quickAddBtn.onclick = () => {
  taskTitleInput.focus();
  taskTitleInput.scrollIntoView({ behavior: 'smooth' });
};

searchBtn.onclick = () => {
  toggleSearch();
};

bulkActionsBtn.onclick = () => {
  showBulkActionsModal();
};

exportBtn.onclick = () => {
  exportTasks();
};

closeSearchBtn.onclick = () => {
  toggleSearch();
};

searchInput.oninput = (e) => {
  searchTerm = e.target.value.toLowerCase();
  renderTasks();
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    taskTitleInput.focus();
    taskTitleInput.scrollIntoView({ behavior: 'smooth' });
  }
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    toggleSearch();
  }
  if (e.key === 'Escape') {
    if (isSearchActive) {
      toggleSearch();
    }
  }
});

function toggleSearch() {
  isSearchActive = !isSearchActive;
  if (isSearchActive) {
    searchBar.classList.remove('hidden');
    searchInput.focus();
  } else {
    searchBar.classList.add('hidden');
    searchInput.value = '';
    searchTerm = '';
    renderTasks();
  }
}

function showBulkActionsModal() {
  // Create a simple bulk actions modal
  const bulkModal = document.createElement('div');
  bulkModal.className = 'modal';
  bulkModal.innerHTML = `
    <h2>${LANGUAGES[lang].bulk_actions}</h2>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <button id="bulk-complete" class="quick-btn">✅ ${LANGUAGES[lang].mark_done} ${LANGUAGES[lang].filter_all}</button>
      <button id="bulk-delete" class="quick-btn">🗑️ ${LANGUAGES[lang].delete} ${LANGUAGES[lang].filter_all}</button>
      <button id="bulk-high-priority" class="quick-btn">🔥 ${LANGUAGES[lang].priority_high} ${LANGUAGES[lang].filter_all}</button>
      <button id="bulk-cancel" class="quick-btn">❌ ${LANGUAGES[lang].cancel}</button>
    </div>
  `;
  
  document.body.appendChild(bulkModal);
  showModal(bulkModal);
  
  bulkModal.querySelector('#bulk-complete').onclick = () => {
    bulkCompleteAllTasks();
    hideModal(bulkModal);
    document.body.removeChild(bulkModal);
  };
  
  bulkModal.querySelector('#bulk-delete').onclick = () => {
    if (confirm(`${LANGUAGES[lang].confirm_del_task} (${LANGUAGES[lang].filter_all})`)) {
      bulkDeleteAllTasks();
    }
    hideModal(bulkModal);
    document.body.removeChild(bulkModal);
  };
  
  bulkModal.querySelector('#bulk-high-priority').onclick = () => {
    bulkSetPriority('high');
    hideModal(bulkModal);
    document.body.removeChild(bulkModal);
  };
  
  bulkModal.querySelector('#bulk-cancel').onclick = () => {
    hideModal(bulkModal);
    document.body.removeChild(bulkModal);
  };
}

function bulkCompleteAllTasks() {
  const tasks = getFilteredAndSortedTasks();
  tasks.forEach(task => {
    if (!task.completed) {
      toggleTaskById(task.created);
    }
  });
}

function bulkDeleteAllTasks() {
  const tasks = getFilteredAndSortedTasks();
  tasks.forEach(task => {
    deleteTaskById(task.created);
  });
}

function bulkSetPriority(priority) {
  const tasks = getFilteredAndSortedTasks();
  tasks.forEach(task => {
    const taskIdx = lists[currentList].tasks.findIndex(t => t.created === task.created);
    if (taskIdx !== -1) {
      lists[currentList].tasks[taskIdx].priority = priority;
    }
  });
  renderTasks();
}

function exportTasks() {
  const tasks = lists[currentList].tasks;
  const exportData = {
    listName: lists[currentList].name,
    tasks: tasks,
    exportDate: new Date().toISOString(),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskmaster-${lists[currentList].name}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// --- Ustawienia ---
openSettingsBtn.onclick = () => {
  themeSelect.value = settings.theme;
  sortSelect.value = settings.sort;
  langSelect.value = lang;
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
  [editModal, settingsModal, commentsModal].forEach(hideModal);
  editingTaskId = null;
  activeCommentsTaskId = null;
};
window.onkeydown = (e) => {
  if (e.key === "Escape") {
    [editModal, settingsModal, commentsModal].forEach(hideModal);
    editingTaskId = null;
    activeCommentsTaskId = null;
  }
};

// --- Utils ---
function escapeHtml(text) {
  return text ? text.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m];
  }) : '';
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
    case "high": return LANGUAGES[lang].priority_high;
    case "normal": return LANGUAGES[lang].priority_normal;
    case "low": return LANGUAGES[lang].priority_low;
    default: return LANGUAGES[lang].priority_normal;
  }
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(lang === "pl" ? 'pl-PL' : 'en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

// --- LocalStorage ---
function saveLocal() {
  localStorage.setItem('taskManagerLists', JSON.stringify(lists));
  localStorage.setItem('taskManagerCurrentList', currentList);
  localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
  localStorage.setItem('taskManagerLang', lang);
}
function loadLocal() {
  const l = localStorage.getItem('taskManagerLists');
  const s = localStorage.getItem('taskManagerSettings');
  const cl = localStorage.getItem('taskManagerCurrentList');
  const lng = localStorage.getItem('taskManagerLang');
  if (l) lists = JSON.parse(l);
  if (cl) currentList = Number(cl);
  if (s) settings = { ...settings, ...JSON.parse(s) };
  if (lng) lang = lng;
}
