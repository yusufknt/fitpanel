import Link from "next/link";

const links = [
  { label: "Ana sayfa", href: "/coach" },
  { label: "Öğrenciler", href: "/coach/students" },
  { label: "Check-in", href: "/coach/checkins" },
  { label: "Başvurular", href: "/coach/applications" },
];

export function CoachPortalMobileNav() {
  return (
    <nav
      aria-label="Hızlı gezinme"
      className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0c2747] px-3 py-2.5 md:hidden"
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
