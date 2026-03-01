# Help Center Integration Design

**Date:** 2026-02-28

**Goal:** Strengthen Help Center integration coverage so the spec validates meaningful user-visible behavior and route contracts without broadening flaky impact across all mobile specs.

## Scope

- Keep changes local to `cypress/e2e/frontend-integration/help-center.cy.ts`.
- Do not modify `cypress/support/mobileViewports.ts`.
- Add coverage for:
  - direct-entry back button behavior
  - local multi-viewport execution in this spec
  - full FAQ rendering assertions
  - placeholder content regression detection
  - search field behavior as currently implemented

## Approach

Use a spec-local viewport list with one iOS and one Android viewport so this file exercises the mobile layout contract without changing the shared runner used by other integration specs. Keep the existing dashboard-to-help-center navigation test only for the return flow that depends on browser history.

For direct entry, stub `window.history.back` before visiting the page and assert the back button calls it. This verifies the implementation contract of the page regardless of how the user entered the route.

For content coverage, assert the complete visible FAQ dataset that the page currently renders and explicitly assert that placeholder `topic/detail` rows are absent. Keep the search field check honest by verifying the field exists, accepts input, and does not alter FAQ visibility because the page does not implement filtering.

## Testing

- Targeted run of `cypress/e2e/frontend-integration/help-center.cy.ts`
- If Cypress execution is not practical, run a TypeScript parse check or review the spec for selector/command validity
