import {
  Button,
  FileInput,
  Group,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { IconExternalLink, IconLink, IconUpload } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export type SubmissionPayload = {
  file: File | null
  link: string | null
  comments: string | null
  answer: string | null
}

export const SubmissionForm = ({
  assignmentId,
  onSubmit,
  buttonLabel = 'Submit',
  withSubmissionPageNavigation = false,
  loading = false,
}: {
  onSubmit: (payload: SubmissionPayload) => void
  buttonLabel?: string
  assignmentId?: string
  withSubmissionPageNavigation?: boolean
  loading?: boolean
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [comments, setComments] = useState('')

  const canSubmit = Boolean(file || link.trim())

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      file,
      link: link.trim() || null,
      comments: comments.trim() || null,
      answer: null,
    })
  }

  return (
    <Stack gap="md">
      <FileInput
        placeholder="Attach a file"
        leftSection={<IconUpload size={16} />}
        value={file}
        onChange={setFile}
        disabled={loading}
      />

      <TextInput
        placeholder="https://example.com/your-work"
        label="Submit a link"
        leftSection={<IconLink size={16} />}
        value={link}
        onChange={(e) => setLink(e.currentTarget.value)}
        disabled={loading}
      />

      <Textarea
        placeholder="Add a description or comments (optional)"
        label="Comments"
        minRows={3}
        value={comments}
        onChange={(e) => setComments(e.currentTarget.value)}
        disabled={loading}
      />

      <Group justify="flex-end">
        <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
          {buttonLabel}
        </Button>

        {withSubmissionPageNavigation && (
          <Group justify="flex-end">
            <Link
              from={'/lms/$lmsCode/modules'}
              to={`$itemId/submit`}
              params={{ itemId: assignmentId! }}
            >
              <Button rightSection={<IconExternalLink size={16} />}>
                Go to Submission Page
              </Button>
            </Link>
          </Group>
        )}
      </Group>
    </Stack>
  )
}
