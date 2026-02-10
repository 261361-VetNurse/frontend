import { useState, useEffect } from 'react';
import { authStorage } from '@/services/api/client';

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

            const token = authStorage.getToken();
            if (!token) return;

            // Dynamic import to avoid circular dependency
            const { getAppointments } = await import('@/services/api/client');

            const data = await getAppointments(token, status);

            setAppointments(data);
        } catch (err) {
            console.error('Error loading appointments:', err);
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [status]);

    return { appointments, loading, error, refetch: fetchAppointments };
}
