/**
 * Simple Curriculum Factory Functions
 *
 * Provides readable, easy-to-use functions for creating curriculum test data.
 * Uses the proper API structure with majorId, curriculum object, and courses array.
 *
 * Usage:
 *   const curriculum = createCurriculum() // Creates a valid curriculum with unique data
 *   const invalid = createInvalidCurriculum.missingFields() // Creates invalid curriculum for validation testing
 *   const update = createCurriculumUpdate() // Creates update payload
 */

import { CreateCurriculumWithCoursesDto } from '@/modules/curriculum/dto/create-curriculum.dto';
import { UpdateCurriculumWithCourseDto } from '@/modules/curriculum/dto/update-curriculum.dto';
import { CreateCurriculumDto } from '@/generated/nestjs-dto/create-curriculum.dto';
import { v4 } from 'uuid';

/**
 * Generate unique curriculum data to avoid conflicts between tests
 */
const generateUniqueCurriculum = (): CreateCurriculumDto => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    name: `Test Curriculum ${timestamp}`,
    description: `Test curriculum description for ${timestamp} - ${randomId}`,
    icon: `curriculum-icon-${timestamp}`,
  };
};

/**
 * Generate unique course item for curriculum
 */
const generateCourseItem = (
  courseId: string,
  order: number,
  year: number,
  semester: number,
) => ({
  courseId,
  order,
  year,
  semester,
});

/**
 * Create a valid curriculum payload with unique data
 * Requires a majorId and optionally courseIds
 */
export const createCurriculum = (
  overrides: {
    majorId?: string;
    year?: number;
    effectiveSemester?: string;
    description?: string;
    courseIds?: string[];
  } = {},
): CreateCurriculumWithCoursesDto => {
  const base = generateUniqueCurriculum();
  const majorId = overrides.majorId || v4(); // Use the provided majorId or generate a test UUID
  const courseIds = overrides.courseIds || [v4(), v4()]; // Default test course IDs

  return {
    majorId,
    curriculum: {
      name: overrides.description || base.name,
      description: overrides.description || base.description,
      icon: base.icon,
    },
    courses: courseIds.map((courseId, index) =>
      generateCourseItem(
        courseId,
        index + 1,
        overrides.year || 2025,
        index + 1,
      ),
    ),
  };
};

/**
 * Create an update curriculum payload
 */
export const createCurriculumUpdate = (
  overrides: {
    majorId?: string;
    description?: string;
    year?: number;
    effectiveSemester?: string;
    courseIds?: string[];
  } = {},
): UpdateCurriculumWithCourseDto => {
  const majorId = overrides.majorId || v4();
  const courseIds = overrides.courseIds || [v4(), v4()];

  return {
    majorId,
    curriculum: {
      name: overrides.description || 'Updated Curriculum Name',
      description: overrides.description || 'Updated Curriculum Description',
      icon: `updated-curriculum-icon-${Date.now()}`,
    },
    courses: courseIds.map((courseId, index) =>
      generateCourseItem(
        courseId,
        index + 1,
        overrides.year || 2025,
        index + 1,
      ),
    ),
  };
};

/**
 * Create invalid curriculum payloads for validation testing
 */
