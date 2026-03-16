"use client";

import { useActionState } from "react";
import type { AdminUserActionResult } from "@/app/actions/admin-users";
import type { RoleRow } from "@/services/admin-users-service";

interface UserManagementFormProps {
  action: (
    prev: AdminUserActionResult | null,
    formData: FormData
  ) => Promise<AdminUserActionResult>;
  roles: RoleRow[];
  successMessage?: string;
}

export function UserManagementForm({
  action,
  roles,
  successMessage = "Saved.",
}: UserManagementFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: AdminUserActionResult | null, fd: FormData) => action(_prev, fd),
    null as AdminUserActionResult | null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {state?.success === false && state?.error && (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      )}
      {state?.success === true && (
        <div className="w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          {successMessage}
        </div>
      )}
      <div>
        <label htmlFor="add-user-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="add-user-email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="w-full min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="add-user-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="add-user-password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Min 8 characters"
          className="w-full min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="add-user-fullName" className="block text-sm font-medium text-slate-700 mb-1">
          Full name (optional)
        </label>
        <input
          id="add-user-fullName"
          name="fullName"
          type="text"
          placeholder="Jane Doe"
          className="w-full min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="add-user-role" className="block text-sm font-medium text-slate-700 mb-1">
          Role
        </label>
        <select
          id="add-user-role"
          name="role"
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name === "admin" ? "Administrator" : "Staff"}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add user"}
      </button>
    </form>
  );
}
