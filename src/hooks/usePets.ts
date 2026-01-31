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

    const fetchPets = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use mock data instead of API call
            const { mockPets } = await import('@/mocks/pets.mock');
            setPets(mockPets);
        } catch (err) {
            console.error('Error loading mock pets:', err);
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
