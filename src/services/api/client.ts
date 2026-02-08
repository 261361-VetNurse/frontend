/**
 * API Client for VetNurse Backend
 */

import { z } from 'zod';
import { UserSchema, UserProfileSchema } from '@/types/schemas/user';
import { PetSchema } from '@/types/schemas/pet';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000';


// Mock Data Imports (Lazy load where possible or just direct if simple)
import { mockPets } from '@/mocks/pets.mock';
import { mockDashboardData, mockMedicationNotificationDetail } from '@/mocks/dashboard.mock';
import { mockAppointments } from '@/mocks/appointments.mock';
import { mockUserProfile } from '@/mocks/owner.mock';
import { mockEachDayMedicines, mockMedicines } from '@/mocks/medication.mock';

// Mock Helper
import { fetchWithMock } from '@/utils/mock-helper';



/**
 * Wrapper for fetch to add logging
 */
async function loggedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const method = init?.method || 'GET';
    const url = input.toString();

    console.log(`🚀 [API Request] ${method} ${url}`);

    try {
        const response = await fetch(input, init);
        console.log(`✅ [API Response] ${method} ${url} - ${response.status} ${response.statusText}`);
        return response;
    } catch (error) {
        console.error(`❌ [API Error] ${method} ${url}`, error);
        throw error;
    }
}

/**
 * Validate API response against a Zod schema
 */
function validateResponse<T>(data: unknown, schema: z.ZodSchema<T>): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error('❌ [API Validation Error]', result.error.format());
        throw new Error(`API Validation Failed: ${JSON.stringify(result.error.flatten())}`);
    }
    return result.data;
}

interface LineExchangeResponse {
    access_token: string;
    token_type: string;
    is_new_user: boolean;
    user: {
        id: string;
        display_name: string;
        picture_url: string;
        line_id: string;
    };
}

import { User, UserProfile } from '@/types/domain/user';
import { Pet } from '@/types/domain/pet';

/**
 * Exchange LINE authorization code for access token
 */
export async function exchangeLineToken(code: string): Promise<LineExchangeResponse> {
    return fetchWithMock({
        mockData: () => {
            return {
                access_token: "mock_access_token_" + Math.random().toString(36).substring(7),
                token_type: "Bearer",
                is_new_user: false,
                user: {
                    id: mockUserProfile.id,
                    display_name: `${mockUserProfile.fname} ${mockUserProfile.lname}`,
                    picture_url: mockUserProfile.picture_url,
                    line_id: mockUserProfile.contact.line_id
                }
            };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/auth/line/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to exchange LINE token');
            }

            return response.json();
        },
        mockLabel: 'exchangeLineToken'
    });
}

/**
 * Mock User Data
 */
const MOCK_USER: User = {
    id: mockUserProfile.id,
    display_name: `${mockUserProfile.fname} ${mockUserProfile.lname}`,
    picture_url: mockUserProfile.picture_url,
    role: "user",
    is_registered: true
};

/**
 * Get current user information
 */
export async function getCurrentUser(token: string): Promise<User> {
    return fetchWithMock<User>({
        mockData: MOCK_USER,
        apiCall: async () => {
            const response = await loggedFetch(`/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get user information');
            }

            const data = await response.json();
            return validateResponse(data, UserSchema);
        },
        mockLabel: 'getCurrentUser'
    });
}

/**
 * Get dashboard home data
 */
export async function getDashboardHome(token: string): Promise<import('@/types/domain/dashboard').DashboardResponse> {
    return fetchWithMock({
        mockData: () => {
            if (mockDashboardData.success) {
                return mockDashboardData;
            }
            throw new Error("Mock dashboard data missing");
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/dashboard/home`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get dashboard data');
            }

            return response.json();
        },
        mockLabel: 'getDashboardHome'
    });
}

/**
 * Storage helpers for authentication
 */
export const authStorage = {
    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    },

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    },

    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    },

    setUser(user: any) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    getUser(): any {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    removeUser() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    },


    clear() {
        this.removeToken();
        this.removeUser();
    }
};

// ============================================================================
// MEDICATIONS API
// ============================================================================
/**
 * Get medication notifications
 * @param token - Access token
 * @param petId - Optional pet ID filter
 * @param date - Optional date filter (YYYY-MM-DD format)
 */
export async function getMedications(token: string, petId?: string, date?: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            // Client-side filtering logic for mocks
            let filteredMedicines = mockEachDayMedicines;
            if (petId) {
                filteredMedicines = filteredMedicines.filter(
                    occ => occ.pet_id === petId
                );
            }

            return filteredMedicines;
        },
        apiCall: async () => {
            let url = `/api/medications`;
            const params = new URLSearchParams();
            if (petId) params.append('pets_id', petId);
            if (date) params.append('date', date);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await loggedFetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get medications');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: 'getMedications'
    });
}

