/**
 * API Client for VetNurse Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000';


// Mock Data Imports (Lazy load where possible or just direct if simple)
import { mockPets } from '@/mocks/pets.mock';
import { mockDashboardData, mockMedicationNotificationDetail } from '@/mocks/dashboard.mock';
import { mockAppointments } from '@/mocks/appointments.mock';
import { mockUserProfile } from '@/mocks/owner.mock';
import { mockEachDayMedicines, mockMedicines } from '@/mocks/medication.mock';
import { mockSymptomRecords } from '@/mocks/symptom.mock';
import { Appointment } from '@/types/domain/appointment';
import { SymptomRecord, CreateSymptomRecordRequest, UpdateSymptomRecordRequest, SymptomCalendarResponse } from '@/types/domain/symptom';

// Mock Helper
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

const cloneMock = <T,>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

let mockAppointmentsStore: Appointment[] = cloneMock(mockAppointments);
let mockSymptomRecordsStore: SymptomRecord[] = cloneMock(mockSymptomRecords);

function normalizeAppointmentStatus(status?: string): Appointment["status"] {
    const lower = (status ?? "").toLowerCase();
    if (lower === "completed") return "completed";
    if (lower === "canceled" || lower === "cancelled") return "canceled";
    return "upcoming";
}

import {
    AddMedicationPayload,
    EditMedicationPayload,
    MedicineItem
} from '@/types/api/medication.dto';
import {
    AddAppointmentPayload,
    EditAppointmentPayload
} from '@/types/api/appointment.dto';
import {
    CreatePetDTO,
    UpdatePetDTO
} from '@/types/api/pet.dto';
import {
    RegisterOwnerPayload,
    UserProfileUpdatePayload
} from '@/types/api/auth.dto';
import {
    AddSymptomPayload,
    EditSymptomPayload
} from '@/types/api/record.dto';
import {
    AddMedicalPayload
} from '@/types/api/medical.dto';
/**
 * Exchange LINE authorization code for access token
 */
