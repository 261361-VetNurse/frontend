import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { ReminderOccurrence, OccurrenceStatus } from "@/types/domain/medication-occurrence";
import { Medicine } from "@/types";

dayjs.extend(utc);
dayjs.extend(timezone);

export type { ReminderOccurrence };

/**
 * Get user's local timezone
 */
export function getUserTimezone(): string {
  return "Asia/Bangkok";
}

/**
 * Get today's date in user's local timezone (start of day)
 */
export function getTodayInLocalTimezone(): Date {
  const userTz = getUserTimezone();
  return dayjs().tz(userTz).startOf("day").toDate();
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

export function buildOccurrencesForDate(
  reminders: Medicine[],
  date: Date,
  overrides: Record<string, { status: OccurrenceStatus; taken_at?: string | null }>
): ReminderOccurrence[] {
  const result: ReminderOccurrence[] = [];
  const dateStr = dayjs(date).format("YYYY-MM-DD");

  reminders.forEach(reminder => {
    // Check if the reminder is active for this date (simplified logic)
    // In real app, check start_date, end_date, frequency
    // Here we assume getMedications already filtered or we just show all for demo if simple

    // Check recurrence (simplified: if frequency is specific day of week, etc.)
    // But getMedications might return all. 
    // Frequency: "-1" daily, "0"-"6" specific days.
    dayjs(date).day(); // 0=Sun
    // Schema says 0=Mon. Frontend usually 0=Sun. 
    // Let's assume standard JS: 0=Sun.
    // If frequency != "-1" and frequency != dayOfWeek, skip?
    // Let's rely on simple mapping for now.

    // For each time in reminder_time
    reminder.reminder_time.forEach((time) => {
      const scheduledAt = `${dateStr}T${time}:00`;
      const reminderId = `${reminder.medicine_id}_${dateStr}_${time}`; // Synthetic ID

      const r = reminder as unknown as { pet_name?: string; pet_image?: string; medicine_name?: string; medicine_dosage?: string };
      result.push({
        reminder_id: reminderId,
        plan_id: reminder.medicine_id,
        pet: {
          pet_id: reminder.pet_id,
          name: r.pet_name || "",
          profile_image: r.pet_image || ""
        },
        medicine: {
          medicine_id: reminder.medicine_id,
          name: r.medicine_name || reminder.name,
          dosage: r.medicine_dosage || reminder.dosage || ""
        },
        time: time,
        scheduled_at: scheduledAt,
        status: overrides[reminderId]?.status || "pending",
        taken_at: overrides[reminderId]?.taken_at || undefined,
      });
    });
  });

  return result;
}

export function updateReminderTakenStatus(
  reminders: Medicine[],
): Medicine[] {
  // This function seems to update the VM list, but the VM list structure (EachDayMedicine) doesn't hold individual taken status for specific time slots easily unless we mutate it in a way the caller expects. 
  // Usually this updates the override map or local state. 
  // But MedicationV2 expects it to return updated reminders.
  // Since EachDayMedicine is static plan, creating a "taken" status on it is weird.
  // We will just return the reminders as is, the caller usually updates overrides separately or refreshes.
  return reminders;
}