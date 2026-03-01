# My Pets Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand `cypress/e2e/frontend-integration/my-pets.cy.ts` to cover the missing `My Pets` list-page behaviors with minimal overlap.

**Architecture:** Keep the existing real-backend integration style. Seed owner and pet data through the shared Cypress helpers, and use a targeted intercept only for the deterministic pets-list failure/retry path. Place the new tests in the same spec to keep all route-level `My Pets` coverage together.

**Tech Stack:** Cypress, Next.js frontend, frontend-integration custom commands

---

### Task 1: Add empty-state coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/my-pets.cy.ts`

**Step 1: Write the failing test**

Add a test that ensures an authenticated owner with no pets sees `No pets yet. Click "New Pet" to add one.`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/my-pets.cy.ts"`

Expected: the new test fails before implementation is complete.

**Step 3: Write minimal implementation**

Use `cy.fiEnsureOwnerProfile()` and `cy.fiVisitAuthed('/pet-owners/my-pets-page')`, then assert the empty-state message.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the empty-state case passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/my-pets.cy.ts
git commit -m "test: add my pets empty state coverage"
```

### Task 2: Strengthen authenticated list assertions

**Files:**
- Modify: `cypress/e2e/frontend-integration/my-pets.cy.ts`

**Step 1: Write the failing test**

Add a test that seeds two pets, then asserts:
- both pet names render
- `All Pets` shows `2`
- `In Medical` shows `1`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/my-pets.cy.ts"`

Expected: the count assertions fail until the test is written correctly.

**Step 3: Write minimal implementation**

Seed two pets with different `in_medical` values and assert the visible stat card values.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the count test passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/my-pets.cy.ts
git commit -m "test: verify my pets list counts"
```

### Task 3: Add route wiring checks

**Files:**
- Modify: `cypress/e2e/frontend-integration/my-pets.cy.ts`

**Step 1: Write the failing test**

Add a test that clicks:
- the owner card and checks `/pet-owners/owner-info-page`
- the pet card and checks `/pet-owners/my-pets-page/:id`
- the `New Pet` button and checks `/pet-owners/my-pets-page/add-new-pet`

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/my-pets.cy.ts"`

Expected: one or more route assertions fail until selectors are correct.

**Step 3: Write minimal implementation**

Use stable text- and structure-based selectors already used in the suite.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the navigation test passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/my-pets.cy.ts
git commit -m "test: verify my pets route wiring"
```

### Task 4: Add pets list error-and-retry coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/my-pets.cy.ts`

**Step 1: Write the failing test**

Add a test that intercepts the first `GET **/v1/pets` with `500`, the second with `200`, and asserts:
- `Could not load pets list`
- `Tap to retry`
- seeded pet appears after retry

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/my-pets.cy.ts"`

Expected: retry or intercept timing may fail until the test is aligned with page behavior.

**Step 3: Write minimal implementation**

Register the intercept before visiting the page, click `Tap to retry`, and wait for the success response.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the error-and-retry test passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/my-pets.cy.ts
git commit -m "test: cover my pets retry state"
```
