// // import {MedicineReminderVM} from "@/types/domain/medication";

// // export const mockMedicineReminderVMs: MedicineReminderVM[] = [
// //     {
// //         notification_id: "65f1a9c2b0f3c1a2d3e4fa10",
// //         pet: {
// //             id: "65f1a9c2b0f3c1a2d3e4f601",
// //             name: "Mochi",
// //             image_url: "/pets-example/pet-ex1.svg",
// //         },
// //         medicine: {
// //             id: "65f1a9c2b0f3c1a2d3e4f811",
// //             name: "Probiotics Capsule",
// //             dosage: "150mg",
// //         },
// //         schedule: {
// //             frequency: { key: "everyday", label: "Everyday" },
// //             reminders: [
// //                 {
// //                     id: "r1",
// //                     time: "02:00",
// //                 },
// //                 {
// //                     id: "r2",
// //                     time: "20:00",
// //                 },
// //             ],
// //             measurement_times_per_day: 2,
// //             starting_date: "2025-11-15",
// //         },
// //         medication_status: {
// //             is_stopped: false,
// //         },
// //     },

// //     {
// //         notification_id: "65f1a9c2b0f3c1a2d3e4fa11",
// //         pet: {
// //             id: "65f1a9c2b0f3c1a2d3e4f602",
// //             name: "Taro",
// //             image_url: "/pets-example/pet-ex2.svg",
// //         },
// //         medicine: {
// //             id: "65f1a9c2b0f3c1a2d3e4f812",
// //             name: "Amoxicillin",
// //             dosage: "5 ml",
// //         },
// //         schedule: {
// //             frequency: { key: "interval_hours", label: "Every 8 hours", interval_hours: 8 },
// //             reminders: [
// //                 { id: "r1", time: "06:00"},
// //                 { id: "r2", time: "14:00"},
// //                 { id: "r3", time: "22:00"},
// //             ],
// //             measurement_times_per_day: 3,
// //             starting_date: "2026-01-01",
// //         },
// //         medication_status: {
// //             is_stopped: false,
// //         },
// //     },

// //     {
// //         notification_id: "65f1a9c2b0f3c1a2d3e4fa12",
// //         pet: {
// //             id: "65f1a9c2b0f3c1a2d3e4f603",
// //             name: "Luna",
// //             image_url: "/pets-example/pet-ex3.svg",
// //         },
// //         medicine: {
// //             id: "65f1a9c2b0f3c1a2d3e4f813",
// //             name: "Dewormer",
// //             dosage: "1 tab",
// //         },
// //         schedule: {
// //             frequency: {
// //                 key: "custom",
// //                 label: "Mon, Fri",
// //                 days_of_week: ["mon", "fri"],
// //             },
// //             reminders: [{ id: "r1", time: "02:00" }],
// //             measurement_times_per_day: 1,
// //             starting_date: "2026-01-02",
// //         },
// //         medication_status: {
// //             is_stopped: false
// //         },
// //     },

// //     // Additional test cases for home page filtering
// //     {
// //         notification_id: "65f1a9c2b0f3c1a2d3e4fa13",
// //         pet: {
// //             id: "65f1a9c2b0f3c1a2d3e4f601",
// //             name: "Mochi",
// //             image_url: "/pets-example/pet-ex1.svg",
// //         },
// //         medicine: {
// //             id: "65f1a9c2b0f3c1a2d3e4f814",
// //             name: "Vitamin D",
// //             dosage: "2 drops",
// //         },
// //         schedule: {
// //             frequency: { key: "everyday", label: "Everyday" },
// //             reminders: [
// //                 {
// //                     id: "r1",
// //                     time: "12:00", // Noon - should show if within 2 hours
// //                 },
// //             ],
// //             measurement_times_per_day: 1,
// //             starting_date: "2026-01-01",
// //         },
// //         medication_status: {
// //             is_stopped: false,
// //         },
// //     },

