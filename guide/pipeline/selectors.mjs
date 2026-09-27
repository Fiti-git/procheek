/**
 * Shared selector library. Everything reused across multiple flows lives here
 * so a UI rename only needs to change one spot.
 */

// Dashboard shell
export const SIDEBAR = 'aside, nav[aria-label*="dashboard" i], [class*="sidebar" i]';
export const TOPBAR = 'header, [class*="topbar" i]';
export const USER_MENU = '[aria-label*="usuario" i], [class*="user-menu" i], button:has-text("Cerrar sesión")';

// Sidebar links (dashboard nav)
export const NAV_CURSOS = 'a[href*="/dashboard/courses"]:not([href*="admin"])';
export const NAV_CERTIFICADOS = 'a[href="/dashboard/certificates"], a[href$="/dashboard/certificates"]';
export const NAV_EQUIPO = 'a[href$="/dashboard/team"]';
export const NAV_REPORTES = 'a[href$="/dashboard/reports"]';
export const NAV_BIBLIOTECA = 'a[href$="/dashboard/library"]';
export const NAV_CUENTA = 'a[href$="/dashboard/account"]';
export const NAV_ADMIN_CURSOS = 'a[href*="/dashboard/admin/courses"]';
export const NAV_ADMIN_CERTS = 'a[href*="/dashboard/admin/certificates"]';

// Common patterns
export const PRIMARY_CTA = 'button.btn-primary, a.btn-primary';
export const TABLE = 'table';
export const KPI_CARD = '.grid > div:has(.font-display)';
