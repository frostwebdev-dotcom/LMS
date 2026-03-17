"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TrainingModule } from "@/types/database";

interface ModuleSelectorProps {
  modules: TrainingModule[];
  currentModuleId: string | null;
  currentModuleTitle: string | null;
}

export function ModuleSelector({
  modules,
  currentModuleId,
  currentModuleTitle,
}: ModuleSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value) {
      router.push(`/admin/assignments?moduleId=${encodeURIComponent(value)}`);
    } else {
      router.push("/admin/assignments");
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor="assignment-module-select" className="block text-sm font-medium text-slate-700">
        Select module
      </label>
      <select
        id="assignment-module-select"
        value={currentModuleId ?? ""}
        onChange={handleChange}
        className="block w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
        aria-describedby="assignment-module-hint"
      >
        <option value="">Choose a module…</option>
        {modules.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
            {!m.is_published ? " (draft)" : ""}
          </option>
        ))}
      </select>
      <p id="assignment-module-hint" className="text-xs text-slate-500">
        {currentModuleTitle
          ? `Managing assignments for: ${currentModuleTitle}`
          : "Select a module to assign it to roles or employees."}
      </p>
    </div>
  );
}
