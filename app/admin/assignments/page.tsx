import Link from "next/link";
import { Suspense } from "react";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { getAllModulesForAdmin, getModuleById } from "@/services/module-service";
import { getModuleAssignments } from "@/services/module-assignment-service";
import { getRoles, getAllProfilesWithRoles } from "@/services/admin-users-service";
import { ModuleSelector } from "@/components/admin/ModuleSelector";
import { ModuleAssignmentsSection } from "@/components/admin/ModuleAssignmentsSection";

type AssignmentsPageProps = {
  searchParams: Promise<{ moduleId?: string }>;
};

export default async function AdminAssignmentsPage({ searchParams }: AssignmentsPageProps) {
  await requireAdminOrRedirect();
  const { moduleId } = await searchParams;

  const [modules, roles, profiles] = await Promise.all([
    getAllModulesForAdmin(),
    getRoles(),
    getAllProfilesWithRoles(),
  ]);

  let selectedModule = null;
  let assignments = { userIds: [] as string[], roleIds: [] as string[] };

  if (moduleId) {
    const [mod, assign] = await Promise.all([
      getModuleById(moduleId),
      getModuleAssignments(moduleId),
    ]);
    selectedModule = mod;
    assignments = assign;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Training assignments
        </h1>
        <p className="mt-1 text-slate-600 sm:mt-2">
          Choose a module and assign it to roles or specific employees. Only assigned staff will see the module on their dashboard when it is published.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <Suspense fallback={<div className="text-slate-500">Loading…</div>}>
          <ModuleSelector
            modules={modules}
            currentModuleId={moduleId ?? null}
            currentModuleTitle={selectedModule?.title ?? null}
          />
        </Suspense>
      </section>

      {moduleId && selectedModule ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Who can see this module
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Staff see the module only if it is assigned to their role or to them personally, and the module is published.
          </p>
          <ModuleAssignmentsSection
            moduleId={moduleId}
            roles={roles}
            profiles={profiles}
            initialUserIds={assignments.userIds}
            initialRoleIds={assignments.roleIds}
          />
          <p className="mt-4 text-sm text-slate-500">
            <Link
              href={`/admin/modules/${moduleId}`}
              className="font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              ← Edit module details, lessons & quiz
            </Link>
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <p className="text-slate-600">
            Select a module above to manage its assignments. You can also manage assignments from each module&apos;s page under <Link href="/admin/modules" className="font-medium text-primary-600 hover:text-primary-700">Modules</Link>.
          </p>
        </section>
      )}
    </div>
  );
}
