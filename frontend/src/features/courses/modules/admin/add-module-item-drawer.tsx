import type {
  ContentType,
  ModuleTreeSectionDto,
} from '@/integrations/api/client'
import {
  lmsContentControllerCreateMutation,
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { zContentType } from '@/integrations/api/client/zod.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  Box,
  Button,
  Drawer,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconPlus } from '@tabler/icons-react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Fragment } from 'react/jsx-runtime'

const { queryClient } = getContext()

function AddModuleItemDrawer({
  children,
  props: { section },
}: {
  props: { section: ModuleTreeSectionDto }
  children: ({
    setDrawer,
  }: {
    setDrawer: (open: boolean) => void
  }) => React.ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })
  const navigate = useNavigate()
  const searchParam: {
    createSubsection?: boolean
    sectionId: string | undefined
  } = useSearch({ strict: false })

  const drawerOpened =
    !!searchParam.createSubsection && searchParam.sectionId === section.id

  const isSubsection = section?.parentSectionId

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      contentType: 'LESSON' as ContentType,
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Section title is required' : null,

      contentType: (value) =>
        isSubsection && !value
          ? 'Content type is required for new content'
          : null,
    },
  })

  const { mutateAsync: createSubsection, isPending: creatingSubsection } =
    useAppMutation(
      lmsSectionControllerCreateMutation,
      {
        loading: {
          title: 'Creating Subsection',
          message: 'Creating new subsection — please wait',
        },
        success: {
          title: 'Subsection Created',
          message: 'Subsection was created successfully',
        },
        error: {
          title: 'Failed to Create Subsection',
          message:
            'There was an error while creating the subsection. Please try again.',
        },
      },
      {
        onSuccess: async () => {
          const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
            path: { id: lmsCode || '' },
          })

          await queryClient.cancelQueries({ queryKey: moduleTreeKey })

          await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
        },
      },
    )

  const { mutateAsync: createModuleContent } = useAppMutation(
    lmsContentControllerCreateMutation,
    {
      loading: {
        title: 'Creating Content',
        message: 'Creating new content — please wait',
      },
      success: {
        title: 'Content Created',
        message: 'Content was created successfully',
      },
      error: {
        title: 'Failed to Create Content',
        message:
          'There was an error while creating the content. Please try again.',
      },
    },
    {
      onSuccess: async (data) => {
        const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
          path: { id: lmsCode || '' },
        })

        await queryClient.cancelQueries({ queryKey: moduleTreeKey })

        await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
      },
    },
  )

  const handleNewItem = async () => {
    if (form.validate().hasErrors) return

    const values = form.getValues()

    if (isSubsection) {
      await createModuleContent({
        path: {
          moduleId: lmsCode || '',
        },
        body: {
          contentType: values.contentType,
          title: values.title,
          sectionId: section.id,
        },
      })
    } else {
      await createSubsection({
        path: {
          moduleId: lmsCode || '',
        },
        body: {
          title: values.title,
          parentSectionId: section.id,
        },
      })
    }

    // Close drawer and reset form
    setDrawer(false)
  }

  const setDrawer = (open: boolean) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        createSubsection: open || undefined,
        sectionId: open ? section.id : undefined,
      }),
    })

    form.reset()
  }

  return (
    <Fragment>
      {children({ setDrawer })}

      {/* Drawer for creating new subsection or item */}
      <Drawer
        opened={drawerOpened}
        onClick={(e) => e.stopPropagation()}
        onClose={() => setDrawer(false)}
        position="right"
        keepMounted={false}
      >
        <Stack gap="md">
          <Box>
            <Text c="dark.7" fw={600}>
              Add New {isSubsection ? 'Content' : 'Subsection'}
            </Text>
            <Text c="dimmed">
              Create a new module {isSubsection ? 'content' : 'subsection'} by
              providing a title.
            </Text>
          </Box>

          <TextInput
            radius={'md'}
            placeholder={isSubsection ? 'Content title' : 'Subsection title'}
            required
            variant="filled"
            {...form.getInputProps('title')}
          />

          {isSubsection && (
            <Select
              radius={'md'}
              placeholder="Select content type"
              required
              variant="filled"
              data={zContentType.options.map((type) => ({
                label: type.charAt(0) + type.slice(1).toLowerCase(),
                value: type,
              }))}
              defaultValue="LESSON"
              disabled={!isSubsection}
              {...form.getInputProps('contentType')}
            />
          )}

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button
              variant="light"
              onClick={() => setDrawer(false)}
              disabled={creatingSubsection}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconPlus />}
              type="submit"
              loading={creatingSubsection}
              onClick={handleNewItem}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Fragment>
  )
}

export default AddModuleItemDrawer
