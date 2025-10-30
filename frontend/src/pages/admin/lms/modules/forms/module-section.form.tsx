import {
  moduleSectionFormSchema,
  type ModuleSectionFormInput,
  type ModuleSectionFormOutput,
} from '@/features/lms/modules/schema/module-section-form.schema'
import { useQuickForm } from '@/hooks/use-quick-form'
import { useSearchState } from '@/hooks/use-search-state'
import {
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
  lmsSectionControllerFindOneOptions,
  lmsSectionControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/')

export default function ModuleSectionDrawer() {
  const { search, setSearch } = useSearchState(route)

  return (
    <>
      <Button
        radius={'md'}
        leftSection={<IconPlus />}
        onClick={() => setSearch({ createSection: true })}
      >
        Add New Section
      </Button>
      <Drawer
        opened={search.createSection === true}
        onClose={() => setSearch({ createSection: undefined })}
        position="right"
        keepMounted={false}
      >
        <ModuleSectionForm />
      </Drawer>
    </>
  )
}

function ModuleSectionForm() {
  const { lmsCode } = route.useParams()

  const { search, setSearch } = useSearchState(route)

  const { create, update, form, isPending } = useQuickForm<
    ModuleSectionFormInput,
    ModuleSectionFormOutput
  >()({
    name: 'module section',
    formOptions: {
      initialValues: {
        title: '',
      },
      validate: zod4Resolver(moduleSectionFormSchema),
    },
    transformQueryData: (moduleSection) => ({
      title: moduleSection.title,
    }),
    queryOptions: {
      ...lmsSectionControllerFindOneOptions({
        path: { moduleSectionId: search.updateSection || '' },
      }),
      enabled: !!search.updateSection,
    },
    createMutationOptions: lmsSectionControllerCreateMutation({}),
    updateMutationOptions: lmsSectionControllerUpdateMutation({
      path: { moduleSectionId: search.updateSection || '' },
    }),
    queryKeyInvalidation: lmsControllerFindModuleTreeQueryKey({
      path: { id: lmsCode || '' },
    }),
  })

  const handleAddContent = async () => {
    if (form.validate().hasErrors) return

    if (!lmsCode) return

    await create.mutateAsync({
      path: { moduleId: lmsCode },
      body: { title: form.getValues().title.trim() },
    })

    setSearch({ createSection: undefined })
  }

  return (
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
        label="Title"
        placeholder="Section title"
        withAsterisk
        variant="filled"
        {...form.getInputProps('title')}
      />

      <Group style={{ justifyContent: 'flex-end' }}>
        <Button
          variant="light"
          onClick={() => setSearch({ createSection: undefined })}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          leftSection={<IconPlus />}
          type="submit"
          loading={isPending}
          onClick={handleAddContent}
        >
          Create
        </Button>
      </Group>
    </Stack>
  )
}
