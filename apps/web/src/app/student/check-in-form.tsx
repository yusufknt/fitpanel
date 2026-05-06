"use client";

import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";
import { submitCheckIn, type CheckInFormState } from "./actions";

const initial: CheckInFormState = {};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-emerald-500/15 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4";

export function StudentCheckInForm() {
  const [state, formAction] = useActionState(submitCheckIn, initial);

  return (
    <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Uyum skoru <span className="text-red-500">*</span> (1–10)
        </label>
        <input
          name="complianceScore"
          type="number"
          min={1}
          max={10}
          required
          className={`${inputClass} mt-1`}
          placeholder="Bu hafta plana ne kadar uyduğunu puanla"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Kilo (kg) <span className="text-red-500">*</span>
        </label>
        <input name="weight" type="number" step="0.1" min={1} max={400} required className={`${inputClass} mt-1`} placeholder="Örn. 78.4" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mod</label>
        <select name="mood" className={`${inputClass} mt-1`}>
          <option value="">Seç (isteğe bağlı)</option>
          <option value="İyi">İyi</option>
          <option value="Orta">Orta</option>
          <option value="Düşük">Düşük</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bel (cm)</label>
        <input name="waist" type="number" step="0.1" className={`${inputClass} mt-1`} placeholder="İsteğe bağlı" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Göğüs (cm)</label>
        <input name="chest" type="number" step="0.1" className={`${inputClass} mt-1`} placeholder="İsteğe bağlı" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kol (cm)</label>
        <input name="arm" type="number" step="0.1" className={`${inputClass} mt-1`} placeholder="İsteğe bağlı" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bacak (cm)</label>
        <input name="leg" type="number" step="0.1" className={`${inputClass} mt-1`} placeholder="İsteğe bağlı" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Yağ oranı (%)</label>
        <input name="bodyFat" type="number" step="0.1" className={`${inputClass} mt-1`} placeholder="İsteğe bağlı" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Haftalık not</label>
        <textarea name="notes" rows={4} className={`${inputClass} mt-1`} placeholder="Antrenmanlar, uyku, beslenme, zorlandığın noktalar..." />
      </div>
      <div className="md:col-span-2">
        <SubmitButton idleText="Check-in gönder" pendingText="Gönderiliyor..." />
      </div>
      {state.error ? <p className="md:col-span-2 text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="md:col-span-2 text-sm text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
