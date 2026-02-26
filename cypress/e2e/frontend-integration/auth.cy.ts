import { runForMobileViewports } from '../../support/mobileViewports';

const tokenAuthDescribe = Cypress.env('fiEnableTokenAuthTests') ? describe : describe.skip;

runForMobileViewports('Auth flow (integration)', () => {
  describe('TC-AUTH-00: /pet-owners redirects to login', () => {
    it('redirects root pet owner route to login page', () => {
      cy.visit('/pet-owners');
      cy.location('pathname').should('eq', '/pet-owners/login-page');
    });
  });

  describe('TC-AUTH-01: Developer Access redirects from login to home', () => {
    it('redirects to home after Developer Access login fallback', () => {
      cy.fiVisitAuthed('/pet-owners/login-page');
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/home-page');
      cy.contains(/Hi! Pet Owner|My Pets/i, { timeout: 20000 }).should('exist');
    });
  });

  tokenAuthDescribe('TC-AUTH-01 (token mode): existing valid session redirects from login to home', () => {
    it('redirects to home when auth token exists and backend validates it', () => {
      cy.fiVisitAuthed('/pet-owners/login-page');
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/home-page');
      cy.window().then((win) => {
        const token = win.localStorage.getItem('auth_token');
        expect(token).to.be.a('string').and.have.length.greaterThan(20);
      });
    });
  });

  tokenAuthDescribe('TC-AUTH-02 (token mode): authenticated owner profile page renders backend data', () => {
    it('shows owner profile fields from real backend', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiApi('GET', '/v1/user/profile').then((res) => {
        const profile = (res.body as any).data;
        cy.fiVisitAuthed('/pet-owners/owner-info-page');

        cy.contains('Owner Information', { timeout: 20000 }).should('exist');
        if (profile?.fname) cy.contains(String(profile.fname)).should('exist');
        if (profile?.lname) cy.contains(String(profile.lname)).should('exist');
        if (profile?.phone) cy.contains(String(profile.phone)).should('exist');
      });
    });
  });
});
