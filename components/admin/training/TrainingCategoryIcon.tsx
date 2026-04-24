/**
 * Themed icon tile for admin training category cards (slug/icon → glyph + colors from parent).
 */

const iconGlyphs = {
  home: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  ),
  medicalKit: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </>
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  ),
  fallback: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
} as const;

function pickGlyph(slug: string, icon: string | null): keyof typeof iconGlyphs {
  const key = `${slug.toLowerCase()} ${(icon ?? "").toLowerCase()}`;
  if (slug.toLowerCase() === "homecare" || (key.includes("homecare") && !key.includes("health"))) {
    return "home";
  }
  if (
    slug.toLowerCase() === "home-healthcare" ||
    key.includes("home-health") ||
    key.includes("healthcare") ||
    key.includes("stethoscope") ||
    key.includes("medic")
  ) {
    return "medicalKit";
  }
  if (
    slug.toLowerCase() === "leadership" ||
    key.includes("leadership") ||
    key.includes("users") ||
    key.includes("people")
  ) {
    return "users";
  }
  return "fallback";
}

export interface TrainingCategoryIconTileProps {
  icon: string | null;
  slug: string;
  /** Tooltip */
  label: string;
  iconWrapClass: string;
  iconStrokeClass: string;
}

export function TrainingCategoryIconTile({
  icon,
  slug,
  label,
  iconWrapClass,
  iconStrokeClass,
}: TrainingCategoryIconTileProps) {
  const glyph = pickGlyph(slug, icon);

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${iconWrapClass}`}
      title={label}
      aria-hidden
    >
      <svg
        className={`h-7 w-7 shrink-0 sm:h-8 sm:w-8 ${iconStrokeClass}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        aria-hidden
      >
        {iconGlyphs[glyph]}
      </svg>
    </div>
  );
}
