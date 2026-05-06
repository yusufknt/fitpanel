"use client";

type TrendPoint = {
  dateLabel: string;
  value: number;
};

export function TrendChart({
  title,
  points,
  unit,
  colorClass,
}: {
  title: string;
  points: TrendPoint[];
  unit: string;
  colorClass: string;
}) {
  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-sm text-slate-500">Grafik için en az 2 veri noktası gerekiyor.</p>
      </div>
    );
  }

  const width = 620;
  const height = 240;
  const padX = 20;
  const padYTop = 40;
  const padYBottom = 20;

  const minVal = Math.min(...points.map((p) => p.value));
  const maxVal = Math.max(...points.map((p) => p.value));
  const range = maxVal - minVal || 1;
  const paddedMin = minVal - range * 0.1;
  const paddedMax = maxVal + range * 0.2;
  const paddedRange = paddedMax - paddedMin;

  const chartPoints = points.map((point, index) => {
    const x = padX + (index / (points.length - 1)) * (width - padX * 2);
    const y = height - padYBottom - ((point.value - paddedMin) / paddedRange) * (height - padYTop - padYBottom);
    return { ...point, x, y };
  });

  const polylinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const polygonPoints = `
    ${chartPoints[0].x},${height - padYBottom} 
    ${polylinePoints} 
    ${chartPoints[chartPoints.length - 1].x},${height - padYBottom}
  `;

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const diff = last.value - first.value;
  const diffLabel = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} ${unit}`;
  const isGood = diff <= 0; // Genelde kilo/bel düşüşü iyidir, duruma göre değişir gerçi

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-400">
            {first.dateLabel} - {last.dateLabel}
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold ${isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {diffLabel}
        </div>
      </div>

      <div className={`relative w-full ${colorClass}`}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line x1={padX} y1={height - padYBottom} x2={width - padX} y2={height - padYBottom} stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1={padX} y1={padYTop} x2={width - padX} y2={padYTop} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={padX} y1={(padYTop + height - padYBottom) / 2} x2={width - padX} y2={(padYTop + height - padYBottom) / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

          <polygon points={polygonPoints} fill={`url(#gradient-${title.replace(/\s+/g, '')})`} />
          <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

          {chartPoints.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="4" fill="currentColor" className="transition-all group-hover:r-6" />
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
              
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b" className="opacity-0 transition-opacity group-hover:opacity-100">
                {p.value}
              </text>
              
              {(i === 0 || i === chartPoints.length - 1) && (
                 <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#94a3b8" className="group-hover:opacity-0">
                   {p.value}
                 </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
