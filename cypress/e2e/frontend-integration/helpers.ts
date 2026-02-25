export const FI_DATE = '2026-02-10';
export const FI_DATE_TIME = '2026-02-10T14:00:00';

export function fiUnique(prefix: string) {
  return `${prefix}-${Date.now()}-${Cypress._.random(1000, 9999)}`;
}

export function fiFreeze(dateIso = '2026-02-10T09:00:00Z') {
  cy.clock(new Date(dateIso).getTime(), ['Date']);
}

export function fiVisitAuthed(path: string, options: Partial<Cypress.VisitOptions> = {}) {
  return cy.fiVisitAuthed(path, options);
}

export function fiSeedPet() {
  return cy.fiEnsureOwnerProfile().then(() => cy.fiCreatePet());
}

export function fiDialog() {
  return cy.get('[role="dialog"]:visible').last();
}

export function fiClickButton(label: string | RegExp) {
  return cy.contains('button', label).should('be.visible').click();
}
