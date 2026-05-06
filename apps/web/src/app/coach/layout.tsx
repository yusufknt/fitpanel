import { auth } from "@/auth";
import { CoachPortalMobileNav } from "@/components/coach/coach-portal-mobile-nav";
import { CoachPortalHeader } from "@/components/coach/coach-portal-shell";
import { CoachPortalSidebar } from "@/components/coach/coach-portal-sidebar";
import { prisma } from "@/lib/prisma";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COACH") redirect("/student");

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true },
  });

  const coachName =
    coach?.fullName ?? session.user.email?.split("@")[0] ?? "Coach";

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#f4f7fb] text-slate-900 antialiased`}
    >
      <CoachPortalHeader
        coachName={coachName}
        coachEmail={session.user.email ?? ""}
      />
      <CoachPortalMobileNav />
      <div className="mx-auto flex w-full max-w-[1920px]">
        <CoachPortalSidebar />
        <main className="min-h-[calc(100vh-60px)] min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
