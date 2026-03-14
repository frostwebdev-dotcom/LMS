"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface StaffOption {
  id: string;
  label: string;
}

interface ModuleOption {
  id: string;
  title: string;
}

interface ProgressFiltersProps {
  staffOptions: StaffOption[];
  moduleOptions: ModuleOption[];
  currentStaffId: string | null;
  currentModuleId: string | null;
}

export function ProgressFilters({
  staffOptions,
  moduleOptions,
  currentStaffId,
  currentModuleId,
}: ProgressFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/progress?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Employee</span>
        <select
          value={currentStaffId ?? ""}
          onChange={(e) => updateFilter("staff", e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 min-w-[180px]"
          aria-label="Filter by employee"
        >
          <option value="">All staff</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Module</span>
        <select
          value={currentModuleId ?? ""}
          onChange={(e) => updateFilter("module", e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 min-w-[180px]"
          aria-label="Filter by module"
        >
          <option value="">All modules</option>
          {moduleOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </label>
      {(currentStaffId || currentModuleId) && (
        <button
          type="button"
          onClick={() => router.push("/admin/progress")}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
