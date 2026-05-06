import Image from "next/image";
import Link from "next/link";

const cardBase =
  "rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_-4px_rgba(15,39,71,0.08)] ring-1 ring-slate-50";

export function PortalStatsGrid({
  activeStudents,
  maxCapacity,
  newThisMonth,
  pendingCheckIns,
  revenueLabel,
  revenueUpPct,
  completionPct,
}: {
  activeStudents: number;
  maxCapacity: number;
  newThisMonth: number;
  pendingCheckIns: number;
  revenueLabel: string;
  revenueUpPct: number;
  completionPct: number;
}) {
  const capacityPct =
    maxCapacity > 0 ? Math.min((activeStudents / maxCapacity) * 100, 100) : 0;

  return (
    <section
      id="dashboard-content"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 scroll-mt-28"
    >
      <div className={cardBase}>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Aktif Öğrenci
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-[#0c2747]">
          {activeStudents}
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${capacityPct}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-emerald-600">
          Bu ay +{newThisMonth} yeni öğrenci
        </p>
      </div>

      <div className={cardBase}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bekleyen Check-in
          </p>
          <span className="rounded-lg bg-amber-50 p-2 text-amber-600 ring-1 ring-amber-100">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </span>
        </div>
        <p className="mt-2 text-4xl font-bold tabular-nums text-[#0c2747]">
          {pendingCheckIns}
        </p>
        <p className="mt-3 text-sm font-medium text-slate-500">
          İnceleme gerekiyor
        </p>
      </div>

      <div className={cardBase}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Aylık Gelir
          </p>
          <span className="rounded-lg bg-[#38bdf8]/15 p-2 text-[#0369a1] ring-1 ring-[#38bdf8]/25">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums text-[#0c2747]">
          {revenueLabel}
        </p>
        <p className="mt-3 text-sm font-semibold text-emerald-600">
          Geçen aya göre +%{revenueUpPct}
        </p>
      </div>

      <div className={cardBase}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Program Tamamlanma
          </p>
          <span className="rounded-lg bg-slate-50 p-2 text-[#0c2747] ring-1 ring-slate-100">
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
                d="M7 12l3 3 7-7M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              />
            </svg>
          </span>
        </div>
        <p className="mt-2 text-4xl font-bold tabular-nums text-[#0c2747]">
          {completionPct}%
        </p>
        <p className="mt-3 text-sm font-medium text-slate-500">Ortalama oran</p>
      </div>
    </section>
  );
}

export type ActivityRow = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  status: string;
  statusVariant: "neutral" | "warning" | "success";
  lastUpdate: string;
  progressBars: number[];
  formPhotoCount: number;
  profileHref: string;
};

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: ActivityRow["statusVariant"];
}) {
  const styles =
    variant === "warning"
      ? "bg-amber-50 text-amber-800 ring-amber-100"
      : variant === "success"
        ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
        : "bg-slate-50 text-slate-700 ring-slate-100";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles}`}
    >
      {label}
    </span>
  );
}

export function RecentStudentActivityTable({
  rows,
  activityFilter,
  querySuffix = "",
}: {
  rows: ActivityRow[];
  activityFilter: "all" | "unreviewed";
  querySuffix?: string;
}) {
  const filterCls = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      active
        ? "bg-[#0c2747] text-white shadow-md shadow-[#0c2747]/25"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
    }`;

  return (
    <div id="students-activity" className={`${cardBase} scroll-mt-28`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#0c2747]">
          Son Öğrenci Aktivitesi
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/coach?activity=all${querySuffix}`}
            className={filterCls(activityFilter === "all")}
          >
            Tümü
          </Link>
          <Link
            href={`/coach?activity=unreviewed${querySuffix}`}
            className={filterCls(activityFilter === "unreviewed")}
          >
            İncelenmeyen
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="pb-3 pl-1">Ad</th>
              <th className="pb-3">Durum</th>
              <th className="pb-3">Son Güncelleme</th>
              <th className="pb-3">İlerleme</th>
              <th className="pb-3 text-center">Form Fotoğrafları</th>
              <th className="pb-3 pr-1 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-slate-500"
                >
                  Bu filtreyle eşleşen aktivite yok.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pl-1">
                  <div className="flex items-center gap-3">
                    {row.avatarUrl ? (
                      <Image
                        src={row.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0c2747] text-xs font-bold text-white shadow-sm">
                        {row.initials}
                      </span>
                    )}
                    <Link
                      href={row.profileHref}
                      className="font-semibold text-[#0c2747] hover:underline"
                    >
                      {row.name}
                    </Link>
                  </div>
                </td>
                <td className="py-3">
                  <StatusPill label={row.status} variant={row.statusVariant} />
                </td>
                <td className="py-3 tabular-nums text-slate-600">
                  {row.lastUpdate}
                </td>
                <td className="py-3">
                  <div className="flex h-10 items-end gap-px">
                    {row.progressBars.map((v, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-sm ${v >= 0.45 ? "bg-emerald-500" : "bg-slate-200"}`}
                        style={{ height: `${10 + Math.round(v * 30)}px` }}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex justify-center gap-1">
                    {Array.from({
                      length: Math.min(row.formPhotoCount, 4),
                    }).map((_, i) => (
                      <span
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M9 9h.01"
                          />
                        </svg>
                      </span>
                    ))}
                    {row.formPhotoCount === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : null}
                  </div>
                </td>
                <td className="py-3 pr-1 text-right">
                  <Link
                    href={row.profileHref}
                    aria-label="Öğrenciyi aç"
                    className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0c2747]"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href="/coach#students-list"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#0c2747] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#0c2747]/25 transition hover:bg-[#143a5e] sm:w-auto"
        >
          Tüm Öğrencileri Gör
        </Link>
      </div>
    </div>
  );
}

