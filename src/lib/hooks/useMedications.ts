import { useState, useEffect } from 'react';
import { getMedications, authStorage } from '@/lib/api-client';

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
            const token = authStorage.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const data = await getMedications(token, petId, date);
            setMedications(data);
        } catch (err) {
            console.error('Error fetching medications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch medications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, [petId, date]);

    return { medications, loading, error, refetch: fetchMedications };
}
