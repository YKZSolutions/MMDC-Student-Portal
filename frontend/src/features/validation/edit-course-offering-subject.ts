import { zEnrollmentControllerUpdateCourseSectionResponse } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodCourseOfferingSubjectEdit =
  zEnrollmentControllerUpdateCourseSectionResponse.shape

export const EditSectionFormSchema = z
  .object({
    name: zodCourseOfferingSubjectEdit.name.min(1, 'Name is required').max(100),
    days: zodCourseOfferingSubjectEdit.days.min(1, 'Select at least one day'),
    startSched: zodCourseOfferingSubjectEdit.startSched.regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      'Expected HH:mm',
    ),
    endSched: zodCourseOfferingSubjectEdit.endSched.regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      'Expected HH:mm',
    ),
    maxSlot: zodCourseOfferingSubjectEdit.maxSlot
      .int({
        error: 'Max slots must be an integer',
      })
      .min(1, 'Must be at least 1'),
    mentorId: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
      z.uuid().optional().nullable(),
    ),
  })
  .superRefine((values, ctx) => {
    if (
      values.startSched &&
      values.endSched &&
      values.startSched >= values.endSched
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start time must be before end time',
        path: ['startSched'],
      })
    }
  })

export type EditSectionFormValues = z.infer<typeof EditSectionFormSchema>