/**
 * Get medication notification detail
 */
export async function getMedicationNotificationDetail(token: string, notificationId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            if (notificationId) {
                const found = mockMedicationNotificationDetail.data.find(d => d._id === notificationId);
                if (!found) throw new Error("Medication detail not found in mock");
                return found;
            }
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/medications/${notificationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get medication detail');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: `getMedicationDetail(${notificationId})`
    });
}

/**
 * Mark medication notification as taken
 */
export async function markMedicationTaken(
    token: string,
    notificationId: string,
    istaken: boolean = true
): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Medication marked as taken (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/medications/${notificationId}/taken`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ istaken }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to mark medication as taken');
            }

            return response.json();
        },
        mockLabel: `markMedicationTaken(${notificationId})`
    });
}

/**
 * Get medicine root details
 */
export async function getMedicineDetail(
    token: string,
    notificationId: string,
    medicineId: string
): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            const medicine = mockMedicines.find(m => m._id === medicineId);
            if (!medicine) throw new Error("Medicine not found in mock");
            return medicine;
        },
        apiCall: async () => {
            const response = await loggedFetch(
                `/api/medications/${notificationId}/${medicineId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get medicine detail');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: `getMedicineDetail(${medicineId})`
    });
}

/**
 * Edit medicine
 */
export async function editMedicine(
    token: string,
    notificationId: string,
    medicineId: string,
    medicineData: any
): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, data: { ...medicineData, _id: medicineId }, message: "Medicine updated (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(
                `/api/medications/${notificationId}/${medicineId}/edit`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(medicineData),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to edit medicine');
            }

            return response.json();
        },
        mockLabel: `editMedicine(${medicineId})`
    });
}

/**
 * Delete medicine (cascade deletes medicine and all related notifications)
 */
export async function deleteMedicine(
    token: string,
    notificationId: string,
    medicineId: string
): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Medicine deleted (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(
                `/api/medications/${notificationId}/${medicineId}/delete`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete medicine');
            }

            return response.json();
        },
        mockLabel: `deleteMedicine(${medicineId})`
    });
}

/**
 * Create new medicine with automatic notification generation
 */
export async function createMedicine(token: string, medicineData: any): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return {
                success: true,
                data: {
                    ...medicineData,
                    _id: "mock_med_" + Math.random().toString(36).substring(7)
                },
                message: "Medicine created (mock)"
            };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/medications/medicine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(medicineData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create medicine');
            }

            return response.json();
        },
        mockLabel: 'createMedicine'
    });
}

// ============================================================================
// APPOINTMENTS API
// ============================================================================

/**
 * Get all appointments
 * @param token - Access token
 * @param status - Optional status filter ("Upcoming", "Completed", "Canceled")
 */
export async function getAppointments(token: string, status?: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            if (status) {
                return mockAppointments.filter(evt => evt.status?.toLowerCase() === status.toLowerCase());
            }
            return mockAppointments;
        },
        apiCall: async () => {
            let url = `/api/appointments`;
            if (status) url += `?status=${encodeURIComponent(status)}`;

            const response = await loggedFetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get appointments');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: 'getAppointments'
    });
}

/**
 * Get appointment detail
 */
export async function getAppointmentDetail(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            if (appointmentId) {
                const found = mockAppointments.find(a => a._id === appointmentId);
                if (!found) throw new Error("Appointment detail not found in mock");
                return found;
            }
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/appointments/${appointmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get appointment detail');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: `getAppointmentDetail(${appointmentId})`
    });
}

/**
 * Create new appointment
 */
export async function createAppointment(token: string, appointmentData: any): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return {
                success: true,
                data: {
                    ...appointmentData,
                    _id: "mock_apt_" + Math.random().toString(36).substring(7),
                    status: "Upcoming"
                },
                message: "Appointment created (mock)"
            };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create appointment');
            }

            return response.json();
        },
        mockLabel: 'createAppointment'
    });
}

/**
 * Edit appointment
 */
export async function editAppointment(
    token: string,
    appointmentId: string,
    appointmentData: any
): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return {
                success: true,
                data: { ...appointmentData, _id: appointmentId },
                message: "Appointment updated (mock)"
            };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/appointments/${appointmentId}/edit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to edit appointment');
            }

            return response.json();
        },
        mockLabel: `editAppointment(${appointmentId})`
    });
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Appointment canceled (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/appointments/${appointmentId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to cancel appointment');
            }

            return response.json();
        },
        mockLabel: `cancelAppointment(${appointmentId})`
    });
}

