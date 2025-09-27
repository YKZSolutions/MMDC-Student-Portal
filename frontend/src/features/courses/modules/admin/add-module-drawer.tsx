import {
    lmsControllerFindModuleTreeQueryKey,
    lmsSectionControllerCreateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
    Box,
    Button,
    Drawer,
    Group,
    Stack,
    Text,
    TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconPlus } from '@tabler/icons-react'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Fragment } from 'react/jsx-runtime'

const { queryClient } = getContext()

function AddModuleDrawer({
  children,
}: {
  children: (props: { setDrawer: (open: boolean) => void }) => React.ReactNode
}) {
  const navigate = useNavigate()
  const { lmsCode } = useParams({ strict: false })
  const searchParam: {
    createSection?: boolean
  } = useSearch({ strict: false })
  const drawerOpened = !!searchParam.createSection

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { title: '' },
    validate: { title: (v) => (v.trim() ? null : 'Title is required') },
  })

  const { mutateAsync: createSection, isPending: creatingSection } =
    useAppMutation(
      lmsSectionControllerCreateMutation,
      {
        loading: {
          title: 'Creating Section',
          message: 'Creating new section',
        },
        success: {
          title: 'Created Section',
          message: 'Successfully created section',
        },
        error: {
          title: 'Failed to Create Section',
          message: 'There was an error creating the section',
        },
      },
      {
        // Clears the module tree cache to refetch the updated data
        onSuccess: async () => {
          const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
            path: { id: lmsCode || '' },
          })

          // cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: moduleTreeKey })

          await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
        },
      },
    )

  const handleAddContent = async () => {
    if (form.validate().hasErrors) return

    await createSection({
      path: { moduleId: lmsCode || '' },
      body: { title: form.getValues().title.trim() },
    })

    setDrawer(false)
    form.reset()
  }

  // single helper to update drawer state
  const setDrawer = (open: boolean) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        createSection: open || undefined,
      }),
    })
    form.reset()
  }

  return (
    <Fragment>
      {children({ setDrawer })}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawer(false)}
        position="right"
        keepMounted={false}
      >
        <Stack gap="md">
          <Box>
            <Text c="dark.7" fw={600}>
              Add New Section
            </Text>
            <Text c="dimmed">
              Create a new module section by providing a title.
            </Text>
          </Box>

          <TextInput
            radius={'md'}
            placeholder="Section title"
            required
            variant="filled"
            {...form.getInputProps('title')}
          />

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button
              variant="light"
              onClick={() => setDrawer(false)}
              disabled={creatingSection}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconPlus />}
              type="submit"
              loading={creatingSection}
              onClick={handleAddContent}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Fragment>
  )
}

export default AddModuleDrawer
