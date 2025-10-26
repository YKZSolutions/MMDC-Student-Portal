# Cypress E2E Tests for MMDC Student Portal

This directory contains comprehensive end-to-end (E2E) tests for the MMDC Student Portal application using Cypress.

## Test Files Overview

### Core Features

- **`login.cy.ts`** - Authentication flow tests (login/logout for different roles)
- **`user-management.cy.ts`** - User management and administration tests

### Academic Management

- **`curriculum.cy.ts`** - Curriculum creation and management tests
- **`programs.cy.ts`** - Academic programs and majors tests
- **`courses.cy.ts`** - Course creation, editing, and listing tests

### Financial Management

- **`pricing.cy.ts`** - Pricing groups and fee management tests
- **`billing.cy.ts`** - Bill creation, viewing, and payment tests
- **`enrollment.cy.ts`** - Enrollment period and student enrollment tests

### Learning & Appointments

- **`lms.cy.ts`** - Learning Management System (modules, assignments, submissions)
- **`appointment.cy.ts`** - Appointment booking, approval, and management tests

## Prerequisites

Before running the tests, ensure:

1. **Backend Server Running**: The backend API must be running at `http://localhost:4000` (or your configured API URL)
2. **Frontend Server Running**: The frontend app must be running at `http://localhost:3000`
3. **Test Database**: Use a dedicated test database with seeded test data
4. **Test Users**: The following test users should exist in your database:
   - **Admin**: `admin@tester.com` / `password`
   - **Student**: `student@tester.com` / `password`
   - **Mentor**: `mentor@tester.com` / `password`

## Running Tests

### Install Dependencies

```bash
cd cypress
npm install
```

### Run All Tests (Headless)

```bash
npm run cy:run
```

### Run Tests with Cypress UI

```bash
npm run cy:open
```

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/curriculum.cy.ts"
```

### Run Tests for Specific Feature

```bash
# Curriculum tests
npx cypress run --spec "cypress/e2e/curriculum.cy.ts"

# Billing tests
npx cypress run --spec "cypress/e2e/billing.cy.ts"

# LMS tests
npx cypress run --spec "cypress/e2e/lms.cy.ts"

# Appointment tests
npx cypress run --spec "cypress/e2e/appointment.cy.ts"
```

## Test Data Requirements

### Seeded Data Needed

For comprehensive test coverage, your test database should include:

1. **Programs & Majors**

   - At least 2 academic programs (e.g., "Information Technology", "Business Administration")
   - Each program should have at least 2 majors

2. **Courses**

   - At least 5 courses across different types (Core, Elective, General)
   - Sample: "Introduction to Programming", "Database Systems", etc.

3. **Curriculum**

   - At least 1 curriculum per major
   - Each curriculum should have multiple courses assigned

4. **Pricing Groups**

   - At least 1 pricing group with fee breakdown
   - Include various fee categories (Tuition, Lab, Miscellaneous)

5. **Enrollment Periods**

   - At least 1 active enrollment period
   - At least 1 past enrollment period

6. **Bills**

   - At least 1 bill for the test student
   - Mix of paid and unpaid bills

7. **LMS Data**

   - At least 1 course with modules
   - Modules should contain lessons and assignments
   - At least 1 assignment for submission testing

8. **Appointments**
   - Mix of booked, approved, and cancelled appointments
   - Appointments for both student and mentor test users

## Custom Commands

The test suite includes custom Cypress commands defined in `support/commands.js`:

### Authentication Commands

- `cy.loginAsAdmin()` - Login as admin user
- `cy.loginAsStudent()` - Login as student user
- `cy.loginAsMentor()` - Login as mentor user
- `cy.logout()` - Logout current user

### Usage Example

```javascript
describe("My Test Suite", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.logout();
  });

  it("should perform admin action", () => {
    // Test code here
  });
});
```

## Data-cy Attributes

All interactive elements in the application have `data-cy` attributes for reliable test selection:

### Common Patterns

- **Inputs**: `data-cy="feature-field-input"` (e.g., `appointment-topic-input`)
- **Buttons**: `data-cy="feature-action-button"` (e.g., `billing-create-button`)
- **Selects**: `data-cy="feature-field-select"` (e.g., `course-type-select`)
- **Links**: `data-cy="feature-link"` (e.g., `curriculum-link`)

### Examples

```javascript
// Input fields
cy.get('[data-cy="appointment-topic-input"]').type("Help needed");

// Buttons
cy.get('[data-cy="billing-create-button"]').click();

// Selects
cy.get('[data-cy="course-type-select"]').click();
cy.contains("Core").click();

// Navigation links
cy.get('[data-cy="curriculum-link"]').click();
```

## Test Organization

Each test file follows this structure:

```javascript
describe("Feature Name", () => {
  beforeEach(() => {
    cy.loginAsAdmin(); // or appropriate role
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Sub-feature 1", () => {
    it("should perform action 1", () => {
      // Test implementation
    });

    it("should validate behavior 2", () => {
      // Test implementation
    });
  });

  describe("Sub-feature 2", () => {
    // More tests...
  });
});
```

## Troubleshooting

### Common Issues

1. **Tests fail with "element not found"**

   - Ensure the application is fully loaded before assertions
   - Use `cy.wait()` for dynamic content
   - Check that data-cy attributes exist in the component

2. **Login tests fail**

   - Verify test user credentials in the database
   - Check that authentication flow is working manually
   - Ensure session storage is being cleared between tests

3. **Timeout errors**

   - Increase timeout in cypress.config.js
   - Check network requests in Cypress DevTools
   - Verify backend API is responding

4. **Date picker issues**
   - Ensure future dates are selectable
   - Check for disabled dates in the calendar
   - Use appropriate Mantine DatePicker selectors

### Debugging Tips

- Use `cy.pause()` to pause test execution
- Use `cy.debug()` to debug specific points
- Check Cypress command log in the UI
- Use `cy.screenshot()` to capture test states
- Enable video recording in cypress.config.js

## Configuration

Base configuration is in `cypress.config.js`:

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // Node event listeners
    },
  },
});
```

### Environment Variables

You can override configuration with environment variables:

```bash
CYPRESS_BASE_URL=http://localhost:3000 npm run cy:run
```

## Best Practices

1. **Keep tests independent** - Each test should be able to run standalone
2. **Use data-cy attributes** - Never rely on CSS classes or text that may change
3. **Clean up after tests** - Use afterEach hooks to reset state
4. **Be explicit with waits** - Use cy.wait() for async operations
5. **Test user flows** - Focus on complete user journeys, not just individual actions
6. **Meaningful assertions** - Assert on user-visible elements and outcomes

## Contributing

When adding new tests:

1. Follow the existing file naming convention: `feature-name.cy.ts`
2. Add appropriate data-cy attributes to new components
3. Use custom login commands for authentication
4. Document any new test data requirements
5. Keep tests focused and descriptive

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Cypress tests
  run: |
    npm run cy:run
  env:
    CYPRESS_BASE_URL: ${{ secrets.BASE_URL }}
```

## Coverage

Current test coverage includes:

- ✅ Authentication (Login/Logout)
- ✅ User Management
- ✅ Curriculum Management
- ✅ Program & Major Management
- ✅ Course Management
- ✅ Pricing Management
- ✅ Enrollment Management
- ✅ Billing Management
- ✅ LMS (Modules, Lessons, Assignments)
- ✅ Assignment Submissions
- ✅ Appointment Booking & Management

## Support

For issues or questions about the tests:

1. Check this README for troubleshooting tips
2. Review existing test files for examples
3. Consult Cypress documentation: https://docs.cypress.io
4. Contact the development team
