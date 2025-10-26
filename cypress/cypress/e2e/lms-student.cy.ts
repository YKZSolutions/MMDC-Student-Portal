describe("Student LMS Page", () => {
  beforeEach(() => {
    // Logs in as a student and navigates to the LMS page
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("student@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="nav-link-lms"]').click(); // Use the real data-cy for the LMS link
    cy.url().should("include", "/lms");
  });

  // Test Case #1
  it("should display the LMS page with course cards after navigation", () => {
    cy.log("**Verifying the LMS page has loaded correctly**");

    cy.get('[data-cy="course-list-container"]').should("be.visible");

    // Take a screenshot for documentation
    cy.screenshot("student-lms-page-loaded");

    cy.get('[data-cy="course-card"]').should("have.length.greaterThan", 0);
  });
});
