/**
 * PROCHECK quiz bank.
 *
 * MVP: 10 generic Spanish safety/compliance questions used for every course.
 * Client can later expand per NOM code by keying `QUIZ_BY_CODE[code]`.
 *
 * IMPORTANT: `correctIndex` is server-only. Never expose it over HTTP.
 */

export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const GENERIC_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    text: '¿Cuál es el porcentaje mínimo aprobatorio del examen para obtener la constancia DC-3?',
    options: ['70%', '80%', '90%', '100%'],
    correctIndex: 2,
  },
  {
    id: 'q2',
    text: '¿Qué autoridad mexicana emite la normativa oficial (NOM) en materia de seguridad y salud en el trabajo?',
    options: ['IMSS', 'STPS', 'PROFEPA', 'SEMARNAT'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    text: '¿Qué significan las siglas DC-3?',
    options: [
      'Documento de Capacitación 3',
      'Constancia de Competencias o de Habilidades Laborales',
      'Declaración de Cumplimiento 3',
      'Diploma de Certificación 3',
    ],
    correctIndex: 1,
  },
  {
    id: 'q4',
    text: 'Ante un accidente laboral, ¿cuál es la primera acción correcta del personal capacitado?',
    options: [
      'Retirar al accidentado del lugar sin evaluar',
      'Evaluar la escena y garantizar la seguridad antes de intervenir',
      'Grabar el incidente para la investigación',
      'Continuar con las actividades normales',
    ],
    correctIndex: 1,
  },
  {
    id: 'q5',
    text: 'El equipo de protección personal (EPP) debe utilizarse:',
    options: [
      'Solo cuando lo solicite la autoridad',
      'Únicamente durante inspecciones',
      'Siempre que exista el riesgo para el que fue diseñado',
      'Solo si el trabajador lo considera necesario',
    ],
    correctIndex: 2,
  },
  {
    id: 'q6',
    text: '¿Cuál es el objetivo principal de una Comisión de Seguridad e Higiene?',
    options: [
      'Sancionar a los trabajadores que incumplan reglas',
      'Investigar accidentes y proponer medidas preventivas',
      'Sustituir a la STPS en las inspecciones',
      'Elaborar el reglamento interno de trabajo',
    ],
    correctIndex: 1,
  },
  {
    id: 'q7',
    text: 'La constancia DC-3 debe expedirse:',
    options: [
      'Al inicio de la relación laboral',
      'Al concluir un evento de capacitación reconocido',
      'Cada vez que hay una inspección',
      'Solo cuando el trabajador la solicite',
    ],
    correctIndex: 1,
  },
  {
    id: 'q8',
    text: 'Un riesgo laboral se define como:',
    options: [
      'Cualquier accidente ocurrido en horas de trabajo',
      'La probabilidad de que un peligro cause daño a la salud o seguridad',
      'Únicamente lesiones físicas graves',
      'Un descuido del trabajador',
    ],
    correctIndex: 1,
  },
  {
    id: 'q9',
    text: '¿Cuál es la vigencia recomendada de la constancia DC-3 para efectos de recertificación?',
    options: ['6 meses', '1 año', '2 años', 'Indefinida'],
    correctIndex: 2,
  },
  {
    id: 'q10',
    text: '¿Quién es el responsable último de proveer condiciones seguras de trabajo?',
    options: [
      'El trabajador',
      'El sindicato',
      'El patrón / empleador',
      'La Secretaría del Trabajo',
    ],
    correctIndex: 2,
  },
];

/**
 * Per-NOM overrides. If a course code isn't listed here, `getQuizForCode`
 * falls back to `GENERIC_QUIZ`.
 */
export const QUIZ_BY_CODE: Record<string, QuizQuestion[]> = {
  // e.g. 'NOM-009': [...10 questions...],
};

export function getQuizForCode(code: string | null | undefined): QuizQuestion[] {
  if (code && QUIZ_BY_CODE[code]) return QUIZ_BY_CODE[code];
  return GENERIC_QUIZ;
}

/**
 * Public-safe shape (strips `correctIndex`).
 */
export function toPublicQuiz(qs: QuizQuestion[]): {
  questions: Array<{ id: string; text: string; options: string[] }>;
} {
  return {
    questions: qs.map((q) => ({ id: q.id, text: q.text, options: q.options })),
  };
}
