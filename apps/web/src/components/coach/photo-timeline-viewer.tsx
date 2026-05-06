"use client";

import Image from "next/image";
import { useState } from "react";

type TimelinePhoto = {
  id: string;
  fileUrl: string;
  label: string;
};

export function PhotoTimelineViewer({ photos }: { photos: TimelinePhoto[] }) {
  const [active, setActive] = useState<TimelinePhoto | null>(null);

  if (photos.length === 0) {
    return <p className="text-sm text-slate-600">Fotoğraf kaydı yok.</p>;
  }

  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(photo)}
            className="overflow-hidden rounded-xl border border-slate-200 p-2 text-left transition hover:border-sky-300"
          >
            <Image src={photo.fileUrl} alt={photo.label} className="h-28 w-full rounded-lg object-cover" width={220} height={112} />
            <p className="mt-1 text-xs font-medium text-slate-600">{photo.label}</p>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-[100] bg-black/90 p-4" onClick={() => setActive(null)}>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white"
          >
            Kapat
          </button>
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
            <Image
              src={active.fileUrl}
              alt={active.label}
              className="max-h-[90vh] w-auto rounded-xl object-contain"
              width={1600}
              height={1200}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
