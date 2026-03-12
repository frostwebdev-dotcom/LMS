import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { getPublishedModules } from "@/services/module-service";

export default async function DashboardPage() {
  const user = await requireUserOrRedirect();

  const modules = await getPublishedModules(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Training modules</h1>
      <p className="text-slate-600">
        Complete modules and quizzes to track your progress.
      </p>
      {modules.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
          No training modules available yet.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Link
                href={`/dashboard/modules/${mod.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow"
              >
                <h2 className="font-semibold text-slate-800">{mod.title}</h2>
                {mod.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {mod.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                  <span>{mod.content_count} items</span>
                  <span>{mod.quiz_count} quiz{mod.quiz_count !== 1 ? "zes" : ""}</span>
                  {mod.progress_completed_at && (
                    <span className="text-green-600">Completed</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
