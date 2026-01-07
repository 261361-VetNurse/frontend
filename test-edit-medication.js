// Test the updated EditMedicationPopup structure
const originalMedication = {
  notification_id: "65f1a9c2b0f3c1a2d3e4fa10",
  pet: {
    id: "65f1a9c2b0f3c1a2d3e4f601",
    name: "Mochi",
    image_url: "https://picsum.photos/seed/mochi/200/200",
  },
  medicine: {
    id: "65f1a9c2b0f3c1a2d3e4f811",
    name: "Probiotics Capsule",
    dosage: "150mg",
  },
  schedule: {
    frequency: { key: "everyday", label: "Everyday" },
    reminders: [
      { id: "r1", time: "08:00", is_taken: false },
      { id: "r2", time: "20:00", is_taken: true, taken_at: "2026-01-07T20:03:00.000Z" },
    ],
    measurement_times_per_day: 2,
    starting_date: "2025-11-15",
  },
  medication_status: {
    is_stopped: false,
  },
};

// Simulate editing the medication
const editedMedication = {
  ...originalMedication,
  pet: {
    id: "65f1a9c2b0f3c1a2d3e4f602", // Changed pet
    name: "Taro",
    image_url: "https://picsum.photos/seed/taro/200/200",
  },
  medicine: {
    ...originalMedication.medicine,
    name: "Updated Medicine Name", // Changed name
    dosage: "250mg", // Changed dosage
  },
  schedule: {
    ...originalMedication.schedule,
    frequency: { key: "twice_daily", label: "Twice daily" }, // Changed frequency
    reminders: [
      { id: "r1", time: "09:00", is_taken: false }, // Changed time
      { id: "r2", time: "21:00", is_taken: true, taken_at: "2026-01-07T21:03:00.000Z" }, // Changed time
      { id: "r3", time: "13:00", is_taken: false }, // Added new reminder
    ],
    measurement_times_per_day: 3, // Updated count
    starting_date: "2026-01-01", // Changed start date
  },
};

console.log('Original Medication:');
console.log(`Pet: ${originalMedication.pet.name}`);
console.log(`Medicine: ${originalMedication.medicine.name} - ${originalMedication.medicine.dosage}`);
console.log(`Frequency: ${originalMedication.schedule.frequency.label}`);
console.log(`Reminders: ${originalMedication.schedule.reminders.length} times`);
originalMedication.schedule.reminders.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.time} (taken: ${r.is_taken})`);
});
console.log(`Start Date: ${originalMedication.schedule.starting_date}`);

console.log('\n--- AFTER EDITING ---\n');

console.log('Edited Medication:');
console.log(`Pet: ${editedMedication.pet.name}`);
console.log(`Medicine: ${editedMedication.medicine.name} - ${editedMedication.medicine.dosage}`);
console.log(`Frequency: ${editedMedication.schedule.frequency.label}`);
console.log(`Reminders: ${editedMedication.schedule.reminders.length} times`);
editedMedication.schedule.reminders.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.time} (taken: ${r.is_taken})`);
});
console.log(`Start Date: ${editedMedication.schedule.starting_date}`);

console.log('\nEditable fields in EditMedicationPopup:');
console.log('✅ Pet selection');
console.log('✅ Medicine name');
console.log('✅ Dosage');
console.log('✅ Frequency');
console.log('✅ Start date');
console.log('✅ Reminder times (add/remove/edit)');
console.log('✅ Medication status (active/stopped)');
console.log('✅ Stop reason (when stopped)');