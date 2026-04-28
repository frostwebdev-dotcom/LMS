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
    s === "home-health-care" ||
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
  /** Homecare — mint tile + deep teal glyph (client reference). */
  emerald: {
    iconWrap: "bg-[#e6f9f7] ring-1 ring-[#c8ebe4]",
    iconStroke: "text-[#0d7a70]",
    title: "text-[#0b5c54]",
    badge: "bg-[#e6f9f7] text-[#0b5c54] ring-1 ring-[#c8ebe4]",
    listRow: "bg-[#f4fcfb]/90 border-[#d4efe8]",
    listRowHover: "hover:border-[#b8e4da] hover:bg-[#ecf9f7]",
  },
  /** Home Healthcare — pale blue tile + blue briefcase icon. */
  sky: {
    iconWrap: "bg-[#eff6ff] ring-1 ring-blue-100/90",
    iconStroke: "text-blue-600",
    title: "text-blue-900",
    badge: "bg-blue-50 text-blue-900 ring-1 ring-blue-100/90",
    listRow: "bg-blue-50/40 border-blue-100/80",
    listRowHover: "hover:border-blue-200 hover:bg-blue-50/70",
  },
  /** Leadership — soft lavender tile + rich purple glyph. */
  violet: {
    iconWrap: "bg-[#f5f3ff] ring-1 ring-violet-200/80",
    iconStroke: "text-[#6d28d9]",
    title: "text-violet-900",
    badge: "bg-violet-50 text-violet-900 ring-1 ring-violet-200/80",
    listRow: "bg-violet-50/45 border-violet-100/80",
    listRowHover: "hover:border-violet-200 hover:bg-violet-50/80",
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
