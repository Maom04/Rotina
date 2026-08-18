/**
 * tasks.js — Task CRUD and filtering
 */

const Tasks = (() => {

  function createTask(data) {
    const task = {
      id: Utils.generateId(),
      title: data.title || 'Nova tarefa',
      description: data.description || '',
      category: data.category || 'personal',
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      date: data.date || Utils.todayISO(),
      deadline: data.deadline || '',
      estimatedTime: data.estimatedTime || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Storage.upsertTask(task);
  }

  function updateTask(id, changes) {
    const task = Storage.getTask(id);
    if (!task) return null;
    const updated = { ...task, ...changes, updatedAt: new Date().toISOString() };
    return Storage.upsertTask(updated);
  }

  function deleteTask(id) {
    Storage.deleteTask(id);
  }

  function toggleDone(id) {
    const task = Storage.getTask(id);
    if (!task) return null;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    return updateTask(id, { status: newStatus });
  }

  function getAll() {
    return Storage.getTasks();
  }

  function getFiltered(filter) {
    const tasks = getAll();
    const today = Utils.todayISO();
    const tomorrow = Utils.tomorrowISO();

    switch (filter) {
      case 'today':
        return tasks.filter(t => t.date === today && t.status !== 'done');
      case 'tomorrow':
        return tasks.filter(t => t.date === tomorrow);
      case 'week':
        return tasks.filter(t => Utils.isThisWeek(t.date || t.deadline || today));
      case 'next7':
        return tasks.filter(t => Utils.isNextSevenDays(t.date || today));
      case 'overdue':
        return tasks.filter(t => {
          const d = t.deadline || t.date;
          return d && Utils.isPast(d) && t.status !== 'done';
        });
      case 'done':
        return tasks.filter(t => t.status === 'done');
      default:
        return tasks;
    }
  }

  function getTodayTasks() {
    return getFiltered('today').sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    });
  }

  function getUpcomingDeadlines(limit = 5) {
    const today = Utils.todayISO();
    return getAll()
      .filter(t => t.deadline && t.status !== 'done')
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, limit);
  }

  function getStats() {
    const all = getAll();
    const today = Utils.todayISO();
    return {
      total: all.length,
      done: all.filter(t => t.status === 'done').length,
      pending: all.filter(t => t.status !== 'done').length,
      overdue: all.filter(t => {
        const d = t.deadline || t.date;
        return d && Utils.isPast(d) && t.status !== 'done';
      }).length,
      todayTotal: all.filter(t => t.date === today).length,
      todayDone: all.filter(t => t.date === today && t.status === 'done').length,
    };
  }

  function getCategoryEmoji(catId) {
    const cat = TASK_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.emoji : '📋';
  }

  function getCategoryLabel(catId) {
    const cat = TASK_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label : catId;
  }

  function renderTaskCard(task, opts = {}) {
    const isDone = task.status === 'done';
    const isOverdue = task.deadline && Utils.isPast(task.deadline) && !isDone;
    const priorityEmoji = Utils.getPriorityEmoji(task.priority);
    const catEmoji = getCategoryEmoji(task.category);
    const catLabel = getCategoryLabel(task.category);

    return `
      <div class="task-card${isDone ? ' task-done' : ''}${isOverdue ? ' task-overdue' : ''}" data-task-id="${task.id}">
        <button class="task-check${isDone ? ' checked' : ''}" data-action="toggle" data-id="${task.id}" aria-label="${isDone ? 'Marcar como pendente' : 'Concluir tarefa'}">
          ${isDone ? '✓' : ''}
        </button>
        <div class="task-body">
          <div class="task-title">${Utils.escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${Utils.escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="task-cat">${catEmoji} ${catLabel}</span>
            <span class="task-priority">${priorityEmoji} ${Utils.getPriorityLabel(task.priority)}</span>
            ${task.deadline ? `<span class="task-deadline${isOverdue ? ' overdue' : ''}">${isOverdue ? '⚠️ Atrasado' : '📅 ' + Utils.formatShortDate(task.deadline)}</span>` : ''}
          </div>
        </div>
        ${opts.showActions !== false ? `
        <div class="task-actions">
          <button class="btn-icon" data-action="edit" data-id="${task.id}" aria-label="Editar tarefa">✏️</button>
          <button class="btn-icon" data-action="delete" data-id="${task.id}" aria-label="Excluir tarefa">🗑️</button>
        </div>` : ''}
      </div>`;
  }

  function renderDeadlinesCard() {
    const deadlines = getUpcomingDeadlines(6);

    if (deadlines.length === 0) {
      return `
        <div class="card deadlines-card">
          <div class="card-label">PRÓXIMOS PRAZOS</div>
          <p class="empty-state">Nenhum prazo cadastrado.</p>
          <button class="btn btn-sm btn-ghost" data-action="new-task">+ Adicionar tarefa</button>
        </div>`;
    }

    const items = deadlines.map(t => {
      const days = Utils.daysUntil(t.deadline);
      const isOverdue = days < 0;
      const isUrgent = days <= 2 && !isOverdue;
      const isSoon = days <= 5 && !isOverdue;
      const dot = isOverdue ? '🔴' : isUrgent ? '🟠' : isSoon ? '🟡' : '🟢';
      const dateText = isOverdue ? '⚠️ ATRASADO' : Utils.formatShortDate(t.deadline);

      return `
        <div class="deadline-item${isOverdue ? ' overdue' : ''}" data-task-id="${t.id}">
          <span class="deadline-dot">${dot}</span>
          <div class="deadline-body">
            <div class="deadline-date">${dateText}</div>
            <div class="deadline-title">${Utils.escapeHtml(t.title)}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="card deadlines-card">
        <div class="card-label">PRÓXIMOS PRAZOS</div>
        <div class="deadlines-list">${items}</div>
      </div>`;
  }

  return {
    createTask, updateTask, deleteTask, toggleDone,
    getAll, getFiltered, getTodayTasks, getUpcomingDeadlines,
    getStats, getCategoryEmoji, getCategoryLabel,
    renderTaskCard, renderDeadlinesCard,
  };
})();
