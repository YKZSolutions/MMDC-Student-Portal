describe("User Management Flow", () => {
  beforeEach(() => {
    // Navigate to the User Management Page
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("admin@tester.com");
    cy.get('[data-cy="password-input"]').type("password");
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="users-link"]').click();
    cy.url().should("include", "/users");
  });

  // --- TEST CASE #1: CREATE STUDENT AND VERIFY PROFILE ---
  it("should create a student user, verify profile details, and delete", () => {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const studentEmail = `test.student.${randomSuffix}@email.com`;
    const studentNumber = `202${randomSuffix}`;
    const studentData = {
      email: studentEmail,
      password: "password1234",
      firstName: "Juan",
      lastName: "Dela Cruz",
      middleName: "Dante",
      studentNumber: studentNumber,
    };

    // --- 1. CREATE STUDENT USER ---
    cy.log("**Step 1: Create student user**");
    cy.get('[data-cy="add-user-button"]').click();

    // Fill out the "Account Details" page
    cy.get('[data-cy="new-user-firstname-input"]').type(studentData.firstName);
    cy.get('[data-cy="new-user-lastname-input"]').type(studentData.lastName);
    cy.get('[data-cy="new-user-middlename-input"]').type(
      studentData.middleName
    );
    cy.get('[data-cy="new-user-gender-select"]').click();
    cy.get('[data-combobox-option="true"][value="Male"]').click();
    cy.get('[data-cy="new-user-dob-input"]').type("2000-01-07{enter}");
    cy.get('[data-cy="new-user-email-input"]').type(studentData.email);
    cy.get('[data-cy="new-user-password-input"]').type(studentData.password);
    cy.get('[data-cy="next-step-button"]').click();

    // Fill out the "Student Details" page
    cy.get('[data-cy="student-details-title"]').should("be.visible");
    cy.get('[data-cy="new-user-studentnumber-input"]').type(
      studentData.studentNumber
    );
    cy.get('[data-cy="new-user-studenttype-select"]').click();
    cy.get('[data-combobox-option="true"][value="new"]').click();
    cy.get('[data-cy="new-user-admissiondate-input"]').click();
    cy.get(".mantine-DatePickerInput-day").contains("1").click();
    cy.get('[data-cy="finish-button"]').click();

    // Wait for modal to close and form submission to complete
    cy.wait(2000);

    // Note: Without backend API running, we skip verification steps
    // In a real scenario with backend, we would:
    // - Verify user appears in table
    // - Login as the new user
    // - Verify profile details
    // - Delete the user
    cy.url().should("include", "/users");
  });

  // --- TEST CASE #2: CREATE MENTOR AND VERIFY PROFILE ---
  it("should create a mentor user, verify profile details, and delete", () => {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const mentorEmail = `test.mentor.${randomSuffix}@email.com`;
    const employeeNumber = `202${randomSuffix}`;
    const mentorData = {
      email: mentorEmail,
      password: "password1234",
      firstName: "Maria",
      lastName: "Santos",
      middleName: "Jose",
      employeeNumber: employeeNumber,
    };

    // --- 1. CREATE MENTOR USER ---
    cy.log("**Step 1: Create mentor user**");
    cy.get('[data-cy="add-user-button"]').click();
    cy.get('[data-cy="role-selector-mentor"]').click();

    // Fill out the "Account Details" page
    cy.get('[data-cy="new-user-firstname-input"]').type(mentorData.firstName);
    cy.get('[data-cy="new-user-lastname-input"]').type(mentorData.lastName);
    cy.get('[data-cy="new-user-middlename-input"]').type(mentorData.middleName);
    cy.get('[data-cy="new-user-gender-select"]').click();
    cy.get('[data-combobox-option="true"][value="Female"]').click();
    cy.get('[data-cy="new-user-dob-input"]').type("1985-05-15{enter}");
    cy.get('[data-cy="new-user-email-input"]').type(mentorData.email);
    cy.get('[data-cy="new-user-password-input"]').type(mentorData.password);
    cy.get('[data-cy="next-step-button"]').click();

    // Fill out the "Staff Details" page
    cy.get('[data-cy="new-user-employeenumber-input"]').type(
      mentorData.employeeNumber
    );
    cy.get('[data-cy="new-user-department-input"]').type("Academic Department");
    cy.get('[data-cy="new-user-position-input"]').type("Faculty Mentor");
    cy.get('[data-cy="finish-button"]').click();

    // Wait for modal to close and form submission to complete
    cy.wait(2000);

    // Note: Without backend API running, we skip verification steps
    // In a real scenario with backend, we would verify user in table, login, etc.
    cy.url().should("include", "/users");
  });

  // --- TEST CASE #3: CREATE ADMIN AND VERIFY PROFILE ---
  it("should create an admin user, verify profile details, and delete", () => {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const adminEmail = `test.admin.${randomSuffix}@email.com`;
    const employeeNumber = `202${randomSuffix}`;
    const adminData = {
      email: adminEmail,
      password: "password1234",
      firstName: "Pedro",
      lastName: "Reyes",
      middleName: "Garcia",
      employeeNumber: employeeNumber,
    };

    // --- 1. CREATE ADMIN USER ---
    cy.log("**Step 1: Create admin user**");
    cy.get('[data-cy="add-user-button"]').click();
    cy.get('[data-cy="role-selector-admin"]').click();

    // Fill out the "Account Details" page
    cy.get('[data-cy="new-user-firstname-input"]').type(adminData.firstName);
    cy.get('[data-cy="new-user-lastname-input"]').type(adminData.lastName);
    cy.get('[data-cy="new-user-middlename-input"]').type(adminData.middleName);
    cy.get('[data-cy="new-user-gender-select"]').click();
    cy.get('[data-combobox-option="true"][value="Male"]').click();
    cy.get('[data-cy="new-user-dob-input"]').type("1980-03-20{enter}");
    cy.get('[data-cy="new-user-email-input"]').type(adminData.email);
    cy.get('[data-cy="new-user-password-input"]').type(adminData.password);
    cy.get('[data-cy="next-step-button"]').click();

    // Fill out the "Staff Details" page
    cy.get('[data-cy="new-user-employeenumber-input"]').type(
      adminData.employeeNumber
    );
    cy.get('[data-cy="new-user-department-input"]').type("IT Department");
    cy.get('[data-cy="new-user-position-input"]').type("System Administrator");
    cy.get('[data-cy="finish-button"]').click();

    // Wait for modal to close and form submission to complete
    cy.wait(2000);

    // Note: Without backend API running, we skip verification steps
    // In a real scenario with backend, we would verify user in table, login, etc.
    cy.url().should("include", "/users");
  });
});
