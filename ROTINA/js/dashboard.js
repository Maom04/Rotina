/**
 * dashboard.js — Dashboard page orchestration
 */

const Dashboard = (() => {

  let refreshInterval = null;

  function render() {
    const settings = Storage.getSettings();
    const greeting = Utils.getGreeting();
    const todayTasks = Tasks.getTodayTasks();
    const overdueTask = Tasks.getFiltered('overdue')[0];

    const content = `
      <div class="page-content dashboard-grid">

        <!-- Header -->
        <header class="dash-header">
          <div>
            <h1 class="dash-greeting">${greeting}, ${Utils.escapeHtml(settings.userName)} 👋</h1>
            <p class="dash-date">${Utils.formatDate()}</p>
            <p class="dash-phrase">"${Utils.escapeHtml(settings.focusPhrase)}"</p>
          </div>
          <div class="dash-header-actions">
            <button class="btn btn-sm btn-ghost" id="focus-mode-btn" aria-label="Entrar no modo foco">
              🎯 Modo Foco
            </button>
          </div>
        </header>

        ${overdueTask ? `
        <div class="alert alert-warning">
          <span>⚠️ <strong>Atenção</strong> — "${Utils.escapeHtml(overdueTask.title)}" está atrasado!</span>
        </div>` : ''}

        <!-- Row 1: AGORA + PRÓXIMA -->
        <div class="dash-row-2" id="now-section">
          ${Schedule.renderNowCard()}
          ${Schedule.renderNextCard()}
        </div>

        <!-- Row 2: TAREFAS DE HOJE + PRÓXIMOS PRAZOS -->
        <div class="dash-row-2" id="tasks-deadlines-section">
          ${renderTodayTasksCard(todayTasks)}
          <div id="deadlines-container">${Tasks.renderDeadlinesCard()}</div>
        </div>

        <!-- Row 3: CARGA DA SEMANA + TIMELINE -->
        <div class="dash-row-2" id="week-timeline-section">
          <div id="workload-container">${Workload.renderWorkloadCard()}</div>
          <div id="timeline-container">${Schedule.renderTodayTimeline()}</div>
        </div>

      </div>`;

    const view = document.getElementById('app-view');
    if (view) view.innerHTML = content;

    bindEvents();
    startAutoRefresh();
  }

  function renderTodayTasksCard(tasks) {
    const stats = Tasks.getStats();
    const tasksHtml = tasks.length === 0
      ? `<p class="empty-state">Nenhuma tarefa para hoje. 🎉</p>`
      : tasks.map(t => Tasks.renderTaskCard(t)).join('');

    return `
      <div class="card tasks-today-card">
        <div class="card-label-row">
          <div class="card-label">TAREFAS DE HOJE</div>
          <span class="card-badge">${stats.todayDone}/${stats.todayTotal}</span>
        </div>
        <div id="today-tasks-list">
          ${tasksHtml}
        </div>
        <button class="btn btn-sm btn-ghost" data-action="new-task" style="margin-top:8px">+ Nova tarefa</button>
      </div>`;
  }

  function bindEvents() {
    const view = document.getElementById('app-view');
    if (!view) return;

    // Task actions (toggle, edit, delete)
    view.addEventListener('click', handleTaskAction);

    // Focus mode
    const focusBtn = document.getElementById('focus-mode-btn');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        Timer.toggleFocusMode();
        focusBtn.textContent = Timer.isFocusMode() ? '✕ Sair do foco' : '🎯 Modo Foco';
      });
    }

    // Deadline items → open task
    view.querySelectorAll('.deadline-item').forEach(item => {
      item.addEventListener('click', () => {
        Router.navigate('tarefas');
      });
    });
  }

  function handleTaskAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'toggle') {
      Tasks.toggleDone(id);
      refreshTodayTasks();
    } else if (action === 'edit') {
      openTaskModal(Storage.getTask(id));
    } else if (action === 'delete') {
      if (confirm('Excluir esta tarefa?')) {
        Tasks.deleteTask(id);
        refreshTodayTasks();
      }
    } else if (action === 'new-task') {
      openTaskModal(null);
    }
  }

  function refreshTodayTasks() {
    const list = document.getElementById('today-tasks-list');
    if (!list) return;
    const tasks = Tasks.getTodayTasks();
    list.innerHTML = tasks.length === 0
      ? `<p class="empty-state">Nenhuma tarefa para hoje. 🎉</p>`
      : tasks.map(t => Tasks.renderTaskCard(t)).join('');
    list.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'toggle') { Tasks.toggleDone(id); refreshTodayTasks(); }
      else if (action === 'edit') openTaskModal(Storage.getTask(id));
      else if (action === 'delete') { if (confirm('Excluir esta tarefa?')) { Tasks.deleteTask(id); refreshTodayTasks(); } }
    }));
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    // Refresh "Now" card every minute
    refreshInterval = setInterval(() => {
      const nowSection = document.getElementById('now-section');
      if (nowSection) {
        nowSection.innerHTML = Schedule.renderNowCard() + Schedule.renderNextCard();
      }
    }, 60000);
  }

  function openTaskModal(task) {
    TaskModal.open(task, () => {
      refreshTodayTasks();
      const deadlinesContainer = document.getElementById('deadlines-container');
      if (deadlinesContainer) {
        deadlinesContainer.innerHTML = Tasks.renderDeadlinesCard();
      }
      const workloadContainer = document.getElementById('workload-container');
      if (workloadContainer) {
        workloadContainer.innerHTML = Workload.renderWorkloadCard();
      }
    });
  }

  function destroy() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  }

  return { render, destroy };
})();

