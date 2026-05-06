"use client";

import { useActionState } from "react";

import { submitLeadForm, type LeadFormState } from "@/app/lead-actions";
import { SubmitButton } from "./submit-button";

type LeadFormProps = {
  coachId: string;
  packageOptions: string[];
};

const initialState: LeadFormState = {};

export function LeadForm({ coachId, packageOptions }: LeadFormProps) {
  const [state, formAction] = useActionState(submitLeadForm, initialState);

  return (
    <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input type="hidden" name="coachId" value={coachId} />

      <input
        name="fullName"
        required
        placeholder="Ad Soyad"
        className="rounded-md border px-3 py-2"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="E-posta"
        className="rounded-md border px-3 py-2"
      />
      <input
        name="phone"
        placeholder="Telefon (opsiyonel)"
        className="rounded-md border px-3 py-2"
      />
      <select name="selectedPackage" className="rounded-md border px-3 py-2">
        <option value="">Paket sec (opsiyonel)</option>
        {packageOptions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <textarea
        name="goal"
        rows={3}
        placeholder="Hedefin nedir? (opsiyonel)"
        className="rounded-md border px-3 py-2 md:col-span-2"
      />
      <div className="md:col-span-2">
        <SubmitButton idleText="Basvuru Gonder" pendingText="Gonderiliyor..." />
      </div>
      {state.error ? <p className="text-sm text-red-600 md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700 md:col-span-2">{state.success}</p> : null}
    </form>
  );
}
