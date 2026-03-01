# My Pets Coverage Design

**Date:** 2026-03-01

## Goal

Fill the current `frontend-integration` coverage gaps for the owner `My Pets` list page without duplicating unrelated flows already covered by other specs.

## Scope

- Keep the existing unauthenticated redirect smoke test.
- Keep the existing authenticated render smoke test.
- Add an authenticated empty-state test for a user with no pets.
- Add assertions for list-derived data: `All Pets` and `In Medical`.
- Add route wiring checks for the owner card, pet card, and `New Pet` button.
- Add an error-and-retry test for the pets list request.

## Non-Goals

- Do not move pet CRUD coverage from `pet.cy.ts`.
- Do not expand into owner profile behavior beyond verifying the route wiring from the owner card.
- Do not add mocked-network tests to this suite; stay within the real-backend policy used by `frontend-integration`.

## Approach

Use real backend self-seeding helpers (`cy.fiEnsureOwnerProfile`, `cy.fiCreatePet`) for all happy-path and empty-state coverage. For the pets-list error path, intercept only `GET **/v1/pets` in the spec and force a first failure followed by a success so the page-level retry UI can be exercised deterministically.

## Expected Coverage Outcome

- `TC-MYPETS-01`: unauthenticated redirect remains covered.
- `TC-MYPETS-02`: authenticated render becomes stronger through count and navigation assertions.
- `TC-MYPETS-03`: pets list error state and retry become covered.
