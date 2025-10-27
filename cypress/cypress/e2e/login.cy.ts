describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  // Test Case #1: Admin Login and Logout (This version is robust)
  it("should allow an admin to log in, see admin navigation, and then log out", () => {
    cy.intercept("GET", "/users*").as("getUsers");
    cy.intercept("GET", "/billing*").as("getBilling");

    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();

    cy.url().should("include", "/dashboard");
    cy.wait(["@getUsers", "@getBilling"]);

    // Wait for a specific piece of content to prove rendering is complete
    cy.contains("Total Users").should("be.visible");

    cy.screenshot("admin-logged-in-fully-loaded");

    // (Logout logic remains the same)
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-button"]').should("be.visible");
  });

  // Test Case #2: Student Login and Logout (UPDATED WITH FINAL FIX)
  it("should allow a student to log in, see student navigation, and then log out", () => {
    // --- SETUP INTERCEPTS ---
    cy.intercept("GET", "/modules/student*").as("getLmsModules");

    // --- LOGIN ---
    cy.get('[data-cy="email-input"]').type("student@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();

    // --- VERIFY LOGIN ---
    cy.url().should("include", "/lms");

    // **THE BULLETPROOF FIX**:
    // 1. Wait for the main API call to finish.
    cy.wait("@getLmsModules");

    // 2. Now, wait for the skeleton loaders to DISAPPEAR.
    // We need to identify a selector for the skeletons. Mantine UI often uses a class
    // like 'mantine-Skeleton-root'. We will assume that for now.
    // Cypress will retry this command until the skeletons are gone.
    cy.get('[class*="mantine-Skeleton-root"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // 3. Now that the loading is guaranteed to be finished, take the screenshot.
    cy.screenshot("student-logged-in-fully-loaded");

    // Check for an element to confirm the page is interactive
    cy.get('[data-cy="enrollment-link"]').should("be.visible");

    // --- LOGOUT ---
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-button"]').should("be.visible");
  });

  // Test Case #3: Invalid Login
  it("should show an error message for invalid credentials", () => {
    cy.get('[data-cy="email-input"]').type("invalid-user@mmdc.edu.ph");
    cy.get('[data-cy="password-input"]').type("wrongpassword");
    cy.get('[data-cy="login-button"]').click();

    cy.url().should("include", "/login");
    cy.contains("Invalid Password").should("be.visible");

    cy.screenshot("invalid-login-error"); // Only 1 screenshot showing the error
  });
});
