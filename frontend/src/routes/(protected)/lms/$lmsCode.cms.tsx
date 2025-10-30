import LMSModuleCMS from '@/pages/shared/lms/cms/lms-module-cms.page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/$lmsCode/cms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LMSModuleCMS />
}
