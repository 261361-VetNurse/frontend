import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { MedicineReminderVM } from '@/types/medicine-reminder';

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export interface ReminderOccurrence {
  notification_id: string;
  reminder_id: string;
  pet: {
    id: string;
    name: string;
    image_url: string;
  };
  medicine: {
    id: string;
    name: string;
    dosage: string;
  };
  time: string; // HH:mm
  is_taken: boolean;
  taken_at?: string;
  occurrence_datetime: Date;
  medication_status: {
    is_stopped: boolean;
    stopped_at?: string;
    reason?: string;
  };
}

function getDayKeyInUserTz(date: Date): DayKey {
  const userTz = getUserTimezone();
  // dayjs().day(): 0=Sun ... 6=Sat
  const d = dayjs(date).tz(userTz).day();
  return (["sun","mon","tue","wed","thu","fri","sat"] as DayKey[])[d];
}

function isOnOrAfterStartingDate(reminder: MedicineReminderVM, date: Date): boolean {
  const userTz = getUserTimezone();
  const start = reminder.schedule.starting_date;
  if (!start) return true;

  const target = dayjs(date).tz(userTz).startOf("day");
  const starting = dayjs.tz(start, "YYYY-MM-DD", userTz).startOf("day");
  return target.isSame(starting) || target.isAfter(starting);
}

function matchesFrequencyOnDate(reminder: MedicineReminderVM, date: Date): boolean {
  const freq = reminder.schedule.frequency;
  if (!freq?.key) return true;

  if (freq.key === "custom") {
    const days = (freq.days_of_week ?? []) as DayKey[];
    if (days.length === 0) return false;
    return days.includes(getDayKeyInUserTz(date));
  }

  // ถ้ามี key แบบอื่น (daily, etc.) ที่ต้องการรองรับค่อยเติมตรงนี้
  // เช่น freq.key === "daily" => true
  return true;
}

function isScheduledOnDate(reminder: MedicineReminderVM, date: Date): boolean {
  return isOnOrAfterStartingDate(reminder, date) && matchesFrequencyOnDate(reminder, date);
}

/**
 * Get user's local timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get today's date in user's local timezone
 */
export function getTodayInLocalTimezone(): Date {
  const userTz = getUserTimezone();
  return dayjs().tz(userTz).startOf('day').toDate();
}

/**
 * Get current datetime in user's local timezone
 */
export function getNowInLocalTimezone(): Date {
  const userTz = getUserTimezone();
  return dayjs().tz(userTz).toDate();
}

/**
 * Combine date and time (HH:mm) to create occurrence datetime in local timezone
 */
export function createOccurrenceDateTime(date: Date, timeStr: string): Date {
  const userTz = getUserTimezone();
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  return dayjs(date)
    .tz(userTz)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0)
    .toDate();
}

/**
 * Format time for display (HH:mm to 12-hour format)
 */
export function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Flatten MedicineReminderVM array into ReminderOccurrence array for today
 */
export function flattenRemindersForDate(
  medicineReminders: MedicineReminderVM[],
  date: Date
): ReminderOccurrence[] {
  return medicineReminders
    .filter(r => !r.medication_status.is_stopped)
    .filter(r => isScheduledOnDate(r, date))
    .flatMap(r =>
      r.schedule.reminders.map(sr => ({
        notification_id: r.notification_id,
        reminder_id: sr.id,
        pet: r.pet,
        medicine: r.medicine,
        time: sr.time,
        is_taken: sr.is_taken,
        taken_at: sr.taken_at,
        occurrence_datetime: createOccurrenceDateTime(date, sr.time),
        medication_status: r.medication_status,
      }))
    );
}

export function flattenRemindersForToday(
  medicineReminders: MedicineReminderVM[]
): ReminderOccurrence[] {
  return flattenRemindersForDate(medicineReminders, getTodayInLocalTimezone());
}

/**
 * Filter reminders for home page display:
 * - All overdue (missed) reminders for today
 * - Upcoming reminders within next 2 hours (including cross-midnight)
 */
