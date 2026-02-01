import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

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