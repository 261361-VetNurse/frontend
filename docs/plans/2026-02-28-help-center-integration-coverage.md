# Help Center Integration Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand Help Center integration coverage so the spec checks route behavior, mobile layout expectations, and concrete rendered FAQ content.

**Architecture:** Keep the app code unchanged and strengthen only the Cypress spec. Use a spec-local viewport runner to cover one iOS and one Android viewport without changing the global mobile helper that is intentionally locked down for flake control.

**Tech Stack:** Cypress, Next.js app routes, custom fi* Cypress helpers

---

### Task 1: Add spec-local viewport coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/help-center.cy.ts`
- Reference: `cypress/support/mobileViewports.ts`

**Step 1: Write the failing test**

Refactor the spec to run its tests for a local subset of mobile viewports:
- one iOS viewport
- one Android viewport

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/help-center.cy.ts`
Expected: Existing spec only uses the shared helper, so the local multi-viewport suite does not exist yet.

**Step 3: Write minimal implementation**

Create a small local `describe` loop in the spec and set `cy.viewport(...)` in `beforeEach`.

**Step 4: Run test to verify it passes**

Run the Help Center spec again and confirm both viewport groups execute.

**Step 5: Commit**

```bash
git add docs/plans/2026-02-28-help-center-integration-design.md docs/plans/2026-02-28-help-center-integration-coverage.md cypress/e2e/frontend-integration/help-center.cy.ts
git commit -m "test: strengthen help center integration coverage"
```

### Task 2: Strengthen content assertions

**Files:**
- Modify: `cypress/e2e/frontend-integration/help-center.cy.ts`
- Reference: `src/app/(liff)/pet-owners/help-center-page/page.tsx`

**Step 1: Write the failing test**

Add assertions that:
- all intended FAQ rows are visible
- placeholder `topic/detail` rows are not visible
- contact content still renders

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/help-center.cy.ts`
Expected: FAIL until the stricter content assertions are added.

**Step 3: Write minimal implementation**

Replace the partial FAQ topic loop with full FAQ row checks and explicit negative assertions for placeholder content.

**Step 4: Run test to verify it passes**

Run the Help Center spec and confirm content coverage passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/help-center.cy.ts
git commit -m "test: verify help center faq content"
```

### Task 3: Cover route-specific back behavior

**Files:**
- Modify: `cypress/e2e/frontend-integration/help-center.cy.ts`
- Reference: `src/app/(liff)/pet-owners/help-center-page/page.tsx`
- Reference: `cypress/e2e/frontend-integration/dashboard.cy.ts`

**Step 1: Write the failing test**

Add tests that:
- verify dashboard-to-help-center navigation still returns to the dashboard
- visit the help center directly and assert the back button calls `window.history.back()`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/help-center.cy.ts`
Expected: FAIL until the direct-entry history assertion exists.

**Step 3: Write minimal implementation**

Use `onBeforeLoad` to stub `window.history.back`, alias it, and click the first button in the header.

**Step 4: Run test to verify it passes**

Run the Help Center spec and confirm both route-entry behaviors pass.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/help-center.cy.ts
git commit -m "test: cover help center back navigation"
```
