import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStudentDisplayName } from "@/lib/student-display";
import Image from "next/image";
import { redirect } from "next/navigation";
import { StudentProfileForm } from "../profile-form";

const photoTypeLabel: Record<string, string> = {
  front: "Ön",
  side: "Yan",
  back: "Arka",
};

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true } },
      coach: { select: { fullName: true } },
      progressPhotos: { orderBy: { date: "desc" }, take: 12 },
      metrics: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!student) {
    return (
      <div className="px-4">
        <p className="text-zinc-400">Profil bulunamadı.</p>
      </div>
    );
  }

  const displayName = getStudentDisplayName(student);
  const latestMetric = student.metrics[0];
  const previousMetric = student.metrics[1];
  const weightDiff =
    latestMetric?.weight != null && previousMetric?.weight != null
      ? latestMetric.weight - previousMetric.weight
      : null;
  const profileRiskFlags = [
    !student.phone ? "Iletisim telefonu eksik." : null,
    !student.heightCm ? "Boy bilgisi eksik." : null,
    !student.goal ? "Hedef metni net degil." : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Profil</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {displayName} · Koç: {student.coach.fullName}
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Profil ozeti</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-zinc-500">Son kilo</p>
            <p className="mt-1 text-lg font-black text-zinc-900">
              {latestMetric?.weight != null ? `${latestMetric.weight} kg` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-zinc-500">Kilo degisimi</p>
            <p className="mt-1 text-lg font-black text-zinc-900">
              {weightDiff == null ? "—" : `${weightDiff > 0 ? "+" : ""}${weightDiff.toFixed(1)} kg`}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-zinc-500">Son check-in verisi</p>
            <p className="mt-1 text-sm font-bold text-zinc-900">
              {latestMetric ? latestMetric.date.toLocaleDateString("tr-TR") : "Kayit yok"}
            </p>
          </div>
        </div>
        {profileRiskFlags.length > 0 ? (
          <ul className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {profileRiskFlags.map((flag) => (
              <li key={flag}>⚠ {flag}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Koç ile çalışma dönemi</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Başlangıç: {student.startDate.toLocaleDateString("tr-TR")}
        </p>
        <p className="mt-1 text-sm text-zinc-700">
          Tahmini dönem sonu:{" "}
          {new Date(
            student.startDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("tr-TR")}
        </p>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">İlk kayıt (anamnez) ve iletişim</h2>
        <StudentProfileForm
          defaultFullName={student.fullName ?? ""}
          defaultPhone={student.phone ?? ""}
          defaultHeightCm={student.heightCm != null ? String(student.heightCm) : ""}
          defaultGoal={student.goal ?? ""}
          defaultNotes={student.notes ?? ""}
        />
      </section>

      {student.metrics.length ? (
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Son raporlar</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            {student.metrics.map((m) => (
              <li key={m.id} className="flex justify-between border-b border-zinc-200 py-2 last:border-0">
                <span>{m.date.toLocaleDateString("tr-TR")}</span>
                <span>
                  {m.weight != null ? `${m.weight} kg` : "—"}
                  {m.waist != null ? ` · bel ${m.waist}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">Form fotoğrafları</h2>
        {student.progressPhotos.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">Check-in ile yüklediğin fotoğraflar burada listelenir.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {student.progressPhotos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl border border-zinc-200">
                <Image
                  src={photo.fileUrl}
                  alt={`Form: ${photoTypeLabel[photo.photoType] ?? photo.photoType}`}
                  width={200}
                  height={200}
                  className="aspect-square w-full object-cover"
                />
                <p className="p-2 text-[10px] font-semibold text-zinc-500">
                  {photoTypeLabel[photo.photoType] ?? photo.photoType} · {photo.date.toLocaleDateString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
