import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Calendar record flow", () => {
  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const freezeNow = () => {
    cy.clock(new Date("2026-02-10T09:00:00Z").getTime(), ["Date"]);
  };

  it("renders record tab and opens add record popup", () => {
    freezeNow();

    cy.visit("/pet-owners/calendar-page?tab=record", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Record", { timeout: 20000 }).should("exist");
    cy.contains("No records on this date", { timeout: 20000 }).should("exist");

    cy.get('button[aria-label="Quick dial button"]').first().click();
    cy.contains("Create Symptom Record").should("exist");
  });

  it("can create record from calendar record popup", () => {
    freezeNow();

    cy.visit("/pet-owners/calendar-page?tab=record", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    const note = `Calendar record ${Date.now()}`;

    cy.get('button[aria-label="Quick dial button"]').first().click();
    cy.contains("Create Symptom Record").should("exist");

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", "Choose your pet").click();
      cy.contains("button", "Mochi").click();
      cy.get('input[type="date"]').clear().type("2026-02-10");
      cy.get('input[type="time"]').type("12:30");
      cy.get('textarea[placeholder="Describe symptoms..."]').type(note);
      cy.contains("button", "Add New Record").click();
    });

    cy.get('[role="dialog"]').should("not.exist");
    cy.contains(note, { timeout: 20000 }).should("exist");
  });
});