/**
 * Delete appointment
 */
export async function deleteAppointment(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Appointment deleted (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete appointment');
            }

            return response.json();
        },
        mockLabel: `deleteAppointment(${appointmentId})`
    });
}

// ============================================================================
// PETS API
// ============================================================================

/**
 * Get all pets
 */
export async function getPets(token: string): Promise<Pet[]> {
    return fetchWithMock({
        mockData: () => {
            return mockPets;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pets`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get pets');
            }

            const data = await response.json();
            return validateResponse(data, z.array(PetSchema));
        },
        mockLabel: 'getPets'
    });
}

/**
 * Get pet detail
 */
export async function getPetDetail(token: string, petId: string): Promise<Pet> {
    return fetchWithMock({
        mockData: () => {
            const pet = mockPets.find(p => p._id === petId);
            if (pet) return pet as unknown as Pet;
            throw new Error("Mock pet not found");
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pets/${petId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get pet detail');
            }

            const data = await response.json();
            return validateResponse(data, PetSchema);
        },
        mockLabel: `getPetDetail(${petId})`
    });
}

/**
 * Create new pet (register pet)
 */
export async function createPet(token: string, petData: Partial<Pet>): Promise<Pet> {
    return fetchWithMock({
        mockData: () => {
            const newPet = {
                ...petData,
                _id: "mock_pet_" + Math.random().toString(36).substring(7),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as Pet;
            return validateResponse(newPet, PetSchema);
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(petData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create pet');
            }

            const data = await response.json();
            return validateResponse(data, PetSchema);
        },
        mockLabel: 'createPet'
    });
}

/**
 * Update pet information
 */
export async function updatePet(token: string, petId: string, petData: Partial<Pet>): Promise<Pet> {
    return fetchWithMock({
        mockData: () => {
            // Find existing pet to merge or create dummy
            const existing = mockPets.find(p => p._id === petId) || {};
            const updated = {
                ...existing,
                ...petData,
                _id: petId,
                updated_at: new Date().toISOString()
            } as Pet;
            return validateResponse(updated, PetSchema);
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pets/${petId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(petData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to update pet');
            }

            const data = await response.json();
            return validateResponse(data, PetSchema);
        },
        mockLabel: `updatePet(${petId})`
    });
}

/**
 * Delete pet
 */
export async function deletePet(token: string, petId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Pet deleted (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete pet');
            }

            return response.json();
        },
        mockLabel: `deletePet(${petId})`
    });
}

// ============================================================================
// REGISTRATION API
// ============================================================================

/**
 * Register owner
 */
export async function registerOwner(token: string, ownerData: any): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Owner registered (mock)", data: { id: "mock_owner_id" } };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/owner/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(ownerData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to register owner');
            }

            return response.json();
        },
        mockLabel: 'registerOwner'
    });
}

/**
 * Register pet (alternative endpoint from /pet route)
 */
export async function registerPet(token: string, petData: any): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Pet registered (mock)", data: { id: "mock_pet_id" } };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/pet/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(petData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to register pet');
            }

            return response.json();
        },
        mockLabel: 'registerPet'
    });
}

// ============================================================================
// UPLOAD API
// ============================================================================

/**
 * Upload image to R2 storage via backend API
 */
/**
 * Get presigned URL for direct R2 upload
 */
/**
 * Get presigned URL for direct R2 upload
 */
export async function getPresignedUrl(token: string, fileType: string, folder: string): Promise<{ uploadUrl: string, objectKey: string, publicUrl: string }> {
    return fetchWithMock({
        mockData: () => {
            return {
                uploadUrl: "https://mock-r2-upload-url.com",
                objectKey: `${folder}/mock-key.jpg`,
                publicUrl: "https://placehold.co/400x400?text=Mock+Image"
            };
        },
        apiCall: async () => {
            const response = await loggedFetch(`${API_BASE_URL}/v1/upload/presigned-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': token,
                },
                body: JSON.stringify({ fileType, folder }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get presigned URL');
            }

            const json = await response.json();
            return json; // Backend returns keys directly
        },
        mockLabel: 'getPresignedUrl'
    });
}

/**
 * Delete image from R2 storage
 */
