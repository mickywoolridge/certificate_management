"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: string };

export function CertificateDeleteButton({ id }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm("Delete this tracked object? This cannot be undone.")) return;
    setPending(true);
    const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      alert("Could not delete");
      return;
    }
    router.push("/certificates");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
