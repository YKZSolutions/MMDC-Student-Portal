import { paginationSearchSchema } from '@/features/pagination/search-validation'
import LMSDashboardPage from '@/pages/shared/lms/lms-dashboard.page'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsDashboardStateSearchSchema = paginationSearchSchema.extend({
  vie: z.enum(['grid', 'list']).optional(),
})

export const Route = createFileRoute('/(protected)/lms/')({
  component: RouteComponent,
  validateSearch: lmsDashboardStateSearchSchema,
})

function RouteComponent() {
  return <LMSDashboardPage />
}
