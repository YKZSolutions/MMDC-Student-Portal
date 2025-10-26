const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Add this line to tell Cypress the root URL of your web application
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
