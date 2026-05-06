"use client";

import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Ana Sayfa", href: "/student", icon: "home" },
  { label: "Check-in Gönder", href: "/student/checkin", icon: "check" },
  { label: "Profil Bilgilerim", href: "/student/profile", icon: "user" },
] as const;

function NavIcon({ name }: { name: string }) {
  const cls = "h-5 w-5 shrink-0";
  switch (name) {
    case "home":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "doc":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "check":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
        </svg>
      );
    case "photo":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M9 9h.01M19 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function isActive(pathname: string, item: (typeof navItems)[number]) {
  if (item.href === "/student") return pathname === "/student";
  return pathname.startsWith(item.href);
}

export function StudentPortalSidebar() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[240px] shrink-0 flex-col border-r border-white/10 bg-[#0c2747] text-slate-100 shadow-lg md:flex">
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const active = isActive(pathname, item);
          const base =
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150";
          const activeCls = "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/35";
          const inactiveCls = "text-slate-300 hover:bg-white/5 hover:text-white";

          return (
            <Link key={item.href} href={item.href} className={`${base} ${active ? activeCls : inactiveCls}`}>
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <LogoutButton className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10" />
      </div>
    </aside>
  );
}
