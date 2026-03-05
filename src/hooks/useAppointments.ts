import useSWR from 'swr';
import { authStorage, getAppointments } from '@/services/api/client';
import type { Appointment } from '@/types/domain/appointment';

function appointmentsFetcher(status?: string): Promise<Appointment[]> {
    const token = authStorage.getToken();
    if (!token) return Promise.resolve([]);
    return getAppointments(token, status);
}

/**
 * Fetch appointments, optionally filtered by status.
 * SWR caches per-status so "Upcoming" and "Completed" are stored separately.
 */
export function useAppointments(status?: string) {
    const swrKey = ['appointments', status ?? null] as const;

    const { data, error, isLoading, mutate } = useSWR<Appointment[]>(
        swrKey,
        () => appointmentsFetcher(status),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30_000,
        }
    );

    return {
        appointments: data ?? [],
        loading: isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load appointments') : null,
        refetch: mutate,
    };
}
