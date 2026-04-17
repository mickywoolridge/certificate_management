import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Page not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">That certificate or page does not exist.</p>
      <Link href="/" className="mt-6 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
        Back to dashboard
      </Link>
    </div>
  );
}