export function getHomePageReminders(
  medicineReminders: MedicineReminderVM[]
): ReminderOccurrence[] {
  const now = getNowInLocalTimezone();
  const twoHoursFromNow = dayjs(now).add(2, 'hours').toDate();
  const today = getTodayInLocalTimezone();
  const tomorrow = dayjs(today).add(1, 'day').toDate();
  
  // Get today's reminders
  const todayReminders = flattenRemindersForToday(medicineReminders);
  
  // Get tomorrow's reminders for cross-midnight check
  const tomorrowReminders = medicineReminders
    .filter(reminder => !reminder.medication_status.is_stopped)
    .flatMap(reminder => 
      reminder.schedule.reminders.map(scheduleReminder => ({
        notification_id: reminder.notification_id,
        reminder_id: scheduleReminder.id,
        pet: reminder.pet,
        medicine: reminder.medicine,
        time: scheduleReminder.time,
        is_taken: scheduleReminder.is_taken,
        taken_at: scheduleReminder.taken_at,
        occurrence_datetime: createOccurrenceDateTime(tomorrow, scheduleReminder.time),
        medication_status: reminder.medication_status,
      }))
    );
  
  const allReminders = [...todayReminders, ...tomorrowReminders];
  
  const filteredReminders = allReminders.filter(reminder => {
    const occurrenceTime = reminder.occurrence_datetime;
    
    // Overdue: earlier than now, not taken, and for today
    const isOverdue = occurrenceTime < now &&
                     dayjs(occurrenceTime).isSame(today, 'day');
    
    // Upcoming within 2 hours: between now and now + 2 hours
    const isUpcoming = occurrenceTime >= now && occurrenceTime <= twoHoursFromNow;
    
    return isOverdue || isUpcoming;
  });
  
  // Sort: overdue first (most recent first), then upcoming (earliest first)
  return filteredReminders.sort((a, b) => {
    const aIsOverdue = a.occurrence_datetime < now && !a.is_taken;
    const bIsOverdue = b.occurrence_datetime < now && !b.is_taken;
    
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    
    if (aIsOverdue && bIsOverdue) {
      // Both overdue: most recent first (DESC)
      return b.occurrence_datetime.getTime() - a.occurrence_datetime.getTime();
    } else {
      // Both upcoming: earliest first (ASC)
      return a.occurrence_datetime.getTime() - b.occurrence_datetime.getTime();
    }
  });
}

/**
 * Get all reminders for today (for MedicationPage)
 */
export function getTodayReminders(
  medicineReminders: MedicineReminderVM[]
): ReminderOccurrence[] {
  const todayReminders = flattenRemindersForToday(medicineReminders);
  
  // Sort by occurrence time ASC
  return todayReminders.sort((a, b) => 
    a.occurrence_datetime.getTime() - b.occurrence_datetime.getTime()
  );
}

/**
 * Find a specific reminder occurrence
 */
export function findReminderOccurrence(
  medicineReminders: MedicineReminderVM[],
  notificationId: string,
  reminderId: string
): ReminderOccurrence | null {
  const allReminders = flattenRemindersForToday(medicineReminders);
  return allReminders.find(
    reminder => 
      reminder.notification_id === notificationId && 
      reminder.reminder_id === reminderId
  ) || null;
}

/**
 * Update reminder taken status in the medicine reminders array
 */
export function updateReminderTakenStatus(
  medicineReminders: MedicineReminderVM[],
  notificationId: string,
  reminderId: string,
  isTaken: boolean
): MedicineReminderVM[] {
  return medicineReminders.map(reminder => {
    if (reminder.notification_id === notificationId) {
      return {
        ...reminder,
        schedule: {
          ...reminder.schedule,
          reminders: reminder.schedule.reminders.map(scheduleReminder => {
            if (scheduleReminder.id === reminderId) {
              return {
                ...scheduleReminder,
                is_taken: isTaken,
                taken_at: isTaken ? new Date().toISOString() : undefined,
              };
            }
            return scheduleReminder;
          }),
        },
      };
    }
    return reminder;
  });
}

/**
 * Update medication stopped status
 */
export function updateMedicationStoppedStatus(
  medicineReminders: MedicineReminderVM[],
  notificationId: string,
  isStopped: boolean,
  reason?: string
): MedicineReminderVM[] {
  return medicineReminders.map(reminder => {
    if (reminder.notification_id === notificationId) {
      return {
        ...reminder,
        medication_status: {
          is_stopped: isStopped,
          stopped_at: isStopped ? new Date().toISOString() : undefined,
          reason: isStopped ? reason : undefined,
        },
      };
    }
    return reminder;
  });
}