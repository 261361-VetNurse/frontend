"use client";

import { useState, useCallback, useEffect } from "react";
import { authStorage, getSymptomRecordsCalendar } from "@/services/api/client";
import { SymptomRecord } from "@/types/domain/symptom";

function pad2(n: number) { return String(n).padStart(2, "0"); }

function extractTimeFromISO(iso: string) {
    const d = new Date(iso);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function useSymptomRecords(selectedPetId: number = 0) {
    const [records, setRecords] = useState<SymptomRecord[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = authStorage.getToken();
            if (!token) return;

            const pId = selectedPetId === 0 ? undefined : String(selectedPetId);

            const response = await getSymptomRecordsCalendar(token, pId);

            // Transform SymptomRecord[] to RecordEntry[] for component compatibility
            const allRecords: SymptomRecord[] = Array.isArray(response)
                ? response.map(record => {
                    // Extract date (YYYY-MM-DD) and time (HH:MM) from time_added ISO datetime
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
