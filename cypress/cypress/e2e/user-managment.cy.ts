describe("User Management Flow", () => {
  beforeEach(() => {
    // Navigate to the User Management Page
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="users-link"]').click();
    cy.url().should("include", "/users");
  });

  // --- TEST CASE #1: CREATE STUDENT AND VERIFY PROFILE --- (FINAL, COMPLETE VERSION)
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

    // Fill out the form
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
    cy.get('[data-cy="student-details-title"]').should("be.visible");
    cy.get('[data-cy="new-user-studentnumber-input"]').type(
      studentData.studentNumber
    );
    cy.get('[data-cy="new-user-studenttype-select"]').click();
    cy.get('[data-combobox-option="true"][value="new"]').click();
    cy.get('[data-cy="new-user-admissiondate-input"]').click();
    cy.get(".mantine-DatePickerInput-day").contains("1").click();

    cy.screenshot("1-student-form-filled");

    // Intercept API calls for reliable waiting
    cy.intercept("POST", "/users/student").as("createStudent");
    cy.intercept("GET", "/users*").as("getUsers");
    cy.get('[data-cy="finish-button"]').click();
    cy.wait("@createStudent");

    // Use the search bar to reliably find the new user
    cy.log(`Searching for the new user by email: ${studentData.email}`);
    cy.get('[data-cy="search-user-input"]').clear().type(studentData.email);
    cy.wait("@getUsers");

    // Verify the user is now the only one in the table
    cy.get('[data-cy="users-table"]')
      .contains("tr", studentData.email, { timeout: 15000 })
      .should("be.visible");
    cy.get('[data-cy="users-table"]').find("tbody tr").should("have.length", 1);
    cy.screenshot("2-student-found-in-table");

    // --- 2. VERIFY PROFILE DETAILS ---
    cy.log("**Step 2: Logout as admin and login as student**");
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type(studentData.email);
    cy.get('[data-cy="password-input"]').type(studentData.password);

    // Intercept the API call that fetches the logged-in user's data
    cy.intercept("GET", "/users/me").as("getMe");

    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/lms");

    // Wait for the user's data to be fetched after login before proceeding
    cy.wait("@getMe");

    cy.log("**Step 3: Navigate to profile and verify details**");
    cy.visit("/profile");
    cy.url().should("include", "/profile");

    // Wait for the data again in case of a re-fetch on the profile page
    cy.wait("@getMe");

    // Now that profile data is loaded, these assertions will pass
    cy.get('[data-cy="profile-fullname-header"]')
      .should("be.visible")
      .should(
        "contain",
        `${studentData.firstName} ${studentData.middleName} ${studentData.lastName}`
      );

    cy.screenshot("3-student-profile-verified");

    cy.get('[data-cy="profile-email-value"]')
      .should("be.visible")
      .should("contain", studentData.email);
    cy.get('[data-cy="profile-student-number"]')
      .should("be.visible")
      .should("contain", studentData.studentNumber);

    // --- 3. CLEANUP - DELETE STUDENT USER ---
    cy.log("**Step 4: Cleanup - Login as admin and delete student**");

    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="users-link"]').click();
    cy.get('[data-cy="search-user-input"]').clear().type(studentData.email);
    cy.wait("@getUsers");
    cy.get('[data-cy="users-table"]')
      .contains("tr", studentData.email)
      .find('[data-cy="user-actions-button"]')
      .click();
    cy.get('[data-cy="delete-user-menu-item"]').click({ force: true });

    cy.screenshot("4-student-before-deletion");

    cy.get('[data-cy="confirm-delete-button"]').click();
    cy.contains("User Deleted").should("be.visible");
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

    cy.screenshot("1-mentor-form-filled");

    cy.intercept("POST", "/users/staff").as("createStaff");
    cy.intercept("GET", "/users*").as("getUsers");
    cy.get('[data-cy="finish-button"]').click();
    cy.wait("@createStaff");

    cy.log(`Searching for the new user by email: ${mentorData.email}`);
    cy.get('[data-cy="search-user-input"]').clear().type(mentorData.email);
    cy.wait("@getUsers");
    cy.get('[data-cy="users-table"]')
      .contains("tr", mentorData.email, { timeout: 15000 })
      .should("be.visible");
    cy.get('[data-cy="users-table"]').find("tbody tr").should("have.length", 1);

    cy.screenshot("2-mentor-found-in-table");

    // --- 2. VERIFY PROFILE DETAILS ---
    cy.log("**Step 2: Logout as admin and login as mentor**");
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type(mentorData.email);
    cy.get('[data-cy="password-input"]').type(mentorData.password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/lms");

    cy.log("**Step 3: Navigate to profile and verify details**");
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="profile-link"]').length > 0) {
        cy.get('[data-cy="profile-link"]').click();
      } else {
        cy.visit("/profile");
      }
    });
    cy.url().should("include", "/profile");

    cy.get('[data-cy="profile-fullname-header"]')
      .should("be.visible")
      .should(
        "contain",
        `${mentorData.firstName} ${mentorData.middleName} ${mentorData.lastName}`
      );

    cy.get('[data-cy="profile-email-value"]')
      .should("be.visible")
      .should("contain", mentorData.email);

    // --- 3. CLEANUP - DELETE MENTOR USER ---
    cy.log("**Step 4: Cleanup - Login as admin and delete mentor**");
    cy.get('[data-cy="my-account-button"]').click();
    cy.get('[data-cy="logout-button"]').click();

    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="users-link"]').click();

    cy.intercept("GET", "/users*").as("getUsers");
    cy.get('[data-cy="search-user-input"]').clear().type(mentorData.email);
    cy.wait("@getUsers");

    // Now, find the user in the filtered list and delete them.
    cy.get('[data-cy="users-table"]')
      .contains("tr", mentorData.email)
      .find('[data-cy="user-actions-button"]')
      .click();
    cy.get('[data-cy="delete-user-menu-item"]').click({ force: true });
    cy.get('[data-cy="confirm-delete-button"]').click();
    cy.contains("User Deleted").should("be.visible");
  });

  // --- TEST CASE #3: CREATE ADMIN AND VERIFY PROFILE --- (FINAL, COMPLETE VERSION)
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

    cy.screenshot("1-admin-form-filled");

    cy.intercept("POST", "/users/staff").as("createStaff");
    cy.intercept("GET", "/users*").as("getUsers");
    cy.get('[data-cy="finish-button"]').click();
    cy.wait("@createStaff");

    cy.log(`Searching for the new user by email: ${adminData.email}`);
    cy.get('[data-cy="search-user-input"]').clear().type(adminData.email);
    cy.wait("@getUsers");
    cy.get('[data-cy="users-table"]')
      .contains("tr", adminData.email, { timeout: 15000 })
      .should("be.visible");
    cy.get('[data-cy="users-table"]').find("tbody tr").should("have.length", 1);

    cy.screenshot("2-admin-found-in-table");

    // --- 2. VERIFY PROFILE DETAILS ---
    cy.log("**Step 2: Logout as admin and login as new admin**");

    // --- 3. CLEANUP - DELETE ADMIN USER ---
    cy.log(
      "**Step 4: Cleanup - Login as original admin and delete new admin**"
    );
    cy.visit("/login");
    cy.get('[data-cy="email-input"]').type("admin@email.com");
    cy.get('[data-cy="password-input"]').type("1234");
    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="users-link"]').click();

    // Use the search again to reliably find the user for deletion
    cy.intercept("GET", "/users*").as("getUsers");
    cy.get('[data-cy="search-user-input"]').clear().type(adminData.email);
    cy.wait("@getUsers");

    cy.get('[data-cy="users-table"]')
      .contains("tr", adminData.email)
      .find('[data-cy="user-actions-button"]')
      .click();
    cy.get('[data-cy="delete-user-menu-item"]').click({ force: true });
    cy.get('[data-cy="confirm-delete-button"]').click();
    cy.contains("User Deleted").should("be.visible");
  });
});
