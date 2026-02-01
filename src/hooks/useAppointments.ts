import { useState, useEffect } from 'react';

interface UseAppointmentsReturn {
    appointments: any[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch appointments
 * @param status - Optional status filter ("Upcoming", "Completed", "Canceled")
 */
export function useAppointments(status?: string): UseAppointmentsReturn {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';

            // Dynamic import to avoid circular dependency
            const { getAppointments } = await import('@/services/api/client');
            const { USE_MOCK_DATA } = await import('@/utils/mock-helper');

            const tokenToUse = token || (USE_MOCK_DATA ? 'mock_token' : '');

            // Should handle token missing case for real API? 
            // relying on client to throw or handle.

            const data = await getAppointments(tokenToUse, status);

            setAppointments(data);
        } catch (err) {
            console.error('Error loading appointments:', err);
            setError(err instanceof Error ? err.message : 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [status]);

    return { appointments, loading, error, refetch: fetchAppointments };
}