// //     {
// //         notification_id: "65f1a9c2b0f3c1a2d3e4fa14",
// //         pet: {
// //             id: "65f1a9c2b0f3c1a2d3e4f602",
// //             name: "Taro",
// //             image_url: "/pets-example/pet-ex2.svg",
// //         },
// //         medicine: {
// //             id: "65f1a9c2b0f3c1a2d3e4f815",
// //             name: "Pain Relief",
// //             dosage: "1/2 tablet",
// //         },
// //         schedule: {
// //             frequency: { key: "everyday", label: "Everyday" },
// //             reminders: [
// //                 {
// //                     id: "r1",
// //                     time: "07:00", // Morning - might be overdue depending on current time
// //                 },
// //             ],
// //             measurement_times_per_day: 1,
// //             starting_date: "2026-01-01",
// //         },
// //         medication_status: {
// //             is_stopped: false,
// //         },
// //     },
// // ];
// import { MedicineReminderVM } from "@/types/domain/medication";

// export const mockMedicineReminderVMs: MedicineReminderVM[] = [
//   {
//     notification_id: "65f1a9c2b0f3c1a2d3e4fa10",
//     pet: {
//       _id: "65f1a9c2b0f3c1a2d3e4f601",      // ✅ แก้ id -> _id
//       name: "Mochi",
//       profile_image: "/pets-example/pet-ex1.svg", // ✅ แก้ image_url -> profile_image
//     },
//     medicine: {
//       _id: "65f1a9c2b0f3c1a2d3e4f811",      // ✅ แก้ id -> _id
//       name: "Probiotics Capsule",
//       dosage: "150mg",
//     },
//     schedule: {
//       frequency: { key: "everyday", label: "Everyday" },
//       reminders: [
//         {
//           id: "r1",
//           time: "02:00",
//           is_taken: false,
//         },
//         {
//           id: "r2",
//           time: "20:00",
//           is_taken: true,
//           taken_at: "2026-01-07T20:03:00.000Z",
//         },
//       ],
//       measurement_times_per_day: 2,
//       starting_date: "2025-11-15",
//     },
//     medication_status: {
//       is_stopped: false,
//     },
//   },

//   {
//     notification_id: "65f1a9c2b0f3c1a2d3e4fa11",
//     pet: {
//       _id: "65f1a9c2b0f3c1a2d3e4f602",
//       name: "Taro",
//       profile_image: "/pets-example/pet-ex2.svg",
//     },
//     medicine: {
//       _id: "65f1a9c2b0f3c1a2d3e4f812",
//       name: "Amoxicillin",
//       dosage: "5 ml",
//     },
//     schedule: {
//       frequency: { key: "interval_hours", label: "Every 8 hours", interval_hours: 8 },
//       reminders: [
//         { id: "r1", time: "06:00", is_taken: false }, // ✅ เพิ่ม is_taken
//         { id: "r2", time: "14:00", is_taken: false }, // ✅ เพิ่ม is_taken
//         { id: "r3", time: "22:00", is_taken: false }, // ✅ เพิ่ม is_taken
//       ],
//       measurement_times_per_day: 3,
//       starting_date: "2026-01-01",
//     },
//     medication_status: {
//       is_stopped: false,
//     },
//   },

//   {
//     notification_id: "65f1a9c2b0f3c1a2d3e4fa12",
//     pet: {
//       _id: "65f1a9c2b0f3c1a2d3e4f603",
//       name: "Luna",
//       profile_image: "/pets-example/pet-ex3.svg",
//     },
//     medicine: {
//       _id: "65f1a9c2b0f3c1a2d3e4f813",
//       name: "Dewormer",
//       dosage: "1 tab",
//     },
//     schedule: {
//       frequency: {
//         key: "custom",
//         label: "Mon, Fri",
//         days_of_week: ["mon", "fri"],
//       },
//       reminders: [{ id: "r1", time: "02:00", is_taken: false }], // ✅ เพิ่ม is_taken
//       measurement_times_per_day: 1,
//       starting_date: "2026-01-02",
//     },
//     medication_status: {
//       is_stopped: false,
//     },
//   },

