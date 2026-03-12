import Link from "next/link";
import { redirect } from "next/navigation";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { createModuleAction } from "@/app/actions/modules";

export default function NewModulePage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createModuleAction(null, formData);
    if (result.success && result.id) {
      redirect(`/admin/modules/${result.id}`);
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/modules" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to modules
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">New module</h1>
      <ModuleForm action={handleCreate} />
    </div>
  );
}
