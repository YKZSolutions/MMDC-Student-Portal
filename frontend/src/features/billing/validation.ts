import { zBillingControllerCreateData } from '@/integrations/api/client/zod.gen'
import { formatToLabel } from '@/utils/formatters'
import z from 'zod'

export const paymentSchemes =
  zBillingControllerCreateData.shape.body.shape.bill.shape.paymentScheme.options.map(
    (scheme) => ({
      value: scheme,
      label: formatToLabel(scheme),
    }),
  )

export const billTypes =
  zBillingControllerCreateData.shape.body.shape.bill.shape.billType.options.map(
    (type) => ({
      value: type,
      label: formatToLabel(type),
    }),
  )

export const billCategories = [
  'Tuition Fee',
  'Miscellaneous Fee',
  'Laboratory Fee',
  'Library Fee',
  'Athletic Fee',
  'Medical/Dental Fee',
  'Technology Fee',
  'Graduation Fee',
  'Thesis/Capstone Fee',
  'Internship/Practicum Fee',
  'Uniform Fee',
  'ID Card Fee',
  'Publication Fee',
  'Field Trip/Activity Fee',
  'Penalty Fee',
]

export const billingStatusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Overpaid', value: 'overpaid' },
  { label: 'Trash', value: 'deleted' },
] as const

export const zBillingStatus = z.enum(
  billingStatusOptions.map((option) => option.value),
)

export type BillingStatusOption = (typeof billingStatusOptions)[number]['value']
