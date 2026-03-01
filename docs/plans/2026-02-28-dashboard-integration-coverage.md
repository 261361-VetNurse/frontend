# Dashboard Integration Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand dashboard integration coverage so the home page verifies real dashboard behaviors instead of a single smoke path.

**Architecture:** Keep the dashboard spec backend-driven for core user flows, and use targeted Cypress intercepts only where the UI has branches that are hard to force from seeded backend data alone. Strengthen assertions around URL state, API side effects, and branch-specific rendering.

**Tech Stack:** Cypress, Next.js app routes, custom fi* Cypress helpers

---

### Task 1: Add dashboard spec helpers

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`

**Step 1: Write the failing test**

Add helper-level usage in the spec for:
- reading visible dialog state
- extracting appointment/reminder ids from URL params
- forcing dashboard API payload branches with `cy.intercept`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: Existing spec lacks the new helpers/tests.

**Step 3: Write minimal implementation**

Add small local helper functions in the spec only. Avoid changing app code.

**Step 4: Run test to verify it passes**

Run the dashboard spec again and confirm helper-backed tests execute.

**Step 5: Commit**

```bash
git add docs/plans/2026-02-28-dashboard-integration-coverage.md cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: expand dashboard integration coverage"
```

### Task 2: Strengthen reminder detail and toggle behavior

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`
- Reference: `src/components/pet-owners/MainPage/HomePage/HomePage.tsx`

**Step 1: Write the failing test**

Add a test that:
- seeds one dashboard reminder
- opens reminder detail from the home page
- intercepts the reminder toggle request
- asserts the request is made
- asserts dialog/button state changes after success

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts --env grep=toggle`
Expected: FAIL before assertions/helpers are implemented.

**Step 3: Write minimal implementation**

Use `cy.intercept` and stricter assertions on the detail popup plus URL params.

**Step 4: Run test to verify it passes**

Run the same spec command and verify the new test passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: verify dashboard reminder toggle behavior"
```

### Task 3: Cover dashboard deep-link popup flows

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`
- Reference: `src/components/pet-owners/MainPage/HomePage/HomePage.tsx`

**Step 1: Write the failing test**

Add tests that:
- visit dashboard with medication deep-link params and verify popup opens
- visit dashboard with appointment deep-link params and verify popup opens
- close popup and verify query params are cleared

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until deep-link tests/assertions exist.

**Step 3: Write minimal implementation**

Seed data with real backend helpers and assert `cy.location('search')` before and after closing dialogs.

**Step 4: Run test to verify it passes**

Run the dashboard spec and confirm deep-link tests pass.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: add dashboard deep-link coverage"
```

### Task 4: Cover reminder and appointment branch rendering

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`
- Reference: `src/components/pet-owners/MainPage/HomePage/HomePage.tsx`

**Step 1: Write the failing test**

Add tests for:
- missed reminder accordion visibility and expansion
- `No other upcoming reminders today.` fallback
- appointment list showing only upcoming items and capping visible cards at three

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until branch cases are asserted.

**Step 3: Write minimal implementation**

Use a mix of seeded data and a targeted dashboard response intercept for deterministic branch coverage.

**Step 4: Run test to verify it passes**

Run the dashboard spec and confirm branch coverage tests pass.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: cover dashboard branch rendering"
```

### Task 5: Cover navigation and empty/error states

**Files:**
- Modify: `cypress/e2e/frontend-integration/dashboard.cy.ts`
- Reference: `src/components/pet-owners/MainPage/HomePage/HomePage.tsx`

**Step 1: Write the failing test**

Add tests for:
- profile/help/show-all navigation targets
- empty medication/appointment copy
- section-level error state via intercepted failing dashboard response

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/dashboard.cy.ts`
Expected: FAIL until navigation/error tests exist.

**Step 3: Write minimal implementation**

Add focused Cypress intercepts and route assertions without modifying application code.

**Step 4: Run test to verify it passes**

Run the dashboard spec and confirm all new tests pass.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/dashboard.cy.ts
git commit -m "test: add dashboard empty error and navigation coverage"
```
