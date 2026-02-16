import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Appointment flow", () => {
  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const freezeToStableAppointmentDay = () => {
    // Keep selected calendar day aligned with mock appointment seed.
    cy.clock(new Date("2026-01-20T10:00:00").getTime(), ["Date"]);
  };

  const visitCalendarAppointmentPage = () => {
    cy.visit("/pet-owners/calendar-page?tab=appointment", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Appointment", { timeout: 20000 }).should("exist");
  };

  const openFirstAppointmentDetail = () => {
    cy.contains("Mochi", { timeout: 20000 }).first().click();
    cy.get('[role="dialog"]').should("exist");
  };

  describe("Component Smoke", () => {
    it("renders appointment calendar shell and primary actions", () => {
      freezeToStableAppointmentDay();
      visitCalendarAppointmentPage();

      cy.contains("Appointment").should("be.visible");
      cy.contains("Record").should("be.visible");
      cy.contains("Upcoming appointments").should("be.visible");
      cy.get('button[aria-label="Quick dial button"]:visible')
        .its("length")
        .should("be.greaterThan", 0);
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  describe("Behavioral Contract (AC)", () => {
    describe("TC-APP-01: Create appointment", () => {
      it("shows create entry point via quick dial button", () => {
      //ยืนยันว่ามีปุ่มเริ่ม create flow และกดได้โดยหน้าไม่พัง
        freezeToStableAppointmentDay();
        visitCalendarAppointmentPage();

        cy.get('button[aria-label="Quick dial button"]:visible')
          .first()
          .should("be.visible")
          .then(($btn) => {
            ($btn[0] as HTMLButtonElement).click();
          });
        cy.contains("Upcoming appointments").should("exist");
      });
    });

    describe("TC-APP-02: Read appointment detail", () => {
      it("opens appointment detail popup from card", () => {
          //เปิด detail จาก card
          //ตรวจ field สำคัญใน dialog (Date/Time/Location, ปุ่ม Edit/Delete)
        freezeToStableAppointmentDay();
        visitCalendarAppointmentPage();
        openFirstAppointmentDetail();

        cy.get('[role="dialog"]').within(() => {
          cy.contains("Location").should("exist");
          cy.contains("Date").should("exist");
          cy.contains("Time").should("exist");
          cy.contains("Edit").should("exist");
          cy.contains("Delete").should("exist");
        });
      });
    });

    describe("TC-APP-03: Update appointment", () => {
      it("edits appointment and reflects updated data in detail popup", () => {
          //จาก detail เข้า edit
          //แก้เวลา+สถานที่, save
          //ยืนยัน edit dialog ปิด และข้อมูล detail เป็นค่าที่แก้แล้ว
        freezeToStableAppointmentDay();
        visitCalendarAppointmentPage();
        const updatedLocation = `Updated Room ${Date.now()}`;

        openFirstAppointmentDetail();
        cy.contains("button", "Edit").click();

        cy.contains("Edit Appointment").should("exist");
        cy.get('input[type="time"]').clear().type("15:00");
        cy.get('input[placeholder="Enter location"]').clear().type(updatedLocation);
        cy.contains("button", "Save").click();

        cy.contains("Edit Appointment").should("not.exist");
        cy.contains(updatedLocation, { timeout: 20000 }).should("exist");
        cy.contains("15:00").should("exist");
      });
    });

    describe("TC-APP-04: Delete appointment", () => {
      it("deletes appointment after confirm and removes it from current date list", () => {
          //จาก detail กด delete + confirm
          //ยืนยัน detail dialog ปิด และจำนวน card ลดลง
        freezeToStableAppointmentDay();
        visitCalendarAppointmentPage();

        cy.window().then((win) => {
          const confirmStub = cy.stub(win, "confirm").returns(true);
          cy.wrap(confirmStub).as("confirmStub");
        });

        openFirstAppointmentDetail();
        cy.get('[role="dialog"]').within(() => {
          cy.contains("Location")
            .parent()
            .next()
            .invoke("text")
            .then((txt) => txt.trim())
            .as("deletedLocation");
        });
        cy.contains("button", "Delete").click();

        cy.get("@confirmStub").should("have.been.called");
        cy.get('[role="dialog"]').should("not.exist");
        cy.get("@deletedLocation").then((location) => {
          cy.contains(String(location)).should("not.exist");
        });
      });
    });

    describe("TC-APP-05: View appointments by status", () => {
      it("filters appointment list by Upcoming, Completed, and Canceled tabs", () => {
        cy.visit("/pet-owners/my-pets-page/430242/appointments", {
          onBeforeLoad(win) {
            seedAuth(win);
          },
        });

        cy.contains("Appointment", { timeout: 20000 }).should("exist");

        const assertTabContentRendered = () => {
          cy.get("body")
            .invoke("text")
            .then((text) => {
              const hasAppointments = /Id:apt-\d+/.test(text);
              const hasEmptyState = text.includes("No appointments");
              expect(hasAppointments || hasEmptyState).to.eq(true);
            });
        };

        cy.contains("button", "Upcoming").click();
        cy.contains("button", "Upcoming").should("have.class", "bg-sky-500");
        assertTabContentRendered();

        cy.contains("button", "Completed").click();
        cy.contains("button", "Completed").should("have.class", "bg-sky-500");
        assertTabContentRendered();

        cy.contains("button", "Canceled").click();
        cy.contains("button", "Canceled").should("have.class", "bg-sky-500");
        assertTabContentRendered();
      });
    });

    describe("TC-APP-06: Deep link opens edit appointment", () => {
      it("opens Edit Appointment when appointment_id and open=edit are provided", () => {
        freezeToStableAppointmentDay();
        cy.visit("/pet-owners/calendar-page?tab=appointment&appointment_id=apt-001&open=edit", {
          onBeforeLoad(win) {
            seedAuth(win);
          },
        });

        cy.contains("Appointment", { timeout: 20000 }).should("exist");
        cy.contains("Edit Appointment", { timeout: 20000 }).should("exist");
        cy.get('input[placeholder="Enter location"]').should("be.visible");
      });
    });
  });
});
