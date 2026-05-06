import Link from "next/link";

const links = [
  { label: "Ana sayfa", href: "/student#ozet" },
  { label: "Profil", href: "/student#profil" },
  { label: "Program", href: "/student#program" },
  { label: "Check-in", href: "/student#checkin" },
  { label: "Fotoğraf", href: "/student#fotograflar" },
];

export function StudentPortalMobileNav() {
  return (
    <nav
      aria-label="Hızlı menü"
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
