"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const leadStatusValues = new Set(["NEW", "QUALIFIED", "CONVERTED", "LOST"]);

export async function updateLeadStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return;

  const leadId = formData.get("leadId");
  const status = formData.get("status");
  if (typeof leadId !== "string" || typeof status !== "string" || !leadStatusValues.has(status)) return;

  await prisma.applicationLead.update({
    where: { id: leadId },
    data: { status: status as "NEW" | "QUALIFIED" | "CONVERTED" | "LOST" },
  });

  revalidatePath("/coach");
}

export async function saveCoachFeedback(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return;

  const checkInId = formData.get("checkInId");
  const coachFeedback = formData.get("coachFeedback");
  if (typeof checkInId !== "string" || typeof coachFeedback !== "string") return;

  await prisma.checkIn.update({
    where: { id: checkInId },
    data: { coachFeedback: coachFeedback.trim() || null },
  });

  revalidatePath("/coach");
  revalidatePath("/student");
}

export async function convertLeadToStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return;

  const leadId = formData.get("leadId");
  if (typeof leadId !== "string") return;

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) return;

  const lead = await prisma.applicationLead.findUnique({
    where: { id: leadId },
    select: { id: true, coachId: true, email: true, fullName: true, phone: true, goal: true, status: true },
  });
  if (!lead || lead.coachId !== coach.id) return;

  const existingUser = await prisma.user.findUnique({
    where: { email: lead.email },
    include: { student: true },
  });

  if (existingUser?.role === "COACH") return;

  if (!existingUser) {
    const tempPasswordHash = await hash("Welcome123!", 10);
    await prisma.user.create({
      data: {
        email: lead.email,
        passwordHash: tempPasswordHash,
        role: "STUDENT",
        student: {
          create: {
            coachId: coach.id,
            fullName: lead.fullName,
            phone: lead.phone ?? null,
            goal: lead.goal ?? `${lead.fullName} için oluşturulan kayıt`,
            active: true,
          },
        },
      },
    });
  } else if (!existingUser.student) {
    await prisma.studentProfile.create({
      data: {
        userId: existingUser.id,
        coachId: coach.id,
        fullName: lead.fullName,
        phone: lead.phone ?? null,
        goal: lead.goal ?? `${lead.fullName} için oluşturulan kayıt`,
        active: true,
      },
    });
  } else {
    await prisma.studentProfile.update({
      where: { userId: existingUser.id },
      data: { coachId: coach.id, active: true },
    });
  }

  await prisma.applicationLead.update({
    where: { id: lead.id },
    data: { status: "CONVERTED" },
  });

  revalidatePath("/coach");
}