export const createInvalidCurriculum = {
  /**
   * Missing required majorId
   */
  missingMajorId: (): Partial<CreateCurriculumWithCoursesDto> => ({
    curriculum: generateUniqueCurriculum(),
    courses: [generateCourseItem(v4(), 1, 2025, 1)],
    // Missing majorId
  }),

  /**
   * Missing curriculum object
   */
  missingCurriculum: (): Partial<CreateCurriculumWithCoursesDto> => ({
    majorId: v4(),
    courses: [generateCourseItem(v4(), 1, 2025, 1)],
    // Missing curriculum object
  }),

  /**
   * Missing courses array
   */
  missingCourses: (): Partial<CreateCurriculumWithCoursesDto> => ({
    majorId: v4(),
    curriculum: generateUniqueCurriculum(),
    // Missing courses array
  }),

  /**
   * Invalid majorId (not UUID)
   */
  invalidMajorId: (): CreateCurriculumWithCoursesDto => {
    const base = createCurriculum();
    return {
      ...base,
      majorId: 'not-a-uuid',
    };
  },

  /**
   * Invalid courseId in courses array
   */
  invalidCourseId: (): CreateCurriculumWithCoursesDto => {
    const base = createCurriculum();
    return {
      ...base,
      courses: [
        generateCourseItem('not-a-uuid', 1, 2025, 1),
        ...base.courses.slice(1),
      ],
    };
  },

  /**
   * Negative year in course item
   */
  invalidCourseYear: (): CreateCurriculumWithCoursesDto => {
    const base = createCurriculum();
    return {
      ...base,
      courses: [
        generateCourseItem(base.courses[0].courseId, 1, -2025, 1),
        ...base.courses.slice(1),
      ],
    };
  },

  /**
   * Zero semester in course item
   */
  invalidCourseSemester: (): CreateCurriculumWithCoursesDto => {
    const base = createCurriculum();
    return {
      ...base,
      courses: [
        generateCourseItem(base.courses[0].courseId, 1, 2025, 0),
        ...base.courses.slice(1),
      ],
    };
  },

  /**
   * Invalid update - missing curriculum object
   */
  updateMissingCurriculum: (): Partial<UpdateCurriculumWithCourseDto> =>
    ({
      majorId: v4(),
      courses: [generateCourseItem(v4(), 1, 2025, 1)],
      // Missing curriculum object - this will cause a validation error
    }) as Partial<UpdateCurriculumWithCourseDto>,

  /**
   * Invalid update - invalid curriculum data
   */
  updateInvalidCurriculum: (): UpdateCurriculumWithCourseDto => {
    const base = createCurriculumUpdate();
    return {
      ...base,
      curriculum: {
        ...base.curriculum,
        // Invalid curriculum data - the API will validate this
      },
    };
  },

  /**
   * Invalid update - invalid majorId
   */
  updateInvalidMajorId: (): UpdateCurriculumWithCourseDto => {
    const base = createCurriculumUpdate();
    return {
      ...base,
      majorId: 'not-a-uuid',
    };
  },
};

/**
 * Pre-configured curriculum test data for common scenarios
 */
export const testCurriculums = {
  // Valid curriculums
  default: createCurriculum(),
  withTwoCourses: createCurriculum({
    description: 'CS Curriculum with multiple courses',
    courseIds: [v4(), v4()],
  }),
  withThreeCourses: createCurriculum({
    description: 'CS Curriculum with three courses',
    courseIds: [v4(), v4(), v4()],
  }),

  // Update payloads
  update: {
    basic: createCurriculumUpdate(),
    descriptionOnly: createCurriculumUpdate({
      description: 'Updated Curriculum Description',
    }),
    withNewCourses: createCurriculumUpdate({
      courseIds: [v4(), v4(), v4()],
    }),
  },

  // Invalid curriculums for validation
  invalid: {
    missingMajorId: createInvalidCurriculum.missingMajorId(),
    missingCurriculum: createInvalidCurriculum.missingCurriculum(),
    missingCourses: createInvalidCurriculum.missingCourses(),
    invalidMajorId: createInvalidCurriculum.invalidMajorId(),
    invalidCourseId: createInvalidCurriculum.invalidCourseId(),
    invalidCourseYear: createInvalidCurriculum.invalidCourseYear(),
    invalidCourseSemester: createInvalidCurriculum.invalidCourseSemester(),

    update: {
      missingCurriculum: createInvalidCurriculum.updateMissingCurriculum(),
      invalidMajorId: createInvalidCurriculum.updateInvalidMajorId(),
    },
  },
};

/**
 * Helper function to create multiple curriculums for testing
 */
export const createMultipleCurriculums = (
  count: number,
  overrides: Parameters<typeof createCurriculum>[0] = {},
): CreateCurriculumWithCoursesDto[] => {
  return Array.from({ length: count }, () =>
    createCurriculum({
      ...overrides,
      majorId: overrides.majorId || v4(),
      courseIds: overrides.courseIds || [v4(), v4()],
    }),
  );
};
