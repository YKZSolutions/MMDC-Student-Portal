/**
 * Program Factory Functions
 *
 * Provides readable, easy-to-use functions for creating program test data.
 * Used as dependencies for major creation and testing.
 *
 * Usage:
 *   const program = createProgram() // Creates a valid program with unique data
 *   const invalid = createInvalidProgram.missingFields() // Creates invalid program for validation testing
 *   const update = createProgramUpdate() // Creates update payload
 */

import { CreateProgramDto } from '@/generated/nestjs-dto/create-program.dto';
import { UpdateProgramDto } from '@/generated/nestjs-dto/update-program.dto';

/**
 * Generate unique program data to avoid conflicts between tests
 */
const generateUniqueProgram = (): CreateProgramDto => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    programCode: `BS${timestamp}${randomId}`,
    name: `Bachelor of Science ${timestamp}`,
    description: `Bachelor of Science program for ${timestamp} - ${randomId}`,
    yearDuration: 4,
  };
};

/**
 * Create a valid program payload with unique data
 */
export const createProgram = (
  overrides: {
    programCode?: string;
    name?: string;
    description?: string;
    yearDuration?: number;
  } = {},
): CreateProgramDto => {
  const base = generateUniqueProgram();

  return {
    programCode: overrides.programCode || base.programCode,
    name: overrides.name || base.name,
    description: overrides.description || base.description,
    yearDuration: overrides.yearDuration || base.yearDuration,
  };
};

/**
 * Create an update program payload
 */
export const createProgramUpdate = (
  overrides: {
    programCode?: string;
    name?: string;
    description?: string;
    yearDuration?: number;
  } = {},
): UpdateProgramDto => {
  return {
    programCode: overrides.programCode || `UpdatedBS${Date.now()}`,
    name: overrides.name || 'Updated Bachelor of Science',
    description:
      overrides.description ||
      'Updated Bachelor of Science program description',
    yearDuration: overrides.yearDuration,
  };
};

/**
 * Create invalid program payloads for validation testing
 */
export const createInvalidProgram = {
  /**
   * Missing required fields
   */
  missingFields: (): Partial<CreateProgramDto> => ({
    programCode: 'BS2025',
    name: 'Computer Science',
    // Missing description and yearDuration
  }),

  /**
   * Invalid yearDuration (negative)
   */
  invalidYearDuration: (): CreateProgramDto => {
    const base = createProgram();
    return { ...base, yearDuration: -1 };
  },

  /**
   * Invalid yearDuration (zero)
   */
  invalidYearDurationZero: (): CreateProgramDto => {
    const base = createProgram();
    return { ...base, yearDuration: 0 };
  },

  /**
   * Empty required fields
   */
  emptyFields: (): CreateProgramDto => {
    const base = createProgram();
    return {
      ...base,
      programCode: '',
      name: '',
      description: '',
    };
  },

  /**
   * Invalid update data
   */
  updateInvalidYearDuration: (): UpdateProgramDto => ({
    yearDuration: -2,
  }),

  /**
   * Empty update fields
   */
  updateEmptyFields: (): UpdateProgramDto => ({
    programCode: '',
    name: '',
    description: '',
  }),
};

/**
 * Pre-configured program test data for common scenarios
 */
export const testPrograms = {
  // Valid programs
  default: createProgram(),
  bs: createProgram({
    programCode: 'BS',
    name: 'Bachelor of Science',
    description: 'Bachelor of Science degree program',
    yearDuration: 4,
  }),
  ba: createProgram({
    programCode: 'BA',
    name: 'Bachelor of Arts',
    description: 'Bachelor of Arts degree program',
    yearDuration: 4,
  }),
  engineering: createProgram({
    programCode: 'BSE',
    name: 'Bachelor of Science in Engineering',
    description: 'Engineering degree program',
    yearDuration: 5,
  }),

  // Update payloads
  update: {
    basic: createProgramUpdate(),
    codeOnly: createProgramUpdate({ programCode: 'UpdatedBS' }),
    durationOnly: createProgramUpdate({ yearDuration: 3 }),
  },

  // Invalid programs for validation
  invalid: {
    missingFields: createInvalidProgram.missingFields(),
    invalidYearDuration: createInvalidProgram.invalidYearDuration(),
    invalidYearDurationZero: createInvalidProgram.invalidYearDurationZero(),
    emptyFields: createInvalidProgram.emptyFields(),

    update: {
      invalidYearDuration: createInvalidProgram.updateInvalidYearDuration(),
      emptyFields: createInvalidProgram.updateEmptyFields(),
    },
  },
};

/**
 * Helper function to create multiple programs for testing
 */
export const createMultiplePrograms = (
  count: number,
  overrides: Parameters<typeof createProgram>[0] = {},
) => {
  return Array.from({ length: count }, (_, index) =>
    createProgram({
      ...overrides,
      programCode: overrides.programCode || `PROGRAM${index + 1}`,
      yearDuration: overrides.yearDuration || 4,
    }),
  );
};
