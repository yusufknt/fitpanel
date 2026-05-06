/** Görünen ad: önce kayıtlı ad soyad, yoksa e-posta yerel kısmı. */
export function getStudentDisplayName(student: { fullName?: string | null; user: { email: string } }) {
  const n = student.fullName?.trim();
  if (n) return n;
  const local = student.user.email.split("@")[0] ?? student.user.email;
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getStudentInitials(student: { fullName?: string | null; user: { email: string } }) {
  const n = student.fullName?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
    return `${a}${b}`.toUpperCase().slice(0, 2) || "?";
  }
  const local = student.user.email.split("@")[0] ?? "?";
  const segs = local.split(/[._-]/).filter(Boolean);
  const x = segs[0]?.[0] ?? local[0] ?? "?";
  const y = segs[1]?.[0] ?? segs[0]?.[1] ?? local[1] ?? "";
  return `${x}${y}`.toUpperCase().slice(0, 2);
}
