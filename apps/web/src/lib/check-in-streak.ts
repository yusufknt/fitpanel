/** Ardışık hafta sayısı: her hafta için en az bir check-in (weekStart alanına göre). */
export function consecutiveCheckInWeeks(checkIns: { weekStart: Date }[]): number {
  if (!checkIns.length) return 0;
  const times = [...new Set(checkIns.map((c) => c.weekStart.getTime()))].sort((a, b) => b - a);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let streak = 1;
  for (let i = 1; i < times.length; i++) {
    if (times[i - 1]! - times[i]! === weekMs) streak++;
    else break;
  }
  return streak;
}
