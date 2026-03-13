/**
 * Displays lesson view/completion state. Structured so completion tracking
 * can be extended later (e.g. viewed_at, in_progress).
 */
type LessonViewState = "not_started" | "complete";

interface LessonViewStateBadgeProps {
  state: LessonViewState;
  className?: string;
}

const config: Record<LessonViewState, { label: string; className: string }> = {
  not_started: {
    label: "Not started",
    className: "bg-slate-100 text-slate-600",
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-100 text-emerald-800",
  },
};

export function LessonViewStateBadge({ state, className = "" }: LessonViewStateBadgeProps) {
  const { label, className: stateClass } = config[state];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${stateClass} ${className}`}
    >
      {label}
    </span>
  );
}
