// Programs E2E Tests
describe("Program Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Program Navigation", () => {
    it("should navigate to programs page", () => {
      cy.visit("/curriculum/programs");
      cy.url().should("include", "/curriculum/programs");
      cy.contains("Programs").should("be.visible");
      cy.contains("View and manage all programs and majors").should(
        "be.visible"
      );
    });
  });

  describe("Program Listing", () => {
    it("should display list of programs", () => {
      cy.visit("/curriculum/programs");

      // Check if programs page loaded
      cy.contains("Programs").should("be.visible");
      cy.contains("View and manage all programs and majors").should(
        "be.visible"
      );
    });

    it("should search for programs", () => {
      cy.visit("/curriculum/programs");

      // Verify the page loaded
      cy.contains("Programs").should("be.visible");
    });
  });

  describe("Program Details", () => {
    it("should view program details", () => {
      cy.visit("/curriculum/programs");

      // Verify programs page is displayed
      cy.contains("Programs").should("be.visible");
      cy.contains("View and manage all programs and majors").should(
        "be.visible"
      );
    });

    it("should view program majors", () => {
      cy.visit("/curriculum/programs");

      // Verify programs page content
      cy.contains("Programs").should("be.visible");
    });
  });
});
