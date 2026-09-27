// Pipeline-wide configuration. Edit here to retarget an environment.
export const BASE_URL = process.env.GUIDE_BASE_URL || 'https://procheck.mx';
export const VIEWPORT = { width: 1440, height: 900 };
export const OUT_DATA_DIR = new URL('../data/', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:');
export const OUT_SCREENS_DIR = new URL('../screens/', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:');
export const SCREEN_PADDING_PX = 6;
export const LABEL_OFFSET = { dx: 20, dy: 40 };

// Test users. Passwords are seeded by the backend for the demo tenant;
// change to real production credentials when re-running against live.
export const USERS = {
  admin: { email: 'admin@procheeck.mx', password: 'ProCheck2026!' },
  employee: { email: 'empleado@procheeck.mx', password: 'Employee2026!' },
  trainer: { email: 'capacitador@procheeck.mx', password: 'Trainer2026!' },
  vendedor: { email: 'vendedor@procheeck.mx', password: 'Vendor2026!' },
  clientAdmin: { email: 'admin.cliente@procheeck.mx', password: 'ClientAdmin2026!' },
};

// Color palette used by both capture callouts and the rendered manual.
export const COLORS = {
  primary: '#059669',   // green — primary elements
  secondary: '#2563EB', // blue  — inputs / secondary
  accent: '#DC2626',    // red   — destructive / warnings
  gold: '#FBB601',      // brand gold
  navy: '#0F1E3D',      // brand navy
};
