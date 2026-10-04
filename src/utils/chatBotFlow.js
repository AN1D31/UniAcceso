// Static definition of the vocational test. Ids and keys are code (English);
// labels and messages are user-facing text (Latin American Spanish).

export const WELCOME_MESSAGE =
  "¡Hola! 👋 Soy el orientador de UniAcceso. Te haré 3 preguntas rápidas para recomendarte universidades y becas.";

export const FLOW_STEPS = [
  {
    id: "area",
    question: "¿Qué área te interesa más?",
    options: [
      { id: "technology", label: "Tecnología", keywords: ["tecnolog", "sistemas", "software", "informat", "comput", "datos"] },
      { id: "health", label: "Salud", keywords: ["salud", "medic", "enfermer", "odontolog", "psicolog", "nutrici"] },
      { id: "business", label: "Negocios", keywords: ["negocio", "administraci", "econom", "contadur", "mercad", "finanz"] },
      { id: "arts", label: "Artes", keywords: ["arte", "dise", "music", "audiovisual", "arquitect"] },
      { id: "engineering", label: "Ingenierías", keywords: ["ingenier"] },
      { id: "education", label: "Educación", keywords: ["educaci", "pedagog", "licenciatura"] },
      { id: "social_sciences", label: "Ciencias sociales y Derecho", keywords: ["derecho", "social", "comunicaci", "politic"] },
      { id: "any", label: "Aún no lo sé", keywords: [] },
    ],
  },
  {
    id: "modality",
    question: "¿Cómo prefieres estudiar?",
    options: [
      { id: "presencial", label: "Presencial" },
      { id: "virtual", label: "Virtual" },
    ],
  },
  {
    id: "funding",
    question: "¿Necesitas apoyo económico?",
    options: [
      { id: "full_scholarship", label: "Busco beca total", coverage: ["total"] },
      { id: "partial_scholarship", label: "Beca parcial", coverage: ["parcial", "matricula", "manutencion"] },
      { id: "no_scholarship", label: "No necesito beca", coverage: [] },
    ],
  },
];

export const COVERAGE_LABELS = {
  total: "Cobertura total",
  parcial: "Cobertura parcial",
  matricula: "Cubre matrícula",
  manutencion: "Cubre manutención",
};
