import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique } from './helpers';
import type { Pet } from '../../../src/types/domain/pet';

function clearMyPets() {
  return cy.fiGetMyPets().then((pets: Pet[]) => {
    if (!pets.length) return cy.wrap(null, { log: false });

    pets.forEach((pet) => {
      cy
          .fiApi('DELETE', `/v1/pets/${pet.pet_id}`, undefined, { failOnStatusCode: false })
          .its('status')
          .should('be.oneOf', [200, 204, 404]);
    });

    return cy.wrap(null, { log: false });
  });
}

runForMobileViewports('My pets flow (integration)', () => {
  it('redirects to login page when auth token is missing', () => {
    cy.visit('/pet-owners/my-pets-page');
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/login-page');
  });

  it('renders owner card and pets list when authenticated with seeded pet', () => {
    const petName = fiUnique('CY-FI-LIST');
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: petName, species: 'Cat', gender: 'female', breed: 'Persian' });

    cy.fiVisitAuthed('/pet-owners/my-pets-page');
    cy.contains('My Pets', { timeout: 20000 }).should('be.visible');
    cy.contains('All Pets').should('exist');
    cy.contains('In Medical').should('exist');
    cy.contains(petName, { timeout: 20000 }).should('exist');
    cy.contains('New Pet').should('exist');
  });

  it('renders empty state when authenticated owner has no pets', () => {
    cy.fiEnsureOwnerProfile();
    clearMyPets();

    cy.fiVisitAuthed('/pet-owners/my-pets-page');
    cy.contains('No pets yet. Click "New Pet" to add one.', { timeout: 20000 }).should('be.visible');
  });

  it('shows correct All Pets and In Medical counts for seeded pets', () => {
    const healthyPet = fiUnique('CY-FI-COUNT-HEALTHY');
    const medicalPet = fiUnique('CY-FI-COUNT-MEDICAL');

    cy.fiEnsureOwnerProfile();
    clearMyPets();
    cy.fiCreatePet({
      name: healthyPet,
      species: 'Dog',
      gender: 'male',
      breed: 'Beagle',
      in_medical: false,
    });
    cy.fiCreatePet({
      name: medicalPet,
      species: 'Cat',
      gender: 'female',
      breed: 'Persian',
      in_medical: true,
    });

    cy.fiVisitAuthed('/pet-owners/my-pets-page');
    cy.contains(healthyPet, { timeout: 20000 }).should('exist');
    cy.contains(medicalPet, { timeout: 20000 }).should('exist');
    cy.contains('All Pets').parent().should('contain.text', '2');
    cy.contains('In Medical').parent().should('contain.text', '1');
  });

  it('opens owner page, pet detail, and add-new-pet from my pets page', () => {
    const petName = fiUnique('CY-FI-NAV');

    cy.fiEnsureOwnerProfile();
    clearMyPets();
    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      cy.fiVisitAuthed('/pet-owners/my-pets-page');

      cy.contains(/^ID:/).closest('div[class*="rounded-2xl"]').click();
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/owner-info-page');

      cy.go('back');
      cy.contains(petName, { timeout: 20000 }).click();
      cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);

      cy.go('back');
      cy.contains('New Pet').parent().find('button').click();
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page/add-new-pet');
    });
  });

  it('shows pets list error and recovers on retry', () => {
    const petName = fiUnique('CY-FI-RETRY');
    let getPetsCallCount = 0;

    cy.fiEnsureOwnerProfile();
    clearMyPets();
    cy.fiCreatePet({ name: petName }).then(() => {
      cy.intercept('GET', '**/v1/pets', (req) => {
        getPetsCallCount += 1;
        if (getPetsCallCount === 1) {
          req.reply({
            statusCode: 500,
            body: { detail: 'forced my pets failure before retry' },
          });
          return;
        }

        req.continue();
      }).as('fiGetPetsRetry');

      cy.fiVisitAuthed('/pet-owners/my-pets-page');
      cy.wait('@fiGetPetsRetry', { timeout: 30000 })
        .its('response.statusCode')
        .should('eq', 500);

      cy.contains('Could not load pets list', { timeout: 20000 }).should('be.visible');
      cy.contains(/Tap to retry/i, { timeout: 20000 }).should('be.visible').click();

      cy.wait('@fiGetPetsRetry', { timeout: 30000 })
        .its('response.statusCode')
        .should('eq', 200);
      cy.contains('Could not load pets list').should('not.exist');
      cy.contains(petName, { timeout: 20000 }).should('exist');
    });
  });
});
