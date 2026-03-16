"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/actions/admin-users";

interface DeleteUserButtonProps {
  userId: string;
  userEmail: string;
}

export function DeleteUserButton({ userId, userEmail }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm(`Remove ${userEmail}? They will no longer be able to sign in.`)) return;
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
