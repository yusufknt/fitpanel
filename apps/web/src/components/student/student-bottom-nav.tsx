"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIcon = "home" | "check" | "workout" | "user";

const items: { href: string; label: string; icon: NavIcon; center?: boolean }[] = [
  { href: "/student", label: "Ana sayfa", icon: "home" },
  { href: "/student/checkin", label: "Check-in", icon: "check", center: true },
  { href: "/student/profile", label: "Profil", icon: "user" },
];

function Icon({ name, active, className }: { name: NavIcon; active: boolean; className?: string }) {
  const cls = className ?? `h-6 w-6 ${active ? "text-blue-600" : "text-zinc-500"}`;
  switch (name) {
    case "home":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "check":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "workout":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8v8m12-8v8M3 10h3m12 0h3M3 14h3m12 0h3M9 7h6v10H9z" />
        </svg>
      );
    default:
      return null;
  }
}

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:px-4"
      aria-label="Ana menü"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between gap-0.5 sm:max-w-xl">
        {items.map((item) => {
          const active = item.href === "/student" ? pathname === "/student" : pathname.startsWith(item.href);
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-6 flex flex-col items-center rounded-2xl bg-gradient-to-b from-blue-600 to-blue-500 px-4 py-3 shadow-lg shadow-blue-500/30 ring-2 ring-blue-300/50"
              >
                <Icon name={item.icon} active className="h-7 w-7 text-white" />
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition ${
                active ? "text-blue-600" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon name={item.icon} active={active} />
              <span className="truncate text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
