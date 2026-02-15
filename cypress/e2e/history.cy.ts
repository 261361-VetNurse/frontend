import { runForMobileViewports } from "../support/mobileViewports";

//ดูประวัติการรักษาเรียงตามลำดับเวลา

runForMobileViewports("Medical history flow", () => {
  const PET_ID = "430242";

  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  const parseDDMMYYYY = (text: string) => {
    const m = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return NaN;
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
  };

  const parseTime = (text: string) => {
    const m = text.match(/(\d{1,2})\.(\d{2})/);
    if (!m) return NaN;
    return Number(m[1]) * 60 + Number(m[2]);
  };

  const visitMedicalPage = (petId: string) => {
    cy.visit(`/pet-owners/my-pets-page/${petId}/medical`, {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });
    cy.contains("Medical History", { timeout: 20000 }).should("exist");
  };

  const getMedicalSections = () =>
    cy.get("body").find("section").filter((_, el) => /\d{2}\/\d{2}\/\d{4}/.test(el.textContent ?? ""));

  describe("Component Smoke", () => {
    it("renders medical history shell and date sections area", () => {
      visitMedicalPage(PET_ID);
      cy.contains("Medical History").should("be.visible");
      cy.get("body").should("contain.text", "Medical");
    });
  });

  describe("Behavioral Contract (AC)", () => {
  describe("TC-HIS-01: View medical history sorted by timeline", () => {
    it("shows section dates in descending order (newest to oldest) with generic check", () => {
      cy.intercept("GET", "**/api/pets*", {
        statusCode: 200,
        body: [
          {
            _id: PET_ID,
            user_id: "owner_001",
            name: "Mochi",
            species: "cat",
            breed: "Scottish Fold",
            color: null,
            gender: "Female",
            birth_date: "2023-01-01",
            weight_kg: 4.2,
            allergies: [],
            infecund: false,
            in_medical: true,
            profile_image: "/pet-paw.svg",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }).as("getPets");

      visitMedicalPage(PET_ID);

      getMedicalSections().then(($sections) => {
        const labels = [...$sections]
          .map((el) => {
            const text = el.textContent ?? "";
            return text.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1] ?? "";
          })
          .filter((x) => x.length > 0);

        expect(labels.length, "has at least 2 date groups").to.be.gte(2);

        const dateValues = labels.map((label) => parseDDMMYYYY(label));
        dateValues.forEach((v) => expect(Number.isFinite(v), "valid date label").to.eq(true));

        const sortedDesc = [...dateValues].sort((a, b) => b - a);
        expect(dateValues, "date groups should be newest -> oldest").to.deep.equal(sortedDesc);
      });
    });

    it("shows records in a day sorted by ascending time (earliest to latest)", () => {
      cy.intercept("GET", "**/api/pets*", {
        statusCode: 200,
        body: [
          {
            _id: PET_ID,
            user_id: "owner_001",
            name: "Mochi",
            species: "cat",
            breed: "Scottish Fold",
            color: null,
            gender: "Female",
            birth_date: "2023-01-01",
            weight_kg: 4.2,
            allergies: [],
            infecund: false,
            in_medical: true,
            profile_image: "/pet-paw.svg",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }).as("getPets");

      visitMedicalPage(PET_ID);

      getMedicalSections().first().invoke("text").then((sectionText) => {
        const times = sectionText.match(/\d{1,2}\.\d{2}/g) ?? [];
        expect(times.length, "has at least 2 records in latest group").to.be.gte(2);

        const minuteValues = times.map((t) => parseTime(t));
        minuteValues.forEach((v) => expect(Number.isFinite(v), "valid time text").to.eq(true));

        const sortedAsc = [...minuteValues].sort((a, b) => a - b);
        expect(minuteValues, "records should be earliest -> latest").to.deep.equal(sortedAsc);
      });
    });

    it("shows empty state when no medical history exists", () => {
      cy.intercept("GET", "**/api/pets*", {
        statusCode: 200,
        body: [
          {
            _id: "430243",
            user_id: "owner_001",
            name: "Taro",
            species: "dog",
            breed: "Shiba Inu",
            color: null,
            gender: "Male",
            birth_date: "2022-11-21",
            weight_kg: 10.2,
            allergies: [],
            infecund: true,
            in_medical: false,
            profile_image: "/pet-paw.svg",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }).as("getPetsEmpty");

      visitMedicalPage("430243");
      cy.contains("No medical history").should("exist");
      cy.get("body").then(($body) => {
        const matchedSections = $body
          .find("section")
          .toArray()
          .filter((el) => /\d{2}\/\d{2}\/\d{4}/.test(el.textContent ?? ""));
        expect(matchedSections.length).to.eq(0);
      });
    });
  });
  });
});
