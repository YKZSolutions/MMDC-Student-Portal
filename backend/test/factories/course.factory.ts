/**
 * Simple Course Factory Functions
 *
 * Provides readable, easy-to-use functions for creating course test data.
 * Follows the Backend Integration Test Guidelines for systematic test data creation.
 *
 * Usage:
 *   const course = createCourse() // Creates a valid course with unique data
 *   const invalid = createInvalidCourse.missingFields() // Creates invalid course for validation testing
 *   const update = createCourseUpdate() // Creates update payload
 */

import { CreateCourseFullDto } from '@/modules/courses/dto/create-course-full.dto';
import { UpdateCourseDto } from '@/modules/courses/dto/update-course.dto';

/**
 * Generate unique course data to avoid conflicts between tests
 */
const generateUniqueCourse = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    courseCode: `CS${timestamp}${randomId}`,
    name: `Test Course ${timestamp}`,
    description: `Test course description for ${timestamp}`,
    units: 3,
    type: 'lecture',
  };
};

/**
 * Create a valid course payload with unique data
 */
export const createCourse = (
  overrides: {
    courseCode?: string;
    name?: string;
    description?: string;
    units?: number;
    type?: string;
    majorIds?: string[];
    prereqIds?: string[];
    coreqIds?: string[];
  } = {},
): CreateCourseFullDto => {
  const base = generateUniqueCourse();

  return {
    courseCode: overrides.courseCode || base.courseCode,
    name: overrides.name || base.name,
    description: overrides.description || base.description,
    units: overrides.units || base.units,
    type: overrides.type || base.type,
    majorIds: overrides.majorIds,
    prereqIds: overrides.prereqIds,
    coreqIds: overrides.coreqIds,
  };
};

/**
 * Create an update course payload
 */
export const createCourseUpdate = (
  overrides: {
    name?: string;
    description?: string;
    units?: number;
    type?: string;
    courseCode?: string;
    majorIds?: string[];
    prereqIds?: string[];
    coreqIds?: string[];
  } = {},
): UpdateCourseDto => {
  return {
    name: overrides.name || 'Updated Course Name',
    description: overrides.description || 'Updated description',
    units: overrides.units || 4,
    type: overrides.type || 'lecture',
    courseCode: overrides.courseCode,
    majorIds: overrides.majorIds,
    prereqIds: overrides.prereqIds,
    coreqIds: overrides.coreqIds,
  };
};

/**
 * Create invalid course payloads for validation testing
 */
export const createInvalidCourse = {
  /**
   * Missing required fields
   */
  missingFields: (): Partial<CreateCourseFullDto> => ({
    courseCode: 'CSX01',
    // Missing name, units, type
  }),

  /**
   * Invalid units (negative)
   */
  invalidUnits: (): CreateCourseFullDto => {
    const base = createCourse();
    return { ...base, units: -1 };
  },

  /**
   * Invalid units (not integer)
   */
  invalidUnitsType: (): CreateCourseFullDto => {
    const base = createCourse();
    return { ...base, units: 3.5 };
  },

  /**
   * Invalid UUIDs in relation arrays
   */
  invalidRelationIds: (): CreateCourseFullDto => {
    const base = createCourse();
    return {
      ...base,
      prereqIds: ['not-a-uuid'],
      coreqIds: ['also-not-uuid'],
    };
  },

  /**
   * Empty required fields
   */
  emptyFields: (): CreateCourseFullDto => {
    const base = createCourse();
    return {
      ...base,
      courseCode: '',
      name: '',
      units: 0,
      type: '',
    };
  },

  /**
   * Invalid update data
   */
  updateInvalidUnits: (): UpdateCourseDto => ({
    units: -1,
  }),

  /**
   * Invalid relation IDs in update
   */
  updateInvalidRelationIds: (): UpdateCourseDto => ({
    prereqIds: ['not-uuid'],
  }),
};

/**
 * Pre-configured course test data for common scenarios
 */
export const testCourses = {
  // Valid courses
  default: createCourse(),
  withPrerequisites: createCourse({
    name: 'Advanced Programming',
    prereqIds: [], // Will be filled with actual IDs in tests
  }),
  withCorequisites: createCourse({
    name: 'Programming Lab',
    coreqIds: [], // Will be filled with actual IDs in tests
  }),

  // Update payloads
  update: {
    basic: createCourseUpdate(),
    nameOnly: createCourseUpdate({ name: 'Updated Course Name' }),
    unitsOnly: createCourseUpdate({ units: 4 }),
  },

  // Invalid courses for validation
  invalid: {
    missingFields: createInvalidCourse.missingFields(),
    invalidUnits: createInvalidCourse.invalidUnits(),
    invalidUnitsType: createInvalidCourse.invalidUnitsType(),
    invalidRelationIds: createInvalidCourse.invalidRelationIds(),
    emptyFields: createInvalidCourse.emptyFields(),

    update: {
      invalidUnits: createInvalidCourse.updateInvalidUnits(),
      invalidRelationIds: createInvalidCourse.updateInvalidRelationIds(),
    },
  },
};

/**
 * Helper function to create multiple courses for testing
 */
export const createMultipleCourses = (
  count: number,
  overrides: Parameters<typeof createCourse>[0] = {},
) => {
  return Array.from({ length: count }, (_, index) =>
    createCourse({
      ...overrides,
      courseCode: `${overrides.courseCode || 'CS'}${Date.now()}${index}`,
    }),
  );
};
