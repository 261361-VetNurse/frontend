import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, FI_DATE, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Calendar record flow (integration)', () => {
  type JsonMap = Record<string, unknown>;
  type SymptomCalendarRow = { record_id?: unknown; note?: unknown; pet_id?: unknown };

  const flattenCalendarRecords = (body: unknown) => {
    const root = (body && typeof body === 'object' ? body : {}) as JsonMap;
    const data = ('data' in root ? root.data : body) as unknown;
    if (!data || typeof data !== 'object') return [] as SymptomCalendarRow[];
    return Object.values(data as JsonMap).flat() as SymptomCalendarRow[];
  };

  const findRecordById = (body: unknown, recordId: number) => {
    const rows = flattenCalendarRecords(body);
    return rows.find((row) => Number(row.record_id) === Number(recordId));
  };

  const visitCalendarRecordPage = () => {
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record');
    cy.contains('Record', { timeout: 20000 }).should('exist');
  };

  const openCreateDialog = () => {
    cy.get('button[aria-label="Quick dial button"]:visible').first().click();
    fiDialog().contains('Create Symptom Record').should('exist');
  };

  const openRecordDetail = (noteText: string) => {
    cy.contains(noteText, { timeout: 20000 }).should('be.visible').click();
    fiDialog().contains(/^Record$/).should('exist');
  };

  const assertRecordPersistedInApi = (petId: number, noteText: string) => {
    cy.fiApi('GET', '/v1/symptom-records/calendar', undefined, {
      qs: { pet_id: petId },
    }).then((res) => {
      expect(res.status).to.eq(200);
      const rows = flattenCalendarRecords(res.body);
      const found = rows.find((row) => String(row.note ?? '') === noteText);
      expect(Boolean(found), `symptom record persisted for pet ${petId}`).to.eq(true);
    });
  };

  it('handles unauthenticated access on calendar record page', () => {
    cy.visit('/pet-owners/calendar-page?tab=record');
    cy.location('pathname', { timeout: 20000 }).should((pathname) => {
      expect(
        ['/pet-owners/login-page', '/pet-owners/calendar-page'],
        'route can either redirect to login or render calendar shell without token'
      ).to.include(pathname);
    });
    cy.location('pathname').then((pathname) => {
      if (pathname === '/pet-owners/calendar-page') {
        cy.contains('Record', { timeout: 20000 }).should('exist');
      }
    });
  });

  it('creates record from popup and persists in API', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const calPetName = fiUnique('CalPet');
    cy.fiCreatePet({ name: calPetName }).then(({ petId }) => {
      const note = fiUnique('CY-FI-CAL-REC');
      cy.intercept('POST', '**/v1/symptom-records').as('fiCreateRecordFromCalendar');
      visitCalendarRecordPage();

      openCreateDialog();
      fiDialog().within(() => {
        cy.get('button[aria-haspopup="listbox"]').first().click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.contains('button', calPetName).click();
        cy.get('input[type="date"]').clear().type(FI_DATE);
        cy.get('input[type="time"]').type('12:30');
        cy.get('textarea[placeholder="Describe symptoms..."]').type(note);
        cy.contains('button', /^Add New Record$/).click();
      });
      cy.wait('@fiCreateRecordFromCalendar', { timeout: 30000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          pet_id: petId,
          note,
          date_added: FI_DATE,
          time_added: '12:30',
        });
      });
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(note, { timeout: 20000 }).should('exist');
      assertRecordPersistedInApi(petId, note);
    });
  });

  it('opens seeded record detail popup from list', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-CAL-DETAIL'),
        date_added: FI_DATE,
        time_added: '10:20',
      }).then(({ payload }) => {
        const seededNote = String((payload as Record<string, unknown>).note);
        visitCalendarRecordPage();
        openRecordDetail(seededNote);
        fiDialog().within(() => {
          cy.contains('Date').should('exist');
          cy.contains('Time').should('exist');
          cy.contains('Note').should('exist');
          cy.contains('button', /^Edit$/).should('exist');
          cy.contains('button', /^Delete$/).should('exist');
        });
      });
    });
  });

  it('edits seeded record from detail popup and persists updated values', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-CAL-EDIT-OLD'),
        date_added: FI_DATE,
        time_added: '09:30',
      }).then(({ payload, recordId }) => {
        const originalNote = String((payload as Record<string, unknown>).note);
        const updatedNote = fiUnique('CY-FI-CAL-EDIT-NEW');
        cy.intercept('PATCH', `**/v1/symptom-records/${recordId}`).as('fiEditRecordUi');

        visitCalendarRecordPage();
        openRecordDetail(originalNote);
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').clear().type(updatedNote);
          cy.contains('button', /^Save$/).click();
        });

        cy.wait('@fiEditRecordUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
          expect(interception.request.body).to.include({
            note: updatedNote,
            date_added: FI_DATE,
            time_added: '09:30',
          });
        });
        cy.contains('Edit Record').should('not.exist');
        cy.contains(updatedNote, { timeout: 20000 }).should('exist');
        cy.fiApi('GET', '/v1/symptom-records/calendar', undefined, {
          qs: { pet_id: petId },
        }).then((res) => {
          const found = findRecordById(res.body, recordId);
          expect(Boolean(found), `updated record ${recordId} still exists`).to.eq(true);
          expect(String(found?.note ?? '')).to.eq(updatedNote);
        });
      });
    });
  });

  it('deletes seeded record after confirm and removes it from API', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-CAL-DELETE'),
        date_added: FI_DATE,
        time_added: '15:10',
      }).then(({ payload, recordId }) => {
        const noteText = String((payload as Record<string, unknown>).note);
        cy.intercept('DELETE', `**/v1/symptom-records/${recordId}`).as('fiDeleteRecordUi');

        visitCalendarRecordPage();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        openRecordDetail(noteText);
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });

        cy.wait('@fiDeleteRecordUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
        });
        cy.get('[role="dialog"]:visible').should('not.exist');
        cy.contains(noteText).should('not.exist');
        cy.fiApi('GET', '/v1/symptom-records/calendar', undefined, {
          qs: { pet_id: petId },
        }).then((res) => {
          const found = findRecordById(res.body, recordId);
          expect(Boolean(found), `deleted record ${recordId} removed from API`).to.eq(false);
        });
      });
    });
  });

  it('keeps record when user cancels delete confirmation', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-CAL-KEEP'),
        date_added: FI_DATE,
        time_added: '15:45',
      }).then(({ payload }) => {
        const noteText = String((payload as Record<string, unknown>).note);
        let deleteRequestCount = 0;
        cy.intercept('DELETE', '**/v1/symptom-records/*', (req) => {
          deleteRequestCount += 1;
          req.continue();
        }).as('fiDeleteRecordCanceled');

        visitCalendarRecordPage();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false);
        });
        openRecordDetail(noteText);
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });

        fiDialog().contains(/^Record$/).should('exist');
        cy.then(() => {
          expect(deleteRequestCount, 'delete API should not be called when confirmation is canceled').to.eq(0);
        });
        cy.contains(noteText, { timeout: 20000 }).should('exist');
      });
    });
  });

  it('blocks create submit when required note is empty (validation behavior)', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet({ name: fiUnique('CY-FI-CAL-VALID-PET') }).then(() => {
      let createRequestCount = 0;
      cy.intercept('POST', '**/v1/symptom-records', (req) => {
        createRequestCount += 1;
        req.continue();
      }).as('fiCreateRecordShouldNotSubmit');

      visitCalendarRecordPage();
      openCreateDialog();
      fiDialog().within(() => {
        cy.get('textarea[placeholder="Describe symptoms..."]').clear();
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
        note: fiUnique('CY-FI-CAL-VALID-EDIT'),
        date_added: FI_DATE,
        time_added: '11:00',
      }).then(({ payload }) => {
        const originalNote = String((payload as Record<string, unknown>).note);
        let patchRequestCount = 0;
        cy.intercept('PATCH', '**/v1/symptom-records/*', (req) => {
          patchRequestCount += 1;
          req.continue();
        }).as('fiPatchRecordShouldNotSubmit');

        visitCalendarRecordPage();
        openRecordDetail(originalNote);
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').clear().type('   ');
          cy.contains('button', /^Save$/).should('be.disabled');
        });
        cy.then(() => {
          expect(patchRequestCount, 'edit API should not be called when save is disabled').to.eq(0);
        });
      });
    });
  });

  it('opens deep-link view mode and loads the correct record detail', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteText = fiUnique('CY-FI-CAL-DEEPLINK-VIEW');
      cy.fiCreateSymptomRecord(petId, {
        note: noteText,
        date_added: FI_DATE,
        time_added: '10:05',
      }).then(({ recordId }) => {
        cy.fiVisitAuthed(`/pet-owners/calendar-page?tab=record&record_id=${recordId}&popup=view-record`);
        fiDialog().contains(/^Record$/).should('exist');
        fiDialog().within(() => {
          cy.contains('Note').should('exist');
          cy.contains(noteText).should('exist');
          cy.contains('button', /^Edit$/).should('exist');
        });
      });
    });
  });

  it('opens deep-link add mode and shows create popup', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(() => {
      cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record&popup=add-record');
      fiDialog().contains('Create Symptom Record').should('exist');
      fiDialog().contains('button', /^Add New Record$/).should('exist');
    });
  });

  it('opens deep-link edit mode with valid record id', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteText = fiUnique('CY-FI-CAL-DEEPLINK-EDIT');
      cy.fiCreateSymptomRecord(petId, {
        note: noteText,
        date_added: FI_DATE,
        time_added: '10:35',
      }).then(({ recordId }) => {
        cy.fiVisitAuthed(`/pet-owners/calendar-page?tab=record&record_id=${recordId}&popup=edit-record`);
        fiDialog().contains('Edit Record').should('exist');
        fiDialog().within(() => {
          cy.get('textarea').should('have.value', noteText);
          cy.contains('button', /^Save$/).should('exist');
        });
      });
    });
  });

  it('keeps popups closed when deep-link record id is invalid', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record&record_id=999999999&popup=view-record');
    cy.contains('Record', { timeout: 20000 }).should('exist');
    cy.get('[role="dialog"]:visible').should('not.exist');

    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record&record_id=999999999&popup=edit-record');
    cy.contains('Record', { timeout: 20000 }).should('exist');
    cy.get('[role="dialog"]:visible').should('not.exist');
  });

  it('shows error state and supports retry when record fetch fails with invalid token', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', '**/v1/symptom-records/calendar*').as('fiRecordsUnauthorized');
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=record', {
      onBeforeLoad(win: Window) {
        win.localStorage.setItem('auth_token', 'invalid-token-for-calendar-record-error-case');
      },
    });

    cy.wait('@fiRecordsUnauthorized', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 401);
    cy.contains('Failed to load symptom records', { timeout: 20000 }).should('exist');
    cy.contains(/Tap to retry/i, { timeout: 20000 }).should('be.visible').click();
    cy.get('body', { timeout: 20000 }).should(($body) => {
      const text = $body.text();
      expect(
        text.includes('Failed to load symptom records') || text.includes('No records on this date'),
        'after retry UI can remain in error state or fall back to empty state'
      ).to.eq(true);
    });
  });

  it('renders multiple records in chronological order for the selected date', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteMorning = fiUnique('CY-FI-CAL-ORDER-AM');
      const noteNoon = fiUnique('CY-FI-CAL-ORDER-NOON');
      const noteEvening = fiUnique('CY-FI-CAL-ORDER-PM');

      cy.fiCreateSymptomRecord(petId, { note: noteEvening, date_added: FI_DATE, time_added: '18:30' });
      cy.fiCreateSymptomRecord(petId, { note: noteMorning, date_added: FI_DATE, time_added: '08:45' });
      cy.fiCreateSymptomRecord(petId, { note: noteNoon, date_added: FI_DATE, time_added: '12:15' });

      visitCalendarRecordPage();
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

  it('persists seeded record after refresh and revisit', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateSymptomRecord(petId, {
        note: fiUnique('CY-FI-CAL-PERSIST'),
        date_added: FI_DATE,
        time_added: '08:30',
      }).then(({ payload }) => {
        const noteText = String((payload as Record<string, unknown>).note);
        visitCalendarRecordPage();
        cy.contains(noteText, { timeout: 20000 }).should('exist');

        cy.reload();
        cy.contains('Record', { timeout: 20000 }).should('exist');
        cy.contains(noteText, { timeout: 20000 }).should('exist');

        cy.fiVisitAuthed('/pet-owners/home-page');
        cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/home-page');
        cy.contains('My Pets', { timeout: 20000 }).should('exist');
        visitCalendarRecordPage();
        cy.contains(noteText, { timeout: 20000 }).should('exist');
      });
    });
  });

  it('switches selected day on calendar and updates visible record list', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const noteToday = fiUnique('CY-FI-CAL-DATE-10');
      const noteNextDay = fiUnique('CY-FI-CAL-DATE-11');
      cy.fiCreateSymptomRecord(petId, { note: noteToday, date_added: FI_DATE, time_added: '10:00' });
      cy.fiCreateSymptomRecord(petId, { note: noteNextDay, date_added: '2026-02-11', time_added: '11:10' });

      visitCalendarRecordPage();
      cy.get('span.bg-pink-500, span.bg-zinc-300').its('length').should('be.greaterThan', 0);
      cy.contains(noteToday, { timeout: 20000 }).should('exist');
      cy.contains(noteNextDay).should('not.exist');

      cy.contains('button', /^11$/).first().click();
      cy.contains(noteNextDay, { timeout: 20000 }).should('exist');
      cy.contains(noteToday).should('not.exist');
    });
  });

  it('shows empty state when selected date has no records', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(() => {
      visitCalendarRecordPage();
      cy.contains('No records on this date', { timeout: 20000 }).should('exist');
    });
  });
});
