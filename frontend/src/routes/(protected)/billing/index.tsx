import { zBillingStatus } from '@/features/billing/validation'
import { mergeCommonSearchSchema } from '@/integrations/zod/merge-common-schema'
import BillingPage from '@/pages/shared/billing'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const billingSearchSchema = mergeCommonSearchSchema({
  tab: z.enum(zBillingStatus.options).optional(),
})

export type BillingSearch = z.infer<typeof billingSearchSchema>

export const Route = createFileRoute('/(protected)/billing/')({
  component: RouteComponent,
  validateSearch: billingSearchSchema,
})

function RouteComponent() {
  return <BillingPage />
}
