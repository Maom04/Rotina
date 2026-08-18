/**
 * storage.js — LocalStorage persistence layer
 */

const Storage = (() => {
  const KEYS = {
    SETTINGS: 'da_settings',
    SCHEDULE: 'da_schedule',
    TASKS: 'da_tasks',
    PROJECTS: 'da_projects',
    STUDIES: 'da_studies',
    STUDY_SESSIONS: 'da_study_sessions',
    UNIVERSITIES: 'da_universities',
    FOCUS_SESSIONS: 'da_focus_sessions',
  };

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('Storage.get error:', key, e);
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage.set error:', key, e);
    }
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  // ── Settings ──────────────────────────────────────────────────────
  function getSettings() {
    return get(KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
  }

  function saveSettings(settings) {
    set(KEYS.SETTINGS, settings);
  }

  // ── Schedule ──────────────────────────────────────────────────────
  function getSchedule() {
    const stored = get(KEYS.SCHEDULE, null);
    if (stored) return stored;
    // First run: seed default schedule
    set(KEYS.SCHEDULE, DEFAULT_SCHEDULE);
    return DEFAULT_SCHEDULE;
  }

  function saveSchedule(schedule) {
    set(KEYS.SCHEDULE, schedule);
  }

  // ── Tasks ─────────────────────────────────────────────────────────
  function getTasks() {
    return get(KEYS.TASKS, []);
  }

  function saveTasks(tasks) {
    set(KEYS.TASKS, tasks);
  }

  function getTask(id) {
    return getTasks().find(t => t.id === id) || null;
  }

  function upsertTask(task) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.unshift(task);
    saveTasks(tasks);
    return task;
  }

  function deleteTask(id) {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
  }

  // ── Projects ──────────────────────────────────────────────────────
  function getProjects() {
    return get(KEYS.PROJECTS, []);
  }

  function saveProjects(projects) {
    set(KEYS.PROJECTS, projects);
  }

  function upsertProject(project) {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.unshift(project);
    saveProjects(projects);
    return project;
  }

  function deleteProject(id) {
    saveProjects(getProjects().filter(p => p.id !== id));
  }

  // ── Study Areas ───────────────────────────────────────────────────
  function getStudyAreas() {
    const stored = get(KEYS.STUDIES, null);
    if (stored) return stored;
    set(KEYS.STUDIES, DEFAULT_STUDY_AREAS);
    return DEFAULT_STUDY_AREAS;
  }

  function saveStudyAreas(areas) {
    set(KEYS.STUDIES, areas);
  }

  function getStudySessions() {
    return get(KEYS.STUDY_SESSIONS, []);
  }

  function addStudySession(session) {
    const sessions = getStudySessions();
    sessions.unshift(session);
    set(KEYS.STUDY_SESSIONS, sessions);
    return session;
  }

  function deleteStudySession(id) {
    set(KEYS.STUDY_SESSIONS, getStudySessions().filter(s => s.id !== id));
  }

  // ── Universities / Disciplines ────────────────────────────────────
  function getUniversities() {
    const stored = get(KEYS.UNIVERSITIES, null);
    if (stored) return stored;
    set(KEYS.UNIVERSITIES, DEFAULT_UNIVERSITIES);
    return DEFAULT_UNIVERSITIES;
  }

  function saveUniversities(unis) {
    set(KEYS.UNIVERSITIES, unis);
  }

  // ── Focus Sessions ────────────────────────────────────────────────
  function getFocusSessions() {
    return get(KEYS.FOCUS_SESSIONS, []);
  }

  function addFocusSession(session) {
    const sessions = getFocusSessions();
    sessions.unshift(session);
    set(KEYS.FOCUS_SESSIONS, sessions);
  }

  // ── Export / Import ───────────────────────────────────────────────
  function exportAll() {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      settings: getSettings(),
      schedule: getSchedule(),
      tasks: getTasks(),
      projects: getProjects(),
      studyAreas: getStudyAreas(),
      studySessions: getStudySessions(),
      universities: getUniversities(),
      focusSessions: getFocusSessions(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importAll(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Arquivo inválido');
    }
    const hasKnownKeys = ['settings', 'schedule', 'tasks', 'projects', 'studyAreas', 'studySessions', 'universities', 'focusSessions']
      .some(k => k in data);
    if (!hasKnownKeys && !data.version) {
      throw new Error('Arquivo inválido');
    }
    if (data.settings && typeof data.settings === 'object') saveSettings(data.settings);
    if (data.schedule && typeof data.schedule === 'object') saveSchedule(data.schedule);
    if (data.tasks && Array.isArray(data.tasks)) saveTasks(data.tasks);
    if (data.projects && Array.isArray(data.projects)) saveProjects(data.projects);
    if (data.studyAreas && Array.isArray(data.studyAreas)) saveStudyAreas(data.studyAreas);
    if (data.studySessions && Array.isArray(data.studySessions)) set(KEYS.STUDY_SESSIONS, data.studySessions);
    if (data.universities && Array.isArray(data.universities)) saveUniversities(data.universities);
    if (data.focusSessions && Array.isArray(data.focusSessions)) set(KEYS.FOCUS_SESSIONS, data.focusSessions);
  }

  function clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  return {
    KEYS, get, set, remove,
    getSettings, saveSettings,
    getSchedule, saveSchedule,
    getTasks, saveTasks, getTask, upsertTask, deleteTask,
    getProjects, saveProjects, upsertProject, deleteProject,
    getStudyAreas, saveStudyAreas, getStudySessions, addStudySession, deleteStudySession,
    getUniversities, saveUniversities,
    getFocusSessions, addFocusSession,
    exportAll, importAll, clearAll,
  };
})();
