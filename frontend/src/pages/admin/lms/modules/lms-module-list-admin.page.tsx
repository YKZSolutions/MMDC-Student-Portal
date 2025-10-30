import EmptyRenderer from '@/components/empty-renderer'
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
import { lmsControllerFindModuleTreeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Accordion,
  Box,
  Button,
  Group,
  Stack,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconInbox } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'
import ModuleSectionDrawer from './forms/module-section.form'
import ModuleSubsectionDrawer from './forms/module-subsection.form'
import { useSearchState } from '@/hooks/use-search-state'
import ModuleContentDrawer from './forms/module-content.form'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/')

export default function LMSModuleListAdminPage() {
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
          <ModuleSectionDrawer />
          <ModuleSubsectionDrawer />
          <ModuleContentDrawer />
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
  const { setSearch } = useSearchState(route)

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
              onAddItem: () => setSearch({ createSubsection: section.id }),
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
                    onAddItem: () =>
                      setSearch({ createContent: subsection.id }),
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
