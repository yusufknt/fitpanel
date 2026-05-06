"use server";

import { auth } from "@/auth";
import { getLocalDayKey } from "@/lib/day-key";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function toOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function trimStr(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toIntInRange(value: FormDataEntryValue | null, min: number, max: number) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

export type CheckInFormState = { error?: string; success?: string };

export async function submitCheckIn(_: CheckInFormState, formData: FormData): Promise<CheckInFormState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Oturum bulunamadı veya yetkiniz yok." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) {
    return { error: "Öğrenci profili bulunamadı." };
  }

  const compliance = toOptionalNumber(formData.get("complianceScore"));
  if (compliance === null || compliance < 1 || compliance > 10) {
    return { error: "Uyum skoru 1 ile 10 arasında olmalıdır." };
  }

  const weight = toOptionalNumber(formData.get("weight"));
  if (weight === null || weight <= 0 || weight > 400) {
    return { error: "Geçerli bir kilo (kg) girmelisiniz." };
  }

  const mood = trimStr(formData.get("mood"));
  const notes = trimStr(formData.get("notes"));

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        studentId: student.id,
        weekStart,
        mood: mood || null,
        notes: notes || null,
        complianceScore: compliance,
      },
    }),
    prisma.bodyMetric.create({
      data: {
        studentId: student.id,
        date: now,
        weight,
        waist: toOptionalNumber(formData.get("waist")),
        chest: toOptionalNumber(formData.get("chest")),
        arm: toOptionalNumber(formData.get("arm")),
        leg: toOptionalNumber(formData.get("leg")),
        bodyFat: toOptionalNumber(formData.get("bodyFat")),
      },
    }),
  ]);

  revalidatePath("/student");
  revalidatePath("/coach");
  return { success: "Check-in kaydedildi. Koçun bilgilerini görebilir." };
}

export type ProfileFormState = { error?: string; success?: string };

