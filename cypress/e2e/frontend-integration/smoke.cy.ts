import { runForMobileViewports } from '../../support/mobileViewports';

runForMobileViewports('Smoke', () => {
  describe('app smoke', () => {
    it('root route redirects to pet owner login page', () => {
      cy.visit('/');
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/login-page');
    });

    it('renders test upload page shell without starting upload', () => {
      cy.visit('/test-upload');
      cy.contains('Test Image Upload (R2)', { timeout: 20000 }).should('exist');
      cy.contains('Target Folder').should('exist');
      cy.get('select').should('exist');
      cy.contains('Upload Component').should('exist');
    });
  });
});
