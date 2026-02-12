/**
 * API Client for VetNurse Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000';
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
/**
 * Exchange LINE authorization code for access token
 */
export async function exchangeLineToken(code: string): Promise<LineExchangeResponse> {
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
    const response = await loggedFetch(`/api/auth/notify/appointment?${queryString}`, {
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
    const response = await loggedFetch(`/api/auth/me`, {
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
            'Authorization': `Bearer ${token}`
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
    medicineData: any
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
export async function createMedicine(token: string, medicineData: any): Promise<any> {
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
    const response = await loggedFetch(`/api/medications/medicines/by-pet/${petId}`, {
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
export async function filterMedicines(token: string, params: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await loggedFetch(`/api/medications/medicines/filter?${queryString}`, {
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
    console.log(json);
    return json.data || json;
}
/**
 * Get appointment detail
 */
export async function getAppointmentDetail(token: string, appointmentId: number): Promise<any> {
    const response = await loggedFetch(`/api/appointments/${appointmentId}`, {
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
}
/**
 * Create new appointment
 */
export async function createAppointment(token: string, appointmentData: any): Promise<any> {
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
}
/**
 * Edit appointment
 */
export async function editAppointment(
    token: string,
    appointmentId: number,
    appointmentData: any
): Promise<any> {
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
}
/**
 * Cancel appointment
 */
export async function cancelAppointment(token: string, appointmentId: number): Promise<any> {
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
}
/**
 * Delete appointment
 */
export async function deleteAppointment(token: string, appointmentId: number): Promise<any> {
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
}
// ============================================================================
// PETS API
// ============================================================================
/**
 * Get all pets
 */
export async function getPets(token: string): Promise<Pet[]> {
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
    return data;
}
/**
 * Get pet dashboard home data
 */
export async function getPetDashboard(token: string): Promise<any> {
    const response = await loggedFetch(`/api/pets/dashboard/home`, {
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
    return data;
}
/**
 * Create new pet (register pet)
 */
export async function createPet(token: string, petData: Partial<Pet>): Promise<Pet> {
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
    return data;
}
/**
 * Register a new pet (special registration flow)
 */
export async function registerPet(token: string, petData: Partial<Pet>): Promise<{ message: string, pet_id: number }> {
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
}
/**
 * Update pet information
 */
export async function updatePet(token: string, petId: string, petData: Partial<Pet>): Promise<Pet> {
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
    return data
}
/**
 * Delete pet
 */
export async function deletePet(token: string, petId: string): Promise<any> {
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
}
/**
 * Record pet symptom
 */
export async function recordPetSymptom(token: string, petId: string, data: any): Promise<any> {
    const response = await loggedFetch(`/api/pets/${petId}/symptoms`, {
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
    const response = await loggedFetch(`/api/pets/${petId}/medical-history`, {
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
export async function addPetMedicalHistory(token: string, petId: string, data: any): Promise<any> {
    const response = await loggedFetch(`/api/pets/${petId}/medical-history`, {
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
export async function uploadImage(file: File, token: string): Promise<string> {
    // 1. Get Presigned URL
    const response = await loggedFetch(`/api/upload/presigned-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            filename: file.name,
            content_type: file.type
        }),
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
    const response = await loggedFetch(`/api/upload/image?filename=${encodeURIComponent(filename)}`, {
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
    return data.data;
}
/**
 * Update user profile
 */
export async function updateUserProfile(token: string, profileData: Partial<UserProfile>): Promise<any> {
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
    return data;
}
/**
 * Register owner profile
 */
export async function registerOwner(token: string, ownerData: any): Promise<{ message: string }> {
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
}
// ============================================================================
// SYMPTOM RECORDS API
// ============================================================================
import { SymptomRecord, SymptomCalendarResponse, SymptomRecordCreate, SymptomRecordUpdate } from '@/types/domain/symptom';
/**
 * Get symptom records calendar
 */
export async function getSymptomRecordsCalendar(token: string, petId?: string, month?: string): Promise<SymptomCalendarResponse> {
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
        throw new Error(error.detail || 'Failed to get symptom records calendar');
    }
    const json = await response.json();
    console.log(json);
    return json.data;
}
/**
 * Create symptom record
 */
export async function createSymptomRecord(token: string, data: SymptomRecordCreate): Promise<SymptomRecord> {
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
}
/**
 * Get symptom record detail
 */
export async function getSymptomRecordDetail(token: string, recordId: string): Promise<SymptomRecord> {
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
}
/**
 * Edit symptom record
 */
export async function editSymptomRecord(token: string, recordId: string, data: SymptomRecordUpdate): Promise<SymptomRecord> {
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
}
/**
 * Delete symptom record
 */
export async function deleteSymptomRecord(token: string, recordId: number): Promise<any> {
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
}
// ---------------- Notification API ----------------
import { NotificationItem } from "@/types/domain/notification";
export async function getNotifications(token: string): Promise<NotificationItem[]> {
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
}
export async function markNotificationAsRead(token: string, id: string): Promise<boolean> {
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
}