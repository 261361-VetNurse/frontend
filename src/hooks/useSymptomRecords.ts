"use client";

import { useState, useCallback, useEffect } from "react";
import { authStorage, getSymptomRecordsCalendar } from "@/services/api/client";
import { PetSelectorValue } from "@/components/pet-owners/shared/PetFilterSelector";

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

            // Flatten the response
            const allRecords = Object.values(response).flat();

            // Map to RecordEntry
            const mapped: RecordEntry[] = allRecords.map(r => {
                // Handle different date formats or ensure consistency
                const dateKey = r.date.includes('T') ? r.date.split('T')[0] : r.date;
                // If the date string itself contains time info, extract it, otherwise default "00:00"
                // Note: The API likely returns full ISO strings for 'date' based on previous context, but we handle fallback
                const time = r.date.includes('T') ? extractTimeFromISO(r.date) : "00:00";

                return {
                    id: r._id,
                    dateKey: dateKey,
                    petId: r.pet_id,
                    time: time,
                    note: r.note || "",
                    images: r.images
                };
            });

            setRecords(mapped);

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
