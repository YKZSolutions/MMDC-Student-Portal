export const seedConfig = {
  // ⚠️ Be careful when changing these values! It might generate large amounts of data.
  // Current configuration already generates at least 1000 records

  DELETE_ALL_DATA: true,
  CREATE_USER_ACCOUNTS: true,

  // Adjust these numbers to control the amount of data generated

  // --- User Distribution ---
  USERS: {
    TOTAL: 20,
    ADMINS: 2,
    MENTORS: 4,
    // STUDENTS will be calculated as TOTAL - ADMINS - MENTORS
  },

  // --- Academic Structure ---
  COURSES_PER_MAJOR: 2,
  ENROLLMENT_PERIODS: 2,
  SECTIONS_PER_OFFERING: 3,

  // --- Course Content ---
  MODULES_PER_COURSE: 2,
  SECTIONS_PER_MODULE: 3,
  SUBSECTIONS_PER_SECTION: 2,
  CONTENTS_PER_SUBSECTION: 2,

  // --- Groups ---
  GROUPS_PER_MODULE: 2,
  STUDENTS_PER_GROUP: 7,

  // --- Mentoring ---
  APPOINTMENTS_PER_STUDENT: 1,

  // --- Probabilities ---
  // Likelihood of a student being enrolled in an available course offering
  ENROLLMENT_CHANCE: 0.6,
  // Max students per section, enrollment will stop if this is reached
  MAX_STUDENTS_PER_SECTION: 25,
  // Likelihood of a content item being an assignment
  ASSIGNMENT_CHANCE: 0.3,
  // Likelihood of an enrolled student submitting their assignment
  SUBMISSION_CHANCE: 0.4,
  // Likelihood of a student submitting their assignment late
  LATE_SUBMISSION_CHANCE: 0.15,
  // Likelihood of a student receiving a grade for their assignment and quiz
  GRADING_CHANCE: 0.3,
  // Likelihood of a student having started/completed a module content
  PROGRESS_CHANCE: 0.5,

  // --- QUIZ ---
  // In minutes
  MIN_TIME_SPENT: 300,
  MAX_TIME_SPENT: 3600,
  QUESTION_COUNT: 50,

  // --- GRADING ---
  MIN_SCORE: 15,
  MAX_SCORE: 100,

  // --- RUBRIC ---
  RUBRIC_MIN_SCORE: 15,
  RUBRIC_MAX_SCORE: 20,

  // --- Billing ---
  // Number of installments for bills
  BILL_INSTALLMENTS: 3,

  // -- Notifications ---
  NOTIFICATIONS_PER_USER: 5,
};