export async function deleteImage(filename: string, token: string): Promise<void> {
    return fetchWithMock({
        mockData: () => {
            return;
        },
        apiCall: async () => {
            const response = await loggedFetch(`${API_BASE_URL}/v1/upload/image?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
                headers: {
                    'access_token': token,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete image');
            }
        },
        mockLabel: 'deleteImage'
    });
}

// ============================================================================
// USER PROFILE API
// ============================================================================

/**
 * Get user profile
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
    return fetchWithMock({
        mockData: () => {
            return mockUserProfile as unknown as UserProfile;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get user profile');
            }

            const data = await response.json();
            return validateResponse(data.data, UserProfileSchema);
        },
        mockLabel: 'getUserProfile'
    });
}

/**
 * Update user profile
 */
export async function updateUserProfile(token: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    return fetchWithMock({
        mockData: () => {
            // Return merged mock data
            return { ...mockUserProfile, ...profileData } as unknown as UserProfile;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/user/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to update user profile');
            }

            const data = await response.json();
            return validateResponse(data.data, UserProfileSchema);
        },
        mockLabel: 'updateUserProfile'
    });
}

// ============================================================================
// SYMPTOM RECORDS API
// ============================================================================

import { SymptomRecord, CreateSymptomRecordRequest, UpdateSymptomRecordRequest, SymptomCalendarResponse } from '@/types/domain/symptom';
import { mockSymptomRecords } from '@/mocks/symptom.mock';

/**
 * Get symptom records calendar
 */
export async function getSymptomRecordsCalendar(token: string, petId?: string, month?: string): Promise<SymptomCalendarResponse> {
    return fetchWithMock({
        mockData: () => {
            // Group mock records by date
            const calendar: SymptomCalendarResponse = {};
            let filtered = mockSymptomRecords;
            if (petId) {
                filtered = filtered.filter(r => r.pet_id === petId);
            }
            // Simple month filtering simulation if needed, but for now just return all matches
            filtered.forEach(record => {
                const date = record.date; // YYYY-MM-DD
                if (!calendar[date]) {
                    calendar[date] = [];
                }
                calendar[date].push(record);
            });
            return calendar;
        },
        apiCall: async () => {
            let url = `/api/symptom-records/calendar`;
            const params = new URLSearchParams();
            if (petId) params.append('pet_id', petId);
            if (month) params.append('month', month);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await loggedFetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get symptom calendar');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: 'getSymptomRecordsCalendar'
    });
}

/**
 * Create symptom record
 */
export async function createSymptomRecord(token: string, data: CreateSymptomRecordRequest): Promise<SymptomRecord> {
    return fetchWithMock({
        mockData: () => {
            const newRecord: SymptomRecord = {
                _id: "mock_sym_" + Math.random().toString(36).substring(7),
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return newRecord;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/symptom-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create symptom record');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: 'createSymptomRecord'
    });
}

/**
 * Get symptom record detail
 */
export async function getSymptomRecordDetail(token: string, recordId: string): Promise<SymptomRecord> {
    return fetchWithMock({
        mockData: () => {
            const found = mockSymptomRecords.find(r => r._id === recordId);
            if (!found) throw new Error("Symptom record not found in mock");
            return found;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/symptom-records/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get symptom record detail');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: `getSymptomRecordDetail(${recordId})`
    });
}

/**
 * Edit symptom record
 */
export async function editSymptomRecord(token: string, recordId: string, data: UpdateSymptomRecordRequest): Promise<SymptomRecord> {
    return fetchWithMock({
        mockData: () => {
            const found = mockSymptomRecords.find(r => r._id === recordId);
            if (!found) throw new Error("Symptom record not found in mock");
            const updated = { ...found, ...data, updated_at: new Date().toISOString() };
            return updated;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/symptom-records/${recordId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to edit symptom record');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: `editSymptomRecord(${recordId})`
    });
}

/**
 * Delete symptom record
 */
export async function deleteSymptomRecord(token: string, recordId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            return { success: true, message: "Symptom record deleted (mock)" };
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/symptom-records/${recordId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to delete symptom record');
            }

            return response.json();
        },
        mockLabel: `deleteSymptomRecord(${recordId})`
    });
}

// ---------------- Notification API ----------------

import { NotificationItem } from "@/types/domain/notification";
import { mockNotifications } from "@/mocks/notification.mock";

export async function getNotifications(token: string): Promise<NotificationItem[]> {
    return fetchWithMock({
        mockData: () => mockNotifications,
        apiCall: async () => {
            // Use proxyRequest or direct fetch. Proxy handles standard auth.
            const response = await loggedFetch(`/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to fetch notifications');
            }

            const json = await response.json();
            return json.data || json;
        },
        mockLabel: 'getNotifications'
    });
}


export async function markNotificationAsRead(token: string, id: string): Promise<boolean> {
    return fetchWithMock({
        mockData: () => {
            return true;
        },
        apiCall: async () => {
            const response = await loggedFetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to mark as read');
            }

            return true;
        },
        mockLabel: `markNotificationAsRead(${id})`
    });
}