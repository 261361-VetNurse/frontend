import useSWR from 'swr';
import { authStorage, getMedications } from '@/services/api/client';
import type { GroupedMedicineNotification } from '@/types/domain/medication';

function medicationsFetcher(petId?: number, date?: string): Promise<GroupedMedicineNotification[]> {
    const token = authStorage.getToken();
    if (!token) return Promise.resolve([]);
    return getMedications(token, petId, date);
}

/**
 * Fetch medication notifications, optionally filtered by petId and date.
 * SWR key encodes the filters so changing petId or date triggers a new fetch
 * while the old result is served from cache until the new one arrives.
 */
export function useMedications(petId?: number, date?: string) {
    const swrKey = ['medications', petId ?? null, date ?? null] as const;

    const { data, error, isLoading, mutate } = useSWR<GroupedMedicineNotification[]>(
        swrKey,
        () => medicationsFetcher(petId, date),
        {
            revalidateOnFocus: false,
            dedupingInterval: 15_000, // 15 s — medications are time-sensitive
        }
    );

    return {
        medications: data ?? [],
        loading: isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load medications') : null,
        refetch: mutate,
    };
}
