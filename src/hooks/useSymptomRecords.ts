"use client";

import useSWR from 'swr';
import { authStorage, getSymptomRecordsCalendar } from "@/services/api/client";
import { SymptomRecord } from "@/types/domain/symptom";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad2(n: number) { return String(n).padStart(2, "0"); }

function extractTimeFromISO(iso: string): string {
    const d = new Date(iso);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function transformRecords(response: unknown): SymptomRecord[] {
    if (!Array.isArray(response)) return [];
    return response.map((record) => {
        const timeAdded = record.time_added || "";
        const dateKey = timeAdded.includes('T') ? timeAdded.split('T')[0] : timeAdded;
        const time = timeAdded.includes('T') ? extractTimeFromISO(timeAdded) : "00:00";
        return {
            record_id: record.record_id,
            pet_id: record.pet_id,
            pet_name: record.pet_name,
            pet_image: record.pet_image,
            date_added: dateKey,
            time_added: time,
            note: record.note,
            note_image: record.note_image,
        };
    });
}

// ---------------------------------------------------------------------------
// Fetcher — runs transform inside so SWR cache stores the final shape
// ---------------------------------------------------------------------------
async function symptomFetcher(petId: number | null): Promise<SymptomRecord[]> {
    const token = authStorage.getToken();
    if (!token) return [];
    const pId = petId === 0 || petId === null ? undefined : String(petId);
    const response = await getSymptomRecordsCalendar(token, pId);
    return transformRecords(response);
}

/**
 * Fetch and transform symptom records for a pet.
 * SWR caches per-petId and deduplicates concurrent consumers.
 */
export function useSymptomRecords(selectedPetId: number | null = null) {
    const swrKey = ['symptom-records', selectedPetId] as const;

    const { data, error, isLoading, mutate } = useSWR<SymptomRecord[]>(
        swrKey,
        () => symptomFetcher(selectedPetId),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30_000,
        }
    );

    return {
        records: data ?? [],
        error: error ? "Failed to load records" : null,
        loading: isLoading,
        refetch: mutate,
    };
}
