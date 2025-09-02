import { createFileRoute } from '@tanstack/react-router'
import { CMS } from '@/features/courses/cms/cms.tsx'

export const Route = createFileRoute('/(protected)/cms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CMS />
}
