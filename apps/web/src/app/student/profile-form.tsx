"use client";

import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";
import { updateStudentProfile, type ProfileFormState } from "./actions";

const initial: ProfileFormState = {};

const inputClass =
  "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20";

export function StudentProfileForm({
  defaultFullName,
  defaultPhone,
  defaultHeightCm,
  defaultGoal,
  defaultNotes,
}: {
  defaultFullName: string;
  defaultPhone: string;
  defaultHeightCm: string;
  defaultGoal: string;
  defaultNotes: string;
}) {
  const [state, formAction] = useActionState(updateStudentProfile, initial);

  return (
    <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Ad soyad</label>
        <input name="fullName" defaultValue={defaultFullName} className={`${inputClass} mt-1`} placeholder="Örn. Ayşe Yılmaz" />
        <p className="mt-1 text-xs text-zinc-600">Koçunun seni doğru tanıyabilmesi için tam adını yaz.</p>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Telefon</label>
        <input name="phone" type="tel" defaultValue={defaultPhone} className={`${inputClass} mt-1`} placeholder="+90 5xx xxx xx xx" />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Boy (cm)</label>
        <input
          name="heightCm"
          type="number"
          step="0.1"
          min={50}
          max={250}
          defaultValue={defaultHeightCm}
          className={`${inputClass} mt-1`}
          placeholder="Örn. 175"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Hedefin</label>
        <input name="goal" defaultValue={defaultGoal} className={`${inputClass} mt-1`} placeholder="Örn. Kilo vermek, kilo almak, güçlenmek" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Sağlık geçmişi / sakatlık / soruların</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultNotes}
          className={`${inputClass} mt-1`}
          placeholder="Örn: Belimde eski sakatlık var, şu ilacı kullanıyorum, koçuma şu soruyu sormak istiyorum..."
        />
      </div>
      <div className="md:col-span-2">
        <SubmitButton
          idleText="Bilgileri kaydet"
          pendingText="Kaydediliyor..."
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
        />
      </div>
      {state.error ? <p className="md:col-span-2 text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="md:col-span-2 text-sm font-semibold text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