//   // Additional test cases for home page filtering
//   {
//     notification_id: "65f1a9c2b0f3c1a2d3e4fa13",
//     pet: {
//       _id: "65f1a9c2b0f3c1a2d3e4f601",
//       name: "Mochi",
//       profile_image: "/pets-example/pet-ex1.svg",
//     },
//     medicine: {
//       _id: "65f1a9c2b0f3c1a2d3e4f814",
//       name: "Vitamin D",
//       dosage: "2 drops",
//     },
//     schedule: {
//       frequency: { key: "everyday", label: "Everyday" },
//       reminders: [
//         {
//           id: "r1",
//           time: "12:00", 
//           is_taken: false, 
//         },
//       ],
//       measurement_times_per_day: 1,
//       starting_date: "2026-01-01",
//     },
//     medication_status: {
//       is_stopped: false,
//     },
//   },

//   {
//     notification_id: "65f1a9c2b0f3c1a2d3e4fa14",
//     pet: {
//       _id: "65f1a9c2b0f3c1a2d3e4f602",
//       name: "Taro",
//       profile_image: "/pets-example/pet-ex2.svg",
//     },
//     medicine: {
//       _id: "65f1a9c2b0f3c1a2d3e4f815",
//       name: "Pain Relief",
//       dosage: "1/2 tablet",
//     },
//     schedule: {
//       frequency: { key: "everyday", label: "Everyday" },
//       reminders: [
//         {
//           id: "r1",
//           time: "07:00", 
//           is_taken: false, 
//         },
//       ],
//       measurement_times_per_day: 1,
//       starting_date: "2026-01-01",
//     },
//     medication_status: {
//       is_stopped: false,
//     },
//   },
// ];

import { MedicineReminderVM } from "@/types/domain/medication";
import { mockPets } from "./pets.mock";

const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];
const luna = mockPets.find(p => p.name === "Luna") || mockPets[2];

export const mockMedicineReminderVMs: MedicineReminderVM[] = [
  {
    notification_id: "notif-001",
    pet: {
      _id: mochi._id,      // ✅ แก้ id -> _id
      name: mochi.name,
      profile_image: mochi.profile_image || "", // ✅ แก้ image_url -> profile_image
    },
    medicine: {
      _id: "65f1a9c2b0f3c1a2d3e4f811",      // ✅ แก้ id -> _id
      name: "Probiotics Capsule",
      dosage: "150mg",
    },
    schedule: {
      frequency: { key: "everyday", label: "Everyday" },
      reminders: [
        {
          id: "r1",
          time: "02:00",
          is_taken: false,
          status: "pending",
        },
        {
          id: "r2",
          time: "20:00",
          is_taken: true,
          taken_at: "2026-01-07T20:03:00.000Z",
          status: "taken",
        },
      ],
      measurement_times_per_day: 2,
      starting_date: "2025-11-15",
    },
    medication_status: {
      is_stopped: false,
    },
  },

  {
    notification_id: "notif-002",
    pet: {
      _id: taro._id,
      name: taro.name,
      profile_image: taro.profile_image || "",
    },
    medicine: {
      _id: "65f1a9c2b0f3c1a2d3e4f812",
      name: "Amoxicillin",
      dosage: "5 ml",
    },
    schedule: {
      frequency: { key: "interval_hours", label: "Every 8 hours", interval_hours: 8 },
      reminders: [
        { id: "r1", time: "06:00", is_taken: false, status: "pending" }, // ✅ เพิ่ม is_taken
        { id: "r2", time: "14:00", is_taken: false, status: "pending" }, // ✅ เพิ่ม is_taken
        { id: "r3", time: "22:00", is_taken: false, status: "pending" }, // ✅ เพิ่ม is_taken
      ],
      measurement_times_per_day: 3,
      starting_date: "2026-01-01",
    },
    medication_status: {
      is_stopped: false,
    },
  },

  {
    notification_id: "notif-003",
    pet: {
      _id: luna._id,
      name: luna.name,
      profile_image: luna.profile_image || "",
    },
    medicine: {
      _id: "65f1a9c2b0f3c1a2d3e4f813",
      name: "Dewormer",
      dosage: "1 tab",
    },
    schedule: {
      frequency: {
        key: "custom",
        label: "Mon, Fri",
        days_of_week: ["mon", "fri"],
      },
      reminders: [{ id: "r1", time: "02:00", is_taken: false, status: "pending" }], // ✅ เพิ่ม is_taken
      measurement_times_per_day: 1,
      starting_date: "2026-01-02",
    },
    medication_status: {
      is_stopped: false,
    },
  },

  // Additional test cases for home page filtering
  {
    notification_id: "65f1a9c2b0f3c1a2d3e4fa13",
    pet: {
      _id: mochi._id,
      name: mochi.name,
      profile_image: mochi.profile_image || "",
    },
    medicine: {
      _id: "65f1a9c2b0f3c1a2d3e4f814",
      name: "Vitamin D",
      dosage: "2 drops",
    },
    schedule: {
      frequency: { key: "everyday", label: "Everyday" },
      reminders: [
        {
          id: "r1",
          time: "12:00",
          is_taken: false,
          status: "pending",
        },
      ],
      measurement_times_per_day: 1,
      starting_date: "2026-01-01",
    },
    medication_status: {
      is_stopped: false,
    },
  },

  {
    notification_id: "65f1a9c2b0f3c1a2d3e4fa14",
    pet: {
      _id: taro._id,
      name: taro.name,
      profile_image: taro.profile_image || "",
    },
    medicine: {
      _id: "65f1a9c2b0f3c1a2d3e4f815",
      name: "Pain Relief",
      dosage: "1/2 tablet",
    },
    schedule: {
      frequency: { key: "everyday", label: "Everyday" },
      reminders: [
        {
          id: "r1",
          time: "07:00",
          is_taken: false,
          status: "pending",
        },
      ],
      measurement_times_per_day: 1,
      starting_date: "2026-01-01",
    },
    medication_status: {
      is_stopped: false,
    },
  },
];