export function WeeklyCheckInPieChart({
  completedPct,
}: {
  completedPct: number;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(completedPct)));
  const pendingPct = 100 - pct;

  return (
    <div className={cardBase}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0c2747]">
        Haftalık Check-in Durumu
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div
          className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full shadow-inner ring-4 ring-white"
          style={{
            background: `conic-gradient(#22c55e 0% ${pct}%, #cbd5e1 ${pct}% 100%)`,
          }}
        >
          <div className="flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full bg-white text-center shadow-sm ring-1 ring-slate-100">
            <span className="text-lg font-bold text-[#0c2747]">{pct}%</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Oran
            </span>
          </div>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2 font-medium text-slate-700">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />%{pct}{" "}
            tamamlandı
          </li>
          <li className="flex items-center gap-2 font-medium text-slate-600">
            <span className="h-3 w-3 rounded-full bg-slate-300" />%{pendingPct}{" "}
            bekliyor
          </li>
        </ul>
      </div>
    </div>
  );
}

export function StudentProgressTrendBars({
  weeks,
}: {
  weeks: { label: string; completed: number; pending: number }[];
}) {
  const maxTotal = Math.max(...weeks.map((w) => w.completed + w.pending), 1);

  return (
    <div className={cardBase}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0c2747]">
        Öğrenci İlerleme Trendi
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Haftalık tamamlanma dağılımı
      </p>
      <div className="mt-6 flex h-44 items-end justify-between gap-1.5 md:gap-2">
        {weeks.map((w) => {
          const total = w.completed + w.pending;
          const barHeightPct = Math.max(
            18,
            Math.round((total / maxTotal) * 100),
          );
          return (
            <div
              key={w.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div
                className="flex w-full max-w-[40px] flex-col justify-end"
                style={{ height: `${barHeightPct}%` }}
              >
                <div className="flex min-h-[96px] w-full flex-col-reverse overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-100">
                  <div
                    className="bg-slate-300"
                    style={{ flexGrow: Math.max(1, w.pending) }}
                  />
                  <div
                    className="bg-emerald-500"
                    style={{ flexGrow: Math.max(1, w.completed) }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                {w.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Tamamlanan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-slate-300" /> Bekleyen
        </span>
      </div>
    </div>
  );
}

export type UpdateItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  accent: "sky" | "emerald" | "amber";
  href?: string;
};

export function RecentUpdatesPanel({ items }: { items: UpdateItem[] }) {
  const dot = (accent: UpdateItem["accent"]) =>
    accent === "emerald"
      ? "bg-emerald-500"
      : accent === "amber"
        ? "bg-amber-400"
        : "bg-[#38bdf8]";

  return (
    <div className={`${cardBase} h-fit`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0c2747]">
        Son Güncellemeler
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 shadow-sm ring-1 ring-slate-50"
          >
            <div className="flex gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot(item.accent)}`}
              />
              <div className="min-w-0">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-[#0c2747] hover:underline"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-[#0c2747]">
                    {item.title}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {item.time}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardWelcome({ name }: { name: string }) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-bold tracking-tight text-[#0c2747] md:text-3xl">
        Panel
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Tekrar hoş geldin,{" "}
        <span className="font-semibold text-slate-700">{name}</span>. Bugün
        olanlar burada.
      </p>
    </div>
  );
}
