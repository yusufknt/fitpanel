import { auth } from "@/auth";
import { LeadForm } from "@/components/lead-form";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user?.role === "COACH") {
    redirect("/coach");
  }

  if (session?.user?.role === "STUDENT") {
    redirect("/student");
  }

  const coach = await prisma.coachProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
    },
  });

  const packages =
    coach?.packages.length
      ? coach.packages
      : [
          { id: "starter", title: "Starter Paket", durationWeeks: 4, price: 1499, description: "Haftalik check-in ve temel takip." },
          { id: "pro", title: "Pro Paket", durationWeeks: 8, price: 2499, description: "Detayli olcum analizi ve yakin takip." },
          { id: "elite", title: "Elite Paket", durationWeeks: 12, price: 3999, description: "Kisisel strateji, raporlama ve premium destek." },
        ];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">SmartCoach</p>
          <p className="text-sm text-zinc-600">Online Fitness Kocluk Platformu</p>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Giris Yap
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-10 pt-8 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {coach?.fullName ?? "Demo Coach"} ile
            <span className="block text-zinc-500">duzenli ve olculebilir gelisim</span>
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-600">
            Ogrenciler icin haftalik check-in, olcum takibi ve ilerleme fotograflari.
            Koc icin ise tum sureci tek panelden yonetme kolayligi.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#paketler"
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium hover:bg-white"
            >
              Paketleri Incele
            </a>
            <Link href="/login" className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700">
              Panele Gir
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Neden SmartCoach?</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-600">
            <li>- Haftalik check-in ve uyum skoru takibi</li>
            <li>- Kilo ve olcu degisimlerini tek timeline&apos;da goruntuleme</li>
            <li>- Ilerleme fotograflarini duzenli arsivleme</li>
            <li>- Koc ve ogrenci icin sade, hizli ve mobil uyumlu deneyim</li>
          </ul>
        </div>
      </section>

      <section id="paketler" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <h2 className="text-2xl font-bold">Kocluk Paketleri</h2>
        <p className="mt-2 text-sm text-zinc-600">Ihtiyacina gore sure ve takip yogunlugu sec.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <article key={pkg.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{pkg.durationWeeks} hafta</p>
              <h3 className="mt-2 text-lg font-semibold">{pkg.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{pkg.description ?? "Kisisel kocluk takibi."}</p>
              <p className="mt-5 text-2xl font-bold">{Math.round(pkg.price)} TL</p>
              <Link
                href="/login"
                className="mt-4 inline-block rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Basvuru / Giris
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">Kocluk Basvurusu</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Uygun paketi secmekte kararsizsan basvuru birak, sana en uygun planla donelim.
          </p>
          {coach ? (
            <LeadForm coachId={coach.id} packageOptions={packages.map((item) => item.title)} />
          ) : (
            <p className="mt-4 text-sm text-zinc-600">Su anda basvuru kabul edilmiyor.</p>
          )}
        </div>
      </section>
    </main>
  );
}
