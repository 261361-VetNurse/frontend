import { useState, useEffect } from 'react';

interface UseMedicationsReturn {
    medications: any[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch medications
 * @param petId - Optional pet ID filter
 * @param date - Optional date filter (YYYY-MM-DD)
 */
export function useMedications(petId?: string, date?: string): UseMedicationsReturn {
    const [medications, setMedications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use mock data instead of API call
            const { mockMedicineReminderVMs } = await import('@/mocks/medicine-reminders.mock');

            // Client-side filtering by petId and date
            let filteredMedications = mockMedicineReminderVMs;

            if (petId) {
                filteredMedications = filteredMedications.filter(
                    med => med.pet._id === petId
                );
            }

            // Note: Date filtering would require additional logic to check if medication
            // schedule applies to the given date. For now, returning all medications.
            // You can implement date filtering based on schedule.starting_date and frequency

            setMedications(filteredMedications);
        } catch (err) {
            console.error('Error loading mock medications:', err);
            setError(err instanceof Error ? err.message : 'Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, [petId, date]);

    return { medications, loading, error, refetch: fetchMedications };
}
