/**
 * app.js — Application init, routing, and page renderers
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRoutes();
  Router.init();
  initTimer();
  registerServiceWorker();
});

// ── Theme ──────────────────────────────────────────────────────────────
function initTheme() {
  const settings = Storage.getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
}

// ── Service Worker ─────────────────────────────────────────────────────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// ── Timer widget init ──────────────────────────────────────────────────
function initTimer() {
  Timer.renderTimer();

  const toggleBtn = document.getElementById('timer-toggle-btn');
  const timerPanel = document.getElementById('timer-panel');
  if (toggleBtn && timerPanel) {
    toggleBtn.addEventListener('click', () => {
      const open = timerPanel.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', open);
      toggleBtn.setAttribute('aria-label', open ? 'Fechar cronômetro' : 'Abrir cronômetro de foco');
    });
  }
}

// ── Routes ─────────────────────────────────────────────────────────────
function initRoutes() {
  Router.register('dashboard', () => {
    Dashboard.render();
  });

  Router.register('rotina', () => {
    renderRotina();
  });

  Router.register('tarefas', () => {
    renderTarefas();
  });

  Router.register('projetos', () => {
    renderProjetos();
  });

  Router.register('estudos', () => {
    renderEstudos();
  });

  Router.register('disciplinas', () => {
    renderDisciplinas();
  });

  Router.register('configuracoes', () => {
    renderConfiguracoes();
  });
}

// ── Page: Rotina ────────────────────────────────────────────────────────
function renderRotina() {
  const view = document.getElementById('app-view');
  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Rotina Semanal</h1>
        <p class="page-subtitle">Sua programação de segunda a domingo</p>
      </div>
      <div class="schedule-grid">
        ${Schedule.renderWeekSchedule()}
      </div>
      <div class="method-section">
        <h2 class="section-title">Método de Estudo</h2>
        <div class="method-grid">
          ${renderMethodCard('Sessão Técnica', '1h30', [
            { time: '10 min', label: 'Revisão ativa' },
            { time: '50 min', label: 'Conteúdo novo' },
            { time: '10 min', label: 'Intervalo' },
            { time: '20 min', label: 'Prática' },
          ])}
          ${renderMethodCard('Sessão Faculdade', '2h', [
            { time: '10 min', label: 'Planejamento' },
            { time: '80 min', label: 'Execução' },
            { time: '10 min', label: 'Intervalo' },
            { time: '20 min', label: 'Revisão final' },
          ])}
        </div>
      </div>
      <div class="priority-section">
        <h2 class="section-title">Hierarquia de Prioridade</h2>
        <div class="priority-list card">
          ${renderPriorityList()}
        </div>
        <div class="priority-rules">
          <div class="rule-card">📌 Se houver acúmulo de provas e trabalhos, priorizar as demandas acadêmicas.</div>
          <div class="rule-card">📈 Quando a semana estiver tranquila, aumentar o aprofundamento nos estudos técnicos.</div>
          <div class="rule-card">😴 Nunca transformar descanso e sono em tarefas obrigatórias.</div>
        </div>
      </div>
    </div>`;
}

function renderMethodCard(title, duration, steps) {
  const stepsHtml = steps.map(s => `
    <div class="method-step">
      <span class="method-time">${s.time}</span>
      <span class="method-label">${s.label}</span>
    </div>`).join('');

  return `
    <div class="card method-card">
      <div class="method-header">
        <span class="method-title">${title}</span>
        <span class="method-duration">${duration}</span>
      </div>
      <div class="method-steps">${stepsHtml}</div>
    </div>`;
}

function renderPriorityList() {
  const items = [
    { emoji: '🔴', label: 'Provas próximas' },
    { emoji: '🟠', label: 'Trabalhos com prazo próximo' },
    { emoji: '🟡', label: 'Projetos acadêmicos' },
    { emoji: '🟢', label: 'Exercícios obrigatórios' },
    { emoji: '🔵', label: 'Revisão' },
    { emoji: '💻', label: 'Arquitetura de Software' },
    { emoji: '🧪', label: 'QA & Automação' },
    { emoji: '🐍', label: 'Python' },
    { emoji: '🎨', label: 'Design Systems' },
  ];
  return items.map((item, i) => `
    <div class="priority-item">
      <span class="priority-rank">${i + 1}</span>
      <span class="priority-emoji">${item.emoji}</span>
      <span class="priority-label">${item.label}</span>
    </div>`).join('');
}

// ── Page: Tarefas ────────────────────────────────────────────────────────
function renderTarefas(filter = 'all') {
  const view = document.getElementById('app-view');
  const filters = [
    { id: 'today', label: 'Hoje' },
    { id: 'tomorrow', label: 'Amanhã' },
    { id: 'week', label: 'Esta semana' },
    { id: 'next7', label: 'Próximos 7 dias' },
    { id: 'overdue', label: 'Atrasadas' },
    { id: 'done', label: 'Concluídas' },
    { id: 'all', label: 'Todas' },
  ];

  const filterHtml = filters.map(f =>
    `<button class="filter-btn${f.id === filter ? ' active' : ''}" data-filter="${f.id}">${f.label}</button>`
  ).join('');

  const tasks = Tasks.getFiltered(filter);
  const tasksHtml = tasks.length === 0
    ? `<div class="empty-state-large">
         <span>📭</span>
         <p>Nenhuma tarefa encontrada neste filtro.</p>
       </div>`
    : tasks.map(t => Tasks.renderTaskCard(t)).join('');

  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Tarefas</h1>
        <button class="btn btn-primary" id="new-task-btn">+ Nova tarefa</button>
      </div>
      <div class="filter-bar">${filterHtml}</div>
      <div id="tasks-list" class="tasks-list">${tasksHtml}</div>
    </div>`;

  // Bind filter buttons
  view.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => renderTarefas(btn.dataset.filter));
  });

  // New task button
  document.getElementById('new-task-btn').addEventListener('click', () => {
    TaskModal.open(null, () => renderTarefas(filter));
  });

  // Task action delegation
  const list = document.getElementById('tasks-list');
  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'toggle') { Tasks.toggleDone(id); renderTarefas(filter); }
    else if (action === 'edit') { TaskModal.open(Storage.getTask(id), () => renderTarefas(filter)); }
    else if (action === 'delete') { if (confirm('Excluir esta tarefa?')) { Tasks.deleteTask(id); renderTarefas(filter); } }
  });
}

// ── Page: Projetos ────────────────────────────────────────────────────────
function renderProjetos() {
  const view = document.getElementById('app-view');
  const projects = Projects.getAll();
  const projectsHtml = projects.length === 0
    ? `<div class="empty-state-large"><span>🚀</span><p>Nenhum projeto cadastrado ainda.</p></div>`
    : projects.map(p => Projects.renderProjectCard(p)).join('');

  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Projetos</h1>
        <button class="btn btn-primary" id="new-project-btn">+ Novo projeto</button>
      </div>
      <div id="projects-grid" class="projects-grid">${projectsHtml}</div>
    </div>`;

  document.getElementById('new-project-btn').addEventListener('click', () => {
    openProjectModal(null);
  });

  view.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'edit-project') openProjectModal(Projects.getAll().find(p => p.id === id));
      if (action === 'delete-project') {
        if (confirm('Excluir este projeto?')) { Projects.deleteProject(id); renderProjetos(); }
      }
    });
  });
}

function openProjectModal(project) {
  const isEdit = !!project;
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;

  const areaOptions = PROJECT_AREAS.map(a =>
    `<option value="${a.id}" ${project && project.area === a.id ? 'selected' : ''}>${a.emoji} ${a.label}</option>`
  ).join('');

  const statusOptions = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'todo', label: 'A fazer' },
    { id: 'doing', label: 'Em andamento' },
    { id: 'done', label: 'Concluído' },
    { id: 'paused', label: 'Pausado' },
  ].map(s => `<option value="${s.id}" ${project && project.status === s.id ? 'selected' : !project && s.id === 'doing' ? 'selected' : ''}>${s.label}</option>`).join('');

  const techs = project && project.technologies ? project.technologies.join(', ') : '';

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar projeto' : 'Novo projeto'}</h2>
        <button class="btn-icon modal-close" id="modal-close-btn" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="proj-name">Nome *</label>
          <input type="text" id="proj-name" class="input" value="${project ? Utils.escapeHtml(project.name) : ''}" placeholder="Nome do projeto">
        </div>
        <div class="form-group">
          <label class="form-label" for="proj-desc">Descrição</label>
          <textarea id="proj-desc" class="input" rows="2">${project ? Utils.escapeHtml(project.description) : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="proj-area">Área</label>
            <select id="proj-area" class="input">${areaOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-status">Status</label>
            <select id="proj-status" class="input">${statusOptions}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="proj-deadline">Prazo</label>
            <input type="date" id="proj-deadline" class="input" value="${project ? project.deadline : ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-progress">Progresso (%)</label>
            <input type="number" id="proj-progress" class="input" min="0" max="100" value="${project ? project.progress : '0'}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="proj-techs">Tecnologias (separadas por vírgula)</label>
          <input type="text" id="proj-techs" class="input" value="${Utils.escapeHtml(techs)}" placeholder="Java, Spring Boot, Angular...">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-save-btn">${isEdit ? 'Salvar' : 'Criar'}</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.getElementById('modal-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  document.getElementById('modal-cancel-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const name = document.getElementById('proj-name').value.trim();
    if (!name) return;
    const data = {
      name,
      description: document.getElementById('proj-desc').value.trim(),
      area: document.getElementById('proj-area').value,
      status: document.getElementById('proj-status').value,
      deadline: document.getElementById('proj-deadline').value,
      progress: parseInt(document.getElementById('proj-progress').value, 10) || 0,
      technologies: document.getElementById('proj-techs').value.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (project) Projects.updateProject(project.id, data);
    else Projects.createProject(data);
    modal.style.display = 'none';
    renderProjetos();
  });
}

// ── Page: Estudos ────────────────────────────────────────────────────────
function renderEstudos() {
  const view = document.getElementById('app-view');
  const areas = Studies.getAreas();
  const sessions = Studies.getSessions().slice(0, 10);

  const areasHtml = areas.map(a => Studies.renderAreaCard(a)).join('');
  const sessionsHtml = sessions.length === 0
    ? `<p class="empty-state">Nenhuma sessão registrada.</p>`
    : sessions.map(s => Studies.renderSessionRow(s)).join('');

  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Estudos Técnicos</h1>
      </div>
      <div class="studies-grid">${areasHtml}</div>
      <h2 class="section-title" style="margin-top:32px">Sessões recentes</h2>
      <div class="card sessions-list">${sessionsHtml}</div>
    </div>`;

  view.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    if (action === 'log-session') {
      btn.addEventListener('click', () => openSessionModal(btn.dataset.areaId));
    } else if (action === 'edit-area') {
      btn.addEventListener('click', () => openEditAreaModal(btn.dataset.areaId));
    } else if (action === 'delete-session') {
      btn.addEventListener('click', () => {
        if (confirm('Excluir esta sessão?')) { Studies.deleteSession(btn.dataset.id); renderEstudos(); }
      });
    }
  });
}

function openSessionModal(defaultAreaId) {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;
  const areaOptions = Studies.getAreas().map(a =>
    `<option value="${a.id}" ${a.id === defaultAreaId ? 'selected' : ''}>${a.emoji} ${a.title}</option>`
  ).join('');

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>Registrar sessão de estudo</h2>
        <button class="btn-icon" id="modal-close-btn" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="sess-area">Área</label>
          <select id="sess-area" class="input">${areaOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label" for="sess-content">Conteúdo estudado</label>
          <input type="text" id="sess-content" class="input" placeholder="Ex: Padrões de projeto — Strategy">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="sess-date">Data</label>
            <input type="date" id="sess-date" class="input" value="${Utils.todayISO()}">
          </div>
          <div class="form-group">
            <label class="form-label" for="sess-duration">Duração (min)</label>
            <input type="number" id="sess-duration" class="input" min="1" placeholder="Ex: 90">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="sess-obs">Observação</label>
          <textarea id="sess-obs" class="input" rows="2" placeholder="Observações, dúvidas, próximos passos..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-save-btn">Registrar</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.getElementById('modal-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  document.getElementById('modal-cancel-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const duration = parseInt(document.getElementById('sess-duration').value, 10);
    if (!duration) return;
    Studies.addSession({
      areaId: document.getElementById('sess-area').value,
      content: document.getElementById('sess-content').value.trim(),
      date: document.getElementById('sess-date').value || Utils.todayISO(),
      duration,
      observation: document.getElementById('sess-obs').value.trim(),
    });
    modal.style.display = 'none';
    renderEstudos();
  });
}

function openEditAreaModal(areaId) {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;
  const area = Studies.getAreas().find(a => a.id === areaId);
  if (!area) return;

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${area.emoji} ${Utils.escapeHtml(area.title)}</h2>
        <button class="btn-icon" id="modal-close-btn" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="area-progress">Progresso (%)</label>
          <input type="number" id="area-progress" class="input" min="0" max="100" value="${area.progress || 0}">
        </div>
        <div class="form-group">
          <label class="form-label" for="area-next">Próximo tópico</label>
          <input type="text" id="area-next" class="input" value="${Utils.escapeHtml(area.nextTopic || '')}" placeholder="Ex: Padrão Observer">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-save-btn">Salvar</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.getElementById('modal-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  document.getElementById('modal-cancel-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    Studies.updateArea(areaId, {
      progress: parseInt(document.getElementById('area-progress').value, 10) || 0,
      nextTopic: document.getElementById('area-next').value.trim(),
    });
    modal.style.display = 'none';
    renderEstudos();
  });
}

// ── Page: Disciplinas ────────────────────────────────────────────────────
function renderDisciplinas() {
  const view = document.getElementById('app-view');
  const unis = Disciplines.getUniversities();

  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Disciplinas</h1>
      </div>
      <div class="universities-list">
        ${unis.map(u => Disciplines.renderUniversitySection(u)).join('')}
      </div>
    </div>`;

  view.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    if (action === 'add-discipline') {
      btn.addEventListener('click', () => openDisciplineModal(btn.dataset.uniId, null));
    } else if (action === 'edit-discipline') {
      btn.addEventListener('click', () => {
        const uni = Disciplines.getUniversities().find(u => u.id === btn.dataset.uniId);
        const disc = uni && uni.disciplines.find(d => d.id === btn.dataset.discId);
        if (disc) openDisciplineModal(btn.dataset.uniId, disc);
      });
    } else if (action === 'delete-discipline') {
      btn.addEventListener('click', () => {
        if (confirm('Excluir esta disciplina?')) {
          Disciplines.deleteDiscipline(btn.dataset.uniId, btn.dataset.discId);
          renderDisciplinas();
        }
      });
    }
  });
}

function openDisciplineModal(uniId, disc) {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;
  const isEdit = !!disc;

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar disciplina' : 'Nova disciplina'}</h2>
        <button class="btn-icon" id="modal-close-btn" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="disc-name">Nome *</label>
          <input type="text" id="disc-name" class="input" value="${disc ? Utils.escapeHtml(disc.name) : ''}" placeholder="Ex: Banco de Dados">
        </div>
        <div class="form-group">
          <label class="form-label" for="disc-professor">Professor</label>
          <input type="text" id="disc-professor" class="input" value="${disc ? Utils.escapeHtml(disc.professor) : ''}" placeholder="Nome do professor">
        </div>
        <div class="form-group">
          <label class="form-label" for="disc-schedule">Horário</label>
          <input type="text" id="disc-schedule" class="input" value="${disc ? Utils.escapeHtml(disc.schedule) : ''}" placeholder="Ex: Terça e Quinta, 18h30">
        </div>
        <div class="form-group">
          <label class="form-label" for="disc-obs">Observações</label>
          <textarea id="disc-obs" class="input" rows="2">${disc ? Utils.escapeHtml(disc.observations) : ''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="modal-save-btn">${isEdit ? 'Salvar' : 'Adicionar'}</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.getElementById('modal-close-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  document.getElementById('modal-cancel-btn').addEventListener('click', () => { modal.style.display = 'none'; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const name = document.getElementById('disc-name').value.trim();
    if (!name) return;
    const data = {
      name,
      professor: document.getElementById('disc-professor').value.trim(),
      schedule: document.getElementById('disc-schedule').value.trim(),
      observations: document.getElementById('disc-obs').value.trim(),
    };
    if (disc) Disciplines.updateDiscipline(uniId, disc.id, data);
    else Disciplines.addDiscipline(uniId, data);
    modal.style.display = 'none';
    renderDisciplinas();
  });
}

// ── Page: Configurações ────────────────────────────────────────────────────
function renderConfiguracoes() {
  const view = document.getElementById('app-view');
  const settings = Storage.getSettings();

  view.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Configurações</h1>
      </div>

      <div class="settings-section card">
        <h2 class="settings-section-title">Perfil</h2>
        <div class="form-group">
          <label class="form-label" for="cfg-name">Seu nome</label>
          <input type="text" id="cfg-name" class="input" value="${Utils.escapeHtml(settings.userName)}" placeholder="Seu nome">
        </div>
        <div class="form-group">
          <label class="form-label" for="cfg-phrase">Frase de foco</label>
          <input type="text" id="cfg-phrase" class="input" value="${Utils.escapeHtml(settings.focusPhrase)}" placeholder="Frase motivacional">
        </div>
        <button class="btn btn-primary" id="save-profile-btn">Salvar perfil</button>
      </div>

      <div class="settings-section card">
        <h2 class="settings-section-title">Aparência</h2>
        <div class="theme-toggle-wrap">
          <span>Tema</span>
          <div class="theme-options">
            <button class="btn btn-sm${settings.theme === 'dark' ? ' btn-primary' : ' btn-ghost'}" data-theme="dark">🌙 Escuro</button>
            <button class="btn btn-sm${settings.theme === 'light' ? ' btn-primary' : ' btn-ghost'}" data-theme="light">☀️ Claro</button>
          </div>
        </div>
      </div>

      <div class="settings-section card">
        <h2 class="settings-section-title">Dados</h2>
        <div class="settings-actions">
          <button class="btn btn-ghost" id="export-btn">📤 Exportar dados (JSON)</button>
          <label class="btn btn-ghost" for="import-input" style="cursor:pointer">
            📥 Importar dados (JSON)
            <input type="file" id="import-input" accept=".json" style="display:none">
          </label>
          <button class="btn btn-ghost btn-danger" id="clear-btn">🗑️ Limpar todos os dados</button>
        </div>
      </div>
    </div>`;

  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const name = document.getElementById('cfg-name').value.trim();
    const phrase = document.getElementById('cfg-phrase').value.trim();
    if (name) {
      Storage.saveSettings({ ...settings, userName: name, focusPhrase: phrase || settings.focusPhrase });
      showToast('Perfil salvo!');
    }
  });

  view.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      Storage.saveSettings({ ...Storage.getSettings(), theme });
      document.documentElement.setAttribute('data-theme', theme);
      renderConfiguracoes();
    });
  });

  document.getElementById('export-btn').addEventListener('click', () => Storage.exportAll());

  document.getElementById('import-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        Storage.importAll(data);
        showToast('Dados importados com sucesso.');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        showToast('Não foi possível importar os dados.', 'error');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) {
      Storage.clearAll();
      showToast('Dados apagados.');
      setTimeout(() => location.reload(), 1000);
    }
  });
}

// ── Toast notification ────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type} toast-show`;
  setTimeout(() => toast.classList.remove('toast-show'), 3000);
}
