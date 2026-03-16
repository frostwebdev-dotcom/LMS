"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { updateUserRoleAction } from "@/app/actions/admin-users";
import type { AdminUserActionResult } from "@/app/actions/admin-users";
import type { RoleRow } from "@/services/admin-users-service";

interface UpdateRoleFormProps {
  profileId: string;
  currentRoleId: string;
  roles: RoleRow[];
}

export function UpdateRoleForm({ profileId, currentRoleId, roles }: UpdateRoleFormProps) {
  const router = useRouter();
  const [selectValue, setSelectValue] = useState(currentRoleId);

  const [state, formAction, isPending] = useActionState(
    (_prev: AdminUserActionResult | null, fd: FormData) =>
      updateUserRoleAction(profileId, fd),
    null as AdminUserActionResult | null
  );

  useEffect(() => {
    setSelectValue(currentRoleId);
  }, [currentRoleId]);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      {state?.success === false && state?.error && (
        <span className="text-xs text-red-600" role="alert">
          {state.error}
        </span>
      )}
      <select
        name="roleId"
        value={selectValue}
        onChange={(e) => setSelectValue(e.target.value)}
        disabled={isPending}
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name === "admin" ? "Administrator" : "Staff"}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-primary-600 hover:underline disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update"}
      </button>
    </form>
  );
}
