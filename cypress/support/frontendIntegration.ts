/// <reference types="cypress" />

const DEFAULT_BACKEND_BASE_URL = 'http://localhost:8000';
const DEFAULT_FRONTEND_BASE_URL = 'http://localhost:3000';

function getBackendBaseUrl() {
  return String(Cypress.env('backendBaseUrl') || DEFAULT_BACKEND_BASE_URL).replace(/\/+$/, '');
}

function getFrontendBaseUrl() {
  return String(Cypress.env('frontendBaseUrl') || Cypress.config('baseUrl') || DEFAULT_FRONTEND_BASE_URL).replace(/\/+$/, '');
}

function unwrapData<T = any>(body: any): T {
  if (body && typeof body === 'object' && 'data' in body) return body.data as T;
  return body as T;
}

function uniqueSuffix() {
  return `${Date.now()}-${Cypress._.random(1000, 9999)}`;
}

function defaultOwnerProfilePayload() {
  const suffix = uniqueSuffix();
  return {
    first_name: 'Cypress',
    last_name: `Owner${suffix}`,
    phone: `08${Cypress._.random(10000000, 99999999)}`,
    email: `cypress.owner.${suffix}@example.com`,
    address_line1: '123 Cypress Test Road',
    address_line2: 'Suite FI',
    subdistrict: 'Suthep',
    district: 'Mueang Chiang Mai',
    province: 'Chiang Mai',
    postal_code: '50200',
  };
}

Cypress.Commands.add('fiEnsureBackendReady', () => {
  cy.task('fi:frontendHealth', getFrontendBaseUrl(), { timeout: 30000 });
  cy.task('fi:backendHealth', `${getBackendBaseUrl()}/openapi.json`, { timeout: 30000 });
});

Cypress.Commands.add('fiGetAuthToken', () => {
  const explicit = Cypress.env('fiAuthToken');
  if (explicit) {
    const token = String(explicit);
    Cypress.env('fiAuthTokenCache', token);
    return cy.wrap(token, { log: false });
  }

  const cached = Cypress.env('fiAuthTokenCache');
  if (cached) {
    return cy.wrap(String(cached), { log: false });
  }

  const validateAndCacheToken = (jwt: string) => {
    Cypress.env('fiAuthTokenCache', jwt);
    return cy
      .request({
        method: 'GET',
        url: `${getBackendBaseUrl()}/auth/me`,
        headers: { Authorization: `Bearer ${jwt}` },
        failOnStatusCode: false,
      })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(
            `Generated token validation failed via /auth/me (${res.status}). ` +
              `Ensure backend DB + user are ready in /Users/icy/year3.2/Backend.`
          );
        }
        return jwt;
      });
  };

  const developerAccessFallback = () => {
    cy.log('fi:token unavailable -> fallback Developer Access (DEV_1)');
    return cy.visit('/pet-owners/login-page').then(() => {
      cy.contains(/developer access/i, { timeout: 20000 }).should('be.visible');
      cy.get('input:visible').last().should('be.visible').as('fiDevAccessInput');
      cy.get('@fiDevAccessInput').clear();
      cy.get('input:visible').last().should('be.visible').type('DEV_1');
      cy.get('body').then(($body) => {
        const enterButton = [...$body.find('button')].find((button) =>
          /^Enter$/i.test((button.textContent ?? '').trim())
        );
        if (enterButton) {
          cy.wrap(enterButton).click();
        }
      });

      return cy
        .window({ timeout: 30000 })
        .should((win) => {
          const token = win.localStorage.getItem('auth_token');
          expect(token, 'auth_token from fiGetAuthToken Developer Access fallback')
            .to.be.a('string')
            .and.have.length.greaterThan(20);
        })
        .then((win) => {
          const token = String(win.localStorage.getItem('auth_token'));
          return validateAndCacheToken(token);
        });
    });
  };

  return cy
    .task('fi:tokenSafe', undefined, { timeout: 60000 })
    .then((result: any) => {
      if (result?.ok && result.token) {
        return validateAndCacheToken(String(result.token));
      }
      return developerAccessFallback();
    });
});

Cypress.Commands.add('fiLogin', () => {
  return cy.fiEnsureBackendReady().then(() =>
    cy.fiGetAuthToken().then((token) => {
      Cypress.env('fiAuthTokenCache', token);
      return token;
    })
  );
});

Cypress.Commands.add(
  'fiApi',
  (
    method: string,
    path: string,
    body?: unknown,
    options: { failOnStatusCode?: boolean; qs?: Record<string, any> } = {}
  ) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return cy.fiGetAuthToken().then((token) => {
    return cy.request({
      method,
      url: `${getBackendBaseUrl()}${normalizedPath}`,
      headers: { Authorization: `Bearer ${token}` },
      body: body as any,
      failOnStatusCode: options.failOnStatusCode ?? true,
      qs: options.qs,
    });
  });
  }
);

