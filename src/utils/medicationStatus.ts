export type MedicationStatus = 'pending' | 'missed' | 'taken';

/**
 * Calculates the status of a medication reminder.
 * 
 * @param reminderTime - The time of the reminder in "HH:MM" format.
 * @param isTaken - Whether the medication has been marked as taken.
 * @param date - The date of the reminder (optional, defaults to today). 
 *               Should be a string or Date object convertible to a Date.
 *               If providing a string, ensure it's compatible with Date constructor (e.g. YYYY-MM-DD).
 * @returns 'pending' | 'missing' | 'taken'
 */
export const getMedicationStatus = (
    reminderTime: string,
    isTaken: boolean,
    date?: string | Date
): MedicationStatus => {
    if (isTaken) return 'taken';

    const now = new Date();

    // Create a date object for the reminder
    let reminderDate = date ? new Date(date) : new Date();

    // If date is invalid, fallback to now (though ideally should handle error)
    if (isNaN(reminderDate.getTime())) {
        reminderDate = new Date();
    }

    const [hours, minutes] = reminderTime.split(':').map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    // If we are looking at a future date (not today), and it's not taken, it's pending.
    // We need to be careful: if date is tomorrow, even if time is passed relative to NOW's time, it is pending.
    // So we must compare full timestamps.

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(reminderDate);
    checkDate.setHours(0, 0, 0, 0);

    // If the reminder date is in the future (tomorrow or later), it's always pending if not taken
    if (checkDate > today) {
        return 'pending';
    }

    // If reminder date is in the past (yesterday), and not taken, it's missing.
    if (checkDate < today) {
        return 'missed';
    }

    // If it's today, check the time
    if (now > reminderDate) {
        return 'missed';
    }

    return 'pending';
};
