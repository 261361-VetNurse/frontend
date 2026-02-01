describe("app smoke", () => {
  it("loads the home page", () => {
    cy.visit("/");
    cy.contains(/./);
  });
});
