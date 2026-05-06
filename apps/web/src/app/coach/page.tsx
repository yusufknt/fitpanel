import { auth } from "@/auth";
import type {
  ActivityRow,
  UpdateItem,
} from "@/components/coach/coach-portal-dashboard";
import {
  DashboardWelcome,
  PortalStatsGrid,
  RecentStudentActivityTable,
  RecentUpdatesPanel,
  StudentProgressTrendBars,
  WeeklyCheckInPieChart,
} from "@/components/coach/coach-portal-dashboard";
import {
  getStudentDisplayName,
  getStudentInitials,
} from "@/lib/student-display";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { convertLeadToStudent, updateLeadStatus } from "./actions";

const panelCard = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100";
const panelInner = "rounded-xl border border-slate-200 bg-slate-50/80 p-4";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4";

function progressBarsFromScore(score: number | null | undefined): number[] {
  const base = typeof score === "number" ? score / 10 : 0.42;
  return Array.from({ length: 7 }, (_, i) =>
    Math.min(1, Math.max(0.12, base + ((i % 3) - 1) * 0.07)),
  );
}

function formatRelativeTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 48) return `${Math.max(1, hours)} sa önce`;
  const days = Math.floor(diff / 86400000);
  if (days < 14) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR");
}

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    view?: "all" | "risk" | "waiting";
    activity?: "all" | "unreviewed";
  }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const view = params.view ?? "all";
  const activityFilter: "all" | "unreviewed" =
    params.activity === "unreviewed" ? "unreviewed" : "all";

  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true },
  });

  const students = coach
    ? await prisma.studentProfile.findMany({
        where: { coachId: coach.id, active: true },
        include: {
          user: { select: { email: true } },
          checkIns: { orderBy: { submittedAt: "desc" }, take: 10 },
          metrics: { orderBy: { date: "desc" }, take: 10 },
          progressPhotos: { orderBy: { date: "desc" }, take: 6 },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const packages = coach
    ? await prisma.coachingPackage.findMany({
        where: { coachId: coach.id, isActive: true },
        select: { price: true },
      })
    : [];

  const leads = coach
    ? await prisma.applicationLead.findMany({
        where: { coachId: coach.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  const allCheckIns = students.flatMap((student) => student.checkIns);
  const weeklyCheckIns = allCheckIns.filter(
    (item) => item.submittedAt >= weekStart,
  );
  const weeklyCheckInStudentIds = new Set(
    weeklyCheckIns.map((item) => item.studentId),
  );
  const averageCompliance = weeklyCheckIns.length
    ? Math.round(
        weeklyCheckIns.reduce(
          (sum, item) => sum + (item.complianceScore ?? 0),
          0,
        ) / weeklyCheckIns.length,
      )
    : 0;

  const totalStudents = students.length;
  const checkInSentCount = weeklyCheckInStudentIds.size;
  const checkInMissingCount = Math.max(totalStudents - checkInSentCount, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysCheckIns = allCheckIns.filter(
    (item) => item.submittedAt >= todayStart,
  );
  const waitingStudents = students.filter((student) => {
    const latestCheckIn = student.checkIns[0];
    return latestCheckIn && !latestCheckIn.coachFeedback;
  });
  const nowMs = now.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const studentCards = students.map((student) => {
    const latestCheckIn = student.checkIns[0];
    const latestMetric = student.metrics[0];
    const latestPhoto = student.progressPhotos[0];
    const checkInAgeMs = latestCheckIn
      ? nowMs - latestCheckIn.submittedAt.getTime()
      : Number.POSITIVE_INFINITY;
    const latestPhotoAgeMs = latestPhoto
      ? nowMs - latestPhoto.date.getTime()
      : Number.POSITIVE_INFINITY;

    const lastTwoWeight = student.metrics
      .map((item) => item.weight)
      .filter((value): value is number => typeof value === "number")
      .slice(0, 2);

    const noWeightChange =
      lastTwoWeight.length === 2 &&
      Math.abs(lastTwoWeight[0] - lastTwoWeight[1]) < 0.1;
    const checkInMissing = checkInAgeMs > sevenDaysMs;
    const photoMissing = latestPhotoAgeMs > fourteenDaysMs;

    let status: "good" | "warning" | "risk" = "good";
    if (checkInMissing || (noWeightChange && photoMissing)) status = "risk";
    else if (noWeightChange || photoMissing) status = "warning";

    return {
      student,
      latestCheckIn,
      latestMetric,
      latestPhoto,
      status,
      issues: {
        checkInMissing,
        noWeightChange,
        photoMissing,
      },
    };
  });

  const problematicStudents = studentCards.filter(
    (item) =>
      item.issues.checkInMissing ||
      item.issues.noWeightChange ||
      item.issues.photoMissing,
  );

  const filteredStudentCards = studentCards.filter((item) => {
    const inQuery =
      !query ||
      item.student.user.email.toLowerCase().includes(query) ||
      (item.student.fullName ?? "").toLowerCase().includes(query);
    if (!inQuery) return false;
    if (view === "risk") return item.status === "risk";
    if (view === "waiting")
      return !!item.latestCheckIn && !item.latestCheckIn.coachFeedback;
    return true;
  });

  const topPriorityItems = [
    `${todaysCheckIns.length} check-in bugün incelenmeli`,
    `${waitingStudents.length} öğrenci geri bildirim bekliyor`,
    `${checkInMissingCount} öğrenci bu hafta check-in göndermedi`,
    `${problematicStudents.length} öğrenci riskli durumda`,
  ];
  const topRiskStudents = problematicStudents
    .map((item) => {
      const reasons = [
        item.issues.checkInMissing ? "check-in gecikmesi" : null,
        item.issues.noWeightChange ? "plateau" : null,
        item.issues.photoMissing ? "foto eksigi" : null,
      ]
        .filter(Boolean)
        .join(", ");
      return { ...item, reasons };
    })
    .slice(0, 5);

  const maxCapacity = 30;
  const availableCapacity = Math.max(maxCapacity - totalStudents, 0);

  const greetingName =
    coach?.fullName?.split(/\s+/)[0] ??
    session.user.email?.split("@")[0] ??
    "Koç";

  const totalPackageValue = packages.reduce((sum, item) => sum + item.price, 0);
  const revenueLabel =
    totalPackageValue > 0
      ? new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        }).format(totalPackageValue)
      : new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        }).format(0);

  const completionPctStat =
    averageCompliance > 0
      ? Math.min(Math.round(averageCompliance * 10), 100)
      : totalStudents > 0
        ? 72
        : 88;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = students.filter((s) => s.createdAt >= monthStart).length;

  const weeklyPiePct =
    totalStudents > 0
      ? Math.round((checkInSentCount / totalStudents) * 100)
      : 82;

  const baseCompleted = Math.max(1, checkInSentCount);
  const basePending = Math.max(1, checkInMissingCount);
  const trendWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"].map(
    (label, i) => ({
      label,
      completed: Math.max(
        2,
        Math.round(baseCompleted * (0.52 + (i % 3) * 0.07)),
      ),
      pending: Math.max(2, Math.round(basePending * (0.32 + (i % 2) * 0.06))),
    }),
  );

  let activityRows: ActivityRow[] = filteredStudentCards
    .slice(0, 6)
    .map((item) => {
      const latest = item.latestCheckIn;
      const programFresh =
        !!item.student.programUpdatedAt &&
        (!latest ||
          item.student.programUpdatedAt.getTime() >
            latest.submittedAt.getTime());
      const needsReview = !!latest && !latest.coachFeedback;
      const status = needsReview
        ? "Check-in bekliyor"
        : programFresh
          ? "Program güncellendi"
          : "Süreçte";
      const statusVariant = needsReview
        ? "warning"
        : programFresh
          ? ("success" as const)
          : ("neutral" as const);
      const last = latest?.submittedAt ?? item.student.updatedAt;

      return {
        id: item.student.id,
        name: getStudentDisplayName(item.student),
        avatarUrl: item.latestPhoto?.fileUrl,
        initials: getStudentInitials(item.student),
        status,
        statusVariant,
        lastUpdate: formatRelativeTime(last),
        progressBars: progressBarsFromScore(latest?.complianceScore ?? null),
        formPhotoCount: item.student.progressPhotos.length,
        profileHref: `/coach/students/${item.student.id}`,
      };
    });

  activityRows = activityRows.slice(0, 4);

  if (activityFilter === "unreviewed") {
    activityRows = activityRows.filter((r) => r.statusVariant === "warning");
  }

  const activityQuerySuffix = params.q
    ? `&q=${encodeURIComponent(params.q)}`
    : "";

  let recentUpdates: UpdateItem[] = [];
  const sortedCheckIns = [...allCheckIns].sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
  );
  for (const c of sortedCheckIns.slice(0, 2)) {
    const st = students.find((s) => s.id === c.studentId);
    const name = st ? getStudentDisplayName(st) : "Öğrenci";
    const itemId = `checkin-${c.id}`;
    const studentHref = st ? `/coach/students/${st.id}` : "/coach#checkins";
    recentUpdates.push({
      id: itemId,
      title: `Yeni check-in: ${name}`,
      detail: c.notes
        ? `${c.notes.slice(0, 96)}${c.notes.length > 96 ? "…" : ""}`
        : "Haftalık check-in gönderildi.",
      time: formatRelativeTime(c.submittedAt),
      accent: "sky",
      href: studentHref,
    });
  }

  const sortedByProgram = [...students].sort(
    (a, b) =>
      (b.programUpdatedAt?.getTime() ?? 0) -
      (a.programUpdatedAt?.getTime() ?? 0),
  );
  const topProgram = sortedByProgram.find((s) => s.programUpdatedAt);
  if (topProgram?.programUpdatedAt) {
    recentUpdates.push({
      id: `program-${topProgram.id}-${topProgram.programUpdatedAt.getTime()}`,
      title: `Program planı tamamlandı: ${getStudentDisplayName(topProgram)}`,
      detail: "Gelecek antrenman dönemi için plan güncellendi.",
      time: formatRelativeTime(topProgram.programUpdatedAt),
      accent: "emerald",
      href: `/coach/students/${topProgram.id}`,
    });
  }
  for (const student of students.slice(0, 2)) {
    const photo = student.progressPhotos[0];
    if (!photo) continue;
    recentUpdates.push({
      id: `photo-${photo.id}`,
      title: `Yeni form fotoğrafı: ${getStudentDisplayName(student)}`,
      detail: `${photo.photoType} açı fotoğrafı eklendi.`,
      time: formatRelativeTime(photo.date),
      accent: "amber",
      href: `/coach/students/${student.id}`,
    });
  }
  recentUpdates = recentUpdates.slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardWelcome name={greetingName} />

      <PortalStatsGrid
        activeStudents={totalStudents}
        maxCapacity={maxCapacity}
        newThisMonth={newThisMonth}
        pendingCheckIns={waitingStudents.length}
        revenueLabel={revenueLabel}
        revenueUpPct={15}
        completionPct={completionPctStat}
      />

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-5">
          <RecentStudentActivityTable
            rows={activityRows}
            activityFilter={activityFilter}
            querySuffix={activityQuerySuffix}
          />
        </div>
        <div className="space-y-6 xl:col-span-4">
          <WeeklyCheckInPieChart completedPct={weeklyPiePct} />
          <StudentProgressTrendBars weeks={trendWeeks} />
        </div>
        <div className="xl:col-span-3">
          <RecentUpdatesPanel items={recentUpdates} />
        </div>
      </section>

      <section className={panelCard}>
        <h2 className="text-lg font-semibold text-slate-900">
          Bugünün öncelikleri
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {topPriorityItems.map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
            >
              <span className="font-semibold text-sky-600">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/coach/students"
            className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-sky-700"
          >
            Öğrenci listesine git
          </Link>
          <Link
            href="/coach/checkins"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 text-center hover:bg-slate-50"
          >
            Check-in kutusuna git
          </Link>
          <Link
            href="/coach/applications"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 text-center hover:bg-slate-50"
          >
            Başvuruları yönet
          </Link>
        </div>
      </section>

      <section className={panelCard}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Today focus</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            10 saniyede karar ekrani
          </span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs font-semibold uppercase text-rose-700">Riskli ogrenciler (Top 5)</p>
            {topRiskStudents.length === 0 ? (
              <p className="mt-2 text-sm text-emerald-700">Kritik risk yok.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm text-rose-900">
                {topRiskStudents.map((item) => (
                  <li key={item.student.id} className="rounded-lg bg-white/80 px-2 py-1.5 ring-1 ring-rose-100">
                    <Link href={`/coach/students/${item.student.id}`} className="font-semibold hover:underline">
                      {getStudentDisplayName(item.student)}
                    </Link>
                    <p className="text-xs text-rose-800">{item.reasons || "genel risk"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Bekleyen islemler</p>
            <ul className="mt-2 space-y-2 text-sm text-amber-900">
              <li>{waitingStudents.length} ogrenci geri bildirim bekliyor</li>
              <li>{checkInMissingCount} ogrenci bu hafta check-in gondermedi</li>
              <li>{leads.filter((lead) => lead.status === "NEW").length} yeni basvuru var</li>
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase text-emerald-700">Hizli aksiyonlar</p>
            <div className="mt-2 grid gap-2">
              <Link href="/coach/checkins" className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700">
                Check-in inbox ac
              </Link>
              <Link href="/coach/students?view=risk" className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100/60">
                Riskli ogrencileri filtrele
              </Link>
              <Link href="/coach/applications" className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100/60">
                Basvurulari yonet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="students-list" className={panelCard}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Öğrenci kartları
          </h2>
          <Link
            href="/coach/students"
            className="text-sm font-semibold text-sky-700 hover:underline"
          >
            Tüm listeyi aç
          </Link>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {filteredStudentCards.slice(0, 6).map((item) => {
            const statusLabel =
              item.status === "good"
                ? "İlerleme iyi"
                : item.status === "warning"
                  ? "Yavaş ilerleme"
                  : "Riskli";
            const statusBar =
              item.status === "good"
                ? "bg-emerald-500"
                : item.status === "warning"
                  ? "bg-amber-400"
                  : "bg-red-500";
            const progressPct = item.latestCheckIn?.complianceScore
              ? Math.min(item.latestCheckIn.complianceScore * 10, 100)
              : 20;
            return (
              <Link
                key={item.student.id}
                href={`/coach/students/${item.student.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {getStudentInitials(item.student)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getStudentDisplayName(item.student)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.student.user.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        Son kilo: {item.latestMetric?.weight ?? "-"} kg | Son
                        check-in:{" "}
                        {item.latestCheckIn
                          ? item.latestCheckIn.submittedAt.toLocaleDateString(
                              "tr-TR",
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {statusLabel}
                  </p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${statusBar}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="checkins" className={`${panelCard} scroll-mt-24`}>
        <h2 className="text-lg font-semibold text-slate-900">
          Check-in gelen kutusu
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          {waitingStudents.length === 0 ? (
            <p className="text-slate-500">Bekleyen check-in yok.</p>
          ) : (
            waitingStudents.map((student) => (
              <Link
                key={student.id}
                href={`/coach/students/${student.id}`}
                className={`${panelInner} block hover:border-sky-300`}
              >
                <p className="font-medium">{getStudentDisplayName(student)}</p>
                <p className="text-xs text-slate-500">{student.user.email}</p>
                <p>
                  Son check-in:{" "}
                  {student.checkIns[0]?.submittedAt.toLocaleDateString("tr-TR")}{" "}
                  | Uyum: {student.checkIns[0]?.complianceScore ?? "-"}
                </p>
                <p className="text-slate-500">
                  {student.checkIns[0]?.notes ?? "Not yok."}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section id="payments" className={`${panelCard} scroll-mt-28`}>
        <h2 className="text-lg font-semibold text-slate-900">
          Ödemeler ve başvurular
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Dönüştürme işleminde öğrenci hesabı açılır. Varsayılan şifre:{" "}
          <span className="font-medium text-slate-700">Welcome123!</span>
        </p>

        <div className="mt-4 space-y-3 text-sm">
          {leads.length === 0 ? (
            <p className="text-slate-500">Henüz başvuru yok.</p>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className={panelInner}>
                <p className="font-medium">{lead.fullName}</p>
                <p>E-posta: {lead.email}</p>
                <p>Telefon: {lead.phone ?? "-"}</p>
                <p>Kaynak: {lead.source ?? "-"}</p>
                <form
                  action={updateLeadStatus}
                  className="mt-2 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="leadId" value={lead.id} />
                  <select
                    name="status"
                    defaultValue={lead.status}
                    className={inputClass + " w-auto min-w-[140px]"}
                  >
                    <option value="NEW">Yeni</option>
                    <option value="QUALIFIED">Nitelikli</option>
                    <option value="CONVERTED">Dönüştürüldü</option>
                    <option value="LOST">Kaybedildi</option>
                  </select>
                  <SubmitButton
                    idleText="Durumu kaydet"
                    pendingText="Kaydediliyor..."
                  />
                </form>
                {lead.status !== "CONVERTED" ? (
                  <form action={convertLeadToStudent} className="mt-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <SubmitButton
                      idleText="Öğrenciye dönüştür"
                      pendingText="Dönüştürülüyor..."
                    />
                  </form>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className={panelCard}>
        <h2 className="text-lg font-semibold text-slate-900">Kontenjan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={panelInner}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Maksimum
            </p>
            <p className="mt-1 text-2xl font-bold">{maxCapacity}</p>
          </div>
          <div className={panelInner}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mevcut
            </p>
            <p className="mt-1 text-2xl font-bold">{totalStudents}</p>
          </div>
          <div className={panelInner}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Boş kontenjan
            </p>
            <p className="mt-1 text-2xl font-bold">{availableCapacity}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
