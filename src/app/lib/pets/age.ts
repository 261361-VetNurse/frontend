export function formatAge(birthDateISO: string) {
  if (!birthDateISO) return "-";

  const birth = new Date(birthDateISO);
  const now = new Date();

  if (isNaN(birth.getTime())) return "-";

  const diffMs = now.getTime() - birth.getTime();
  if (diffMs < 0) return "0 days";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (years === 0) return `${months} months`;
  if (remMonths === 0) return `${years} years`;
  return `${years}y ${remMonths}m`;
}
