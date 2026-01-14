import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { MedicineReminderVM } from "@/types/medicine-reminder";
import { MedicationOccurrenceVM, OccurrenceStatus } from "@/types/medication-occurrence";

dayjs.extend(utc);
dayjs.extend(timezone);

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

type OccurrenceOverride = {
  status: OccurrenceStatus;
  taken_at?: string | null;
};

/**
 * Get user's local timezone
 */
export function getUserTimezone(): string {
  return "Asia/Bangkok";
}

/**
 * Build stable occurrence_id (key for overrides + UI deep-link)
 */
export function buildOccurrenceId(planId: string, dateYYYYMMDD: string, timeHHmm: string) {
  return `occ_${planId}_${dateYYYYMMDD}_${timeHHmm.replace(":", "")}`;
}

/**
 * Helper: get DayKey in user's timezone
 */
function getDayKeyInUserTz(date: Date): DayKey {
  const userTz = getUserTimezone();
  // dayjs().day(): 0=Sun ... 6=Sat
  const d = dayjs(date).tz(userTz).day();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DayKey[])[d];
}

/**
 * Helper: date must be on/after starting_date (YYYY-MM-DD) in user's TZ
 */
function isOnOrAfterStartingDate(plan: MedicineReminderVM, date: Date): boolean {
  const userTz = getUserTimezone();
  const start = plan.schedule.starting_date; // required by your new type

  if (!start) return true; // defensive

  const target = dayjs(date).tz(userTz).startOf("day");
  const starting = dayjs.tz(start, "YYYY-MM-DD", userTz).startOf("day");
  return target.isSame(starting) || target.isAfter(starting);
}

/**
 * Helper: frequency match for a given date
 */
function matchesFrequencyOnDate(plan: MedicineReminderVM, date: Date): boolean {
  const freq = plan.schedule.frequency;

  // new keys: "everyday" | "interval_hours" | "custom"
  if (freq.key === "everyday") return true;

  if (freq.key === "custom") {
    const days = (freq.days_of_week ?? []) as DayKey[];
    if (days.length === 0) return false;
    return days.includes(getDayKeyInUserTz(date));
  }

  // interval_hours:
  // In your current data model you still have explicit reminders[].time (per-day times),
  // so for date-level eligibility we allow it on any day after starting_date.
  // (If later you want true rolling-interval occurrences across days, implement that at occurrence generation layer.)
  if (freq.key === "interval_hours") return true;

  return true;
}

function isScheduledOnDate(plan: MedicineReminderVM, date: Date): boolean {
  return isOnOrAfterStartingDate(plan, date) && matchesFrequencyOnDate(plan, date);
}

/**
 * Combine date (YYYY-MM-DD) + time (HH:mm) to an ISO string with correct TZ offset.
 */
function buildScheduledAtISO(dateYYYYMMDD: string, timeHHmm: string): string {
  const userTz = getUserTimezone();
  // produces ISO with offset (e.g. 2026-01-11T08:00:00+07:00)
  return dayjs.tz(`${dateYYYYMMDD} ${timeHHmm}`, "YYYY-MM-DD HH:mm", userTz).format();
}

/**
 * "ReminderOccurrence" = an occurrence generated from (plan + reminder slot + date)
 * - This is what your UI generally needs (plan_id + reminder_id + scheduled time + status)
 */
export type ReminderOccurrence = MedicationOccurrenceVM & {
  reminder_id: string; // schedule.reminders[].id
  time: string; // schedule.reminders[].time (HH:mm)
  frequency_label: string; // from plan.schedule.frequency.label
};

/**
 * Build occurrences for a given date from plans + overrides
 * - filters stopped plans
 * - filters plans not scheduled on that date (starting_date + frequency)
 * - derives occurrence_id using plan_id + date + time
 * - applies overrides by occurrence_id
 */
export function buildOccurrencesForDate(
  plans: MedicineReminderVM[],
  date: Date,
  overrides: Record<string, OccurrenceOverride> = {}
): ReminderOccurrence[] {
  const userTz = getUserTimezone();
  const ymd = dayjs(date).tz(userTz).format("YYYY-MM-DD");

  return plans
    .filter(p => !p.medication_status.is_stopped)
    .filter(p => isScheduledOnDate(p, date))
    .flatMap(p =>
      p.schedule.reminders.map(slot => {
        const occurrenceId = buildOccurrenceId(p.notification_id, ymd, slot.time);
        const override = overrides[occurrenceId];

        // default: if reminder slot already has taken_at, treat as taken; else pending
        const baseStatus: OccurrenceStatus =
          slot.taken_at ? "taken" : slot.status === "missed" ? "missed" : "pending";

        const status: OccurrenceStatus = override?.status ?? baseStatus;
        const taken_at: string | null =
          status === "taken"
            ? (override?.taken_at ?? slot.taken_at ?? null)
            : null;

        return {
          occurrence_id: occurrenceId,
          plan_id: p.notification_id,
          reminder_id: slot.id,
          frequency_label: p.schedule.frequency.label,
          time: slot.time,
          pet: p.pet,
          medicine: p.medicine,
          scheduled_at: buildScheduledAtISO(ymd, slot.time),
          status,
          taken_at,
        };
      })
    );
}

