import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  fixturesFolder: "tests/cypress/fixtures",
  screenshotsFolder: "tests/cypress/screenshots",
  videosFolder: "tests/cypress/videos",
});
