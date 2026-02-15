import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Symptom flow", () => {
  const PET_ID = "430242";
  const STABLE_NOW_ISO = "2026-02-10T09:00:00.000Z";
  const STABLE_DAY = "2026-02-10";

  const freezeToStableDay = () => {
    cy.clock(new Date(STABLE_NOW_ISO).getTime(), ["Date"]);
  };

  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const visitSymptomsPage = () => {
    cy.visit(`/pet-owners/my-pets-page/${PET_ID}/symptoms`, {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Pets Record", { timeout: 20000 }).should("exist");
  };

  const openCreateDialog = () => {
    cy.get('button[aria-label="Add record"]').click();
    cy.contains("Create Symptom Record").should("exist");
  };

  describe("Component Smoke", () => {
    it("renders symptom record shell and add action", () => {
      freezeToStableDay();
      visitSymptomsPage();
      cy.contains("Pets Record").should("be.visible");
      cy.get('button[aria-label="Add record"]').should("be.visible");
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  describe("Behavioral Contract (AC)", () => {
  describe("TC-SYM-01: Create symptom record success", () => {
    it("submits create form and closes popup", () => {
      freezeToStableDay();
      visitSymptomsPage();
      const noteText = `Cypress symptom ${Date.now()}`;

      openCreateDialog();
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="date"]').clear().type(STABLE_DAY);
        cy.get('input[type="time"]').type("13:30");
        cy.get('textarea[placeholder="Describe symptoms..."]').type(noteText);
        cy.contains("button", "Add New Record").click();
      });

      cy.get('[role="dialog"]').should("not.exist");
      cy.contains(noteText, { timeout: 20000 }).should("exist");
    });
  });

  describe("TC-SYM-02: Create validation required fields", () => {
    it("does not submit when required fields are empty", () => {
      freezeToStableDay();
      visitSymptomsPage();

      openCreateDialog();
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Add New Record").click();
      });

      cy.contains("Create Symptom Record").should("exist");
    });
  });

  describe("TC-SYM-03: Create symptom record with image upload", () => {
    it("uploads image and closes create popup", () => {
      freezeToStableDay();
      visitSymptomsPage();
      const noteText = `Symptom with image ${Date.now()}`;
      cy.intercept("PUT", "**mock-r2-upload-url.com**", {
        statusCode: 200,
        body: {},
      }).as("uploadImage");

      openCreateDialog();
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="date"]').clear().type(STABLE_DAY);
        cy.get('input[type="time"]').type("09:15");
        cy.get('textarea[placeholder="Describe symptoms..."]').type(noteText);
        cy.get('input[type="file"]').selectFile("cypress/img-test/test-1.jpeg", {
          force: true,
        });
        cy.contains("button", "Add New Record").click();
      });

      cy.wait("@uploadImage", { timeout: 20000 });
      cy.get('[role="dialog"]').should("not.exist");
      cy.contains(noteText, { timeout: 20000 }).should("exist");
    });
  });

  describe("TC-SYM-04: Edit symptom record", () => {
    it("opens edit dialog from record detail and saves changes", () => {
      freezeToStableDay();
      visitSymptomsPage();
      const afterNote = `Edited by Cypress ${Date.now()}`;

      cy.contains("Vomited after eating breakfast.", { timeout: 20000 }).click();
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Edit").click();
      });

      cy.contains("Edit Record").should("exist");
      cy.get('[role="dialog"]').within(() => {
        cy.get("textarea").clear().type(afterNote);
        cy.contains("button", "Save").click();
      });

      cy.get('[role="dialog"]').should("not.exist");
      cy.contains(afterNote, { timeout: 20000 }).should("exist");
    });
  });

  describe("TC-SYM-05: Delete symptom record", () => {
    it("shows confirm flow and submits delete on confirm", () => {
      freezeToStableDay();
      visitSymptomsPage();

      cy.window().then((win) => {
        const confirmStub = cy.stub(win, "confirm");
        confirmStub.onFirstCall().returns(false);
        confirmStub.onSecondCall().returns(true);
        cy.wrap(confirmStub).as("confirmStub");
      });

      cy.contains("Vomited after eating breakfast.", { timeout: 20000 }).click();
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Delete").click();
      });
      cy.get("@confirmStub").should("have.been.calledOnce");
      cy.get('[role="dialog"]').should("exist");

      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Delete").click();
      });

      cy.get("@confirmStub").should("have.been.calledTwice");
      cy.get('[role="dialog"]').should("not.exist");
      cy.contains("Vomited after eating breakfast.").should("not.exist");
    });
  });
  });
});
