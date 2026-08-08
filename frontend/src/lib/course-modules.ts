import type { Course } from "./courses";

export type ModuleInfo = {
  index: number;
  title: string;
  duration: string;
  description: string;
  isExam: boolean;
};

const CUSTOM: Record<string, string[]> = {
  "NOM-009": [
    "Marco legal STPS",
    "Equipos y sistemas de restricción",
    "Anclajes y conexiones",
    "Procedimientos de rescate en altura",
    "Examen final y práctica",
  ],
  "NOM-017": [
    "Introducción a EPP",
    "Selección de EPP por riesgo",
    "Uso correcto y mantenimiento",
    "Casos prácticos",
    "Examen final",
  ],
  "NOM-002": [
    "Clases de fuego y agentes extintores",
    "Prevención de incendios en centros de trabajo",
    "Brigadas y planes de emergencia",
    "Simulacros y rutas de evacuación",
    "Examen final",
  ],
  "NOM-019": [
    "Marco legal de las comisiones",
    "Integración y funciones",
    "Recorridos de verificación",
    "Reportes y programa anual",
    "Examen final",
  ],
  "NOM-036": [
    "Factores de riesgo ergonómico",
    "Manejo manual de cargas",
    "Postura, fuerza y repetitividad",
    "Programa ergonómico",
    "Examen final",
  ],
};

const GENERIC_TEMPLATES: Record<string, string[]> = {
  quimica: [
    "Marco legal y hojas de datos",
    "Identificación de riesgos químicos",
    "Uso de EPP especializado",
    "Procedimientos de emergencia",
    "Examen final",
  ],
  metalmecanica: [
    "Marco legal aplicable",
    "Identificación de riesgos operativos",
    "Uso seguro de equipos",
    "Procedimientos de emergencia y rescate",
    "Examen final",
  ],
  mineria: [
    "Marco legal minero",
    "Riesgos subterráneos y superficiales",
    "Equipo de protección y ventilación",
    "Procedimientos de emergencia",
    "Examen final",
  ],
  construccion: [
    "Marco legal STPS aplicable",
    "Identificación de riesgos en obra",
    "Uso de EPP y equipos",
    "Procedimientos y controles",
    "Examen final",
  ],
  general: [
    "Marco legal STPS",
    "Identificación de riesgos",
    "Uso correcto de equipos y controles",
    "Casos prácticos",
    "Examen final",
  ],
};

const DURATIONS = ["35 min", "45 min", "40 min", "50 min", "45 min"];

export function getModulesForCourse(course: Course): ModuleInfo[] {
  const titles =
    CUSTOM[course.code] || GENERIC_TEMPLATES[course.industry] || GENERIC_TEMPLATES.general;
  return titles.map((title, i) => ({
    index: i + 1,
    title,
    duration: DURATIONS[i] || "40 min",
    description: `Contenido del módulo ${i + 1}: ${title.toLowerCase()}. Materiales descargables y videos narrados.`,
    isExam: i === titles.length - 1,
  }));
}

const LEARNING: Record<string, string[]> = {
  "NOM-009": [
    "Identificar los requisitos legales aplicables a trabajos en altura",
    "Seleccionar equipo de protección contra caídas adecuado",
    "Aplicar procedimientos de anclaje y conexión seguros",
    "Ejecutar planes de rescate en altura",
    "Realizar inspecciones pre-uso del equipo",
    "Documentar permisos de trabajo conforme a la norma",
  ],
  "NOM-017": [
    "Analizar riesgos para seleccionar EPP",
    "Aplicar criterios de uso y mantenimiento",
    "Documentar entregas y capacitación",
    "Identificar EPP dañado y descartarlo",
    "Cumplir con requisitos STPS",
    "Formar a personal en uso correcto",
  ],
  "NOM-002": [
    "Identificar clases de fuego y agentes",
    "Diseñar rutas de evacuación",
    "Formar brigadas contra incendio",
    "Aplicar procedimientos de simulacro",
    "Elaborar el programa interno",
    "Documentar inspecciones",
  ],
  "NOM-019": [
    "Constituir la comisión conforme a la norma",
    "Elaborar programa anual",
    "Realizar recorridos de verificación",
    "Documentar hallazgos",
    "Reportar riesgos identificados",
    "Coordinar acciones correctivas",
  ],
  "NOM-036": [
    "Identificar factores de riesgo ergonómico",
    "Aplicar métodos de evaluación",
    "Diseñar programa ergonómico",
    "Capacitar en manejo manual",
    "Prevenir trastornos músculo-esqueléticos",
    "Documentar vigilancia a la salud",
  ],
};

export function getLearningOutcomes(course: Course): string[] {
  return (
    LEARNING[course.code] || [
      "Comprender el marco legal STPS aplicable",
      "Identificar los principales riesgos del entorno",
      "Aplicar controles y procedimientos preventivos",
      "Utilizar equipo de protección correctamente",
      "Documentar la capacitación conforme a la norma",
      "Actuar de forma segura ante contingencias",
    ]
  );
}
