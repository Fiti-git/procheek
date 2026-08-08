export type QuizQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

const NOM_009: QuizQuestion[] = [
  {
    id: 1,
    text: "¿A partir de qué altura se considera un trabajo en altura según la NOM-009-STPS?",
    options: ["1.5 metros", "1.8 metros", "2 metros", "3 metros"],
    correctIndex: 1,
  },
  {
    id: 2,
    text: "¿Cuál es el equipo básico de un sistema personal de detención de caídas?",
    options: [
      "Arnés, línea de vida y anclaje",
      "Casco y guantes",
      "Botas y chaleco",
      "Cuerda y silbato",
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    text: "¿Con qué frecuencia debe inspeccionarse el arnés de cuerpo completo?",
    options: ["Cada mes", "Cada año", "Antes de cada uso", "Cada 5 años"],
    correctIndex: 2,
  },
  {
    id: 4,
    text: "¿Cuál es la resistencia mínima que debe soportar un anclaje?",
    options: ["500 kg", "1,000 kg", "2,272 kg", "5,000 kg"],
    correctIndex: 2,
  },
  {
    id: 5,
    text: "¿Qué documento debe emitirse antes de iniciar un trabajo en altura?",
    options: [
      "Factura",
      "Permiso de trabajo",
      "Contrato laboral",
      "Recibo interno",
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    text: "El plan de rescate en altura debe estar disponible:",
    options: [
      "Solo si hay incidente",
      "Antes de iniciar el trabajo",
      "A criterio del supervisor",
      "Al terminar la jornada",
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    text: "¿Cuál es la vigencia del certificado DC-3 para trabajos en altura?",
    options: ["6 meses", "12 meses", "24 meses", "Indefinida"],
    correctIndex: 1,
  },
  {
    id: 8,
    text: "El factor de caída máximo aceptable en un sistema es:",
    options: ["0", "1", "2", "3"],
    correctIndex: 2,
  },
  {
    id: 9,
    text: "¿Qué prohíbe la NOM-009-STPS?",
    options: [
      "Trabajar con arnés",
      "Trabajar sin capacitación certificada",
      "Usar casco",
      "Usar línea de vida",
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    text: "¿Quién es responsable de proveer el equipo de protección contra caídas?",
    options: ["El trabajador", "El patrón", "El sindicato", "La STPS"],
    correctIndex: 1,
  },
];

const NOM_017: QuizQuestion[] = [
  {
    id: 1,
    text: "¿Qué significa EPP?",
    options: [
      "Equipo de Protección Personal",
      "Equipo Preventivo de Producción",
      "Elemento Personal Portátil",
      "Estándar de Protección Profesional",
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    text: "¿Quién debe proveer el EPP al trabajador?",
    options: ["El trabajador", "El patrón", "El IMSS", "El sindicato"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "El análisis de riesgos debe realizarse:",
    options: [
      "Antes de asignar EPP",
      "Después de un accidente",
      "Cada 5 años",
      "Solo si lo solicita STPS",
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    text: "¿Cada cuánto debe capacitarse al personal sobre uso del EPP?",
    options: ["Al ingresar", "Cuando cambie el riesgo", "Ambas anteriores", "Nunca"],
    correctIndex: 2,
  },
  {
    id: 5,
    text: "El EPP contra ruido se selecciona según:",
    options: ["Marca", "Precio", "Nivel de decibelios", "Talla"],
    correctIndex: 2,
  },
  {
    id: 6,
    text: "¿Qué EPP se requiere para proyección de partículas?",
    options: ["Solo guantes", "Lentes de seguridad", "Casco", "Fajilla"],
    correctIndex: 1,
  },
  {
    id: 7,
    text: "Los guantes dieléctricos protegen contra:",
    options: ["Cortes", "Riesgo eléctrico", "Calor", "Sustancias"],
    correctIndex: 1,
  },
  {
    id: 8,
    text: "El EPP dañado debe:",
    options: ["Repararse en casa", "Reemplazarse", "Guardarse", "Venderse"],
    correctIndex: 1,
  },
  {
    id: 9,
    text: "¿Qué documento acredita la entrega de EPP?",
    options: [
      "Vale firmado",
      "Fotografía",
      "Recibo de nómina",
      "Verbal es suficiente",
    ],
    correctIndex: 0,
  },
  {
    id: 10,
    text: "El calzado de seguridad debe cumplir con:",
    options: [
      "Norma NOM-113-STPS",
      "Norma ISO 9000",
      "Reglamento interno",
      "Preferencia del patrón",
    ],
    correctIndex: 0,
  },
];

const NOM_002: QuizQuestion[] = [
  {
    id: 1,
    text: "¿Qué regula la NOM-002-STPS?",
    options: [
      "EPP",
      "Prevención y protección contra incendios",
      "Trabajos en altura",
      "Ergonomía",
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    text: "Los extintores deben inspeccionarse:",
    options: ["Anualmente", "Mensualmente", "Cada 5 años", "Solo tras uso"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "¿Qué clase de fuego involucra líquidos inflamables?",
    options: ["Clase A", "Clase B", "Clase C", "Clase D"],
    correctIndex: 1,
  },
  {
    id: 4,
    text: "Las brigadas contra incendio deben capacitarse:",
    options: ["Nunca", "Cada dos años", "Al menos una vez al año", "Solo al inicio"],
    correctIndex: 2,
  },
  {
    id: 5,
    text: "La ruta de evacuación debe estar:",
    options: ["Despejada y señalizada", "Solo señalizada", "Cerrada", "Bloqueada por seguridad"],
    correctIndex: 0,
  },
  {
    id: 6,
    text: "El simulacro de incendio debe realizarse al menos:",
    options: ["Una vez al año", "Cada 5 años", "Solo si hay incidente", "Nunca"],
    correctIndex: 0,
  },
  {
    id: 7,
    text: "Un fuego clase C involucra:",
    options: ["Sólidos", "Líquidos", "Equipo eléctrico energizado", "Metales"],
    correctIndex: 2,
  },
  {
    id: 8,
    text: "¿Qué agente extintor NO debe usarse en fuego clase C?",
    options: ["CO2", "Agua", "Polvo químico seco", "Halón"],
    correctIndex: 1,
  },
  {
    id: 9,
    text: "El punto de reunión debe estar:",
    options: ["Dentro del edificio", "En zona segura y señalizada", "Sin señalización", "En sótano"],
    correctIndex: 1,
  },
  {
    id: 10,
    text: "¿Quién aprueba el programa interno de protección civil?",
    options: ["STPS", "Autoridad de protección civil", "IMSS", "Sindicato"],
    correctIndex: 1,
  },
];

const NOM_019: QuizQuestion[] = [
  {
    id: 1,
    text: "La NOM-019-STPS trata sobre:",
    options: [
      "Comisiones de Seguridad e Higiene",
      "EPP",
      "Incendios",
      "Ergonomía",
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    text: "¿Cada cuánto debe reunirse la Comisión de Seguridad e Higiene?",
    options: ["Semanalmente", "Al menos cada mes", "Anualmente", "Solo tras accidente"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "La comisión debe integrarse por:",
    options: [
      "Solo patrones",
      "Solo trabajadores",
      "Representantes de patrón y trabajadores",
      "Solo STPS",
    ],
    correctIndex: 2,
  },
  {
    id: 4,
    text: "El acta de constitución de la comisión debe:",
    options: ["Registrarse ante STPS", "Guardarse en oficina", "Publicarse en diario", "Enviarse al IMSS"],
    correctIndex: 0,
  },
  {
    id: 5,
    text: "La comisión realiza:",
    options: ["Verificaciones periódicas", "Sanciones legales", "Contrataciones", "Nóminas"],
    correctIndex: 0,
  },
  {
    id: 6,
    text: "Los recorridos de verificación deben ser:",
    options: ["Anuales", "Al menos cada mes", "Cada 3 años", "Nunca obligatorios"],
    correctIndex: 1,
  },
  {
    id: 7,
    text: "El diagnóstico de seguridad debe incluir:",
    options: ["Riesgos identificados", "Costos", "Salarios", "Nada"],
    correctIndex: 0,
  },
  {
    id: 8,
    text: "El coordinador de la comisión es electo por:",
    options: ["Patrón", "Trabajadores", "Ambas partes", "STPS"],
    correctIndex: 2,
  },
  {
    id: 9,
    text: "El programa anual debe presentarse en:",
    options: ["Los primeros 3 meses del año", "Diciembre", "Cuando lo pida STPS", "No se presenta"],
    correctIndex: 0,
  },
  {
    id: 10,
    text: "Las actas deben conservarse por:",
    options: ["1 año", "2 años", "5 años", "10 años"],
    correctIndex: 2,
  },
];

const NOM_036: QuizQuestion[] = [
  {
    id: 1,
    text: "La NOM-036-STPS regula:",
    options: [
      "Factores de riesgo ergonómico",
      "Ruido",
      "Trabajos en altura",
      "Química",
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    text: "¿Cuál es el peso máximo recomendado para hombres en manejo manual?",
    options: ["10 kg", "25 kg", "50 kg", "80 kg"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "Las posturas forzadas pueden causar:",
    options: [
      "Trastornos musculo-esqueléticos",
      "Fracturas inmediatas",
      "Hipertensión",
      "Alergias",
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    text: "Un movimiento repetitivo se considera de riesgo cuando:",
    options: [
      "Ocurre más de 2 veces por minuto",
      "Ocurre una vez al día",
      "Se realiza sentado",
      "Es voluntario",
    ],
    correctIndex: 0,
  },
  {
    id: 5,
    text: "El levantamiento manual debe realizarse:",
    options: [
      "Con espalda recta y piernas flexionadas",
      "Con espalda encorvada",
      "Con una sola mano",
      "Sin mirar la carga",
    ],
    correctIndex: 0,
  },
  {
    id: 6,
    text: "La vigilancia a la salud debe incluir:",
    options: [
      "Evaluación médica periódica",
      "Solo revisión visual",
      "Nada",
      "Solo al ingreso",
    ],
    correctIndex: 0,
  },
  {
    id: 7,
    text: "¿Qué método se usa para evaluar riesgo ergonómico?",
    options: ["RULA", "OSHA", "ISO 9000", "COPC"],
    correctIndex: 0,
  },
  {
    id: 8,
    text: "El empujar/jalar cargas debe considerar:",
    options: ["Fuerza aplicada", "Solo peso", "Solo distancia", "Nada"],
    correctIndex: 0,
  },
  {
    id: 9,
    text: "Un factor de riesgo ergonómico NO es:",
    options: ["Postura", "Fuerza", "Repetitividad", "Color de pared"],
    correctIndex: 3,
  },
  {
    id: 10,
    text: "El programa ergonómico debe:",
    options: [
      "Documentarse y actualizarse",
      "Ser verbal",
      "Cambiar cada semana",
      "No existir",
    ],
    correctIndex: 0,
  },
];

const GENERIC: QuizQuestion[] = [
  {
    id: 1,
    text: "¿Qué institución regula la seguridad e higiene laboral en México?",
    options: ["STPS", "SEP", "SAT", "IMSS"],
    correctIndex: 0,
  },
  {
    id: 2,
    text: "El certificado que acredita capacitación se conoce como:",
    options: ["DC-3", "DC-4", "NOM-1", "STPS-01"],
    correctIndex: 0,
  },
  {
    id: 3,
    text: "¿Qué debe realizarse antes de iniciar una tarea de riesgo?",
    options: ["Análisis de riesgo", "Comer", "Firmar recibo", "Nada"],
    correctIndex: 0,
  },
  {
    id: 4,
    text: "El EPP es responsabilidad de proveer del:",
    options: ["Trabajador", "Patrón", "Sindicato", "Cliente"],
    correctIndex: 1,
  },
  {
    id: 5,
    text: "La capacitación en seguridad debe ser:",
    options: ["Periódica y documentada", "Ocasional", "Verbal", "Opcional"],
    correctIndex: 0,
  },
  {
    id: 6,
    text: "En caso de accidente, primero debe:",
    options: [
      "Asegurar la zona",
      "Llamar al jefe",
      "Continuar trabajando",
      "Buscar culpables",
    ],
    correctIndex: 0,
  },
  {
    id: 7,
    text: "Las señales de seguridad se rigen por:",
    options: ["NOM-026-STPS", "NOM-017-STPS", "NOM-002-STPS", "NOM-019-STPS"],
    correctIndex: 0,
  },
  {
    id: 8,
    text: "La vigencia típica de un DC-3 STPS es:",
    options: ["12 meses", "6 meses", "5 años", "Indefinida"],
    correctIndex: 0,
  },
  {
    id: 9,
    text: "El reporte de incidentes debe:",
    options: ["Documentarse", "Ocultarse", "Ignorarse", "Comentarse solo verbal"],
    correctIndex: 0,
  },
  {
    id: 10,
    text: "La mejora continua en seguridad implica:",
    options: [
      "Revisar y actualizar procesos",
      "Mantener todo igual",
      "Reducir capacitación",
      "Eliminar EPP",
    ],
    correctIndex: 0,
  },
];

export function getQuizForCourse(courseCode: string): QuizQuestion[] {
  const c = courseCode.toUpperCase();
  if (c.startsWith("NOM-009")) return NOM_009;
  if (c.startsWith("NOM-017")) return NOM_017;
  if (c.startsWith("NOM-002")) return NOM_002;
  if (c.startsWith("NOM-019")) return NOM_019;
  if (c.startsWith("NOM-036")) return NOM_036;
  return GENERIC;
}
