import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Medication flow", () => {
  const PET_ID = "430242";

  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const freezeToStableMedicationDay = () => {
    // Tue, 2026-02-10: aligns with mock medications for predictable reminders.
    cy.clock(new Date("2026-02-10T09:00:00").getTime(), ["Date"]);
  };

  const visitMedicationPage = () => {
    cy.visit(`/pet-owners/my-pets-page/${PET_ID}/medications`, {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Medication", { timeout: 20000 }).should("exist");
  };

  const openMenuOnFirstMedicationCard = () => {
    cy.get('[role="button"][aria-label^="Mochi "]', { timeout: 20000 })
      .first()
      .as("firstMedicationCard");

    cy.get("@firstMedicationCard")
      .within(() => {
        cy.get("button").first().should("be.visible").click();
      });

    cy.get('[role="menu"]').should("be.visible");
  };

  const visitAggregateMedicationPage = () => {
    cy.visit("/pet-owners/medication-page?tab=today", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Today's Medication Reminders", { timeout: 20000 }).should("exist");
  };

  describe("Component Smoke", () => {
    it("renders medication shell for per-pet and aggregate pages", () => {
      freezeToStableMedicationDay();
      visitMedicationPage();
      cy.contains("Medication").should("be.visible");
      cy.contains("Today").should("be.visible");
      cy.get('button[aria-label="Quick dial button"]').should("be.visible");

      visitAggregateMedicationPage();
      cy.contains("Today's Medication Reminders").should("be.visible");
      cy.get('button[aria-haspopup="listbox"]').first().should("be.visible");
    });
  });

  describe("Behavioral Contract (AC)", () => {
  describe("TC-MED-01: View medication list", () => { //ดูรายการยา (Read)
    it("shows medication reminders for selected pet", () => {
      freezeToStableMedicationDay();
      visitMedicationPage();

      cy.contains("Today").should("exist");
      cy.contains("Today's Medication Reminders").should("exist");
      cy.contains("No medication reminders.").should("not.exist");
      cy.get('[role="button"][aria-label^="Mochi "]', { timeout: 20000 })
        .its("length")
        .should("be.greaterThan", 0);
    });
  });

  describe("TC-MED-02: Create medication", () => { //เพิ่มยา (Create)
    it("creates medication successfully from popup", () => {
      freezeToStableMedicationDay();
      visitMedicationPage();

      cy.window().then((win) => {
        cy.stub(win, "alert").as("alertStub");
      });

      cy.get('button[aria-label="Quick dial button"]').click();
      cy.contains("Add New Medication").should("exist");

      cy.get("#medicine-name-input").type("Cypress New Med");
      cy.get("#dosage-input").type("2 ml");
      cy.get("#start-date-input").clear().type("2026-02-10");

      cy.contains("button", "Add Medication").click();

      cy.get("@alertStub").should(
        "have.been.calledWith",
        "Medication created successfully!"
      );
      cy.contains("Add New Medication").should("not.exist");
    });
  });

  describe("TC-MED-03: Edit medication", () => { // แก้ไขยา (Update)
    it("edits medication and submits successfully", () => {
      freezeToStableMedicationDay();
      visitMedicationPage();

      cy.window().then((win) => {
        cy.stub(win, "alert").as("alertStub");
      });

      openMenuOnFirstMedicationCard();
      cy.contains('[role="menuitem"]', "Edit").click();

      cy.contains("Edit Medication").should("exist");
      cy.get("#dosage").clear().type("9 ml");
      cy.contains("button", "Save Changes").click();

      cy.get("@alertStub").should(
        "have.been.calledWith",
        "Medication updated successfully!"
      );
      cy.contains("Edit Medication").should("not.exist");
    });
  });

  describe("TC-MED-04: Delete medication", () => { //ลบยา (Delete)
    it("deletes medication after user confirms", () => {
      freezeToStableMedicationDay();
      visitMedicationPage();

      cy.get('[role="button"][aria-label^="Mochi "]', { timeout: 20000 })
        .its("length")
        .as("beforeCount");

      cy.window().then((win) => {
        const confirmStub = cy.stub(win, "confirm").returns(true);
        cy.wrap(confirmStub).as("confirmStub");
        cy.stub(win, "alert").as("alertStub");
      });

      openMenuOnFirstMedicationCard();
      cy.contains('[role="menuitem"]', "Delete").click();

      cy.get("@confirmStub").should("have.been.called");
      cy.get("@beforeCount").then((beforeCount) => {
        cy.get('[role="button"][aria-label^="Mochi "]').should(
          "have.length",
          Math.max(0, Number(beforeCount) - 1)
        );
      });
      cy.get("@alertStub").should("not.have.been.calledWith", "Failed to delete medication");
    });
  });

  describe("TC-MED-05: Per-pet medication schedule tabs", () => {
    it("switches Today, Tomorrow, Other and updates section titles correctly", () => { //สลับแท็บ Today -> Tomorrow -> Other ตรวจว่า title ของแต่ละแท็บเปลี่ยนถูกต้อง
      freezeToStableMedicationDay();
      visitMedicationPage();

      cy.contains("Today's Medication Reminders").should("exist");
      cy.contains("Tomorrow's Medication Reminders").should("not.exist");
      cy.contains("Other Medication Reminders").should("not.exist");

      cy.contains("button", "Tomorrow").click();
      cy.contains("Tomorrow's Medication Reminders").should("exist");
      cy.contains("Today's Medication Reminders").should("not.exist");
      cy.contains("Other Medication Reminders").should("not.exist");

      cy.contains("button", "Other").click();
      cy.contains("Other Medication Reminders").should("exist");
      cy.contains("Today's Medication Reminders").should("not.exist");
      cy.contains("Tomorrow's Medication Reminders").should("not.exist");
    });
  });

  describe("TC-MED-06: Per-pet medication records across tabs", () => {
    it("keeps showing selected pet reminders when switching tabs", () => { //ยืนยันว่าไม่ขึ้น No medication reminders. และมี medication cards
      freezeToStableMedicationDay();
      visitMedicationPage();

      const assertMochiCardsVisible = () => {
        cy.contains("No medication reminders.").should("not.exist");
        cy.get('[role="button"][aria-label^="Mochi "]')
          .its("length")
          .should("be.greaterThan", 0);
      };

      assertMochiCardsVisible();

      cy.contains("button", "Tomorrow").click();
      assertMochiCardsVisible();

      cy.contains("button", "Other").click();
      assertMochiCardsVisible();

      cy.contains("button", "Today").click();
      assertMochiCardsVisible();
    });
  });

  describe("TC-MED-07: Aggregate medication page pet selector", () => {
    it("changes selected pet and filters reminder cards accordingly", () => {
      freezeToStableMedicationDay();
      visitAggregateMedicationPage();

      // Default should include multiple pets when selector is All Pets. (ค่าเริ่มต้น All Pets ต้องเห็นการ์ดยาของหลายสัตว์)
      cy.contains("All Pets").should("exist");
      cy.get('[role="button"][aria-label^="Mochi "]')
        .its("length")
        .should("be.greaterThan", 0);
      cy.get('[role="button"][aria-label^="Taro "]')
        .its("length")
        .should("be.greaterThan", 0);

      // Select Taro in pet selector. (เปลี่ยน selector เป็น Taro แล้วต้องเห็นเฉพาะการ์ด Taro)
      cy.get('button[aria-haspopup="listbox"]').first().click();
      cy.get('[role="listbox"]').contains("Taro").click();

      cy.contains("Taro").should("exist");
      cy.get('[role="button"][aria-label^="Taro "]')
        .its("length")
        .should("be.greaterThan", 0);
      cy.get('[role="button"][aria-label^="Mochi "]').should("have.length", 0);

      // Switch back to All Pets. (เปลี่ยนกลับ All Pets แล้วต้องเห็นทั้ง Mochi และ Taro อีกครั้ง)
      cy.get('button[aria-haspopup="listbox"]').first().click();
      cy.get('[role="listbox"]').contains("All Pets").click();

      cy.get('[role="button"][aria-label^="Mochi "]')
        .its("length")
        .should("be.greaterThan", 0);
      cy.get('[role="button"][aria-label^="Taro "]')
        .its("length")
        .should("be.greaterThan", 0);
    });
  });
  });
});