import { ReminderOccurrence } from "@/types/domain/medication-occurrence";

// Mock occurrences for "Today" and "Tomorrow"
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const mockMedicineOccurrences: ReminderOccurrence[] = [
  // Today's occurrences
  {
    occurrence_id: `occ_notif-001_${today}_0200`,
    plan_id: "notif-001",
    reminder_id: "r1",
    pet: { _id: mochi._id, name: mochi.name, profile_image: mochi.profile_image || "" },
    medicine: { _id: "65f1a9c2b0f3c1a2d3e4f811", name: "Probiotics Capsule", dosage: "150mg" },
    scheduled_at: `${today}T02:00:00+07:00`,
    time: "02:00",
    frequency_label: "Everyday",
    status: "pending",
    taken_at: null,
  },
  {
    occurrence_id: `occ_notif-001_${today}_2000`,
    plan_id: "notif-001",
    reminder_id: "r2",
    pet: { _id: mochi._id, name: mochi.name, profile_image: mochi.profile_image || "" },
    medicine: { _id: "65f1a9c2b0f3c1a2d3e4f811", name: "Probiotics Capsule", dosage: "150mg" },
    scheduled_at: `${today}T20:00:00+07:00`,
    time: "20:00",
    frequency_label: "Everyday",
    status: "taken",
    taken_at: `${today}T20:03:00+07:00`,
  },
  {
    occurrence_id: `occ_notif-002_${today}_0600`,
    plan_id: "notif-002",
    reminder_id: "r1",
    pet: { _id: taro._id, name: taro.name, profile_image: taro.profile_image || "" },
    medicine: { _id: "65f1a9c2b0f3c1a2d3e4f812", name: "Amoxicillin", dosage: "5 ml" },
    scheduled_at: `${today}T06:00:00+07:00`,
    time: "06:00",
    frequency_label: "Every 8 hours",
    status: "pending",
    taken_at: null,
  },

  // Tomorrow's occurrences
  {
    occurrence_id: `occ_notif-001_${tomorrow}_0200`,
    plan_id: "notif-001",
    reminder_id: "r1",
    pet: { _id: mochi._id, name: mochi.name, profile_image: mochi.profile_image || "" },
    medicine: { _id: "65f1a9c2b0f3c1a2d3e4f811", name: "Probiotics Capsule", dosage: "150mg" },
    scheduled_at: `${tomorrow}T02:00:00+07:00`,
    time: "02:00",
    frequency_label: "Everyday",
    status: "pending",
    taken_at: null,
  },
];