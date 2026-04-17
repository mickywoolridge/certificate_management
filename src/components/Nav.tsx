import Link from "next/link";

const linkClass =
  "text-sm font-medium text-zinc-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-indigo-300";

export function Nav() {
  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          SSL certificates
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className={linkClass}>
            Notice dashboard
          </Link>
          <Link href="/certificates" className={linkClass}>
            All certificates
          </Link>
          <Link
            href="/certificates/new"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Add certificate
          </Link>
        </nav>
      </div>
    </header>
  );
}
