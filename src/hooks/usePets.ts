import useSWR from 'swr';
import type { Pet } from '@/types/domain/pet';
import { authStorage, getPets, getPetDetail } from '@/services/api/client';

// ---------------------------------------------------------------------------
// Shared SWR fetcher — reads token from authStorage at call time
// ---------------------------------------------------------------------------
function petsFetcher(): Promise<Pet[]> {
    const token = authStorage.getToken();
    if (!token) return Promise.resolve([]);
    return getPets(token);
}

function petFetcher(petId: string): Promise<Pet | null> {
    const token = authStorage.getToken();
    if (!token) return Promise.resolve(null);
    return getPetDetail(token, petId);
}

/**
 * Fetch all pets for the current user.
 * SWR provides automatic deduplication — multiple components calling usePets()
 * simultaneously will share a single in-flight request and a shared cache.
 */
export function usePets() {
    const { data, error, isLoading, mutate } = useSWR<Pet[]>(
        'pets',
        petsFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30_000, // 30 s — prevents duplicate fetches within window
        }
    );

    return {
        pets: data ?? [],
        loading: isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load pets') : null,
        refetch: mutate,
    };
}

/**
 * Fetch a single pet by ID.
 * Uses a dedicated SWR key so it does NOT load the full pet list.
 * Falls back to searching the cached pets list if already available.
 */
export function usePet(petId: number | string | null) {
    const id = petId ? String(petId) : null;

    const { data, error, isLoading, mutate } = useSWR<Pet | null>(
        id ? ['pet', id] : null, // null key = skip fetch
        () => petFetcher(id!),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30_000,
        }
    );

    return { pet: data ?? null, loading: isLoading, error, refetch: mutate };
}
