import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique } from './helpers';

runForMobileViewports('Notification flow (integration)', () => {
  it('renders unified notifications from real appointment + medication data', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: 'NotifyPet' }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: fiUnique('CY-FI-NOTI-MED'),
        reminder_time: ['09:05'],
        start_date: '2026-02-01T00:00:00',
        end_date: '2026-02-28T00:00:00',
      }).then(({ payload: medPayload }) => {
        cy.fiCreateAppointment(petId, {
          location: fiUnique('CY-FI-NOTI-APT'),
          appointment_date: '2026-02-10T09:10:00',
        }).then(({ payload: apptPayload }) => {
          cy.fiVisitAuthed('/pet-owners/notification-page');
          cy.contains(/Today|Upcoming/, { timeout: 20000 }).should('exist');
          cy.get('body').then(($body) => {
            if ($body.text().includes('Upcoming')) {
              cy.contains('button', /^Upcoming$/).click();
            }
          });
          cy.contains(String((medPayload as any).name), { timeout: 20000 }).should('exist');
          cy.contains(String((apptPayload as any).location), { timeout: 20000 }).should('exist');
        });
      });
    });
  });
});
