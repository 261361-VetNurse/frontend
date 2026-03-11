export type CalendarAppointment = {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

export function addToGoogleCalendar(a: CalendarAppointment) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}00Z`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", a.title);
  if (a.description) url.searchParams.append("details", a.description);
  if (a.location) url.searchParams.append("location", a.location);
  url.searchParams.append("dates", `${formatDate(a.start)}/${formatDate(a.end)}`);

  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

export function downloadICS(a: CalendarAppointment) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}00Z`;

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pet App//Appointment//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@pet-app.app`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(a.start)}`,
    `DTEND:${formatDate(a.end)}`,
    `SUMMARY:${a.title}`,
    `DESCRIPTION:${(a.description ?? "").replace(/\n/g, "\\n")}`,
    `LOCATION:${(a.location ?? "").replace(/\n/g, "\\n")}`,
    "SEQUENCE:0",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const safeName = a.title.replace(/\s+/g, "_");
  link.download = `${safeName}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
