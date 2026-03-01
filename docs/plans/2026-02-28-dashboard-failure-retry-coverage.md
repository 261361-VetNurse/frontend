# Dashboard Failure And Retry Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dashboard integration coverage for popup failure handling, retry recovery, and pet section navigation entry points.

**Architecture:** Keep the work inside the existing dashboard Cypress spec. Use backend-seeded entities for dashboard rows that must exist in the UI, and force failure or recovery branches with targeted `cy.intercept` handlers so the tests remain deterministic and isolated from backend data-shaping limits.

**Tech Stack:** Cypress, Next.js app routes, custom `fi*` Cypress helpers

---

### Task 1: Add popup failure coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`

**Step 1: Write the failing test**

Add tests that:
- force medication detail fetch to return 500 and assert alert text, no dialog, and no popup query params
- force appointment detail fetch to return 500 and assert alert text, no dialog, and no popup query params

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until the new failure assertions are implemented.

**Step 3: Write minimal implementation**

Use existing dashboard cards and targeted route intercepts:
- `GET **/v1/medications/*`
- `GET **/v1/appointments/*`

Stub `window.alert` per test to assert failure messaging.

**Step 4: Run test to verify it passes**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: PASS for the new popup failure tests.

**Step 5: Commit**

```bash
git add docs/plans/2026-02-28-dashboard-failure-retry-design.md docs/plans/2026-02-28-dashboard-failure-retry-coverage.md cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: cover dashboard failure and retry flows"
```

### Task 2: Add reminder toggle failure coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`

**Step 1: Write the failing test**

Add a test that:
- opens a medication popup from the dashboard
- forces `PATCH **/v1/medications/*/taken` to return 500
- asserts the failure alert appears
- asserts the popup stays open and the status does not change to taken

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until the toggle failure branch is asserted.

**Step 3: Write minimal implementation**

Seed one reminder with existing fi helpers, intercept the toggle request, and assert the popup remains in the pending state after the failed response.

**Step 4: Run test to verify it passes**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: PASS for the toggle failure test.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: cover dashboard reminder toggle failure"
```

### Task 3: Add retry recovery and pet entry coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`

**Step 1: Write the failing test**

Add tests that:
- fail the first dashboard home request, recover on `Tap to retry`, and assert dashboard content loads
- navigate from a dashboard pet card to `/pet-owners/my-pets-page/:id`
- navigate from `New Pet` to `/pet-owners/my-pets-page/add-new-pet`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until the retry recovery and pet entry assertions exist.

**Step 3: Write minimal implementation**

Use an intercept counter for `GET **/v1/dashboard/home` so the first response fails and the second succeeds. Use seeded pet data and route assertions for the pet card and `New Pet` button.

**Step 4: Run test to verify it passes**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: PASS for the retry recovery and pet navigation tests.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: add dashboard retry and pet entry coverage"
```
