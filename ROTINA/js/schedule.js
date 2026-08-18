/**
 * schedule.js — Weekly schedule logic
 * Provides current, next, and upcoming activity based on time of day.
 */

const Schedule = (() => {

  function getSchedule() {
    return Storage.getSchedule();
  }

  function getTodayBlocks() {
    const day = Utils.getDayOfWeek();
    const schedule = getSchedule();
    return (schedule[day] || []).slice().sort((a, b) =>
      Utils.timeToMinutes(a.start) - Utils.timeToMinutes(b.start)
    );
  }

  function getDayBlocks(dayIndex) {
    const schedule = getSchedule();
    return (schedule[dayIndex] || []).slice().sort((a, b) =>
      Utils.timeToMinutes(a.start) - Utils.timeToMinutes(b.start)
    );
  }

  /**
   * Returns { current, next, upcoming, status }
   * status: 'active' | 'break' | 'free' | 'before' | 'after'
   */
  function getCurrentState() {
    const blocks = getTodayBlocks();
    const now = Utils.getCurrentTimeMinutes();

    let current = null;
    let next = null;
    let upcoming = null;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const start = Utils.timeToMinutes(b.start);
      const end = Utils.timeToMinutes(b.end);

      if (now >= start && now < end) {
        current = b;
        next = blocks[i + 1] || null;
        upcoming = blocks[i + 2] || null;
        break;
      }
    }

    // If not in a block, find next
    if (!current) {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const start = Utils.timeToMinutes(b.start);
        if (now < start) {
          next = b;
          upcoming = blocks[i + 1] || null;
          break;
        }
      }
    }

    // Determine status
    let status = 'free';
    if (current) {
      status = 'active';
    } else if (next) {
      // Check if we're between blocks (break)
      const prevBlock = blocks.slice().reverse().find(b => Utils.timeToMinutes(b.end) <= now);
      if (prevBlock) {
        const gapMins = Utils.timeToMinutes(next.start) - Utils.timeToMinutes(prevBlock.end);
        status = gapMins <= 90 ? 'break' : 'free';
      } else {
        status = 'before'; // before first block
      }
    } else if (blocks.length > 0) {
      status = 'after'; // after last block
    }

    return { current, next, upcoming, status, blocks };
  }

  function getProgressForBlock(block) {
    const now = Utils.getCurrentTimeMinutes();
    return Utils.getProgress(block.start, block.end, now);
  }

  function getMinutesUntil(block) {
    const now = Utils.getCurrentTimeMinutes();
    return Utils.timeToMinutes(block.start) - now;
  }

  function isBlockPast(block) {
    const now = Utils.getCurrentTimeMinutes();
    return Utils.timeToMinutes(block.end) <= now;
  }

  function isBlockCurrent(block) {
    const now = Utils.getCurrentTimeMinutes();
    const start = Utils.timeToMinutes(block.start);
    const end = Utils.timeToMinutes(block.end);
    return now >= start && now < end;
  }

  function getWeeklyHours() {
    const schedule = getSchedule();
    let total = 0;
    Object.values(schedule).forEach(dayBlocks => {
      (dayBlocks || []).forEach(b => {
        total += Utils.timeToMinutes(b.end) - Utils.timeToMinutes(b.start);
      });
    });
    return Math.round(total / 60 * 10) / 10;
  }

  function getCategoryHours(category) {
    const schedule = getSchedule();
    let total = 0;
    Object.values(schedule).forEach(dayBlocks => {
      (dayBlocks || []).forEach(b => {
        if (b.category === category) {
          total += Utils.timeToMinutes(b.end) - Utils.timeToMinutes(b.start);
        }
      });
    });
    return Math.round(total / 60 * 10) / 10;
  }

  function renderNowCard() {
    const { current, next, status, blocks } = getCurrentState();

    if (status === 'active' && current) {
      const progress = getProgressForBlock(current);
      return `
        <div class="card now-card now-active">
          <div class="card-label">AGORA</div>
          <div class="now-time">${current.start} — ${current.end}</div>
          <div class="now-title">${current.emoji} ${Utils.escapeHtml(current.title)}</div>
          <div class="now-category">${getCategoryLabel(current.category)}</div>
          <div class="now-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <span class="progress-text">${progress}%</span>
          </div>
        </div>`;
    }

    if (status === 'break' && next) {
      return `
        <div class="card now-card now-break">
          <div class="card-label">AGORA</div>
          <div class="now-title">☕ Intervalo</div>
          <div class="now-subtitle">Descanse. A próxima atividade começa às ${next.start}.</div>
        </div>`;
    }

    if (status === 'before' && next) {
      const mins = getMinutesUntil(next);
      return `
        <div class="card now-card now-free">
          <div class="card-label">AGORA</div>
          <div class="now-title">🌅 Preparação</div>
          <div class="now-subtitle">Primeira atividade começa ${Utils.formatCountdown(mins)}.</div>
        </div>`;
    }

    if (status === 'after') {
      return `
        <div class="card now-card now-free">
          <div class="card-label">AGORA</div>
          <div class="now-title">🌙 Fim do dia</div>
          <div class="now-subtitle">Todas as atividades de hoje foram concluídas.</div>
        </div>`;
    }

    return `
      <div class="card now-card now-free">
        <div class="card-label">AGORA</div>
        <div class="now-title">☕ Tempo livre</div>
        <div class="now-subtitle">Você não possui nenhuma atividade programada agora.</div>
      </div>`;
  }

  function renderNextCard() {
    const { current, next, status } = getCurrentState();
    const target = current ? next : (status === 'active' ? null : next);

    if (!target) return '';

    const mins = getMinutesUntil(target);
    const countdownText = mins > 0 ? `Começa ${Utils.formatCountdown(mins)}` : 'Começando agora';

    return `
      <div class="card next-card">
        <div class="card-label">PRÓXIMA ATIVIDADE</div>
        <div class="next-time">${target.start} — ${target.end}</div>
        <div class="next-title">${target.emoji} ${Utils.escapeHtml(target.title)}</div>
        <div class="next-countdown">${countdownText}</div>
      </div>`;
  }

  function renderTodayTimeline() {
    const blocks = getTodayBlocks();
    const now = Utils.getCurrentTimeMinutes();

    if (blocks.length === 0) {
      return `<div class="card"><div class="card-label">HOJE</div><p class="empty-state">Nenhuma atividade programada para hoje.</p></div>`;
    }

    const items = blocks.map(b => {
      const isCurrent = isBlockCurrent(b);
      const isPast = isBlockPast(b);
      const cls = isCurrent ? 'timeline-item current' : isPast ? 'timeline-item past' : 'timeline-item upcoming';
      return `
        <div class="${cls}" data-id="${b.id}">
          <div class="timeline-time">${b.start}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-emoji">${b.emoji}</span>
            <span class="timeline-title">${Utils.escapeHtml(b.title)}</span>
            <span class="timeline-end">até ${b.end}</span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="card today-card">
        <div class="card-label">HOJE</div>
        <div class="timeline">${items}</div>
      </div>`;
  }

  function getCategoryLabel(cat) {
    const map = {
      faculdade: 'Faculdade', trabalho: 'Trabalhos', tecnico: 'Estudo técnico',
      revisao: 'Revisão', organizacao: 'Organização',
    };
    return map[cat] || cat;
  }

  function renderWeekSchedule() {
    const schedule = getSchedule();
    const days = [
      { idx: 1, name: 'Segunda' },
      { idx: 2, name: 'Terça' },
      { idx: 3, name: 'Quarta' },
      { idx: 4, name: 'Quinta' },
      { idx: 5, name: 'Sexta' },
      { idx: 6, name: 'Sábado' },
      { idx: 0, name: 'Domingo' },
    ];

    const todayIdx = Utils.getDayOfWeek();

    return days.map(d => {
      const blocks = getDayBlocks(d.idx);
      const isToday = d.idx === todayIdx;
      const blockHtml = blocks.length === 0
        ? '<div class="schedule-empty">Dia livre ✨</div>'
        : blocks.map(b => `
          <div class="schedule-block cat-${b.category}">
            <span class="schedule-block-time">${b.start}–${b.end}</span>
            <span class="schedule-block-title">${b.emoji} ${Utils.escapeHtml(b.title)}</span>
          </div>`).join('');

      return `
        <div class="schedule-day${isToday ? ' today' : ''}">
          <div class="schedule-day-header">
            <span class="schedule-day-name">${d.name}</span>
            ${isToday ? '<span class="today-badge">Hoje</span>' : ''}
          </div>
          <div class="schedule-blocks">${blockHtml}</div>
        </div>`;
    }).join('');
  }

  return {
    getTodayBlocks, getDayBlocks, getCurrentState, getProgressForBlock,
    getMinutesUntil, isBlockPast, isBlockCurrent, getWeeklyHours,
    getCategoryHours, renderNowCard, renderNextCard, renderTodayTimeline,
    renderWeekSchedule, getCategoryLabel,
  };
})();
