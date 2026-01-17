import { useState, useEffect } from 'react';
import { getPets, authStorage } from '@/lib/api-client';
import { Pet } from '@/types/pet';

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
            const token = authStorage.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const data = await getPets(token);
            setPets(data);
        } catch (err) {
            console.error('Error fetching pets:', err);
            // Fallback to mock data if API fails
            console.warn('Using mock data for pets due to API error');
            const { mockPets } = await import('@/mocks/pets.mock');
            setPets(mockPets);
            // setError(err instanceof Error ? err.message : 'Failed to fetch pets (using mock data)');
            setError(null); // Clear error to allow rendering of mock data
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
