/**
 * Formats a given Date instance as a local YYYY-MM-DD string.
 * This ensures that timezone shifting (like using toISOString() which implies UTC)
 * does not accidentally shift the date backward. 
 */
export const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