/**
 * Get today's date in user's local timezone (start of day)
 */
export function getTodayInLocalTimezone(): Date {
  const userTz = getUserTimezone();
  return dayjs().tz(userTz).startOf("day").toDate();
}

/**
 * Get current datetime in user's local timezone
 */
export function getNowInLocalTimezone(): Date {
  const userTz = getUserTimezone();
  return dayjs().tz(userTz).toDate();
}

/**
 * Format time for display (HH:mm -> 12-hour)
 */
export function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get all occurrences for today (for MedicationPage)
 */
export function getTodayReminders(
  plans: MedicineReminderVM[],
  overrides: Record<string, OccurrenceOverride> = {}
): ReminderOccurrence[] {
  const today = getTodayInLocalTimezone();
  const occs = buildOccurrencesForDate(plans, today, overrides);

  // Sort by scheduled time ASC
  return occs.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
}

/**
 * Home page filter:
 * - overdue (today, scheduled_at < now, status pending)
 * - upcoming within next 2 hours (including cross-midnight by checking tomorrow)
 */
export function getHomePageReminders(
  plans: MedicineReminderVM[],
  overrides: Record<string, OccurrenceOverride> = {}
): ReminderOccurrence[] {
  const now = getNowInLocalTimezone();
  const userTz = getUserTimezone();

  const today = dayjs(now).tz(userTz).startOf("day").toDate();
  const tomorrow = dayjs(today).add(1, "day").toDate();
  const twoHoursFromNow = dayjs(now).add(2, "hours").toDate();

  const todayOccs = buildOccurrencesForDate(plans, today, overrides);
  const tomorrowOccs = buildOccurrencesForDate(plans, tomorrow, overrides);

  const allOccs = [...todayOccs, ...tomorrowOccs];

  const filtered = allOccs.filter(occ => {
    const t = new Date(occ.scheduled_at);

    const isToday = dayjs(t).tz(userTz).isSame(dayjs(today).tz(userTz), "day");
    const isOverdue = isToday && t < now || occ.status === "missed";
    const isUpcoming = t >= now && t <= twoHoursFromNow;

    return isOverdue || isUpcoming;
  });

  // Sort: overdue first (most recent first), then upcoming (earliest first)
  return filtered.sort((a, b) => {
    const aT = new Date(a.scheduled_at).getTime();
    const bT = new Date(b.scheduled_at).getTime();

    const aIsOverdue = aT < now.getTime() && a.status === "pending";
    const bIsOverdue = bT < now.getTime() && b.status === "pending";

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    if (aIsOverdue && bIsOverdue) return bT - aT; // DESC
    return aT - bT; // ASC
  });
}

/**
 * Find a specific occurrence for today by (plan_id + reminder_id)
 */
export function findReminderOccurrence(
  plans: MedicineReminderVM[],
  notificationId: string,
  reminderId: string,
  overrides: Record<string, OccurrenceOverride> = {}
): ReminderOccurrence | null {
  const occs = getTodayReminders(plans, overrides);
  return (
    occs.find(o => o.plan_id === notificationId && o.reminder_id === reminderId) ?? null
  );
}

/**
 * Update reminder taken status in the plans array (immutable)
 * - updates schedule.reminders[].taken_at
 * - updates schedule.reminders[].status (string) to "taken" or "pending"
 */
export function updateReminderTakenStatus(
  plans: MedicineReminderVM[],
  notificationId: string,
  reminderId: string,
  isTaken: boolean
): MedicineReminderVM[] {
  const status: OccurrenceStatus = isTaken ? "taken" : "pending";
  const takenAt = isTaken ? new Date().toISOString() : undefined;

  return plans.map(plan => {
    if (plan.notification_id !== notificationId) return plan;

    return {
      ...plan,
      schedule: {
        ...plan.schedule,
        reminders: plan.schedule.reminders.map(slot => {
          if (slot.id !== reminderId) return slot;

          return {
            ...slot,
            status, // stored as string in your type
            taken_at: takenAt,
          };
        }),
      },
    };
  });
}

/**
 * Update medication stopped status (immutable)
 */
export function updateMedicationStoppedStatus(
  plans: MedicineReminderVM[],
  notificationId: string,
  isStopped: boolean,
  reason?: string
): MedicineReminderVM[] {
  return plans.map(plan => {
    if (plan.notification_id !== notificationId) return plan;

    return {
      ...plan,
      medication_status: {
        is_stopped: isStopped,
        stopped_at: isStopped ? new Date().toISOString() : undefined,
        reason: isStopped ? reason : undefined,
      },
    };
  });
}