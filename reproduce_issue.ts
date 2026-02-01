
import { buildOccurrencesForDate, ReminderOccurrence, getUserTimezone } from './src/utils/reminder-utils';
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// Mock MedicineReminderVM
const mockPlan: any = {
    notification_id: "plan_1",
    pet: { _id: "pet_1", name: "Pet 1" },
    medicine: { _id: "med_1", name: "Med 1", dosage: "1 pill" },
    schedule: {
        starting_date: "2024-01-01", // Simple Date
        frequency: { key: "everyday", label: "Everyday" },
        reminders: [{ id: "rem_1", time: "08:00", status: "pending", is_taken: false }],
        measurement_times_per_day: 1
    },
    medication_status: { is_stopped: false }
};

const mockPlanISO: any = {
    ...mockPlan,
    notification_id: "plan_2",
    schedule: {
        ...mockPlan.schedule,
        starting_date: "2024-01-01T00:00:00.000Z" // ISO Date
    }
};

const mockPlanMissingSchedule: any = {
    notification_id: "plan_3",
    pet: { _id: "pet_1", name: "Pet 1" },
    medicine: { _id: "med_1", name: "Med 1", dosage: "1 pill" },
    // schedule is undefined
    medication_status: { is_stopped: false }
};

const today = new Date();

console.log("--- Test 1: Standard YYYY-MM-DD ---");
const occ1 = buildOccurrencesForDate([mockPlan], today);
console.log("Result 1:", occ1.length);

console.log("--- Test 2: ISO Date String ---");
const occ2 = buildOccurrencesForDate([mockPlanISO], today);
console.log("Result 2:", occ2.length);

console.log("--- Test 3: Missing Schedule ---");
const occ3 = buildOccurrencesForDate([mockPlanMissingSchedule], today);
console.log("Result 3:", occ3.length);

// console.log("--- Debug: isOnOrAfterStartingDate logic ---");
// const start = mockPlan.schedule.starting_date;
// const userTz = "Asia/Bangkok";
// const target = dayjs(today).tz(userTz).startOf("day");
// const starting = dayjs.tz(start, "YYYY-MM-DD", userTz).startOf("day");

// console.log("Target:", target.format());
// console.log("Starting:", starting.format());
// console.log("Is After or Same:", target.isSame(starting) || target.isAfter(starting));
