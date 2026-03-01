import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

type JsonMap = Record<string, unknown>;

const dashboardEndpoint = '**/v1/dashboard/home';
const medicationDetailEndpoint = '**/v1/medications/*';
const medicationTakenEndpoint = '**/v1/medications/*/taken';
const appointmentDetailEndpoint = '**/v1/appointments/*';

const dashboardResponse = (overrides: Partial<JsonMap> = {}) => ({
  success: true,
  data: {
    fname: 'Cypress',
    lname: 'Owner',
    profile_image: null,
    pets: [],
    medicines_notifications: [],
    appointments: [],
    ...overrides,
  },
});

const dashboardNotification = (overrides: Partial<JsonMap> = {}) => ({
  _id: '9001',
  notification_id: 9001,
  title: 'Medication reminder',
  medicine_id: '7001',
  medicine_name: 'Dashboard Medicine',
  dosage: '1 tablet',
  frequency: '-1',
  reminder_time: ['09:00'],
  time_per_day: 1,
  pet_id: '5001',
  pet_name: 'Dashboard Pet',
  pet_image: null,
  notification_at: '2026-02-10T09:00:00Z',
  time: '09:00',
  status: 'pending',
  istaken: false,
  taken_at: '',
  ...overrides,
});

const dashboardAppointment = (overrides: Partial<JsonMap> = {}) => ({
  _id: '8001',
  appointment_id: 8001,
  pet_id: '5001',
  pet_name: 'Dashboard Pet',
  pet_image: null,
  location: 'Dashboard Clinic',
  appointment_date: '2026-02-10T11:00:00Z',
  appointment_time: '11:00',
  status: 'Upcoming',
  notification_status: 'scheduled',
  note: 'Dashboard appointment note',
  ...overrides,
});

const visitDashboard = (path = '/pet-owners/home-page') => {
  cy.fiVisitAuthed(path);
  cy.contains('My Pets', { timeout: 20000 }).should('exist');
};

const getQueryParam = (name: string) =>
  cy.location('search').then((search) => new URLSearchParams(search).get(name));

