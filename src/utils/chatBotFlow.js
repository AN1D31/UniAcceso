// Static definition of the conversation. Ids and keys are code (English);
// labels and messages are user-facing text (Latin American Spanish).

export const WELCOME_MESSAGE =
  "¡Hola! 👋 Soy unIA, tu orientador de UniAcceso. Te ayudaré a encontrar programas universitarios que encajen contigo.";

// `label` is also the value stored in programs.knowledge_area.
// `keywords` are matched (accent- and case-insensitively) against the start of the words of a program name.
export const AREAS = {
  technology: { label: "Tecnología", keywords: ["tecnolog", "sistemas", "software", "informat", "comput", "datos", "ciberseguridad", "telematic"] },
  health: { label: "Salud", keywords: ["salud", "medic", "enfermer", "odontolog", "psicolog", "nutric", "fisioterap", "farmac", "veterinar"] },
  business: { label: "Negocios", keywords: ["negocio", "administraci", "econom", "contadur", "mercad", "finanz", "comerci", "gestion"] },
  arts: { label: "Artes", keywords: ["arte", "dise", "music", "audiovisual", "arquitect", "teatro", "cine", "fotograf"] },
  engineering: { label: "Ingenierías", keywords: ["ingenier"] },
  education: { label: "Educación", keywords: ["educaci", "pedagog", "licenciatura", "docencia"] },
  social_sciences: { label: "Ciencias sociales y Derecho", keywords: ["derecho", "social", "comunicaci", "politic", "sociolog", "antropolog", "periodism", "trabajo social"] },
  basic_sciences: { label: "Ciencias Básicas", keywords: ["ciencias basicas", "matematic", "fisica", "quimica", "biolog", "estadist", "geolog"] },
};

const AREA_OPTIONS = [
  ...Object.entries(AREAS).map(([id, area]) => ({ id, label: area.label, areas: [id] })),
  { id: "any", label: "Aún no lo sé", areas: [] },
];

const ANY_OPTION_LABEL = "Me da igual";

