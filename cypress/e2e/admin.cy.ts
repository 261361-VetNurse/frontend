import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Admin smoke", () => {
  it("loads primary admin routes", () => {
    const pages = [
      ["/admin", "All Pet Owners"],
      ["/admin/dashboard", "Admin Dashboard"],
      ["/admin/pet-owners", "Pet Owners"],
      ["/admin/pets", "Pets"],
      ["/admin/appointments", "Appointments"],
      ["/admin/community", "Community"],
    ] as const;

    pages.forEach(([path, text]) => {
      cy.visit(path);
      cy.contains(text, { timeout: 20000 }).should("exist");
    });
  });

  it("loads dynamic admin detail pages", () => {
    cy.visit("/admin/pets/430242");
    cy.contains("Pet Detail").should("exist");
    cy.contains("Pet ID: 430242").should("exist");

    cy.visit("/admin/pet-owners/owner_001");
    cy.contains("Pet Owner Detail").should("exist");

    cy.visit("/admin/appointments/apt-001");
    cy.contains("Appointment Detail").should("exist");
  });
});
