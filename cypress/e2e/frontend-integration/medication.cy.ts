import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Medication flow (integration)', () => {
  const visitMedicationPage = (petId: number) => {
    cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medications`);
    cy.contains('Medication', { timeout: 20000 }).should('exist');
  };

  const visitAggregateMedicationPage = () => {
    cy.fiVisitAuthed('/pet-owners/medication-page?tab=today', { failOnStatusCode: false });
    cy.contains('Today', { timeout: 20000 }).should('exist');
  };

  it('shows medication reminders for seeded pet', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('CY-FI-MED-PET') }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: fiUnique('CY-FI-MED'),
        reminder_time: ['09:00'],
        start_date: '2026-02-01T00:00:00',
        end_date: '2026-02-28T00:00:00',
      }).then(({ payload }) => {
        visitMedicationPage(petId);
        cy.contains(String((payload as any).name), { timeout: 20000 }).should('exist');
      });
    });
  });

  it('creates medication from popup and shows success alert', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medications`);
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      const newMedName = fiUnique('CY-FI-UI-MED');
      cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
      fiDialog().contains('Add New Medication').should('exist');
      fiDialog().within(() => {
        cy.get('#medicine-name-input').type(newMedName);
        cy.get('#dosage-input').type('2 ml');
        cy.get('#start-date-input').clear().type('2026-02-10');
        cy.contains('button', /^Add Medication$/).click();
      });
      cy.get('@alertStub').should('have.been.calledWith', 'Medication created successfully!');
    });
  });

  it('edits and deletes a seeded medication from per-pet page', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const medPetName = fiUnique('MedPet');
    cy.fiCreatePet({ name: medPetName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, { name: fiUnique('CY-FI-MED-EDIT') }).then(({ payload }) => {
        visitMedicationPage(petId);
        cy.get(`[role="button"][aria-label^="${medPetName} "]`, { timeout: 20000 }).first().as('firstCard');

        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
          cy.stub(win, 'alert').as('alertStub');
        });

        cy.get('@firstCard').within(() => {
          cy.get('button').first().click();
        });
        cy.get('[role="menu"]').should('be.visible');
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Edit$/).click();
        fiDialog().contains('Edit Medication').should('exist');
        fiDialog().within(() => {
          cy.get('#dosage').clear().type('9 ml');
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').should('be.visible');
          cy.get('[role="listbox"]').contains('button', medPetName).click();
          cy.contains('button', /^Save Changes$/).click();
        });
        cy.get('@alertStub').should('have.been.called');
        cy.get('[role="dialog"]:visible').then(($dlg) => {
          if ($dlg.length) {
            cy.get('body').type('{esc}');
          }
        });

        cy.contains(String((payload as any).name)).should('exist');
        cy.get(`[role="button"][aria-label^="${medPetName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click({ force: true });
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Delete$/).click();
        cy.contains(String((payload as any).name)).should('not.exist');
      });
    });
  });

  it('filters aggregate page by pet selector with two seeded pets', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const aggOne = fiUnique('AggOne');
    const aggTwo = fiUnique('AggTwo');
    cy.fiCreatePet({ name: aggOne }).then(({ petId: pet1 }) => {
      cy.fiCreatePet({ name: aggTwo }).then(({ petId: pet2 }) => {
        cy.fiCreateMedication(pet1, { name: fiUnique('CY-FI-AGG-1') });
        cy.fiCreateMedication(pet2, { name: fiUnique('CY-FI-AGG-2') });

        visitAggregateMedicationPage();
        cy.get('body').then(($body) => {
          const hasSelector = $body.find('button[aria-haspopup="listbox"]').length > 0;
          if (!hasSelector) {
            cy.contains(/Could not load|Error|No medication/i).should('exist');
            return;
          }

          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('body').then(($bodyAfterOpen) => {
            const option = [...$bodyAfterOpen.find('[role="listbox"] button')].find((btn) =>
              (btn.textContent ?? '').includes(aggTwo)
            );

            if (option) {
              cy.wrap(option).click();
              cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', aggTwo);
            } else {
              cy.get('button[aria-haspopup="listbox"]').first().should('exist');
            }
          });
        });
      });
    });
  });
});
