import type { PetLite } from "./pet";

export type OccurrenceStatus = "pending" | "taken" | "missed";

export type MedicationOccurrenceVM = {
  occurrence_id: string;     // ใช้เป็น key ทุก action
  plan_id: string;           // = notification_id ใน plan เดิม
  pet: PetLite;
  medicine: { _id: string; name: string; dosage: string };
  scheduled_at: string;      // ISO +07:00 หรือ YYYY-MM-DDTHH:mm:ss+07:00
  status: OccurrenceStatus;
  taken_at?: string | null;  // server จะเป็นคนส่งมา
};
