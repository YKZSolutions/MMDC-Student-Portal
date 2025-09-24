export const seedConfig = {
  // ⚠️ Be careful when changing these values! It might generate large amounts of data.
  // Current configuration already generates at least 1000 records

  CREATE_USER_ACCOUNTS: false,

  // ---COUNTS---
  // Adjust these numbers to control the amount of data generated
  USERS: {
    TOTAL: 20,
    ADMINS: 2,
    MENTORS: 4,
    // STUDENTS will be calculated as TOTAL - ADMINS - MENTORS
  },
  PROGRAMS: 3,
  MAJORS_PER_PROGRAM: 2,
  COURSES_PER_MAJOR: 4,
  ENROLLMENT_PERIODS: 2,
  SECTIONS_PER_OFFERING: 2,
  MODULES_PER_COURSE: 2,
  SECTIONS_PER_MODULE: 3,
  SUBSECTIONS_PER_SECTION: 2,
  CONTENTS_PER_SECTION: 3,

  // ---PROBABILITIES & SETTINGS---
  // Likelihood of a student being enrolled in an available course offering
  ENROLLMENT_CHANCE: 0.7,
  // Max students per section, enrollment will stop if this is reached
  MAX_STUDENTS_PER_SECTION: 20,
  // Likelihood of a content item being an assignment
  ASSIGNMENT_CHANCE: 0.45,
  // Likelihood of an enrolled student submitting their assignment
  SUBMISSION_CHANCE: 0.65,
  // Likelihood of a student submitting their assignment late
  LATE_SUBMISSION_CHANCE: 0.2,
  // Likelihood of a student receiving a grade for their assignment and quiz
  GRADING_CHANCE: 0.3,
  // Likelihood of a student having started/completed a module content
  PROGRESS_CHANCE: 0.6,
  // Number of installments for bills
  BILL_INSTALLMENTS: 3,
};
