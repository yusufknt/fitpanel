import { auth } from "@/auth";
import { saveCoachFeedback } from "@/app/coach/actions";
import { SubmitButton } from "@/components/submit-button";
import { getStudentDisplayName } from "@/lib/student-display";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CoachCheckInsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") redirect("/login");

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) redirect("/coach");

  const students = await prisma.studentProfile.findMany({
    where: { coachId: coach.id, active: true },
    include: {
      user: { select: { email: true } },
      checkIns: { orderBy: { submittedAt: "desc" }, take: 2 },
      metrics: { orderBy: { date: "desc" }, take: 2 },
      progressPhotos: { orderBy: { date: "desc" }, take: 2 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const waiting = students
    .map((student) => ({
      student,
      latestCheckIn: student.checkIns[0] ?? null,
      latestMetric: student.metrics[0] ?? null,
      previousMetric: student.metrics[1] ?? null,
      latestPhoto: student.progressPhotos[0] ?? null,
    }))
    .filter((item) => item.latestCheckIn && !item.latestCheckIn.coachFeedback)
    .sort(
      (a, b) =>
        b.latestCheckIn!.submittedAt.getTime() - a.latestCheckIn!.submittedAt.getTime(),
    );

  return (
    <div className="space-y-5">
      <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-[#0c2747]">Check-in Inbox</h1>
        <p className="mt-1 text-sm text-slate-600">
          Yeni gelen ve incelenmemis check-inleri buradan hizlica yonet.
        </p>
        <div className="mt-4 inline-flex rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          Bekleyen check-in: {waiting.length}
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {waiting.length === 0 ? (
          <p className="text-sm text-slate-600">Harika, bekleyen check-in yok.</p>
        ) : (
          <div className="space-y-4">
            {waiting.map((item) => {
              const delta =
                item.latestMetric?.weight != null && item.previousMetric?.weight != null
                  ? item.previousMetric.weight - item.latestMetric.weight
                  : null;
              return (
                <article
                  key={item.latestCheckIn!.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {getStudentDisplayName(item.student)}
                      </p>
                      <p className="text-xs text-slate-600">{item.student.user.email}</p>
                    </div>
                    <Link
                      href={`/coach/students/${item.student.id}`}
                      className="text-xs font-semibold text-sky-700 hover:underline"
                    >
                      Ogrenci dosyasina git
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    Tarih: {item.latestCheckIn!.submittedAt.toLocaleString("tr-TR")} | Uyum:{" "}
                    {item.latestCheckIn!.complianceScore ?? "-"} / 10
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Kilo: {item.latestMetric?.weight ?? "-"} kg
                    {delta != null ? ` (degisim ${delta > 0 ? "-" : "+"}${Math.abs(delta).toFixed(1)} kg)` : ""}
                    {" "} | Son fotograf:{" "}
                    {item.latestPhoto?.date.toLocaleDateString("tr-TR") ?? "Yok"}
                  </p>
                  <p className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200">
                    Ogrenci notu: {item.latestCheckIn!.notes ?? "Not eklenmemis."}
                  </p>
                  <form action={saveCoachFeedback} className="mt-3">
                    <input type="hidden" name="checkInId" value={item.latestCheckIn!.id} />
                    <textarea
                      name="coachFeedback"
                      rows={3}
                      placeholder="Haftalik geri bildirimi yaz..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                    <div className="mt-2">
                      <SubmitButton
                        idleText="Geri bildirimi kaydet"
                        pendingText="Kaydediliyor..."
                      />
                    </div>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