export async function saveStudentProgram(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return;

  const studentId = formData.get("studentId");
  const coachProgram = formData.get("coachProgram");
  const programFile = formData.get("programFile");
  const versionReason = formData.get("versionReason");
  const programStructure = formData.get("programStructure");
  if (typeof studentId !== "string" || typeof coachProgram !== "string") return;

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) return;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, coachId: true, userId: true },
  });
  if (!student || student.coachId !== coach.id) return;

  let uploadedFileUrl: string | null = null;
  if (programFile instanceof File && programFile.size > 0) {
    const allowedTypes = new Set([
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ]);
    if (!allowedTypes.has(programFile.type) || programFile.size > 20 * 1024 * 1024) return;

    const extByType: Record<string, string> = {
      "application/pdf": "pdf",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "text/csv": "csv",
    };
    const ext = extByType[programFile.type] ?? "file";
    const fileName = `${student.id}-${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "programs");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await programFile.arrayBuffer();
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
    uploadedFileUrl = `/uploads/programs/${fileName}`;
  }

  const reasonText = typeof versionReason === "string" ? versionReason.trim() : "";
  const structureText = typeof programStructure === "string" ? programStructure.trim() : "";
  const baseNote = coachProgram.trim();
  const hasAnyContent =
    !!baseNote || !!uploadedFileUrl || !!reasonText || !!structureText;
  if (!hasAnyContent) return;

  const previousText = (
    await prisma.studentProfile.findUnique({
      where: { id: student.id },
      select: { coachProgram: true },
    })
  )?.coachProgram;

  const versionCount =
    (previousText?.split("\n---\n").filter((block: string) => block.trim().startsWith("Version: v"))
      .length ?? 0) + 1;
  const versionTag = `v${versionCount}`;
  const versionLines = [
    `Version: ${versionTag}`,
    `UpdatedAt: ${new Date().toLocaleString("tr-TR")}`,
    reasonText ? `Reason: ${reasonText}` : null,
    structureText ? `StructuredPlan:\n${structureText}` : null,
    baseNote ? `CoachNote:\n${baseNote}` : null,
    uploadedFileUrl ? `Attachment: ${uploadedFileUrl}` : null,
  ].filter(Boolean) as string[];
  const versionBlock = versionLines.join("\n");
  const nextProgramText = [previousText?.trim(), versionBlock].filter(Boolean).join("\n---\n");

  await prisma.studentProfile.update({
    where: { id: student.id },
    data: {
      coachProgram: nextProgramText,
      programUpdatedAt: nextProgramText ? new Date() : null,
    },
  });

  revalidatePath("/coach");
  revalidatePath("/student");
  revalidatePath(`/coach/students/${student.id}`);
}

function optNum(v: FormDataEntryValue | null) {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function updateStudentNutritionTargets(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return;

  const studentId = formData.get("studentId");
  if (typeof studentId !== "string") return;

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) return;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, coachId: true },
  });
  if (!student || student.coachId !== coach.id) return;

  const rawDiet = formData.get("dietPlanText");
  const dietPlanText = typeof rawDiet === "string" ? rawDiet.trim() || null : null;
  const targetCalories = optNum(formData.get("targetCalories"));
  const tc = targetCalories != null ? Math.round(targetCalories) : null;

  await prisma.studentProfile.update({
    where: { id: student.id },
    data: {
      targetProteinG: optNum(formData.get("targetProteinG")),
      targetCarbG: optNum(formData.get("targetCarbG")),
      targetFatG: optNum(formData.get("targetFatG")),
      targetCalories: tc,
      dietPlanText,
    },
  });

  revalidatePath(`/coach/students/${student.id}`);
  revalidatePath("/student");
  revalidatePath("/student/nutrition");
}

export async function sendWeeklyReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COACH") return { error: "Yetkisiz islem" };

  const studentId = formData.get("studentId");
  const pdfFile = formData.get("pdfFile");
  const title = formData.get("title");

  console.log("sendWeeklyReport hit with studentId:", studentId, "title:", title);
  console.log("pdfFile:", pdfFile ? "exists" : "null", "type:", typeof pdfFile);

  if (typeof studentId !== "string" || !pdfFile || typeof title !== "string") {
    console.log("Eksik veri hatasi");
    return { error: "Eksik veri" };
  }
  
  // File veya Blob objesi mi kontrol et
  const isFileOrBlob = typeof (pdfFile as any).arrayBuffer === "function";
  console.log("isFileOrBlob:", isFileOrBlob);
  if (!isFileOrBlob) {
    console.log("Gecersiz dosya formati hatasi");
    return { error: "Gecersiz dosya formati" };
  }

  const coach = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!coach) return { error: "Koc bulunamadi" };

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, coachId: true },
  });
  if (!student || student.coachId !== coach.id) {
    console.log("Ogrenci bulunamadi hatasi");
    return { error: "Ogrenci bulunamadi" };
  }

  console.log("Ogrenci bulundu, dosya kaydediliyor...");

  try {
    const ext = "pdf";
    const fileName = `report-${student.id}-${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    await mkdir(uploadDir, { recursive: true });
    
    const bytes = await (pdfFile as any).arrayBuffer();
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
    
    const fileUrl = `/uploads/reports/${fileName}`;

    console.log("Veritabanina kaydediliyor:", fileUrl);
    await prisma.weeklyReport.create({
      data: {
        studentId: student.id,
        title,
        fileUrl,
      },
    });

    console.log("Veritabani kaydi basarili.");

    revalidatePath(`/coach/students/${student.id}`);
    revalidatePath("/student");
    
    return { success: true };
  } catch (error) {
    console.error("PDF kaydetme hatasi:", error);
    return { error: "PDF kaydedilemedi" };
  }
}
