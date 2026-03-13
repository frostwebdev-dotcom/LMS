/**
 * Reusable display for estimated duration in minutes.
 * Renders e.g. "5 min", "1 hr 15 min".
 */
interface DurationDisplayProps {
  minutes: number;
  className?: string;
}

export function DurationDisplay({ minutes, className = "" }: DurationDisplayProps) {
  const value = Math.max(0, Math.round(minutes));
  if (value < 60) {
    return (
      <span className={className}>
        {value} min
      </span>
    );
  }
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return (
    <span className={className}>
      {hours} hr{mins > 0 ? ` ${mins} min` : ""}
    </span>
  );
}
