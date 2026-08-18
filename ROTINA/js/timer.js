/**
 * timer.js — Focus timer and focus mode
 */

const Timer = (() => {
  let timerInterval = null;
  let remaining = 0;
  let totalDuration = 0;
  let timerActive = false;
  let timerPaused = false;
  let focusMode = false;
  let currentArea = '';

  const PRESETS = [
    { label: '25 min', minutes: 25 },
    { label: '50 min', minutes: 50 },
    { label: '90 min', minutes: 90 },
  ];

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function start(minutes, area) {
    if (timerInterval) clearInterval(timerInterval);
    remaining = minutes * 60;
    totalDuration = remaining;
    timerActive = true;
    timerPaused = false;
    currentArea = area || '';
    tick();
    timerInterval = setInterval(tick, 1000);
    renderTimer();
  }

  function pause() {
    if (!timerActive) return;
    timerPaused = !timerPaused;
    if (!timerPaused) {
      timerInterval = setInterval(tick, 1000);
    } else {
      clearInterval(timerInterval);
    }
    renderTimer();
  }

  function stop() {
    if (timerInterval) clearInterval(timerInterval);
    timerActive = false;
    timerPaused = false;
    remaining = 0;
    renderTimer();
  }

  function finish() {
    clearInterval(timerInterval);
    timerActive = false;
    showFinishModal();
  }

  function tick() {
    if (!timerPaused) {
      remaining = Math.max(0, remaining - 1);
      renderTimerDisplay();
      if (remaining === 0) {
        finish();
      }
    }
  }

  function getProgress() {
    if (totalDuration === 0) return 0;
    return Math.round(((totalDuration - remaining) / totalDuration) * 100);
  }

  function renderTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
      display.textContent = formatTime(remaining);
      const ring = document.getElementById('timer-progress-ring');
      if (ring) {
        const pct = getProgress();
        const circumference = 2 * Math.PI * 54;
        ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
      }
    }
  }

  function renderTimer() {
    renderWidgetInContainer('timer-widget');
    if (focusMode) {
      renderFocusOverlay();
    }
  }

  function renderWidgetInContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!timerActive) {
      // Show start interface
      const areaOptions = Studies.getAreas().map(a =>
        `<option value="${a.id}">${a.emoji} ${a.title}</option>`
      ).join('');

      container.innerHTML = `
        <div class="timer-start">
          <div class="timer-label">CRONÔMETRO DE FOCO</div>
          <div class="timer-presets">
            ${PRESETS.map(p => `<button class="btn btn-sm btn-ghost timer-preset" data-minutes="${p.minutes}">${p.label}</button>`).join('')}
            <button class="btn btn-sm btn-ghost timer-preset" data-minutes="custom">Personalizado</button>
          </div>
          <div class="timer-custom-wrap" style="display:none">
            <input type="number" class="input timer-custom-input" min="1" max="180" placeholder="Minutos" style="width:100px">
          </div>
          <select class="input timer-area-select" style="margin-top:8px">
            <option value="">Área de estudo...</option>
            ${areaOptions}
          </select>
          <button class="btn btn-primary timer-start-btn" style="margin-top:8px;width:100%">▶ Iniciar Foco</button>
        </div>`;

      container.querySelectorAll('.timer-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const mins = btn.dataset.minutes;
          container.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const customWrap = container.querySelector('.timer-custom-wrap');
          if (mins === 'custom') {
            customWrap.style.display = 'block';
          } else {
            customWrap.style.display = 'none';
          }
        });
      });

      const startBtn = container.querySelector('.timer-start-btn');
      startBtn.addEventListener('click', () => {
        const customInput = container.querySelector('.timer-custom-input');
        const activePreset = container.querySelector('.timer-preset.active');
        let mins = 25;
        if (activePreset && activePreset.dataset.minutes !== 'custom') {
          mins = parseInt(activePreset.dataset.minutes, 10);
        } else if (customInput && customInput.value) {
          mins = parseInt(customInput.value, 10);
        }
        const area = container.querySelector('.timer-area-select').value;
        start(mins, area);
      });
    } else {
      // Show running timer
      const area = Studies.getAreas().find(a => a.id === currentArea);
      const circumference = 2 * Math.PI * 54;
      const pct = getProgress();
      const offset = circumference - (pct / 100) * circumference;

      container.innerHTML = `
        <div class="timer-running">
          <div class="timer-label">SESSÃO DE FOCO</div>
          <div class="timer-circle-wrap">
            <svg class="timer-circle" viewBox="0 0 120 120" width="140" height="140">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="6"/>
              <circle id="timer-progress-ring" cx="60" cy="60" r="54" fill="none"
                stroke="var(--primary)" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 60 60)"
                style="transition:stroke-dashoffset 1s linear"/>
              <text x="60" y="60" dominant-baseline="middle" text-anchor="middle"
                id="timer-display" fill="var(--text-primary)" font-size="22" font-weight="600"
                font-family="-apple-system, sans-serif">${formatTime(remaining)}</text>
            </svg>
          </div>
          ${area ? `<div class="timer-area-name">${area.emoji} ${Utils.escapeHtml(area.title)}</div>` : ''}
          <div class="timer-controls">
            <button class="btn btn-sm btn-ghost timer-pause-btn">${timerPaused ? '▶ Retomar' : '⏸ Pausar'}</button>
            <button class="btn btn-sm btn-ghost timer-stop-btn">⏹ Finalizar</button>
          </div>
        </div>`;

      container.querySelector('.timer-pause-btn').addEventListener('click', pause);
      container.querySelector('.timer-stop-btn').addEventListener('click', () => {
        if (confirm('Finalizar sessão de foco?')) {
          showFinishModal();
        }
      });
    }
  }

  function renderFocusOverlay() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;
    if (focusMode) {
      overlay.style.display = 'flex';
      renderWidgetInContainer('focus-overlay-widget');
      const exitBtn = document.getElementById('focus-exit-btn');
      if (exitBtn) {
        exitBtn.onclick = () => deactivateFocusMode();
      }
    } else {
      overlay.style.display = 'none';
    }
  }

  function showFinishModal() {
    const area = Studies.getAreas().find(a => a.id === currentArea);
    const elapsed = Math.round((totalDuration - remaining) / 60);

    const modal = document.getElementById('modal-overlay');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>✅ Sessão concluída!</h2>
          <span class="modal-time">${elapsed} min estudados</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="session-content">O que você estudou?</label>
            <input type="text" id="session-content" class="input" placeholder="Conteúdo estudado">
          </div>
          <div class="form-group">
            <label class="form-label" for="session-obs">Alguma observação?</label>
            <textarea id="session-obs" class="input" rows="2" placeholder="Observações..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="session-skip-btn">Pular</button>
          <button class="btn btn-primary" id="session-save-btn">Salvar sessão</button>
        </div>
      </div>`;

    modal.style.display = 'flex';

    document.getElementById('session-save-btn').addEventListener('click', () => {
      const content = document.getElementById('session-content').value;
      const obs = document.getElementById('session-obs').value;
      Studies.addSession({
        areaId: currentArea,
        content,
        date: Utils.todayISO(),
        duration: elapsed,
        observation: obs,
      });
      Storage.addFocusSession({
        id: Utils.generateId(),
        areaId: currentArea,
        duration: elapsed,
        date: Utils.todayISO(),
        content,
      });
      closeModal();
      stop();
      if (focusMode) deactivateFocusMode();
    });

    document.getElementById('session-skip-btn').addEventListener('click', () => {
      closeModal();
      stop();
      if (focusMode) deactivateFocusMode();
    });
  }

  function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
  }

  function activateFocusMode() {
    focusMode = true;
    document.body.classList.add('focus-mode');
    renderFocusOverlay();
  }

  function deactivateFocusMode() {
    focusMode = false;
    document.body.classList.remove('focus-mode');
    const overlay = document.getElementById('focus-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function toggleFocusMode() {
    if (focusMode) deactivateFocusMode();
    else activateFocusMode();
  }

  return {
    start, pause, stop, renderTimer, toggleFocusMode,
    activateFocusMode, deactivateFocusMode,
    isActive: () => timerActive,
    isFocusMode: () => focusMode,
  };
})();
