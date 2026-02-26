import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, FI_DATE, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Symptom flow (integration)', () => {
  type JsonMap = Record<string, unknown>;
  type SymptomCalendarRow = { note?: unknown; note_image?: unknown[] };

  const flattenCalendarRecords = (body: unknown) => {
    const root = (body && typeof body === 'object' ? body : {}) as JsonMap;
    const data = ('data' in root ? root.data : body) as unknown;
    if (!data || typeof data !== 'object') return [] as SymptomCalendarRow[];
    return Object.values(data as JsonMap).flat() as SymptomCalendarRow[];
  };

  const visitSymptomsPage = (petId: number) => {
    cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}/symptoms`);
    cy.contains('Pets Record', { timeout: 20000 }).should('exist');
  };

  const openCreateDialog = () => {
    cy.get('button[aria-label="Add record"]').should('be.visible').click();
    fiDialog().contains('Create Symptom Record').should('exist');
  };

  const openRecordDetail = (noteText: string) => {
    cy.contains(noteText, { timeout: 20000 }).should('be.visible').click();
    fiDialog().contains(/^Record$/).should('exist');
  };

  const assertRecordPersistedInApi = (
    petId: number,
    noteText: string,
    opts: { expectImages?: boolean } = {}
  ) => {
    cy.fiApi('GET', '/v1/symptom-records/calendar', undefined, {
      qs: { pet_id: petId },
    }).then((res) => {
      expect(res.status).to.eq(200);
      const rows = flattenCalendarRecords(res.body);
      const found = rows.find((row) => String(row.note ?? '') === noteText);
      expect(Boolean(found), `symptom record persisted for pet ${petId}`).to.eq(true);
      if (opts.expectImages) {
        const images = (found?.note_image ?? []) as unknown[];
        expect(images.length, 'persisted uploaded image count').to.be.greaterThan(0);
      }
    });
  };

  it('creates symptom record from UI', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteText = fiUnique('CY-FI-SYM-CREATE');
      cy.intercept('POST', '**/v1/symptom-records').as('fiCreateSymptomRecordUi');
      visitSymptomsPage(petId);
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('input[type="date"]').clear().type(FI_DATE);
        cy.get('input[type="time"]').type('13:30');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(noteText);
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.wait('@fiCreateSymptomRecordUi', { timeout: 30000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          pet_id: petId,
          note: noteText,
          date_added: FI_DATE,
          time_added: '13:30',
        });
        expect(interception.request.body.note_image ?? []).to.deep.eq([]);
      });
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(noteText, { timeout: 20000 }).should('exist');
      assertRecordPersistedInApi(petId, noteText);
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
        const originalNote = String((payload as Record<string, unknown>).note);
        const updatedNote = fiUnique('CY-FI-SYM-UPDATED');
        cy.intercept('PATCH', '**/v1/symptom-records/*').as('fiEditSymptomRecordUi');
        cy.intercept('DELETE', '**/v1/symptom-records/*').as('fiDeleteSymptomRecordUi');

        visitSymptomsPage(petId);
        cy.contains(originalNote, { timeout: 20000 }).should('be.visible').click();
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').clear().type(updatedNote);
          cy.contains('button', /^Save$/).should('not.be.disabled');
          cy.contains('button', /^Save$/).click();
        });
        cy.wait('@fiEditSymptomRecordUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
          expect(interception.request.body).to.include({
            note: updatedNote,
          });
          expect(interception.request.body.note_image).to.be.an('array');
        });
        cy.contains(updatedNote, { timeout: 20000 }).should('exist');
        assertRecordPersistedInApi(petId, updatedNote);

        cy.contains(updatedNote).should('be.visible').click();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });
        cy.wait('@fiDeleteSymptomRecordUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
        });
        cy.contains(updatedNote).should('not.exist');
        cy.fiApi('GET', '/v1/symptom-records/calendar', undefined, {
          qs: { pet_id: petId },
        }).then((res) => {
          const rows = flattenCalendarRecords(res.body);
          const exists = rows.some((row) => String(row.note ?? '') === updatedNote);
          expect(exists, 'deleted record removed from API').to.eq(false);
        });
      });
    });
  });

  it('blocks create submit when required note is empty (validation behavior)', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      let createRequestCount = 0;
      cy.intercept('POST', '**/v1/symptom-records', (req) => {
        createRequestCount += 1;
        req.continue();
      }).as('fiCreateSymptomShouldNotSubmit');

      visitSymptomsPage(petId);
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('textarea[placeholder="Describe symptoms..."]').should('have.value', '');
        cy.contains('button', /^Add New Record$/).click();
      });
      fiDialog().contains('Create Symptom Record').should('exist');
      cy.then(() => {
        expect(createRequestCount, 'create API should not be called with missing note').to.eq(0);
      });
    });
  });

  it('disables save when edit note is empty and does not send PATCH (validation behavior)', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-SYM-VALID-EDIT'),
        date_added: FI_DATE,
        time_added: '11:00',
      }).then(({ payload }) => {
        let patchRequestCount = 0;
        const originalNote = String((payload as Record<string, unknown>).note);
        cy.intercept('PATCH', '**/v1/symptom-records/*', (req) => {
          patchRequestCount += 1;
          req.continue();
        }).as('fiPatchSymptomShouldNotSubmit');

        visitSymptomsPage(petId);
        openRecordDetail(originalNote);
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });

        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').clear().type('   ');
          cy.contains('button', /^Save$/).should('be.disabled');
        });

        fiDialog().contains('Edit Record').should('exist');
        cy.then(() => {
          expect(patchRequestCount, 'edit API should not be called when save is disabled').to.eq(0);
        });
      });
    });
  });

  it('keeps record when user cancels delete confirmation', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-SYM-KEEP'),
        date_added: FI_DATE,
        time_added: '10:45',
      }).then(({ payload }) => {
        const noteText = String((payload as Record<string, unknown>).note);
        let deleteRequestCount = 0;
        cy.intercept('DELETE', '**/v1/symptom-records/*', (req) => {
          deleteRequestCount += 1;
          req.continue();
        }).as('fiDeleteSymptomCanceled');

        visitSymptomsPage(petId);
        openRecordDetail(noteText);
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false);
        });
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });

        fiDialog().contains(/^Record$/).should('exist');
        cy.contains(noteText).should('exist');
        cy.then(() => {
          expect(deleteRequestCount, 'delete API should not be called when confirm=false').to.eq(0);
        });
        assertRecordPersistedInApi(petId, noteText);
      });
    });
  });

  it('persists symptom record after refresh and revisit', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-SYM-PERSIST'),
        date_added: FI_DATE,
        time_added: '08:30',
      }).then(({ payload }) => {
        const noteText = String((payload as Record<string, unknown>).note);
        visitSymptomsPage(petId);
        cy.contains(noteText, { timeout: 20000 }).should('exist');

        cy.reload();
        cy.contains('Pets Record', { timeout: 20000 }).should('exist');
        cy.contains(noteText, { timeout: 20000 }).should('exist');

        cy.fiVisitAuthed(`/pet-owners/my-pets-page/${petId}`);
        cy.contains('Pets Information', { timeout: 20000 }).should('exist');
        visitSymptomsPage(petId);
        cy.contains(noteText, { timeout: 20000 }).should('exist');
      });
    });
  });

  it('shows empty state when selected pet has no symptom records for selected date', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      visitSymptomsPage(petId);
      cy.contains('No records', { timeout: 20000 }).should('exist');
    });
  });

  it('renders multiple records in chronological order for the selected date', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteMorning = fiUnique('CY-FI-SYM-ORDER-AM');
      const noteNoon = fiUnique('CY-FI-SYM-ORDER-NOON');
      const noteEvening = fiUnique('CY-FI-SYM-ORDER-PM');

      cy.fiCreateSymptomRecord(petId, { note: noteEvening, date_added: FI_DATE, time_added: '18:30' });
      cy.fiCreateSymptomRecord(petId, { note: noteMorning, date_added: FI_DATE, time_added: '08:45' });
      cy.fiCreateSymptomRecord(petId, { note: noteNoon, date_added: FI_DATE, time_added: '12:15' });

      visitSymptomsPage(petId);
      cy.contains(noteMorning, { timeout: 20000 }).should('exist');
      cy.contains(noteNoon).should('exist');
      cy.contains(noteEvening).should('exist');

      cy.get('body').invoke('text').then((pageText) => {
        const morningIdx = pageText.indexOf(noteMorning);
        const noonIdx = pageText.indexOf(noteNoon);
        const eveningIdx = pageText.indexOf(noteEvening);
        expect(morningIdx, 'morning note position').to.be.greaterThan(-1);
        expect(noonIdx, 'noon note position').to.be.greaterThan(morningIdx);
        expect(eveningIdx, 'evening note position').to.be.greaterThan(noonIdx);
      });
    });
  });

  it('uploads image with real presigned URL + R2 PUT', () => {
    fiFreeze();
    cy.fiRequireR2UploadReady();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteText = fiUnique('CY-FI-SYM-UP');
      cy.intercept('POST', '**/api/upload/presigned-url').as('fiSymptomPresignedUrl');
      cy.intercept('POST', '**/v1/symptom-records').as('fiCreateSymptomWithUploadUi');
      visitSymptomsPage(petId);
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('input[type="date"]').clear().type(FI_DATE);
        cy.get('input[type="time"]').type('10:15');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(noteText);
        cy.get('input[type="file"]').selectFile('cypress/img-test/test-1.jpeg', { force: true });
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.wait('@fiSymptomPresignedUrl', { timeout: 60000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          folder: 'records',
        });
      });
      cy.wait('@fiCreateSymptomWithUploadUi', { timeout: 60000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body.note).to.eq(noteText);
        const uploadedImages = (interception.request.body.note_image ?? []) as unknown[];
        expect(uploadedImages.length, 'uploaded image URLs in create payload').to.be.greaterThan(0);
      });
      cy.get('[role="dialog"]:visible', { timeout: 60000 }).should('not.exist');
      cy.contains(noteText, { timeout: 20000 }).should('exist');
      openRecordDetail(noteText);
      fiDialog().contains('Image').should('exist');
      fiDialog().find('img').its('length').should('be.greaterThan', 0);
      assertRecordPersistedInApi(petId, noteText, { expectImages: true });
    });
  });

  it.skip('shows create error feedback when create API returns 500 and keeps dialog open', () => {
    // Expected behavior after UX improvements:
    // - POST /v1/symptom-records returns 500
    // - user sees error feedback (alert/toast/inline message)
    // - create dialog remains open and entered note is preserved
  });

  it.skip('shows edit error feedback when PATCH API returns 500 and keeps edit dialog open', () => {
    // Expected behavior after UX improvements:
    // - PATCH /v1/symptom-records/:id returns 500
    // - user sees error feedback
    // - edit dialog remains open without losing form state
  });

  it.skip('shows delete error feedback when DELETE API returns 500 and keeps record visible', () => {
    // Expected behavior after UX improvements:
    // - DELETE /v1/symptom-records/:id returns 500
    // - user sees error feedback
    // - record remains in list and detail popup closes/behaves consistently
  });

  it.skip('handles presigned URL failure by keeping create dialog open and not calling create API', () => {
    // Expected behavior after UX improvements:
    // - POST /api/upload/presigned-url returns 500
    // - dialog stays open with selected note/file state or clear user feedback
    // - POST /v1/symptom-records is not called
  });

  it.skip('handles R2 PUT upload failure by keeping create dialog open and not calling create API', () => {
    // Expected behavior after UX improvements:
    // - presigned URL succeeds but PUT upload fails
    // - dialog stays open with user feedback
    // - POST /v1/symptom-records is not called
  });
});
