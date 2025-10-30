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

export default function ModuleSubsectionDrawer() {
  const { search, setSearch } = useSearchState(route)

  return (
    <>
      <Drawer
        opened={typeof search.createSubsection === 'string'}
        onClose={() => setSearch({ createSubsection: undefined })}
        position="right"
        keepMounted={false}
      >
        <ModuleSubsectionForm />
      </Drawer>
    </>
  )
}

function ModuleSubsectionForm() {
  const { lmsCode } = route.useParams()

  const { search, setSearch } = useSearchState(route)

  const { create, update, form, isPending } = useQuickForm<
    ModuleSectionFormInput,
    ModuleSectionFormOutput
  >()({
    name: 'module subsection',
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
        path: { moduleSectionId: search.updateSubsection || '' },
      }),
      enabled: !!search.updateSubsection,
    },
    createMutationOptions: lmsSectionControllerCreateMutation({}),
    updateMutationOptions: lmsSectionControllerUpdateMutation({
      path: { moduleSectionId: search.updateSubsection || '' },
    }),
    queryKeyInvalidation: lmsControllerFindModuleTreeQueryKey({
      path: { id: lmsCode || '' },
    }),
  })

  const handleAddContent = async () => {
    if (form.validate().hasErrors) return

    const parentSectionId = search.createSubsection
    if (!lmsCode || !parentSectionId) return

    await create.mutateAsync({
      path: { moduleId: lmsCode },
      body: { title: form.getValues().title.trim(), parentSectionId },
    })

    setSearch({ createSubsection: undefined })
  }

  return (
    <Stack gap="md">
      <Box>
        <Text c="dark.7" fw={600}>
          Add New Subsection
        </Text>
        <Text c="dimmed">
          Create a new module subsection by providing a title.
        </Text>
      </Box>

      <TextInput
        radius={'md'}
        label="Title"
        placeholder="Subsection title"
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
