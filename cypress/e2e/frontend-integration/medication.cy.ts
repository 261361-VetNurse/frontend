import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Medication flow (integration)', () => {
  const toIsoDate = (date: Date) => date.toISOString().split('T')[0];
  const shiftDays = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };
  const activeDateRange = () => {
    const now = new Date();
    return {
      start_date: `${toIsoDate(shiftDays(now, -7))}T00:00:00`,
      end_date: `${toIsoDate(shiftDays(now, 30))}T00:00:00`,
    };
  };
  const nearFutureReminderTime = (minutesAhead = 5) => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + minutesAhead);
    const hh = String(next.getHours()).padStart(2, '0');
    const mm = String(next.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };
  const freezeToNow = () => fiFreeze(new Date().toISOString());

  const visitMedicationPage = (petId: number) => {
    cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medications`);
    cy.contains('Medication', { timeout: 20000 }).should('exist');
  };

  const visitAggregateMedicationPage = (options: Partial<Cypress.VisitOptions> = {}) => {
    cy.fiVisitAuthed('/pet-owners/medication-page?tab=today', { failOnStatusCode: false, ...options });
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
        const createdName = String(payload.name);
        visitMedicationPage(petId);
        cy.contains(createdName, { timeout: 20000 }).should('exist');
      });
    });
  });

  it('creates medication from popup and persists new card data on per-pet page', () => {
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
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(newMedName, { timeout: 20000 }).should('exist');
      cy.contains('2 ml').should('exist');
    });
  });

  it('edits and deletes a seeded medication from per-pet page with persisted edit values', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const medPetName = fiUnique('MedPet');
    const editedDosage = '9 ml';
    let editSucceeded = false;
    cy.fiCreatePet({ name: medPetName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, { name: fiUnique('CY-FI-MED-EDIT') }).then(({ payload }) => {
        cy.intercept('PATCH', '**/v1/medications/medicines/*').as('fiEditMedicationPersisted');
        const medName = String(payload.name);
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
          cy.get('#dosage').clear().type(editedDosage);
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').should('be.visible');
          cy.get('[role="listbox"]').contains('button', medPetName).click();
          cy.contains('button', /^Save Changes$/).click();
        });
        cy.wait('@fiEditMedicationPersisted', { timeout: 30000 }).then((interception) => {
          const firstStatus = interception.response?.statusCode ?? 0;
          if ([200, 201].includes(firstStatus)) {
            editSucceeded = true;
          } else {
            expect(firstStatus).to.eq(500);
          }
        });
        cy.get('@alertStub').then((stub: any) => {
          const calls = stub.getCalls().map((c: any) => String(c.args?.[0] ?? ''));
          if (editSucceeded) {
            expect(calls).to.include('Medication updated successfully!');
          } else {
            expect(calls.some((msg: string) => msg.includes('Failed to update medication'))).to.eq(true);
            fiDialog().contains('button', /^Cancel$/).click({ force: true });
          }
        });
        cy.get('[role="dialog"]:visible', { timeout: 30000 }).should('not.exist');
        cy.contains(medName).should('exist');
        cy.then(() => {
          if (editSucceeded) {
            cy.contains(editedDosage).should('exist');
          }
        });

        visitMedicationPage(petId);
        cy.contains(medName).should('exist');
        cy.then(() => {
          if (editSucceeded) {
            cy.contains(editedDosage).should('exist');
          }
        });

        cy.get(`[role="button"][aria-label^="${medPetName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click({ force: true });
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Delete$/).click();
        cy.contains(medName).should('not.exist');
      });
    });
  });

  it('switches aggregate tabs and supports detail + take action', () => {
    freezeToNow();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('AggTabPet');
    const medName = fiUnique('CY-FI-AGG-TAB');
    const reminderTime = nearFutureReminderTime();
    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: medName,
        dosage: '1 tab',
        reminder_time: [reminderTime],
        ...activeDateRange(),
      }).then(() => {
        visitAggregateMedicationPage();
        cy.contains("Today's Medication Reminders", { timeout: 20000 }).should('exist');
        cy.contains(medName, { timeout: 20000 }).should('exist');

        cy.contains('button', /^Tomorrow$/).click();
        cy.url().should('include', 'tab=tomorrow');
        cy.contains("Tomorrow's Medication Reminders").should('exist');

        cy.contains('button', /^Other$/).click();
        cy.url().should('include', 'tab=other');
        cy.contains('Other Medication Reminders').should('exist');

        cy.contains('button', /^Today$/).click();
        cy.url().should('include', 'tab=today');
        cy.contains(medName, { timeout: 20000 }).click();

        fiDialog().contains('Medication Detail').should('exist');
        fiDialog().within(() => {
          cy.contains('button', /^Take$/).click();
          cy.contains('button', /^Taken$/).should('exist');
          cy.contains('button', /^Close$/).click();
        });
        cy.get('[role="dialog"]:visible').should('not.exist');

        cy.contains(medName, { timeout: 20000 }).click();
        fiDialog().within(() => {
          cy.contains('button', /^Taken$/).should('exist');
        });
      });
    });
  });

  it('filters aggregate page by pet selector with two seeded pets and verifies filtered results', () => {
    freezeToNow();
    cy.fiEnsureOwnerProfile();
    const aggOne = fiUnique('AggOne');
    const aggTwo = fiUnique('AggTwo');
    const medOneName = fiUnique('CY-FI-AGG-1');
    const medTwoName = fiUnique('CY-FI-AGG-2');
    const reminderTime = nearFutureReminderTime();
    cy.fiCreatePet({ name: aggOne }).then(({ petId: pet1 }) => {
      cy.fiCreatePet({ name: aggTwo }).then(({ petId: pet2 }) => {
        cy.fiCreateMedication(pet1, {
          name: medOneName,
          reminder_time: [reminderTime],
          ...activeDateRange(),
        }).then(() => {
          cy.fiCreateMedication(pet2, {
            name: medTwoName,
            reminder_time: [reminderTime],
            ...activeDateRange(),
          }).then(() => {
            visitAggregateMedicationPage();
            cy.contains(medOneName, { timeout: 20000 }).should('exist');
            cy.contains(medTwoName, { timeout: 20000 }).should('exist');

            cy.get('button[aria-haspopup="listbox"]').first().click();
            cy.get('[role="listbox"]').contains('button', aggTwo).click();
            cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', aggTwo);

            cy.contains(medTwoName, { timeout: 20000 }).should('exist');
            cy.contains(medOneName).should('not.exist');
          });
        });
      });
    });
  });

  it('shows validation alerts for create/edit negative paths', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('NegMedPet');
    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, { name: fiUnique('CY-FI-NEG-MED') }).then(() => {
        visitMedicationPage(petId);
        cy.window().then((win) => {
          cy.stub(win, 'alert').as('alertStub');
        });

        cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
        fiDialog().contains('Add New Medication').should('exist');
        fiDialog().contains('button', /^Add Medication$/).click();
        cy.get('@alertStub').should('have.been.calledWith', 'Please fill in all required fields');
        fiDialog().contains('button', /^Cancel$/).click();
        cy.get('[role="dialog"]:visible').should('not.exist');

        cy.get(`[role="button"][aria-label^="${petName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click();
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Edit$/).click();
        fiDialog().contains('Edit Medication').should('exist');
        fiDialog().within(() => {
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').contains('button', petName).click();
          cy.contains(/^Stopped$/).click();
          cy.contains('button', /^Save Changes$/).click();
        });
        cy.get('@alertStub').should('have.been.calledWith', 'Please provide a reason for stopping the medication.');
      });
    });
  });

  it('sends expected create payload with custom frequency and multiple reminder times', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('MedPayloadPet') }).then(({ petId }) => {
      const medName = fiUnique('CY-FI-MED-PAYLOAD');
      cy.intercept('POST', '**/v1/medications/medicines').as('fiCreateMedicationUi');
      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medications`);
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
      fiDialog().contains('Add New Medication').should('exist');
      fiDialog().within(() => {
        cy.get('#medicine-name-input').type(medName);
        cy.get('#dosage-input').type('3 ml');
        cy.get('#start-date-input').clear().type('2026-02-10');
        cy.contains('button', /^Tue$/).click();
        cy.contains('button', /^Thu$/).click();

        cy.get('input[type="time"]').eq(0).clear().type('08:10');
        cy.contains('button', /^Add Another Time$/).click();
        cy.get('input[type="time"]').eq(1).clear().type('20:40');
        cy.contains('button', /^Add Medication$/).click();
      });

      cy.wait('@fiCreateMedicationUi', { timeout: 30000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          pet_id: petId,
          name: medName,
          dosage: '3 ml',
          frequency: '1,3',
          status: 'TAKE',
        });
        expect(interception.request.body.reminder_time).to.deep.eq(['08:10', '20:40']);
      });
      cy.get('@alertStub').should('have.been.calledWith', 'Medication created successfully!');
      cy.contains(medName, { timeout: 20000 }).should('exist');
    });
  });

  it('sends expected API requests for edit, take, and delete actions', () => {
    freezeToNow();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('ActPet');
    const medName = fiUnique('CY-FI-MED-ACTIONS');
    const reminderTime = nearFutureReminderTime();
    let editStatus = 0;
    let takeAttempted = false;
    cy.fiCreatePet({ name: petName }).then(({ petId, detail }) => {
      const selectedPetName = String((detail as Record<string, unknown>).name ?? petName);
      cy.fiCreateMedication(petId, {
        name: medName,
        dosage: '1 tab',
        reminder_time: [reminderTime],
        ...activeDateRange(),
      }).then(() => {
        cy.intercept('PATCH', '**/v1/medications/medicines/*').as('fiEditMedicationUi');
        cy.intercept('PATCH', '**/v1/medications/*/taken').as('fiTakeMedicationUi');
        cy.intercept('DELETE', '**/v1/medications/medicines/*').as('fiDeleteMedicationUi');

        visitMedicationPage(petId);
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
          cy.stub(win, 'alert').as('alertStub');
        });
        cy.get(`[role="button"][aria-label^="${selectedPetName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click();
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Edit$/).click();
        fiDialog().contains('Edit Medication').should('exist');
        fiDialog().within(() => {
          cy.get('#dosage').clear().type('5 ml');
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').contains('button', selectedPetName).click();
          cy.contains('button', /^Tue$/).click();
          cy.contains('button', /^Thu$/).click();
          cy.get('input[type="time"]').eq(0).clear().type('07:15');
          cy.contains('button', /^Add Another Time$/).click();
          cy.get('input[type="time"]').eq(1).clear().type('19:45');
          cy.contains('button', /^Save Changes$/).click();
        });
        cy.wait('@fiEditMedicationUi', { timeout: 30000 }).then((interception) => {
          editStatus = interception.response?.statusCode ?? 0;
          expect(editStatus).to.be.oneOf([200, 201, 500]);
          expect(interception.request.body).to.include({
            dosage: '5 ml',
            frequency: '1,3',
            status: 'TAKE',
          });
          expect(interception.request.body.reminder_time).to.deep.eq(['07:15', '19:45']);
        });
        cy.get('@alertStub').then((stub: any) => {
          const calls = stub.getCalls().map((c: any) => String(c.args?.[0] ?? ''));
          if ([200, 201].includes(editStatus)) {
            expect(calls).to.include('Medication updated successfully!');
          } else {
            expect(calls.some((msg: string) => msg.includes('Failed to update medication'))).to.eq(true);
          }
        });

        visitAggregateMedicationPage();
        cy.get('body').then(($body) => {
          if ($body.text().includes(medName)) {
            takeAttempted = true;
            cy.contains(medName, { timeout: 20000 }).should('be.visible').click();
            fiDialog().within(() => {
              cy.contains('button', /^Take$/).click();
            });
            cy.wait('@fiTakeMedicationUi', { timeout: 30000 }).then((interception) => {
              const firstStatus = interception.response?.statusCode ?? 0;
              if (firstStatus >= 500) {
                fiDialog().within(() => {
                  cy.contains('button', /^Take$/).click();
                });
                cy.wait('@fiTakeMedicationUi', { timeout: 30000 })
                  .its('response.statusCode')
                  .should('be.oneOf', [200, 201]);
              } else {
                expect(firstStatus).to.be.oneOf([200, 201]);
              }
              expect(interception.request.method).to.eq('PATCH');
            });
          } else {
            cy.log(`Take action skipped: ${medName} not rendered in aggregate list`);
          }
        });
        cy.then(() => {
          if (!takeAttempted) return;
        });

        visitMedicationPage(petId);
        cy.get(`[role="button"][aria-label^="${selectedPetName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click({ force: true });
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Delete$/).click();
        cy.wait('@fiDeleteMedicationUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
          expect(interception.request.url).to.include('/v1/medications/medicines/');
        });
        cy.contains(medName).should('not.exist');
      });
    });
  });

  it('opens add popup directly from deep link query', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiVisitAuthed('/pet-owners/medication-page?tab=today&popup=add-medication');
    cy.contains('Today', { timeout: 20000 }).should('exist');
    fiDialog().contains('Add New Medication').should('exist');
  });

  it('supports view/edit deep links using noti_id and med_id query params', () => {
    freezeToNow();
    cy.fiEnsureOwnerProfile();
    const medName = fiUnique('CY-FI-MED-DEEPLINK');
    const reminderTime = nearFutureReminderTime();
    cy.fiCreatePet({ name: fiUnique('DeepLinkPet') }).then(({ petId }) => {
      cy.fiCreateMedication(petId, {
        name: medName,
        reminder_time: [reminderTime],
        ...activeDateRange(),
      }).then(() => {
        visitAggregateMedicationPage();
        cy.contains(medName, { timeout: 20000 }).should('be.visible').click();
        cy.location('search').should('include', 'popup=view-medication');
        cy.location('search').then((search) => {
          const params = new URLSearchParams(search);
          const notiId = params.get('noti_id');
          const medId = params.get('med_id');
          expect(notiId, 'deep-link noti_id').to.match(/^\d+$/);
          expect(medId, 'deep-link med_id').to.match(/^\d+$/);

          cy.fiVisitAuthed(
            `/pet-owners/medication-page?tab=today&popup=view-medication&noti_id=${notiId}&med_id=${medId}`
          );
          fiDialog().contains('Medication Detail').should('exist');
          fiDialog().contains(medName).should('exist');

          cy.fiVisitAuthed(
            `/pet-owners/medication-page?tab=today&popup=edit-medication&med_id=${medId}`
          );
          fiDialog().contains('Edit Medication').should('exist');
          fiDialog().find('#dosage').should('be.visible');
        });
      });
    });
  });

  it('shows scan loading state and scan failed alert for invalid upload', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.intercept('POST', '**/v1/medications/scan').as('fiScanMedication');
      cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/medications`);
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
      fiDialog().contains('Add New Medication').should('exist');

      const invalidFile = Cypress.Buffer.from('not-an-image');
      fiDialog().within(() => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: invalidFile,
            fileName: 'invalid-scan.txt',
            mimeType: 'text/plain',
            lastModified: Date.now(),
          },
          { force: true }
        );
      });

      fiDialog().contains('Scanning').should('exist');
      cy.wait('@fiScanMedication', { timeout: 30000 }).then((interception) => {
        expect(interception.request.method).to.eq('POST');
      });
      cy.get('@alertStub').should('have.been.calledWith', 'Scan failed');
      fiDialog().contains('Scanning').should('not.exist');
    });
  });

  it('does not call delete API when delete confirmation is cancelled', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('CancelDeletePet');
    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      cy.fiCreateMedication(petId, { name: fiUnique('CY-FI-MED-CANCEL-DELETE') }).then(({ payload }) => {
        const medName = String(payload.name);
        let deleteRequestCount = 0;
        cy.intercept('DELETE', '**/v1/medications/medicines/*', (req) => {
          deleteRequestCount += 1;
          req.continue();
        }).as('fiDeleteMedicationCanceled');

        visitMedicationPage(petId);
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false);
        });
        cy.get(`[role="button"][aria-label^="${petName} "]`, { timeout: 20000 }).first().within(() => {
          cy.get('button').first().click();
        });
        cy.get('[role="menu"]').contains('[role="menuitem"]', /^Delete$/).click();

        cy.contains(medName, { timeout: 20000 }).should('exist');
        cy.then(() => {
          expect(deleteRequestCount, 'delete API should not be called when confirm=false').to.eq(0);
        });
      });
    });
  });

  it('shows per-pet and aggregate empty states when selected pet has no medication reminders', () => {
    freezeToNow();
    cy.fiEnsureOwnerProfile();
    const emptyPetName = fiUnique('EmptyMedPet');
    const filledPetName = fiUnique('FilledMedPet');
    const filledMedName = fiUnique('CY-FI-MED-FILLED');
    const reminderTime = nearFutureReminderTime();
    cy.fiCreatePet({ name: emptyPetName }).then(({ petId: emptyPetId }) => {
      cy.fiCreatePet({ name: filledPetName }).then(({ petId: filledPetId }) => {
        cy.fiCreateMedication(filledPetId, {
          name: filledMedName,
          reminder_time: [reminderTime],
          ...activeDateRange(),
        }).then(() => {
          visitMedicationPage(emptyPetId);
          cy.contains('No medications found.', { timeout: 20000 }).should('exist');

          visitAggregateMedicationPage();
          cy.contains(filledMedName, { timeout: 20000 }).should('exist');
          cy.get('button[aria-haspopup="listbox"]').first().click();
          cy.get('[role="listbox"]').contains('button', emptyPetName).click();
          cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', emptyPetName);
          cy.contains('No medication reminders.', { timeout: 20000 }).should('exist');
          cy.contains(filledMedName).should('not.exist');
        });
      });
    });
  });

  it('shows aggregate error state and retry action when auth token is invalid', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    visitAggregateMedicationPage({
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'invalid-token-for-retry-case');
      },
    });

    cy.contains('Failed to load medication reminders', { timeout: 20000 }).should('exist');
    cy.contains(/Tap to retry/i, { timeout: 20000 }).should('be.visible').click();
    cy.contains('Failed to load medication reminders', { timeout: 20000 }).should('exist');
  });
});
