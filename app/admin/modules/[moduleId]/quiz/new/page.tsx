import { notFound } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getModuleById } from "@/services/module-service";
import { createQuizAction } from "@/app/actions/quiz-admin";
import { QuizFormAdmin } from "@/components/admin/QuizFormAdmin";

export default async function NewQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const trainingModule = await getModuleById(moduleId);
  if (!trainingModule) notFound();

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createQuizAction(moduleId, null, formData);
    if (result.success && result.id) {
      redirect(`/admin/modules/${moduleId}/quiz/edit`);
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/modules/${moduleId}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to module
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">New quiz</h1>
      <QuizFormAdmin action={handleCreate} />
    </div>
  );
}
