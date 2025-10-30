import EmptyRenderer from '@/components/empty-renderer'
import ModuleContentCard from '@/features/lms/modules/components/module-content-card'
import {
  ModuleSectionCard,
  ModuleSubsectionCard,
} from '@/features/lms/modules/components/module-section-accordion'
import { ModuleListSkeleton } from '@/features/lms/modules/components/module-list-skeleton'
import { useContentActions } from '@/features/lms/modules/hooks/use-content-actions'
import {
  useNestedAccordion,
  type UseNestedAccordionReturn,
} from '@/features/lms/modules/hooks/use-nested-accordion'
import { useSectionActions } from '@/features/lms/modules/hooks/use-section-actions'
import {
  lmsControllerFindModuleTreeOptions,
  lmsControllerGetModuleProgressOverviewOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Accordion,
  Box,
  Button,
  Group,
  Progress,
  rem,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconCheck,
  IconFlagOff,
  IconInbox,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useSearchState } from '@/hooks/use-search-state'
import ModuleSectionDrawer from '@/pages/admin/lms/modules/forms/module-section.form'
import ModuleSubsectionDrawer from '@/pages/admin/lms/modules/forms/module-subsection.form'
import ModuleContentDrawer from '@/pages/admin/lms/modules/forms/module-content.form'
import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/modules/')

