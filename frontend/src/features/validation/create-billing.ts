import { zBillingControllerCreateData } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodBillCreate = zBillingControllerCreateData.shape.body.shape
const zodBill = zodBillCreate.bill.shape

export const CreateBillFormSchema = z.object({
  ...zodBillCreate,

  bill: z.object({
    ...zodBill,

    billType: zodBill.billType.nonempty('Bill type cannot be empty.'),

    costBreakdown: z
      .record(
        z.string(),
        z.record(
          z.string(),
          z.number({
            error: 'Value must be a number',
          }),
        ),
      )
      .refine(
        (val) =>
          Object.values(val).every((v) => Object.keys(v).length > 0) &&
          Object.keys(val).length > 0,
        {
          message: 'Cost breakdown cannot be empty.',
        },
      ),

    dueAt: z
      .string()
      .nonempty()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format.',
      }),
  }),

  userId: z
    .uuid({ error: 'User must have a valid UUID.' })
    .nonempty('User is required.'),
})

export type CreateBillFormValues = z.infer<typeof CreateBillFormSchema>
