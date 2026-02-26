import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Calendar record flow (integration)', () => {
  it('renders record tab and creates record from popup with seeded pet', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const calPetName = fiUnique('CalPet');
    cy.fiCreatePet({ name: calPetName }).then(() => {
      const note = fiUnique('CY-FI-CAL-REC');
      cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record');
      cy.contains('Record', { timeout: 20000 }).should('exist');

      cy.get('button[aria-label="Quick dial button"]:visible').first().click();
      fiDialog().contains('Create Symptom Record').should('exist');
      fiDialog().within(() => {
        cy.get('button[aria-haspopup="listbox"]').first().click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.contains('button', calPetName).click();
        cy.get('input[type="date"]').clear().type('2026-02-10');
        cy.get('input[type="time"]').type('12:30');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(note);
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(note, { timeout: 20000 }).should('exist');
    });
  });
});
