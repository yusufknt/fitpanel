import Link from "next/link";

export function StudentPortalHeader({
  displayName,
  userEmail,
}: {
  displayName: string;
  userEmail: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="flex h-[60px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <Link href="/student" className="flex shrink-0 items-center gap-2.5 text-[#0c2747]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="hidden text-sm font-bold uppercase tracking-tight sm:inline md:text-base">
            ÖĞRENCİ PORTAL
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden max-w-[220px] truncate text-right text-sm sm:block">
            <p className="truncate font-semibold text-slate-800">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-[#0c2747] text-xs font-bold text-white">
            {getInitials(displayName)}
          </span>
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return (p[0]?.slice(0, 2) ?? "?").toUpperCase();
}
