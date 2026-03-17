"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateModuleRoleAssignmentsAction,
  updateModuleUserAssignmentsAction,
} from "@/app/actions/module-assignments";
import type { ModuleAssignmentsResult } from "@/app/actions/module-assignments";
import type { RoleRow } from "@/services/admin-users-service";
import type { ProfileWithRole } from "@/services/admin-users-service";

export interface ModuleAssignmentsSectionProps {
  moduleId: string;
  roles: RoleRow[];
  profiles: ProfileWithRole[];
  initialUserIds: string[];
  initialRoleIds: string[];
}

function roleDisplayName(name: string): string {
  return name === "admin" ? "Administrator" : "Staff";
}

export function ModuleAssignmentsSection({
  moduleId,
  roles,
  profiles,
  initialUserIds,
  initialRoleIds,
}: ModuleAssignmentsSectionProps) {
  const router = useRouter();
  const [roleIds, setRoleIds] = useState<string[]>(initialRoleIds);
  const [userIds, setUserIds] = useState<string[]>(initialUserIds);
  const [roleResult, setRoleResult] = useState<ModuleAssignmentsResult | null>(null);
  const [userResult, setUserResult] = useState<ModuleAssignmentsResult | null>(null);
  const [rolePending, setRolePending] = useState(false);
  const [userPending, setUserPending] = useState(false);

  const assignedRoleNames = roles.filter((r) => roleIds.includes(r.id)).map((r) => roleDisplayName(r.name));
  const assignedUsers = profiles.filter((p) => userIds.includes(p.id) && p.role === "staff");
  const staffProfiles = profiles.filter((p) => p.role === "staff");

  async function handleSaveRoles() {
    setRoleResult(null);
    setRolePending(true);
    try {
      const res = await updateModuleRoleAssignmentsAction(moduleId, roleIds);
      setRoleResult(res);
      if (res.success) router.refresh();
    } finally {
      setRolePending(false);
    }
  }

  async function handleSaveUsers() {
    setUserResult(null);
    setUserPending(true);
    try {
      const res = await updateModuleUserAssignmentsAction(moduleId, userIds);
      setUserResult(res);
      if (res.success) router.refresh();
    } finally {
      setUserPending(false);
    }
  }

  function toggleRole(roleId: string) {
    setRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  }

  function toggleUser(userId: string) {
    setUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  return (
    <div className="space-y-8">
      {/* Current assignments summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Current assignments</h3>
        {assignedRoleNames.length === 0 && assignedUsers.length === 0 ? (
          <p className="text-sm text-slate-600">Not assigned to any role or employee. No staff will see this module until you assign it below.</p>
        ) : (
          <ul className="text-sm text-slate-700 space-y-1">
            {assignedRoleNames.length > 0 && (
              <li>
                <span className="font-medium">By role:</span>{" "}
                {assignedRoleNames.join(", ")}
              </li>
            )}
            {assignedUsers.length > 0 && (
              <li>
                <span className="font-medium">By employee:</span>{" "}
                {assignedUsers.map((p) => p.full_name || p.email).join(", ")}
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Assign by role */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Assign by role</h3>
        <p className="text-xs text-slate-600 mb-3">
          Everyone with a selected role will see this module when it is published.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {roles.map((r) => {
            const isAssigned = roleIds.includes(r.id);
            return (
              <label
                key={r.id}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                  isAssigned
                    ? "border-primary-300 bg-primary-50 text-primary-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => toggleRole(r.id)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium capitalize">{roleDisplayName(r.name)}</span>
                {isAssigned && (
                  <span className="text-xs text-primary-600">Assigned</span>
                )}
              </label>
            );
          })}
        </div>
        {roleResult?.success === true && (
          <p className="mt-2 text-sm text-emerald-600" role="status">
            Role assignments saved.
          </p>
        )}
        {roleResult?.success === false && roleResult.error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {roleResult.error}
          </p>
        )}
        <button
          type="button"
          onClick={handleSaveRoles}
          disabled={rolePending}
          className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {rolePending ? "Saving…" : "Save role assignments"}
        </button>
      </div>

      {/* Assign by employee */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Assign by employee</h3>
        <p className="text-xs text-slate-600 mb-3">
          Selected staff will see this module (when published), in addition to anyone who has it via their role.
        </p>
        {staffProfiles.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">
            No staff users. Add users from{" "}
            <Link href="/admin/users" className="text-primary-600 hover:text-primary-700 font-medium">
              User management
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
              {staffProfiles.map((p) => {
                const isAssigned = userIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      isAssigned ? "bg-primary-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => toggleUser(p.id)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-slate-900 block truncate">
                        {p.full_name || p.email}
                      </span>
                      {p.full_name && (
                        <span className="text-xs text-slate-500 block truncate">{p.email}</span>
                      )}
                    </div>
                    {isAssigned && (
                      <span className="shrink-0 text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
                        Assigned
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {userResult?.success === true && (
              <p className="mt-2 text-sm text-emerald-600" role="status">
                Employee assignments saved.
              </p>
            )}
            {userResult?.success === false && userResult.error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {userResult.error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSaveUsers}
              disabled={userPending || staffProfiles.length === 0}
              className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {userPending ? "Saving…" : "Save employee assignments"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
