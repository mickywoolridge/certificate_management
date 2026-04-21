"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ObjectType } from "@prisma/client";

type Props = {
  objectTypes: ObjectType[];
};

export function ObjectTypeManager({ objectTypes }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  async function createObjectType(name: string): Promise<boolean> {
    if (!name) return false;

    setError(null);
    setCreatePending(true);
    try {
      const res = await fetch("/api/object-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create object type");
        return false;
      } else {
        router.refresh();
        return true;
      }
    } catch {
      setError("Network error");
      return false;
    } finally {
      setCreatePending(false);
    }
  }

  async function toggleActive(objectType: ObjectType) {
    setError(null);
    setPendingId(objectType.id);
    try {
      const res = await fetch(`/api/object-types/${objectType.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !objectType.isActive }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update object type");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setPendingId(null);
    }
  }

  async function removeObjectType(objectType: ObjectType) {
    if (!confirm(`Delete "${objectType.name}"? This only works when no records use this type.`)) {
      return;
    }

    setError(null);
    setPendingId(objectType.id);
    try {
      const res = await fetch(`/api/object-types/${objectType.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not delete object type");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name") ?? "").trim();
          void createObjectType(name).then((created) => {
            if (created) e.currentTarget.reset();
          });
        }}
        className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">New object type name</span>
          <input
            name="name"
            required
            placeholder="e.g. Software support contract"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          disabled={createPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
        >
          {createPending ? "Adding..." : "Add type"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {objectTypes.map((type) => (
              <tr key={type.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{type.name}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{type.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      type.isActive
                        ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "inline-flex rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  >
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pendingId === type.id}
                      onClick={() => {
                        void toggleActive(type);
                      }}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      {type.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === type.id}
                      onClick={() => {
                        void removeObjectType(type);
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
