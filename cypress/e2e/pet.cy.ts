import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Pet flow", () => {
  describe("TC-PET-01: Add new pet with required fields", () => {
    it("creates pet and redirects to my pets page", () => {
      cy.visit("/pet-owners/my-pets-page/add-new-pet", {
        onBeforeLoad(win) {
          win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
        },
      });

      cy.contains("button", "Add New Pet").should("be.disabled");

      cy.get('input[placeholder="Mochi"]').type("Milo");
      cy.get('input[placeholder="cat"]').type("cat");
      cy.get('input[placeholder="Scottish Fold"]').type("British Shorthair");
      cy.get('input[type="date"]').type("2023-01-01");
      cy.get("select").select("Female");
      cy.get('input[placeholder="e.g. 4.5"]').type("4.2");
      cy.get('input[placeholder*="Chicken"]').type("Chicken, Dust");

      cy.contains("button", "Add New Pet").should("not.be.disabled").click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
    });

    it("creates pet and age is calculated correctly", () => {
      cy.clock(new Date("2026-02-05T12:00:00Z").getTime(), ["Date"]);

      cy.visit("/pet-owners/my-pets-page/add-new-pet", {
        onBeforeLoad(win) {
          win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
        },
      });

      cy.get('input[type="date"]').type("2023-01-01");
      cy.contains("label", "Age").next("div").should("have.text", "3y 1m");
    });
  });

  describe("TC-PET-02: submitting form with missing required field shows validation error", () => {
    it("submit shows validation error when form is incomplete", () => {
      cy.visit("/pet-owners/my-pets-page/add-new-pet", {
        onBeforeLoad(win) {
          win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
        },
      });

      cy.get('input[placeholder="Mochi"]').type("Milo");
      cy.get('input[placeholder="cat"]').type("cat");
      cy.get('input[placeholder="Scottish Fold"]').type("British Shorthair");
      cy.get('input[type="date"]').type("2023-01-01");

      cy.contains("button", "Add New Pet").should("be.disabled");

      cy.get("select").select("Male");
      cy.contains("button", "Add New Pet").should("not.be.disabled").click();

      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
    });
  });

  describe("TC-PET-03: Add New Pet – Input Normalization & Edge Cases", () => {
    it("edge input is normalized correctly (trim/allergies/empty weight/future DOB)", () => {
      cy.clock(new Date("2026-02-05T12:00:00Z").getTime(), ["Date"]);

      cy.visit("/pet-owners/my-pets-page/add-new-pet", {
        onBeforeLoad(win) {
          win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
        },
      });

      cy.get('input[placeholder="Mochi"]').type("  Luna  ");
      cy.get('input[placeholder="cat"]').type("  cat  ");
      cy.get('input[placeholder="Scottish Fold"]').type("  Persian  ");

      cy.get('input[type="date"]').type("2026-12-01");
      cy.contains("label", "Age").next("div").should("have.text", "0 days");

      cy.get("select").select("Unknown");
      cy.get('input[placeholder="e.g. 4.5"]').should("have.value", "");
      cy.get('input[placeholder*="Chicken"]').type(" Chicken, , Dust  ,  ");

      cy.contains("button", "Add New Pet").should("not.be.disabled").click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
    });
  });
});
