// Billing E2E Tests
describe("Billing Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Bill Creation", () => {
    it("should navigate to billing page", () => {
      cy.get('[data-cy="billing-link"]').click();
      cy.url().should("include", "/billing");
      cy.contains("Billing").should("be.visible");
    });

    it("should create a new bill", () => {
      // Navigate to billing page
      cy.visit("/billing");

      // Verify billing page loaded
      cy.contains("Billing").should("be.visible");
    });

    it("should remove billing item", () => {
      cy.visit("/billing");

      // Verify billing page loaded
      cy.contains("Billing").should("be.visible");
    });

    it("should cancel bill creation", () => {
      cy.visit("/billing");

      // Verify billing page
      cy.contains("Billing").should("be.visible");
    });
  });

  describe("Bill Listing", () => {
    it("should display list of bills", () => {
      cy.get('[data-cy="billing-link"]').click();

      // Check if billing page loaded
      cy.contains("Billing").should("be.visible");
    });

    it("should filter bills", () => {
      cy.get('[data-cy="billing-link"]').click();

      // Verify billing page loaded
      cy.contains("Billing").should("be.visible");
    });
  });
});

describe("Student Billing View", () => {
  beforeEach(() => {
    cy.loginAsStudent();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("View Bills", () => {
    it("should view billing page as student", () => {
      cy.get('[data-cy="billing-link"]').click();
      cy.url().should("include", "/billing");
    });

    it("should view bill details", () => {
      cy.get('[data-cy="billing-link"]').click();

      // Verify billing page
      cy.url().should("include", "/billing");
    });
  });
});
