import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique } from './helpers';

runForMobileViewports('Notification flow (integration)', () => {
  it('renders unified notifications from real appointment + medication data', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: 'NotifyPet' }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: fiUnique('CY-FI-NOTI-MED'),
        reminder_time: ['09:00'],
        start_date: '2026-02-01T00:00:00',
        end_date: '2026-02-28T00:00:00',
      });
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-NOTI-APT'),
        appointment_date: '2026-02-11T10:00:00',
      });

      cy.fiVisitAuthed('/pet-owners/notification-page');
      cy.contains('Today', { timeout: 20000 }).should('exist');
      cy.contains('NotifyPet', { timeout: 20000 }).should('exist');
      cy.contains(/Appointment|Medicine|Reminder/i).should('exist');
    });
  });
});