export async function exchangeLineToken(code: string): Promise<LineExchangeResponse> {
    const response = await loggedFetch(`/auth/auth/line/exchange`, {
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
}
/**
 * Send appointment notification
 */
export async function notifyAppointment(
    token: string,
    lineId: string,
    topic: string,
    date: string
): Promise<any> {
    const queryString = `line_id=${encodeURIComponent(lineId)}&topic=${encodeURIComponent(topic)}&date=${encodeURIComponent(date)}`;
    const response = await loggedFetch(`/auth/notify/appointment?${queryString}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send notification');
    }
    return response.json();
}
/**
 * Get current user information
 */
export async function getCurrentUser(token: string): Promise<User> {
    const response = await loggedFetch(`/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to get user information');
    }
    const data = await response.json();
    return data || data.data;
}
/**
 * Get dashboard home data
 */
export async function getDashboardHome(token: string): Promise<import('@/types/domain/dashboard').DashboardResponse> {
    const response = await loggedFetch(`/v1/dashboard/home`, {
        headers: {
            'access_token': token
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get dashboard data');
    }
    return response.json();
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
            const token = localStorage.getItem('auth_token');
            // Invalidate old mock tokens
            if (token === 'mock_token') return null;
            return token;
        }
        return null;
    },
    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    },
    setUser(user: User) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },
    getUser(): User | null {
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
export async function getMedications(token: string, petId?: number, date?: string): Promise<any> {
    let url = `/v1/medications`;
    const params = new URLSearchParams();
    if (petId && petId !== 0) params.append('pet_id', petId.toString());
    if (date) params.append('date', date);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    const response = await loggedFetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medications');
    }
    const data = await response.json();
    return data.data || data;
}
/**
 * Get medication notification detail
 */
export async function getMedicationNotificationDetail(token: string, notificationId: number): Promise<any> {
    const response = await loggedFetch(`/v1/medications/${notificationId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medication detail');
    }
    const json = await response.json();
    return json.data;
}
/**
 * Mark medication notification as taken
 */
export async function markMedicationTaken(
    token: string,
    notificationId: number
): Promise<any> {
    const response = await loggedFetch(`/v1/medications/${notificationId}/taken`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to mark medication as taken');
    }
    return response.json();
}
/**
 * Get medicine notification detail
 */
export async function getMedicineDetail(
    token: string,
    notificationId: number
): Promise<any> {
    const response = await loggedFetch(
        `/v1/medications/${notificationId}`,
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
    return json.data;
}
/**
 * Edit medicine
 */
/**
 * Edit medicine
 */
export async function editMedicine(
    token: string,
    medicineId: string,
    medicineData: EditMedicationPayload
): Promise<any> {
    const response = await loggedFetch(
        `/v1/medications/medicines/${medicineId}`,
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
}
/**
 * Delete medicine
 */
export async function deleteMedicine(
    token: string,
    medicineId: string
): Promise<any> {
    const response = await loggedFetch(
        `/v1/medications/medicines/${medicineId}`,
        {
            method: 'DELETE',
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
}
/**
 * Create new medicine with automatic notification generation
 */
/**
 * Create new medicine
 */
export async function createMedicine(token: string, medicineData: AddMedicationPayload): Promise<any> {
    const response = await loggedFetch(`/v1/medications/medicines`, {
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
}
/**
 * Get medicines by pet
 */
export async function getMedicinesByPet(token: string, petId: string): Promise<any> {
    const response = await loggedFetch(`/v1/medications/medicines/by-pet/${petId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medicines by pet');
    }
    const json = await response.json();
    return json.data || json;
}
/**
 * Filter medicines
 */
export async function filterMedicines(token: string, params: Record<string, any>): Promise<MedicineItem[]> {
    const queryString = new URLSearchParams(params).toString();
    const response = await loggedFetch(`/v1/medications/medicines/filter?${queryString}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to filter medicines');
    }
    const json = await response.json();
    return json.data || json;
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
            const records = cloneMock(mockAppointmentsStore);
            if (status) {
                return records.filter(evt => evt.status?.toLowerCase() === status.toLowerCase());
            }
            return records;
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
    let url = `/v1/appointments`;
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
    console.log(json);
    return json.data || json;
}
/**
 * Get appointment detail
 */
export async function getAppointmentDetail(token: string, appointmentId: number): Promise<any> {
    const response = await loggedFetch(`/v1/appointments/${appointmentId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Failed to get appointment detail: ${response.status}`, error);
        throw new Error(error.detail || 'Failed to get appointment detail');
    }
    const json = await response.json();
    return json.data || json;
export async function getAppointmentDetail(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            if (appointmentId) {
                const found = mockAppointmentsStore.find(a => a._id === appointmentId);
                if (!found) throw new Error("Appointment detail not found in mock");
                return cloneMock(found);
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
export async function createAppointment(token: string, appointmentData: AddAppointmentPayload): Promise<any> {
    const response = await loggedFetch(`/v1/appointments`, {
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
export async function createAppointment(token: string, appointmentData: any): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            const pet = mockPets.find((p) => p._id === appointmentData.pet_id);
            const created: Appointment = {
                _id: "mock_apt_" + Math.random().toString(36).substring(2, 10),
                pet_id: appointmentData.pet_id,
                pet_name: pet?.name || "Unknown Pet",
                pet_image: pet?.profile_image || "",
                location: appointmentData.location || "",
                appointment_date: appointmentData.appointment_date || new Date().toISOString(),
                status: normalizeAppointmentStatus(appointmentData.status),
                note: appointmentData.note,
                created_at: new Date().toISOString(),
            };
            mockAppointmentsStore = [created, ...mockAppointmentsStore];
            return {
                success: true,
                data: cloneMock(created),
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
    appointmentId: number,
    appointmentData: EditAppointmentPayload
): Promise<any> {
    const response = await loggedFetch(`/v1/appointments/${appointmentId}`, {
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
    return fetchWithMock({
        mockData: () => {
            const idx = mockAppointmentsStore.findIndex((a) => a._id === appointmentId);
            if (idx < 0) throw new Error("Appointment not found in mock");
            const current = mockAppointmentsStore[idx];
            const pet = mockPets.find((p) => p._id === (appointmentData.pet_id || current.pet_id));
            const updated: Appointment = {
                ...current,
                pet_id: appointmentData.pet_id || current.pet_id,
                pet_name: pet?.name || current.pet_name,
                pet_image: pet?.profile_image || current.pet_image,
                appointment_date: appointmentData.appointment_date || current.appointment_date,
                location: appointmentData.location || current.location,
                status: normalizeAppointmentStatus(appointmentData.status || current.status),
                updated_at: new Date().toISOString(),
            };
            mockAppointmentsStore[idx] = updated;
            return {
                success: true,
                data: cloneMock(updated),
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
export async function cancelAppointment(token: string, appointmentId: number): Promise<any> {
    const response = await loggedFetch(`/v1/appointments/${appointmentId}/cancel`, {
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
export async function cancelAppointment(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            const idx = mockAppointmentsStore.findIndex((a) => a._id === appointmentId);
            if (idx >= 0) {
                mockAppointmentsStore[idx] = {
                    ...mockAppointmentsStore[idx],
                    status: "canceled",
                    updated_at: new Date().toISOString(),
                };
            }
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
export async function deleteAppointment(token: string, appointmentId: number): Promise<any> {
    const response = await loggedFetch(`/v1/appointments/${appointmentId}`, {
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
export async function deleteAppointment(token: string, appointmentId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            mockAppointmentsStore = mockAppointmentsStore.filter((a) => a._id !== appointmentId);
            return { success: true, message: "Appointment deleted (mock)", id: appointmentId };
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
    const response = await loggedFetch(`/v1/pets`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get pets');
    }
    const data = await response.json();
    return data;
}
/**
 * Get pet dashboard home data
 */
export async function getPetDashboard(token: string): Promise<any> {
    const response = await loggedFetch(`/v1/pets/dashboard/home`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get pet dashboard');
    }
    return response.json();
}
/**
 * Get pet detail
 */
export async function getPetDetail(token: string, petId: string): Promise<Pet> {
    const response = await loggedFetch(`/v1/pets/${petId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get pet detail');
    }
    const data = await response.json();
    return data;
}
/**
 * Create new pet (register pet)
 */
export async function createPet(token: string, petData: CreatePetDTO): Promise<Pet> {
    const response = await loggedFetch(`/v1/pets`, {
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
    return data;
}
/**
 * Register a new pet (special registration flow)
 */
export async function registerPet(token: string, petData: CreatePetDTO): Promise<{ message: string, pet_id: number }> {
    const response = await loggedFetch(`/v1/register/pet`, {
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
}
/**
 * Update pet information
 */
export async function updatePet(token: string, petId: string, petData: UpdatePetDTO): Promise<Pet> {
    const response = await loggedFetch(`/v1/pets/${petId}`, {
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
    return data
}
/**
 * Delete pet
 */
export async function deletePet(token: string, petId: string): Promise<any> {
    const response = await loggedFetch(`/v1/pets/${petId}`, {
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
}
/**
 * Record pet symptom
 */
export async function recordPetSymptom(token: string, petId: string, data: AddSymptomPayload): Promise<any> {
    const response = await loggedFetch(`/v1/pets/${petId}/symptoms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to record symptom');
    }
    return response.json();
}
/**
 * Get pet medical history
 */
export async function getPetMedicalHistory(token: string, petId: string): Promise<any> {
    const response = await loggedFetch(`/v1/pets/${petId}/medical-history`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medical history');
    }
    return response.json();
}
/**
 * Add pet medical history
 */
export async function addPetMedicalHistory(token: string, petId: string, data: AddMedicalPayload): Promise<any> {
    const response = await loggedFetch(`/v1/pets/${petId}/medical-history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add medical history');
    }
    return response.json();
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
/**
 * Upload image to R2 storage via backend API
 */
export async function uploadImage(file: File, token: string, folder: string = 'pets'): Promise<string> {
    // 1. Get Presigned URL
    const response = await loggedFetch(`/api/upload/presigned-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
            folder: folder
        }),
    });
export async function getPresignedUrl(token: string, fileType: string, folder: string): Promise<{ uploadUrl: string, objectKey: string, publicUrl: string }> {
    return fetchWithMock({
        mockData: () => {
            return {
                uploadUrl: "https://mock-r2-upload-url.com",
                objectKey: `${folder}/mock-key.jpg`,
                publicUrl: "/images/home.png"
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
        throw new Error(error.detail || 'Failed to get upload URL');
    }

    const { upload_url, public_url } = await response.json();

    // 2. Upload directly to R2
    const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to storage');
    }

    return public_url;
}
/**
 * Delete image from R2 storage
 */
export async function deleteImage(filename: string, token: string): Promise<void> {
    const response = await loggedFetch(`/v1/upload/image?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete image');
    }
}
// ============================================================================
// USER PROFILE API
// ============================================================================
/**
 * Get user profile
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
    const response = await loggedFetch(`/v1/user/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get user profile');
    }
    const data = await response.json();
    return data.data;
}
/**
 * Update user profile
 */
export async function updateUserProfile(token: string, profileData: UserProfileUpdatePayload): Promise<any> {
    const response = await loggedFetch(`/v1/user/profile`, {
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
    return data;
}
/**
 * Register owner profile
 */
export async function registerOwner(token: string, ownerData: RegisterOwnerPayload): Promise<{ message: string }> {
    const response = await loggedFetch(`/v1/register/owner`, {
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
}
// ============================================================================
// SYMPTOM RECORDS API
// ============================================================================

import { SymptomRecord, SymptomCalendarResponse, SymptomRecordCreate, SymptomRecordUpdate } from '@/types/domain/symptom';
/**
 * Get symptom records calendar
 */
export async function getSymptomRecordsCalendar(token: string, petId?: string, month?: string): Promise<SymptomCalendarResponse> {
    let url = `/v1/symptom-records/calendar`;
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
        throw new Error(error.detail || 'Failed to get symptom records calendar');
    }
    const json = await response.json();
    console.log(json);
    return json.data;
    return fetchWithMock({
        mockData: () => {
            const calendar: SymptomCalendarResponse = {};
            let filtered = [...mockSymptomRecordsStore];
            if (petId) {
                filtered = filtered.filter(r => r.pet_id === petId);
            }
            if (month) {
                filtered = filtered.filter((r) => {
                    const d = r.date.includes("T") ? r.date.slice(0, 10) : r.date;
                    return d.startsWith(`${month}-`);
                });
            }
            filtered.forEach(record => {
                const date = record.date.includes("T") ? record.date.slice(0, 10) : record.date;
                if (!calendar[date]) {
                    calendar[date] = [];
                }
                calendar[date].push(cloneMock(record));
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
export async function createSymptomRecord(token: string, data: AddSymptomPayload): Promise<any> {
    const response = await loggedFetch(`/v1/symptom-records`, {
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
export async function createSymptomRecord(token: string, data: CreateSymptomRecordRequest): Promise<SymptomRecord> {
    return fetchWithMock({
        mockData: () => {
            const newRecord: SymptomRecord = {
                _id: "mock_sym_" + Math.random().toString(36).substring(2, 10),
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockSymptomRecordsStore = [newRecord, ...mockSymptomRecordsStore];
            return cloneMock(newRecord);
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
    const response = await loggedFetch(`/v1/symptom-records/${recordId}`, {
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
    return fetchWithMock({
        mockData: () => {
            const found = mockSymptomRecordsStore.find(r => r._id === recordId);
            if (!found) throw new Error("Symptom record not found in mock");
            return cloneMock(found);
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
export async function editSymptomRecord(token: string, recordId: number, data: EditSymptomPayload): Promise<any> {
    const response = await loggedFetch(`/v1/symptom-records/${recordId}`, {
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
export async function editSymptomRecord(token: string, recordId: string, data: UpdateSymptomRecordRequest): Promise<SymptomRecord> {
    return fetchWithMock({
        mockData: () => {
            const idx = mockSymptomRecordsStore.findIndex(r => r._id === recordId);
            if (idx < 0) throw new Error("Symptom record not found in mock");
            const current = mockSymptomRecordsStore[idx];
            const updated = { ...current, ...data, updated_at: new Date().toISOString() };
            mockSymptomRecordsStore[idx] = updated;
            return cloneMock(updated);
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
export async function deleteSymptomRecord(token: string, recordId: number): Promise<any> {
    const response = await loggedFetch(`/v1/symptom-records/${recordId}`, {
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
export async function deleteSymptomRecord(token: string, recordId: string): Promise<any> {
    return fetchWithMock({
        mockData: () => {
            mockSymptomRecordsStore = mockSymptomRecordsStore.filter((r) => r._id !== recordId);
            return { success: true, message: "Symptom record deleted (mock)", id: recordId };
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
export async function getNotifications(token: string): Promise<NotificationItem[]> {
    // Correct endpoint for notification feed is /v1/medications
    const response = await loggedFetch(`/v1/medications`, {
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
}
export async function markNotificationAsRead(token: string, id: string): Promise<boolean> {
    const response = await loggedFetch(`/v1/medications/${id}/taken`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to mark as read');
    }
    return true;
}