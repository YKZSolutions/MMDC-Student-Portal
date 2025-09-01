import {
  ActionIcon,
  type BoxProps,
  Button,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import {
  IconCategory,
  IconEdit,
  IconHeading,
  IconHourglassEmpty,
  IconReplace,
  IconScoreboard,
  IconUpload,
  IconWriting,
  IconX,
} from '@tabler/icons-react'
import React, { type ComponentPropsWithoutRef, useEffect } from 'react'
import type {
  ContentNodeType,
  CourseModule,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { useForm } from '@mantine/form'
import { ButtonWithModal } from '@/components/with-modal.tsx'
import { EditorWithPreviewModal } from '@/components/editor-w-preview.tsx'

type ContentDetailsEditorProps = {
  opened: boolean
  type: ContentNodeType
  data: CourseModule | ModuleSection | ModuleItem | null
  mode: 'create' | 'edit'
  onClose: () => void
  onSave: (data: any) => void
} & ComponentPropsWithoutRef<typeof Stack> &
  BoxProps

// Originally Used as a Right Pane details editor
// TODO: Add expanded state, and render according to type
const ContentDetailsEditor = ({
  opened,
  type,
  data,
  mode,
  onClose,
  onSave,
  ...stackProps
}: ContentDetailsEditorProps) => {
  const theme = useMantineTheme()

  // Form setup based on content type
  const form = useForm({
    initialValues: getInitialValues(type, data),
    validate: {
      title: (value: any) => (!value ? 'Title is required' : null),
    },
  })

  // Update form when type or data changes
  useEffect(() => {
    form.setValues(getInitialValues(type, data))
  }, [type, data, opened])

  // Handle form submission
  const handleSubmit = (values: any) => {
    // Add type-specific processing here
    const processedData = processFormData(type, values)
    onSave(processedData)
  }

  // Get form fields based on content type
  const getFormFields = () => {
    switch (type) {
      case 'module':
        return (
          <>
            <TextInput
              label="Module Title"
              placeholder="Enter module title"
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Description"
              placeholder="Enter module description"
              {...form.getInputProps('description')}
            />
          </>
        )

      case 'section':
        return (
          <>
            <TextInput
              label="Section Title"
              placeholder="Enter section title"
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Description"
              placeholder="Enter section description"
              {...form.getInputProps('description')}
            />
          </>
        )

      case 'item':
        return (
          <>
            <Select
              label="Content Type"
              leftSection={<IconCategory size={16} />}
              placeholder="Select content type"
              data={[
                { value: 'reading', label: 'Reading Material' },
                { value: 'assignment', label: 'Assignment' },
                { value: 'quiz', label: 'Quiz' },
                { value: 'discussion', label: 'Discussion' },
                { value: 'url', label: 'External URL' },
                { value: 'file', label: 'File' },
              ]}
              {...form.getInputProps('type')}
            />

            <TextInput
              label="Item Title"
              leftSection={<IconHeading size={16} />}
              placeholder="Enter item title"
              {...form.getInputProps('title')}
            />

            {form.values.type === 'reading' && (
              <>
                <Textarea
                  label="Content"
                  placeholder="Enter reading content"
                  {...form.getInputProps('content')}
                />
                <Group>
                  <Button leftSection={<IconUpload size={16} />}>
                    Upload File
                  </Button>
                  <ButtonWithModal
                    label={'Use Editor'}
                    icon={<IconEdit size={16} />}
                    modalComponent={EditorWithPreviewModal}
                    modalProps={{
                      content: form.values.content,
                      onChange: (newContent) =>
                        console.log(
                          'Updated:',
                          newContent,
                        ) /*form.handlers.setFieldValue*/,
                      field: 'content',
                    }}
                    bg={'primary'}
                  />
                  <Text size="sm" c="dimmed">
                    or enter content directly
                  </Text>
                </Group>
              </>
            )}

            {form.values.type === 'assignment' && (
              <>
                <Select
                  label="Assignment Type"
                  data={[
                    { value: 'assignment', label: 'Regular Assignment' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'milestone', label: 'Milestone' },
                    { value: 'other', label: 'Other' },
                  ]}
                  leftSection={<IconWriting size={16} />}
                  {...form.getInputProps('assignmentType')}
                />
                <TextInput
                  label="Points"
                  type="number"
                  leftSection={<IconScoreboard size={16} />}
                  {...form.getInputProps('points')}
                />
                <TextInput
                  label="Due Date"
                  type="datetime-local"
                  leftSection={<IconHourglassEmpty size={16} />}
                  {...form.getInputProps('dueDate')}
                />
                <Group align={'center'} mt={'sm'}>
                  <IconReplace size={20} />
                  <Switch
                    label="Allow Re-submission"
                    labelPosition="left"
                    {...form.getInputProps('allowResubmission')}
                  />
                </Group>
                <Group align={'center'} mt={'sm'}>
                  <IconHourglassEmpty size={20} />
                  <Switch
                    label="Allow Late Submission"
                    labelPosition="left"
                    {...form.getInputProps('allowLateSubmission')}
                  />
                </Group>
              </>
            )}

            {/* TODO: Add fields for other content types */}
          </>
        )

      default:
        return null
    }
  }
  return (
    <Stack {...stackProps}>
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          {mode === 'create' ? `Create New ${type}` : `Edit ${type}`}
        </Text>
        <ActionIcon onClick={onClose} variant="transparent" color="gray">
          <IconX size={32} />
        </ActionIcon>
      </Group>

      <Stack p="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {getFormFields()}

            <Group justify="flex-end" mt="md" wrap={'nowrap'}>
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" bg={'secondary'}>
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Stack>
  )
}

// Helper function to get initial form values
function getInitialValues(type: ContentNodeType, data: any) {
  if (data) {
    // Editing existing item - populate form with existing data
    switch (type) {
      case 'module':
        return {
          title: data.title || '',
          description: data.description || '',
          position: data.position || 0,
        }

      case 'section':
        return {
          title: data.title || '',
          description: data.description || '',
          position: data.position || 0,
        }

      case 'item':
        return {
          type: data.type || 'reading',
          title: data.title || '',
          description: data.description || '',
          content: data.content?.content || '',
          fileUrl: data.content?.fileUrl || '',
          assignmentType: data.assignment?.type || 'assignment',
          dueDate: data.assignment?.dueDate
            ? new Date(data.assignment.dueDate).toISOString()
            : '',
          mode: data.assignment?.mode || 'individual',
          points: data.assignment?.points || 0,
          status: data.assignment?.status || 'open',
          rubrics: data.assignment?.rubrics || [],
          allowResubmission: data.assignment?.allowResubmission || false,
          maxAttempts: data.assignment?.maxAttempts || 1,
          allowLateSubmission: data.assignment?.allowLateSubmission || false,
          // Add other fields as needed
        }

      default:
        return {}
    }
  } else {
    // Creating new item - use default values
    switch (type) {
      case 'module':
        return { title: '', description: '', position: 0 }

      case 'section':
        return { title: '', description: '', position: 0 }

      case 'item':
        return {
          type: 'reading',
          title: '',
          description: '',
          content: '',
          fileUrl: '',
          assignmentType: 'assignment',
          dueDate: '',
          mode: 'individual',
          points: 100,
          status: 'open',
          rubrics: [],
          allowResubmission: false,
          maxAttempts: 1,
          allowLateSubmission: false,
        }

      default:
        return {}
    }
  }
}

// Helper function to process form data before saving
function processFormData(type: ContentNodeType, values: any) {
  switch (type) {
    case 'module':
      return {
        title: values.title,
        description: values.description,
        position: values.position,
      }

    case 'section':
      return {
        title: values.title,
        description: values.description,
        position: values.position,
      }

    case 'item':
      const baseItem = {
        title: values.title,
        type: values.type,
        position: values.position || 0,
      }

      if (values.type === 'reading') {
        return {
          ...baseItem,
          content: {
            content: values.content,
            fileUrl: values.fileUrl,
            isCompleted: false,
          },
        }
      } else if (values.type === 'assignment') {
        return {
          ...baseItem,
          assignment: {
            type: values.assignmentType,
            points: values.points,
            dueDate: values.dueDate,
            status: 'open',
            // Add other assignment fields
          },
        }
      }
      return baseItem

    default:
      return values
  }
}

export default ContentDetailsEditor
