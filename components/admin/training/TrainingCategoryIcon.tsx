/**
 * Themed icon tiles for training category cards (Harmony Hearts reference visuals).
 * Homecare, Home Healthcare, and Leadership use provided image assets.
 */

function pickGlyph(slug: string, icon: string | null): "homecare" | "homeHealthcare" | "leadership" | "fallback" {
  const key = `${slug.toLowerCase()} ${(icon ?? "").toLowerCase()}`;
  if (slug.toLowerCase() === "homecare" || (key.includes("homecare") && !key.includes("health"))) {
    return "homecare";
  }
  if (
    slug.toLowerCase() === "home-healthcare" ||
    slug.toLowerCase() === "home-health-care" ||
    key.includes("home-health") ||
    (key.includes("healthcare") && !key.includes("homecare")) ||
    key.includes("stethoscope") ||
    key.includes("medic")
  ) {
    return "homeHealthcare";
  }
  if (
    slug.toLowerCase() === "leadership" ||
    key.includes("leadership") ||
    key.includes("users") ||
    key.includes("people")
  ) {
    return "leadership";
  }
  return "fallback";
}

function IconFallback() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
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

  const inner =
    glyph === "homecare" ? (
      <img
        src="/images/branding/category-homecare.png"
        alt=""
        aria-hidden
        className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
      />
    ) : glyph === "homeHealthcare" ? (
      <img
        src="/images/branding/category-home-healthcare.png"
        alt=""
        aria-hidden
        className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
      />
    ) : glyph === "leadership" ? (
      <img
        src="/images/branding/category-leadership.png"
        alt=""
        aria-hidden
        className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
      />
    ) : (
      <span className={iconStrokeClass}>
        <IconFallback />
      </span>
    );

  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${iconWrapClass}`}
      title={label}
      aria-hidden
    >
      {inner}
    </div>
  );
}
