import {
  type BoxProps,
  Button,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import {
  IconCategory,
  IconHeading,
  IconHourglassEmpty,
  IconReplace,
  IconRestore,
  IconScoreboard,
  IconWriting,
} from '@tabler/icons-react'
import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useState,
} from 'react'
import type {
  ContentNode,
  ContentNodeType,
  Module,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import { useForm } from '@mantine/form'
import { getAllModuleSections } from '@/utils/helpers.ts'
import { mockModule } from '@/features/courses/mocks.ts'

type ContentDetailsEditorProps = {
  opened: boolean
  type: ContentNodeType
  data: ContentNode | null
  onSave: (data: any) => void
} & ComponentPropsWithoutRef<typeof Stack> &
  BoxProps

// Originally Used as a Right Pane details editor
// TODO: Add expanded state, and render according to type
const ContentDetailsEditor = ({
  opened,
  type,
  data,
  onSave,
  ...stackProps
}: ContentDetailsEditorProps) => {
  const theme = useMantineTheme()
  const mode = data ? 'edit' : 'create'
  const [module, setModule] = useState<Module>(mockModule)
  const [sections, setSections] = useState<ModuleSection[]>([]) // TODO: Replace with actual module

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
  }, [type, data, opened, module, sections])

  useEffect(() => {
    setSections(getAllModuleSections(module))
  }, [module])

  // Handle form submission
  const handleSubmit = (values: any) => {
    // Add type-specific processing here
    const processedData = processFormData(type, values)
    onSave(processedData)
  }

  const handleDelete = () => {
    // TODO: Add delete logic
  }

  // Get form fields based on content type
  const getFormFields = () => {
    switch (type) {
      case 'section':
        return (
          <>
            <TextInput
              label="Section Title"
              placeholder="Enter section title"
              {...form.getInputProps('title')}
            />
            <Select
              label="Parent Section"
              placeholder="Enter section title"
              data={sections.map((section) => ({
                value: section.id,
                label: section.title,
              }))}
              {...form.getInputProps('parentId')}
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
        {mode === 'edit' && (
          <Button
            variant="default"
            onClick={form.reset}
            leftSection={<IconRestore size={18} />}
          >
            Reset
          </Button>
        )}
      </Group>

      <Stack p="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>{getFormFields()}</form>
      </Stack>
    </Stack>
  )
}

// Helper function to get initial form values
function getInitialValues(type: ContentNodeType, data: any) {
  if (data) {
    // Editing existing item - populate form with existing data
    switch (type) {
      case 'section':
        return {
          id: data.id ?? null,
          title: data.title || '',
          order: data.order || 0,
        }

      case 'item':
        return {
          id: data.id ?? null,
          type: data.type || 'reading',
          title: data.title || '',
          order: data.order || 0,
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
      case 'section':
        return { title: '', description: '', order: 0 }

      case 'item':
        return {
          type: 'reading',
          title: '',
          order: 0,
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
  const isEditing = Boolean(values.id)

  switch (type) {
    case 'section':
      return {
        ...(isEditing ? { id: values.id } : {}),
        title: values.title,
        order: values.order,
      }

    case 'item':
      const baseItem = {
        ...(isEditing ? { id: values.id } : {}),
        title: values.title,
        type: values.type,
        order: values.order,
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
