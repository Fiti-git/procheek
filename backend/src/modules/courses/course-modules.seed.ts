/**
 * Default module template applied to every seeded course.
 * Each course gets 5 modules: Intro, Marco Legal, Contenido Técnico,
 * Casos Prácticos, Examen Final.
 * `titleTemplate` uses `{code}` and `{title}` placeholders.
 */

export type ModuleSeed = {
  position: number;
  titleTemplate: string;
  contentType: 'text' | 'video';
  bodyTemplate: string;
  durationMin: number;
};

export const DEFAULT_MODULE_TEMPLATE: ModuleSeed[] = [
  {
    position: 1,
    titleTemplate: 'Módulo 1 — Introducción a {code}',
    contentType: 'text',
    bodyTemplate:
      'Bienvenido al curso oficial {title}. En este módulo introductorio conocerás:\n\n' +
      '• Objetivos del curso y alcance de la norma\n' +
      '• Marco regulatorio general de la STPS\n' +
      '• Terminología clave\n' +
      '• Estructura del curso y criterios de aprobación (mínimo 90% en el examen final)\n\n' +
      'Al terminar este módulo estarás listo para profundizar en el marco legal aplicable.',
    durationMin: 15,
  },
  {
    position: 2,
    titleTemplate: 'Módulo 2 — Marco legal y normativo',
    contentType: 'text',
    bodyTemplate:
      'La Norma Oficial Mexicana {code} forma parte del sistema regulatorio de seguridad y salud en el trabajo administrado por la STPS.\n\n' +
      'Contenido:\n' +
      '• Fundamento legal (Ley Federal del Trabajo, artículos 132 fracción XVII y 512)\n' +
      '• Reglamento Federal de Seguridad y Salud en el Trabajo\n' +
      '• Obligaciones del patrón\n' +
      '• Derechos y obligaciones del trabajador\n' +
      '• Sanciones por incumplimiento\n\n' +
      'Recuerda que las inspecciones de la STPS pueden solicitar el certificado DC-3 vigente en cualquier momento.',
    durationMin: 25,
  },
  {
    position: 3,
    titleTemplate: 'Módulo 3 — Contenido técnico y procedimientos',
    contentType: 'video',
    bodyTemplate:
      'Este módulo cubre los procedimientos operativos específicos de {code}.\n\n' +
      'Contenido:\n' +
      '• Identificación de riesgos\n' +
      '• Equipo de protección personal requerido\n' +
      '• Procedimientos seguros de operación\n' +
      '• Preparación y planeación del trabajo\n' +
      '• Comunicación y señalización\n\n' +
      'Video de referencia — 20 minutos.',
    durationMin: 30,
  },
  {
    position: 4,
    titleTemplate: 'Módulo 4 — Casos prácticos y análisis',
    contentType: 'text',
    bodyTemplate:
      'Análisis de tres casos reales tomados de inspecciones STPS relacionados con {code}.\n\n' +
      'Caso 1: Trabajador sin capacitación adecuada — incidente y consecuencias legales.\n' +
      'Caso 2: Falta de equipo de protección — sanción a la empresa.\n' +
      'Caso 3: Aplicación correcta del procedimiento — trabajo sin incidentes durante 3 años.\n\n' +
      'Reflexiona sobre las lecciones aprendidas antes de tomar el examen final.',
    durationMin: 20,
  },
  {
    position: 5,
    titleTemplate: 'Módulo 5 — Examen final ({code})',
    contentType: 'text',
    bodyTemplate:
      'Examen de acreditación del curso {title}.\n\n' +
      '• 10 preguntas de opción múltiple\n' +
      '• Puntaje mínimo aprobatorio: 90%\n' +
      '• Al aprobar, PROCHECK emite automáticamente tu certificado DC-3 con folio verificable\n' +
      '• Puedes repetir el examen hasta obtener el puntaje mínimo\n\n' +
      'Marca este módulo como completado al finalizar el examen.',
    durationMin: 20,
  },
];
