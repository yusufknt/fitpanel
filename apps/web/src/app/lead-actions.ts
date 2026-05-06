"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type LeadFormState = {
  error?: string;
  success?: string;
};

export async function submitLeadForm(_: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const coachId = formData.get("coachId");
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const goal = formData.get("goal");
  const selectedPackage = formData.get("selectedPackage");

  if (
    typeof coachId !== "string" ||
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    fullName.trim().length < 2 ||
    !email.includes("@")
  ) {
    return { error: "Lutfen ad soyad ve gecerli e-posta gir." };
  }

  await prisma.applicationLead.create({
    data: {
      coachId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      goal: typeof goal === "string" && goal.trim() ? goal.trim() : null,
      source: typeof selectedPackage === "string" && selectedPackage.trim() ? `landing:${selectedPackage}` : "landing",
      status: "NEW",
    },
  });

  revalidatePath("/coach");
  return { success: "Basvurun alindi. Kisa surede iletisime gecilecek." };
}
