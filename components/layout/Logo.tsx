import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/images/branding/harmony.jpeg";
const BRAND_NAME = "Harmony Hearts Homecare";

interface LogoProps {
  /** Wrap in link to this href (e.g. /dashboard). Omit for static logo (e.g. login page). */
  href?: string;
  /** Height in pixels; width scales. Default 40. */
  height?: number;
  /** Optional custom class for the wrapper. */
  className?: string;
}

export function Logo({ href, height = 40, className = "" }: LogoProps) {
  const img = (
    <Image
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={height * 2}
      height={height}
      className="object-contain"
      priority
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded ${className}`}
        aria-label={`${BRAND_NAME} home`}
      >
        {img}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {img}
    </div>
  );
}
