/**
 * Mock Data Helper
 * 
 * This utility standardized how we switch between Mock Data and Real API calls
 * based on the NEXT_PUBLIC_USE_MOCK_DATA environment variable.
 */

// Global mock mode flag
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Helper to simulate network delay for mocks
export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

interface FetchMockOptions<T> {
    mockData: T | (() => T | Promise<T>);
    apiCall: () => Promise<T>;
    delay?: number;
    mockLabel?: string;
}

/**
 * Execute either a mock data return or a real API call based on environment.
 * 
 * @example
 * return fetchWithMock({
 *   mockData: mockPets,
 *   apiCall: () => api.getPets(),
 *   mockLabel: 'getPets'
 * });
 */
export async function fetchWithMock<T>({
    mockData,
    apiCall,
    delay = 500,
    mockLabel = 'API'
}: FetchMockOptions<T>): Promise<T> {
    if (USE_MOCK_DATA) {
        await mockDelay(delay);
        console.log(`⚠️ [MOCK] ${mockLabel} returning mock data`);

        if (typeof mockData === 'function') {
            return (mockData as () => T | Promise<T>)();
        }
        return mockData;
    }

    return apiCall();
}
