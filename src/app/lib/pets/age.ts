export function formatAge(birthDateISO: string) {
  const birth = new Date(birthDateISO);
  const now = new Date();

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (!Number.isFinite(months) || months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (years <= 0) return `${months} months`;
  if (remMonths === 0) return `${years} years`;
  return `${years}y ${remMonths}m`;
}
