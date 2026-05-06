"use client";

import { submitCheckInWizard, type WizardState } from "./actions";
import { useEffect, useState, useTransition } from "react";

const input =
  "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-blue-400/0 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20";

function WizardConfetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="animate-pulse rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 px-8 py-6 text-center shadow-2xl">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-lg font-black text-white">Harika!</p>
        <p className="text-sm font-semibold text-blue-50">Raporun koça iletildi</p>
      </div>
    </div>
  );
}

export function CheckInWizard() {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [complianceScore, setComplianceScore] = useState("8");
  const [sleepScore, setSleepScore] = useState("7");
  const [energyScore, setEnergyScore] = useState("7");
  const [hungerLevel, setHungerLevel] = useState("normal");
  const [trainingPerformance, setTrainingPerformance] = useState("normal");
  const [steps, setSteps] = useState("");
  const [waterLiters, setWaterLiters] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFront, setPhotoFront] = useState<File | null>(null);
  const [photoSide, setPhotoSide] = useState<File | null>(null);
  const [photoBack, setPhotoBack] = useState<File | null>(null);
  const [result, setResult] = useState<WizardState>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (result.success) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2800);
      return () => clearTimeout(t);
    }
  }, [result.success]);

  const send = () => {
    const fd = new FormData();
    fd.set("weight", weight);
    if (waist) fd.set("waist", waist);
    fd.set("complianceScore", complianceScore);
    fd.set("sleepScore", sleepScore);
    fd.set("energyScore", energyScore);
    fd.set("hungerLevel", hungerLevel);
    fd.set("trainingPerformance", trainingPerformance);
    if (steps) fd.set("steps", steps);
    if (waterLiters) fd.set("waterLiters", waterLiters);
    fd.set("notes", notes);
    if (photoFront) fd.set("photo_front", photoFront);
    if (photoSide) fd.set("photo_side", photoSide);
    if (photoBack) fd.set("photo_back", photoBack);

    startTransition(async () => {
      const r = await submitCheckInWizard({}, fd);
      setResult(r);
      if (r.success) {
        setStep(1);
        setWeight("");
        setWaist("");
        setComplianceScore("8");
        setSleepScore("7");
        setEnergyScore("7");
        setHungerLevel("normal");
        setTrainingPerformance("normal");
        setSteps("");
        setWaterLiters("");
        setNotes("");
        setPhotoFront(null);
        setPhotoSide(null);
        setPhotoBack(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <WizardConfetti show={showConfetti} />

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-2 w-8 rounded-full transition ${step >= s ? "bg-blue-500" : "bg-zinc-300"}`} />
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">1 — Güncel veriler</h2>
          <p className="text-sm text-zinc-600">Lütfen güncel kilo bilginizi girin.</p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Güncel kilo (kg) *</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" required className={`${input} mt-1`} placeholder="Örn. 78.2" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Uyum skoru (1-10) *</label>
            <input value={complianceScore} onChange={(e) => setComplianceScore(e.target.value)} type="number" min={1} max={10} required className={`${input} mt-1`} />
          </div>
          <div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Bel (cm) - opsiyonel</label>
              <input value={waist} onChange={(e) => setWaist(e.target.value)} type="number" step="0.1" className={`${input} mt-1`} />
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)} className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25">
            Devam
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">2 — Form fotoğrafları</h2>
          <p className="text-sm text-zinc-600">Ön, yan ve arka açılardan fotoğraf ekleyebilirsin.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-4 py-8 text-center">
            <span className="text-sm font-bold text-blue-600">Ön</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-3 max-w-full text-xs text-zinc-600"
              onChange={(e) => setPhotoFront(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-4 py-8 text-center">
            <span className="text-sm font-bold text-blue-600">Yan</span>
            <input type="file" accept="image/*" capture="environment" className="mt-3 max-w-full text-xs text-zinc-600" onChange={(e) => setPhotoSide(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-4 py-8 text-center">
            <span className="text-sm font-bold text-blue-600">Arka</span>
            <input type="file" accept="image/*" capture="environment" className="mt-3 max-w-full text-xs text-zinc-600" onChange={(e) => setPhotoBack(e.target.files?.[0] ?? null)} />
          </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700">
              Geri
            </button>
            <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white">
              Devam
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">3 — Haftalık değerlendirme (structured)</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-zinc-600">Uyku (1-10)</label>
              <input value={sleepScore} onChange={(e) => setSleepScore(e.target.value)} type="number" min={1} max={10} className={`${input} mt-1`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Enerji (1-10)</label>
              <input value={energyScore} onChange={(e) => setEnergyScore(e.target.value)} type="number" min={1} max={10} className={`${input} mt-1`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Aclik hissi</label>
              <select value={hungerLevel} onChange={(e) => setHungerLevel(e.target.value)} className={`${input} mt-1`}>
                <option value="low">Dusuk</option>
                <option value="normal">Normal</option>
                <option value="high">Yuksek</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Antrenman performansi</label>
              <select value={trainingPerformance} onChange={(e) => setTrainingPerformance(e.target.value)} className={`${input} mt-1`}>
                <option value="low">Dusuk</option>
                <option value="normal">Normal</option>
                <option value="high">Yuksek</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Kardiyo / steps</label>
              <input value={steps} onChange={(e) => setSteps(e.target.value)} type="number" min={0} className={`${input} mt-1`} placeholder="Orn. 9500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Su tuketimi (L)</label>
              <input value={waterLiters} onChange={(e) => setWaterLiters(e.target.value)} type="number" step="0.1" min={0} className={`${input} mt-1`} placeholder="Orn. 2.8" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600">Bu hafta nasıl geçti? Notların veya koça soruların neler? *</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} required minLength={10} rows={6} className={`${input} mt-1`} placeholder="Örn: Uyku düzenim iyiydi, dizimde hafif ağrı oldu. Programla ilgili bir sorum var..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-2xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700">
              Geri
            </button>
            <button type="button" onClick={() => setStep(4)} className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white">
              Özet
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">4 — Koça gönder</h2>
          <ul className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <li>Kilo: {weight || "—"} kg</li>
            <li>Uyum: {complianceScore || "—"} / 10</li>
            <li>Uyku / Enerji: {sleepScore || "—"} / {energyScore || "—"}</li>
            <li>Aclik / Performans: {hungerLevel} / {trainingPerformance}</li>
            <li>Steps / Su: {steps || "—"} / {waterLiters || "—"} L</li>
            <li>Fotoğraf: {[photoFront && "ön", photoSide && "yan", photoBack && "arka"].filter(Boolean).join(", ") || "—"}</li>
            <li>Not uzunluğu: {notes.length} karakter</li>
          </ul>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-2xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700">
              Geri
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={send}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 disabled:opacity-60"
          >
            {pending ? "Gönderiliyor..." : "Raporu Koça Gönder"}
          </button>
        </div>
      ) : null}

      {result.error ? <p className="text-center text-sm text-red-600">{result.error}</p> : null}
      {result.success ? <p className="text-center text-sm text-emerald-700">{result.success}</p> : null}
    </div>
  );
}
