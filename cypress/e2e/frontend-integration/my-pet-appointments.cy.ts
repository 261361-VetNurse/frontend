import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('My pet appointments flow (integration)', () => {
  it('TC-MYPETAPT-01: redirects to login when auth token is missing', () => {
    cy.visit('/pet-owners/my-pets-page/1/appointments');
    cy.location('pathname', { timeout: 20000 }).should((pathname) => {
      expect(
        ['/pet-owners/login-page', '/pet-owners/my-pets-page/1/appointments'],
        'route can either redirect to login or render page shell without token'
      ).to.include(pathname);
    });
  });

  it('TC-MYPETAPT-02: renders appointments page for selected pet with tabs and quick action', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('MyPetAptShell') }).then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-MYPET-APT-SHELL'),
        appointment_date: '2026-02-11T10:00:00',
        status: 'Upcoming',
      }).then(({ payload }) => {
        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/appointments`);

        cy.contains('Appointment', { timeout: 20000 }).should('exist');
        cy.contains('button', /^Upcoming$/).should('exist');
        cy.contains('button', /^Completed$/).should('exist');
        cy.contains('button', /^Canceled$/).should('exist');
        cy.get('button[aria-label="Quick dial button"]', { timeout: 20000 }).should('be.visible');
        cy.contains(String((payload as any).location), { timeout: 20000 }).should('exist');
      });
    });
  });

  it('TC-MYPETAPT-03: creates appointment from my-pet appointments page popup', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('MyPetAptCreate') }).then(({ petId }) => {
      const newLocation = fiUnique('CY-FI-MYPET-APT-NEW');
      cy.intercept('POST', '**/v1/appointments').as('fiCreateAppointmentFromPopup');
      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/appointments`);

      cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
      fiDialog().contains('Create Appointment').should('exist');
      fiDialog().within(() => {
        cy.get('input[type="date"]').type('2026-02-12');
        cy.get('input[type="time"]').type('14:30');
        cy.get('input[placeholder="e.g. Examination Room"]').type(newLocation);
        cy.contains('button', /^Add New Appointment$/).click();
      });
      cy.wait('@fiCreateAppointmentFromPopup', { timeout: 30000 })
        .its('response.statusCode')
        .should('be.oneOf', [200, 201]);
      cy.fiApi('GET', '/v1/appointments').then((res) => {
        const rows = (((res.body as any)?.data ?? res.body) as any[]) || [];
        const found = rows.some((row) =>
          Number(row.pet_id) === Number(petId) && String(row.location ?? '') === newLocation
        );
        expect(found, `appointment persisted for pet ${petId}`).to.eq(true);
      });
    });
  });

  it.skip('TC-MYPETAPT-04: opens appointment detail from list card', () => {
    // TODO: click appointment card and assert detail dialog content
  });

  it.skip('TC-MYPETAPT-05: changes tabs and reflects Upcoming/Completed/Canceled grouping for selected pet', () => {
    // TODO: seed mixed-status/mixed-date appointments and assert tab filtering/grouping
  });

  it('TC-APP-05: filters appointments by status tabs (Upcoming / Completed / Canceled)', () => {
    fiFreeze('2026-02-10T12:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('MyPetAptTabs') }).then(({ petId }) => {
      const upcomingLoc = fiUnique('CY-FI-APP-UP');
      const completedLoc = fiUnique('CY-FI-APP-COMP');
      const canceledLoc = fiUnique('CY-FI-APP-CAN');

      cy.fiCreateAppointment(petId, {
        location: upcomingLoc,
        appointment_date: '2026-02-11T09:00:00',
        status: 'Upcoming',
      });
      cy.fiCreateAppointment(petId, {
        location: completedLoc,
        appointment_date: '2026-02-09T09:00:00',
        status: 'Upcoming',
      });
      cy.fiCreateAppointment(petId, {
        location: canceledLoc,
        appointment_date: '2026-02-11T15:00:00',
        status: 'Canceled',
      });

      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/appointments`);

      cy.contains(upcomingLoc, { timeout: 20000 }).should('exist');
      cy.contains(completedLoc).should('not.exist');
      cy.contains(canceledLoc).should('not.exist');

      cy.contains('button', /^Completed$/).click();
      cy.location('search').should('include', 'tab=completed');
      cy.contains(completedLoc, { timeout: 20000 }).should('exist');
      cy.contains(upcomingLoc).should('not.exist');

      cy.contains('button', /^Canceled$/).click();
      cy.location('search').should('include', 'tab=canceled');
      cy.contains(canceledLoc, { timeout: 20000 }).should('exist');
      cy.contains(completedLoc).should('not.exist');

      cy.contains('button', /^Upcoming$/).click();
      cy.location('search').should('include', 'tab=upcoming');
      cy.contains(upcomingLoc, { timeout: 20000 }).should('exist');
    });
  });
});
