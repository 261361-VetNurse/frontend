import { useState, useEffect } from 'react';
import { getAppointments, authStorage } from '@/lib/api-client';

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
            if (!token) {
                throw new Error('No authentication token found');
            }

            const data = await getAppointments(token, status);
            setAppointments(data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [status]);

    return { appointments, loading, error, refetch: fetchAppointments };
}
