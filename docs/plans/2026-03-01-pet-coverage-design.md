# Pet Coverage Design

## Scope

Expand `cypress/e2e/frontend-integration/pet.cy.ts` so pet flow coverage is not limited to happy-path CRUD. The added coverage targets branch behavior already implemented in the UI:

- detail page error state
- detail page pet-not-found state
- edit page pet-not-found state
- detail page navigation via pet selector and menu entries
- broader add/edit field persistence assertions
- delete cancel and delete failure handling

## Approach

Keep the new coverage inside `pet.cy.ts` because all cases belong to the same pet-owner flow and reuse the same helpers. Use seeded pets for stable positive-path assertions, and use `cy.intercept()` only for branch states that are otherwise hard to trigger deterministically:

- intercept `GET **/v1/pets` with `500` for detail error
- intercept `GET **/v1/pets` with a list that excludes the requested id for not-found branches
- intercept `DELETE **/v1/pets/:id` with `500` for delete failure

For form coverage, assert request payloads on create/update rather than only DOM changes. That keeps the tests aligned with the implemented API contract and catches regressions in field mapping.

## Test Design

Add cases in these groups:

1. Add form coverage
- verify create payload includes `in_medical`, `weight_kg`, and the default `profile_image`
- keep the existing age/required-fields check

2. Detail and edit branch coverage
- detail shows API error message when pet list fetch fails
- detail shows `Pet not found` when the requested pet is absent
- edit shows `Pet not found` when the requested pet is absent

3. Detail navigation coverage
- switch between pets using the detail page selector
- navigate from detail page to appointments, medications, and symptoms pages

4. Edit and delete robustness
- verify edit payload and detail page reflect `gender`, `weight`, `infecund`, `in_medical`, and `note`
- verify delete is canceled when confirm returns `false`
- verify delete failure keeps the user on the detail page and shows an alert

## Risks

- Uploading a new pet image depends on R2/browser upload behavior and is outside the minimum stable scope for this spec. The coverage will assert the default profile image value already sent by the add form.
- The add form currently exposes an `Allergies` input but does not send it in the create payload. The test suite should not lock in that omission as intended behavior.
