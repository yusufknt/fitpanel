"use client";

import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/submit-button";

import { uploadProgressPhoto, type UploadPhotoState } from "./actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const initialState: UploadPhotoState = {};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-emerald-500/15 focus:border-emerald-500 focus:ring-4";

export function ProgressPhotoForm() {
  const [state, formAction] = useActionState(uploadProgressPhoto, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Çekim açısı</label>
        <select name="photoType" required className={`${inputClass} mt-1`}>
          <option value="front">Ön</option>
          <option value="side">Yan</option>
          <option value="back">Arka</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dosya</label>
        <input
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className={`${inputClass} mt-1`}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) {
              setClientError(null);
              return;
            }

            if (file.size > MAX_FILE_SIZE) {
              setClientError("Seçilen dosya 5 MB'dan büyük. Daha küçük bir fotoğraf seç.");
              event.currentTarget.value = "";
              return;
            }

            setClientError(null);
          }}
        />
      </div>
      <div className="md:col-span-2">
        <SubmitButton idleText="Fotoğrafı yükle" pendingText="Yükleniyor..." />
      </div>
      {clientError ? <p className="text-sm text-red-600 md:col-span-2">{clientError}</p> : null}
      {state.error ? <p className="text-sm text-red-600 md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700 md:col-span-2">{state.success}</p> : null}
    </form>
  );
}
