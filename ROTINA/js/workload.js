/**
 * workload.js — Weekly workload score and indicator
 */

const Workload = (() => {

  function calculateScore() {
    const tasks = Storage.getTasks();
    let score = 0;

    tasks.forEach(t => {
      if (t.status === 'done') return;

      const d = t.deadline || t.date;
      if (!d) { score += 1; return; }

      const days = Utils.daysUntil(d);

      if (days < 0) score += 4;       // overdue
      else if (days === 0) score += 3; // today
      else if (days <= 2) score += 2;  // very soon
      else if (days <= 7) score += 1;  // this week

      if (t.priority === 'urgent') score += 3;
      else if (t.priority === 'high') score += 2;
      else if (t.priority === 'medium') score += 1;
    });

    // Projects bonus
    const projects = Storage.getProjects();
    projects.forEach(p => {
      if (p.status === 'done') return;
      if (p.deadline) {
        const days = Utils.daysUntil(p.deadline);
        if (days < 0) score += 5;
        else if (days <= 3) score += 3;
        else if (days <= 7) score += 2;
        else score += 1;
      }
    });

    return score;
  }

  function getLevel() {
    const score = calculateScore();
    if (score <= 5) return { level: 'light', emoji: '🟢', label: 'Leve', score };
    if (score <= 12) return { level: 'moderate', emoji: '🟡', label: 'Moderada', score };
    if (score <= 20) return { level: 'high', emoji: '🟠', label: 'Alta', score };
    return { level: 'very-high', emoji: '🔴', label: 'Muito alta', score };
  }

  function getRecommendation(level) {
    const map = {
      light: 'Semana equilibrada. Você pode aprofundar seus estudos técnicos.',
      moderate: 'Semana moderada. Mantenha o ritmo e não deixe acumular.',
      high: 'Semana pesada. Priorize provas e entregas. Reduza temporariamente os estudos técnicos.',
      'very-high': 'Semana muito carregada! Foque apenas no que é urgente e essencial.',
    };
    return map[level] || '';
  }

  function renderWorkloadCard() {
    const { level, emoji, label, score } = getLevel();
    const recommendation = getRecommendation(level);
    const taskStats = Tasks.getStats();
    const studySessions = Studies.getWeekSessions();
    const studyHours = Math.round(Studies.getTotalHoursThisWeek() * 10) / 10;

    const plannedHours = Schedule.getWeeklyHours();
    const doneHours = studyHours;
    const weekProgress = plannedHours > 0 ? Math.min(100, Math.round((doneHours / plannedHours) * 100)) : 0;

    const areas = Studies.getAreas();
    const areaRows = areas.map(a => {
      const p = Math.min(100, a.progress || 0);
      return `
        <div class="week-area-row">
          <span class="week-area-label">${a.emoji} ${a.title}</span>
          <div class="week-area-bar">
            <div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div>
            <span class="week-area-pct">${p}%</span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="card week-card">
        <div class="card-label">ESTA SEMANA</div>

        <div class="workload-indicator workload-${level}">
          <span class="workload-emoji">${emoji}</span>
          <div>
            <div class="workload-label">Carga: ${label}</div>
            <div class="workload-rec">${recommendation}</div>
          </div>
        </div>

        <div class="week-stats">
          <div class="week-stat">
            <span class="week-stat-num">${taskStats.todayDone}</span>
            <span class="week-stat-label">Concluídas</span>
          </div>
          <div class="week-stat">
            <span class="week-stat-num">${taskStats.pending}</span>
            <span class="week-stat-label">Pendentes</span>
          </div>
          <div class="week-stat">
            <span class="week-stat-num">${taskStats.overdue}</span>
            <span class="week-stat-label">Atrasadas</span>
          </div>
          <div class="week-stat">
            <span class="week-stat-num">${studySessions.length}</span>
            <span class="week-stat-label">Sessões</span>
          </div>
        </div>

        <div class="week-progress-section">
          <div class="week-progress-row">
            <span>Horas planejadas</span>
            <div class="progress-bar"><div class="progress-fill" style="width:${weekProgress}%"></div></div>
            <span>${weekProgress}%</span>
          </div>
          ${areaRows}
        </div>
      </div>`;
  }

  return { calculateScore, getLevel, getRecommendation, renderWorkloadCard };
})();