export async function updateStudentProfile(_: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Oturum bulunamadı veya yetkiniz yok." };
  }

  const fullName = trimStr(formData.get("fullName"));
  const phone = trimStr(formData.get("phone"));
  const goal = trimStr(formData.get("goal"));
  const notes = trimStr(formData.get("notes"));
  const heightCm = toOptionalNumber(formData.get("heightCm"));

  if (fullName.length > 120) return { error: "Ad soyad çok uzun." };
  if (phone.length > 40) return { error: "Telefon çok uzun." };
  if (goal.length > 500) return { error: "Hedef metni çok uzun." };
  if (notes.length > 2000) return { error: "Not alanı çok uzun." };
  if (heightCm !== null && (heightCm < 50 || heightCm > 250)) {
    return { error: "Boy 50–250 cm arasında olmalıdır." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return { error: "Öğrenci profili bulunamadı." };

  await prisma.studentProfile.update({
    where: { id: student.id },
    data: {
      fullName: fullName || null,
      phone: phone || null,
      goal: goal || null,
      notes: notes || null,
      heightCm,
    },
  });

  revalidatePath("/student");
  revalidatePath("/student/profile");
  revalidatePath("/coach");
  return { success: "Profil bilgilerin güncellendi." };
}

export type UploadPhotoState = {
  error?: string;
  success?: string;
};

export async function uploadProgressPhoto(
  _: UploadPhotoState,
  formData: FormData,
): Promise<UploadPhotoState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Yetkisiz istek." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) {
    return { error: "Öğrenci profili bulunamadı." };
  }

  const photoType = formData.get("photoType");
  const file = formData.get("photo");

  if (typeof photoType !== "string" || !(file instanceof File) || file.size === 0) {
    return { error: "Geçerli bir fotoğraf seçmelisin." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Fotoğraf boyutu 5 MB'dan büyük olamaz." };
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedTypes.has(file.type)) {
    return { error: "Sadece JPG, PNG veya WEBP yükleyebilirsin." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${student.id}-${Date.now()}-${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "progress");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  await prisma.progressPhoto.create({
    data: {
      studentId: student.id,
      date: new Date(),
      photoType,
      fileUrl: `/uploads/progress/${fileName}`,
    },
  });

  revalidatePath("/student");
  revalidatePath("/coach");
  return { success: "Fotoğraf başarıyla yüklendi." };
}

export type WizardState = { error?: string; success?: string };

export async function submitCheckInWizard(_: WizardState, formData: FormData): Promise<WizardState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Oturum bulunamadı veya yetkiniz yok." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return { error: "Öğrenci profili bulunamadı." };

  const weight = toOptionalNumber(formData.get("weight"));
  if (weight === null || weight <= 0 || weight > 400) {
    return { error: "Geçerli bir kilo (kg) girmelisin." };
  }

  const compliance = toOptionalNumber(formData.get("complianceScore"));
  if (compliance === null || compliance < 1 || compliance > 10) {
    return { error: "Uyum skoru 1–10 arasında olmalıdır." };
  }

  const notes = trimStr(formData.get("notes"));
  if (notes.length < 10) {
    return { error: "Değerlendirme metni en az 10 karakter olmalıdır." };
  }

  const mood = trimStr(formData.get("mood"));
  const sleepScore = toIntInRange(formData.get("sleepScore"), 1, 10);
  const energyScore = toIntInRange(formData.get("energyScore"), 1, 10);
  const hungerLevel = trimStr(formData.get("hungerLevel"));
  const trainingPerformance = trimStr(formData.get("trainingPerformance"));
  const steps = toOptionalNumber(formData.get("steps"));
  const waterLiters = toOptionalNumber(formData.get("waterLiters"));

  const structuredLines = [
    sleepScore != null ? `Uyku: ${sleepScore}/10` : null,
    energyScore != null ? `Enerji: ${energyScore}/10` : null,
    hungerLevel ? `Aclik: ${hungerLevel}` : null,
    trainingPerformance ? `Antrenman performansi: ${trainingPerformance}` : null,
    steps != null ? `Steps: ${Math.max(0, Math.round(steps))}` : null,
    waterLiters != null ? `Su: ${Math.max(0, waterLiters).toFixed(1)} L` : null,
  ].filter(Boolean) as string[];
  const composedNotes = [
    structuredLines.length > 0 ? `Structured check-in | ${structuredLines.join(" | ")}` : null,
    notes,
  ]
    .filter(Boolean)
    .join("\n\n");

  const front = formData.get("photo_front");
  const side = formData.get("photo_side");
  const back = formData.get("photo_back");
  const files: { file: File; type: string }[] = [];
  if (front instanceof File && front.size > 0) files.push({ file: front, type: "front" });
  if (side instanceof File && side.size > 0) files.push({ file: side, type: "side" });
  if (back instanceof File && back.size > 0) files.push({ file: back, type: "back" });
  if (files.length === 0) {
    return { error: "En az bir form fotoğrafı (ön, yan veya arka) yüklemelisin." };
  }

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.checkIn.create({
        data: {
          studentId: student.id,
          weekStart,
          mood: mood || null,
          notes: composedNotes,
          complianceScore: compliance,
        },
      });
      await tx.bodyMetric.create({
        data: {
          studentId: student.id,
          date: now,
          weight,
          waist: toOptionalNumber(formData.get("waist")),
          chest: toOptionalNumber(formData.get("chest")),
          arm: toOptionalNumber(formData.get("arm")),
          leg: toOptionalNumber(formData.get("leg")),
          bodyFat: toOptionalNumber(formData.get("bodyFat")),
        },
      });
      for (const { file, type } of files) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Fotoğraf çok büyük.");
        const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
        if (!allowedTypes.has(file.type)) throw new Error("Geçersiz fotoğraf türü.");
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const fileName = `${student.id}-${Date.now()}-${randomUUID()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "progress");
        await mkdir(uploadDir, { recursive: true });
        const bytes = await file.arrayBuffer();
        await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
        await tx.progressPhoto.create({
          data: {
            studentId: student.id,
            date: now,
            photoType: type,
            fileUrl: `/uploads/progress/${fileName}`,
          },
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Kayıt başarısız.";
    return { error: msg };
  }

  revalidatePath("/student");
  revalidatePath("/student/checkin");
  revalidatePath("/student/profile");
  revalidatePath("/coach");
  return { success: "Check-in koça gönderildi!" };
}

export async function addWaterGlass(_?: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") return;

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return;

  const dayKey = getLocalDayKey();
  await prisma.studentDailyLog.upsert({
    where: { studentId_dayKey: { studentId: student.id, dayKey } },
    create: { studentId: student.id, dayKey, waterGlasses: 1 },
    update: { waterGlasses: { increment: 1 } },
  });

  revalidatePath("/student");
}

export async function toggleMeal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") return;

  const meal = trimStr(formData.get("meal"));
  const field =
    meal === "breakfast"
      ? "breakfastDone"
      : meal === "lunch"
        ? "lunchDone"
        : meal === "dinner"
          ? "dinnerDone"
          : meal === "snack"
            ? "snackDone"
            : null;
  if (!field) return;

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return;

  const dayKey = getLocalDayKey();
  const existing = await prisma.studentDailyLog.findUnique({
    where: { studentId_dayKey: { studentId: student.id, dayKey } },
  });

  const current =
    field === "breakfastDone"
      ? existing?.breakfastDone
      : field === "lunchDone"
        ? existing?.lunchDone
        : field === "dinnerDone"
          ? existing?.dinnerDone
          : existing?.snackDone;

  await prisma.studentDailyLog.upsert({
    where: { studentId_dayKey: { studentId: student.id, dayKey } },
    create: {
      studentId: student.id,
      dayKey,
      waterGlasses: 0,
      breakfastDone: field === "breakfastDone" ? true : false,
      lunchDone: field === "lunchDone" ? true : false,
      dinnerDone: field === "dinnerDone" ? true : false,
      snackDone: field === "snackDone" ? true : false,
    },
    update: { [field]: !current },
  });

  revalidatePath("/student");
  revalidatePath("/student/nutrition");
}

export type WorkoutLogState = { error?: string; success?: string };

export async function logWorkoutSession(_: WorkoutLogState, formData: FormData): Promise<WorkoutLogState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Oturum bulunamadı." };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return { error: "Profil bulunamadı." };

  const exerciseName = trimStr(formData.get("exerciseName"));
  if (exerciseName.length < 2 || exerciseName.length > 120) {
    return { error: "Geçerli bir hareket adı gir." };
  }

  const setsJson = trimStr(formData.get("setsJson"));
  let sets: { targetReps?: number; actualReps?: number; targetWeightKg?: number; actualWeightKg?: number }[];
  try {
    sets = JSON.parse(setsJson || "[]") as typeof sets;
  } catch {
    return { error: "Set verisi okunamadı." };
  }
  if (!Array.isArray(sets) || sets.length === 0 || sets.length > 12) {
    return { error: "1–12 set gir." };
  }

  const numOrNull = (v: unknown) => {
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  };
  const floatOrNull = (v: unknown) => {
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const performedAt = new Date();
  await prisma.studentWorkoutEntry.createMany({
    data: sets.map((s, i) => ({
      studentId: student.id,
      performedAt,
      exerciseName,
      setIndex: i + 1,
      targetReps: numOrNull(s.targetReps),
      actualReps: numOrNull(s.actualReps),
      targetWeightKg: floatOrNull(s.targetWeightKg),
      actualWeightKg: floatOrNull(s.actualWeightKg),
    })),
  });

  revalidatePath("/student");
  revalidatePath("/student/workout");
  revalidatePath("/coach");
  revalidatePath(`/coach/students/${student.id}`);
  return { success: "Setler kaydedildi." };
}
