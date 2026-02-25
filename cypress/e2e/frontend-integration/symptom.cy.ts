import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, FI_DATE, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Symptom flow (integration)', () => {
  const visitSymptomsPage = (petId: number) => {
    cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/symptoms`);
    cy.contains('Pets Record', { timeout: 20000 }).should('exist');
  };

  const openCreateDialog = () => {
    cy.get('button[aria-label="Add record"]').should('be.visible').click();
    fiDialog().contains('Create Symptom Record').should('exist');
  };

  it('creates symptom record from UI', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteText = fiUnique('CY-FI-SYM-CREATE');
      visitSymptomsPage(petId);
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('input[type="date"]').clear().type(FI_DATE);
        cy.get('input[type="time"]').type('13:30');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(noteText);
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(noteText, { timeout: 20000 }).should('exist');
    });
  });

  it('edits and deletes seeded symptom record', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-SYM-SEEDED'),
        date_added: FI_DATE,
        time_added: '09:15',
      }).then(({ payload }) => {
        const originalNote = String((payload as any).note);
        const updatedNote = fiUnique('CY-FI-SYM-UPDATED');

        visitSymptomsPage(petId);
        cy.contains(originalNote, { timeout: 20000 }).should('be.visible').click();
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').clear().type(updatedNote);
          cy.contains('button', /^Save$/).click();
        });
        cy.contains(updatedNote, { timeout: 20000 }).should('exist');

        cy.contains(updatedNote).should('be.visible').click();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });
        cy.contains(updatedNote).should('not.exist');
      });
    });
  });

  it('uploads image with real presigned URL + R2 PUT', () => {
    fiFreeze();
    cy.fiRequireR2UploadReady();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      visitSymptomsPage(petId);
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('input[type="date"]').clear().type(FI_DATE);
        cy.get('input[type="time"]').type('10:15');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(fiUnique('CY-FI-SYM-UP'));
        cy.get('input[type="file"]').selectFile('cypress/img-test/test-1.jpeg', { force: true });
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.get('[role="dialog"]:visible', { timeout: 60000 }).should('not.exist');
    });
  });
});
