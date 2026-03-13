"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TRAINING_CONTENT_BUCKET, type LessonMediaType } from "@/lib/storage/constants";
import { validateLessonFile } from "@/lib/storage/validate-upload";
import { getDefaultContentType } from "@/lib/storage/upload-lesson-file";
import { saveLessonFromUploadAction } from "@/app/actions/content";

interface ContentUploadFormProps {
  moduleId: string;
}

export function ContentUploadForm({ moduleId }: ContentUploadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const form = e.currentTarget;
      const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value?.trim();
      const lessonType = (form.querySelector('[name="content_type"]') as HTMLSelectElement)?.value as LessonMediaType | undefined;
      const sortOrder = Number((form.querySelector('[name="sort_order"]') as HTMLInputElement)?.value ?? 0);
      const fileInput = form.querySelector('[name="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (!title || !lessonType || !file) {
        setError("Title, type, and file are required.");
        return;
      }

      const validation = validateLessonFile(file, lessonType);
      if (!validation.success) {
        setError(validation.error);
        return;
      }

      const storagePath = `${moduleId}/${crypto.randomUUID()}.${validation.ext}`;
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from(TRAINING_CONTENT_BUCKET)
        .upload(storagePath, file, {
          upsert: false,
          contentType: file.type || getDefaultContentType(validation.ext),
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const result = await saveLessonFromUploadAction({
        moduleId,
        title,
        content_type: lessonType,
        sort_order: sortOrder,
        storage_path: storagePath,
      });

      if (result.success) {
        router.push(`/admin/modules/${moduleId}`);
        return;
      }
      setError(result.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="content_type" className="block text-sm font-medium text-slate-700 mb-1">
          Type
        </label>
        <select
          id="content_type"
          name="content_type"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="presentation">Presentation</option>
        </select>
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="video/*,.pdf,.ppt,.pptx,.mp4,.webm,.mov,.avi,.mkv,.m4v"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          aria-describedby="file-hint"
        />
        <p id="file-hint" className="mt-1 text-xs text-slate-500">
          Video: MP4, WebM, MOV, AVI, MKV, M4V. PDF or PowerPoint (PPT, PPTX). Max 100 MB.
        </p>
      </div>
      <div>
        <label htmlFor="sort_order" className="block text-sm font-medium text-slate-700 mb-1">
          Sort order
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
