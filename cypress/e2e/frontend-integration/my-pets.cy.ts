import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique } from './helpers';

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
});
