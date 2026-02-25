import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiClickButton } from './helpers';

runForMobileViewports('Pet flow (integration)', () => {
  describe('TC-PET-01..03: Add pet + validation + age display', () => {
    it('creates pet from UI and redirects to my pets page', () => {
      const petName = fiUnique('CY-FI-PET-UI');
      cy.fiEnsureOwnerProfile();

      cy.fiVisitAuthed('/pet-owners/my-pets-page/add-new-pet');
      cy.contains('button', /^Add New Pet$/).should('be.disabled');

      cy.get('input[placeholder="Mochi"]').type(petName);
      cy.get('input[placeholder="cat"]').type('cat');
      cy.get('input[placeholder="Scottish Fold"]').type('British Shorthair');
      cy.get('input[type="date"]').type('2023-01-01');
      cy.get('select').select('Female');
      cy.get('input[placeholder="e.g. 4.5"]').type('4.2');

      cy.contains('button', /^Add New Pet$/).should('not.be.disabled').click();
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page');
      cy.contains(petName, { timeout: 20000 }).should('exist');
    });

    it('shows age calculation and keeps submit disabled while required fields missing', () => {
      fiFreeze('2026-02-05T12:00:00Z');
      cy.fiVisitAuthed('/pet-owners/my-pets-page/add-new-pet');

      cy.get('input[type="date"]').type('2023-01-01');
      cy.contains('label', 'Age').next('div').should('have.text', '3y 1m');

      cy.get('input[placeholder="Mochi"]').type(fiUnique('CY-FI-VAL'));
      cy.get('input[placeholder="cat"]').type('cat');
      cy.get('input[placeholder="Scottish Fold"]').type('Persian');
      cy.contains('button', /^Add New Pet$/).should('be.disabled');
    });
  });

  describe('TC-PET-04..06: Detail / edit / delete', () => {
    it('shows pet detail page for seeded pet', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-DETAIL') }).then(({ petId, detail }) => {
        const petName = String((detail as any).name ?? (detail as any).data?.name ?? '');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.contains('Pets Information', { timeout: 20000 }).should('exist');
        cy.contains('Basic Information').should('exist');
        if (petName) cy.contains(petName).should('exist');
        cy.contains('button', /^Edit$/).should('exist');
        cy.contains('button', /^Delete$/).should('exist');
      });
    });

    it('edits pet via UI and persists the change', () => {
      const updatedName = fiUnique('CY-FI-PET-UPDATED');
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet().then(({ petId }) => {
        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/edit`);
        cy.contains('label', /^Name$/).parent().find('input').first().clear();
        cy.contains('label', /^Name$/).parent().find('input').first().type(updatedName);
        fiClickButton(/^Update$/);

        cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);
        cy.contains(updatedName, { timeout: 20000 }).should('exist');
      });
    });

    it('deletes pet from detail page and returns to my pets page', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-PET-DELETE') }).then(({ petId, payload }) => {
        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);

        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });

        fiClickButton(/^Delete$/);
        cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page');
        cy.contains(String((payload as any).name)).should('not.exist');
      });
    });
  });
});
