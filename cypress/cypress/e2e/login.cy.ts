// This suite tests the entire user authentication flow: login and logout.
describe("Authentication Flow", () => {
  // This hook runs before each test, ensuring we always start at the login page.
  beforeEach(() => {
    cy.visit("/login");
  });

  // Test Case #1: Admin Login and Logout
  it("should allow an admin to log in, see admin navigation, and then log out", () => {
    // --- LOGIN ---

    // Intercept API calls to wait for the page to be fully loaded
    cy.intercept("GET", "/users*").as("getUsers");
    cy.intercept("GET", "/billing*").as("getBilling");
    // IMPORTANT: Replace with your team's real admin test credentials
    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();

    // --- VERIFY LOGIN ---
    // Assert: Check that we are redirected to a protected page (like the profile)
    cy.url().should("include", "/dashboard");

    // Wait for the data to arrive AND for a key piece of content to be visible
    cy.wait(["@getUsers", "@getBilling"]);
    cy.contains("Total Users").should("be.visible");

    // Assert: The most reliable check is for the "Users" link in the sidebar, which only admins see.
    cy.get('[data-cy="users-link"]').should("be.visible");

    cy.screenshot("admin-dashboard-loaded");

    // --- LOGOUT ---
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    // --- VERIFY LOGOUT ---
    // Assert: Check that we are redirected back to the login page.
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-button"]').should("be.visible"); // Verify a login page element is present
  });

  // Test Case #2: Student Login and Logout
  it("should allow a student to log in, see student navigation, and then log out", () => {
    // --- LOGIN ---
    // **THE FIX**: We will define the intercept BEFORE the action that triggers it.
    // We will also use a simpler, more robust string matcher.
    cy.intercept("GET", "**/modules/student*").as("getLmsModules");

    cy.get('[data-cy="email-input"]').type("student@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();

    // --- VERIFY LOGIN ---
    cy.url().should("include", "/lms");

    // This will now correctly catch the 'GET /modules/student?page=1' request.
    cy.wait("@getLmsModules");

    // Wait for the loading skeletons to disappear
    cy.get('[class*="mantine-Skeleton-root"]', { timeout: 10000 }).should(
      "not.exist"
    );

    cy.screenshot("student-lms-loaded");

    // Assertions
    cy.get('[data-cy="enrollment-link"]').should("be.visible");
    cy.get('[data-cy="users-link"]').should("not.exist");

    // --- LOGOUT ---
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    // --- VERIFY LOGOUT ---
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-button"]').should("be.visible");
  });

  // Test Case #3: Invalid Login
  it("should show an error message for invalid credentials", () => {
    cy.get('[data-cy="email-input"]').type("invalid-user@mmdc.edu.ph");
    cy.get('[data-cy="password-input"]').type("wrongpassword");
    cy.get('[data-cy="login-button"]').click();

    // Assert: The URL should not change.
    cy.url().should("include", "/login");

    // Assert: Check for a specific error message element.
    cy.contains("Invalid Password").should("be.visible");

    cy.screenshot("invalid-login-error-message");
  });
});
