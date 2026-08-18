/**
 * studies.js — Study areas and sessions
 */

const Studies = (() => {

  function getAreas() {
    return Storage.getStudyAreas();
  }

  function getSessions() {
    return Storage.getStudySessions();
  }

  function updateArea(id, changes) {
    const areas = getAreas();
    const idx = areas.findIndex(a => a.id === id);
    if (idx < 0) return null;
    areas[idx] = { ...areas[idx], ...changes };
    Storage.saveStudyAreas(areas);
    return areas[idx];
  }

  function addSession(data) {
    const session = {
      id: Utils.generateId(),
      areaId: data.areaId,
      content: data.content || '',
      date: data.date || Utils.todayISO(),
      duration: parseInt(data.duration, 10) || 0,
      observation: data.observation || '',
      createdAt: new Date().toISOString(),
    };

    Storage.addStudySession(session);

    // Update area hours and contents
    const areas = getAreas();
    const areaIdx = areas.findIndex(a => a.id === data.areaId);
    if (areaIdx >= 0) {
      const area = areas[areaIdx];
      area.hoursStudied = (area.hoursStudied || 0) + (session.duration / 60);
      area.hoursStudied = Math.round(area.hoursStudied * 10) / 10;
      if (session.content && !area.contents.includes(session.content)) {
        area.contents.push(session.content);
      }
      Storage.saveStudyAreas(areas);
    }

    return session;
  }

  function deleteSession(id) {
    Storage.deleteStudySession(id);
  }

  function getSessionsByArea(areaId) {
    return getSessions().filter(s => s.areaId === areaId);
  }

  function getWeekSessions() {
    return getSessions().filter(s => Utils.isThisWeek(s.date));
  }

  function getTotalHoursThisWeek() {
    return getWeekSessions().reduce((acc, s) => acc + (s.duration / 60), 0);
  }

  function renderAreaCard(area) {
    const progress = Math.min(100, Math.max(0, area.progress || 0));
    const contents = Array.isArray(area.contents) ? area.contents.slice(-3) : [];

    const contentsHtml = contents.length > 0
      ? `<div class="study-contents">
           ${contents.map(c => `<span class="content-badge">${Utils.escapeHtml(c)}</span>`).join('')}
         </div>`
      : '';

    return `
      <div class="study-card" data-area-id="${area.id}">
        <div class="study-header">
          <span class="study-emoji">${area.emoji}</span>
          <div>
            <h3 class="study-title">${Utils.escapeHtml(area.title)}</h3>
            <span class="study-hours">${area.hoursStudied || 0}h estudadas</span>
          </div>
        </div>

        <div class="study-progress">
          <div class="progress-label">
            <span>Progresso</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
          </div>
        </div>

        ${contentsHtml}

        ${area.nextTopic ? `<div class="study-next"><span class="study-next-label">Próximo:</span> ${Utils.escapeHtml(area.nextTopic)}</div>` : ''}

        <div class="study-actions">
          <button class="btn btn-sm btn-primary" data-action="log-session" data-area-id="${area.id}">+ Registrar sessão</button>
          <button class="btn btn-sm btn-ghost" data-action="edit-area" data-area-id="${area.id}">Editar</button>
        </div>
      </div>`;
  }

  function renderSessionRow(session) {
    const area = getAreas().find(a => a.id === session.areaId);
    return `
      <div class="session-row" data-session-id="${session.id}">
        <div class="session-area">${area ? area.emoji + ' ' + area.title : session.areaId}</div>
        <div class="session-content">${Utils.escapeHtml(session.content || '—')}</div>
        <div class="session-meta">
          <span>${Utils.formatShortDate(session.date)}</span>
          <span>${Utils.formatDuration(session.duration)}</span>
        </div>
        <button class="btn-icon" data-action="delete-session" data-id="${session.id}" aria-label="Excluir sessão">🗑️</button>
      </div>`;
  }

  return {
    getAreas, getSessions, updateArea, addSession, deleteSession,
    getSessionsByArea, getWeekSessions, getTotalHoursThisWeek,
    renderAreaCard, renderSessionRow,
  };
})();
