import TranscriptPage from '@/pages/shared/transcript'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const transcriptSearchSchema = z.object({
  enrollmentPeriodId: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  editTranscriptId: z.string().optional().nullable(),
})

export type TranscriptSearch = z.infer<typeof transcriptSearchSchema>

export const Route = createFileRoute('/(protected)/transcript/')({
  component: RouteComponent,
  validateSearch: transcriptSearchSchema,
})

function RouteComponent() {
  return <TranscriptPage />
}
