import { runForMobileViewports } from '../../support/mobileViewports';

runForMobileViewports('Admin smoke (integration-compatible)', () => {
  it('loads primary admin routes', () => {
    const pages = [
      ['/admin', 'All Pet Owners'],
      ['/admin/dashboard', 'Admin Dashboard'],
      ['/admin/pet-owners', 'Pet Owners'],
      ['/admin/pets', 'Pets'],
      ['/admin/appointments', 'Appointments'],
      ['/admin/community', 'Community'],
    ] as const;

    pages.forEach(([path, text]) => {
      cy.visit(path);
      cy.contains(text, { timeout: 20000 }).should('exist');
    });
  });

  it('loads dynamic admin detail pages with real ids', () => {
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId).then(({ appointmentId }) => {
        cy.fiApi('GET', '/auth/me').then((meRes) => {
          const userId = Number((meRes.body as any).id);

          cy.visit(`/admin/pets/${petId}`);
          cy.contains('Pet Detail').should('exist');
          cy.contains(String(petId)).should('exist');

          cy.visit(`/admin/pet-owners/${userId}`);
          cy.contains('Pet Owner Detail').should('exist');

          cy.visit(`/admin/appointments/${appointmentId}`);
          cy.contains('Appointment Detail').should('exist');
        });
      });
    });
  });
});
