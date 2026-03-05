# Notification Coverage Design

**Date:** 2026-03-01

## Goal

Fill the current `frontend-integration` coverage gaps for the owner notification page so the repo verifies rendering, read behavior, navigation, empty state, retry state, and time-bucket grouping.

## Scope

- Keep the existing real-backend unified render coverage.
- Add a medicine notification test that verifies the mark-as-read request is sent and the item no longer appears unread after returning.
- Add route-wiring coverage for medicine and appointment notifications.
- Add deterministic empty-state and error-retry coverage by intercepting the notification feed request.
- Add deterministic grouping coverage for `Upcoming`, `Today`, `Earlier`, and hidden future notifications beyond 15 minutes.

## Non-Goals

- Do not refactor the notification page implementation.
- Do not add unit or contract tests for the notification API routes in this change.
- Do not duplicate medication or appointment detail assertions already covered in their dedicated specs.

## Approach

Use real backend seeding helpers for the happy-path notification flow so the page still proves unified appointment and medication data render together. Use `cy.intercept()` only where deterministic control is necessary: forcing the notification feed empty/error states, asserting the medicine read request, and supplying stable timestamps for grouping behavior that is awkward to seed through the backend.

## Expected Coverage Outcome

- `TC-NOTI-01`: unified notification render remains covered.
- `TC-NOTI-02`: medicine notification read flow is covered at the UI/request level.
- `TC-NOTI-03`: empty state and retry state are covered.
- `TC-NOTI-04`: notification navigation to medication and appointment targets is covered.
- Additional regression coverage exists for the page's `Upcoming` / `Today` / `Earlier` bucketing rules.
