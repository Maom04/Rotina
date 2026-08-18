/**
 * disciplines.js — Universities and disciplines management
 */

const Disciplines = (() => {

  function getUniversities() {
    return Storage.getUniversities();
  }

  function addDiscipline(uniId, data) {
    const unis = getUniversities();
    const uni = unis.find(u => u.id === uniId);
    if (!uni) return null;

    const discipline = {
      id: Utils.generateId(),
      name: data.name || 'Nova disciplina',
      professor: data.professor || '',
      schedule: data.schedule || '',
      observations: data.observations || '',
      createdAt: new Date().toISOString(),
    };

    uni.disciplines.push(discipline);
    Storage.saveUniversities(unis);
    return discipline;
  }

  function updateDiscipline(uniId, discId, changes) {
    const unis = getUniversities();
    const uni = unis.find(u => u.id === uniId);
    if (!uni) return null;

    const idx = uni.disciplines.findIndex(d => d.id === discId);
    if (idx < 0) return null;

    uni.disciplines[idx] = { ...uni.disciplines[idx], ...changes };
    Storage.saveUniversities(unis);
    return uni.disciplines[idx];
  }

  function deleteDiscipline(uniId, discId) {
    const unis = getUniversities();
    const uni = unis.find(u => u.id === uniId);
    if (!uni) return;
    uni.disciplines = uni.disciplines.filter(d => d.id !== discId);
    Storage.saveUniversities(unis);
  }

  function renderUniversitySection(uni) {
    const discs = uni.disciplines || [];
    const discsHtml = discs.length === 0
      ? `<p class="empty-state">Nenhuma disciplina cadastrada. <button class="btn btn-sm btn-ghost" data-action="add-discipline" data-uni-id="${uni.id}">+ Adicionar</button></p>`
      : discs.map(d => renderDisciplineCard(uni.id, d)).join('') +
        `<button class="btn btn-sm btn-ghost" data-action="add-discipline" data-uni-id="${uni.id}">+ Adicionar disciplina</button>`;

    return `
      <div class="university-section" data-uni-id="${uni.id}">
        <div class="university-header">
          <span class="university-emoji">${uni.emoji}</span>
          <h2 class="university-name">${Utils.escapeHtml(uni.name)}</h2>
        </div>
        <div class="disciplines-grid">${discsHtml}</div>
      </div>`;
  }

  function renderDisciplineCard(uniId, disc) {
    return `
      <div class="discipline-card" data-disc-id="${disc.id}">
        <div class="discipline-name">${Utils.escapeHtml(disc.name)}</div>
        ${disc.professor ? `<div class="discipline-professor">👤 ${Utils.escapeHtml(disc.professor)}</div>` : ''}
        ${disc.schedule ? `<div class="discipline-schedule">🕐 ${Utils.escapeHtml(disc.schedule)}</div>` : ''}
        ${disc.observations ? `<div class="discipline-obs">${Utils.escapeHtml(disc.observations)}</div>` : ''}
        <div class="discipline-actions">
          <button class="btn-icon" data-action="edit-discipline" data-uni-id="${uniId}" data-disc-id="${disc.id}" aria-label="Editar disciplina">✏️</button>
          <button class="btn-icon" data-action="delete-discipline" data-uni-id="${uniId}" data-disc-id="${disc.id}" aria-label="Excluir disciplina">🗑️</button>
        </div>
      </div>`;
  }

  return {
    getUniversities, addDiscipline, updateDiscipline, deleteDiscipline,
    renderUniversitySection, renderDisciplineCard,
  };
})();
