import Link from "next/link";

export function CoachPortalHeader({
  coachName,
  coachEmail,
  searchDefault = "",
}: {
  coachName: string;
  coachEmail: string;
  searchDefault?: string;
}) {
  const displayTitle = `${coachName} - Baş Koç`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="flex h-[60px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <Link
          href="/coach"
          className="flex shrink-0 items-center gap-2.5 text-[#0c2747]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c2747] text-white shadow-md shadow-[#0c2747]/25">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          <span className="hidden font-bold tracking-tight sm:inline text-sm uppercase md:text-base">
            SMARTCOACH KOÇ PANELİ
          </span>
        </Link>

        <form
          className="mx-auto hidden max-w-xl flex-1 md:flex"
          action="/coach"
          method="get"
        >
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </span>
            <input
              name="q"
              defaultValue={searchDefault}
              placeholder="Öğrenci veya program ara..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-[#38bdf8]/0 transition placeholder:text-slate-400 focus:border-[#38bdf8] focus:bg-white focus:ring-4 focus:ring-[#38bdf8]/20"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <form className="flex md:hidden" action="/coach" method="get">
            <button
              type="submit"
              aria-label="Ara"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </button>
          </form>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0c2747] to-[#1e5a8e] text-xs font-bold text-white">
              {coachName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? "")
                .join("") || "PT"}
            </span>
            <span className="hidden max-w-[200px] truncate text-left text-sm font-medium text-slate-800 lg:inline">
              {displayTitle}
            </span>
            <svg
              className="h-4 w-4 shrink-0 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="sr-only">Giriş yapan: {coachEmail}</p>
    </header>
  );
}