// ── Task Modal (shared across pages) ──────────────────────────────────
const TaskModal = (() => {
  let onSaveCallback = null;

  function open(task, onSave) {
    onSaveCallback = onSave;
    const isEdit = !!task;
    const modal = document.getElementById('modal-overlay');
    if (!modal) return;

    const categoryOptions = TASK_CATEGORIES.map(c =>
      `<option value="${c.id}" ${task && task.category === c.id ? 'selected' : ''}>${c.emoji} ${c.label}</option>`
    ).join('');

    const priorityOptions = TASK_PRIORITIES.map(p =>
      `<option value="${p.id}" ${task && task.priority === p.id ? 'selected' : !task && p.id === 'medium' ? 'selected' : ''}>${p.emoji} ${p.label}</option>`
    ).join('');

    const statusOptions = TASK_STATUSES.map(s =>
      `<option value="${s.id}" ${task && task.status === s.id ? 'selected' : !task && s.id === 'todo' ? 'selected' : ''}>${s.label}</option>`
    ).join('');

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>${isEdit ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button class="btn-icon modal-close" id="modal-close-btn" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="task-title">Título *</label>
            <input type="text" id="task-title" class="input" value="${task ? Utils.escapeHtml(task.title) : ''}" placeholder="Título da tarefa" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="task-desc">Descrição</label>
            <textarea id="task-desc" class="input" rows="2" placeholder="Descrição opcional">${task ? Utils.escapeHtml(task.description) : ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="task-category">Categoria</label>
              <select id="task-category" class="input">${categoryOptions}</select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-priority">Prioridade</label>
              <select id="task-priority" class="input">${priorityOptions}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="task-status">Status</label>
              <select id="task-status" class="input">${statusOptions}</select>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-estimated">Tempo estimado (min)</label>
              <input type="number" id="task-estimated" class="input" value="${task ? task.estimatedTime : ''}" placeholder="Ex: 60">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="task-date">Data</label>
              <input type="date" id="task-date" class="input" value="${task ? task.date : Utils.todayISO()}">
            </div>
            <div class="form-group">
              <label class="form-label" for="task-deadline">Prazo</label>
              <input type="date" id="task-deadline" class="input" value="${task ? task.deadline : ''}">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
          <button class="btn btn-primary" id="modal-save-btn">${isEdit ? 'Salvar alterações' : 'Criar tarefa'}</button>
        </div>
      </div>`;

    modal.style.display = 'flex';

    document.getElementById('modal-close-btn').addEventListener('click', close);
    document.getElementById('modal-cancel-btn').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    document.getElementById('modal-save-btn').addEventListener('click', () => {
      const title = document.getElementById('task-title').value.trim();
      if (!title) { document.getElementById('task-title').focus(); return; }

      const data = {
        title,
        description: document.getElementById('task-desc').value.trim(),
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        date: document.getElementById('task-date').value || Utils.todayISO(),
        deadline: document.getElementById('task-deadline').value,
        estimatedTime: document.getElementById('task-estimated').value,
      };

      if (task) Tasks.updateTask(task.id, data);
      else Tasks.createTask(data);

      close();
      if (onSaveCallback) onSaveCallback();
    });
  }

  function close() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
  }

  return { open, close };
})();
