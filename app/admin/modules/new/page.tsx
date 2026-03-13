import Link from "next/link";
import { ModuleForm } from "@/components/admin/ModuleForm";

export default function NewModulePage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/modules" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to modules
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">New module</h1>
      <ModuleForm />
    </div>
  );
}
