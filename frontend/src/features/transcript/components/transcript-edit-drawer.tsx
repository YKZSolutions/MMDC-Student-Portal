import { useSearchState } from '@/hooks/use-search-state'
import {
  transcriptControllerFindAllQueryKey,
  transcriptControllerFindOneTranscriptOptions,
  transcriptControllerFindOneTranscriptQueryKey,
  transcriptControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Box, Button, Drawer, Group, Select, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconCheck } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'
import {
  GRADE_LETTER_OPTIONS,
  GRADE_OPTIONS,
  type TranscriptEditFormInput,
} from '../schema/edit-transcript.schema'

const route = getRouteApi('/(protected)/transcript/')

const { queryClient } = getContext()

interface TranscriptEditDrawerProps {
  editTranscriptId: string | null
}

function TranscriptEditDrawer({ editTranscriptId }: TranscriptEditDrawerProps) {
  const { search, setSearch } = useSearchState(route)

  const isDrawerOpen = search['editTranscriptId'] === editTranscriptId

  const closeDrawer = () => {
    setSearch({ editTranscriptId: undefined })
  }

  return (
    <Drawer
      opened={isDrawerOpen}
      onClose={closeDrawer}
      position="right"
      title="Edit Transcript"
      keepMounted={false}
    >
      {isDrawerOpen && editTranscriptId && (
        <Suspense fallback={<Text>Loading...</Text>}>
          <TranscriptEditForm
            transcriptId={editTranscriptId}
            onClose={closeDrawer}
          />
        </Suspense>
      )}
    </Drawer>
  )
}

function TranscriptEditForm({
  transcriptId,
  onClose,
}: {
  transcriptId: string
  onClose: () => void
}) {
  const { search } = useSearchState(route)

  const { data: transcript } = useSuspenseQuery(
    transcriptControllerFindOneTranscriptOptions({
      path: {
        transcriptId,
      },
    }),
  )

  if (!transcript) {
    return <Text>Transcript not found</Text>
  }

  const form = useForm<TranscriptEditFormInput>({
    mode: 'uncontrolled',
    initialValues: {
      grade: transcript.grade,
      gradeLetter: transcript.gradeLetter,
    },
  })

  const { mutateAsync: updateTranscript, isPending: isUpdating } =
    useAppMutation(
      transcriptControllerUpdateMutation,
      {
        loading: {
          title: 'Updating Transcript',
          message: 'Please wait while the transcript is being updated.',
        },
        success: {
          title: 'Transcript Updated',
          message: 'The transcript has been successfully updated.',
        },
        error: {
          title: 'Failed to Update Transcript',
          message: 'There was an error updating the transcript.',
        },
      },
      {
        onSuccess: async () => {
          const transcriptsKey = transcriptControllerFindAllQueryKey({
            query: {
              studentId: search.studentId || undefined,
              enrollmentPeriodId: search.enrollmentPeriodId || undefined,
            },
          })

          await queryClient.cancelQueries({ queryKey: transcriptsKey })

          await queryClient.invalidateQueries({ queryKey: transcriptsKey })
        },
      },
    )

  const handleSubmit = async (values: TranscriptEditFormInput) => {
    if (form.validate().hasErrors) return

    await updateTranscript({
      path: { transcriptId },
      body: {
        grade: values.grade || undefined,
        gradeLetter: values.gradeLetter || undefined,
      },
    })

    form.reset()
    await invalidateTranscriptCache()
    onClose()
  }

  const invalidateTranscriptCache = async () => {
    const transcriptKey = transcriptControllerFindOneTranscriptQueryKey({
      path: {
        transcriptId,
      },
    })

    await queryClient.cancelQueries({ queryKey: transcriptKey })

    await queryClient.invalidateQueries({ queryKey: transcriptKey })
  }

  return (
    <Stack gap="md">
      <Box>
        <Text c="dark.7" fw={600}>
          {transcript.courseOffering?.course?.name}
        </Text>
        <Text c="dimmed" size="sm">
          {transcript.courseOffering?.course?.courseCode} •{' '}
          {transcript.user?.firstName} {transcript.user?.lastName}
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            required
            radius="md"
            label="Grade (Numeric)"
            placeholder="Select a grade"
            variant="filled"
            data={GRADE_OPTIONS}
            {...form.getInputProps('grade')}
            clearable
          />

          <Select
            radius="md"
            label="Grade (Letter)"
            placeholder="Select a letter grade"
            variant="filled"
            data={GRADE_LETTER_OPTIONS}
            {...form.getInputProps('gradeLetter')}
            clearable
          />

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button variant="light" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              type="submit"
              loading={isUpdating}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  )
}

export default TranscriptEditDrawer
