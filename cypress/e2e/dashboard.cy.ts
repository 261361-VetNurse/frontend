import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Dashboard flow", () => {
  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const visitDashboard = () => {
    cy.visit("/pet-owners/home-page", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("My Pets", { timeout: 20000 }).should("exist");
    cy.contains("Upcoming appointments", { timeout: 20000 }).should("exist");
  };

  describe("Component Smoke", () => {
    it("renders dashboard shell and core sections", () => {
      visitDashboard();

      cy.contains("My Pets").should("be.visible");
      cy.contains("Reminder").should("be.visible");
      cy.contains("Upcoming appointments").should("be.visible");
      cy.get(".mypet-section").should("exist");
      cy.get(".reminder-box").should("exist");
      cy.get(".appoint-box").should("exist");
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  describe("Behavioral Contract (AC)", () => {
    describe("TC-DASH-01: Dashboard shows pets section", () => {
      it("displays pet list and new pet action", () => { //มีรายชื่อสัตว์ (เช่น Mochi), มี action New Pet
        visitDashboard();

        cy.contains("My Pets").should("exist");
        cy.get(".mypet-section").within(() => {
          cy.contains("Mochi").should("exist");
          cy.contains("New Pet").should("exist");
        });
      });
    });

    describe("TC-DASH-02: Dashboard shows reminder section", () => {
      // มี reminder card (Amoxicillin)
      // กดแล้วเปิด popup Medication Detail
      it("displays reminder cards and opens medication detail popup", () => {
        visitDashboard();

        cy.contains("Reminder").should("exist");
        cy.get(".reminder-box")
          .contains('[role="button"]', "Amoxicillin", { timeout: 20000 })
          .should("be.visible")
          .click();

        cy.get('[role="dialog"]').should("exist").within(() => {
          cy.contains("Medication Detail").should("exist");
          cy.contains("Edit Medication").should("exist");
        });
      });
    });

    describe("TC-DASH-03: Dashboard shows upcoming appointments section", () => {
      // มีนัดหมาย (Novel CMU)
      // กดแล้วเปิด popup Appointment Detail
      it("displays upcoming appointments and opens appointment detail popup", () => {
        visitDashboard();

        cy.contains("Upcoming appointments").should("exist");
        cy.get(".appoint-box").contains("Novel CMU", { timeout: 20000 }).click();

        cy.get('[role="dialog"]').should("exist").within(() => {
          cy.contains("Appointment Detail").should("exist");
          cy.contains("Edit Appointment").should("exist");
        });
      });
    });
  });
});