// Conversation graph. Each node asks one question; an option may override the node's `next`.
//  - `scoring` nodes add the option's `scores` to the vocational profile.
//  - `answerKey` nodes store the chosen option under that key of the answers.
// Special targets: "profile" (compute the test result) and "search" (query the database).
export const NODES = {
  start: {
    question: "¿Deseas realizar un test vocacional para descubrir tu perfil ideal o prefieres buscar un programa académico directamente?",
    options: [
      { id: "take_test", label: "Hacer el test vocacional", next: "quiz_skills_1" },
      { id: "direct_search", label: "Buscar un programa directamente", next: "area" },
    ],
  },

  // --- Vocational test: skills, interests and work methodology ---
  quiz_skills_1: {
    scoring: true,
    next: "quiz_skills_2",
    question: "Test 1 de 6 · Habilidades: ¿Cuál de estas habilidades describe mejor tu mayor fortaleza?",
    options: [
      { id: "logic", label: "Razonamiento lógico y matemático", scores: { technology: 2, engineering: 2, basic_sciences: 1 } },
      { id: "empathy", label: "Empatía y capacidad de cuidar a otros", scores: { health: 2, education: 1, social_sciences: 1 } },
      { id: "creativity", label: "Creatividad e imaginación", scores: { arts: 2, technology: 1 } },
      { id: "leadership", label: "Liderazgo y organización", scores: { business: 2, social_sciences: 1 } },
      { id: "curiosity", label: "Curiosidad e investigación", scores: { basic_sciences: 2, health: 1, engineering: 1 } },
      { id: "communication", label: "Comunicación y argumentación", scores: { social_sciences: 2, education: 2, business: 1 } },
    ],
  },
  quiz_skills_2: {
    scoring: true,
    next: "quiz_interests_1",
    question: "Test 2 de 6 · Habilidades: ¿En qué materia te sientes más cómodo o cómoda?",
    options: [
      { id: "math_physics", label: "Matemáticas y física", scores: { engineering: 2, basic_sciences: 2, technology: 1 } },
      { id: "bio_chem", label: "Biología y química", scores: { health: 2, basic_sciences: 2 } },
      { id: "art_design", label: "Arte y diseño", scores: { arts: 3 } },
      { id: "economics", label: "Economía y administración", scores: { business: 3 } },
      { id: "humanities", label: "Lenguaje, historia y ciencias sociales", scores: { social_sciences: 2, education: 2 } },
      { id: "computing", label: "Informática y tecnología", scores: { technology: 3, engineering: 1 } },
    ],
  },
  quiz_interests_1: {
    scoring: true,
    next: "quiz_interests_2",
    question: "Test 3 de 6 · Intereses: ¿Qué actividad disfrutarías más en tu tiempo libre?",
    options: [
      { id: "build", label: "Armar, programar o reparar cosas", scores: { technology: 2, engineering: 2 } },
      { id: "help", label: "Ayudar o acompañar a alguien que lo necesita", scores: { health: 2, education: 1, social_sciences: 1 } },
      { id: "create", label: "Dibujar, escribir, componer o filmar", scores: { arts: 3 } },
      { id: "undertake", label: "Emprender o vender una idea", scores: { business: 3 } },
      { id: "experiment", label: "Experimentar y descubrir cómo funcionan las cosas", scores: { basic_sciences: 2, engineering: 1, health: 1 } },
      { id: "teach", label: "Enseñar o explicar algo a otras personas", scores: { education: 3, social_sciences: 1 } },
    ],
  },
  quiz_interests_2: {
    scoring: true,
    next: "quiz_method_1",
    question: "Test 4 de 6 · Intereses: ¿Qué tipo de problema te gustaría ayudar a resolver?",
    options: [
      { id: "health_problem", label: "Mejorar la salud y el bienestar de las personas", scores: { health: 3 } },
      { id: "tech_problem", label: "Crear tecnología que simplifique la vida", scores: { technology: 3, engineering: 1 } },
      { id: "infrastructure", label: "Construir infraestructura y soluciones sostenibles", scores: { engineering: 3, basic_sciences: 1 } },
      { id: "economy", label: "Impulsar la economía y las empresas", scores: { business: 3 } },
      { id: "justice", label: "Promover la justicia y el cambio social", scores: { social_sciences: 3, education: 1 } },
      { id: "nature", label: "Entender la naturaleza y el universo", scores: { basic_sciences: 3 } },
    ],
  },
  quiz_method_1: {
    scoring: true,
    next: "quiz_method_2",
    question: "Test 5 de 6 · Metodología de trabajo: ¿Cómo prefieres trabajar?",
    options: [
      { id: "solo_analysis", label: "Analizando datos y resolviendo problemas por mi cuenta", scores: { technology: 2, basic_sciences: 2, engineering: 1 } },
      { id: "teamwork", label: "En equipo, conversando y colaborando", scores: { business: 1, social_sciences: 1, education: 1, health: 1 } },
      { id: "free_creation", label: "Con libertad para crear y proponer ideas propias", scores: { arts: 3 } },
      { id: "goal_driven", label: "Con metas claras, planes y resultados medibles", scores: { business: 2, engineering: 1 } },
      { id: "hands_on", label: "Experimentando en laboratorios o en campo", scores: { basic_sciences: 2, health: 1, engineering: 1 } },
      { id: "people_facing", label: "Atendiendo y orientando directamente a personas", scores: { health: 2, education: 2 } },
    ],
  },
  quiz_method_2: {
    scoring: true,
    next: "profile",
    question: "Test 6 de 6 · Metodología de trabajo: ¿Qué entorno de trabajo te atrae más?",
    options: [
      { id: "tech_lab", label: "Oficina o laboratorio tecnológico", scores: { technology: 2, engineering: 1, basic_sciences: 1 } },
      { id: "clinic", label: "Hospital, clínica o centro de salud", scores: { health: 3 } },
      { id: "studio", label: "Estudio, taller o espacio creativo", scores: { arts: 3 } },
      { id: "company", label: "Empresa u organización con equipos", scores: { business: 2, social_sciences: 1 } },
      { id: "classroom", label: "Aula o institución educativa", scores: { education: 3, social_sciences: 1 } },
      { id: "field", label: "Obras, plantas industriales o trabajo de campo", scores: { engineering: 2, basic_sciences: 1 } },
    ],
  },

  // Asked right after the profile is shown.
  confirm_search: {
    question: "¿Deseas que busque programas universitarios disponibles en estas áreas que te acabo de sugerir?",
    options: [
      { id: "yes", label: "Sí, busca programas", next: "modality" },
      { id: "choose_area", label: "Prefiero elegir otra área", next: "area" },
      { id: "retake", label: "Repetir el test", next: "quiz_skills_1", resetScores: true },
    ],
  },

  // --- Search filters (direct search starts here, after choosing an area) ---
  area: {
    answerKey: "areas",
    next: "modality",
    question: "¿Qué área te interesa más?",
    options: AREA_OPTIONS,
  },
  modality: {
    answerKey: "modality",
    next: "level",
    question: "¿Cómo prefieres estudiar?",
    options: [
      { id: "presencial", label: "Presencial" },
      { id: "virtual", label: "Virtual o a distancia" },
      { id: "any", label: ANY_OPTION_LABEL },
    ],
  },
  level: {
    answerKey: "level",
    next: "funding",
    question: "¿Qué nivel de estudios buscas?",
    options: [
      { id: "pregrado", label: "Pregrado" },
      { id: "posgrado", label: "Posgrado" },
      { id: "any", label: ANY_OPTION_LABEL },
    ],
  },
  funding: {
    answerKey: "funding",
    next: "search",
    question: "¿Necesitas apoyo económico? Si es así, también te mostraré becas relacionadas.",
    options: [
      { id: "full_scholarship", label: "Busco beca total", coverage: ["total"] },
      { id: "partial_scholarship", label: "Beca parcial", coverage: ["parcial", "matricula", "manutencion"] },
      { id: "no_scholarship", label: "No necesito beca", coverage: [] },
    ],
  },
};

