import EmptyRenderer from '@/components/empty-renderer'
import NoItemFound from '@/components/no-item-found'
import ModulePanel from '@/features/courses/modules/module-panel'
import ModuleContentCard from '@/features/lms/modules/components/module-content-card'
import {
  ModuleSectionCard,
  ModuleSubsectionCard,
} from '@/features/lms/modules/components/module-section-accordion'
import { useContentActions } from '@/features/lms/modules/hooks/use-content-actions'
import {
  useNestedAccordion,
  type UseNestedAccordionReturn,
} from '@/features/lms/modules/hooks/use-nested-accordion'
import { useSectionActions } from '@/features/lms/modules/hooks/use-section-actions'
import {
  moduleSectionFormSchema,
  type ModuleSectionFormInput,
  type ModuleSectionFormOutput,
} from '@/features/lms/modules/schema/module-section-form.schema'
import { useQuickForm } from '@/hooks/use-quick-form'
import { useSearchState } from '@/hooks/use-search-state'
import type { ModuleTreeSectionDto } from '@/integrations/api/client'
import {
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
  lmsSectionControllerFindOneOptions,
  lmsSectionControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Accordion,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconInbox, IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/')

export default function LMSModuleListPage() {
  const { lmsCode } = route.useParams()
  const accordion = useNestedAccordion({
    storageKey: lmsCode,
  })

  return (
    <Box p="md">
      {/* Admin Actions Header */}
      <Group align={'center'} mb="lg" justify="space-between">
        <Title c="dark.7" variant="hero" order={2} fw={700}>
          Modules
        </Title>
        <Group justify="end">
          <Suspense
            fallback={
              <Button radius={'md'} variant="default" disabled>
                {accordion.expanded.length > 0 ? 'Collapse All' : 'Expand All'}
              </Button>
            }
          >
            <ModuleExpandAction accordion={accordion} />
          </Suspense>
          <AddModuleSectionDrawer />
        </Group>
      </Group>

      {/* Module Content with admin actions */}
      {/* <ModulePanel viewMode="admin" allExpanded={false} /> */}

      <Suspense fallback={<>Loading...</>}>
        <ModuleList accordion={accordion} />
      </Suspense>
    </Box>
  )
}

function ModuleExpandAction({
  accordion,
}: {
  accordion: UseNestedAccordionReturn
}) {
  const { lmsCode } = route.useParams()

  const { data: moduleTree, error } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: { id: lmsCode },
    }),
  )

  const { expanded, openAll, closeAll } = accordion

  const moduleSections = moduleTree.moduleSections

  const handleOpenAll = () => {
    if (!moduleSections) return

    const sectionIds = moduleSections.map((s) => s.id)
    const sectionToSubsectionIds = Object.fromEntries(
      moduleSections.map((s) => [
        s.id,
        s.subsections?.map((ss) => ss.id) || [],
      ]),
    )
    openAll(sectionIds, sectionToSubsectionIds)
  }

  return (
    <Button
      radius={'md'}
      onClick={() => (expanded.length > 0 ? closeAll() : handleOpenAll())}
      variant="default"
    >
      {expanded.length > 0 ? 'Collapse All' : 'Expand All'}
    </Button>
  )
}

function ModuleList({ accordion }: { accordion: UseNestedAccordionReturn }) {
  const { lmsCode } = route.useParams()
  const theme = useMantineTheme()
  const Link = route.Link

  const {
    getSectionValues,
    getSubsectionValues,
    setSectionValues,
    setSubsectionValues,
  } = accordion

  const { data: moduleTree, error } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: { id: lmsCode },
    }),
  )

  const moduleSections = moduleTree.moduleSections

  const {
    handlePublish: handleSectionPublish,
    handleUnpublish: handleSectionUnpublish,
    handleDelete: handleSectionDelete,
  } = useSectionActions()
  const {
    handlePublish: handleContentPublish,
    handleUnpublish: handleContentUnpublish,
    handleDelete: handleContentDelete,
    handleEdit: handleContentEdit,
  } = useContentActions()

  return (
    <Accordion
      multiple
      value={getSectionValues()}
      onChange={setSectionValues}
      chevronPosition="left"
      variant="filled"
      styles={{
        chevron: {
          padding: theme.spacing.sm,
        },
      }}
    >
      <EmptyRenderer
        items={moduleSections}
        emptyTitle="No content yet"
        emptySubtitle="This module currently has no content."
        emptyIcon={<IconInbox size={36} stroke={1.5} />}
      >
        {(section) => (
          <ModuleSectionCard
            key={section.id}
            id={section.id}
            title={section.title}
            publishedAt={section.publishedAt}
            viewMode="admin"
            expandedItems={getSubsectionValues(section.id)}
            setExpandedItems={(val) => setSubsectionValues(section.id, val)}
            adminActionProps={{
              onPublishNow: () => handleSectionPublish(section.id),
              onUnpublish: () => handleSectionUnpublish(section.id),
              onDelete: () => handleSectionDelete(section.id),
            }}
          >
            <EmptyRenderer
              items={section.subsections}
              emptyTitle="No content yet"
              emptySubtitle="This module section currently has no content."
              emptyIcon={<IconInbox size={36} stroke={1.5} />}
            >
              {(subsection) => (
                <ModuleSubsectionCard
                  key={subsection.id}
                  id={subsection.id}
                  title={subsection.title}
                  publishedAt={subsection.publishedAt}
                  viewMode="admin"
                  adminActionProps={{
                    onPublishNow: () => handleSectionPublish(subsection.id),
                    onUnpublish: () => handleSectionUnpublish(subsection.id),
                    onDelete: () => handleSectionDelete(subsection.id),
                  }}
                >
                  <EmptyRenderer
                    items={subsection.moduleContents}
                    emptyTitle="No content yet"
                    emptySubtitle="This module section currently has no content."
                    emptyIcon={<IconInbox size={36} stroke={1.5} />}
                    wrapper={(children) => <Stack gap="xs">{children}</Stack>}
                  >
                    {(content) => (
                      <Link
                        key={content.id}
                        to="/lms/$lmsCode/modules/$itemId/edit"
                        params={{ itemId: content.id }}
                      >
                        <ModuleContentCard
                          viewMode="admin"
                          moduleContent={content}
                          adminActionProps={{
                            onPublishNow: () =>
                              handleContentPublish(content.id),
                            onUnpublish: () =>
                              handleContentUnpublish(content.id),
                            onDelete: () => handleContentDelete(content.id),
                            onEdit: () => handleContentEdit(content.id),
                          }}
                        />
                      </Link>
                    )}
                  </EmptyRenderer>
                </ModuleSubsectionCard>
              )}
            </EmptyRenderer>
          </ModuleSectionCard>
        )}
      </EmptyRenderer>
    </Accordion>
  )
}

function AddModuleSectionDrawer() {
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
        <AddModuleSectionForm />
      </Drawer>
    </>
  )
}

function AddModuleSectionForm() {
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

    await create.mutateAsync({
      path: { moduleId: lmsCode || '' },
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
