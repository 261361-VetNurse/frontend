/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      fiEnsureBackendReady(): Chainable<any>;
      fiGetAuthToken(): Chainable<string>;
      fiLogin(): Chainable<string>;
      fiApi(
        method: string,
        path: string,
        body?: any,
        options?: { failOnStatusCode?: boolean; qs?: Record<string, any> }
      ): Chainable<any>;
      fiEnsureOwnerProfile(): Chainable<any>;
      fiGetMyPets(): Chainable<any>;
      fiCreatePet(overrides?: Record<string, unknown>): Chainable<any>;
      fiCreateAppointment(
        petId: number,
        overrides?: Record<string, unknown>
      ): Chainable<any>;
      fiCreateMedication(
        petId: number,
        overrides?: Record<string, unknown>
      ): Chainable<any>;
      fiCreateSymptomRecord(
        petId: number,
        overrides?: Record<string, unknown>
      ): Chainable<any>;
      fiRequireR2UploadReady(): Chainable<any>;
      fiVisitAuthed(path: string, visitOptions?: any): Chainable<any>;
    }
  }
}

export {};
