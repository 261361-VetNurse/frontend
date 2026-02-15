// Commands and global setup for Cypress can live here.

Cypress.on("uncaught:exception", (err) => {
  // Date freezing in tests can trigger known Next.js hydration mismatch warnings on SSR pages.
  if (
    err.message.includes(
      "Hydration failed because the server rendered text didn't match the client"
    )
  ) {
    return false;
  }

  return true;
});
