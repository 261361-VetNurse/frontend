import { runForMobileViewports } from '../../support/mobileViewports';
import { fiFreeze, fiUnique } from './helpers';

const notificationFeedEndpoint = '**/v1/notifications';
const markMedicationTakenEndpoint = '**/v1/medications/*/taken';

type MockNotification = {
  type: 'medicine' | 'appointment';
  notification_id: number;
  title: string;
  notification_at: string;
  is_read: boolean;
  status: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function visitNotificationsPage(options: Partial<Cypress.VisitOptions> = {}) {
  cy.fiVisitAuthed('/pet-owners/notification-page', options);
}

function expandUpcomingIfPresent(targetText?: string) {
  cy.get('body').then(($body) => {
    const targetAlreadyVisible = targetText ? $body.text().includes(targetText) : false;
    const upcomingButton = $body
      .find('button')
      .filter((_, element) => element.textContent?.trim() === 'Upcoming' && Cypress.$(element).is(':visible'));

    if (!targetAlreadyVisible && upcomingButton.length > 0) {
      cy.wrap(upcomingButton.first()).click();
    }
  });
}

function notificationCard(text: string) {
  return cy.contains(text, { timeout: 20000 }).closest('div[class*="rounded-2xl"]');
}

function mockedNotification(overrides: Partial<MockNotification>): MockNotification {
  return {
    type: 'appointment',
    notification_id: 9001,
    title: 'Mock notification',
    notification_at: '2026-02-10T09:00:00Z',
    is_read: false,
    status: 'scheduled',
    payload: {},
    created_at: '2026-02-10T08:00:00Z',
    ...overrides,
  };
}

runForMobileViewports('Notification flow (integration)', () => {
  it('renders unified notifications for medicine and appointment items', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9005,
            type: 'medicine',
            title: 'Mock medicine notification',
            notification_at: '2026-02-10T09:05:00Z',
            payload: { medicine_id: 501 },
          }),
          mockedNotification({
            notification_id: 9006,
            type: 'appointment',
            title: 'Mock appointment notification',
            notification_at: '2026-02-10T08:50:00Z',
            payload: { appointment_id: 601, location: 'Mock Clinic' },
          }),
        ],
      },
    }).as('fiUnifiedNotifications');

    visitNotificationsPage();
    cy.wait('@fiUnifiedNotifications', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    cy.contains(/Today|Upcoming/, { timeout: 20000 }).should('exist');
    expandUpcomingIfPresent('Mock medicine notification');
    cy.contains('Mock medicine notification', { timeout: 20000 }).should('exist');
    cy.contains('Mock Clinic', { timeout: 20000 }).should('exist');
  });

  it('marks a medicine notification as read and deep-links to medication detail', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9401,
            type: 'medicine',
            title: 'Mock medicine read notification',
            notification_at: '2026-02-10T09:05:00Z',
            payload: { medicine_id: 777 },
          }),
        ],
      },
    }).as('fiMedicineReadFeed');
    cy.intercept('PATCH', markMedicationTakenEndpoint, {
      statusCode: 200,
      body: { success: true },
    }).as('fiMarkNotificationTaken');

    visitNotificationsPage();
    cy.wait('@fiMedicineReadFeed', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    expandUpcomingIfPresent('Mock medicine read notification');
    notificationCard('Mock medicine read notification').within(() => {
      cy.get('.bg-blue-500.rounded-full').should('exist');
    });

    cy.contains('Mock medicine read notification', { timeout: 20000 }).click();

    cy.wait('@fiMarkNotificationTaken', { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      const matchedNotificationId = interception.request.url.match(/\/v1\/medications\/(\d+)\/taken$/)?.[1];
      expect(matchedNotificationId).to.eq('9401');
      cy.location('search').should('include', `noti_id=${matchedNotificationId}`);
    });

    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/medication-page');
    cy.location('search').should('include', 'popup=view-medication');
  });

  it('shows unread appointment state before navigating to the calendar deep link', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9301,
            type: 'appointment',
            title: 'Unread appointment notification',
            notification_at: '2026-02-10T08:50:00Z',
            payload: { appointment_id: 801, location: 'Unread Clinic' },
          }),
        ],
      },
    }).as('fiAppointmentUnreadFeed');

    visitNotificationsPage();
    cy.wait('@fiAppointmentUnreadFeed', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    notificationCard('Unread appointment notification').within(() => {
      cy.get('.bg-blue-500.rounded-full').should('exist');
    });

    notificationCard('Unread appointment notification').click();

    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/calendar-page');
    cy.location('search').should('include', 'tab=appointment');
    cy.location('search').should('include', 'appointment_id=801');
    cy.location('search').should('include', 'popup=view-appointment');
  });

  it('navigates appointment notifications to the calendar deep link', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9402,
            type: 'appointment',
            title: 'Mock appointment nav notification',
            notification_at: '2026-02-10T08:50:00Z',
            payload: { appointment_id: 802, location: 'Navigation Clinic' },
          }),
        ],
      },
    }).as('fiAppointmentNavFeed');

    visitNotificationsPage();
    cy.wait('@fiAppointmentNavFeed', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    notificationCard('Navigation Clinic').click();

    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/calendar-page');
    cy.location('search').should('include', 'tab=appointment');
    cy.location('search').should('include', 'appointment_id=802');
    cy.location('search').should('include', 'popup=view-appointment');
  });

  it('shows an empty state when the unified notification feed is empty', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: { data: [] },
    }).as('fiNotificationsEmpty');

    visitNotificationsPage();
    cy.wait('@fiNotificationsEmpty', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    cy.contains('No notifications today', { timeout: 20000 }).should('exist');
    cy.contains('No notifications').should('exist');
    cy.contains('button', /^Upcoming$/).should('not.exist');
    cy.contains(/^Earlier$/).should('not.exist');
  });

  it('shows a loading state while the notification feed is still in flight', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();

    cy.intercept('GET', notificationFeedEndpoint, {
      delayMs: 1500,
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9150,
            type: 'appointment',
            title: 'Delayed appointment notification',
            notification_at: '2026-02-10T08:55:00Z',
            payload: { appointment_id: 750, location: 'Delayed Clinic' },
          }),
        ],
      },
    }).as('fiNotificationsLoading');

    visitNotificationsPage();
    cy.contains('Loading...', { timeout: 20000 }).should('be.visible');

    cy.wait('@fiNotificationsLoading', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains('Loading...').should('not.exist');
    cy.contains('Delayed appointment notification', { timeout: 20000 }).should('exist');
  });

  it('shows notification error state and recovers on retry', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();
    const location = fiUnique('CY-FI-NOTI-RETRY');
    let notificationCallCount = 0;
    cy.intercept('GET', notificationFeedEndpoint, (req) => {
      notificationCallCount += 1;
      if (notificationCallCount === 1) {
        req.reply({
          statusCode: 500,
          body: { detail: 'forced notification failure before retry' },
        });
        return;
      }

      req.reply({
        statusCode: 200,
        body: {
          data: [
            mockedNotification({
              notification_id: 9501,
              type: 'appointment',
              title: 'Retry appointment notification',
              notification_at: '2026-02-10T08:55:00Z',
              payload: { appointment_id: 901, location },
            }),
          ],
        },
      });
    }).as('fiNotificationsRetry');

    visitNotificationsPage();
    cy.wait('@fiNotificationsRetry', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 500);

    cy.contains('Could not load notifications', { timeout: 20000 }).should('be.visible');
    cy.contains(/Tap to retry/i, { timeout: 20000 }).should('be.visible').click();

    cy.wait('@fiNotificationsRetry', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    cy.contains('Could not load notifications').should('not.exist');
    cy.contains(location, { timeout: 20000 }).should('exist');
    cy.get('body')
      .invoke('text')
      .then((text) => {
        expect(text.match(new RegExp(location, 'g')) ?? []).to.have.length(1);
      });
  });

  it('groups notifications into upcoming, today, and earlier while hiding far future items', () => {
    fiFreeze('2026-02-10T09:00:00Z');
    cy.fiEnsureOwnerProfile();

    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9101,
            type: 'medicine',
            title: 'Mock upcoming medication',
            notification_at: '2026-02-10T09:05:00Z',
            payload: { medicine_id: 501 },
          }),
          mockedNotification({
            notification_id: 9102,
            type: 'appointment',
            title: 'Mock today appointment',
            notification_at: '2026-02-10T08:40:00Z',
            payload: { appointment_id: 601, location: 'Today Clinic' },
          }),
          mockedNotification({
            notification_id: 9103,
            type: 'appointment',
            title: 'Mock earlier appointment',
            notification_at: '2026-02-09T20:00:00Z',
            payload: { appointment_id: 602, location: 'Earlier Clinic' },
          }),
          mockedNotification({
            notification_id: 9104,
            type: 'appointment',
            title: 'Mock hidden future appointment',
            notification_at: '2026-02-10T09:30:00Z',
            payload: { appointment_id: 603, location: 'Hidden Clinic' },
          }),
        ],
      },
    }).as('fiNotificationsGrouped');

    visitNotificationsPage();
    cy.wait('@fiNotificationsGrouped', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains('Today', { timeout: 20000 }).should('exist');
    cy.contains('Earlier').should('exist');
    cy.contains('Mock today appointment').should('exist');
    cy.contains('Mock earlier appointment').should('exist');
    cy.contains('Mock hidden future appointment').should('not.exist');

    cy.contains('button', /^Upcoming$/).click();
    cy.contains('Mock upcoming medication', { timeout: 20000 }).should('exist');
    cy.contains('Mock hidden future appointment').should('not.exist');
  });

  it('keeps +15 minute notifications under Upcoming tomorrow and hides +16 minute items', () => {
    fiFreeze('2026-02-10T23:50:00Z');
    cy.fiEnsureOwnerProfile();

    cy.intercept('GET', notificationFeedEndpoint, {
      statusCode: 200,
      body: {
        data: [
          mockedNotification({
            notification_id: 9201,
            type: 'appointment',
            title: 'Tomorrow boundary notification',
            notification_at: '2026-02-11T00:05:00Z',
            payload: { appointment_id: 701, location: 'Tomorrow Clinic' },
          }),
          mockedNotification({
            notification_id: 9202,
            type: 'appointment',
            title: 'Hidden +16 minute notification',
            notification_at: '2026-02-11T00:06:00Z',
            payload: { appointment_id: 702, location: 'Hidden Boundary Clinic' },
          }),
          mockedNotification({
            notification_id: 9203,
            type: 'appointment',
            title: 'Late evening notification',
            notification_at: '2026-02-10T23:40:00Z',
            payload: { appointment_id: 703, location: 'Late Clinic' },
          }),
        ],
      },
    }).as('fiNotificationsUpcomingBoundary');

    visitNotificationsPage();
    cy.wait('@fiNotificationsUpcomingBoundary', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains('Late evening notification', { timeout: 20000 }).should('exist');
    cy.contains('Hidden +16 minute notification').should('not.exist');

    cy.contains('button', /^Upcoming$/).click();
    cy.contains('Tomorrow', { timeout: 20000 }).should('exist');
    cy.contains('Tomorrow boundary notification').should('exist');
    cy.contains('Hidden +16 minute notification').should('not.exist');
  });
});
