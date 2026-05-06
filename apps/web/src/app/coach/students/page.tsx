import { auth } from "@/auth";
import { getStudentDisplayName, getStudentInitials } from "@/lib/student-display";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type StudentView = "all" | "good" | "warning" | "risk";

function statusLabelFromView(view: StudentView) {
  if (view === "good") return "İyi ilerleme";
  if (view === "warning") return "Yavaş ilerleme";
  if (view === "risk") return "Riskli";
  return "Tüm öğrenciler";
}

export default async function CoachStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: StudentView }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const view: StudentView =
    params.view === "good" || params.view === "warning" || params.view === "risk"
      ? params.view
      : "all";

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
      metrics: { orderBy: { date: "desc" }, take: 4 },
      checkIns: { orderBy: { submittedAt: "desc" }, take: 4 },
      progressPhotos: { orderBy: { date: "desc" }, take: 2 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const studentsWithStatus = students
    .map((student) => {
      const lastCheckIn = student.checkIns[0];
      const latestMetric = student.metrics[0];
      const previousMetric = student.metrics[1];
      const latestPhoto = student.progressPhotos[0];

      const noCheckIn = !lastCheckIn || nowMs - lastCheckIn.submittedAt.getTime() > sevenDaysMs;
      const noPhoto = !latestPhoto || nowMs - latestPhoto.date.getTime() > fourteenDaysMs;
      const weightChange =
        latestMetric?.weight != null && previousMetric?.weight != null
          ? previousMetric.weight - latestMetric.weight
          : null;
      const stalledWeight = weightChange != null && Math.abs(weightChange) < 0.1;

      let status: Exclude<StudentView, "all"> = "good";
      if (noCheckIn || (stalledWeight && noPhoto)) status = "risk";
      else if (stalledWeight || noPhoto) status = "warning";

      const progressPct = Math.max(
        8,
        Math.min(100, Math.round((lastCheckIn?.complianceScore ?? 4) * 10)),
      );

      return {
        student,
        status,
        noCheckIn,
        noPhoto,
        stalledWeight,
        progressPct,
        lastCheckIn,
        latestMetric,
      };
    })
    .filter((item) => {
      const inQuery =
        !q ||
        item.student.user.email.toLowerCase().includes(q) ||
        (item.student.fullName ?? "").toLowerCase().includes(q);
      if (!inQuery) return false;
      if (view === "all") return true;
      return item.status === view;
    });

  const statusCounts = studentsWithStatus.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { good: 0, warning: 0, risk: 0 },
  );

  return (
    <div className="space-y-5">
      <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-[#0c2747]">Öğrenciler</h1>
        <p className="mt-1 text-sm text-slate-600">
          Durum bazlı öğrenci takibi yap, riskli öğrencileri anında gör.
        </p>
        <form action="/coach/students" method="get" className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="İsim veya e-posta ara..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:bg-white"
          />
          <select
            name="view"
            defaultValue={view}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:bg-white"
          >
            <option value="all">Tüm öğrenciler</option>
            <option value="good">İyi ilerleme</option>
            <option value="warning">Yavaş ilerleme</option>
            <option value="risk">Riskli öğrenciler</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Filtreyi uygula
          </button>
        </form>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase text-emerald-700">İyi</p>
            <p className="text-xl font-bold text-emerald-800">{statusCounts.good}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase text-amber-700">Yavaş</p>
            <p className="text-xl font-bold text-amber-800">{statusCounts.warning}</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase text-rose-700">Riskli</p>
            <p className="text-xl font-bold text-rose-800">{statusCounts.risk}</p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{statusLabelFromView(view)}</p>
          <p className="text-xs text-slate-500">{studentsWithStatus.length} kayıt</p>
        </div>
        {studentsWithStatus.length === 0 ? (
          <p className="text-sm text-slate-600">Aktif öğrenci bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {studentsWithStatus.map((item) => (
              <Link
                key={item.student.id}
                href={`/coach/students/${item.student.id}`}
                className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-sky-300 hover:bg-sky-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                      {getStudentInitials(item.student)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{getStudentDisplayName(item.student)}</p>
                      <p className="text-xs text-slate-600">{item.student.user.email}</p>
                      <p className="text-xs text-slate-500">
                        Güncel kilo: {item.latestMetric?.weight ?? "-"} kg · Hedef: {item.student.goal ?? "-"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-sky-700">Dosyayı aç →</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Son check-in: {item.lastCheckIn?.submittedAt.toLocaleDateString("tr-TR") ?? "Yok"}
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${
                      item.status === "good"
                        ? "bg-emerald-500"
                        : item.status === "warning"
                          ? "bg-amber-400"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${item.progressPct}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                  {item.noCheckIn ? (
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">Check-in eksik</span>
                  ) : null}
                  {item.noPhoto ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Foto güncel değil</span>
                  ) : null}
                  {item.stalledWeight ? (
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">Kilo değişimi düşük</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
