import {
  moduleContentFormSchema,
  type ModuleContentFormInput,
  type ModuleContentFormOutput,
} from '@/features/lms/modules/schema/module-content-form.schema'
import {
  moduleSectionFormSchema,
  type ModuleSectionFormInput,
  type ModuleSectionFormOutput,
} from '@/features/lms/modules/schema/module-section-form.schema'
import { useQuickForm } from '@/hooks/use-quick-form'
import { useSearchState } from '@/hooks/use-search-state'
import {
  lmsContentControllerCreateMutation,
  lmsContentControllerUpdateMutation,
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
  lmsSectionControllerFindOneOptions,
  lmsSectionControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { zContentType } from '@/integrations/api/client/zod.gen'
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
import { IconPlus } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/')

export default function ModuleContentDrawer() {
  const { search, setSearch } = useSearchState(route)

  return (
    <>
      <Drawer
        opened={typeof search.createContent === 'string'}
        onClose={() => setSearch({ createContent: undefined })}
        position="right"
        keepMounted={false}
      >
        <ModuleContentForm />
      </Drawer>
    </>
  )
}

function ModuleContentForm() {
  const { lmsCode } = route.useParams()

  const { search, setSearch } = useSearchState(route)

  const { create, update, form, isPending } = useQuickForm<
    ModuleContentFormInput,
    ModuleContentFormOutput
  >()({
    name: 'module content',
    formOptions: {
      initialValues: {
        title: '',
        contentType: null,
      },
      validate: zod4Resolver(moduleContentFormSchema),
    },
    transformQueryData: (moduleSection) => ({
      title: moduleSection.title,
    }),
    queryOptions: {
      ...lmsSectionControllerFindOneOptions({
        path: { moduleSectionId: search.updateContent || '' },
      }),
      enabled: !!search.updateContent,
    },
    createMutationOptions: lmsContentControllerCreateMutation({}),
    updateMutationOptions: lmsContentControllerUpdateMutation({
      path: { moduleContentId: search.updateContent || '' },
    }),
    queryKeyInvalidation: lmsControllerFindModuleTreeQueryKey({
      path: { id: lmsCode || '' },
    }),
  })

  const handleAddContent = async () => {
    if (form.validate().hasErrors) return

    const parentSectionId = search.createContent
    if (!lmsCode || !parentSectionId) return

    const { title, contentType } = form.getValues()

    await create.mutateAsync({
      path: { moduleId: lmsCode, moduleSectionId: parentSectionId },
      body: {
        title: title.trim(),
        contentType: contentType,
        content: [],
      },
    })

    setSearch({ createContent: undefined })
  }

  return (
    <Stack gap="md">
      <Box>
        <Text c="dark.7" fw={600}>
          Add New Content
        </Text>
        <Text c="dimmed">Create a new module content.</Text>
      </Box>

      <TextInput
        radius={'md'}
        label="Title"
        placeholder="Content title"
        withAsterisk
        variant="filled"
        {...form.getInputProps('title')}
      />

      <Select
        radius={'md'}
        placeholder="Select content type"
        withAsterisk
        label="Content Type"
        variant="filled"
        data={zContentType.options.map((type) => ({
          label: type.charAt(0) + type.slice(1).toLowerCase(),
          value: type,
        }))}
        defaultValue="LESSON"
        disabled={isPending}
        {...form.getInputProps('contentType')}
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
