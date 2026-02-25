import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique, fiClickButton } from './helpers';

function fiReplaceInput(selector: string, value: string) {
  cy.get(selector).should('be.visible').clear();
  cy.get(selector).should('be.visible').type(value);
}

runForMobileViewports('Owner flow (integration)', () => {
  it('registers owner profile with valid data and redirects to home', () => {
    const suffix = fiUnique('OWN').replace(/[^A-Za-z0-9-]/g, '');
    cy.fiVisitAuthed('/pet-owners/register-page');

    fiReplaceInput('#firstName', 'Alice');
    fiReplaceInput('#lastName', 'Smith');
    cy.get('#gender').select('female');
    fiReplaceInput('#phone', '0812345678');
    fiReplaceInput('#email', `alice.${suffix}@example.com`);
    fiReplaceInput('#addressLine1', '123 Main St');
    fiReplaceInput('#subdistrict', 'Suthep');
    fiReplaceInput('#district', 'Mueang');
    fiReplaceInput('#province', 'Chiang Mai');
    fiReplaceInput('#postalCode', '50200');

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

  it('edits owner profile and persists on revisit', () => { //แก้ไขโปรไฟล์เจ้าของสัตว์เลี้ยง
    const firstName = fiUnique('Mina');
    cy.fiEnsureOwnerProfile();
    cy.intercept('PATCH', '**/v1/user/profile').as('fiUpdateOwnerProfile');
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    fiReplaceInput('#firstName', firstName);
    fiReplaceInput('#lastName', 'Kim');
    cy.get('#gender').select('female');
    fiReplaceInput('#phone', '0899999999');
    fiReplaceInput('#email', `mina.${Date.now()}@example.com`);
    fiClickButton(/^Update$/);
    cy.wait('@fiUpdateOwnerProfile', { timeout: 30000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);
    cy.fiApi('GET', '/v1/user/profile').then((res) => {
      const profile = ((res.body as any)?.data ?? res.body) as Record<string, any>;
      expect(String(profile.fname ?? profile.first_name), 'persisted first name').to.eq(String(firstName));
      expect(String(profile.lname ?? profile.last_name), 'persisted last name').to.eq('Kim');
    });

    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains('Owner Information', { timeout: 20000 }).should('exist');
    cy.contains('Kim').should('exist');
  });

  it('uploads owner profile image with real presigned URL and R2 PUT', () => {
    cy.fiRequireR2UploadReady();
    cy.fiEnsureOwnerProfile();
    cy.intercept('PATCH', '**/v1/user/profile').as('fiUpdateOwnerProfile');
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('input[type="file"]').selectFile('cypress/img-test/test-1.jpeg', { force: true });
    cy.get('img[alt="Profile"]', { timeout: 60000 }).should('be.visible');
    fiClickButton(/^Update$/);
    cy.wait('@fiUpdateOwnerProfile', { timeout: 30000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);
    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains('Owner Information', { timeout: 20000 }).should('exist');
  });
});
