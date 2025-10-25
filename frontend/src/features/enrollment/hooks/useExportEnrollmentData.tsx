import { client } from '@/integrations/api/client/client.gen'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'

export function useExportEnrollmentData() {
  return useAppMutation(
    () => ({
      mutationFn: async (periodId: string) => {
        const res = (await client.get({
          url: '/enrollments/{enrollmentPeriodId}/export',
          parseAs: 'blob',
          path: {
            enrollmentPeriodId: periodId,
          },
        })) as { data: Blob }

        // Create and trigger a download
        const blob = res.data
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `enrollment-data-${periodId}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)

        return blob
      },
    }),
    {
      loading: {
        title: 'Exporting enrollment data',
        message: 'Please wait while we prepare your download...',
      },
      success: {
        title: 'Export successful',
        message: 'Your enrollment data has been downloaded.',
      },
      error: {
        title: 'Export failed',
        message: 'Failed to export enrollment data. Please try again.',
      },
    },
  )
}
