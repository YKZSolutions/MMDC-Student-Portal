import '@blocknote/mantine/style.css'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  FileInput,
  Group,
  Stack,
  Tabs,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconHistory, IconPencil, IconUpload } from '@tabler/icons-react'
import { useState } from 'react'

import type { SubmissionPayload } from '@/features/courses/modules/content/submission-form.tsx'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'

const SubmissionPage = ({ assignmentId }: { assignmentId: string }) => {
  const editor = useCreateBlockNote()
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [comments, setComments] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'editor'>('upload')
  const [status, setStatus] = useState<'draft' | 'feedback' | 'final' | null>(
    null,
  )

  const buildPayload = (): SubmissionPayload => ({
    file: activeTab === 'upload' ? file : null,
    link: activeTab === 'upload' ? link.trim() || null : null,
    comments: comments.trim() || null,
    answer: activeTab === 'editor' ? JSON.stringify(editor.document) : null,
  })

  const handleSaveDraft = () => {
    const payload = buildPayload()
    console.log('Saving draft...', { ...payload, assignmentId })
    setStatus('draft')
    // TODO: API call
  }

  const handleSubmitFeedback = () => {
    const payload = buildPayload()
    console.log('Submitting for feedback...', { ...payload, assignmentId })
    setStatus('feedback')
    // TODO: API call
  }

  const handleSubmitFinal = () => {
    const payload = buildPayload()
    console.log('Submitting final...', { ...payload, assignmentId })
    setStatus('final')
    // TODO: API call
  }

  const statusBadge = () => {
    switch (status) {
      case 'draft':
        return <Badge color="yellow">Draft Saved</Badge>
      case 'feedback':
        return <Badge color="blue">For Feedback</Badge>
      case 'final':
        return <Badge color="green">Final Submission</Badge>
      default:
        return <Badge color="gray">Not Submitted</Badge>
    }
  }

  return (
    <Container size={'lg'} py={'xl'}>
      <Card shadow="md" radius="md" p="lg">
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between">
            <Title order={3}>Submit Assignment</Title>
            <Group>
              {statusBadge()}
              <Tooltip label="View save history">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => console.log('View history...')}
                >
                  <IconHistory size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {/* Tabs for submission type */}
          <Tabs value={activeTab} onChange={(v) => setActiveTab(v as any)}>
            <Tabs.List grow>
              <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                Upload
              </Tabs.Tab>
              <Tabs.Tab value="editor" leftSection={<IconPencil size={16} />}>
                Compose
              </Tabs.Tab>
            </Tabs.List>

            {/* Upload tab */}
            <Tabs.Panel value="upload" pt="md">
              <Stack gap="sm">
                <FileInput
                  data-cy="submit-file-input"
                  placeholder="Attach a file"
                  value={file}
                  onChange={setFile}
                />
                <TextInput
                  data-cy="submit-link-input"
                  placeholder="https://example.com/your-work"
                  label="Or submit a link"
                  value={link}
                  onChange={(e) => setLink(e.currentTarget.value)}
                />
              </Stack>
            </Tabs.Panel>

            {/* Editor tab */}
            <Tabs.Panel value="editor" pt="md">
              <BlockNoteView
                editor={editor}
                theme="light"
                style={{ minHeight: '200px' }}
              />
            </Tabs.Panel>
          </Tabs>

          {/* Comments */}
          <Textarea
            data-cy="submit-comments-input"
            placeholder="Add a description or comments (optional)"
            label="Comments"
            minRows={3}
            value={comments}
            onChange={(e) => setComments(e.currentTarget.value)}
          />

          {/* Action buttons */}
          <Group justify="flex-end" gap="sm">
            <Button
              data-cy="submit-save-draft-button"
              variant="light"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              data-cy="submit-feedback-button"
              variant="light"
              onClick={handleSubmitFeedback}
            >
              Submit for Feedback
            </Button>
            <Button
              data-cy="submit-final-button"
              color="primary"
              onClick={handleSubmitFinal}
            >
              Submit Final
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}

export default SubmissionPage