export const COVERAGE_LABELS = {
  total: "Cobertura total",
  parcial: "Cobertura parcial",
  matricula: "Cubre matrícula",
  manutencion: "Cubre manutención",
};

const PROFILE_DESCRIPTIONS = {
  technology: "Eres una persona analítica e innovadora: te atrae entender cómo funcionan los sistemas y crear soluciones digitales.",
  health: "Eres una persona empática y comprometida: te motiva cuidar el bienestar de los demás y aplicar la ciencia para ayudar.",
  business: "Eres una persona líder y estratégica: disfrutas organizar recursos, tomar decisiones y convertir ideas en proyectos.",
  arts: "Eres una persona creativa y expresiva: necesitas libertad para imaginar, diseñar y comunicar con tu propio estilo.",
  engineering: "Eres una persona práctica y resolutiva: te gusta aplicar la lógica y las matemáticas para construir cosas que funcionan.",
  education: "Eres una persona comunicativa y paciente: disfrutas explicar, acompañar procesos y ayudar a otros a crecer.",
  social_sciences: "Eres una persona crítica y sensible al entorno: te interesa entender la sociedad, argumentar y promover el cambio.",
  basic_sciences: "Eres una persona curiosa e investigadora: te mueve entender cómo funciona el mundo a través de la evidencia.",
};

const MAX_SUGGESTED_AREAS = 3;

// Turns the accumulated scores into a profile analysis and the suggested areas.
// Ties are broken by the declaration order of AREAS.
export function buildProfile(scores) {
  const ranked = Object.keys(AREAS)
    .map((areaId) => ({ areaId, score: scores[areaId] ?? 0 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const suggested = ranked.slice(0, MAX_SUGGESTED_AREAS).map((entry) => entry.areaId);
  const [main, ...others] = suggested;
  const labels = suggested.map((areaId) => AREAS[areaId].label);

  const text = main
    ? `Este es el análisis de tu perfil:\n\n${PROFILE_DESCRIPTIONS[main]}` +
      (others.length ? ` También muestras afinidad con ${others.map((areaId) => AREAS[areaId].label).join(" y ")}.` : "") +
      `\n\nÁreas de conocimiento afines: ${labels.join(", ")}.`
    : "No logré identificar un perfil claro con tus respuestas, pero puedes explorar cualquier área.";

  return { text, areaIds: suggested };
}

export function addScores(current, scores = {}) {
  const next = { ...current };
  Object.entries(scores).forEach(([areaId, points]) => {
    next[areaId] = (next[areaId] ?? 0) + points;
  });
  return next;
}
