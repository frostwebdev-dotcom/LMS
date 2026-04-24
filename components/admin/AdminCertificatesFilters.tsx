import type { ProfileWithRole } from "@/services/admin-users-service";

type ModuleOption = { id: string; title: string };

export function AdminCertificatesFilters({
  modules,
  staffProfiles,
  currentStaffId,
  currentModuleId,
  currentQ,
}: {
  modules: ModuleOption[];
  staffProfiles: ProfileWithRole[];
  currentStaffId: string;
  currentModuleId: string;
  currentQ: string;
}) {
  const staffOnly = staffProfiles.filter((p) => p.role === "staff");

  return (
    <form
      method="get"
      action="/admin/certificates"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <p className="text-sm font-semibold text-slate-900">Find certificates</p>
      <p className="mt-1 text-xs text-slate-500">
        Filter by employee and/or module, or search by name, email, certificate number, or module title.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-staff" className="block text-xs font-medium text-slate-600">
            Employee
          </label>
          <select
            id="filter-staff"
            name="staff"
            defaultValue={currentStaffId}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All staff</option>
            {staffOnly.map((p) => (
              <option key={p.id} value={p.id}>
                {(p.full_name?.trim() || p.email) + (p.full_name?.trim() ? ` · ${p.email}` : "")}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-module" className="block text-xs font-medium text-slate-600">
            Module
          </label>
          <select
            id="filter-module"
            name="module"
            defaultValue={currentModuleId}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="filter-q" className="block text-xs font-medium text-slate-600">
            Search
          </label>
          <input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={currentQ}
            placeholder="Name, email, certificate #, module title…"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Apply filters
        </button>
        <a
          href="/admin/certificates"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear
        </a>
      </div>
    </form>
  );
}
