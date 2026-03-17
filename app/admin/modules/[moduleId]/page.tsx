import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { getContentByModuleId } from "@/services/content-service";
import { getQuizByModuleId } from "@/services/quiz-service";
import { getModuleAssignments } from "@/services/module-assignment-service";
import { getRoles, getAllProfilesWithRoles } from "@/services/admin-users-service";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { ModuleDeleteForm } from "@/components/admin/ModuleDeleteForm";
import { ResetModuleProgressForm } from "@/components/admin/ResetModuleProgressForm";
import { AdminContentList } from "@/components/admin/AdminContentList";
import { AdminQuizSection } from "@/components/admin/AdminQuizSection";
import { ModuleAssignmentsSection } from "@/components/admin/ModuleAssignmentsSection";

export default async function AdminModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const [trainingModule, content, quiz, assignments, roles, profiles] = await Promise.all([
    getModuleById(moduleId),
    getContentByModuleId(moduleId),
    getQuizByModuleId(moduleId),
    getModuleAssignments(moduleId),
    getRoles(),
    getAllProfilesWithRoles(),
  ]);

  if (!trainingModule) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/modules" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to modules
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Module details</h2>
        <ModuleForm
          moduleId={moduleId}
          initialTitle={trainingModule.title}
          initialDescription={trainingModule.description}
          initialSortOrder={trainingModule.sort_order}
          initialPublished={trainingModule.is_published}
          initialExpirationMonths={trainingModule.expiration_months ?? null}
        />
        <ModuleDeleteForm moduleId={moduleId} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Assignments</h2>
        <p className="text-sm text-slate-600 mb-3">
          Control who can see this module. Staff see only modules assigned to their role or directly to them (when published).
        </p>
        <ModuleAssignmentsSection
          moduleId={moduleId}
          roles={roles}
          profiles={profiles}
          initialUserIds={assignments.userIds}
          initialRoleIds={assignments.roleIds}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Reset training for this module</h2>
        <p className="text-sm text-slate-600 mb-2">
          Clear all staff progress for this module (e.g. annual re-training). Everyone will need to re-complete lessons and re-take the quiz. This cannot be undone.
        </p>
        <ResetModuleProgressForm
          moduleId={moduleId}
          moduleTitle={trainingModule.title}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Lessons</h2>
        <AdminContentList moduleId={moduleId} content={content} />
        <Link
          href={`/admin/modules/${moduleId}/content/new`}
          className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + Add lesson
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Quiz</h2>
        <AdminQuizSection moduleId={moduleId} quiz={quiz} />
      </section>
    </div>
  );
}
