"use client";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Optional label, e.g. "75%" */
  label?: string;
  /** Accessibility label */
  "aria-label"?: string;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  "aria-label": ariaLabel,
  className = "",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? (label ? undefined : "Progress")}
        className="h-2 w-full overflow-hidden rounded-full bg-primary-200"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {label != null && (
        <span className="mt-1 block text-xs font-medium text-primary-600">
          {label}
        </span>
      )}
    </div>
  );
}
