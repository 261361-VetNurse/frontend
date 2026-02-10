import { useState, useEffect } from 'react';
import type { Pet } from '@/types/domain/pet';

interface UsePetsReturn {
    pets: Pet[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch all pets for the current user
 */
export function usePets(): UsePetsReturn {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get token from Auth Context
    // We need to dynamically import or require useAuth to avoid circular deps if client uses it?
    // client.ts uses authStorage not useAuth.
    // But hooks can use hooks.

    // Actually, let's just use authStorage for now to be safe, or import useAuth.
    // Importing useAuth is fine.

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // We can't use useAuth inside the function if we didn't import it at top level.
        // But let's assume valid token for now or check storage.
        if (typeof window !== 'undefined') {
            const { authStorage } = require('@/services/api/client');
            const t = authStorage.getToken();
            setToken(t);
        }
    }, []);

    const fetchPets = async () => {
        try {
            setLoading(true);
            setError(null);

            // If we are in real mode and have no token, we might fail.
            // But fetchWithMock handles the mock case regardless of token if we pass a dummy one?
            // client.getPets(token) needs a token string.

            const { getPets, authStorage } = await import('@/services/api/client');

            const currentToken = authStorage.getToken();
            const tokenToUse = currentToken || '';

            if (!tokenToUse) {
                // If not mock and no token, we can't fetch.
                // But maybe we just return empty or error.
                // For now let's try to fetch, client will throw if 401.
            }

            const data = await getPets(tokenToUse);
            setPets(data);

        } catch (err) {
            console.error('Error loading pets:', err);
            setError(err instanceof Error ? err.message : 'Failed to load pets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    return { pets, loading, error, refetch: fetchPets };
}

/**
 * Custom hook to fetch a single pet by ID
 */
export function usePet(petId: string | number) {
    const { pets, loading, error } = usePets();
    const pet = pets.find((p) => String(p._id) === String(petId));

    return { pet, loading, error, pets };
}
