import { auth } from "@/auth";
import { StudentAppHeader } from "@/components/student/student-app-header";
import { StudentBottomNav } from "@/components/student/student-bottom-nav";
import { prisma } from "@/lib/prisma";
import { getStudentDisplayName } from "@/lib/student-display";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/coach");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true, user: { select: { email: true } } },
  });

  const displayName = profile ? getStudentDisplayName(profile) : session.user.email ?? "Öğrenci";

  return (
    <div className={`${inter.className} min-h-screen bg-zinc-50 text-zinc-900 antialiased`}>
      <StudentAppHeader displayName={displayName} />
      <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-lg pb-28 pt-2 sm:max-w-xl">{children}</div>
      <StudentBottomNav />
    </div>
  );
}
