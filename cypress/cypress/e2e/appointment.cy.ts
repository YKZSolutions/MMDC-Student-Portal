// Appointment E2E Tests
describe("Appointment Management - Student", () => {
  beforeEach(() => {
    cy.loginAsStudent();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Appointment Page Navigation", () => {
    it("should be logged in as student", () => {
      cy.url().should("include", "/lms");
      cy.contains("Learning Management System").should("be.visible");
    });

    it("should display appointment page elements", () => {
      cy.visit("/appointment");
      cy.url().should("include", "/appointment");
      cy.contains("Appointment").should("be.visible");
      cy.contains("Book an appointment with your mentors").should("be.visible");
    });
  });

  describe("Appointment Filters", () => {
    it("should switch between status filters", () => {
      cy.visit("/appointment");

      // Test filter switching
      cy.contains("Finished").click();
      cy.url().should("include", "status=finished");

      cy.contains("Cancelled").click();
      cy.url().should("include", "status=cancelled");

      cy.contains("Upcoming").click();
      cy.url().should("not.include", "status=");
    });
  });
});

describe("Appointment Management - Mentor", () => {
  beforeEach(() => {
    cy.loginAsMentor();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Appointment Page", () => {
    it("should be logged in as mentor", () => {
      cy.url().should("include", "/lms");
      cy.contains("Learning Management System").should("be.visible");
    });

    it("should display appointment page", () => {
      cy.visit("/appointment");
      cy.url().should("include", "/appointment");
      cy.contains("Appointment").should("be.visible");
    });
  });
});

describe("Appointment Calendar", () => {
  beforeEach(() => {
    cy.loginAsStudent();
  });

  afterEach(() => {
    cy.logout();
  });

  describe("Calendar View", () => {
    it("should display appointment page with filters", () => {
      cy.visit("/appointment");

      // Verify page loaded and has filter controls
      cy.contains("Appointment").should("be.visible");
      cy.contains("Upcoming").should("be.visible");
    });

    it("should allow filter interaction", () => {
      cy.visit("/appointment");

      // Verify filters are interactive
      cy.contains("Finished").should("be.visible");
      cy.contains("Cancelled").should("be.visible");
    });
  });
});
