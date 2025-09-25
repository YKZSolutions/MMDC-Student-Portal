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
  MAJORS_PER_PROGRAM: 2,
  COURSES_PER_MAJOR: 4,
  ENROLLMENT_PERIODS: 2,
  SECTIONS_PER_OFFERING: 2,

  // --- Course Content ---
  MODULES_PER_COURSE: 4,
  SECTIONS_PER_MODULE: 3,
  SUBSECTIONS_PER_SECTION: 2,
  CONTENTS_PER_SUBSECTION: 3,

  // --- Groups ---
  GROUPS_PER_MODULE: 2,
  STUDENTS_PER_GROUP: 4,

  // --- Mentoring ---
  APPOINTMENTS_PER_STUDENT: 2,

  // --- Discussion ---
  DISCUSSIONS_PER_MODULE: 2,
  POSTS_PER_DISCUSSION: 5,

  // --- Probabilities ---
  // Likelihood of a student being enrolled in an available course offering
  ENROLLMENT_CHANCE: 0.8,
  // Max students per section, enrollment will stop if this is reached
  MAX_STUDENTS_PER_SECTION: 25,
  // Likelihood of a content item being an assignment
  ASSIGNMENT_CHANCE: 0.3,
  // Likelihood of a content item being a quiz
  QUIZ_CHANCE: 0.2,
  // Likelihood of an enrolled student submitting their assignment
  SUBMISSION_CHANCE: 0.7,
  // Likelihood of a student submitting their assignment late
  LATE_SUBMISSION_CHANCE: 0.15,
  // Likelihood of a student receiving a grade for their assignment and quiz
  GRADING_CHANCE: 0.8,
  // Likelihood of a student having started/completed a module content
  PROGRESS_CHANCE: 0.75,

  // --- Billing ---
  // Number of installments for bills
  BILL_INSTALLMENTS: 3,

  // -- Notifications ---
  NOTIFICATIONS_PER_USER: 5,
};
