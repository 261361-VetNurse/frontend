import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiClickButton } from './helpers';

const DEFAULT_PET_PROFILE_IMAGE =
  'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/blank_pet_profile_1x.webp';

function unwrapBodyData(body: unknown): Record<string, unknown> {
  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : record;
}

runForMobileViewports('Pet flow (integration)', () => {
  describe('TC-PET-01..03: Add pet + validation + age display', () => {
    it('creates pet from UI and persists mapped form fields', () => {
      const petName = fiUnique('CY-FI-PET-UI');
      cy.fiEnsureOwnerProfile();
      cy.intercept('POST', '**/v1/pets').as('fiCreatePetUi');

      cy.fiVisitAuthed('/pet-owners/my-pets-page/add-new-pet');
      cy.contains('button', /^Add New Pet$/).should('be.disabled');

      cy.get('input[placeholder="Mochi"]').type(petName);
      cy.get('input[placeholder="cat"]').type('cat');
      cy.get('input[placeholder="Scottish Fold"]').type('British Shorthair');
      cy.get('input[type="date"]').type('2023-01-01');
      cy.get('select').select('Female');
      cy.get('input[placeholder="e.g. 4.5"]').type('4.2');
      cy.get('input[type="checkbox"]').check();
      cy.get('input[placeholder="e.g. Chicken, Beef, Dust (comma separated)"]').type('Chicken, Dust');

      cy.contains('button', /^Add New Pet$/).should('not.be.disabled').click();
      cy.wait('@fiCreatePetUi', { timeout: 30000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          name: petName,
          species: 'cat',
          breed: 'British Shorthair',
          birth_date: '2023-01-01',
          gender: 'Female',
          weight_kg: 4.2,
          in_medical: true,
          infecund: false,
          color: null,
          profile_image: DEFAULT_PET_PROFILE_IMAGE,
        });

        const body = unwrapBodyData(interception.response?.body);
        const petId = Number(body.pet_id);
        expect(petId, 'created pet id').to.be.greaterThan(0);

        cy.fiApi('GET', `/v1/pets/${petId}`).then((res) => {
          const data = unwrapBodyData(res.body);

          expect(data).to.include({
            name: petName,
            in_medical: true,
          });
          expect(Number(data.weight_kg)).to.eq(4.2);
          expect(String(data.profile_image ?? ''), 'default profile image persisted').to.eq(
            DEFAULT_PET_PROFILE_IMAGE
          );
        });
      });
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page');
      cy.contains(petName, { timeout: 20000 }).should('exist');
    });

    it('shows alert and stays on add page when create pet fails', () => {
      const petName = fiUnique('CY-FI-PET-CREATE-FAIL');
      cy.fiEnsureOwnerProfile();
      cy.intercept('POST', '**/v1/pets', {
        statusCode: 500,
        body: { detail: 'forced create pet failure' },
      }).as('fiCreatePetError');

      cy.fiVisitAuthed('/pet-owners/my-pets-page/add-new-pet');
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('fiCreatePetAlert');
      });

      cy.get('input[placeholder="Mochi"]').type(petName);
      cy.get('input[placeholder="cat"]').type('cat');
      cy.get('input[placeholder="Scottish Fold"]').type('British Shorthair');
      cy.get('input[type="date"]').type('2023-01-01');
      cy.get('select').select('Female');

      cy.contains('button', /^Add New Pet$/).should('not.be.disabled').click();
      cy.wait('@fiCreatePetError', { timeout: 30000 })
        .its('response.statusCode')
        .should('eq', 500);
      cy.get('@fiCreatePetAlert').should('have.been.calledWith', 'Failed to create pet. Please try again.');
      cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page/add-new-pet');
      cy.get('input[placeholder="Mochi"]').should('have.value', petName);
      cy.contains('button', /^Add New Pet$/).should('not.be.disabled');
    });

    it('shows age calculation and keeps submit disabled while required fields missing', () => {
      fiFreeze('2026-02-05T12:00:00Z');
      cy.fiVisitAuthed('/pet-owners/my-pets-page/add-new-pet');

      cy.get('input[type="date"]').type('2023-01-01');
      cy.contains('label', 'Age').next('div').should('have.text', '3y 1m');

      cy.get('input[placeholder="Mochi"]').type(fiUnique('CY-FI-VAL'));
      cy.get('input[placeholder="cat"]').type('cat');
      cy.get('input[placeholder="Scottish Fold"]').type('Persian');
      cy.contains('button', /^Add New Pet$/).should('be.disabled');
    });
  });

  describe('TC-PET-04..10: Detail / edit / delete / navigation / branch states', () => {
    it('shows loading state before pet detail resolves', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-DETAIL-LOADING') }).then(({ petId, detail }) => {
        cy.intercept('GET', '**/v1/pets', (req) => {
          req.reply({
            statusCode: 200,
            body: [detail],
            delay: 1200,
          });
        }).as('fiGetPetsSlow');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.contains('Loading pet information...', { timeout: 20000 }).should('be.visible');
        cy.wait('@fiGetPetsSlow', { timeout: 30000 });
        cy.contains('Pets Information', { timeout: 20000 }).should('exist');
      });
    });

    it('shows detail error state when pets fetch fails', () => {
      cy.fiEnsureOwnerProfile();
      cy.intercept('GET', '**/v1/pets', {
        statusCode: 500,
        body: { detail: 'forced pet detail failure' },
      }).as('fiGetPetsError');

      cy.fiVisitAuthed('/pet-owners/my-pets-page/999999');
      cy.wait('@fiGetPetsError', { timeout: 30000 });
      cy.contains('Error: forced pet detail failure', { timeout: 20000 }).should('be.visible');
    });

    it('shows not found state on detail page when pet is absent from fetched list', () => {
      cy.fiEnsureOwnerProfile();
      cy.intercept('GET', '**/v1/pets', {
        statusCode: 200,
        body: [],
      }).as('fiGetPetsEmptyForDetail');

      cy.fiVisitAuthed('/pet-owners/my-pets-page/999999');
      cy.wait('@fiGetPetsEmptyForDetail', { timeout: 30000 });
      cy.contains('Pet not found: 999999', { timeout: 20000 }).should('be.visible');
    });

    it('shows not found state on edit page when pet is absent from fetched list', () => {
      cy.fiEnsureOwnerProfile();
      cy.intercept('GET', '**/v1/pets', {
        statusCode: 200,
        body: [],
      }).as('fiGetPetsEmptyForEdit');

      cy.fiVisitAuthed('/pet-owners/my-pets-page/999999/edit');
      cy.wait('@fiGetPetsEmptyForEdit', { timeout: 30000 });
      cy.contains('Pet not found: 999999', { timeout: 20000 }).should('be.visible');
    });

    it('shows pet detail page for seeded pet', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-DETAIL') }).then(({ petId, detail }) => {
        const detailData = unwrapBodyData(detail);
        const petName = String(detailData.name ?? '');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.contains('Pets Information', { timeout: 20000 }).should('exist');
        cy.contains('Basic Information').should('exist');
        if (petName) cy.contains(petName).should('exist');
        cy.contains('button', /^Edit$/).should('exist');
        cy.contains('button', /^Delete$/).should('exist');
      });
    });

    it('navigates from pet detail via selector and menu links', () => {
      const firstPetName = fiUnique('CY-FI-DETAIL-NAV-1');
      const secondPetName = fiUnique('CY-FI-DETAIL-NAV-2');
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: firstPetName }).then(({ petId: firstPetId }) => {
        cy.fiCreatePet({ name: secondPetName }).then(({ petId: secondPetId }) => {
          cy.fiVisitAuthed(`/pet-owners/my-pets-page/${firstPetId}`);
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').contains('button', secondPetName).click();
          cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${secondPetId}`);
          cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', secondPetName);

          cy.contains('Appointment').click();
          cy.location('pathname', { timeout: 20000 }).should(
            'eq',
            `/pet-owners/my-pets-page/${secondPetId}/appointments`
          );

          cy.go('back');
          cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${secondPetId}`);
          cy.contains('Medication').click();
          cy.location('pathname', { timeout: 20000 }).should(
            'eq',
            `/pet-owners/my-pets-page/${secondPetId}/medications`
          );

          cy.go('back');
          cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${secondPetId}`);
          cy.contains('Pets Symptom Record').click();
          cy.location('pathname', { timeout: 20000 }).should(
            'eq',
            `/pet-owners/my-pets-page/${secondPetId}/symptoms`
          );
        });
      });
    });

    it('edits pet via UI and persists mapped fields on detail page', () => {
      const updatedName = fiUnique('CY-FI-PET-UPDATED');
      const updatedNote = fiUnique('CY-FI-PET-NOTE');
      const initialProfileImage = 'https://example.com/cypress-pet-profile.png';
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({
        profile_image: initialProfileImage,
        in_medical: false,
        infecund: false,
        gender: 'male',
        weight_kg: 4.2,
      }).then(({ petId }) => {
        cy.intercept('PATCH', `**/v1/pets/${petId}`).as('fiUpdatePet');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/edit`);
        cy.contains('label', /^Name$/).parent().find('input').first().clear().type(updatedName);
        cy.contains('label', /^Gender$/).parent().find('select').select('Female');
        cy.contains('label', /^Weight \(kg\)$/).parent().find('input').clear().type('6.8');
        cy.contains('label', /^Infecund$/)
          .parent()
          .contains('label', /^Yes$/)
          .find('input[type="radio"]')
          .check({ force: true });
        cy.contains('label', /^In Medical$/)
          .parent()
          .contains('label', /^Yes$/)
          .find('input[type="radio"]')
          .check({ force: true });
        cy.contains('label', /^Note$/).parent().find('input').first().clear().type(updatedNote);
        fiClickButton(/^Update$/);

        cy.wait('@fiUpdatePet', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
          expect(interception.request.body).to.include({
            name: updatedName,
            gender: 'Female',
            weight_kg: 6.8,
            infecund: true,
            in_medical: true,
            note: updatedNote,
            profile_image: initialProfileImage,
          });
        });

        cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);
        cy.fiApi('GET', `/v1/pets/${petId}`).then((res) => {
          const body = (res.body as Record<string, unknown>) ?? {};
          const data = (
            body.data && typeof body.data === 'object'
              ? (body.data as Record<string, unknown>)
              : body
          ) as Record<string, unknown>;
          expect(data).to.include({
            name: updatedName,
            gender: 'Female',
            infecund: true,
            in_medical: true,
            note: updatedNote,
            profile_image: initialProfileImage,
          });
          expect(Number(data.weight_kg), 'updated weight in pet detail API').to.eq(6.8);
        });
        cy.contains('div', /^Name$/).parent().should('contain.text', updatedName);
        cy.contains('div', /^Gender$/).parent().should('contain.text', 'Female');
        cy.contains('div', /^Weight \(kg\)$/).parent().should('contain.text', '6.8');
        cy.contains('div', /^Infecund$/).parent().should('contain.text', 'Yes');
        cy.contains('div', /^In Medical$/).parent().should('contain.text', 'Yes');
        cy.contains('div', /^Note$/).parent().should('contain.text', updatedNote);

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/edit`);
        cy.contains('label', /^Note$/).parent().find('input').first().should('have.value', updatedNote);
        cy.contains('label', /^Gender$/).parent().find('select').should('have.value', 'Female');
        cy.contains('label', /^Weight \(kg\)$/).parent().find('input').should('have.value', '6.8');
      });
    });

    it('shows alert and stays on edit page when update pet fails', () => {
      const updatedName = fiUnique('CY-FI-PET-UPDATE-FAIL');
      const updatedNote = fiUnique('CY-FI-PET-UPDATE-FAIL-NOTE');
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet().then(({ petId }) => {
        cy.intercept('PATCH', `**/v1/pets/${petId}`, {
          statusCode: 500,
          body: { detail: 'forced update pet failure' },
        }).as('fiUpdatePetError');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/edit`);
        cy.window().then((win) => {
          cy.stub(win, 'alert').as('fiUpdatePetAlert');
        });

        cy.contains('label', /^Name$/).parent().find('input').first().clear().type(updatedName);
        cy.contains('label', /^Note$/).parent().find('input').first().clear().type(updatedNote);
        fiClickButton(/^Update$/);

        cy.wait('@fiUpdatePetError', { timeout: 30000 })
          .its('response.statusCode')
          .should('eq', 500);
        cy.get('@fiUpdatePetAlert').should('have.been.calledWith', 'Failed to update pet. Please try again.');
        cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}/edit`);
        cy.contains('label', /^Name$/).parent().find('input').first().should('have.value', updatedName);
        cy.contains('label', /^Note$/).parent().find('input').first().should('have.value', updatedNote);
        cy.contains('button', /^Update$/).should('not.be.disabled');
      });
    });

    it('keeps pet detail page unchanged when delete confirmation is canceled', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-PET-KEEP') }).then(({ petId, payload }) => {
        let deleteCallCount = 0;
        cy.intercept('DELETE', `**/v1/pets/${petId}`, (req) => {
          deleteCallCount += 1;
          req.continue();
        }).as('fiDeletePetCanceled');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false);
        });

        fiClickButton(/^Delete$/);
        cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);
        cy.contains(String((payload as Record<string, unknown>).name), { timeout: 20000 }).should('exist');
        cy.then(() => {
          expect(deleteCallCount, 'delete API should not be called when confirmation is canceled').to.eq(0);
        });
      });
    });

    it('deletes pet from detail page and returns to my pets page', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-PET-DELETE') }).then(({ petId, payload }) => {
        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);

        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });

        fiClickButton(/^Delete$/);
        cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/my-pets-page');
        cy.contains(String((payload as Record<string, unknown>).name)).should('not.exist');
      });
    });

    it('shows alert and stays on detail page when delete fails', () => {
      cy.fiEnsureOwnerProfile();
      cy.fiCreatePet({ name: fiUnique('CY-FI-PET-DELETE-FAIL') }).then(({ petId, payload }) => {
        cy.intercept('DELETE', `**/v1/pets/${petId}`, {
          statusCode: 500,
          body: { detail: 'forced delete failure' },
        }).as('fiDeletePetError');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
          cy.stub(win, 'alert').as('fiDeletePetAlert');
        });

        fiClickButton(/^Delete$/);
        cy.wait('@fiDeletePetError', { timeout: 30000 })
          .its('response.statusCode')
          .should('eq', 500);
        cy.get('@fiDeletePetAlert').should('have.been.calledWith', 'Failed to delete pet. Please try again.');
        cy.location('pathname', { timeout: 20000 }).should('eq', `/pet-owners/my-pets-page/${petId}`);
        cy.contains(String((payload as Record<string, unknown>).name), { timeout: 20000 }).should('exist');
      });
    });
  });
});
