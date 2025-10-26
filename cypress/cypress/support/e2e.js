// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Handle uncaught exceptions from the application (e.g., network errors)
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore network errors and promise rejections from the app
  if (
    err.message.includes("Failed to fetch") ||
    err.message.includes("NetworkError") ||
    err.message.includes("An unknown error has occurred")
  ) {
    return false;
  }
  // We still want to ensure there are no other unexpected errors
  return true;
});
