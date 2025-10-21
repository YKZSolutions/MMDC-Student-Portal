import z from 'zod'

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
