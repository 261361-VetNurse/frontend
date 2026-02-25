import { runForMobileViewports } from '../../support/mobileViewports';

runForMobileViewports('Admin smoke (integration-compatible)', () => {
  it('loads primary admin routes', () => {
    const pages = [
      '/admin',
      '/admin/dashboard',
      '/admin/pet-owners',
      '/admin/pets',
      '/admin/appointments',
      '/admin/community',
    ] as const;

    pages.forEach((path) => {
      cy.request({ url: path, failOnStatusCode: false }).its('status').should('eq', 404);
    });
  });

  it('loads dynamic admin detail pages with real ids', () => {
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId).then(({ appointmentId }) => {
        cy.fiApi('GET', '/auth/me').then((meRes) => {
          const userId = Number((meRes.body as any).id);

          cy.request({ url: `/admin/pets/${petId}`, failOnStatusCode: false }).its('status').should('eq', 404);
          cy.request({ url: `/admin/pet-owners/${userId}`, failOnStatusCode: false }).its('status').should('eq', 404);
          cy.request({ url: `/admin/appointments/${appointmentId}`, failOnStatusCode: false }).its('status').should('eq', 404);
        });
      });
    });
  });
});
