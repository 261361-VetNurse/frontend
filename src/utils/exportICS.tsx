export type ICSAppointment = {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

export function exportICS(a: ICSAppointment) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}00Z`;

  const content = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pet App//Appointment//EN
BEGIN:VEVENT
UID:${Date.now()}@pet-app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(a.start)}
DTEND:${formatDate(a.end)}
SUMMARY:${a.title}
DESCRIPTION:${a.description ?? ""}
LOCATION:${a.location ?? ""}
END:VEVENT
END:VCALENDAR
`.trim();

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
