// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login as admin
Cypress.Commands.add("loginAsAdmin", () => {
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type("admin@tester.com");
  cy.get('[data-cy="password-input"]').type("password");
  cy.get('[data-cy="login-button"]').click();
  cy.url().should("include", "/dashboard");
});

// Custom command to login as student
Cypress.Commands.add("loginAsStudent", () => {
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type("student@tester.com");
  cy.get('[data-cy="password-input"]').type("password");
  cy.get('[data-cy="login-button"]').click();
  cy.url().should("include", "/lms");
});

// Custom command to login as mentor
Cypress.Commands.add("loginAsMentor", () => {
  cy.visit("/login");
  cy.get('[data-cy="email-input"]').type("mentor@tester.com");
  cy.get('[data-cy="password-input"]').type("password");
  cy.get('[data-cy="login-button"]').click();
  cy.url().should("include", "/lms");
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  cy.get('[data-cy="my-account-button"]').click();
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should("include", "/login");
});

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
