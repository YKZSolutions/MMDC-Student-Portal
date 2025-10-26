# Quick Start Guide - Cypress E2E Tests

## 🚀 Quick Start

### 1. Setup

```bash
cd cypress
pnpm install
```

### 2. Run Tests

#### Open Cypress UI (Recommended for Development)

```bash
pnpm run cy:open
```

#### Run All Tests (Headless)

```bash
pnpm run cy:run
```

#### Run Specific Feature Tests

```bash
pnpm run test:curriculum     # Curriculum tests
pnpm run test:courses        # Course tests
pnpm run test:programs       # Program tests
pnpm run test:pricing        # Pricing tests
pnpm run test:enrollment     # Enrollment tests
pnpm run test:billing        # Billing tests
pnpm run test:lms            # LMS tests
pnpm run test:appointment    # Appointment tests
pnpm run test:login          # Authentication tests
pnpm run test:users          # User management tests
```

## 📋 Prerequisites Checklist

- [ ] Backend API running at `http://localhost:4000`
- [ ] Frontend app running at `http://localhost:3000`
- [ ] Test database seeded with required data
- [ ] Test users created:
  - [ ] Admin: `admin@tester.com` / `password`
  - [ ] Student: `student@tester.com` / `password`
  - [ ] Mentor: `mentor@tester.com` / `password`

## 🧪 Test Coverage

| Feature         | Test File              | Status |
| --------------- | ---------------------- | ------ |
| Authentication  | `login.cy.ts`          | ✅     |
| User Management | `user-managment.cy.ts` | ✅     |
| Curriculum      | `curriculum.cy.ts`     | ✅     |
| Programs        | `programs.cy.ts`       | ✅     |
| Courses         | `courses.cy.ts`        | ✅     |
| Pricing         | `pricing.cy.ts`        | ✅     |
| Enrollment      | `enrollment.cy.ts`     | ✅     |
| Billing         | `billing.cy.ts`        | ✅     |
| LMS             | `lms.cy.ts`            | ✅     |
| Appointments    | `appointment.cy.ts`    | ✅     |

## 🎯 Common Test Patterns

### Login as Different Roles

```javascript
describe("My Feature", () => {
  beforeEach(() => {
    cy.loginAsAdmin(); // or loginAsStudent(), loginAsMentor()
  });

  afterEach(() => {
    cy.logout();
  });

  it("should test something", () => {
    // Your test here
  });
});
```

### Navigate to Feature

```javascript
cy.get('[data-cy="feature-link"]').click();
cy.url().should("include", "/feature");
```

### Fill Forms

```javascript
cy.get('[data-cy="input-field"]').type("value");
cy.get('[data-cy="select-field"]').click();
cy.contains("Option").click();
cy.get('[data-cy="submit-button"]').click();
```

### Assert Results

```javascript
cy.contains("Success message").should("be.visible");
cy.url().should("include", "/expected-path");
cy.get('[data-cy="element"]').should("exist");
```

## 🔍 Data-cy Naming Convention

All test selectors follow this pattern:

```
data-cy="{feature}-{element}-{type}"
```

Examples:

- `appointment-topic-input`
- `billing-create-button`
- `course-type-select`
- `curriculum-save-button`

## 🐛 Debugging Tips

1. **Use Cypress UI**: `pnpm run cy:open` for visual debugging
2. **Pause execution**: Add `cy.pause()` in your test
3. **Take screenshots**: Add `cy.screenshot('description')`
4. **Check console**: Tests run in real browser with DevTools
5. **Review command log**: Click on commands in Cypress UI

## 📝 Test Data Requirements

Your test database should include:

### Programs & Curriculum

- 2+ Programs with majors
- 1+ Curriculum per major
- 5+ Courses

### Financial

- 1+ Pricing group
- 1+ Bill for test student

### Learning

- 1+ Course with modules
- Modules with lessons/assignments

### Appointments

- Mix of booked/approved/cancelled appointments

## ⚙️ Configuration

Edit `cypress.config.js` to change:

- Base URL
- Timeouts
- Video recording
- Screenshot settings

## 📚 Resources

- [Full Test Documentation](./README.md)
- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)

## 🆘 Troubleshooting

### Tests fail immediately

```bash
# Check if servers are running
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

### Element not found errors

```bash
# Verify data-cy attributes exist in components
# Use Cypress UI to inspect elements
# Add cy.wait() for dynamic content
```

### Login fails

```bash
# Verify test users exist in database
# Check credentials match exactly
# Clear browser storage between tests
```

## 🎉 Next Steps

1. Review [Full README](./README.md) for detailed documentation
2. Run `pnpm run cy:open` to explore tests interactively
3. Start with `test:login` to verify setup
4. Run individual feature tests
5. Run full suite with `test:all`

---

**Need Help?** Check the [Full README](./README.md) or contact the development team.
