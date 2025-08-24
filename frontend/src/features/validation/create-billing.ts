import { zBillingControllerCreateData } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodBillCreate = zBillingControllerCreateData.shape.body.shape
const zodBill = zodBillCreate.bill.shape

const BreakdownItemSchema = z.object({
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
})

const DueDateSchema = z
  .string()
  .nonempty('Due date is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Due date must be a valid date string.',
  })

const BillSchema = z.object({
  ...zodBill,

  billType: z.enum(zodBill.billType.options, {
    error: 'Invalid bill type.',
  }),

  paymentScheme: z.enum(zodBill.paymentScheme.options, {
    error: 'Invalid payment scheme.',
  }),

  costBreakdown: z
    .array(BreakdownItemSchema)
    .nonempty('At least one breakdown item is required.'),
})

export const CreateBillFormSchema = z
  .object({
    ...zodBillCreate,

    bill: BillSchema,

    dueDates: z.array(DueDateSchema),

    userId: z
      .uuid({ error: 'User must have a valid UUID.' })
      .nonempty('User is required.'),
  })
  .superRefine((data, ctx) => {
    const scheme = data.bill.paymentScheme
    const dueDates = data.dueDates ?? []

    const uniqueDates = new Set(dueDates)

    // Enforce uniqueness
    if (scheme !== 'full' && uniqueDates.size !== dueDates.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDates'],
        message: 'Due dates must be unique.',
      })
    }

    // Enforce count based on scheme
    if (scheme === 'full' && dueDates.length < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDates'],
        message: 'At least 1 due date is required for full payment.',
      })
    }

    if (scheme !== 'full' && dueDates.length !== 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDates'],
        message: 'At least 3 due dates are required for installment payment.',
      })
    }
  })

export type CreateBillFormValues = z.infer<typeof CreateBillFormSchema>
