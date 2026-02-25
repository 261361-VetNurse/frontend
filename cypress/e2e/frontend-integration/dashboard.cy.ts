import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Dashboard flow (integration)', () => {
  it('renders dashboard sections and opens reminder + appointment dialogs with real data', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const dashPetName = fiUnique('DashPet');
    cy.fiCreatePet({ name: dashPetName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: fiUnique('CY-FI-DASH-MED'),
        reminder_time: ['09:00'],
        start_date: '2026-02-01T00:00:00',
        end_date: '2026-02-28T00:00:00',
      }).then(({ payload: medPayload }) => {
        cy.fiCreateAppointment(petId, {
          location: fiUnique('CY-FI-DASH-APT'),
          appointment_date: '2026-02-12T11:00:00',
        }).then(({ payload: apptPayload }) => {
          cy.fiVisitAuthed('/pet-owners/home-page');
          cy.contains('My Pets', { timeout: 20000 }).should('exist');
          cy.contains('Reminder').should('exist');
          cy.contains('Upcoming appointments').should('exist');
          cy.contains(dashPetName).should('exist');

          cy.get('.reminder-box')
            .contains('[role="button"]', String((medPayload as any).name), { timeout: 20000 })
            .click();
          fiDialog().should('exist');
          fiDialog().contains('Medication Detail').should('exist');
          fiDialog().within(() => {
            cy.contains('button', /^Pending$/).click();
            cy.contains('button', /^Taken$/, { timeout: 20000 }).should('exist');
          });

          cy.get('body').type('{esc}');
          cy.get('[role="dialog"]:visible').should('not.exist');

          cy.get('.appoint-box')
            .contains(String((apptPayload as any).location), { timeout: 20000 })
            .click();
          fiDialog().should('exist');
          fiDialog().contains('Appointment Detail').should('exist');
        });
      });
    });
  });
});
