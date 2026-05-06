import { hash } from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const coachPasswordHash = await hash("Coach123!", 10);
  const studentPasswordHash = await hash("Student123!", 10);

  const coachUser = await prisma.user.upsert({
    where: { email: "coach@smartcoach.app" },
    update: { passwordHash: coachPasswordHash, role: "COACH" },
    create: {
      email: "coach@smartcoach.app",
      passwordHash: coachPasswordHash,
      role: "COACH",
      coachProfile: {
        create: {
          slug: "demo-coach",
          fullName: "Demo Coach",
          bio: "Online fitness coaching",
        },
      },
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@smartcoach.app" },
    update: { passwordHash: studentPasswordHash, role: "STUDENT" },
    create: {
      email: "student@smartcoach.app",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      student: {
        create: {
          coachId: (
            await prisma.coachProfile.findUniqueOrThrow({
              where: { userId: coachUser.id },
              select: { id: true },
            })
          ).id,
          goal: "Kas kazanımı ve güçlenme",
          fullName: "Demo Öğrenci",
          phone: "+90 555 000 00 01",
          heightCm: 175,
        },
      },
    },
  });

  const coachProfile = await prisma.coachProfile.findUniqueOrThrow({
    where: { userId: coachUser.id },
    select: { id: true },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {
      coachId: coachProfile.id,
      goal: "Kas kazanımı ve güçlenme",
      active: true,
      fullName: "Demo Öğrenci",
      phone: "+90 555 000 00 01",
      heightCm: 175,
    },
    create: {
      userId: studentUser.id,
      coachId: coachProfile.id,
      goal: "Kas kazanımı ve güçlenme",
      active: true,
      fullName: "Demo Öğrenci",
      phone: "+90 555 000 00 01",
      heightCm: 175,
    },
  });

  await prisma.coachingPackage.deleteMany({
    where: { coachId: coachProfile.id },
  });

  await prisma.coachingPackage.createMany({
    data: [
      {
        coachId: coachProfile.id,
        title: "Starter Paket",
        durationWeeks: 4,
        price: 1499,
        description: "Haftalik check-in ve temel takip.",
        isActive: true,
      },
      {
        coachId: coachProfile.id,
        title: "Pro Paket",
        durationWeeks: 8,
        price: 2499,
        description: "Detayli olcum analizi ve yakin takip.",
        isActive: true,
      },
      {
        coachId: coachProfile.id,
        title: "Elite Paket",
        durationWeeks: 12,
        price: 3999,
        description: "Kisisel strateji, raporlama ve premium destek.",
        isActive: true,
      },
    ],
  });

  console.log("Seed tamamlandi.");
  console.log("Coach login: coach@smartcoach.app / Coach123!");
  console.log("Student login: student@smartcoach.app / Student123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
