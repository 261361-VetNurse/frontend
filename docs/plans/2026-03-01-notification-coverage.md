# Notification Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand `cypress/e2e/frontend-integration/notification.cy.ts` to cover the missing notification-page behaviors with deterministic assertions where the real backend would otherwise be awkward.

**Architecture:** Keep the spec in the existing real-backend integration suite and preserve the current happy path that seeds appointment and medication data through shared helpers. Add targeted request interception only for deterministic read-state, empty/error, and grouping scenarios so the route-level page behavior is covered without rewriting the production page.

**Tech Stack:** Cypress, Next.js frontend, frontend-integration custom commands

---

### Task 1: Preserve and strengthen unified render coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/notification.cy.ts`

**Step 1: Write the failing test**

Keep the existing seeded notification flow and strengthen it with assertions that both medication and appointment data appear in the notification page.

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/notification.cy.ts"`

Expected: the spec fails until the updated assertions/selectors match the page.

**Step 3: Write minimal implementation**

Retain real backend setup with `cy.fiEnsureOwnerProfile()`, `cy.fiCreatePet()`, `cy.fiCreateMedication()`, and `cy.fiCreateAppointment()`, then assert the page renders the unified content.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the unified render case passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/notification.cy.ts
git commit -m "test: keep notification unified render coverage"
```

### Task 2: Cover medicine read state and target navigation

**Files:**
- Modify: `cypress/e2e/frontend-integration/notification.cy.ts`

**Step 1: Write the failing test**

Add a test that seeds a medicine notification, intercepts `PATCH **/v1/medications/*/taken`, clicks the notification, waits for the request, verifies navigation to the medication page, then returns and confirms the notification no longer appears unread.

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/notification.cy.ts"`

Expected: the new read/navigation assertions fail until the page interaction is aligned.

**Step 3: Write minimal implementation**

Use the existing notification card content to find and click the seeded medicine notification, then assert request and route behavior.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the medicine read/navigation case passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/notification.cy.ts
git commit -m "test: cover notification medicine read flow"
```

### Task 3: Cover appointment navigation

**Files:**
- Modify: `cypress/e2e/frontend-integration/notification.cy.ts`

**Step 1: Write the failing test**

Add a test that clicks an appointment notification and verifies navigation to the calendar deep link with the expected query parameters.

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/notification.cy.ts"`

Expected: route assertions fail until the selectors and expectations match implementation.

**Step 3: Write minimal implementation**

Seed an appointment, visit the notification page, click the appointment notification, and assert `pathname` plus `search`.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the appointment navigation case passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/notification.cy.ts
git commit -m "test: cover notification appointment deep link"
```

### Task 4: Add empty and retry coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/notification.cy.ts`

**Step 1: Write the failing test**

Add tests that intercept `GET **/v1/notifications` to return `[]`, and separately `500` on first call then success on retry.

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/notification.cy.ts"`

Expected: the new empty or retry assertions fail until the intercept timing is correct.

**Step 3: Write minimal implementation**

Register the intercept before visiting the page, then assert `No notifications` / `No notifications today` and the `Could not load notifications` retry flow.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the empty and retry cases pass.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/notification.cy.ts
git commit -m "test: cover notification empty and retry states"
```

### Task 5: Add deterministic grouping coverage

**Files:**
- Modify: `cypress/e2e/frontend-integration/notification.cy.ts`

**Step 1: Write the failing test**

Add a test with intercepted notification feed data that proves:
- one item appears under `Upcoming`
- one item appears under `Today`
- one item appears under `Earlier`
- one future item beyond 15 minutes is hidden

**Step 2: Run test to verify it fails**

Run: `npx cypress run --spec "cypress/e2e/frontend-integration/notification.cy.ts"`

Expected: the grouping assertions fail until the mocked payload and UI interactions are aligned.

**Step 3: Write minimal implementation**

Freeze time, serve a small notification array through `cy.intercept()`, expand `Upcoming`, and assert the visible labels and hidden far-future item.

**Step 4: Run test to verify it passes**

Run the spec again and confirm the grouping test passes.

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/notification.cy.ts
git commit -m "test: cover notification grouping behavior"
```
