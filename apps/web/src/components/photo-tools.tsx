"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type PhotoItem = {
  id: string;
  fileUrl: string;
  photoType: string;
  dateLabel: string;
};

type PhotoToolsProps = {
  photos: PhotoItem[];
};

export function PhotoTools({ photos }: PhotoToolsProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [leftId, setLeftId] = useState<string | null>(photos[0]?.id ?? null);
  const [rightId, setRightId] = useState<string | null>(photos[1]?.id ?? photos[0]?.id ?? null);

  const focused = photos.find((item) => item.id === focusedId) ?? null;
  const left = photos.find((item) => item.id === leftId) ?? null;
  const right = photos.find((item) => item.id === rightId) ?? null;

  const compareOptions = useMemo(
    () =>
      photos.map((photo) => ({
        id: photo.id,
        label: `${photo.photoType.toUpperCase()} - ${photo.dateLabel}`,
      })),
    [photos],
  );

  if (photos.length === 0) {
    return <p className="text-xs text-zinc-500">Fotograf kaydi yok.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        {photos.slice(0, 6).map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setFocusedId(photo.id)}
            className="rounded-md border p-2 text-left"
          >
            <Image src={photo.fileUrl} alt="Ilerleme fotografi" className="h-24 w-full rounded object-cover" width={180} height={96} />
            <p className="mt-1 text-xs uppercase text-zinc-500">{photo.photoType}</p>
          </button>
        ))}
      </div>

      <div className="rounded-md border p-3">
        <p className="text-xs uppercase text-zinc-500">Fotograf Karsilastirma</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <select
            value={leftId ?? ""}
            onChange={(event) => setLeftId(event.target.value)}
            className="rounded-md border px-2 py-1 text-sm"
          >
            {compareOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Sol: {opt.label}
              </option>
            ))}
          </select>
          <select
            value={rightId ?? ""}
            onChange={(event) => setRightId(event.target.value)}
            className="rounded-md border px-2 py-1 text-sm"
          >
            {compareOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Sag: {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {left ? (
            <Image src={left.fileUrl} alt="Sol karsilastirma fotografi" className="h-44 w-full rounded border object-cover" width={320} height={176} />
          ) : null}
          {right ? (
            <Image src={right.fileUrl} alt="Sag karsilastirma fotografi" className="h-44 w-full rounded border object-cover" width={320} height={176} />
          ) : null}
        </div>
      </div>

      {focused ? (
        <div className="rounded-md border p-3">
          <p className="text-xs uppercase text-zinc-500">Buyuk Onizleme</p>
          <Image src={focused.fileUrl} alt="Buyuk fotograf onizleme" className="mt-2 h-80 w-full rounded object-contain bg-zinc-50" width={640} height={320} />
          <p className="mt-2 text-xs text-zinc-500">
            {focused.photoType.toUpperCase()} - {focused.dateLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
