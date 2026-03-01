import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Appointment flow (integration)', () => {
  const unwrapList = (body: unknown) => {
    const root = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const rows = (root.data ?? body) as unknown;
    return Array.isArray(rows) ? rows : [];
  };

  const findAppointmentById = (body: unknown, appointmentId: number) => {
    const rows = unwrapList(body) as Array<Record<string, unknown>>;
    return rows.find((row) => Number(row.appointment_id) === Number(appointmentId));
  };

  const payloadLocation = (payload: unknown) => {
    const row = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
    return String(row.location ?? '');
  };

  const visitCalendarAppointmentPage = () => {
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=appointment');
    cy.contains('Appointment', { timeout: 20000 }).should('exist');
  };
  
//เทสต์ของหน้า calendar appointment
  it('handles unauthenticated access on calendar appointment page', () => {
    cy.visit('/pet-owners/calendar-page?tab=appointment');
    cy.location('pathname', { timeout: 20000 }).should((pathname) => {
      expect(
        ['/pet-owners/login-page', '/pet-owners/calendar-page'],
        'route can either redirect to login or render calendar shell without token'
      ).to.include(pathname);
    });
    cy.location('pathname').then((pathname) => {
      if (pathname === '/pet-owners/calendar-page') {
        cy.contains('Appointment', { timeout: 20000 }).should('exist');
      }
    });
  });

  it('creates appointment from calendar quick action popup and persists in API', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petName = fiUnique('CY-FI-APPT-CREATE-PET');
    cy.fiCreatePet({ name: petName }).then(({ petId }) => {
      const newLocation = fiUnique('CY-FI-APPT-CREATE');
      const newNote = fiUnique('CY-FI-APPT-NOTE');
      cy.intercept('POST', '**/v1/appointments').as('fiCreateAppointmentFromCalendar');
      visitCalendarAppointmentPage();

      cy.get('button[aria-label="Quick dial button"]').should('be.visible').click();
      fiDialog().contains('Create Appointment').should('exist');
      fiDialog().within(() => {
        cy.get('button[aria-haspopup="listbox"]').first().click();
        cy.get('[role="listbox"]').contains('button', petName).click();
        cy.get('input[type="date"]').clear().type('2026-02-10');
        cy.get('input[type="time"]').type('11:20');
        cy.get('input[placeholder="e.g. Examination Room"]').type(newLocation);
        cy.get('input[placeholder="e.g. Any additional notes or instructions"]').type(newNote);
        cy.contains('button', /^Add New Appointment$/).click();
      });

      cy.wait('@fiCreateAppointmentFromCalendar', { timeout: 30000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          pet_id: petId,
          location: newLocation,
          note: newNote,
          status: 'Upcoming',
        });
      });
      cy.get('[role="dialog"]:visible').should('not.exist');
      cy.contains(newLocation, { timeout: 20000 }).should('exist');

      cy.fiApi('GET', '/v1/appointments').then((res) => {
        const rows = unwrapList(res.body) as Array<Record<string, unknown>>;
        const found = rows.some((row) =>
          Number(row.pet_id) === Number(petId) && String(row.location ?? '') === newLocation
        );
        expect(found, `created appointment persisted for pet ${petId}`).to.eq(true);
      });
    });
  });

  it('renders appointment calendar shell and opens seeded appointment detail', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-READ'),
        appointment_date: '2026-02-10T10:30:00',
      }).then(({ payload }) => {
        visitCalendarAppointmentPage();
        cy.contains(payloadLocation(payload), { timeout: 20000 })
          .should('be.visible')
          .click();
        fiDialog().should('exist');
        fiDialog().within(() => {
          cy.contains('Location').should('exist');
          cy.contains('Date').should('exist');
          cy.contains('Time').should('exist');
          cy.contains('button', /^Edit$/).should('exist');
          cy.contains('button', /^Delete$/).should('exist');
        });
      });
    });
  });

  it('edits seeded appointment from detail popup', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-EDIT'),
        appointment_date: '2026-02-10T12:00:00',
        note: fiUnique('CY-FI-APPT-EDIT-NOTE'),
      }).then(({ payload, appointmentId }) => {
        const updatedLocation = fiUnique('CY-FI-APPT-UPDATED');
        const updatedNote = fiUnique('CY-FI-APPT-UPDATED-NOTE');
        cy.intercept('PATCH', `**/v1/appointments/${appointmentId}`).as('fiEditAppointmentUi');
        visitCalendarAppointmentPage();
        cy.contains(payloadLocation(payload), { timeout: 20000 })
          .should('be.visible')
          .click();
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Appointment').should('exist');
        fiDialog().within(() => {
          cy.get('input[type="time"]').clear().type('15:00');
          cy.get('input[placeholder="Enter location"]').clear().type(updatedLocation);
          cy.get('input[placeholder="Enter note"]').clear().type(updatedNote);
          cy.contains('button', /^Save$/).click();
        });
        cy.wait('@fiEditAppointmentUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
          expect(interception.request.body).to.include({
            pet_id: petId,
            location: updatedLocation,
            note: updatedNote,
            status: 'Upcoming',
          });
        });
        cy.contains('Edit Appointment').should('not.exist');
        cy.contains(updatedLocation, { timeout: 20000 }).should('exist');
        cy.fiApi('GET', '/v1/appointments').then((res) => {
          const found = findAppointmentById(res.body, appointmentId) as Record<string, unknown> | undefined;
          expect(Boolean(found), `updated appointment ${appointmentId} still exists`).to.eq(true);
          expect(String(found?.location ?? '')).to.eq(updatedLocation);
        });
        cy.fiApi('GET', `/v1/appointments/${appointmentId}`).then((res) => {
          const detail = (res.body && typeof res.body === 'object' ? res.body : {}) as Record<string, unknown>;
          const data = ((detail.data ?? detail) && typeof (detail.data ?? detail) === 'object'
            ? (detail.data ?? detail)
            : {}) as Record<string, unknown>;
          expect(String(data.location ?? '')).to.eq(updatedLocation);
          expect(String(data.note ?? '')).to.eq(updatedNote);
        });
      });
    });
  });

  it('deletes seeded appointment after confirm', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-DELETE'),
        appointment_date: '2026-02-10T16:00:00',
      }).then(({ payload, appointmentId }) => {
        cy.intercept('DELETE', `**/v1/appointments/${appointmentId}`).as('fiDeleteAppointmentUi');
        visitCalendarAppointmentPage();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        cy.contains(payloadLocation(payload), { timeout: 20000 })
          .should('be.visible')
          .scrollIntoView()
          .click();
        fiDialog().should('exist').within(() => {
          cy.contains('button', /^Delete$/).click();
        });
        cy.wait('@fiDeleteAppointmentUi', { timeout: 30000 }).then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
        });
        cy.get('[role="dialog"]:visible').should('not.exist');
        cy.contains(payloadLocation(payload)).should('not.exist');
        cy.fiApi('GET', '/v1/appointments').then((res) => {
          const found = findAppointmentById(res.body, appointmentId);
          expect(Boolean(found), `deleted appointment ${appointmentId} removed from API`).to.eq(false);
        });
      });
    });
  });

  it('keeps appointment when user cancels delete confirmation', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-DELETE-CANCEL'),
        appointment_date: '2026-02-10T16:30:00',
      }).then(({ payload, appointmentId }) => {
        let deleteRequestCount = 0;
        cy.intercept('DELETE', `**/v1/appointments/${appointmentId}`, (req) => {
          deleteRequestCount += 1;
          req.continue();
        }).as('fiDeleteAppointmentCanceled');

        visitCalendarAppointmentPage();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(false);
        });
        cy.contains(payloadLocation(payload), { timeout: 20000 }).should('be.visible').click();
        fiDialog().within(() => {
          cy.contains('button', /^Delete$/).click();
        });
        fiDialog().contains('Appointment').should('exist');
        cy.then(() => {
          expect(deleteRequestCount, 'delete API should not be called when confirmation is canceled').to.eq(0);
        });
        cy.contains(payloadLocation(payload), { timeout: 20000 }).should('exist');
      });
    });
  });

  it('opens deep link view mode and loads the correct appointment detail', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const location = fiUnique('CY-FI-APPT-DEEPLINK-VIEW');
      const note = fiUnique('CY-FI-APPT-DEEPLINK-VIEW-NOTE');
      cy.fiCreateAppointment(petId, {
        location,
        note,
        appointment_date: '2026-02-10T09:15:00',
      }).then(({ appointmentId }) => {
        cy.fiVisitAuthed(
          `/pet-owners/calendar-page?tab=appointment&appointment_id=${appointmentId}&popup=view-appointment`
        );
        fiDialog().contains('Appointment').should('exist');
        fiDialog().within(() => {
          cy.contains('Location').should('exist');
          cy.contains(location).should('exist');
          cy.contains('Note').should('exist');
          cy.contains(note).should('exist');
          cy.contains('button', /^Edit$/).should('exist');
        });
      });
    });
  });

  it('opens deep link edit mode with real appointment id', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      const location = fiUnique('CY-FI-APPT-DEEPLINK');
      const note = fiUnique('CY-FI-APPT-DEEPLINK-NOTE');
      cy.fiCreateAppointment(petId, {
        location,
        note,
        appointment_date: '2026-02-10T09:45:00',
      }).then(({ appointmentId }) => {
        cy.fiVisitAuthed(`/pet-owners/calendar-page?tab=appointment&appointment_id=${appointmentId}&popup=edit-appointment`);
        cy.contains('Edit Appointment', { timeout: 20000 }).should('exist');
        cy.get('input[placeholder="Enter location"]').should('have.value', location);
        cy.get('input[placeholder="Enter note"]').should('have.value', note);
      });
    });
  });

  it('shows calendar error state and supports retry when appointment fetch fails with invalid token', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', '**/v1/appointments').as('fiAppointmentsUnauthorized');
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=appointment', {
      onBeforeLoad(win: Window) {
        win.localStorage.setItem('auth_token', 'invalid-token-for-appointment-error-case');
      },
    });

    cy.wait('@fiAppointmentsUnauthorized', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 401);
    cy.contains('Failed to load appointments', { timeout: 20000 }).should('exist');
    cy.contains(/Tap to retry/i, { timeout: 20000 }).should('be.visible').click();
    cy.get('body', { timeout: 20000 }).should(($body) => {
      const text = $body.text();
      expect(
        text.includes('Failed to load appointments') || text.includes('No appointments on this date'),
        'after retry UI can remain in error state or fall back to empty state'
      ).to.eq(true);
    });
  });

  it('keeps popups closed when deep-link appointment id is invalid', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();

    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=appointment&appointment_id=999999999&popup=view-appointment');
    cy.contains('Appointment', { timeout: 20000 }).should('exist');
    cy.get('[role="dialog"]:visible').should('not.exist');

    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=appointment&appointment_id=999999999&popup=edit-appointment');
    cy.contains('Appointment', { timeout: 20000 }).should('exist');
    cy.get('[role="dialog"]:visible').should('not.exist');
  });

  it('shows validation alert and blocks create submit when required fields are missing', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(() => {
      let createRequestCount = 0;
      cy.intercept('POST', '**/v1/appointments', (req) => {
        createRequestCount += 1;
        req.continue();
      }).as('fiCreateAppointmentShouldNotSubmit');

      visitCalendarAppointmentPage();
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });
      cy.get('button[aria-label="Quick dial button"]').click();
      fiDialog().contains('Create Appointment').should('exist');
      fiDialog().within(() => {
        cy.contains('button', /^Add New Appointment$/).click();
      });
      cy.get('@alertStub').should('have.been.calledWith', 'Please fill in all fields (Date, Time, Location).');
      fiDialog().contains('Create Appointment').should('exist');
      cy.then(() => {
        expect(createRequestCount, 'create API should not be called when required fields are missing').to.eq(0);
      });
    });
  });

  it('shows validation alert and blocks edit submit when note is empty', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-VALID-EDIT'),
        note: fiUnique('CY-FI-APPT-VALID-EDIT-NOTE'),
        appointment_date: '2026-02-10T14:30:00',
      }).then(({ payload, appointmentId }) => {
        let patchRequestCount = 0;
        cy.intercept('PATCH', `**/v1/appointments/${appointmentId}`, (req) => {
          patchRequestCount += 1;
          req.continue();
        }).as('fiEditAppointmentShouldNotSubmit');

        visitCalendarAppointmentPage();
        cy.window().then((win) => {
          cy.stub(win, 'alert').as('alertStub');
        });
        cy.contains(payloadLocation(payload), { timeout: 20000 }).should('be.visible').click();
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Appointment').should('exist');
        fiDialog().within(() => {
          cy.get('input[placeholder="Enter note"]').clear().type('   ');
          cy.contains('button', /^Save$/).click();
        });

        cy.get('@alertStub').should('have.been.calledWith', 'The data filed not valid');
        fiDialog().contains('Edit Appointment').should('exist');
        cy.then(() => {
          expect(patchRequestCount, 'edit API should not be called when note is invalid').to.eq(0);
        });
      });
    });
  });

  it('filters appointments by selected pet from calendar page selector', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    const petOne = fiUnique('CY-FI-APPT-FILTER-1');
    const petTwo = fiUnique('CY-FI-APPT-FILTER-2');
    const locOne = fiUnique('CY-FI-APPT-FILTER-LOC-1');
    const locTwo = fiUnique('CY-FI-APPT-FILTER-LOC-2');
    cy.fiCreatePet({ name: petOne }).then(({ petId: petId1 }) => {
      cy.fiCreatePet({ name: petTwo }).then(({ petId: petId2 }) => {
        cy.fiCreateAppointment(petId1, {
          location: locOne,
          appointment_date: '2026-02-10T08:40:00',
        }).then(() => {
          cy.fiCreateAppointment(petId2, {
            location: locTwo,
            appointment_date: '2026-02-10T08:45:00',
          }).then(() => {
            visitCalendarAppointmentPage();
            cy.contains(locOne, { timeout: 20000 }).should('exist');
            cy.contains(locTwo, { timeout: 20000 }).should('exist');

            cy.get('button[aria-haspopup="listbox"]').first().click();
            cy.get('[role="listbox"]').contains('button', petTwo).click();
            cy.get('button[aria-haspopup="listbox"]').first().should('contain.text', petTwo);
            cy.contains(locTwo, { timeout: 20000 }).should('exist');
            cy.contains(locOne).should('not.exist');
          });
        });
      });
    });
  });

  it('shows empty state when selected date has no appointments', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-OTHER-DATE'),
        appointment_date: '2026-02-11T08:00:00',
      }).then(() => {
        visitCalendarAppointmentPage();
        cy.contains('No appointments on this date', { timeout: 20000 }).should('exist');
      });
    });
  });
});
