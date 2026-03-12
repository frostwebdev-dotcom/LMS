import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { getContentByModuleId } from "@/services/content-service";
import { getQuizByModuleId } from "@/services/quiz-service";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { updateModuleAction, deleteModuleAction } from "@/app/actions/modules";
import { AdminContentList } from "@/components/admin/AdminContentList";
import { AdminQuizSection } from "@/components/admin/AdminQuizSection";

export default async function AdminModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const [trainingModule, content, quiz] = await Promise.all([
    getModuleById(moduleId),
    getContentByModuleId(moduleId),
    getQuizByModuleId(moduleId),
  ]);

  if (!trainingModule) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateModuleAction(moduleId, null, formData);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteModuleAction(formData);
  }

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
          action={async () => ({ success: false, error: "Use update" })}
          initialTitle={trainingModule.title}
          initialDescription={trainingModule.description}
          initialSortOrder={trainingModule.sort_order}
          initialPublished={trainingModule.is_published}
          updateAction={updateModuleAction}
        />
        <form action={handleDelete} className="mt-4">
          <input type="hidden" name="moduleId" value={moduleId} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
          >
            Delete module
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Content</h2>
        <AdminContentList moduleId={moduleId} content={content} />
        <Link
          href={`/admin/modules/${moduleId}/content/new`}
          className="mt-3 inline-block text-sm text-primary-600 hover:underline"
        >
          + Add content
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Quiz</h2>
        <AdminQuizSection moduleId={moduleId} quiz={quiz} />
      </section>
    </div>
  );
}
