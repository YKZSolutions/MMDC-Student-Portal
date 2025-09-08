import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import { useCreateBlockNote } from '@blocknote/react'
import {
  Badge,
  Box,
  Button,
  Card,
  FileInput,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import type { ModuleItem } from '@/features/courses/modules/types.ts'
import { BlockNoteView } from '@blocknote/mantine'
import { IconCheck, IconEdit, IconUpload } from '@tabler/icons-react'

interface SubmitViewProps {
  assignmentItem: ModuleItem
}

const SubmissionPage = ({ assignmentItem }: SubmitViewProps) => {
  const editor = useCreateBlockNote()
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(
    assignmentItem.assignment && 'submissionStatus' in assignmentItem.assignment
      ? assignmentItem.assignment?.submissionStatus === 'submitted'
      : false,
  )

  const handleSubmit = () => {
    // TODO: call API
    setSubmitted(true)
  }

  return (
    <Paper shadow="sm" radius="md" p="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>{assignmentItem.title}</Title>
            <Text size="sm" c="dimmed">
              Due{' '}
              {formatTimestampToDateTimeText(
                assignmentItem.assignment?.dueDate || '',
                'by',
              )}{' '}
              • {assignmentItem.assignment?.points} pts
            </Text>
          </Box>
          {submitted ? (
            <Badge color="green" variant="filled">
              Submitted
            </Badge>
          ) : (
            <Badge color="red" variant="light">
              Not Submitted
            </Badge>
          )}
        </Group>

        {/* Instructions */}
        {assignmentItem.content && (
          <Card withBorder radius="md" p="md">
            <Text fw={500} mb="xs">
              Instructions
            </Text>
            <BlockNoteView
              editor={useCreateBlockNote({
                initialContent: assignmentItem.content,
              })}
              theme="light"
              editable={false}
            />
          </Card>
        )}

        {/* Submission Area */}
        {!submitted ? (
          <Stack>
            <Text fw={500}>Your Answer</Text>
            <BlockNoteView editor={editor} theme="light" editable />

            <FileInput
              placeholder="Attach file"
              leftSection={<IconUpload size={16} />}
              value={file}
              onChange={setFile}
            />

            <Group justify="flex-end">
              <Button
                onClick={handleSubmit}
                leftSection={<IconCheck size={16} />}
              >
                Submit Assignment
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            <Text fw={500}>Your Submission</Text>
            <BlockNoteView editor={editor} theme="light" editable={false} />

            {file && (
              <Text size="sm" c="dimmed">
                Attached: {file.name}
              </Text>
            )}

            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={() => setSubmitted(false)}
              >
                Resubmit
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

export default SubmissionPage
