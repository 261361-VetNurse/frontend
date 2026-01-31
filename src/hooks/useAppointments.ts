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

            // Use mock data instead of API call
            const { allMockAppointments } = await import('@/mocks/appointments');

            // Client-side filtering by status
            let filteredAppointments = allMockAppointments;

            if (status) {
                filteredAppointments = filteredAppointments.filter(
                    apt => apt.status.toLowerCase() === status.toLowerCase()
                );
            }

            setAppointments(filteredAppointments);
        } catch (err) {
            console.error('Error loading mock appointments:', err);
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
