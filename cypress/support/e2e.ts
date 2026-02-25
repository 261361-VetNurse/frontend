// Commands and global setup for Cypress can live here.
import "./commands";

Cypress.on("uncaught:exception", (err) => {
  // Date freezing in tests can trigger known Next.js hydration mismatch warnings on SSR pages.
  if (
    err.message.includes(
      "Hydration failed because the server rendered text didn't match the client"
    )
  ) {
    return false;
  }

  return true;
});

const FRONTEND_MOCKED_SPEC_SEGMENT = "cypress/e2e/frontend-mocked/";

function isFrontendMockedSpec() {
  const specRelative = Cypress.spec?.relative ?? "";
  return (
    specRelative.includes(FRONTEND_MOCKED_SPEC_SEGMENT) ||
    specRelative.startsWith("frontend-mocked/")
  );
}

function installFrontendMockedApiGuard() {
  // Catch-all API guards for frontend-mocked specs only.
  // Cypress matches the most recently-registered intercept first, so
  // test-specific cy.intercept() calls can override these guards.
  const blockedApiPatterns = [
    "**/api/**",
    "http://localhost:8000/**",
    "http://127.0.0.1:8000/**",
    "https://localhost:8000/**",
    "https://127.0.0.1:8000/**",
  ];

  blockedApiPatterns.forEach((pattern) => {
    cy.intercept(pattern, (req) => {
      throw new Error(
        [
          "[frontend-mocked:mock-only] Unmocked API request detected.",
          `Spec: ${Cypress.spec?.relative ?? "(unknown spec)"}`,
          `Request: ${req.method} ${req.url}`,
          "Add cy.intercept(...) before cy.visit() or keep the flow fully app-mocked.",
        ].join("\n")
      );
    });
  });
}

function installFrontendMockedBaselineMocks() {
  // AuthProvider runs on every page and requests current user when a token exists.
  // Provide a deterministic default mock so specs only need to override when testing auth failures.
  cy.intercept("GET", "http://localhost:8000/auth/me", {
    statusCode: 200,
    body: {
      id: "owner_001",
      display_name: "Somying Jaiboon",
      picture_url: "https://placehold.co/400x400",
      line_id: "somying.jaiboon",
      role: "owner",
      is_registered: true,
    },
  }).as("frontendMockedAuthMe");
}

beforeEach(() => {
  if (!isFrontendMockedSpec()) return;
  installFrontendMockedApiGuard();
  installFrontendMockedBaselineMocks();
});
