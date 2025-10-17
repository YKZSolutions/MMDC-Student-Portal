import { transcriptControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import TranscriptPage from '@/pages/shared/transcript'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const transcriptSearchSchema = z.object({
  enrollmentPeriodId: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
})

export type TranscriptSearch = z.infer<typeof transcriptSearchSchema>

export const Route = createFileRoute('/(protected)/transcript/')({
  component: RouteComponent,
  validateSearch: transcriptSearchSchema,
  loader: async ({ context }) => {
    const transcript = await context.queryClient.ensureQueryData(
      transcriptControllerFindAllOptions({}),
    )

    if (!transcript) {
      throw new Error('Transcript data is missing in loader.')
    }

    return { transcript }
  },
})

function RouteComponent() {
  return <TranscriptPage />
}
