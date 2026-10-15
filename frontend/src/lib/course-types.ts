// Shared course types + API helpers for PROCHECK frontend.
// Replaces the deleted mock-data file `src/lib/courses.ts`.
// All data flows from the backend; nothing in this module fabricates courses.

export type Industry =
  | "quimica"
  | "metalmecanica"
  | "mineria"
  | "construccion"
  | "general";

export type Course = {
  id: string;
  code: string;
  title: string;
  hours: number;
  price: number;
  image: string;
  industry: Industry;
  tier: "basico" | "complementario";
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  isPublished?: boolean;
  slug?: string;
};

// API row shape returned by GET /api/courses. Fields may be null for legacy
// rows created before the code/title/industry/tier columns existed.
export type ApiCourse = {
  id: string;
  code: string | null;
  title: string | null;
  description: string | null;
  hours: number | null;
  price: number | string | null;
  industry: string | null;
  tier: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isPublished?: boolean;
  slug?: string;
  titleEs?: string | null;
  descriptionEs?: string | null;
  priceMxn?: number | string | null;
  durationHours?: number | string | null;
};

export function normalizeCourse(row: ApiCourse): Course {
  const code = row.code || row.slug || row.id;
  const title = row.title || row.titleEs || code;
  const description = row.description || row.descriptionEs || undefined;
  const hours = Number(row.hours ?? row.durationHours ?? 0) || 0;
  const price = Number(row.price ?? row.priceMxn ?? 0) || 0;
  const industry = (row.industry || "general") as Industry;
  const tier = (row.tier || "basico") as "basico" | "complementario";
  const image = row.imageUrl || `/images/courses/${code}.jpg`;
  return {
    id: row.id,
    code,
    title,
    description,
    hours,
    price,
    image,
    imageUrl: row.imageUrl || undefined,
    industry,
    tier,
    isActive: row.isActive,
    isPublished: row.isPublished,
    slug: row.slug,
  };
}

/**
 * Fetch the course catalog from the API. Client-side only.
 * Callers handle loading / error state.
 */
export async function fetchCourses(): Promise<Course[]> {
  const { apiGet } = await import("@/lib/api");
  const rows = await apiGet<ApiCourse[]>("/courses");
  return rows.map(normalizeCourse);
}

/**
 * Admin-only: fetch ALL courses including inactive/unpublished.
 * Requires principal_admin token.
 */
export async function fetchAllCoursesAdmin(): Promise<Course[]> {
  const { apiGet } = await import("@/lib/api");
  const rows = await apiGet<ApiCourse[]>("/courses/admin/all");
  return rows.map(normalizeCourse);
}

export const industries: { key: Industry; label: string }[] = [
  { key: "quimica", label: "Química" },
  { key: "metalmecanica", label: "Metal-mecánica" },
  { key: "mineria", label: "Minería" },
  { key: "construccion", label: "Construcción" },
  { key: "general", label: "Otros" },
];
