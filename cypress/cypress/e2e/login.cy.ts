// This suite tests the entire user authentication flow: login and logout.
describe('Authentication Flow', () => {

  // This hook runs before each test, ensuring we always start at the login page.
  beforeEach(() => {
    cy.visit('/login');
  });

  // Test Case #1: Admin Login and Logout
  it('should allow an admin to log in, see admin navigation, and then log out', () => {
    // --- LOGIN ---
    // IMPORTANT: Replace with your team's real admin test credentials
    cy.get('[data-cy="email-input"]').type('admin@email.com');
    cy.get('[data-cy="password-input"]').type('1234');
    cy.get('[data-cy="login-button"]').click();

    // --- VERIFY LOGIN ---
    // Assert: Check that we are redirected to a protected page (like the profile)
    cy.url().should('include', '/dashboard');

    // Assert: The most reliable check is for the "Users" link in the sidebar, which only admins see.
    cy.get('[data-cy="users-link"]').should('be.visible'); // Assuming the link has data-cy="users-link"

    // --- LOGOUT ---
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    // --- VERIFY LOGOUT ---
    // Assert: Check that we are redirected back to the login page.
    cy.url().should('include', '/login');
    cy.get('[data-cy="login-button"]').should('be.visible'); // Verify a login page element is present
  });

  // Test Case #2: Student Login and Logout
  it('should allow a student to log in, see student navigation, and then log out', () => {
    // --- LOGIN ---
    // IMPORTANT: Replace with your team's real student test credentials
    cy.get('[data-cy="email-input"]').type('student@email.com');
    cy.get('[data-cy="password-input"]').type('1234');

    cy.get('[data-cy="login-button"]').click();

    // --- VERIFY LOGIN ---
    // Assert: Check that we are redirected to a protected page
    cy.url().should('include', '/dashboard');

    // Assert: The most reliable check is for the "LMS" link, which students see.
    cy.get('[data-cy="lms-link"]').should('be.visible'); // Assuming the link has data-cy="lms-link"

    // Assert: Also verify that the admin "Users" link does NOT exist.
    cy.get('[data-cy="users-link"]').should('not.exist');

    // --- LOGOUT ---
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    // --- VERIFY LOGOUT ---
    cy.url().should('include', '/login');
    cy.get('[data-cy="login-button"]').should('be.visible');
  });

  // Test Case #3: Invalid Login
  it('should show an error message for invalid credentials', () => {
    cy.get('[data-cy="email-input"]').type('invalid-user@mmdc.edu.ph');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();

    // Assert: The URL should not change.
    cy.url().should('include', '/login');

    // Assert: Check for a specific error message element.
    cy.contains('Invalid Password').should('be.visible');
  });

});