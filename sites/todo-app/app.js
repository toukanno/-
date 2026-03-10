(() => {
  "use strict";

  // ===== State =====
  const STORAGE_KEY = "todo-app-data";
  const THEME_KEY = "todo-app-theme";
  let todos = [];
  let currentFilter = "all";
  let searchQuery = "";
  let dragSrcIndex = null;

  // ===== DOM Elements =====
  const $ = (sel) => document.querySelector(sel);
  const todoForm = $("#todo-form");
  const todoInput = $("#todo-input");
  const prioritySelect = $("#priority-select");
  const dueDateInput = $("#due-date-input");
  const categoryInput = $("#category-input");
  const todoList = $("#todo-list");
  const emptyState = $("#empty-state");
  const todoCount = $("#todo-count");
  const clearCompletedBtn = $("#clear-completed");
  const searchInput = $("#search-input");
  const darkModeToggle = $("#dark-mode-toggle");
  const editModal = $("#edit-modal");
  const editForm = $("#edit-form");
  const editId = $("#edit-id");
  const editText = $("#edit-text");
  const editPriority = $("#edit-priority");
  const editDue = $("#edit-due");
  const editCategory = $("#edit-category");
  const editCancel = $("#edit-cancel");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // ===== Persistence =====
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) todos = JSON.parse(data);
    } catch {
      todos = [];
    }
  }

  // ===== Theme =====
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(THEME_KEY, "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem(THEME_KEY, "dark");
    }
  }

  // ===== Helpers =====
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function priorityClass(p) {
    if (p === "高") return "high";
    if (p === "低") return "low";
    return "mid";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + "T00:00:00") < today;
  }

  // ===== Filtering =====
  function getFilteredTodos() {
    return todos.filter((t) => {
      // Status filter
      if (currentFilter === "active" && t.completed) return false;
      if (currentFilter === "completed" && !t.completed) return false;
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inText = t.text.toLowerCase().includes(q);
        const inCat = t.category && t.category.toLowerCase().includes(q);
        if (!inText && !inCat) return false;
      }
      return true;
    });
  }

  // ===== Rendering =====
  function render() {
    const filtered = getFilteredTodos();

    todoList.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.classList.add("visible");
    } else {
      emptyState.classList.remove("visible");
      filtered.forEach((todo, idx) => {
        todoList.appendChild(createTodoEl(todo, idx));
      });
    }

    // Count
    const activeCount = todos.filter((t) => !t.completed).length;
    todoCount.textContent = `${activeCount} 件の未完了タスク`;

    // Show/hide clear button
    const hasCompleted = todos.some((t) => t.completed);
    clearCompletedBtn.style.display = hasCompleted ? "inline-block" : "none";
  }

  function createTodoEl(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.draggable = true;
    li.dataset.id = todo.id;

    // Checkbox
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "todo-checkbox";
    cb.checked = todo.completed;
    cb.addEventListener("change", () => toggleComplete(todo.id));

    // Content
    const content = document.createElement("div");
    content.className = "todo-content";

    const textEl = document.createElement("div");
    textEl.className = "todo-text";
    textEl.textContent = todo.text;
    content.appendChild(textEl);

    // Meta tags
    const meta = document.createElement("div");
    meta.className = "todo-meta";

    // Priority tag
    const prioTag = document.createElement("span");
    prioTag.className = `todo-tag tag-priority ${priorityClass(todo.priority)}`;
    prioTag.textContent = todo.priority;
    meta.appendChild(prioTag);

    // Due date tag
    if (todo.dueDate) {
      const dueTag = document.createElement("span");
      const overdue = isOverdue(todo.dueDate) && !todo.completed;
      dueTag.className = `todo-tag tag-due${overdue ? " overdue" : ""}`;
      dueTag.textContent = formatDate(todo.dueDate);
      meta.appendChild(dueTag);
    }

    // Category tag
    if (todo.category) {
      const catTag = document.createElement("span");
      catTag.className = "todo-tag tag-category";
      catTag.textContent = todo.category;
      meta.appendChild(catTag);
    }

    content.appendChild(meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.innerHTML = "&#9998;";
    editBtn.title = "編集";
    editBtn.addEventListener("click", () => openEditModal(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon btn-delete";
    deleteBtn.innerHTML = "&#10005;";
    deleteBtn.title = "削除";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id, li));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(cb);
    li.appendChild(content);
    li.appendChild(actions);

    // Drag events
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("dragenter", handleDragEnter);
    li.addEventListener("dragleave", handleDragLeave);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    return li;
  }

  // ===== CRUD =====
  function addTodo(text, priority, dueDate, category) {
    const todo = {
      id: generateId(),
      text: text.trim(),
      priority,
      dueDate: dueDate || "",
      category: category.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    todos.unshift(todo);
    save();
    render();
  }

  function toggleComplete(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      save();
      render();
    }
  }

  function deleteTodo(id, el) {
    if (el) {
      el.classList.add("removing");
      el.addEventListener("animationend", () => {
        todos = todos.filter((t) => t.id !== id);
        save();
        render();
      });
    } else {
      todos = todos.filter((t) => t.id !== id);
      save();
      render();
    }
  }

  function updateTodo(id, data) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      Object.assign(todo, data);
      save();
      render();
    }
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    save();
    render();
  }

  // ===== Edit Modal =====
  function openEditModal(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    editId.value = todo.id;
    editText.value = todo.text;
    editPriority.value = todo.priority;
    editDue.value = todo.dueDate;
    editCategory.value = todo.category;
    editModal.classList.add("open");
    editText.focus();
  }

  function closeEditModal() {
    editModal.classList.remove("open");
  }

  // ===== Drag & Drop =====
  function handleDragStart(e) {
    const id = this.dataset.id;
    dragSrcIndex = todos.findIndex((t) => t.id === id);
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add("drag-over");
  }

  function handleDragLeave() {
    this.classList.remove("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    const targetId = this.dataset.id;
    const targetIndex = todos.findIndex((t) => t.id === targetId);
    if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
      const [moved] = todos.splice(dragSrcIndex, 1);
      todos.splice(targetIndex, 0, moved);
      save();
      render();
    }
  }

  function handleDragEnd() {
    this.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    dragSrcIndex = null;
  }

  // ===== Event Listeners =====
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    addTodo(text, prioritySelect.value, dueDateInput.value, categoryInput.value);
    todoInput.value = "";
    dueDateInput.value = "";
    categoryInput.value = "";
    prioritySelect.value = "中";
    todoInput.focus();
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    render();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);
  darkModeToggle.addEventListener("click", toggleTheme);

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = editText.value.trim();
    if (!text) return;
    updateTodo(editId.value, {
      text,
      priority: editPriority.value,
      dueDate: editDue.value,
      category: editCategory.value.trim(),
    });
    closeEditModal();
  });

  editCancel.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editModal.classList.contains("open")) {
      closeEditModal();
    }
  });

  // ===== Init =====
  initTheme();
  load();
  render();
})();
