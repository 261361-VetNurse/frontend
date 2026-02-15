/**
 * API Client for VetNurse Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:8000';
const USE_MOCK_DATA = ['1', 'true', 'yes', 'on'].includes(
    (process.env.NEXT_PUBLIC_USE_MOCK_DATA || '').toLowerCase()
);

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

interface UserResponse {
    id: string;
    display_name: string;
    picture_url: string;
    role: string;
    is_registered: boolean;
}

/**
 * Exchange LINE authorization code for access token
 */
export async function exchangeLineToken(code: string): Promise<LineExchangeResponse> {
    const response = await loggedFetch(`${API_BASE_URL}/auth/line/exchange`, {
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
 * Get current user information
 */
export async function getCurrentUser(token: string): Promise<UserResponse> {
    const response = await loggedFetch(`${API_BASE_URL}/me`, {
        headers: {
            'access_token': token
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user information');
    }

    return response.json();
}

/**
 * Get dashboard home data
 */
export async function getDashboardHome(token: string): Promise<import('../types/domain/dashboard').DashboardResponse> {
    if (USE_MOCK_DATA) {
        const { getMockDashboardHome } = await import('@/mocks/dashboard.mock');
        return getMockDashboardHome();
    }

    const response = await loggedFetch(`${API_BASE_URL}/v1/dashboard/home`, {
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
    let url = `${API_BASE_URL}/v1/medications`;
    const params = new URLSearchParams();
    if (petId) params.append('pets_id', petId);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await loggedFetch(url, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medications');
    }

    const json = await response.json();
    console.log('json', json);
    return json.data || json;
}

/**
 * Get medication notification detail
 */
export async function getMedicationDetail(token: string, notificationId: string): Promise<any> {
    if (USE_MOCK_DATA) {
        const { getMockMedicationDetail } = await import('@/mocks/dashboard.mock');
        return getMockMedicationDetail(notificationId);
    }

    const response = await loggedFetch(`${API_BASE_URL}/v1/medications/${notificationId}`, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medication detail');
    }

    const json = await response.json();
    return json.data || json;
}

/**
 * Mark medication notification as taken
 */
export async function markMedicationTaken(
    token: string,
    notificationId: string,
    istaken: boolean = true
): Promise<any> {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                notification_id: notificationId,
                istaken,
            },
        };
    }

    const response = await loggedFetch(`${API_BASE_URL}/v1/medications/${notificationId}/taken`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify({ istaken }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to mark medication as taken');
    }

    return response.json();
}

/**
 * Get medicine root details
 */
export async function getMedicineDetail(
    token: string,
    notificationId: string,
    medicineId: string
): Promise<any> {
    const response = await loggedFetch(
        `${API_BASE_URL}/v1/medications/${notificationId}/${medicineId}`,
        {
            headers: {
                'access_token': token,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get medicine detail');
    }

    const json = await response.json();
    return json.data || json;
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
    const response = await loggedFetch(
        `${API_BASE_URL}/v1/medications/${notificationId}/${medicineId}/edit`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'access_token': token,
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
 * Delete medicine (cascade deletes medicine and all related notifications)
 */
export async function deleteMedicine(
    token: string,
    notificationId: string,
    medicineId: string
): Promise<any> {
    const response = await loggedFetch(
        `${API_BASE_URL}/v1/medications/${notificationId}/${medicineId}/delete`,
        {
            method: 'PATCH',
            headers: {
                'access_token': token,
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
export async function createMedicine(token: string, medicineData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/medications/medicine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(medicineData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create medicine');
    }

    return response.json();
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
    let url = `${API_BASE_URL}/v1/appointments`;
    if (status) url += `?status=${encodeURIComponent(status)}`;

    const response = await loggedFetch(url, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get appointments');
    }

    const json = await response.json();
    return json.data || json;
}

/**
 * Get appointment detail
 */
export async function getAppointmentDetail(token: string, appointmentId: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/appointments/${appointmentId}`, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get appointment detail');
    }

    const json = await response.json();
    return json.data || json;
}

/**
 * Create new appointment
 */
export async function createAppointment(token: string, appointmentData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
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
    appointmentId: string,
    appointmentData: any
): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/appointments/${appointmentId}/edit`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
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
export async function cancelAppointment(token: string, appointmentId: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
            'access_token': token,
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
export async function deleteAppointment(token: string, appointmentId: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
            'access_token': token,
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
export async function getPets(token: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/pets`, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get pets');
    }

    return response.json();
}

/**
 * Get pet detail
 */
export async function getPetDetail(token: string, petId: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/pets/${petId}`, {
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get pet detail');
    }

    return response.json();
}

/**
 * Create new pet (register pet)
 */
export async function createPet(token: string, petData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/pets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(petData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create pet');
    }

    return response.json();
}

/**
 * Update pet information
 */
export async function updatePet(token: string, petId: string, petData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/pets/${petId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(petData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update pet');
    }

    return response.json();
}

/**
 * Delete pet
 */
export async function deletePet(token: string, petId: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/pets/${petId}`, {
        method: 'DELETE',
        headers: {
            'access_token': token,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete pet');
    }

    return response.json();
}

// ============================================================================
// REGISTRATION API
// ============================================================================

/**
 * Register owner
 */
export async function registerOwner(token: string, ownerData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/owner`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(ownerData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to register owner');
    }

    return response.json();
}

/**
 * Register pet (alternative endpoint from /pet route)
 */
export async function registerPet(token: string, petData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/pet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(petData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to register pet');
    }

    return response.json();
}

// ============================================================================
// UPLOAD API
// ============================================================================

/**
 * Upload image to R2 storage via backend API
 */
export async function uploadImage(file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await loggedFetch(`${API_BASE_URL}/v1/upload/image`, {
        method: 'POST',
        headers: {
            'access_token': token,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
}

/**
 * Delete image from R2 storage
 */
export async function deleteImage(filename: string, token: string): Promise<void> {
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
}

// ============================================================================
// USER PROFILE API
// ============================================================================

/**
 * Get user profile
 */
export async function getUserProfile(token: string): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/user/profile`, {
        headers: {
            'access_token': token,
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
export async function updateUserProfile(token: string, profileData: any): Promise<any> {
    const response = await loggedFetch(`${API_BASE_URL}/v1/user/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access_token': token,
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user profile');
    }

    return response.json();
}
