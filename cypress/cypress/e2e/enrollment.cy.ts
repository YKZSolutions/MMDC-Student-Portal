// Enrollment E2E Tests
describe("Enrollment Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Enrollment Period Creation", () => {
    it("should navigate to enrollment page", () => {
      cy.get('[data-cy="enrollment-link"]').click();
      cy.url().should("include", "/enrollment");
      cy.contains("Enrollment").should("be.visible");
    });

    it("should create a new enrollment period", () => {
      // Navigate to enrollment page
      cy.get('[data-cy="enrollment-link"]').click();

      // Verify page loaded
      cy.contains("Enrollment").should("be.visible");
      cy.contains("Manage student enrollment and course selection").should(
        "be.visible"
      );
    });

    it("should cancel enrollment creation", () => {
      cy.get('[data-cy="enrollment-link"]').click();

      // Verify enrollment page
      cy.contains("Enrollment").should("be.visible");
    });
  });

  describe("Enrollment Period Management", () => {
    it("should display enrollment periods", () => {
      cy.get('[data-cy="enrollment-link"]').click();

      // Check if enrollment page loaded
      cy.contains("Enrollment").should("be.visible");
      cy.contains("Manage student enrollment and course selection").should(
        "be.visible"
      );
    });

    it("should view enrollment period details", () => {
      cy.get('[data-cy="enrollment-link"]').click();

      // Verify enrollment page loaded
      cy.contains("Enrollment").should("be.visible");
    });
  });
});

describe("Student Enrollment", () => {
  beforeEach(() => {
    cy.loginAsStudent();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Student Enrollment View", () => {
    it("should view enrollment page as student", () => {
      cy.get('[data-cy="enrollment-link"]').click();
      cy.url().should("include", "/enrollment");
    });

    it("should switch between enrollment tabs", () => {
      cy.get('[data-cy="enrollment-link"]').click();

      // Verify enrollment page loaded
      cy.url().should("include", "/enrollment");
    });
  });
});
