import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const sidebarNav = [
  { label: "Kontrol Paneli", href: "#dashboard", icon: "layout" },
  { label: "Öğrenciler", href: "#students", icon: "users" },
  { label: "Antrenmanlar", href: "#programs", icon: "dumbbell" },
  { label: "Diyetler", href: "#programs", icon: "apple" },
  { label: "Mesajlar", href: "#checkins", icon: "message" },
  { label: "Ödemeler", href: "#applications", icon: "card" },
  { label: "İstatistikler", href: "#stats", icon: "chart" },
  { label: "Ayarlar", href: "#settings", icon: "gear" },
] as const;

function SidebarIcon({ name }: { name: (typeof sidebarNav)[number]["icon"] }) {
  const cls = "h-5 w-5 shrink-0 opacity-90";
  switch (name) {
    case "layout":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h4V8H6v2zm8 0h4V8h-4v2zM4 8h2v8H4V8zm14 0h2v8h-2V8zm-8 2h4v4h-4v-4z" />
        </svg>
      );
    case "apple":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7c-1-3 3-5 3-5s2 4-1 6c2 1 4 3 4 6a6 6 0 01-11 3c-2-3 1-8 5-10z" />
        </svg>
      );
    case "message":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "card":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M6 8v10M16 5v13M21 12v6" />
        </svg>
      );
    case "gear":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function CoachSidebar({
  coachName,
  activeHref = "#dashboard",
}: {
  coachName: string;
  activeHref?: string;
}) {
  const initials = coachName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl bg-[#1a2332] p-5 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-inner">
          {initials || "K"}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">SmartCoach</p>
          <p className="truncate text-sm font-semibold text-white">{coachName}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
        {sidebarNav.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                active ? "bg-sky-500/20 text-sky-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <SidebarIcon name={item.icon} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
        <LogoutButton className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10" />
      </div>
    </aside>
  );
}

export function SemiGaugeCard({
  title,
  current,
  max,
  accentClass = "text-sky-500",
}: {
  title: string;
  current: number;
  max: number;
  accentClass?: string;
}) {
  const pct = max > 0 ? Math.min(current / max, 1) : 0;
  const r = 52;
  const cx = 60;
  const cy = 56;
  const start = Math.PI;
  const end = 0;
  const arcLen = Math.PI * r;
  const dash = pct * arcLen;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="relative mx-auto mt-2 flex h-[88px] w-[120px] items-end justify-center">
        <svg width="120" height="72" viewBox="0 0 120 72" className="overflow-visible">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${arcLen}`}
            className={accentClass}
          />
        </svg>
        <div className="absolute bottom-1 text-center">
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {current}/{max}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WeeklyCheckInCard({ completed, total }: { completed: number; total: number }) {
  const bars = 12;
  const filled = total > 0 ? Math.round((completed / total) * bars) : 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Haftalık Check-in</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {completed}/{total}
      </p>
      <p className="text-xs text-slate-500">Tamamlanan öğrenci</p>
      <div className="mt-4 flex h-16 items-end gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md ${i < filled ? "bg-sky-500" : "bg-slate-100"}`}
            style={{ height: `${28 + (i % 4) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function StatHighlightCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <div className="rounded-xl bg-sky-50 p-2 text-sky-600">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

export function RevenueSparkCard({ amountLabel, trendUp }: { amountLabel: string; trendUp: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paket Geliri (aktif)</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{amountLabel}</p>
      <p className="text-xs text-slate-500">Tüm aktif paket fiyatları toplamı</p>
      <svg width="100%" height="40" viewBox="0 0 120 40" className="mt-3 text-emerald-500">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={trendUp ? "4,28 24,22 44,26 64,14 84,18 104,8" : "4,12 24,18 44,14 64,26 84,22 104,32"}
        />
      </svg>
    </div>
  );
}

export function MiniSparkline({ values, className = "text-emerald-500" }: { values: number[]; className?: string }) {
  if (values.length < 2) {
    return <span className="text-xs text-slate-400">Veri yok</span>;
  }
  const width = 72;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * (width - 4) + 2;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className={className}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

type StudentRow = {
  id: string;
  label: string;
  progressLabel: string;
  photos: { id: string; fileUrl: string; photoType: string }[];
  weightSeries: number[];
  completionPct: number;
  status: "good" | "warning" | "risk";
};

export function StudentTrackingTable({ rows, toolbar }: { rows: StudentRow[]; toolbar?: ReactNode }) {
  const pill = (status: StudentRow["status"]) => {
    if (status === "good")
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          Onaylandı
        </span>
      );
    if (status === "warning")
      return (
        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
          Rapor bekleniyor
        </span>
      );
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
        Acil takip
      </span>
    );
  };

  return (
    <div id="students" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Öğrenci takip çizelgesi</h2>
          <p className="text-sm text-slate-500">İlerleme, fotoğraflar ve uyum özeti</p>
        </div>
        {toolbar}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="pb-2 pl-2">Öğrenci</th>
              <th className="pb-2">İlerleme</th>
              <th className="pb-2">Fotoğraflar</th>
              <th className="pb-2">Kilo trendi</th>
              <th className="pb-2">Antrenman uyumu</th>
              <th className="pb-2 pr-2 text-right">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="rounded-xl bg-slate-50 px-4 py-8 text-center text-slate-500">
                  Henüz aktif öğrenci yok.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="bg-slate-50/80 shadow-sm ring-1 ring-slate-100/80">
                  <td className="rounded-l-xl px-2 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-700">
                        {row.label.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{row.label}</p>
                        <Link href={`/coach/students/${row.id}`} className="text-xs font-medium text-sky-600 hover:underline">
                          Profili aç
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 align-middle tabular-nums text-slate-700">{row.progressLabel}</td>
                  <td className="py-3 align-middle">
                    <div className="flex gap-1">
                      {row.photos.slice(0, 3).map((p) => (
                        <div key={p.id} className="relative h-10 w-10 overflow-hidden rounded-lg ring-1 ring-white">
                          <Image src={p.fileUrl} alt={p.photoType} fill className="object-cover" sizes="40px" />
                        </div>
                      ))}
                      {row.photos.length === 0 ? <span className="text-xs text-slate-400">Yok</span> : null}
                    </div>
                  </td>
                  <td className="py-3 align-middle">
                    <MiniSparkline values={row.weightSeries} />
                  </td>
                  <td className="py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 max-w-[140px] rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-sky-500 transition-[width]"
                          style={{ width: `${row.completionPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{row.completionPct}%</span>
                    </div>
                  </td>
                  <td className="rounded-r-xl py-3 pr-2 text-right align-middle">{pill(row.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProgramCalendar({
  checkInDates,
}: {
  checkInDates: Date[];
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const cells: (number | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const hasCheckIn = (day: number | null) => {
    if (!day) return false;
    const d = new Date(year, month, day);
    return checkInDates.some((c) => {
      const x = new Date(c);
      return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
    });
  };

  const today = now.getDate();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-900">Program takvimi</p>
      <p className="text-xs text-slate-500">
        {now.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
      </p>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-400">
        {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-xs">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;
          const active = hasCheckIn(day);
          const isToday = day === today;
          return (
            <span
              key={day}
              className={`flex h-8 items-center justify-center rounded-lg font-medium ${
                isToday ? "bg-sky-500 text-white shadow-sm" : active ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100" : "text-slate-600"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function DonutCompletion({ percent }: { percent: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-900">Antrenman tamamlama</p>
      <p className="text-xs text-slate-500">Genel uyum ortalaması</p>
      <div className="relative mx-auto mt-4 flex h-36 w-36 items-center justify-center">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
          <circle
            cx="72"
            cy="72"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-sky-500"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-bold text-slate-900">{percent}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Genel</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationsList({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-900">Son bildirimler</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardHeader({
  greetingName,
  subtitle,
  searchName,
  searchDefault,
}: {
  greetingName: string;
  subtitle: string;
  searchName: string;
  searchDefault?: string;
}) {
  return (
    <header id="dashboard" className="flex flex-wrap items-start justify-between gap-4 scroll-mt-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Hoş geldin, {greetingName}!</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <form className="flex flex-wrap items-center gap-2" action="/coach" method="get">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </span>
          <input
            name={searchName}
            defaultValue={searchDefault ?? ""}
            placeholder="Öğrenci ara..."
            className="w-full min-w-[200px] rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none ring-sky-500/30 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 md:w-64"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
        >
          Ara
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Bildirimler"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Ayarlar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </form>
    </header>
  );
}

export function ViewFilterLinks({
  baseQuery,
  view,
}: {
  baseQuery: string | undefined;
  view: "all" | "risk" | "waiting";
}) {
  const q = baseQuery ? `&q=${encodeURIComponent(baseQuery)}` : "";
  const cls = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-xs font-semibold transition ${
      active ? "bg-sky-500 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/coach?view=all${q}`} className={cls(view === "all")}>
        Tüm öğrenciler
      </Link>
      <Link href={`/coach?view=risk${q}`} className={cls(view === "risk")}>
        Riskli
      </Link>
      <Link href={`/coach?view=waiting${q}`} className={cls(view === "waiting")}>
        Geri bildirim bekleyen
      </Link>
    </div>
  );
}