export default function LMSModuleListAdminPage() {
  const { lmsCode } = route.useParams()
  const accordion = useNestedAccordion({
    storageKey: lmsCode,
  })

  const {
    authUser: { role },
  } = useAuth('protected')

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
          <RoleComponentManager
            currentRole={role}
            roleRender={{
              admin: (
                <>
                  <ModuleSectionDrawer />
                  <ModuleSubsectionDrawer />
                  <ModuleContentDrawer />
                </>
              ),
            }}
          />
        </Group>
      </Group>

      {/* Module Content with admin actions */}
      {/* <ModulePanel viewMode="admin" allExpanded={false} /> */}

      <Suspense fallback={<ModuleListSkeleton />}>
        <RoleComponentManager
          currentRole={role}
          roleRender={{
            admin: <ModuleListAdmin accordion={accordion} />,
            student: <ModuleListStudent accordion={accordion} />,
            mentor: <ModuleListMentor accordion={accordion} />,
          }}
        />
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

function ModuleListAdmin({
  accordion,
}: {
  accordion: UseNestedAccordionReturn
}) {
  const VIEW_MODE = 'admin'

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
            viewMode={VIEW_MODE}
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
                  viewMode={VIEW_MODE}
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
                          viewMode={VIEW_MODE}
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

function ModuleListStudent({
  accordion,
}: {
  accordion: UseNestedAccordionReturn
}) {
  const VIEW_MODE = 'student'

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

  // Helper function to calculate progress for a section (including all subsections)
  const calculateSectionProgress = (section: any) => {
    const subsections = section.subsections || []
    let totalItems = 0
    let completedItems = 0

    subsections.forEach((subsection: any) => {
      const contents = subsection.moduleContents || []
      totalItems += contents.length

      const completed = contents.filter((content: any) => {
        return content.studentProgress?.some(
          (progress: any) => progress.status === 'COMPLETED',
        )
      }).length

      completedItems += completed
    })

    const progressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    return { completedItems, totalItems, progressPercentage }
  }

  console.log(moduleSections)
  return (
    <>
      <ModuleProgressStudent />
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
          {(section) => {
            const sectionProgress = calculateSectionProgress(section)

            return (
              <ModuleSectionCard
                key={section.id}
                id={section.id}
                title={section.title}
                publishedAt={section.publishedAt}
                viewMode={VIEW_MODE}
                expandedItems={getSubsectionValues(section.id)}
                setExpandedItems={(val) => setSubsectionValues(section.id, val)}
                adminActionProps={{}}
                progressPercentage={sectionProgress.progressPercentage}
                completedItems={sectionProgress.completedItems}
                totalItems={sectionProgress.totalItems}
              >
                <EmptyRenderer
                  items={section.subsections}
                  emptyTitle="No content yet"
                  emptySubtitle="This module section currently has no content."
                  emptyIcon={<IconInbox size={36} stroke={1.5} />}
                >
                  {(subsection) => {
                    return (
                      <ModuleSubsectionCard
                        key={subsection.id}
                        id={subsection.id}
                        title={subsection.title}
                        publishedAt={subsection.publishedAt}
                        viewMode={VIEW_MODE}
                        adminActionProps={{}}
                      >
                        <EmptyRenderer
                          items={subsection.moduleContents}
                          emptyTitle="No content yet"
                          emptySubtitle="This module section currently has no content."
                          emptyIcon={<IconInbox size={36} stroke={1.5} />}
                          wrapper={(children) => (
                            <Stack gap="xs">{children}</Stack>
                          )}
                        >
                          {(content) => (
                            <Link
                              key={content.id}
                              to="/lms/$lmsCode/modules/$itemId"
                              params={{ itemId: content.id }}
                              preload="intent"
                              preloadDelay={200}
                            >
                              <ModuleContentCard
                                viewMode={VIEW_MODE}
                                moduleContent={content}
                                adminActionProps={{}}
                              />
                            </Link>
                          )}
                        </EmptyRenderer>
                      </ModuleSubsectionCard>
                    )
                  }}
                </EmptyRenderer>
              </ModuleSectionCard>
            )
          }}
        </EmptyRenderer>
      </Accordion>
    </>
  )
}

function ModuleProgressStudent() {
  const { lmsCode } = route.useParams()
  const theme = useMantineTheme()

  const { data: moduleProgress } = useSuspenseQuery(
    lmsControllerGetModuleProgressOverviewOptions({
      path: {
        id: lmsCode,
      },
    }),
  )

  return (
    <Box mb="lg">
      <Group align="start" justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {moduleProgress.totalContentItems} Content Items
        </Text>
        <Text size="sm" c="dimmed">
          {`${moduleProgress.progressPercentage} %`}
        </Text>
      </Group>
      <Progress
        value={moduleProgress.progressPercentage}
        size="lg"
        radius="xl"
        color={moduleProgress.progressPercentage === 100 ? 'green' : 'blue'}
      />

      {/* Quick Stats */}
      <Group mt="sm" gap="xl">
        <Group gap="xs">
          <IconCheck size={16} color={theme.colors.green[6]} />
          <Text size="sm">
            {moduleProgress.completedContentItems} Completed
          </Text>
        </Group>
        <Group gap="xs">
          <IconFlagOff size={16} color={theme.colors.gray[6]} />
          <Text size="sm">
            {moduleProgress.notStartedContentItems} Not Started
          </Text>
        </Group>
        {moduleProgress.overdueAssignmentsCount &&
          moduleProgress.overdueAssignmentsCount > 0 && (
            <Group gap="xs">
              <IconAlertCircle size={16} color={theme.colors.red[6]} />
              <Text size="sm" c="red">
                {moduleProgress.overdueAssignmentsCount} Overdue
              </Text>
            </Group>
          )}
      </Group>
    </Box>
  )
}

function ModuleListMentor({
  accordion,
}: {
  accordion: UseNestedAccordionReturn
}) {
  const VIEW_MODE = 'student'

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
            viewMode={VIEW_MODE}
            expandedItems={getSubsectionValues(section.id)}
            setExpandedItems={(val) => setSubsectionValues(section.id, val)}
            adminActionProps={{}}
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
                  viewMode={VIEW_MODE}
                  adminActionProps={{}}
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
                        to="/lms/$lmsCode/modules/$itemId"
                        params={{ itemId: content.id }}
                      >
                        <ModuleContentCard
                          viewMode={VIEW_MODE}
                          moduleContent={content}
                          adminActionProps={{}}
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
