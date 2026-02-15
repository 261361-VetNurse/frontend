import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Pet flow", () => {
  const mockCreatePetSuccess = () => {
    cy.intercept("POST", "**/api/pets*", (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      req.reply({
        statusCode: 200,
        body: {
          _id: "mock_pet_e2e_001",
          user_id: "mock_user_1",
          name: (body.name as string) ?? "Milo",
          species: (body.species as string) ?? "cat",
          breed: (body.breed as string) ?? "British Shorthair",
          color: null,
          gender: (body.gender as string) ?? "Female",
          birth_date: (body.birth_date as string) ?? "2023-01-01",
          weight_kg:
            typeof body.weight_kg === "number" ? body.weight_kg : null,
          allergies: Array.isArray(body.allergies) ? body.allergies : [],
          infecund: typeof body.infecund === "boolean" ? body.infecund : false,
          in_medical:
            typeof body.in_medical === "boolean" ? body.in_medical : false,
          profile_image: (body.profile_image as string) ?? "/pet-paw.svg",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }).as("createPet");
  };

  describe("TC-PET-01: Add new pet with required fields", () => {
    it("creates pet and redirects to my pets page", () => {
      mockCreatePetSuccess();

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
      cy.wait("@createPet");
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
      mockCreatePetSuccess();

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
      cy.wait("@createPet");

      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
    });
  });

  describe("TC-PET-03: Add New Pet – Input Normalization & Edge Cases", () => {
    it("edge input is normalized correctly (trim/allergies/empty weight/future DOB)", () => {
      cy.clock(new Date("2026-02-05T12:00:00Z").getTime(), ["Date"]);
      mockCreatePetSuccess();

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
      cy.wait("@createPet");
      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
    });
  });
  const buildPet = (overrides: Partial<Record<string, unknown>> = {}) => ({
    _id: "pet_owner_001",
    user_id: "owner_001",
    name: "Mochi",
    species: "cat",
    breed: "Scottish Fold",
    color: null,
    gender: "Female",
    birth_date: "2023-01-01",
    weight_kg: 4.2,
    allergies: ["Chicken"],
    infecund: false,
    in_medical: false,
    profile_image: "/pet-paw.svg",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

  const ownerPet = buildPet();
  const otherOwnerPet = buildPet({
    _id: "pet_other_999",
    user_id: "owner_other_999",
    name: "Ghost",
  });

  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  describe("TC-PET-04: View pet details (owner only)", () => {
   it("shows pet detail correctly for owner pet", () => {
    cy.intercept("GET", "**/api/pets*", {
      statusCode: 200,
      body: [ownerPet],
    }).as("getPets");

    cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
    });

    cy.wait("@getPets");
    cy.contains("Pets Information").should("exist");
    cy.contains("Basic Information").should("exist");
    cy.contains("Name").should("exist");
    cy.contains(ownerPet.name).should("exist");
    cy.contains("Species").should("exist");
    cy.contains(ownerPet.species).should("exist");
    cy.contains("Breed").should("exist");
    cy.contains(ownerPet.breed).should("exist");

    cy.contains("button", "Edit").should("exist");
    cy.contains("button", "Delete").should("exist");
    cy.contains("button", "Appointment").should("exist");
    cy.contains("button", "Medication").should("exist");
    cy.contains("button", "Pets Symptom Record").should("exist");
  });

  it("direct URL to non-owner pet shows not found (owner-only data scope)", () => {
    cy.intercept("GET", "**/api/pets*", {
      statusCode: 200,
      body: [ownerPet], // ไม่มี pet ของ owner คนอื่น
    }).as("getPets");

    cy.visit(`/pet-owners/my-pets-page/${otherOwnerPet._id}`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
    });

    cy.wait("@getPets");
    cy.contains(`Pet not found: ${otherOwnerPet._id}`).should("exist");
    cy.contains("button", "Delete").should("not.exist");
    cy.contains("button", "Edit").should("not.exist");
  });
  });

  describe("TC-PET-05: Edit pet info (owner only)", () => { //แก้ไขข้อมูลสัตว์เลี้ยง เฉพาะเจ้าของสัตว์เลี้ยงเท่านั้นที่ทำได้
    it("updates pet successfully and redirects back to pet info", () => { //กรณีแก้ไขสำเร็จ
      const updateName = 'Milo Updated';
      let currentPet = { ...ownerPet };

      cy.intercept("GET", "**/api/pets*", () => {
        return {
          statusCode: 200,
          body: [currentPet],
        };
      }).as("getPets");

      cy.intercept("PATCH", `**/api/pets/${ownerPet._id}`, (req) => {
        expect(req.body.name).to.eq(updateName);
        currentPet = buildPet({
          ...currentPet,
          ...req.body,
          _id: ownerPet._id,
          updated_at: "2026-02-05T12:00:00.000Z",
        });
        req.reply({
          statusCode: 200,
          body: currentPet,
        });
      }).as("updatePet");

      cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}/edit`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
      });

      cy.wait("@getPets");

      cy.contains("label", "Name").parent().find("input").clear().type(updateName);
      cy.contains("button", "Update").click();

      cy.wait("@updatePet");
      cy.location("pathname", { timeout: 15000 }).should(
        "eq",
        `/pet-owners/my-pets-page/${ownerPet._id}`
      );
      cy.contains("Name").should("exist");
      cy.contains(updateName).should("exist");
    });

    it("non-owner update is rejected (403) and stays on edit page", () => {
      cy.intercept("GET", "**/api/pets*", {
        statusCode: 200,
        body: [ownerPet],
      }).as("getPets");

      cy.intercept("PATCH", `**/api/pets/${ownerPet._id}`, {
        statusCode: 403,
        body: {
          detail: "Forbidden: not your pet",
        },
      }).as("updatePetForbidden");

      cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}/edit`, {
        onBeforeLoad(win){
          seedAuth(win);
        },
      });

      cy.wait("@getPets");

      cy.window().then((win) => {
        cy.stub(win, "alert").as("alertStub");
      });

      cy.contains("button", "Update").click();
      cy.wait("@updatePetForbidden");

      cy.get("@alertStub").should(
        "have.been.calledWith",
        "Failed to update pet. Please try again."
      );
      cy.location("pathname").should(
        "eq",
        `/pet-owners/my-pets-page/${ownerPet._id}/edit`
      );
    });
  });

  describe("TC-PET-06: Delete pet (owner only)", () => {
    it("cancel delete should not call API", () => {
      cy.intercept("GET", "**/api/pets*", () => {
        return {
          statusCode: 200,
          body: [ownerPet],
        };
      }).as("getPets");

      cy.intercept("DELETE", `**/api/pets/${ownerPet._id}`, {
        statusCode: 200,
        body: { success: true },
      }).as("deletePet");

      cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
      });

      cy.wait("@getPets");

      cy.window().then((win) => {
        cy.stub(win, "confirm").as("confirmStub").returns(false);
        cy.stub(win, "alert").as("alertStub");
      });

      cy.contains("button", "Delete").click();
      cy.get("@confirmStub").should("have.been.calledOnce");
      cy.get("@deletePet.all").should("have.length", 0);
      cy.get("@alertStub").should("not.have.been.called");
      cy.location("pathname").should("eq", `/pet-owners/my-pets-page/${ownerPet._id}`);
    });

    it("deletes owner pet successfully and redirects to my pets page", () => {
      let petsState = [ownerPet];

      cy.intercept("GET", "**/api/pets*", () => {
        return {
          statusCode: 200,
          body: petsState,
        };
      }).as("getPets");

      cy.intercept("DELETE", `**/api/pets/${ownerPet._id}`, () => {
        petsState = [];
        return {
          statusCode: 200,
          body: { success: true, message: "Pet deleted" },
        };
      }).as("deletePet");

      cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
      });

      cy.wait("@getPets");

      cy.window().then((win) => {
        cy.stub(win, "confirm").as("confirmStub").returns(true);
      });

      cy.contains("button", "Delete").click();
      cy.wait("@deletePet");
      cy.location("pathname", { timeout: 15000 }).should("eq", "/pet-owners/my-pets-page");
      cy.contains("No pets yet. Click \"New Pet\" to add one.").should("exist");
      cy.contains(ownerPet.name).should("not.exist");
    });

    it("non-owner delete is rejected (403), shows alert, remains on same page", () => {
      cy.intercept("GET", "**/api/pets*", () => {
        return {
          statusCode: 200,
          body: [ownerPet],
        };
      }).as("getPets");

      cy.intercept("DELETE", `**/api/pets/${ownerPet._id}`, {
        statusCode: 403,
        body: { detail: "Forbidden: not your pet" },
      }).as("deletePetForbidden");

      cy.visit(`/pet-owners/my-pets-page/${ownerPet._id}`, {
        onBeforeLoad(win) {
          seedAuth(win);
        },
      });

      cy.wait("@getPets");

      cy.window().then((win) => {
        cy.stub(win, "confirm").as("confirmStub").returns(true);
        cy.stub(win, "alert").as("alertStub");
      });

      cy.contains("button", "Delete").click();
      cy.wait("@deletePetForbidden");

      cy.get("@alertStub").should(
        "have.been.calledWith",
        "Failed to delete pet. Please try again."
      );
      cy.location("pathname").should("eq", `/pet-owners/my-pets-page/${ownerPet._id}`);
      cy.contains(ownerPet.name).should("exist");
    });
  });
});
