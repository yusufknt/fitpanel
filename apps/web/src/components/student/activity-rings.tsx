/** Apple Fitness tarzı üç halka — yüzdeler 0–100 */
export function ActivityRings({
  workoutPct,
  nutritionPct,
  waterPct,
}: {
  workoutPct: number;
  nutritionPct: number;
  waterPct: number;
}) {
  const w = 120;
  const h = 120;
  const cx = 60;
  const cy = 60;
  const rings = [
    { r: 44, width: 8, pct: workoutPct, color: "#a3e635", label: "Antrenman" },
    { r: 34, width: 7, pct: nutritionPct, color: "#22d3ee", label: "Beslenme" },
    { r: 24, width: 6, pct: waterPct, color: "#38bdf8", label: "Su" },
  ];

  const arc = (radius: number, pct: number) => {
    const p = Math.min(100, Math.max(0, pct));
    const circumference = 2 * Math.PI * radius;
    const dash = (p / 100) * circumference;
    return { circumference, dash };
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="-rotate-90">
        {rings.map((ring) => {
          const { circumference, dash } = arc(ring.r, ring.pct);
          return (
            <g key={ring.label}>
              <circle
                cx={cx}
                cy={cy}
                r={ring.r}
                fill="none"
                stroke="#27272a"
                strokeWidth={ring.width}
              />
              <circle
                cx={cx}
                cy={cy}
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.width}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                className="transition-[stroke-dasharray] duration-700"
              />
            </g>
          );
        })}
      </svg>
      <ul className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] font-medium text-zinc-400">
        {rings.map((ring) => (
          <li key={ring.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ring.color }} />
            {ring.label} %{Math.round(ring.pct)}
          </li>
        ))}
      </ul>
    </div>
  );
}
