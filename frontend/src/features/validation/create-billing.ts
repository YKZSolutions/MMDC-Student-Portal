import { zBillingControllerCreateData } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodBillCreate = zBillingControllerCreateData.shape.body.shape
const zodBill = zodBillCreate.bill.shape

export const CreateBillFormSchema = z.object({
  ...zodBillCreate,

  bill: z.object({
    ...zodBill,

    billType: z.enum(zodBill.billType.options, {
      error: 'Invalid bill type.',
    }),

    dueAt: z
      .string()
      .nonempty()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format.',
      }),
  }),

  costBreakdown: z
    .array(
      z.object({
        id: z.string(),
        name: z
          .string()
          .nonempty('Name is required')
          .max(30, { error: 'Name must not exceed 30 characters.' }),
        // Check for nonnegative for string
        cost: z.preprocess(
          (val) => (val !== null && val !== undefined ? String(val) : ''),
          z
            .string()
            .regex(/^\d+(\.\d{1,2})?$/, 'Cost must be a valid decimal')
            .refine((val) => Number(val) >= 0, {
              message: 'Cost cannot be negative',
            }),
        ),
        category: z.string().nonempty({ error: 'Category is required.' }),
      }),
    )
    .nonempty('At least one breakdown item is required.'),

  userId: z
    .uuid({ error: 'User must have a valid UUID.' })
    .nonempty('User is required.'),
})

export type CreateBillFormValues = z.infer<typeof CreateBillFormSchema>
