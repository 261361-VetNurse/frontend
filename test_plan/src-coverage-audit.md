# src Coverage Audit (Full Scope)

## Severity Rubric
- `P0`: auth, create/update/delete flows, data integrity
- `P1`: error/retry/loading/deep-link, state sync
- `P2`: static/placeholder/admin smoke

## Baseline Summary
- Existing E2E specs: `auth`, `owner`, `dashboard`, `appointment`, `medication`, `history`, `pet`, `symptom`, `smoke`
- Added in this implementation: `notification`, `my-pets`, `calendar-record`, `help-center`, `admin`
- Existing unit/integration before this work: none
- New unit/integration in this work: hooks, utils, api client mock helpers, api route/proxy contracts

## Inventory Matrix

### Routes -> Existing tests -> Gap severity
| Area | Route / Module | Existing tests | Current status | Severity |
|---|---|---|---|---|
| LIFF | `/pet-owners` redirect | `auth.cy.ts` (new case) | Covered redirect assertion | P1 |
| LIFF | `/pet-owners/home-page` | `dashboard.cy.ts` | Covered happy-path sections; partial error branches | P1 |
| LIFF | `/pet-owners/calendar-page?tab=appointment` | `appointment.cy.ts` | Covered CRUD + deep-link edit | P0/P1 |
| LIFF | `/pet-owners/calendar-page?tab=record` | `calendar-record.cy.ts` (new) | Covered smoke + create | P1 |
| LIFF | `/pet-owners/medication-page` | `medication.cy.ts` | Covered CRUD + deep-link | P0/P1 |
| LIFF | `/pet-owners/notification-page` | `notification.cy.ts` (new) | Covered group/read/empty | P1 |
| LIFF | `/pet-owners/my-pets-page` | `my-pets.cy.ts` (new) | Covered auth redirect/list/error | P0/P1 |
| LIFF | `/pet-owners/help-center-page` | `help-center.cy.ts` (new) | Covered smoke render | P2 |
| LIFF | `/pet-owners/owner-info-page` + edit | `auth.cy.ts`, `owner.cy.ts` | Covered profile + edit + image upload | P0/P1 |
| LIFF | `/pet-owners/my-pets-page/[petId]` + edit | `pet.cy.ts` | Covered owner-scope, update/delete constraints | P0 |
| LIFF | `/pet-owners/my-pets-page/[petId]/medical` | `history.cy.ts` | Covered sorting + empty state | P1 |
| LIFF | `/pet-owners/my-pets-page/[petId]/symptoms` | `symptom.cy.ts` | Covered CRUD incl. image upload | P0/P1 |
| Admin | `/admin/**` | `admin.cy.ts` (new) | Added smoke for major routes | P2 |

### Components / hooks / services / api routes
| Module | Coverage source | Status | Severity |
|---|---|---|---|
| `src/components/pet-owners/MainPage/HomePage/HomePage.tsx` | `dashboard.cy.ts`, `home-page.test.tsx` | happy-path + error/empty unit branch covered | P1 |
| `src/components/pet-owners/MainPage/MedicationPage/MedicationPage.tsx` | `medication.cy.ts`, `medication-page.test.tsx` | CRUD + deep-link + empty state covered | P0/P1 |
| `src/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPage.tsx` | `appointment.cy.ts`, `appointment-page.test.tsx` | CRUD + deep-link + empty state covered | P0/P1 |
| `src/components/pet-owners/MainPage/NotificationPage/NotificationPage.tsx` | `notification.cy.ts` | grouped/read/empty covered | P1 |
| `src/hooks/usePets.ts` | `src/hooks/hooks.test.ts` | covered | P1 |
| `src/hooks/useAppointments.ts` | `src/hooks/hooks.test.ts` | covered | P1 |
| `src/hooks/useMedications.ts` | `src/hooks/hooks.test.ts` | covered | P1 |
| `src/hooks/useSymptomRecords.ts` | `src/hooks/hooks.test.ts` | covered | P1 |
| `src/utils/reminder-utils.ts` | `src/utils/reminder-utils.test.ts` | covered key utilities/occurrence build | P1 |
| `src/services/api/client.ts` | `src/services/api/client.test.ts` | covered representative uncovered functions | P1 |
| `src/lib/api-proxy.ts` | `src/lib/api-proxy.test.ts` | covered auth forwarding + error mapping | P0 |
| `src/app/api/**` | `src/app/api/routes.contract.test.ts`, `src/app/api/upload/presigned-url/route.test.ts` | covered representative route contracts + R2 error branches | P0/P1 |

## Remaining Gaps (post-implementation)

### P0
- Non-mock integration of all Next API routes (`src/app/api/**/route.ts`) against real backend contract is still partial.
- Some failure-path alerts in `AppointmentPage`/`MedicationPage` are validated indirectly only.

### P1
- Dashboard popup loading overlay/toggle-taken interaction still lacks dedicated deterministic assertion.
- Medical history page (`MyPetsPage/medical/Medical.tsx`) add/edit-mode/delete interactions are still primarily E2E-light.
- Login callback error mapping (`token_exchange_failed`, `profile_failed`, `server_error`) needs direct E2E query-param scenarios.
- Pet info/edit loading/error/not-found branches still rely mostly on existing E2E and not focused unit tests.

### P2
- Admin pages still smoke-only (no behavior-level assertions beyond static render).

## Acceptance Gate Tracking
- [x] Added inventory artifact in repo
- [x] Added new E2E specs for uncovered user routes
- [x] Added unit/integration test harness (Vitest + RTL)
- [x] Added hook/util/component tests for critical branches
- [x] Added API/proxy contract tests for header/query/error branches
- [ ] Full non-mock backend matrix for all 27 route handlers
- [ ] Flake check run (3 consecutive passes)

## Run Commands
- Unit/integration: `npm run test:unit`
- Coverage report: `npm run test`
- Cypress iOS: `npm run cypress:run:ios`
- Cypress Android: `npm run cypress:run:android`