runForMobileViewports('Dashboard flow (integration)', () => {
  it('renders dashboard sections, toggles reminder via API, and opens appointment detail', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const dashPetName = fiUnique('DashPet');
    const medName = fiUnique('CY-FI-DASH-MED');
    const appointmentLocation = fiUnique('CY-FI-DASH-APT');
    const reminderId = 9001;
    const appointmentId = 8001;
    const reminderRow = dashboardNotification({
      _id: String(reminderId),
      notification_id: reminderId,
      medicine_name: medName,
      pet_name: dashPetName,
      notification_at: '2026-02-10T09:00:00Z',
      time: '09:00',
      status: 'pending',
      istaken: false,
    });
    const appointmentRow = dashboardAppointment({
      _id: String(appointmentId),
      appointment_id: appointmentId,
      pet_name: dashPetName,
      location: appointmentLocation,
      appointment_date: '2026-02-10T11:00:00Z',
    });

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: dashPetName, profile_image: null }],
        medicines_notifications: [reminderRow],
        appointments: [appointmentRow],
      }),
    }).as('fiDashboardHome');
    cy.intercept('GET', medicationDetailEndpoint, {
      statusCode: 200,
      body: { success: true, data: reminderRow },
    }).as('fiDashboardMedicationDetail');
    cy.intercept('PATCH', medicationTakenEndpoint, {
      statusCode: 200,
      body: { success: true },
    }).as('fiDashboardToggleReminder');
    cy.intercept('GET', appointmentDetailEndpoint, {
      statusCode: 200,
      body: { success: true, data: appointmentRow },
    }).as('fiDashboardAppointmentDetail');

    visitDashboard();
    cy.wait('@fiDashboardHome');
    cy.contains('Reminder').should('exist');
    cy.contains('Upcoming appointments').should('exist');
    cy.contains(dashPetName).should('exist');

    cy.get('.reminder-box')
      .contains('[role="button"]', medName, { timeout: 20000 })
      .click();

    cy.wait('@fiDashboardMedicationDetail', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    fiDialog().contains('Medication Detail').should('exist');
    cy.location('search').should('include', 'popup=view-medication');
    getQueryParam('noti_id').then((notiId) => {
      expect(notiId, 'dashboard reminder query param').to.eq(String(reminderId));
    });

    fiDialog().within(() => {
      cy.contains('button', /^Pending$/).click();
    });
    cy.wait('@fiDashboardToggleReminder', { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
    fiDialog().within(() => {
      cy.contains('button', /^Taken$/).should('exist');
    });

    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.location('search').should('not.include', 'popup=');

    cy.get('.appoint-box').contains(appointmentLocation, { timeout: 20000 }).click();
    cy.wait('@fiDashboardAppointmentDetail', { timeout: 30000 }).then((interception) => {
      const url = String(interception.request.url);
      expect(url).to.include(`/v1/appointments/${appointmentId}`);
      expect(interception.response?.statusCode).to.eq(200);
    });
    fiDialog().contains('Appointment Detail').should('exist');
    fiDialog().within(() => {
      cy.contains('Location').should('exist');
      cy.contains(appointmentLocation).should('exist');
    });
  });

  it('supports medication and appointment deep links and clears query params when closed', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('DashDeepLinkPet');
    const medName = fiUnique('CY-FI-DASH-DEEP-MED');
    const appointmentLocation = fiUnique('CY-FI-DASH-DEEP-APT');
    const reminderId = 9101;
    const appointmentId = 8101;
    const reminderRow = dashboardNotification({
      _id: String(reminderId),
      notification_id: reminderId,
      medicine_name: medName,
      pet_name: petName,
      notification_at: '2026-02-10T09:00:00Z',
      time: '09:00',
    });
    const appointmentRow = dashboardAppointment({
      _id: String(appointmentId),
      appointment_id: appointmentId,
      pet_name: petName,
      location: appointmentLocation,
      appointment_date: '2026-02-10T11:30:00Z',
    });

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: petName, profile_image: null }],
        medicines_notifications: [reminderRow],
        appointments: [appointmentRow],
      }),
    }).as('fiDashboardDeepLinkHome');
    cy.intercept('GET', medicationDetailEndpoint, {
      statusCode: 200,
      body: { success: true, data: reminderRow },
    }).as('fiDashboardDeepLinkMedicationDetail');
    cy.intercept('GET', appointmentDetailEndpoint, {
      statusCode: 200,
      body: { success: true, data: appointmentRow },
    }).as('fiDashboardDeepLinkAppointmentDetail');

    visitDashboard(`/pet-owners/home-page?popup=view-medication&noti_id=${reminderId}`);
    cy.wait('@fiDashboardDeepLinkHome');
    cy.wait('@fiDashboardDeepLinkMedicationDetail');
    fiDialog().contains('Medication Detail').should('exist');
    fiDialog().contains(medName).should('exist');
    cy.location('search').should('include', `noti_id=${reminderId}`);
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.location('search').should('not.include', 'popup=');
    cy.location('search').should('not.include', 'noti_id=');

    visitDashboard(
      `/pet-owners/home-page?popup=view-appointment&appointment_id=${appointmentId}`
    );
    cy.wait('@fiDashboardDeepLinkHome');
    cy.wait('@fiDashboardDeepLinkAppointmentDetail');
    fiDialog().contains('Appointment Detail').should('exist');
    fiDialog().contains(appointmentLocation).should('exist');
    cy.location('search').should('include', `appointment_id=${appointmentId}`);
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.location('search').should('not.include', 'popup=');
    cy.location('search').should('not.include', 'appointment_id=');
  });

  it('renders missed reminder accordion and fallback copy when only missed reminders remain', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: 'Missed Reminder Pet', profile_image: null }],
        medicines_notifications: [
          dashboardNotification({
            _id: '9101',
            notification_id: 9101,
            medicine_id: '7101',
            medicine_name: 'Missed Reminder Med',
            notification_at: '2026-02-10T08:00:00Z',
            time: '08:00',
            istaken: false,
          }),
        ],
      }),
    }).as('fiDashboardMissedState');

    visitDashboard();
    cy.wait('@fiDashboardMissedState');
    cy.contains(/You have 1 missing reminder/i, { timeout: 20000 }).should('exist');
    cy.contains('No other upcoming reminders today.').should('exist');
    cy.contains('Missed Reminder Med').should('not.exist');
    cy.contains(/You have 1 missing reminder/i).click();
    cy.get('.reminder-box').contains('Missed Reminder Med').should('exist');
  });

  it('shows only the first three upcoming appointments and excludes non-upcoming rows', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: 'Appointment Pet', profile_image: null }],
        appointments: [
          dashboardAppointment({ _id: '8201', appointment_id: 8201, location: 'Upcoming One' }),
          dashboardAppointment({ _id: '8202', appointment_id: 8202, location: 'Upcoming Two', appointment_date: '2026-02-10T12:00:00Z' }),
          dashboardAppointment({ _id: '8203', appointment_id: 8203, location: 'Upcoming Three', appointment_date: '2026-02-10T13:00:00Z' }),
          dashboardAppointment({ _id: '8204', appointment_id: 8204, location: 'Upcoming Four', appointment_date: '2026-02-10T14:00:00Z' }),
          dashboardAppointment({ _id: '8205', appointment_id: 8205, location: 'Canceled Visit', status: 'Canceled', appointment_date: '2026-02-10T15:00:00Z' }),
        ],
      }),
    }).as('fiDashboardAppointmentSlice');

    visitDashboard();
    cy.wait('@fiDashboardAppointmentSlice');
    cy.get('.appoint-box').contains('Upcoming One').should('exist');
    cy.get('.appoint-box').contains('Upcoming Two').should('exist');
    cy.get('.appoint-box').contains('Upcoming Three').should('exist');
    cy.get('.appoint-box').contains('Upcoming Four').should('not.exist');
    cy.get('.appoint-box').contains('Canceled Visit').should('not.exist');
  });

  it('navigates through profile, help, and show-all dashboard entry points', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: 'Nav Pet', profile_image: null }],
      }),
    }).as('fiDashboardNav');

    visitDashboard();
    cy.wait('@fiDashboardNav');

    cy.get('.header-box a').first().click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/owner-info-page');

    visitDashboard();
    cy.contains('Hi! Cypress').should('exist');
    cy.get('.header-box svg').last().click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/help-center-page');

    visitDashboard();
    cy.get('.head-section .head-left').eq(0).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page');

    visitDashboard();
    cy.get('.head-section .head-left').eq(1).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/medication-page');

    visitDashboard();
    cy.get('.head-section .head-left').eq(2).click();
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/calendar-page');
    cy.location('search').should('include', 'tab=appointment');
  });

  it('shows reminder detail failure alert and keeps popup query params clean', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('DashFailPet');
    const medName = fiUnique('CY-FI-DASH-FAIL-MED');
    const reminderId = 9201;
    const reminderRow = dashboardNotification({
      _id: String(reminderId),
      notification_id: reminderId,
      medicine_name: medName,
      pet_name: petName,
      notification_at: '2026-02-10T09:00:00Z',
      time: '09:00',
    });

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: petName, profile_image: null }],
        medicines_notifications: [reminderRow],
      }),
    }).as('fiDashboardMedicationFailureHome');
    cy.intercept('GET', medicationDetailEndpoint, {
      statusCode: 500,
      body: { detail: 'forced medication detail failure' },
    }).as('fiDashboardMedicationDetailFailure');

    visitDashboard();
    cy.wait('@fiDashboardMedicationFailureHome');
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('fiDashboardMedicationAlert');
    });

    cy.get('.reminder-box')
      .contains('[role="button"]', medName, { timeout: 20000 })
      .click();

    cy.wait('@fiDashboardMedicationDetailFailure', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 500);
    cy.get('@fiDashboardMedicationAlert').should(
      'have.been.calledWith',
      'Failed to load medication details.'
    );
    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.location('search').should('not.include', 'popup=');
    cy.location('search').should('not.include', 'noti_id=');
  });

  it('keeps reminder status pending when the toggle API fails', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('DashToggleFailPet');
    const medName = fiUnique('CY-FI-DASH-TOGGLE-FAIL-MED');
    const reminderId = 9301;
    const reminderRow = dashboardNotification({
      _id: String(reminderId),
      notification_id: reminderId,
      medicine_name: medName,
      pet_name: petName,
      notification_at: '2026-02-10T09:00:00Z',
      time: '09:00',
      status: 'pending',
      istaken: false,
    });

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: petName, profile_image: null }],
        medicines_notifications: [reminderRow],
      }),
    }).as('fiDashboardToggleFailureHome');
    cy.intercept('GET', medicationDetailEndpoint, {
      statusCode: 200,
      body: { success: true, data: reminderRow },
    }).as('fiDashboardToggleMedicationDetail');
    cy.intercept('PATCH', medicationTakenEndpoint, {
      statusCode: 500,
      body: { detail: 'forced medication toggle failure' },
    }).as('fiDashboardToggleFailure');

    visitDashboard();
    cy.wait('@fiDashboardToggleFailureHome');
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('fiDashboardToggleAlert');
    });

    cy.get('.reminder-box')
      .contains('[role="button"]', medName, { timeout: 20000 })
      .click();

    cy.wait('@fiDashboardToggleMedicationDetail');
    fiDialog().contains('Medication Detail').should('exist');
    fiDialog().within(() => {
      cy.contains('button', /^Pending$/).click();
    });

    cy.wait('@fiDashboardToggleFailure', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 500);
    cy.get('@fiDashboardToggleAlert').should(
      'have.been.calledWith',
      'Failed to update status. Please try again.'
    );
    fiDialog().within(() => {
      cy.contains('button', /^Pending$/).should('exist');
      cy.contains('button', /^Taken$/).should('not.exist');
    });
  });

  it('shows appointment detail failure alert and keeps popup query params clean', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('DashFailAptPet');
    const appointmentLocation = fiUnique('CY-FI-DASH-FAIL-APT');
    const appointmentId = 8401;
    const appointmentRow = dashboardAppointment({
      _id: String(appointmentId),
      appointment_id: appointmentId,
      pet_name: petName,
      location: appointmentLocation,
      appointment_date: '2026-02-10T11:45:00Z',
    });

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse({
        pets: [{ pet_id: 5001, name: petName, profile_image: null }],
        appointments: [appointmentRow],
      }),
    }).as('fiDashboardAppointmentFailureHome');
    cy.intercept('GET', appointmentDetailEndpoint, {
      statusCode: 500,
      body: { detail: 'forced appointment detail failure' },
    }).as('fiDashboardAppointmentDetailFailure');

    visitDashboard();
    cy.wait('@fiDashboardAppointmentFailureHome');
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('fiDashboardAppointmentAlert');
    });

    cy.get('.appoint-box').contains(appointmentLocation, { timeout: 20000 }).click();

    cy.wait('@fiDashboardAppointmentDetailFailure', { timeout: 30000 }).then((interception) => {
      expect(interception.request.url).to.include(`/v1/appointments/${appointmentId}`);
      expect(interception.response?.statusCode).to.eq(500);
    });
    cy.get('@fiDashboardAppointmentAlert').then((alertStub) => {
      const stub = alertStub as unknown as sinon.SinonStub;
      const firstArg = String(stub.getCall(0).args[0] ?? '');
      expect(firstArg).to.include('Failed to load appointment details:');
      expect(firstArg).to.include(`(ID: ${appointmentId})`);
    });
    cy.get('[role="dialog"]:visible').should('not.exist');
    cy.location('search').should('not.include', 'popup=');
    cy.location('search').should('not.include', 'appointment_id=');
  });

  it('recovers from dashboard fetch failure on retry and opens pet section entry points', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('DashRetryPet');
    let dashboardCallCount = 0;

    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      cy.intercept('GET', dashboardEndpoint, (req) => {
        dashboardCallCount += 1;
        if (dashboardCallCount === 1) {
          req.reply({
            statusCode: 500,
            body: { detail: 'forced dashboard failure before retry' },
          });
          return;
        }

        req.continue();
      }).as('fiDashboardRetry');

      visitDashboard();
      cy.wait('@fiDashboardRetry', { timeout: 30000 })
        .its('response.statusCode')
        .should('eq', 500);

      cy.contains('Could not load pets', { timeout: 20000 }).should('exist');
      cy.contains('Could not load reminders').should('exist');
      cy.contains('Could not load appointments').should('exist');
      cy.contains(/Tap to retry/i, { timeout: 20000 }).first().click();

      cy.wait('@fiDashboardRetry', { timeout: 30000 })
        .its('response.statusCode')
        .should('eq', 200);
      cy.contains('Could not load pets').should('not.exist');
      cy.contains(petName, { timeout: 20000 }).should('exist');

      cy.get(`.mypet-section [aria-label="${petName}"]`).click();
      cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);

      visitDashboard();
      cy.contains('New Pet').parent().find('button').click();
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page/add-new-pet');
    });
  });

  it('renders empty and error dashboard states from forced responses', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 200,
      body: dashboardResponse(),
    }).as('fiDashboardEmpty');

    visitDashboard();
    cy.wait('@fiDashboardEmpty');
    cy.contains('No upcoming medication reminders.').should('exist');
    cy.contains('No upcoming appointments.').should('exist');

    cy.intercept('GET', dashboardEndpoint, {
      statusCode: 500,
      body: { detail: 'forced dashboard failure' },
    }).as('fiDashboardError');

    visitDashboard();
    cy.wait('@fiDashboardError');
    cy.contains('Could not load pets', { timeout: 20000 }).should('exist');
    cy.contains('Could not load reminders').should('exist');
    cy.contains('Could not load appointments').should('exist');
    cy.contains('Tap to retry').should('exist');
  });
});
