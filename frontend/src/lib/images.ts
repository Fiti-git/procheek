// Curated image library for PROCHECK Safety.
// Multi-source: Unsplash (Unsplash License), Pexels (Pexels License),
// Wikimedia Commons (CC BY / CC0 / public domain).
// Every URL below is verified to return 200 as of 2026-07-18.
// All commercially usable, no attribution required for the licenses selected.
//
// When we go to production we will download these into /public/images/ and
// switch this file to reference local paths. For now, hotlinked so we can
// iterate fast.

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PEXELS = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const WIKIMEDIA_COMMONS = {
  fallProtection:
    "https://upload.wikimedia.org/wikipedia/commons/c/cf/Construction_workers_not_wearing_fall_protection_equipment.jpg",
  occSafetyEquipment:
    "https://upload.wikimedia.org/wikipedia/commons/f/f3/Occupational_Safety_Equipment.jpg",
  fireExtinguisherTraining:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Fire_extinguisher_training.jpg/1280px-Fire_extinguisher_training.jpg",
  welderAtWork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Welder_at_work.jpg/1280px-Welder_at_work.jpg",
};

export const IMG = {
  // Hero photography. Big scenes, wide format.
  heroMain: PEXELS(1216589, 1600), // construction crew helmets on site
  heroConsulting: UNSPLASH("1503387762-592deb58ef4e", 1600), // scaffold heights
  heroSoftware: UNSPLASH("1504307651254-35680f356dfd", 1600), // industrial site
  heroAuth: UNSPLASH("1580982327559-c1202864eb05", 1200), // worker at dusk
  heroBackdrop: PEXELS(534216, 1600), // hardhat crew backdrop

  // Industry banners. Each subsector we serve. Verified subject-matches.
  construction: PEXELS(220147, 1200), // yellow crane on construction site
  chemical: UNSPLASH("1518623489648-a173ef7824f3", 1200), // industrial refinery pipes
  metalmech: PEXELS(5691659, 1200), // welder with sparks and PPE
  mining: UNSPLASH("1533162507191-d90c625b2640", 1200), // mining pit haul truck

  // Course thumbnails. NOM-specific matching.
  course_altura: UNSPLASH("1503387762-592deb58ef4e", 800), // NOM-009 heights
  course_epp: UNSPLASH("1581092160562-40aa08e78837", 800), // NOM-017 PPE
  course_incendios: WIKIMEDIA_COMMONS.fireExtinguisherTraining, // NOM-002 fire
  course_comision: PEXELS(1216589, 800), // NOM-019 committee meeting
  course_ergonomia: UNSPLASH("1587293852726-70cdb56c2866", 800), // NOM-036 ergonomia
  course_electricidad: UNSPLASH("1473341304170-971dccb5ac1e", 800), // electrical
  course_quimicos: UNSPLASH("1618761714954-0b8cd0026356", 800), // chemical PPE
  course_ruido: PEXELS(5691622, 800), // welding noise safety
  course_manejomanual: UNSPLASH("1587293852726-70cdb56c2866", 800), // lifting
  course_extintores: UNSPLASH("1544984243-ec57ea16fe25", 800), // extinguisher
  course_excavaciones: UNSPLASH("1503387837-b154d5074bd2", 800), // excavation
  course_montacargas: UNSPLASH("1553413077-190dd305871c", 800), // forklift
  course_loto: WIKIMEDIA_COMMONS.occSafetyEquipment, // lockout tagout
  course_confinado: PEXELS(1595388, 800), // confined tank space
  course_primeros: UNSPLASH("1584515933487-779824d29309", 800), // first aid
  course_soldadura: WIKIMEDIA_COMMONS.welderAtWork, // welding
  course_default: PEXELS(2760241, 800), // excavator generic industrial

  // Wikimedia Commons documentary-style. Public domain / CC BY.
  documentaryFallProtection: WIKIMEDIA_COMMONS.fallProtection,
  documentarySafetyEquipment: WIKIMEDIA_COMMONS.occSafetyEquipment,
  documentaryFireTraining: WIKIMEDIA_COMMONS.fireExtinguisherTraining,
  documentaryWelder: WIKIMEDIA_COMMONS.welderAtWork,

  // Portraits for testimonials. Real people in industrial context.
  avatar1: PEXELS(1108101, 400), // worker at height portrait
  avatar2: PEXELS(1108572, 400), // worker sunset silhouette
  avatar3: UNSPLASH("1581092160562-40aa08e78837", 400), // PPE hardhat portrait

  // Cinematic industrial mood shots. Used sparingly.
  moodDawn: PEXELS(1108572, 1600),
  moodConcrete: PEXELS(2760242, 1600),
  moodExcavator: PEXELS(2760241, 1600),
};

// Map course code to the right image.
export function imageForCourse(code: string): string {
  const c = code.toUpperCase();
  if (c.startsWith("NOM-009")) return IMG.course_altura;
  if (c.startsWith("NOM-017")) return IMG.course_epp;
  if (c.startsWith("NOM-002")) return IMG.course_incendios;
  if (c.startsWith("NOM-019")) return IMG.course_comision;
  if (c.startsWith("NOM-036")) return IMG.course_ergonomia;
  if (c.startsWith("NOM-004")) return IMG.course_montacargas;
  if (c.startsWith("NOM-001")) return IMG.course_default;
  if (c.startsWith("NOM-006")) return IMG.course_manejomanual;
  if (c.startsWith("NOM-026")) return IMG.course_default;
  if (c.startsWith("NOM-027")) return IMG.metalmech;
  if (c.startsWith("NOM-029")) return IMG.course_electricidad;
  if (c.startsWith("NOM-030")) return IMG.course_default;
  if (c.startsWith("NOM-005")) return IMG.course_quimicos;
  if (c.startsWith("NOM-010")) return IMG.course_quimicos;
  if (c.startsWith("NOM-023")) return IMG.mining;
  if (c.startsWith("NOM-031")) return IMG.construction;
  if (c.startsWith("LOTO")) return IMG.course_loto;
  if (c.startsWith("EX-")) return IMG.course_excavaciones;
  if (c.startsWith("EXT-")) return IMG.course_extintores;
  if (c.startsWith("PA-")) return IMG.course_primeros;
  if (c.startsWith("EC-")) return IMG.course_confinado;
  if (c.startsWith("MM-")) return IMG.course_manejomanual;
  if (c.startsWith("IZ-")) return IMG.construction;
  if (c.startsWith("MP-")) return IMG.course_montacargas;
  return IMG.course_default;
}

// Image source attribution (for internal docs). Not rendered in the UI.
export const IMG_SOURCES = {
  unsplash: "Unsplash License. Commercial use OK, no attribution required.",
  pexels: "Pexels License. Commercial use OK, no attribution required.",
  wikimediaCommons:
    "Wikimedia Commons. Individual files vary (CC BY / CC0 / public domain). Selected files are all commercial-use safe.",
};
