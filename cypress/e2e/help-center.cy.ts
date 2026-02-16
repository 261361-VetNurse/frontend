import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Help center flow", () => {
  it("renders help center with FAQ and contact section", () => {
    cy.visit("/pet-owners/help-center-page", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
      },
    });

    cy.contains("Help Center", { timeout: 20000 }).should("be.visible");
    cy.contains("คำถามยอดฮิต").should("exist");
    cy.contains("สอบถามเพิ่มเติม").should("exist");
    cy.contains("053 948 031").should("exist");
  });
});
