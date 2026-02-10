
const API_BASE_URL = 'http://localhost:8000'; // Assuming this is running
const FAKE_TOKEN = process.env.NEXT_PUBLIC_FAKE_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.sample_token_1";

async function loggedFetch(url: string, options: RequestInit = {}) {
    console.log(`fetching ${url}...`);
    try {
        const res = await fetch(url, options);
        console.log(`Status: ${res.status}`);
        if (!res.ok) {
            console.log("Error body:", await res.text());
        }
        return res;
    } catch (e) {
        console.error("Fetch error:", e);
        throw e;
    }
}

async function debugApi() {
    console.log("Starting debug-api...");

    // 1. Get Dashboard Home
    console.log("\n--- Get Dashboard Home ---");
    const dashRes = await loggedFetch(`${API_BASE_URL}/v1/dashboard/home`, {
        headers: {
            'Authorization': `Bearer ${FAKE_TOKEN}`,
            'access_token': FAKE_TOKEN
        }
    });

    if (!dashRes.ok) return;

    const dashData = await dashRes.json();
    console.log("Dashboard Data Success");

    const noti = dashData.data.medicines_notifications?.[0];
    const apt = dashData.data.appointments?.[0];

    // 2. Test Medication Detail
    if (noti) {
        console.log(`\n--- Testing Medication Detail for ID: ${noti._id} (Medicine ID: ${noti.medicine_id}) ---`);
        // Try the endpoint used by client
        const medRes = await loggedFetch(`${API_BASE_URL}/v1/medications/notifications/${noti._id}`, {
            headers: {
                'Authorization': `Bearer ${FAKE_TOKEN}`,
                'access_token': FAKE_TOKEN
            }
        });

        if (medRes.ok) {
            console.log("Medication Detail: ", await medRes.json());
        } else {
            // Try alternative: Maybe it needs medicine_id?
            console.log(`\n--- Retrying with Medicine ID: ${noti.medicine_id} at /v1/medications/medicines/ ---`);
            const medRes2 = await loggedFetch(`${API_BASE_URL}/v1/medications/medicines/${noti.medicine_id}`, {
                headers: {
                    'Authorization': `Bearer ${FAKE_TOKEN}`,
                    'access_token': FAKE_TOKEN
                }
            });
            if (medRes2.ok) {
                console.log("Medication Detail (by Med ID): ", await medRes2.json());
            } else {
                // Try one more: /v1/medications/medicines/${noti._id} ? 
                console.log(`\n--- Retrying with Notification ID: ${noti._id} at /v1/medications/medicines/ ---`);
                const medRes3 = await loggedFetch(`${API_BASE_URL}/v1/medications/medicines/${noti._id}`, {
                    headers: {
                        'Authorization': `Bearer ${FAKE_TOKEN}`,
                        'access_token': FAKE_TOKEN
                    }
                });
                if (medRes3.ok) {
                    console.log("Medication Detail (by Noti ID): ", await medRes3.json());
                }
            }
        }
    } else {
        console.log("No medication notifications found in dashboard.");
    }

    // 3. Test Appointment Detail
    if (apt) {
        console.log(`\n--- Testing Appointment Detail for ID: ${apt._id} ---`);
        const aptRes = await loggedFetch(`${API_BASE_URL}/v1/appointments/${apt._id}`, {
            headers: {
                'Authorization': `Bearer ${FAKE_TOKEN}`,
                'access_token': FAKE_TOKEN
            }
        });

        // Also try listing all appointments to see if the ID exists
        console.log("\n--- Listing All Appointments ---");
        const allAptsRes = await loggedFetch(`${API_BASE_URL}/v1/appointments`, {
            headers: {
                'Authorization': `Bearer ${FAKE_TOKEN}`,
                'access_token': FAKE_TOKEN
            }
        });
        if (allAptsRes.ok) {
            const allApts = await allAptsRes.json();
            console.log("All Appointments First Item:", allApts.data?.[0]);
        }

        if (aptRes.ok) {
            console.log("Appointment Detail: ", await aptRes.json());
        }
    } else {
        console.log("No appointments found in dashboard.");
    }


    // 4. Check User and Pets (to see if token works for them)
    console.log("\n--- Checking User Info ---");
    const userRes = await loggedFetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${FAKE_TOKEN}`,
            'access_token': FAKE_TOKEN
        }
    });

    if (userRes.ok) {
        console.log("User Info:", await userRes.json());
    } else {
        console.log("Failed to get user info");
    }

    console.log("\n--- Checking Pets ---");
    const petsRes = await loggedFetch(`${API_BASE_URL}/v1/pets`, {
        headers: {
            'Authorization': `Bearer ${FAKE_TOKEN}`,
            'access_token': FAKE_TOKEN
        }
    });

    if (petsRes.ok) {
        console.log("Pets:", await petsRes.json());
    } else {
        console.log("Failed to get pets");
    }
}

debugApi();
