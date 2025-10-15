import { zUpdateAssignmentConfigDto } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zAssignmentConfigSchema = zUpdateAssignmentConfigDto.shape

export const assignmentConfigFormSchema = z
  .object({
    // ...zAssignmentConfigSchema,
    // mode: zAssignmentConfigSchema.mode.nullable(), //Uncomment when mode is implemented
    maxScore: z.number().int().min(0).nullable().optional().default(0),
    weightPercentage: z
      .number()
      .int()
      .min(0)
      .max(100)
      .nullable()
      .optional()
      .default(0),
    maxAttempts: z.number().int().min(0).nullable().optional().default(0),
    allowLateSubmission: zAssignmentConfigSchema.allowLateSubmission.nullable(),
    latePenalty: zAssignmentConfigSchema.latePenalty.nullable(),
    dueDate: zAssignmentConfigSchema.dueDate.nullable(),
    gracePeriodMinutes: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .default(0),
    rubricTemplateId: zAssignmentConfigSchema.rubricTemplateId.nullable(),
  })
  .superRefine((values, ctx) => {
    // Late submission validation
    if (values.allowLateSubmission === true && !values.dueDate) {
      ctx.addIssue({
        path: ['dueDate'],
        code: 'custom',
        message: 'Due date is required when late submissions are allowed',
      })
    }

    // Late penalty validation
    if (values.allowLateSubmission === true && values.latePenalty == null) {
      ctx.addIssue({
        path: ['latePenalty'],
        code: 'custom',
        message:
          'Late penalty must be specified when late submissions are allowed',
      })
    }

    if (values.allowLateSubmission === false && values.latePenalty != null) {
      ctx.addIssue({
        path: ['latePenalty'],
        code: 'custom',
        message:
          'Late penalty should not be set when late submissions are disabled',
      })
    }

    // Grace period validation
    if (values.gracePeriodMinutes != null && !values.dueDate) {
      ctx.addIssue({
        path: ['gracePeriodMinutes'],
        code: 'custom',
        message: 'Due date is required when grace period is specified',
      })
    }

    if (values.gracePeriodMinutes != null && values.gracePeriodMinutes < 0) {
      ctx.addIssue({
        path: ['gracePeriodMinutes'],
        code: 'custom',
        message: 'Grace period cannot be negative',
      })
    }

    // Max attempts validation
    if (values.maxAttempts != null && values.maxAttempts < 1) {
      ctx.addIssue({
        path: ['maxAttempts'],
        code: 'custom',
        message: 'Maximum attempts must be at least 1',
      })
    }

    // Weight percentage validation
    if (values.weightPercentage != null) {
      if (values.weightPercentage < 0) {
        ctx.addIssue({
          path: ['weightPercentage'],
          code: 'custom',
          message: 'Weight percentage cannot be negative',
        })
      }

      if (values.weightPercentage > 100) {
        ctx.addIssue({
          path: ['weightPercentage'],
          code: 'custom',
          message: 'Weight percentage cannot exceed 100%',
        })
      }
    }

    // Max score validation
    if (values.maxScore != null && values.maxScore <= 0) {
      ctx.addIssue({
        path: ['maxScore'],
        code: 'custom',
        message: 'Maximum score must be greater than 0',
      })
    }

    // Date validation - ensure the due date is not in the past
    if (values.dueDate && new Date(values.dueDate) < new Date()) {
      ctx.addIssue({
        path: ['dueDate'],
        code: 'custom',
        message: 'Due date cannot be in the past',
      })
    }

    // Late penalty range validation
    if (values.latePenalty != null) {
      if (values.latePenalty < 0) {
        ctx.addIssue({
          path: ['latePenalty'],
          code: 'custom',
          message: 'Late penalty cannot be negative',
        })
      }

      if (values.latePenalty > 100) {
        ctx.addIssue({
          path: ['latePenalty'],
          code: 'custom',
          message: 'Late penalty cannot exceed 100%',
        })
      }
    }
  })

export type AssignmentConfigFormInput = z.input<
  typeof assignmentConfigFormSchema
>
export type AssignmentConfigFormOutput = z.output<
  typeof assignmentConfigFormSchema
>
