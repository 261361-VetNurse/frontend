import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique, fiDialog } from './helpers';

runForMobileViewports('Appointment flow (integration)', () => {
  const visitCalendarAppointmentPage = () => {
    cy.fiVisitAuthed('/pet-owners/calendar-page?tab=appointment');
    cy.contains('Appointment', { timeout: 20000 }).should('exist');
  };

  it('renders appointment calendar shell and opens seeded appointment detail', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-READ'),
        appointment_date: '2026-02-10T10:30:00',
      }).then(({ payload }) => {
        visitCalendarAppointmentPage();
        cy.contains(String((payload as any).location), { timeout: 20000 })
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
      }).then(({ payload }) => {
        const updatedLocation = fiUnique('CY-FI-APPT-UPDATED');
        visitCalendarAppointmentPage();
        cy.contains(String((payload as any).location), { timeout: 20000 })
          .should('be.visible')
          .click();
        fiDialog().within(() => {
          cy.contains('button', /^Edit$/).click();
        });
        fiDialog().contains('Edit Appointment').should('exist');
        fiDialog().within(() => {
          cy.get('input[type="time"]').clear().type('15:00');
          cy.get('input[placeholder="Enter location"]').clear().type(updatedLocation);
          cy.contains('button', /^Save$/).click();
        });
        cy.contains('Edit Appointment').should('not.exist');
        cy.contains(updatedLocation, { timeout: 20000 }).should('exist');
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
      }).then(({ payload }) => {
        visitCalendarAppointmentPage();
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        cy.contains(String((payload as any).location), { timeout: 20000 })
          .should('be.visible')
          .scrollIntoView()
          .click();
        fiDialog().should('exist').within(() => {
          cy.contains('button', /^Delete$/).click();
        });
        cy.get('[role="dialog"]:visible').should('not.exist');
      });
    });
  });

  it('opens deep link edit mode with real appointment id', () => {
    fiFreeze();
    cy.fiEnsureOwnerProfile();
    cy.fiCreatePet().then(({ petId }) => {
      cy.fiCreateAppointment(petId, {
        location: fiUnique('CY-FI-APPT-DEEPLINK'),
        appointment_date: '2026-02-10T09:45:00',
      }).then(({ appointmentId }) => {
        cy.fiVisitAuthed(`/pet-owners/calendar-page?tab=appointment&appointment_id=${appointmentId}&popup=edit-appointment`);
        cy.contains('Edit Appointment', { timeout: 20000 }).should('exist');
        cy.get('input[placeholder="Enter location"]').should('be.visible');
      });
    });
  });
});
