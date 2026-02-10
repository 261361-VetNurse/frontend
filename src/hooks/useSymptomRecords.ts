"use client";

import { useState, useCallback, useEffect } from "react";
import { authStorage, getSymptomRecordsCalendar } from "@/services/api/client";
import { PetSelectorValue } from "@/components/pet-owners/shared/PetFilterSelector";
import { SymptomRecord } from "@/types/domain/symptom";

export type RecordEntry = {
    id: string;
    dateKey: string;
    petId: string;
    time: string;
    note: string;
    images?: string[];
};

function pad2(n: number) { return String(n).padStart(2, "0"); }

function extractTimeFromISO(iso: string) {
    const d = new Date(iso);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function useSymptomRecords(selectedPetId: PetSelectorValue = "all") {
    const [records, setRecords] = useState<RecordEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = authStorage.getToken();
            if (!token) return;

            const pId = selectedPetId === "all" ? undefined : String(selectedPetId);

            const response = await getSymptomRecordsCalendar(token, pId);

            // Transform SymptomRecord[] to RecordEntry[] for component compatibility
            const allRecords: RecordEntry[] = Array.isArray(response)
                ? response.map(record => {
                    // Extract date (YYYY-MM-DD) and time (HH:MM) from time_added ISO datetime
                    const timeAdded = record.time_added || "";
                    const dateKey = timeAdded.includes('T') ? timeAdded.split('T')[0] : timeAdded;
                    const time = timeAdded.includes('T') ? extractTimeFromISO(timeAdded) : "00:00";

                    return {
                        id: String(record.record_id),
                        dateKey, // YYYY-MM-DD format
                        petId: String(record.pet_id),
                        time, // HH:MM format
                        note: record.note || "",
                        images: record.note_image || [],
                    };
                })
                : [];

            setRecords(allRecords);

        } catch (err) {
            console.error("Failed to fetch records", err);
            setError("Failed to load records");
        } finally {
            setLoading(false);
        }
    }, [selectedPetId]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    return {
        records,
        error,
        loading,
        refetch: fetchRecords
    };
}
