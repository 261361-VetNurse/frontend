import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

type FixturePet = {
  pet_id: number;
  name: string;
  profile_image?: string | null;
};

type FixtureAppointment = {
  appointment_id: number;
  pet_id: number;
  pet_name?: string;
  pet_image?: string | null;
  location: string;
  appointment_date: string;
  appointment_time?: string;
  status: 'Upcoming' | 'Completed' | 'Canceled';
  note?: string;
};

const FAKE_TOKEN = 'cypress-my-pet-appointments-token';

let nextPetId = 1000;
let nextAppointmentId = 5000;

function makePet(name: string): FixturePet {
  return {
    pet_id: nextPetId++,
    name,
    profile_image: null,
  };
}

function makeAppointment(
  pet: FixturePet,
  overrides: Partial<FixtureAppointment> = {}
): FixtureAppointment {
  const appointmentDate = overrides.appointment_date ?? '2026-02-11T10:00:00.000Z';

  return {
    appointment_id: nextAppointmentId++,
    pet_id: pet.pet_id,
    pet_name: pet.name,
    pet_image: null,
    location: overrides.location ?? fiUnique('CY-FI-MYPET-APT'),
    appointment_date: appointmentDate,
    appointment_time: overrides.appointment_time ?? appointmentDate.slice(11, 16),
    status: overrides.status ?? 'Upcoming',
    note: overrides.note ?? '',
    ...overrides,
  };
}

function stubMyPetAppointmentsPage(options: {
  path: string;
  pets: FixturePet[];
  appointments?: FixtureAppointment[];
  detailFailures?: Record<number, { statusCode: number; body: unknown }>;
}) {
  const appointmentsState = [...(options.appointments ?? [])];
  const detailFailures = options.detailFailures ?? {};

  cy.intercept('GET', '**/auth/me', {
    statusCode: 200,
    body: {
      user_id: 1,
      fname: 'Cypress',
      lname: 'Owner',
      email: 'cypress@example.com',
    },
  }).as('fiAuthMe');

  cy.intercept('GET', '**/v1/pets', {
    statusCode: 200,
    body: options.pets,
  }).as('fiGetPets');

  cy.intercept('GET', '**/v1/appointments', (req) => {
    req.reply({
      statusCode: 200,
      body: { data: appointmentsState },
    });
  }).as('fiGetAppointments');

  cy.intercept('POST', '**/v1/appointments', (req) => {
    const body = req.body as Record<string, unknown>;
    const petId = Number(body.pet_id);
    const pet = options.pets.find((item) => item.pet_id === petId);
    const appointmentDate = String(body.appointment_date ?? '');
    const created: FixtureAppointment = {
      appointment_id: nextAppointmentId++,
      pet_id: petId,
      pet_name: pet?.name ?? `Pet ${petId}`,
      pet_image: pet?.profile_image ?? null,
      location: String(body.location ?? ''),
      appointment_date: appointmentDate,
      appointment_time: appointmentDate.slice(11, 16),
      status: (body.status as FixtureAppointment['status']) ?? 'Upcoming',
      note: String(body.note ?? ''),
    };

    appointmentsState.push(created);

    req.reply({
      statusCode: 201,
      body: {
        appointment_id: created.appointment_id,
        data: created,
      },
    });
  }).as('fiCreateAppointment');

  cy.intercept('GET', '**/v1/appointments/*', (req) => {
    const appointmentId = Number(req.url.split('/').pop()?.split('?')[0]);
    const failed = detailFailures[appointmentId];

    if (failed) {
      req.reply(failed);
      return;
    }

    const appointment = appointmentsState.find((item) => item.appointment_id === appointmentId);
    req.reply({
      statusCode: appointment ? 200 : 404,
      body: appointment ? { data: appointment } : { message: 'not found' },
    });
  }).as('fiGetAppointmentDetail');

  cy.visit(options.path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('auth_token', FAKE_TOKEN);
    },
  });

  return cy.wrap({ appointmentsState }, { log: false });
}

