import TranscriptPage from '@/pages/shared/transcript'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/transcript/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TranscriptPage />
}
