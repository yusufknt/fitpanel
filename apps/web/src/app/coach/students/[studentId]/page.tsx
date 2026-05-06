import { auth } from "@/auth";
import { saveCoachFeedback, saveStudentProgram, updateStudentNutritionTargets } from "@/app/coach/actions";
import { PhotoTimelineViewer } from "@/components/coach/photo-timeline-viewer";
import { TrendChart } from "@/components/coach/trend-chart";
import { WeeklyReportGenerator } from "@/components/coach/weekly-report-generator";
import { SubmitButton } from "@/components/submit-button";
import { getStudentDisplayName } from "@/lib/student-display";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const card =
  "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100 scroll-mt-28";

const photoTypeLabel: Record<string, string> = {
  front: "Ön",
  side: "Yan",
  back: "Arka",
};

function diffLabel(current: number | null | undefined, previous: number | null | undefined, unit: string) {
  if (current == null || previous == null) return "—";
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} ${unit}`;
}

export default async function StudentProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") redirect("/login");

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) redirect("/coach");

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { email: true } },
      checkIns: { orderBy: { submittedAt: "desc" }, take: 40 },
      metrics: { orderBy: { date: "desc" }, take: 40 },
      progressPhotos: { orderBy: { date: "desc" }, take: 24 },
      workoutEntries: { orderBy: [{ performedAt: "desc" }, { setIndex: "asc" }], take: 120 },
    },
  });

  if (!student || student.coachId !== coach.id) notFound();

  const title = getStudentDisplayName(student);
  const orderedMetrics = [...student.metrics].reverse();
  const weightPoints = orderedMetrics
    .filter((item): item is typeof item & { weight: number } => typeof item.weight === "number")
    .map((item) => ({ value: item.weight, dateLabel: item.date.toLocaleDateString("tr-TR") }));
  const waistPoints = orderedMetrics
    .filter((item): item is typeof item & { waist: number } => typeof item.waist === "number")
    .map((item) => ({ value: item.waist, dateLabel: item.date.toLocaleDateString("tr-TR") }));
  const programLinks = (student.coachProgram ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\//i.test(line));
  const programVersions = (student.coachProgram ?? "")
    .split("\n---\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .reverse();

  const workoutGroups = new Map<string, typeof student.workoutEntries>();
  for (const row of student.workoutEntries) {
    const key = `${row.performedAt.toISOString()}__${row.exerciseName}`;
    const list = workoutGroups.get(key) ?? [];
    list.push(row);
    workoutGroups.set(key, list);
  }
  const workoutSessions = [...workoutGroups.entries()]
    .map(([key, sets]) => ({ key, sets, at: sets[0]!.performedAt, exercise: sets[0]!.exerciseName }))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 25);

  const metricByDay = new Map(
    student.metrics.map((m) => [m.date.toLocaleDateString("tr-TR"), m] as const),
  );
  const checkInsForReview = student.checkIns.slice(0, 8);
  const latestCheckIn = student.checkIns[0];
  const previousCheckIn = student.checkIns[1];
  const latestMetric = student.metrics[0];
  const previousMetric = student.metrics[1];

  const latestWeight = latestMetric?.weight ?? null;
  const previousWeight = previousMetric?.weight ?? null;
  const weightDelta = latestWeight != null && previousWeight != null ? latestWeight - previousWeight : null;
  const latestCompliance = latestCheckIn?.complianceScore ?? null;
  const previousCompliance = previousCheckIn?.complianceScore ?? null;
  const complianceDelta =
    latestCompliance != null && previousCompliance != null ? latestCompliance - previousCompliance : null;

  const bmi =
    student.heightCm && latestWeight
      ? latestWeight / Math.pow(student.heightCm / 100, 2)
      : null;
  const stagnantWeight =
    latestWeight != null && previousWeight != null && Math.abs(latestWeight - previousWeight) < 0.1;
  const lowCompliance = latestCompliance != null && latestCompliance < 5;
  const downCompliance = complianceDelta != null && complianceDelta <= -2;
  const missingPhoto14d =
    !student.progressPhotos[0] ||
    Date.now() - student.progressPhotos[0].date.getTime() > 14 * 24 * 60 * 60 * 1000;
  const criticalLowWeight = !!(student.heightCm && latestWeight && student.heightCm >= 185 && latestWeight <= 50);

  const riskFlags = [
    stagnantWeight ? "Kilo iki haftadir stabil (plateau riski)." : null,
    lowCompliance ? "Uyum skoru 5 altinda." : null,
    downCompliance ? "Uyum dusus egiliminde." : null,
    missingPhoto14d ? "14+ gundur guncel progress fotografi yok." : null,
    criticalLowWeight ? "CRITICAL: Boy-kilo saglik riski sinirinda." : null,
  ].filter(Boolean) as string[];

  const complianceScore100 = latestCompliance != null ? latestCompliance * 10 : 55;
  const nutritionScore100 = latestMetric?.bodyFat != null ? Math.max(20, Math.min(100, 100 - latestMetric.bodyFat)) : 62;
  const trainingScore100 =
    workoutSessions.length > 0
      ? Math.max(35, Math.min(100, Math.round((workoutSessions.length / 12) * 100)))
      : 40;
  const progressScore = Math.round(
    complianceScore100 * 0.45 + nutritionScore100 * 0.25 + trainingScore100 * 0.3,
  );

  const coachSummary =
    weightDelta == null
      ? "Yeterli kilo verisi yok; check-in trendi olustukca ozet netlesecek."
      : weightDelta < 0
        ? `Son 7 gunde kilo ${Math.abs(weightDelta).toFixed(1)} kg azaldi, uyum ${latestCompliance ?? "-"} / 10.`
        : `Son 7 gunde kilo +${weightDelta.toFixed(1)} kg, uyum ${latestCompliance ?? "-"} / 10.`;

  const reportData = {
    studentId: student.id,
    studentName: title,
    progressScore,
    complianceScore: complianceScore100,
    nutritionScore: nutritionScore100,
    trainingScore: trainingScore100,
    coachSummary,
    latestWeight,
    weightDelta,
    complianceDelta,
    bmi,
    weightPoints,
    waistPoints,
    latestCheckIn: latestCheckIn
      ? {
          dateLabel: latestCheckIn.submittedAt.toLocaleDateString("tr-TR"),
          mood: latestCheckIn.mood,
          complianceScore: latestCheckIn.complianceScore,
          notes: latestCheckIn.notes,
          coachFeedback: latestCheckIn.coachFeedback,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className={card}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Link href="/coach" className="text-sm font-semibold text-sky-600 hover:underline">
              ← Panele dön
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-[#0c2747]">Öğrenci dosyası</h1>
            <p className="mt-1 text-lg font-semibold text-slate-800">{title}</p>
            <p className="text-sm text-slate-600">{student.user.email}</p>
            {student.phone ? <p className="text-sm text-slate-600">Telefon: {student.phone}</p> : null}
          </div>
          <div className="flex-shrink-0">
            <WeeklyReportGenerator data={reportData} />
          </div>
        </div>
      </header>

      <section className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Koc ozet karti</h2>
        <p className="mt-2 text-sm text-slate-700">{coachSummary}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Progress score</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{progressScore}/100</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Compliance</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{complianceScore100}/100</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Nutrition</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{nutritionScore100}/100</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Training</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{trainingScore100}/100</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Hizli durum</p>
            <p className="mt-1 text-sm text-slate-700">
              Kilo degisimi: {diffLabel(latestWeight, previousWeight, "kg")} | Uyum degisimi:{" "}
              {diffLabel(latestCompliance, previousCompliance, "puan")} | BMI:{" "}
              {bmi != null ? bmi.toFixed(1) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase text-amber-700">Risk flags</p>
            {riskFlags.length === 0 ? (
              <p className="mt-1 text-sm text-emerald-700">Aktif kritik risk gorunmuyor.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-amber-900">
                {riskFlags.map((flag) => (
                  <li key={flag}>⚠ {flag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#checkin-review" className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">
            Haftalik plan oner
          </a>
          <a href="#nutrition-targets" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
            Beslenme duzelt
          </a>
          <a href="#program-management" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
            Antrenman revize et
          </a>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Temel bilgiler</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Başlangıç</p>
            <p className="mt-1 font-medium">{student.startDate.toLocaleDateString("tr-TR")}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Boy</p>
            <p className="mt-1 font-medium">{student.heightCm != null ? `${student.heightCm} cm` : "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Son kilo</p>
            <p className="mt-1 font-medium">{student.metrics[0]?.weight != null ? `${student.metrics[0].weight} kg` : "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Durum</p>
            <p className="mt-1 font-medium">{student.active ? "Aktif" : "Pasif"}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Hedef</p>
          <p className="mt-1 text-slate-800">{student.goal ?? "—"}</p>
        </div>
        {student.notes ? (
          <div className="mt-3 rounded-xl border border-slate-100 bg-amber-50/50 p-4">
            <p className="text-xs font-semibold uppercase text-amber-800">Öğrenci notu</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{student.notes}</p>
          </div>
        ) : null}
      </section>

      <section id="program-management" className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Program dosyası yükle ve ata</h2>
        <p className="mt-1 text-sm text-slate-600">
          Programi versiyonlayarak yonet: her degisiklik neden ve tarih ile kaydolur.
        </p>
        <form action={saveStudentProgram} className="mt-4 grid gap-3">
          <input type="hidden" name="studentId" value={student.id} />
          <input
            name="versionReason"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Bu guncellemenin nedeni (orn: plateau nedeniyle volume artisi)"
          />
          <textarea
            name="programStructure"
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder={"Structured plan (orn):\nGun 1: Push\nBench Press | 4x6 | RIR2 | Tempo 3-1-1\nIncline DB Press | 3x8 | RIR2"}
          />
          <textarea
            name="coachProgram"
            defaultValue=""
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Koç notu veya ek aciklama..."
          />
          <input
            type="file"
            name="programFile"
            accept=".pdf,.xls,.xlsx,.csv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div>
            <button type="submit" className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
              Programı kaydet ve öğrenciye ata
            </button>
          </div>
        </form>
        {programLinks.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Paylaşılan dosyalar / linkler</p>
            {programLinks.map((link) => (
              <a key={link} href={link} target="_blank" rel="noreferrer" className="block text-sm font-medium text-sky-700 underline">
                {link}
              </a>
            ))}
          </div>
        ) : null}
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Program versiyonlari</p>
          {programVersions.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz versiyon kaydi yok.</p>
          ) : (
            programVersions.slice(0, 6).map((version, index) => (
              <pre
                key={`version-${index}`}
                className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
              >
                {version}
              </pre>
            ))
          )}
        </div>
      </section>

      <section id="checkin-review" className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Check-in kayıtları ve değerlendirme</h2>
        <p className="mt-1 text-sm text-slate-600">
          Öğrencinin tüm check-in geçmişi burada listelenir. Değerlendirmelerini yazabilir veya güncelleyebilirsin.
        </p>
        <div className="mt-4 space-y-4 text-sm">
          {student.checkIns.length === 0 ? (
            <p className="text-slate-600">Henüz check-in kaydı yok.</p>
          ) : (
            student.checkIns.map((item) => {
              const metric = metricByDay.get(item.submittedAt.toLocaleDateString("tr-TR"));
              const previous = student.checkIns.find((c) => c.submittedAt < item.submittedAt);
              return (
                <form key={item.id} action={saveCoachFeedback} className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:border-sky-200">
                  <input type="hidden" name="checkInId" value={item.id} />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-[#0c2747]">{item.submittedAt.toLocaleString("tr-TR")}</p>
                      <p className="text-xs text-slate-500">Hafta başlangıcı: {item.weekStart.toLocaleDateString("tr-TR")}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.coachFeedback ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.coachFeedback ? "Değerlendirildi" : "Geri bildirim bekliyor"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase text-slate-500">Uyum & Mod</p>
                      <p className="mt-1 font-medium text-slate-800">
                        Uyum: {item.complianceScore ?? "—"} / 10 · Mod: {item.mood ?? "—"}
                      </p>
                      {previous ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Önceki haftaya göre: {diffLabel(item.complianceScore ?? null, previous.complianceScore ?? null, "puan")}
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold uppercase text-slate-500">Fiziksel Ölçümler</p>
                      {metric ? (
                        <p className="mt-1 font-medium text-slate-800">
                          {metric.weight ?? "—"} kg · Bel {metric.waist ?? "—"} cm · Göğüs {metric.chest ?? "—"} cm · Kol {metric.arm ?? "—"} cm
                        </p>
                      ) : (
                        <p className="mt-1 font-medium text-slate-800">Ölçüm girilmedi.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold uppercase text-slate-500">Öğrencinin Notu</p>
                    <p className="mt-1 font-medium text-slate-800">{item.notes ?? "—"}</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-xs font-semibold uppercase text-[#0c2747]">Senin Geri Bildirimin</label>
                    <textarea
                      name="coachFeedback"
                      defaultValue={item.coachFeedback ?? ""}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Analizini ve haftalık aksiyonlarını yaz..."
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <SubmitButton idleText="Analizi Kaydet" pendingText="Kaydediliyor..." />
                  </div>
                </form>
              );
            })
          )}
        </div>
      </section>

      <section id="nutrition-targets" className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Beslenme hedefleri</h2>
        <form action={updateStudentNutritionTargets} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="studentId" value={student.id} />
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Diyet metni (öğün listesi)</label>
            <textarea
              name="dietPlanText"
              rows={4}
              defaultValue={student.dietPlanText ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Her satırda bir öğün veya madde..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Kalori</label>
            <input
              name="targetCalories"
              type="number"
              defaultValue={student.targetCalories ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Protein (g)</label>
            <input
              name="targetProteinG"
              type="number"
              step="0.1"
              defaultValue={student.targetProteinG ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Karbonhidrat (g)</label>
            <input
              name="targetCarbG"
              type="number"
              step="0.1"
              defaultValue={student.targetCarbG ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Yağ (g)</label>
            <input
              name="targetFatG"
              type="number"
              step="0.1"
              defaultValue={student.targetFatG ?? ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Beslenme bilgisini kaydet
            </button>
          </div>
        </form>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Antrenman performansı</h2>
        {workoutSessions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Henüz set kaydı yok.</p>
        ) : (
          <ul className="mt-4 space-y-4 text-sm">
            {workoutSessions.map(({ key, sets, at, exercise }) => (
              <li key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-[#0c2747]">{exercise}</p>
                <p className="text-xs text-slate-500">{at.toLocaleString("tr-TR")}</p>
                <ul className="mt-2 space-y-1 text-slate-700">
                  {sets.map((s) => (
                    <li key={s.id}>
                      Set {s.setIndex}: {s.actualWeightKg ?? "—"} kg × {s.actualReps ?? "—"} tekrar
                      {s.targetWeightKg != null || s.targetReps != null ? (
                        <span className="text-slate-400">
                          {" "}
                          (hedef {s.targetReps ?? "—"} × {s.targetWeightKg ?? "—"} kg)
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Grafikler</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TrendChart title="Kilo trendi" unit="kg" points={weightPoints} colorClass="text-sky-600" />
          <TrendChart title="Bel ölçüsü trendi" unit="cm" points={waistPoints} colorClass="text-emerald-600" />
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-[#0c2747]">Fotoğraf zaman çizelgesi</h2>
        <PhotoTimelineViewer
          photos={student.progressPhotos.map((photo) => ({
            id: photo.id,
            fileUrl: photo.fileUrl,
            label: `${photoTypeLabel[photo.photoType] ?? photo.photoType} · ${photo.date.toLocaleDateString("tr-TR")}`,
          }))}
        />
      </section>


    </div>
  );
}