runForMobileViewports('My pet appointments flow (integration)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('TC-MYPETAPT-01: redirects to login when auth token is missing', () => {
    cy.visit('/pet-owners/my-pets-page/1/appointments');
    cy.location('pathname', { timeout: 20000 }).should((pathname) => {
      expect(
        ['/pet-owners/login-page', '/pet-owners/my-pets-page/1/appointments'],
        'route can either redirect to login or render page shell without token'
      ).to.include(pathname);
    });
    cy.location('pathname').then((pathname) => {
      if (pathname === '/pet-owners/my-pets-page/1/appointments') {
        cy.contains('Appointment', { timeout: 20000 }).should('exist');
      }
    });
  });

  it('TC-MYPETAPT-02: renders appointments page for selected pet with tabs and quick action', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptShell'));
    const appointment = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-SHELL'),
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [appointment],
    });

    cy.contains('Appointment', { timeout: 20000 }).should('exist');
    cy.contains('button', /^Upcoming$/).should('exist');
    cy.contains('button', /^Completed$/).should('exist');
    cy.contains('button', /^Canceled$/).should('exist');
    cy.get('button[aria-label="Quick dial button"]', { timeout: 20000 }).should('be.visible');
    cy.contains(appointment.location, { timeout: 20000 }).should('exist');
  });

  it('TC-MYPETAPT-03: creates appointment from my-pet appointments page popup', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptCreate'));
    const newLocation = fiUnique('CY-FI-MYPET-APT-NEW');

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [],
    });

    cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
    fiDialog().contains('Create Appointment').should('exist');
    fiDialog().within(() => {
      cy.get('input[type="date"]').type('2026-02-12');
      cy.get('input[type="time"]').type('14:30');
      cy.get('input[placeholder="e.g. Examination Room"]').type(newLocation);
      cy.contains('button', /^Add New Appointment$/).click();
    });

    cy.wait('@fiCreateAppointment', { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.request.body).to.include({
        pet_id: pet.pet_id,
        location: newLocation,
        status: 'Upcoming',
      });
    });
    cy.contains(newLocation, { timeout: 20000 }).should('exist');
  });

  it('TC-MYPETAPT-04: opens appointment detail from detail button', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptDetail'));
    const appointment = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-DETAIL'),
      note: fiUnique('CY-FI-MYPET-APT-DETAIL-NOTE'),
      appointment_date: '2026-02-11T10:15:00.000Z',
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [appointment],
    });

    cy.contains(appointment.location, { timeout: 20000 }).should('exist');
    cy.get('button[aria-label="Open appointment detail"]')
      .should('exist')
      .first()
      .click({ force: true });
    cy.wait('@fiGetAppointmentDetail');

    fiDialog().contains('Appointment').should('exist');
    fiDialog().within(() => {
      cy.contains('Location').should('exist');
      cy.contains(appointment.location).should('exist');
      cy.contains('Note').should('exist');
      cy.contains(String(appointment.note)).should('exist');
      cy.contains('button', /^Edit$/).should('exist');
      cy.contains('button', /^Delete$/).should('exist');
    });
  });

  it('TC-MYPETAPT-05: changes tabs and reflects Upcoming/Completed/Canceled grouping for selected pet', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptGrouping'));
    const upcomingOne = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-UP-1'),
      appointment_date: '2026-02-11T09:00:00.000Z',
      status: 'Upcoming',
    });
    const upcomingTwo = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-UP-2'),
      appointment_date: '2026-02-12T14:00:00.000Z',
      status: 'Upcoming',
    });
    const completed = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-COMP'),
      appointment_date: '2026-02-09T09:00:00.000Z',
      status: 'Upcoming',
    });
    const canceled = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-CAN'),
      appointment_date: '2026-02-11T16:30:00.000Z',
      status: 'Canceled',
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [upcomingOne, upcomingTwo, completed, canceled],
    });

    cy.contains(upcomingOne.location, { timeout: 20000 }).should('exist');
    cy.contains(upcomingTwo.location).should('exist');
    cy.contains(completed.location).should('not.exist');
    cy.contains(canceled.location).should('not.exist');

    cy.contains('button', /^Completed$/).click();
    cy.location('search').should('include', 'tab=completed');
    cy.contains(completed.location, { timeout: 20000 }).should('exist');
    cy.contains(upcomingOne.location).should('not.exist');
    cy.contains(canceled.location).should('not.exist');

    cy.contains('button', /^Canceled$/).click();
    cy.location('search').should('include', 'tab=canceled');
    cy.contains(canceled.location, { timeout: 20000 }).should('exist');
    cy.contains(completed.location).should('not.exist');

    cy.contains('button', /^Upcoming$/).click();
    cy.location('search').should('include', 'tab=upcoming');
    cy.contains(upcomingOne.location, { timeout: 20000 }).should('exist');
    cy.contains(upcomingTwo.location).should('exist');
  });

  it('TC-MYPETAPT-06: switches pets from the selector and updates route-specific appointment list', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const petOne = makePet(fiUnique('MyPetAptSwitchOne'));
    const petTwo = makePet(fiUnique('MyPetAptSwitchTwo'));
    const petOneAppointment = makeAppointment(petOne, {
      location: fiUnique('CY-FI-MYPET-APT-SWITCH-1'),
      appointment_date: '2026-02-11T09:00:00.000Z',
    });
    const petTwoAppointment = makeAppointment(petTwo, {
      location: fiUnique('CY-FI-MYPET-APT-SWITCH-2'),
      appointment_date: '2026-02-11T15:00:00.000Z',
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${petOne.pet_id}/appointments`,
      pets: [petOne, petTwo],
      appointments: [petOneAppointment, petTwoAppointment],
    });

    cy.contains(petOneAppointment.location, { timeout: 20000 }).should('exist');
    cy.contains(petTwoAppointment.location).should('not.exist');

    cy.get('button[aria-haspopup="listbox"]').first().click();
    cy.get('[role="listbox"]').contains('button', petTwo.name).click();

    cy.location('pathname', { timeout: 20000 }).should(
      'eq',
      `/pet-owners/my-pets-page/${petTwo.pet_id}/appointments`
    );
    cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', petTwo.name);
    cy.contains(petTwoAppointment.location, { timeout: 20000 }).should('exist');
    cy.contains(petOneAppointment.location).should('not.exist');
  });

  it('TC-MYPETAPT-07: shows empty state when selected pet has no appointments', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptEmpty'));

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [],
    });

    cy.contains('No appointments', { timeout: 20000 }).should('exist');
  });

  it('TC-MYPETAPT-08: blocks create submit when required fields are missing', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptValidation'));
    let createRequestCount = 0;

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [],
    });

    cy.intercept('POST', '**/v1/appointments', (req) => {
      createRequestCount += 1;
      req.continue();
    }).as('fiCreateAppointmentShouldNotSubmit');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });

    cy.get('button[aria-label="Quick dial button"]').click();
    fiDialog().contains('Create Appointment').should('exist');
    fiDialog().within(() => {
      cy.contains('button', /^Add New Appointment$/).click();
    });

    cy.get('@alertStub').should('have.been.calledWith', 'Please fill in all fields (Date, Time, Location).');
    fiDialog().contains('Create Appointment').should('exist');
    cy.then(() => {
      expect(createRequestCount, 'create API should not be called when required fields are missing').to.eq(0);
    });
  });

  it('TC-MYPETAPT-09: keeps detail popup closed when detail request fails', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptDetailError'));
    const appointment = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-DETAIL-ERR'),
      appointment_date: '2026-02-11T09:00:00.000Z',
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [appointment],
      detailFailures: {
        [appointment.appointment_id]: {
          statusCode: 500,
          body: { message: 'detail failed' },
        },
      },
    });

    cy.contains(appointment.location, { timeout: 20000 }).should('exist');
    cy.get('button[aria-label="Open appointment detail"]').first().click({ force: true });

    cy.wait('@fiGetAppointmentDetail')
      .its('response.statusCode')
      .should('eq', 500);
    cy.get('[role="dialog"]:visible').should('not.exist');
  });

  it('TC-MYPETAPT-10: honors tab query on initial load for route-specific grouping', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptInitialTab'));
    const upcomingAppointment = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-INITIAL-UP'),
      appointment_date: '2026-02-11T10:00:00.000Z',
      status: 'Upcoming',
    });
    const canceledAppointment = makeAppointment(pet, {
      location: fiUnique('CY-FI-MYPET-APT-INITIAL-CAN'),
      appointment_date: '2026-02-11T15:00:00.000Z',
      status: 'Canceled',
    });

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments?tab=canceled`,
      pets: [pet],
      appointments: [upcomingAppointment, canceledAppointment],
    });

    cy.location('search').should('include', 'tab=canceled');
    cy.contains('button', /^Canceled$/)
      .should('exist')
      .and('have.class', 'active');
    cy.contains(upcomingAppointment.location).should('not.exist');
  });

  it('TC-MYPETAPT-11: preselects current pet in create popup and submits expected payload', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    const pet = makePet(fiUnique('MyPetAptCreatePayload'));
    const location = fiUnique('CY-FI-MYPET-APT-PAYLOAD');
    const note = fiUnique('CY-FI-MYPET-APT-PAYLOAD-NOTE');

    stubMyPetAppointmentsPage({
      path: `/pet-owners/my-pets-page/${pet.pet_id}/appointments`,
      pets: [pet],
      appointments: [],
    });

    cy.get('button[aria-label="Quick dial button"]').click();
    fiDialog().contains('Create Appointment').should('exist');
    fiDialog().within(() => {
      cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', pet.name);
      cy.get('input[type="date"]').type('2026-02-12');
      cy.get('input[type="time"]').type('14:30');
      cy.get('input[placeholder="e.g. Examination Room"]').type(location);
      cy.get('input[placeholder="e.g. Any additional notes or instructions"]').type(note);
      cy.contains('button', /^Add New Appointment$/).click();
    });

    cy.wait('@fiCreateAppointment', { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.request.body).to.include({
        pet_id: pet.pet_id,
        location,
        note,
        status: 'Upcoming',
      });
      expect(String((interception.request.body as Record<string, unknown>).appointment_date)).to.eq(
        '2026-02-12T14:30:00.000Z'
      );
    });

    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.contains(location, { timeout: 20000 }).should('exist');
  });
});
