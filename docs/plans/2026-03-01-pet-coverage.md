# Pet Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand pet integration coverage so `pet.cy.ts` verifies branch states, navigation, broader field mapping, and delete robustness for the pet-owner flow.

**Architecture:** Keep all additions in `cypress/e2e/frontend-integration/pet.cy.ts` and use the existing frontend-integration helpers for seeded data and authenticated navigation. Trigger non-happy-path branches with targeted `cy.intercept()` calls against the pet list and delete endpoints, and verify create/update behavior by asserting request payloads and post-submit UI/API state.

**Tech Stack:** Cypress, custom frontend-integration commands, Next.js pet-owner UI

---

### Task 1: Document the missing pet-flow branches in the spec

**Files:**
- Modify: `cypress/e2e/frontend-integration/pet.cy.ts`
- Test: `cypress/e2e/frontend-integration/pet.cy.ts`

**Step 1: Write the failing tests**

Add new `it(...)` blocks for:

- detail error state
- detail pet-not-found state
- edit pet-not-found state
- detail selector and menu navigation
- create payload field mapping
- update payload field mapping
- delete cancel
- delete failure

**Step 2: Run the pet spec to verify failures**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/pet.cy.ts`
Expected: failing assertions for the newly added cases until selectors/intercepts are correct

**Step 3: Adjust the spec with minimal changes**

Use stable selectors and request assertions already used in adjacent specs:

- `button[aria-haspopup="listbox"]`
- `cy.intercept('GET', '**/v1/pets', ...)`
- `cy.intercept('DELETE', \`**/v1/pets/${petId}\`, ...)`

**Step 4: Run the pet spec again**

Run: `npx cypress run --spec cypress/e2e/frontend-integration/pet.cy.ts`
Expected: all `pet.cy.ts` cases pass

**Step 5: Commit**

```bash
git add cypress/e2e/frontend-integration/pet.cy.ts docs/plans/2026-03-01-pet-coverage-design.md docs/plans/2026-03-01-pet-coverage.md
git commit -m "test: expand pet integration coverage"
```
