import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function StudentAppHeader({ displayName }: { displayName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-xl">
        <Link href="/student" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-black text-white shadow-lg shadow-blue-500/20">
            SC
          </span>
          <span className="hidden text-xs font-bold uppercase tracking-wider text-zinc-500 sm:block">Müşteri Portalı</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-right text-sm font-semibold text-zinc-800">{displayName}</p>
          <LogoutButton className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 sm:px-3 sm:text-sm" />
        </div>
      </div>
    </header>
  );
}
