import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { createQuizAndRedirectAction } from "@/app/actions/quiz-admin";
import { QuizFormAdmin } from "@/components/admin/QuizFormAdmin";

export default async function NewQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const trainingModule = await getModuleById(moduleId);
  if (!trainingModule) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/modules/${moduleId}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to module
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">New quiz</h1>
      <p className="text-slate-600 text-sm">
        Set the title, optional description, and passing score. After creating, you can add questions and answer choices on the edit page.
      </p>
      <QuizFormAdmin
        action={createQuizAndRedirectAction.bind(null, moduleId, null)}
      />
    </div>
  );
}
