import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStudentDisplayName } from "@/lib/student-display";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StudentDocumentsView } from "@/components/student/student-documents-view";
function greetingByHour() {
  const h = new Date().getHours();
  if (h < 12) return "Günaydın";
  if (h < 18) return "Merhaba";
  return "İyi akşamlar";
}

export default async function StudentHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true } },
      coach: true,
      checkIns: { orderBy: { submittedAt: "desc" }, take: 1 },
      reports: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
        <p className="font-semibold text-slate-900">Profil bulunamadı</p>
        <p className="mt-2 text-sm text-slate-600">Koçunla iletişime geç.</p>
      </div>
    );
  }

  const displayName = getStudentDisplayName(student);
  const weekCount = Math.max(
    1,
    Math.floor((Date.now() - student.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
  );
  
  const programUrl = student.coachProgram?.split("Attachment: ")[1]?.split("\n")[0];
  const coachNote = student.coachProgram?.split("CoachNote:\n")[1]?.split("\n---")[0];
  const structuredPlan = student.coachProgram?.split("StructuredPlan:\n")[1]?.split("\nCoachNote:")[0]?.split("\nAttachment:")[0]?.split("\n---")[0];

  return (
    <div className="space-y-6 px-4 pb-8">
      <section>
        <p className="text-sm font-medium text-slate-500">{greetingByHour()},</p>
        <h1 className="mt-1 text-2xl font-black leading-tight text-slate-900">
          Merhaba {displayName}, programının {weekCount}. haftasındasın.
        </h1>
        <p className="mt-2 text-sm text-slate-600">Koçun: <span className="font-semibold">{student.coach.fullName}</span></p>
      </section>

      {/* Koçtan Mesajlar */}
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">Koçun Son Mesajı</h2>
        </div>
        <div className="rounded-2xl border border-blue-50 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            {coachNote ?? "Şu an için yeni bir mesaj bulunmuyor. Haftalık check-in raporunu gönderdiğinde koçun buraya not bırakabilir."}
          </p>
        </div>
      </section>

      {/* Haftalık Check-in */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Haftalık Rapor</h2>
        <p className="mb-6 text-sm text-slate-600">
          Gelişimini takip edebilmemiz için haftalık raporunu eksiksiz bir şekilde koçuna ilet.
        </p>
        <Link 
          href="/student/checkin" 
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
        >
          Raporu Şimdi Gönder
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </section>

      <StudentDocumentsView 
        reports={student.reports} 
        programUrl={programUrl} 
        structuredPlan={structuredPlan} 
      />
    </div>
  );
}

