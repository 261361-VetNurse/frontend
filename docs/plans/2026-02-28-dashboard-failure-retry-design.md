# Dashboard Failure And Retry Coverage Design

**Scope:** Expand dashboard integration coverage for popup failure handling, section retry recovery, and missing pet entry points. Keep LINE callback flows out of scope for this round.

**Approach:** Extend the existing dashboard Cypress spec with deterministic intercept-backed tests. Use real backend-seeded pet/medication/appointment data for entry points and happy-path setup, then force failures only on the specific requests needed to cover error branches.

**Covered behaviors:**
- reminder detail request failure keeps the popup closed and preserves clean URL state
- reminder toggle failure keeps the popup open and preserves pending state
- appointment detail request failure keeps the popup closed and preserves clean URL state
- dashboard section error state can recover through `Tap to retry`
- pet card and `New Pet` dashboard entry points navigate to the expected routes

**Non-goals:**
- LINE auth callback flows
- application code changes
- shared Cypress helper refactors
