/**
 * default-data.js
 * Dados padrão do sistema — rotina semanal de Matheus.
 * Disciplinas, tarefas e projetos são cadastrados pelo usuário.
 */

const DEFAULT_SCHEDULE = {
  // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  1: [
    { id: 's1_1', start: '07:00', end: '09:00', title: 'Ciência da Computação', emoji: '🎓', category: 'faculdade' },
    { id: 's1_2', start: '10:00', end: '12:00', title: 'Trabalhos / Atividades CC', emoji: '📚', category: 'trabalho' },
    { id: 's1_3', start: '13:30', end: '15:00', title: 'Arquitetura & Design Systems', emoji: '🏗️', category: 'tecnico' },
    { id: 's1_4', start: '15:30', end: '17:00', title: 'Python', emoji: '🐍', category: 'tecnico' },
    { id: 's1_5', start: '18:30', end: '20:00', title: 'Trabalhos / Faculdade', emoji: '📚', category: 'trabalho' },
    { id: 's1_6', start: '21:00', end: '21:30', title: 'Organização do dia seguinte', emoji: '📝', category: 'organizacao' },
  ],
  2: [
    { id: 's2_1', start: '07:00', end: '09:00', title: 'Ciência da Computação', emoji: '🎓', category: 'faculdade' },
    { id: 's2_2', start: '10:00', end: '12:00', title: 'Trabalhos / Exercícios', emoji: '📚', category: 'trabalho' },
    { id: 's2_3', start: '13:30', end: '15:00', title: 'QA', emoji: '🧪', category: 'tecnico' },
    { id: 's2_4', start: '15:30', end: '17:00', title: 'Python', emoji: '🐍', category: 'tecnico' },
    { id: 's2_5', start: '18:30', end: '21:30', title: 'Engenharia de Software', emoji: '🎓', category: 'faculdade' },
    { id: 's2_6', start: '22:00', end: '22:30', title: 'Revisão da aula', emoji: '📝', category: 'organizacao' },
  ],
  3: [
    { id: 's3_1', start: '07:00', end: '09:00', title: 'Ciência da Computação', emoji: '🎓', category: 'faculdade' },
    { id: 's3_2', start: '10:00', end: '12:00', title: 'Trabalhos / Projetos', emoji: '📚', category: 'trabalho' },
    { id: 's3_3', start: '13:30', end: '15:00', title: 'Arquitetura & Design Systems', emoji: '🏗️', category: 'tecnico' },
    { id: 's3_4', start: '15:30', end: '17:00', title: 'Exercícios / Revisão', emoji: '📖', category: 'revisao' },
    { id: 's3_5', start: '18:30', end: '21:30', title: 'Engenharia de Software', emoji: '🎓', category: 'faculdade' },
    { id: 's3_6', start: '22:00', end: '22:30', title: 'Revisão da aula', emoji: '📝', category: 'organizacao' },
  ],
  4: [
    { id: 's4_1', start: '07:00', end: '09:00', title: 'Ciência da Computação', emoji: '🎓', category: 'faculdade' },
    { id: 's4_2', start: '10:00', end: '12:00', title: 'Trabalhos / Projetos', emoji: '📚', category: 'trabalho' },
    { id: 's4_3', start: '13:30', end: '15:00', title: 'QA', emoji: '🧪', category: 'tecnico' },
    { id: 's4_4', start: '15:30', end: '17:00', title: 'Python', emoji: '🐍', category: 'tecnico' },
    { id: 's4_5', start: '18:30', end: '21:30', title: 'Engenharia de Software', emoji: '🎓', category: 'faculdade' },
    { id: 's4_6', start: '22:00', end: '22:30', title: 'Revisão da aula', emoji: '📝', category: 'organizacao' },
  ],
  5: [
    { id: 's5_1', start: '07:00', end: '09:00', title: 'Ciência da Computação', emoji: '🎓', category: 'faculdade' },
    { id: 's5_2', start: '10:00', end: '12:00', title: 'Finalização de Pendências', emoji: '📚', category: 'trabalho' },
    { id: 's5_3', start: '13:30', end: '15:00', title: 'Python', emoji: '🐍', category: 'tecnico' },
    { id: 's5_4', start: '15:30', end: '17:00', title: 'Revisão Geral da Semana', emoji: '📖', category: 'revisao' },
    { id: 's5_5', start: '18:30', end: '21:30', title: 'Engenharia de Software / ADS', emoji: '🎓', category: 'faculdade' },
  ],
  6: [
    { id: 's6_1', start: '09:00', end: '11:00', title: 'Trabalhos das Faculdades', emoji: '📚', category: 'trabalho' },
    { id: 's6_2', start: '11:30', end: '12:30', title: 'Revisão Semanal', emoji: '📖', category: 'revisao' },
    { id: 's6_3', start: '14:00', end: '15:30', title: 'Arquitetura & Design Systems', emoji: '🏗️', category: 'tecnico' },
    { id: 's6_4', start: '16:00', end: '17:30', title: 'Python / Projeto Prático', emoji: '🐍', category: 'tecnico' },
  ],
  0: [
    { id: 's0_1', start: '10:00', end: '11:00', title: 'Revisão Leve', emoji: '📖', category: 'revisao' },
    { id: 's0_2', start: '11:00', end: '12:00', title: 'Planejamento Semanal', emoji: '📋', category: 'organizacao' },
  ],
};

