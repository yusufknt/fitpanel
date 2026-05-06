import { CheckInWizard } from "../check-in-wizard";

export default function StudentCheckInPage() {
  return (
    <div className="px-4 pb-4">
      <h1 className="text-2xl font-black text-zinc-900">Haftalık rapor</h1>
      <p className="mt-1 text-sm text-zinc-600">Kilo, fotoğraf ve notunu tek seferde koçuna gönder.</p>
      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <CheckInWizard />
      </div>
    </div>
  );
}