Cypress.Commands.add('fiEnsureOwnerProfile', () => {
  const payload = defaultOwnerProfilePayload();
  return cy
    .fiApi('POST', '/v1/register/owner', payload, { failOnStatusCode: false })
    .then((res) => {
      if (![200, 201, 400].includes(res.status)) {
        throw new Error(`Failed to ensure owner registration: ${res.status} ${JSON.stringify(res.body)}`);
      }
    })
    .then(() =>
      cy.fiApi('PATCH', '/v1/user/profile', {
        fname: payload.first_name,
        lname: payload.last_name,
        phone: payload.phone,
        email: payload.email,
        gender: 'female',
      }, { failOnStatusCode: false })
    )
    .then((res) => {
      if (![200, 404].includes(res.status)) {
        throw new Error(`Failed to patch owner profile: ${res.status} ${JSON.stringify(res.body)}`);
      }
      return res;
    });
});

Cypress.Commands.add('fiGetMyPets', () => {
  return cy.fiApi('GET', '/v1/pets').then((res) => {
    const raw = unwrapData<any[]>(res.body);
    return (Array.isArray(raw) ? raw : []).map((pet) => ({
      ...pet,
      pet_id: Number((pet as any).pet_id ?? (pet as any)._id),
    }));
  });
});

Cypress.Commands.add('fiCreatePet', (overrides: Record<string, unknown> = {}) => {
  const suffix = uniqueSuffix();
  const payload = {
    name: `CY-FI-PET-${suffix}`,
    species: 'Dog',
    breed: 'Mixed',
    gender: 'male',
    birth_date: '2023-01-01',
    color: 'Brown',
    weight_kg: 4.2,
    infecund: false,
    in_medical: false,
    profile_image: null,
    ...overrides,
  };

  return cy.fiApi('POST', '/v1/pets', payload).then((res) => {
    const body = res.body as any;
    const petId = Number(body.pet_id ?? body.data?.pet_id);
    if (!Number.isFinite(petId)) {
      throw new Error(`Unable to parse pet_id from response: ${JSON.stringify(body)}`);
    }
    return cy.fiApi('GET', `/v1/pets/${petId}`).then((detailRes) => {
      const detail = unwrapData<any>(detailRes.body);
      return { petId, payload, detail };
    });
  });
});

Cypress.Commands.add(
  'fiCreateAppointment',
  (petId: number, overrides: Record<string, unknown> = {}) => {
  const suffix = uniqueSuffix();
  const payload = {
    pet_id: petId,
    location: `CY-FI-CLINIC-${suffix}`,
    appointment_date: '2026-02-10T14:00:00',
    status: 'Upcoming',
    note: `CY-FI appointment ${suffix}`,
    ...overrides,
  };

  return cy.fiApi('POST', '/v1/appointments', payload).then((res) => {
    const body = res.body as any;
    const appointmentId = Number(body.appointment_id ?? body.data?.appointment_id);
    if (!Number.isFinite(appointmentId)) {
      throw new Error(`Unable to parse appointment_id from response: ${JSON.stringify(body)}`);
    }
    return { appointmentId, payload, body };
  });
  }
);

Cypress.Commands.add(
  'fiCreateMedication',
  (petId: number, overrides: Record<string, unknown> = {}) => {
  const suffix = uniqueSuffix();
  const payload = {
    pet_id: petId,
    name: `CY-FI-MED-${suffix}`,
    dosage: '1 tablet',
    frequency: '-1',
    reminder_time: ['09:00'],
    start_date: '2026-02-01T00:00:00',
    end_date: '2026-02-28T00:00:00',
    notes: [],
    properties: 'Cypress integration medicine',
    image_urls: [],
    status: 'TAKE',
    ...overrides,
  };

  return cy.fiApi('POST', '/v1/medications/medicines', payload).then((res) => {
    const body = res.body as any;
    const medicineId = Number(body.medicine_id ?? body.data?.medicine_id);
    if (!Number.isFinite(medicineId)) {
      throw new Error(`Unable to parse medicine_id from response: ${JSON.stringify(body)}`);
    }
    return { medicineId, payload, body };
  });
  }
);

Cypress.Commands.add(
  'fiCreateSymptomRecord',
  (petId: number, overrides: Record<string, unknown> = {}) => {
  const suffix = uniqueSuffix();
  const payload = {
    pet_id: petId,
    note: `CY-FI-RECORD-${suffix}`,
    note_image: [],
    date_added: '2026-02-10',
    time_added: '09:15',
    ...overrides,
  };

  return cy.fiApi('POST', '/v1/symptom-records', payload).then((res) => {
    const body = res.body as any;
    const recordId = Number(body.record_id ?? body.data?.record_id);
    if (!Number.isFinite(recordId)) {
      throw new Error(`Unable to parse record_id from response: ${JSON.stringify(body)}`);
    }
    return { recordId, payload, body };
  });
  }
);

Cypress.Commands.add('fiRequireR2UploadReady', () => {
  return cy.task(
    'fi:r2Preflight',
    { frontendBaseUrl: getFrontendBaseUrl() },
    { timeout: 60000 }
  );
});

Cypress.Commands.add(
  'fiVisitAuthed',
  (
    path: string,
    visitOptions: { onBeforeLoad?: (win: Window) => void; [key: string]: any } = {}
  ) => {
  const visitWithToken = (token: string) => {
    const options = {
      ...visitOptions,
      onBeforeLoad(win: Window) {
        win.localStorage.setItem('auth_token', token);
        visitOptions.onBeforeLoad?.(win);
      },
    };
    return cy.visit(path, options);
  };

  return cy
    .fiEnsureBackendReady()
    .then(() => cy.fiGetAuthToken())
    .then((token) => visitWithToken(String(token)));
  }
);

export {};
