/**
 * Visual theme per category for admin dashboard cards (slug/icon driven, not hardcoded to three rows).
 */
export type TrainingCategoryVisualTheme = "emerald" | "sky" | "violet" | "teal";

export function resolveTrainingCategoryVisualTheme(slug: string, icon: string | null): TrainingCategoryVisualTheme {
  const s = slug.toLowerCase();
  const i = (icon ?? "").toLowerCase();
  const key = `${s} ${i}`;

  if (s === "homecare" || (key.includes("homecare") && !key.includes("health"))) {
    return "emerald";
  }
  if (
    s === "home-healthcare" ||
    s.includes("home-health") ||
    key.includes("healthcare") ||
    key.includes("stethoscope") ||
    key.includes("medic")
  ) {
    return "sky";
  }
  if (s === "leadership" || key.includes("leadership") || key.includes("users") || key.includes("people")) {
    return "violet";
  }
  return "teal";
}

export const trainingCategoryThemeClasses: Record<
  TrainingCategoryVisualTheme,
  {
    iconWrap: string;
    iconStroke: string;
    title: string;
    badge: string;
    listRow: string;
    listRowHover: string;
  }
> = {
  emerald: {
    iconWrap: "bg-emerald-100 ring-1 ring-emerald-200/90",
    iconStroke: "text-emerald-800",
    title: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80",
    listRow: "bg-emerald-50/50 border-emerald-100/80",
    listRowHover: "hover:border-emerald-200 hover:bg-emerald-50",
  },
  sky: {
    iconWrap: "bg-sky-100 ring-1 ring-sky-200/90",
    iconStroke: "text-sky-800",
    title: "text-sky-800",
    badge: "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80",
    listRow: "bg-sky-50/50 border-sky-100/80",
    listRowHover: "hover:border-sky-200 hover:bg-sky-50",
  },
  violet: {
    iconWrap: "bg-violet-100 ring-1 ring-violet-200/90",
    iconStroke: "text-violet-800",
    title: "text-violet-800",
    badge: "bg-violet-100 text-violet-900 ring-1 ring-violet-200/80",
    listRow: "bg-violet-50/50 border-violet-100/80",
    listRowHover: "hover:border-violet-200 hover:bg-violet-50",
  },
  teal: {
    iconWrap: "bg-primary-100 ring-1 ring-primary-200/90",
    iconStroke: "text-primary-800",
    title: "text-primary-900",
    badge: "bg-primary-100 text-primary-900 ring-1 ring-primary-200/80",
    listRow: "bg-primary-50/40 border-primary-100/80",
    listRowHover: "hover:border-primary-200 hover:bg-primary-50",
  },
};
