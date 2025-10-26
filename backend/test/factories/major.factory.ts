/**
 * Major Factory Functions
 *
 * Provides readable, easy-to-use functions for creating major test data.
 * Uses the proper API structure with a nested major object and programId.
 *
 * Usage:
 *   const major = createMajor() // Creates a valid major with unique data
 *   const invalid = createInvalidMajor.missingFields() // Creates invalid major for validation testing
 *   const update = createMajorUpdate() // Creates update payload
 */

import { CreateProgramMajorDto } from '@/modules/major/dto/create-major.dto';
import { UpdateMajorDto } from '@/generated/nestjs-dto/update-major.dto';
import { CreateMajorDto } from '@/generated/nestjs-dto/create-major.dto';
import { v4 } from 'uuid';

/**
 * Generate unique major data to avoid conflicts between tests
 */
export const generateUniqueMajor = (): CreateMajorDto => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);

  return {
    majorCode: `CS${timestamp}${randomId}`,
    name: `Computer Science ${timestamp}`,
    description: `Computer Science major for ${timestamp} - ${randomId}`,
  };
};

/**
 * Create a valid major payload with unique data
 * Requires a programId for the API structure
 */
export const createMajor = (
  overrides: {
    programId?: string;
    majorCode?: string;
    name?: string;
    description?: string;
  } = {},
): CreateProgramMajorDto => {
  const base = generateUniqueMajor();
  const programId = overrides.programId || v4(); // Use the provided programId or generate a test UUID

  return {
    programId,
    major: {
      majorCode: overrides.majorCode || base.majorCode,
      name: overrides.name || base.name,
      description: overrides.description || base.description,
    },
  };
};

/**
 * Create an update major payload
 */
export const createMajorUpdate = (
  overrides: {
    majorCode?: string;
    name?: string;
    description?: string;
  } = {},
): UpdateMajorDto => {
  return {
    majorCode: overrides.majorCode || `UpdatedCS${Date.now()}`,
    name: overrides.name || 'Updated Computer Science',
    description:
      overrides.description || 'Updated Computer Science major description',
  };
};

/**
 * Create invalid major payloads for validation testing
 */
export const createInvalidMajor = {
  /**
   * Missing major object
   */
  missingMajor: (): Partial<CreateProgramMajorDto> => ({
    programId: v4(),
    // Missing major object
  }),

  /**
   * Missing programId
   */
  missingProgramId: (): Partial<CreateProgramMajorDto> => ({
    major: generateUniqueMajor(),
    // Missing programId
  }),

  /**
   * Invalid programId (not UUID)
   */
  invalidProgramId: (): CreateProgramMajorDto => {
    const base = createMajor();
    return {
      ...base,
      programId: 'not-a-uuid',
    };
  },

  /**
   * Missing required fields in a major object
   */
  missingMajorFields: (): CreateProgramMajorDto => {
    const base = createMajor();
    return {
      ...base,
      major: {
        majorCode: '',
        name: '',
        description: '',
      },
    };
  },

  /**
   * Invalid update - missing majorCode
   */
  updateMissingCode: (): UpdateMajorDto => ({
    name: 'Updated Major',
    description: 'Updated description',
    // Missing majorCode
  }),

  /**
   * Invalid update - empty fields
   */
  updateEmptyFields: (): UpdateMajorDto => ({
    majorCode: '',
    name: '',
    description: '',
  }),
};

/**
 * Pre-configured major test data for common scenarios
 */
export const testMajors = {
  // Valid majors
  default: createMajor(),
  cs: createMajor({
    majorCode: 'CS',
    name: 'Computer Science',
    description: 'Bachelor of Science in Computer Science',
  }),
  it: createMajor({
    majorCode: 'IT',
    name: 'Information Technology',
    description: 'Bachelor of Science in Information Technology',
  }),
  math: createMajor({
    majorCode: 'MATH',
    name: 'Mathematics',
    description: 'Bachelor of Science in Mathematics',
  }),

  update: {
    basic: createMajorUpdate(),
    codeOnly: createMajorUpdate({ majorCode: 'UpdatedCS' }),
    nameOnly: createMajorUpdate({ name: 'Updated Major Name' }),
    descriptionOnly: createMajorUpdate({ description: 'Updated description' }),
  },

  // Invalid majors for validation
  invalid: {
    missingMajor: createInvalidMajor.missingMajor(),
    missingProgramId: createInvalidMajor.missingProgramId(),
    invalidProgramId: createInvalidMajor.invalidProgramId(),
    missingMajorFields: createInvalidMajor.missingMajorFields(),

    update: {
      missingCode: createInvalidMajor.updateMissingCode(),
      emptyFields: createInvalidMajor.updateEmptyFields(),
    },
  },
};

/**
 * Helper function to create multiple majors for testing
 */
export const createMultipleMajors = (
  count: number,
  overrides: Parameters<typeof createMajor>[0] = {},
): CreateProgramMajorDto[] => {
  return Array.from({ length: count }, (_, index) =>
    createMajor({
      ...overrides,
      programId: overrides.programId || v4(),
      majorCode: overrides.majorCode || `MAJOR${index + 1}`,
    }),
  );
};
