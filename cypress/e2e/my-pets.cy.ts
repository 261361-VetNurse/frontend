import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("My pets flow", () => {
  it("redirects to login page when auth token is missing", () => {
    cy.visit("/pet-owners/my-pets-page");
    cy.location("pathname", { timeout: 20000 }).should("eq", "/pet-owners/login-page");
  });

  it("renders owner card and pets list when authenticated", () => {
    cy.visit("/pet-owners/my-pets-page", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
      },
    });

    cy.contains("My Pets", { timeout: 20000 }).should("be.visible");
    cy.contains("All Pets").should("exist");
    cy.contains("In Medical").should("exist");
    cy.contains("Mochi").should("exist");
    cy.contains("New Pet").should("exist");
  });

  it("shows pets list error and retry action when pets API fails", () => {
    cy.intercept("GET", "**/api/pets*", {
      statusCode: 500,
      body: { detail: "failed" },
    }).as("getPetsFailed");

    cy.visit("/pet-owners/my-pets-page", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
      },
    });

    cy.wait("@getPetsFailed");
    cy.contains("Could not load pets list", { timeout: 20000 }).should("exist");
    cy.contains("button", "Retry").should("exist");
  });
});
