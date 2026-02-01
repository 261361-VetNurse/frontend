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

            const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

            // Dynamic import to avoid circular dep if any (though client shouldn't)
            const { getMedications } = await import('@/services/api/client');
            const { USE_MOCK_DATA } = await import('@/utils/mock-helper');

            const tokenToUse = currentToken || (USE_MOCK_DATA ? 'mock_token' : '');

            if (!tokenToUse) {
                // optionally handle no token
            }

            const data = await getMedications(tokenToUse, petId, date);
            setMedications(data);

        } catch (err) {
            console.error('Error loading medications:', err);
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
