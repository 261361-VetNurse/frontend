import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Notification flow", () => {
  const seedAuth = (win: Window) => {
    win.localStorage.setItem("auth_token", "mock_token_user_1_long_live");
  };

  it("renders grouped notifications and marks unread item as read on click", () => {
    cy.visit("/pet-owners/notification-page", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.contains("Today", { timeout: 20000 }).should("exist");
    cy.contains("Yesterday", { timeout: 20000 }).should("exist");

    cy.contains("Appointment")
      .closest("div.rounded-2xl")
      .as("appointmentCard")
      .should("have.class", "bg-blue-50")
      .click();

    cy.get("@appointmentCard").should("not.have.class", "bg-blue-50");
  });

  it("shows empty state when notifications API returns empty", () => {
    cy.intercept("GET", "**/api/notifications*", {
      statusCode: 200,
      body: [],
    }).as("getNotifications");

    cy.visit("/pet-owners/notification-page", {
      onBeforeLoad(win) {
        seedAuth(win);
      },
    });

    cy.wait("@getNotifications");
    cy.contains("No notifications", { timeout: 20000 }).should("exist");
  });
});
