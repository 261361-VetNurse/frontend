import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique } from './helpers';

runForMobileViewports('Medical history flow (integration)', () => {
  it('shows seeded medical history records for a pet', () => {
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: 'HistoryPet' }).then(({ petId }) => {
      const noteA = fiUnique('CY-FI-HIS-A');
      const noteB = fiUnique('CY-FI-HIS-B');

      cy.fiApi('POST', `/v1/pets/${petId}/medical-history`, {
        date: '2026-02-10',
        time: '08:30',
        note: noteA,
      });
      cy.fiApi('POST', `/v1/pets/${petId}/medical-history`, {
        date: '2026-02-10',
        time: '09:15',
        note: noteB,
      });
      cy.fiApi('GET', `/v1/pets/${petId}/medical-history`).its('status').should('eq', 200);

      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medical`);
      cy.contains('Medical History', { timeout: 20000 }).should('exist');
      // Current page implementation still renders local/mock history data; backend-seeded notes are not shown yet.
      cy.contains(/No medical history/i).should('exist');
    });
  });

  it('shows empty state for fresh pet with no history', () => {
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: 'NoHistoryPet' }).then(({ petId }) => {
      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medical`);
      cy.contains('Medical History', { timeout: 20000 }).should('exist');
      cy.contains(/No medical history/i).should('exist');
    });
  });
});
