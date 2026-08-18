/**
 * utils.js — Helper functions
 */

const Utils = (() => {
  const WEEK_DAYS_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTHS_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const MONTHS_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

  function formatDate(date) {
    const d = date || new Date();
    return `${WEEK_DAYS_PT[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`;
  }

  function formatShortDate(date) {
    const d = date instanceof Date ? date : new Date(date + 'T00:00:00');
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function getCurrentTimeMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  function getDayOfWeek() {
    return new Date().getDay();
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  function formatCountdown(minutes) {
    if (minutes <= 0) return 'agora';
    if (minutes === 1) return 'em 1 minuto';
    if (minutes < 60) return `em ${minutes} minutos`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `em ${h}h`;
    return `em ${h}h ${m}min`;
  }

  function getProgress(startTime, endTime, nowMinutes) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const total = end - start;
    if (total <= 0) return 0;
    const elapsed = nowMinutes - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  function isToday(dateStr) {
    const today = new Date();
    const d = new Date(dateStr + 'T00:00:00');
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  }

  function isTomorrow(dateStr) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = new Date(dateStr + 'T00:00:00');
    return d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate();
  }

  function isPast(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    return d < today;
  }

  function daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function el(selector) {
    return document.querySelector(selector);
  }

  function els(selector) {
    return document.querySelectorAll(selector);
  }

  function createElement(tag, attrs = {}, children = []) {
    const elem = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') elem.className = v;
      else if (k === 'html') elem.innerHTML = v;
      else if (k === 'text') elem.textContent = v;
      else elem.setAttribute(k, v);
    });
    children.forEach(child => {
      if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
      else if (child) elem.appendChild(child);
    });
    return elem;
  }

  function renderProgressBar(percent, color = '') {
    return `<div class="progress-bar"><div class="progress-fill${color ? ' '+color : ''}" style="width:${percent}%"></div></div>`;
  }

  function renderProgressBlocks(percent) {
    const total = 16;
    const filled = Math.round((percent / 100) * total);
    const blocks = '█'.repeat(filled) + '░'.repeat(total - filled);
    return `${blocks} ${percent}%`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getPriorityEmoji(priorityId) {
    const map = { urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
    return map[priorityId] || '⚪';
  }

  function getPriorityLabel(priorityId) {
    const map = { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' };
    return map[priorityId] || priorityId;
  }

  function getWeekDayName(dayIndex) {
    return WEEK_DAYS_PT[dayIndex];
  }

  function getWeekDayShort(dayIndex) {
    return WEEK_DAYS_SHORT[dayIndex];
  }

  function startOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function endOfWeek() {
    const start = startOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function isThisWeek(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d >= startOfWeek() && d <= endOfWeek();
  }

  function isNextSevenDays(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const limit = new Date(today);
    limit.setDate(today.getDate() + 7);
    return d >= today && d <= limit;
  }

  return {
    formatDate, formatShortDate, getGreeting, timeToMinutes, minutesToTime,
    getCurrentTimeMinutes, getDayOfWeek, formatDuration, formatCountdown,
    getProgress, isToday, isTomorrow, isPast, daysUntil, todayISO, tomorrowISO,
    generateId, el, els, createElement, renderProgressBar, renderProgressBlocks,
    escapeHtml, getPriorityEmoji, getPriorityLabel, getWeekDayName, getWeekDayShort,
    startOfWeek, endOfWeek, isThisWeek, isNextSevenDays,
  };
})();
