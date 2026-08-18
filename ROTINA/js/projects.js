/**
 * projects.js — Project management
 */

const Projects = (() => {

  function createProject(data) {
    const project = {
      id: Utils.generateId(),
      name: data.name || 'Novo projeto',
      description: data.description || '',
      area: data.area || 'personal',
      status: data.status || 'doing',
      deadline: data.deadline || '',
      progress: data.progress !== undefined ? data.progress : 0,
      technologies: data.technologies || [],
      taskIds: data.taskIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Storage.upsertProject(project);
  }

  function updateProject(id, changes) {
    const projects = Storage.getProjects();
    const project = projects.find(p => p.id === id);
    if (!project) return null;
    const updated = { ...project, ...changes, updatedAt: new Date().toISOString() };
    return Storage.upsertProject(updated);
  }

  function deleteProject(id) {
    Storage.deleteProject(id);
  }

  function getAll() {
    return Storage.getProjects();
  }

  function getAreaLabel(areaId) {
    const area = PROJECT_AREAS.find(a => a.id === areaId);
    return area ? area.label : areaId;
  }

  function getAreaEmoji(areaId) {
    const area = PROJECT_AREAS.find(a => a.id === areaId);
    return area ? area.emoji : '📋';
  }

  function getStatusLabel(statusId) {
    const map = {
      backlog: 'Backlog',
      todo: 'A fazer',
      doing: 'Em andamento',
      done: 'Concluído',
      paused: 'Pausado',
    };
    return map[statusId] || statusId;
  }

  function renderProjectCard(project) {
    const progress = Math.min(100, Math.max(0, project.progress || 0));
    const daysLeft = project.deadline ? Utils.daysUntil(project.deadline) : null;
    const isOverdue = daysLeft !== null && daysLeft < 0 && project.status !== 'done';
    const techs = Array.isArray(project.technologies)
      ? project.technologies.filter(Boolean)
      : [];

    const deadlineHtml = project.deadline
      ? `<span class="project-deadline${isOverdue ? ' overdue' : ''}">
           ${isOverdue ? '⚠️ Atrasado' : '📅 Prazo: ' + Utils.formatShortDate(project.deadline)}
         </span>`
      : '';

    const techsHtml = techs.length > 0
      ? `<div class="project-techs">${techs.map(t => `<span class="tech-badge">${Utils.escapeHtml(t)}</span>`).join('')}</div>`
      : '';

    return `
      <div class="project-card${project.status === 'done' ? ' project-done' : ''}" data-project-id="${project.id}">
        <div class="project-header">
          <div class="project-info">
            <span class="project-area">${getAreaEmoji(project.area)} ${getAreaLabel(project.area)}</span>
            <h3 class="project-name">${Utils.escapeHtml(project.name)}</h3>
            ${project.description ? `<p class="project-desc">${Utils.escapeHtml(project.description)}</p>` : ''}
          </div>
          <div class="project-actions">
            <button class="btn-icon" data-action="edit-project" data-id="${project.id}" aria-label="Editar projeto">✏️</button>
            <button class="btn-icon" data-action="delete-project" data-id="${project.id}" aria-label="Excluir projeto">🗑️</button>
          </div>
        </div>

        <div class="project-progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill${project.status === 'done' ? ' done' : ''}" style="width:${progress}%"></div>
          </div>
          <span class="progress-pct">${progress}%</span>
        </div>

        ${techsHtml}

        <div class="project-footer">
          <span class="status-badge status-${project.status}">${getStatusLabel(project.status)}</span>
          ${deadlineHtml}
        </div>
      </div>`;
  }

  return {
    createProject, updateProject, deleteProject, getAll,
    getAreaLabel, getAreaEmoji, getStatusLabel, renderProjectCard,
  };
})();
