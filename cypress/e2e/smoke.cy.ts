import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Smoke", () => {
  describe("app smoke", () => {
    it("loads the home page", () => {
      cy.visit("/");
      cy.contains(/./);
    });
  });
});
