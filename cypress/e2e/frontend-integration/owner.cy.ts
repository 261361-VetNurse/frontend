import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique, fiClickButton } from './helpers';

runForMobileViewports('Owner flow (integration)', () => {
  it('registers owner profile with valid data and redirects to home', () => {
    const suffix = fiUnique('OWN').replace(/[^A-Za-z0-9-]/g, '');
    cy.fiVisitAuthed('/pet-owners/register-page');

    cy.get('#firstName').clear().type('Alice');
    cy.get('#lastName').clear().type('Smith');
    cy.get('#gender').select('female');
    cy.get('#phone').clear().type('0812345678');
    cy.get('#email').clear().type(`alice.${suffix}@example.com`);
    cy.get('#addressLine1').clear().type('123 Main St');
    cy.get('#subdistrict').clear().type('Suthep');
    cy.get('#district').clear().type('Mueang');
    cy.get('#province').clear().type('Chiang Mai');
    cy.get('#postalCode').clear().type('50200');

    fiClickButton(/^Register$/);
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/home-page');
  });

  it('shows registration validation errors for missing/invalid fields', () => {
    cy.visit('/pet-owners/register-page');
    cy.contains('button', /^Register$/).invoke('prop', 'disabled', false).click();
    cy.contains('First name is required').should('exist');
    cy.contains('Last name is required').should('exist');
    cy.contains('Please select gender').should('exist');

    cy.get('#firstName').type('Alice');
    cy.get('#lastName').type('Smith');
    cy.get('#gender').select('female');
    cy.get('#phone').type('0812345678');
    cy.get('#email').type('invalid-email');
    cy.get('#addressLine1').type('123 Main St');
    cy.get('#subdistrict').type('Suthep');
    cy.get('#district').type('Mueang');
    cy.get('#province').type('Chiang Mai');
    cy.get('#postalCode').type('50200');
    fiClickButton(/^Register$/);
    cy.contains('Please enter a valid email').should('exist');
  });

  it('edits owner profile and persists on revisit', () => {
    const firstName = fiUnique('Mina');
    cy.fiEnsureOwnerProfile();
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('#firstName').clear().type(firstName);
    cy.get('#lastName').clear().type('Kim');
    cy.get('#gender').select('female');
    cy.get('#phone').clear().type('0899999999');
    cy.get('#email').clear().type(`mina.${Date.now()}@example.com`);
    fiClickButton(/^Update$/);

    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains(String(firstName), { timeout: 20000 }).should('exist');
    cy.contains('Kim').should('exist');
  });

  it('uploads owner profile image with real presigned URL and R2 PUT', () => {
    cy.fiRequireR2UploadReady();
    cy.fiEnsureOwnerProfile();
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('input[type="file"]').selectFile('cypress/img-test/test-1.jpeg', { force: true });
    cy.get('img[alt="Profile"]', { timeout: 60000 }).should('be.visible');
    fiClickButton(/^Update$/);
    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains('Owner Information', { timeout: 20000 }).should('exist');
  });
});
