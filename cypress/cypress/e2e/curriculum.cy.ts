// Curriculum E2E Tests
describe("Curriculum Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Curriculum Creation", () => {
    it("should navigate to curriculum page", () => {
      cy.get('[data-cy="curriculum-link"]').click();
      cy.url().should("include", "/curriculum");
      cy.contains("Curriculum").should("be.visible");
    });

    it("should create a new curriculum", () => {
      // Navigate to curriculum page
      cy.get('[data-cy="curriculum-link"]').click();
      cy.url().should("include", "/curriculum");

      // Click create curriculum button
      cy.contains("Create Curriculum").click();
      cy.url().should("include", "/curriculum/create");

      // Fill in program
      cy.get('[data-cy="curriculum-program-select"]').click();
      cy.get('[data-cy="curriculum-program-select"]').type(
        "Information Technology{enter}"
      );

      // Wait for major options to load
      cy.wait(1000);

      // Fill in major
      cy.get('[data-cy="curriculum-major-select"]').click();
      cy.get('[data-cy="curriculum-major-select"]').type("Software{enter}");

      // Fill in description
      cy.get('[data-cy="curriculum-description-input"]').type(
        "Test curriculum for IT Software Development program"
      );

      // Add courses to curriculum (if builder is available)
      // This would require interacting with the curriculum builder component

      // Save curriculum
      cy.get('[data-cy="curriculum-save-button"]').click();

      // Verify redirect back to curriculum list
      cy.url().should("include", "/curriculum");
      cy.contains("Successfully added").should("be.visible");
    });
  });

  describe("Curriculum Viewing", () => {
    it("should display list of curricula", () => {
      cy.get('[data-cy="curriculum-link"]').click();
      cy.url().should("include", "/curriculum");

      // Check if the curriculum management page loaded
      cy.contains("Curriculum Management").should("be.visible");
      cy.contains("Create Curriculum").should("be.visible");
    });

    it("should view curriculum details", () => {
      cy.get('[data-cy="curriculum-link"]').click();
      cy.url().should("include", "/curriculum");

      // Verify curriculum page content is displayed
      cy.contains("Curriculum Management").should("be.visible");
      cy.contains("Manage programs, majors, and courses").should("be.visible");
    });
  });
});