const DEFAULT_STUDY_AREAS = [
  {
    id: 'arch',
    title: 'Arquitetura de Software',
    emoji: '🏗️',
    progress: 0,
    hoursStudied: 0,
    nextTopic: '',
    contents: [],
  },
  {
    id: 'design',
    title: 'Design Systems',
    emoji: '🎨',
    progress: 0,
    hoursStudied: 0,
    nextTopic: '',
    contents: [],
  },
  {
    id: 'qa',
    title: 'QA & Automação',
    emoji: '🧪',
    progress: 0,
    hoursStudied: 0,
    nextTopic: '',
    contents: [],
  },
  {
    id: 'python',
    title: 'Python',
    emoji: '🐍',
    progress: 0,
    hoursStudied: 0,
    nextTopic: '',
    contents: [],
  },
];

const DEFAULT_UNIVERSITIES = [
  { id: 'cc', name: 'Ciência da Computação', emoji: '🎓', disciplines: [] },
  { id: 'es', name: 'Engenharia de Software', emoji: '💻', disciplines: [] },
  { id: 'ads', name: 'ADS', emoji: '📚', disciplines: [] },
];

const DEFAULT_SETTINGS = {
  userName: 'Matheus',
  theme: 'dark',
  focusPhrase: 'Foco no que importa hoje.',
};

// Categorias de tarefas
const TASK_CATEGORIES = [
  { id: 'cc', label: 'Ciência da Computação', emoji: '🎓' },
  { id: 'es', label: 'Engenharia de Software', emoji: '💻' },
  { id: 'ads', label: 'ADS', emoji: '📚' },
  { id: 'arch', label: 'Arquitetura', emoji: '🏗️' },
  { id: 'design', label: 'Design Systems', emoji: '🎨' },
  { id: 'qa', label: 'QA', emoji: '🧪' },
  { id: 'python', label: 'Python', emoji: '🐍' },
  { id: 'personal', label: 'Pessoal', emoji: '📋' },
];

const TASK_PRIORITIES = [
  { id: 'urgent', label: 'Urgente', emoji: '🔴', score: 4 },
  { id: 'high', label: 'Alta', emoji: '🟠', score: 3 },
  { id: 'medium', label: 'Média', emoji: '🟡', score: 2 },
  { id: 'low', label: 'Baixa', emoji: '🟢', score: 1 },
];

const TASK_STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A fazer' },
  { id: 'doing', label: 'Em andamento' },
  { id: 'done', label: 'Concluído' },
];

const PROJECT_AREAS = [
  { id: 'cc', label: 'Ciência da Computação', emoji: '🎓' },
  { id: 'es', label: 'Engenharia de Software', emoji: '💻' },
  { id: 'ads', label: 'ADS', emoji: '📚' },
  { id: 'arch', label: 'Arquitetura', emoji: '🏗️' },
  { id: 'personal', label: 'Pessoal', emoji: '📋' },
];
