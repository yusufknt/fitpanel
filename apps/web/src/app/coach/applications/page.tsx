import { auth } from "@/auth";
import { convertLeadToStudent, updateLeadStatus } from "@/app/coach/actions";
import { SubmitButton } from "@/components/submit-button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4";

export default async function CoachApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") redirect("/login");

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) redirect("/coach");

  const leads = await prisma.applicationLead.findMany({
    where: { coachId: coach.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const newCount = leads.filter((l) => l.status === "NEW").length;
  const qualifiedCount = leads.filter((l) => l.status === "QUALIFIED").length;
  const convertedCount = leads.filter((l) => l.status === "CONVERTED").length;

  return (
    <div className="space-y-5">
      <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-[#0c2747]">Basvuru Yonetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Yeni basvurulari degerlendir, iletisime gec ve ogrenciye donustur.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
            <p className="text-xs font-semibold uppercase text-sky-700">Yeni</p>
            <p className="text-2xl font-bold text-sky-900">{newCount}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Nitelikli</p>
            <p className="text-2xl font-bold text-amber-900">{qualifiedCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase text-emerald-700">Donusen</p>
            <p className="text-2xl font-bold text-emerald-900">{convertedCount}</p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {leads.length === 0 ? (
          <p className="text-sm text-slate-600">Henuz basvuru yok.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{lead.fullName}</p>
                    <p className="text-xs text-slate-600">{lead.email}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {lead.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-700">Telefon: {lead.phone ?? "-"}</p>
                <p className="text-slate-700">Hedef: {lead.goal ?? "-"}</p>
                <p className="text-slate-700">Kaynak: {lead.source ?? "-"}</p>
                <p className="text-xs text-slate-500">
                  Basvuru tarihi: {lead.createdAt.toLocaleDateString("tr-TR")}
                </p>

                <form action={updateLeadStatus} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <select
                    name="status"
                    defaultValue={lead.status}
                    className={inputClass + " w-auto min-w-[140px]"}
                  >
                    <option value="NEW">Yeni</option>
                    <option value="QUALIFIED">Nitelikli</option>
                    <option value="CONVERTED">Donusturuldu</option>
                    <option value="LOST">Kaybedildi</option>
                  </select>
                  <SubmitButton idleText="Durumu kaydet" pendingText="Kaydediliyor..." />
                </form>

                {lead.status !== "CONVERTED" ? (
                  <form action={convertLeadToStudent} className="mt-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <SubmitButton idleText="Ogrenciye donustur" pendingText="Donusturuluyor..." />
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
