import NoItemFound from '@/components/no-item-found'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  type BasicModuleItemDto,
  type ContentType,
  type ModuleTreeSectionDto,
} from '@/integrations/api/client'
import {
  lmsContentControllerCreateMutation,
  lmsContentControllerPublishMutation,
  lmsContentControllerRemoveMutation,
  lmsContentControllerUnpublishMutation,
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
  lmsSectionControllerPublishSectionMutation,
  lmsSectionControllerRemoveMutation,
  lmsSectionControllerUnpublishSectionMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { zContentType } from '@/integrations/api/client/zod.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  Menu,
  rem,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import {
  IconCalendarTime,
  IconChartBar,
  IconClipboard,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFileText,
  IconInbox,
  IconMessageCircle,
  IconPaperclip,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Fragment, Suspense, useState } from 'react'
import { getMockModuleByRole } from '../mocks'
import { ModulePanelSuspense } from '../suspense'

const { queryClient } = getContext()

interface ModulePanelProps {
  viewMode: 'student' | 'mentor' | 'admin'
  allExpanded?: boolean
}

function ModulePanelQueryProvider({
  children,
}: {
  children: (props: {
    moduleSections: ModuleTreeSectionDto[] | null | undefined
  }) => React.ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })

  const { data } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: {
        id: lmsCode || '',
      },
    }),
  )

  const moduleSections = data?.moduleSections

  console.log('Module data:', moduleSections)

  return children({
    moduleSections,
  })
}

function ModulePanel({ viewMode, allExpanded = false }: ModulePanelProps) {
  const { authUser } = useAuth('protected')
  const moduleData = getMockModuleByRole(authUser.role) //TODO: replace with actual data

  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const theme = useMantineTheme()

  // Update expanded state when allExpanded prop changes
  // useEffect(() => {
  //   if (allExpanded) {
  //     const allSectionIds = moduleData.sections.map((s) => s.id)
  //     const allSubSectionIds = moduleData.sections.flatMap((s) =>
  //       s.subsections?.map((sub) => sub.id),
  //     )
  //     setExpandedItems([...allSectionIds, ...(allSubSectionIds as string[])])
  //   } else {
  //     setExpandedItems([])
  //   }
  // }, [allExpanded])

  return (
    <Accordion
      multiple
      value={expandedItems}
      onChange={setExpandedItems}
      chevronPosition="left"
      variant="filled"
      styles={{
        chevron: {
          padding: theme.spacing.sm,
        },
      }}
    >
      <Divider />
      <Suspense fallback={<ModulePanelSuspense />}>
        <ModulePanelQueryProvider>
          {({ moduleSections }) =>
            moduleSections == null || moduleSections.length === 0 ? (
              <NoItemFound
                icon={<IconInbox size={36} stroke={1.5} />}
                title="No content yet"
                subtitle="This module currently has no content."
              />
            ) : (
              moduleSections.map((section) => (
                <Fragment key={section.id}>
                  <Accordion.Item value={section.id}>
                    <CustomAccordionControl
                      section={section}
                      title={section.title}
                      viewMode={viewMode}
                    />
                    <Accordion.Panel>
                      {/* Subsections */}
                      <Accordion
                        multiple
                        value={expandedItems}
                        onChange={setExpandedItems}
                        chevronPosition="left"
                        variant="separated"
                        radius={'md'}
                        styles={{
                          chevron: {
                            padding: theme.spacing.sm,
                          },
                          // item: {
                          //   marginBottom: theme.spacing.sm,
                          // },
                        }}
                      >
                        {section.subsections == null ||
                        section.subsections.length === 0 ? (
                          <NoItemFound
                            icon={<IconInbox size={36} stroke={1.5} />}
                            title="No content yet"
                            subtitle="This module section currently has no content."
                          />
                        ) : (
                          section.subsections?.map((subsection) => (
                            <Accordion.Item
                              value={subsection.id}
                              key={subsection.id}
                              bg={'white'}
                              className="ring-1 ring-gray-200"
                            >
                              <CustomAccordionControl
                                section={subsection}
                                title={subsection.title}
                                viewMode={viewMode}
                                isSubsection
                              />

                              <Accordion.Panel>
                                <Stack gap="xs">
                                  {subsection?.moduleContents == null ||
                                  subsection?.moduleContents.length === 0 ? (
                                    <NoItemFound
                                      icon={
                                        <IconInbox size={36} stroke={1.5} />
                                      }
                                      title="No content yet"
                                      subtitle="This module section currently has no content."
                                    />
                                  ) : (
                                    subsection?.moduleContents?.map(
                                      (moduleContent) => (
                                        <ModuleItemCard
                                          key={moduleContent.id}
                                          moduleContent={moduleContent}
                                          viewMode={viewMode}
                                        />
                                      ),
                                    )
                                  )}
                                </Stack>
                              </Accordion.Panel>
                            </Accordion.Item>
                          ))
                        )}
                      </Accordion>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Divider />
                </Fragment>
              ))
            )
          }
        </ModulePanelQueryProvider>
      </Suspense>
    </Accordion>
  )
}

interface ModuleItemCardProps {
  moduleContent: BasicModuleItemDto
  viewMode: 'student' | 'mentor' | 'admin'
}

function ModuleItemCard({ moduleContent, viewMode }: ModuleItemCardProps) {
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()

  const isOverdue =
    moduleContent.contentType === 'ASSIGNMENT' &&
    moduleContent.assignment?.dueDate &&
    new Date(moduleContent.assignment.dueDate) < new Date()

  const isCompleted =
    moduleContent.contentType === 'LESSON' &&
    moduleContent.studentProgress?.every(
      (progress) => progress.status === 'COMPLETED',
    )

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'LESSON':
        return <IconFileText size={16} />

      case 'ASSIGNMENT':
        return <IconClipboard size={16} />
      case 'QUIZ':
        return <IconPaperclip size={16} />
      case 'DISCUSSION':
        return <IconMessageCircle size={16} />
      case 'FILE':
        return <IconPaperclip size={16} />
      case 'URL':
        return <IconExternalLink size={16} />
      case 'VIDEO':
        return <IconCalendarTime size={16} />
      default:
        return 'Untitled Item'
    }
  }

  const getTitleByContentType = (
    contentType: ContentType,
    moduleContent: BasicModuleItemDto,
  ) => {
    switch (contentType) {
      case 'LESSON':
        return moduleContent.lesson?.title || 'Untitled Lesson'
      case 'ASSIGNMENT':
        return moduleContent.assignment?.title || 'Untitled Assignment'
      case 'QUIZ':
        return moduleContent.quiz?.title || 'Untitled Quiz'
      case 'DISCUSSION':
        return moduleContent.discussion?.title || 'Untitled Discussion'
      case 'FILE':
        return moduleContent.fileResource?.title || 'Untitled File'
      case 'URL':
        return moduleContent.externalUrl?.title || 'Untitled External Tool'
      case 'VIDEO':
        return moduleContent.video?.title || 'Untitled Video'
      default:
        return 'Untitled Item'
    }
  }

  const navigateToItem = () => {
    navigate({
      from: '/lms/$lmsCode/modules',
      to: `$itemId`,
      params: { itemId: moduleContent.id },
    })
  }

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={(e) => {
        e.stopPropagation()
        navigateToItem()
      }}
    >
      <Group align="center" justify="space-between" wrap="nowrap">
        {/* Icon + Title */}
        <Group align="center" gap="sm" wrap="nowrap" flex={1}>
          <ThemeIcon
            size="md"
            variant="light"
            color={isOverdue ? 'red' : isCompleted ? 'green.8' : 'gray'}
          >
            {getContentTypeIcon(moduleContent.contentType)}
          </ThemeIcon>

          <Box flex={1}>
            <Group gap="xs" mb={4}>
              <Text fw={500} size="sm" lineClamp={2}>
                {getTitleByContentType(
                  moduleContent.contentType,
                  moduleContent,
                )}
              </Text>

              {moduleContent.contentType && (
                <Badge size="xs" variant="light" color="gray">
                  {moduleContent.contentType}
                </Badge>
              )}

              {!moduleContent.publishedAt && viewMode !== 'student' && (
                <Badge size="xs" variant="outline" color="orange">
                  Draft
                </Badge>
              )}

              {isOverdue && (
                <Badge size="xs" variant="filled" color="red">
                  Overdue
                </Badge>
              )}
            </Group>

            {/* Meta info */}
            {moduleContent.contentType === 'LESSON' && (
              <Text size="xs" c="dimmed">
                Reading Material
                {moduleContent.studentProgress?.every(
                  (p) => p.status === 'COMPLETED',
                ) && (
                  <>
                    {' '}
                    • Completed{' '}
                    {/* {formatTimestampToDateTimeText(
                      moduleContent.studentProgress.find(
                        (p) => p.status === 'COMPLETED',
                      )?.completedAt,
                    )} */}
                  </>
                )}
              </Text>
            )}

            {moduleContent.assignment && (
              <Text size="xs" c={isOverdue ? 'red' : 'dimmed'}>
                Due{' '}
                {formatTimestampToDateTimeText(
                  moduleContent.assignment.dueDate || '',
                  'by',
                )}{' '}
                {/* • {moduleContent.assignment.points} pts */}
              </Text>
            )}
          </Box>
        </Group>

        {/* Right-side Actions */}
        <Box>
          {/* {viewMode === 'student' && moduleContent.contentType === 'ASSIGNMENT' && (
            <SubmitButton
              submissionStatus={
                getSubmissionStatus(moduleContent.assignment) || 'pending'
              }
              onClick={() => {}}
              dueDate={moduleContent.assignment?.dueDate || ''}
              assignmentStatus={moduleContent.assignment?.status || 'open'}
              isPreview={authUser.role !== 'student'}
            />
          )} */}

          {viewMode === 'mentor' &&
            moduleContent.contentType === 'ASSIGNMENT' && (
              <Tooltip label="View submissions">
                <ActionIcon variant="subtle" color="blue" radius="xl" size="md">
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}

          {viewMode === 'admin' && (
            <AdminActionsModuleContent moduleContent={moduleContent} />
          )}
        </Box>
      </Group>
    </Card>
  )
}

type CustomAccordionControlProps = {
  section: ModuleTreeSectionDto
  title: string
  isPreview?: boolean
  isSubsection?: boolean
  viewMode: 'student' | 'mentor' | 'admin'
  accordionControlProps?: any
}

function CustomAccordionControl({
  section,
  title,
  isSubsection = false,
  viewMode,
  accordionControlProps,
  ...props
}: CustomAccordionControlProps) {
  // Derive items for sections or subsections to avoid prop drilling
  // const items: ModuleItem[] =
  //   (item.items as ModuleItem[]) ??
  //   (item.subsections?.flatMap(
  //     (s: ModuleSection) => s.items,
  //   ) as ModuleItem[]) ??
  //   []

  // const completedItemsCount = getCompletedItemsCount(items)
  // const overdueItemsCount = getOverdueItemsCount(items)
  // const totalItemsCount = items.length
  // const progressPercentage =
  //   totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0

  return (
    <Accordion.Control py={'sm'} {...accordionControlProps}>
      <Group wrap="nowrap" flex={1}>
        <Stack gap={'xs'} flex={1}>
          <Group gap="xs" mb={4}>
            <Title order={isSubsection ? 5 : 4} fw={600}>
              {title}
            </Title>

            {!section.publishedAt && viewMode !== 'student' && (
              <Badge size="xs" variant="outline" color="orange">
                Draft
              </Badge>
            )}

            {/* {overdueItemsCount > 0 && viewMode === 'student' && (
              <Badge size="xs" variant="filled" color="red">
                {overdueItemsCount} Overdue
              </Badge>
            )} */}
          </Group>

          {/* {viewMode === 'student' && totalItemsCount > 0 && (
            <Progress
              value={progressPercentage}
              size="sm"
              radius="xl"
              color={progressPercentage === 100 ? 'green' : 'blue'}
            />
          )} */}

          {viewMode !== 'student' && section.publishedAt && (
            <Text size="xs" c="dimmed">
              Published{' '}
              {formatTimestampToDateTimeText(section.publishedAt, 'on')}
            </Text>
          )}
        </Stack>

        {viewMode === 'mentor' && (
          <Tooltip label="View section analytics">
            <ActionIcon variant="subtle" color="blue" radius="xl" size="md">
              <IconChartBar size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {viewMode === 'admin' && <AdminActions section={section} />}
      </Group>
    </Accordion.Control>
  )
}

type AdminActionsProps = {
  section: ModuleTreeSectionDto
}

function AdminActions({ section }: AdminActionsProps) {
  const theme = useMantineTheme()
  const { lmsCode } = useParams({ strict: false })
  const navigate = useNavigate()

  const [publishMenuOpen, setPublishMenuOpen] = useState(false)
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)

  const { mutateAsync: deleteSubsection } = useAppMutation(
    lmsSectionControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting Subsection',
        message: 'Deleting subsection — please wait',
      },
      success: {
        title: 'Subsection Deleted',
        message: 'Subsection was deleted successfully',
      },
      error: {
        title: 'Failed to Delete Subsection',
        message:
          'There was an error while deleting the subsection. Please try again.',
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

  const { mutateAsync: publishSubsection } = useAppMutation(
    lmsSectionControllerPublishSectionMutation,
    {
      loading: {
        title: 'Publishing Section',
        message: 'Publishing section — please wait',
      },
      success: {
        title: 'Section Published',
        message: 'Section was published successfully',
      },
      error: {
        title: 'Failed to Publish Section',
        message:
          'There was an error while publishing the section. Please try again.',
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

  const { mutateAsync: unpublishSubsection } = useAppMutation(
    lmsSectionControllerUnpublishSectionMutation,
    {
      loading: {
        title: 'Unpublishing Section',
        message: 'Unpublishing section — please wait',
      },
      success: {
        title: 'Section Unpublished',
        message: 'Section was unpublished successfully',
      },
      error: {
        title: 'Failed to Unpublish Section',
        message:
          'There was an error while unpublishing the section. Please try again.',
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

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Delete Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to delete this module section? This action
          cannot be undone.
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteSubsection({
          path: {
            moduleSectionId: section.id,
          },
          query: {
            directDelete: true,
          },
        })
      },
    })
  }

  const handlePublishNow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()
    // navigate({
    //   from: '/lms/$lmsCode/modules',
    //   to: `$itemId/publish`,
    //   params: { itemId: section.id },
    //   search: { scheduled: false, unpublish: false },
    // })

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Publish Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to publish this module section?
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Publish', cancel: 'Cancel' },
      confirmProps: { color: 'green.9' },
      onConfirm: async () => {
        await publishSubsection({
          path: {
            id: section.id,
          },
        })
      },
    })
  }

  const handleUnpublish = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Unpublish Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to unpublish this module section? This will hide
          the section from students.
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Unpublish', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await unpublishSubsection({
          path: {
            id: section.id,
          },
        })
      },
    })
  }

  return (
    <Group gap={rem(5)}>
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <Tooltip
            onClick={(e) => e.stopPropagation()}
            label={section.publishedAt ? 'Published' : 'Not Published'}
          >
            <ActionIcon
              component="div"
              variant={'subtle'}
              color={section.publishedAt ? 'green' : 'gray'}
              radius="xl"
              size="lg"
            >
              {section.publishedAt ? (
                <IconRubberStamp size={16} />
              ) : (
                <IconRubberStampOff size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Publish Actions</Menu.Label>
          {!section.publishedAt && (
            <Menu.Item
              onClick={(e) => handlePublishNow(e)}
              leftSection={
                <IconRubberStamp
                  size={16}
                  stroke={1.5}
                  color={theme.colors.green[6]}
                />
              }
            >
              Publish Now
            </Menu.Item>
          )}

          {!section.publishedAt && (
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                navigate({
                  from: '/lms/$lmsCode/modules',
                  to: `$itemId/publish`,
                  params: { itemId: section.id },
                  search: { scheduled: true, unpublish: false },
                })
              }}
              leftSection={
                <IconCalendarTime
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[6]}
                />
              }
            >
              Schedule Publish
            </Menu.Item>
          )}

          {section.publishedAt && (
            <Menu.Item
              onClick={(e) => handleUnpublish(e)}
              leftSection={
                <IconRubberStampOff
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[6]}
                />
              }
            >
              Unpublish
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <Tooltip label="Add new item">
        <AddSubsectionDrawer props={{ section }}>
          {({ setDrawer }) => (
            <ActionIcon
              component="div"
              variant={'subtle'}
              color="blue"
              radius="xl"
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                setDrawer(true)
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          )}
        </AddSubsectionDrawer>
      </Tooltip>

      <Menu
        shadow="md"
        width={200}
        opened={actionsMenuOpen}
        onClose={() => setActionsMenuOpen(false)}
      >
        <Menu.Target>
          <ActionIcon
            component="div"
            variant={'subtle'}
            color="gray"
            radius="xl"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              setActionsMenuOpen(true)
            }}
          >
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Item Actions</Menu.Label>
          <Menu.Item
            leftSection={<IconEdit size={16} stroke={1.5} />}
            onClick={(e) => {
              e.stopPropagation()
              navigate({
                from: '/lms/$lmsCode/modules',
                to: `edit`,
                search: { id: section.id },
              })
            }}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} stroke={1.5} />}
            onClick={(e) => handleDelete(e)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

function AdminActionsModuleContent({
  moduleContent,
}: {
  moduleContent: BasicModuleItemDto
}) {
  const theme = useMantineTheme()
  const { lmsCode } = useParams({ strict: false })
  const navigate = useNavigate()

  const [publishMenuOpen, setPublishMenuOpen] = useState(false)
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)

  const { mutateAsync: deleteModuleContent } = useAppMutation(
    lmsContentControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting Module Content',
        message: 'Deleting module content — please wait',
      },
      success: {
        title: 'Module Content Deleted',
        message: 'Module content was deleted successfully',
      },
      error: {
        title: 'Failed to Delete Module Content',
        message:
          'There was an error while deleting the module content. Please try again.',
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

  const { mutateAsync: publishModuleContent } = useAppMutation(
    lmsContentControllerPublishMutation,
    {
      loading: {
        title: 'Publishing Module Content',
        message: 'Publishing module content — please wait',
      },
      success: {
        title: 'Module Content Published',
        message: 'Module content was published successfully',
      },
      error: {
        title: 'Failed to Publish Module Content',
        message:
          'There was an error while publishing the module content. Please try again.',
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

  const { mutateAsync: unpublishModuleContent } = useAppMutation(
    lmsContentControllerUnpublishMutation,
    {
      loading: {
        title: 'Unpublishing Module Content',
        message: 'Unpublishing module content — please wait',
      },
      success: {
        title: 'Module Content Unpublished',
        message: 'Module content was unpublished successfully',
      },
      error: {
        title: 'Failed to Unpublish Module Content',
        message:
          'There was an error while unpublishing the module content. Please try again.',
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

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Delete Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to delete this module section? This action
          cannot be undone.
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteModuleContent({
          path: {
            moduleContentId: moduleContent.id,
          },
          query: {
            directDelete: true,
          },
        })
      },
    })
  }

  const handlePublishNow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()
    // navigate({
    //   from: '/lms/$lmsCode/modules',
    //   to: `$itemId/publish`,
    //   params: { itemId: section.id },
    //   search: { scheduled: false, unpublish: false },
    // })

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Publish Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to publish this module section?
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Publish', cancel: 'Cancel' },
      confirmProps: { color: 'green.9' },
      onConfirm: async () => {
        await publishModuleContent({
          path: {
            moduleContentId: moduleContent.id,
          },
        })
      },
    })
  }

  const handleUnpublish = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Unpublish Module Section
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to unpublish this module section? This will hide
          the section from students.
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Unpublish', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await unpublishModuleContent({
          path: {
            ':moduleContentId': moduleContent.id,
          },
        })
      },
    })
  }

  return (
    <Group gap={rem(5)}>
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <Tooltip
            onClick={(e) => e.stopPropagation()}
            label={moduleContent.publishedAt ? 'Published' : 'Not Published'}
          >
            <ActionIcon
              component="div"
              variant={'subtle'}
              color={moduleContent.publishedAt ? 'green' : 'gray'}
              radius="xl"
              size="lg"
            >
              {moduleContent.publishedAt ? (
                <IconRubberStamp size={16} />
              ) : (
                <IconRubberStampOff size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Publish Actions</Menu.Label>
          {!moduleContent.publishedAt && (
            <Menu.Item
              onClick={(e) => handlePublishNow(e)}
              leftSection={
                <IconRubberStamp
                  size={16}
                  stroke={1.5}
                  color={theme.colors.green[6]}
                />
              }
            >
              Publish Now
            </Menu.Item>
          )}

          {!moduleContent.publishedAt && (
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Handle schedule publish for module content
              }}
              leftSection={
                <IconCalendarTime
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[6]}
                />
              }
            >
              Schedule Publish
            </Menu.Item>
          )}

          {moduleContent.publishedAt && (
            <Menu.Item
              onClick={(e) => handleUnpublish(e)}
              leftSection={
                <IconRubberStampOff
                  size={16}
                  stroke={1.5}
                  color={theme.colors.blue[6]}
                />
              }
            >
              Unpublish
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <Menu
        shadow="md"
        width={200}
        opened={actionsMenuOpen}
        onClose={() => setActionsMenuOpen(false)}
      >
        <Menu.Target>
          <ActionIcon
            component="div"
            variant={'subtle'}
            color="gray"
            radius="xl"
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              setActionsMenuOpen(true)
            }}
          >
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Item Actions</Menu.Label>
          <Menu.Item
            leftSection={<IconEdit size={16} stroke={1.5} />}
            onClick={(e) => {
              e.stopPropagation()
              navigate({
                from: '/lms/$lmsCode/modules',
                to: `edit`,
                search: { id: moduleContent.id },
              })
            }}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} stroke={1.5} />}
            onClick={(e) => handleDelete(e)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

function AddSubsectionDrawer({
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

  const isSubsection = !!section.parentSectionId

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
    // navigate({
    //   from: '/lms/$lmsCode/modules',
    //   to: `create`,
    //   search: { id: section.id },
    // })

    if (form.validate().hasErrors) return

    if (isSubsection) {
      await createModuleContent({
        path: {
          moduleId: lmsCode || '',
        },
        body: {
          contentType: form.getValues().contentType,
          lesson: {
            title: form.getValues().title,
          },
          sectionId: section.id,
        },
      })
    } else {
      await createSubsection({
        path: {
          moduleId: lmsCode || '',
        },
        body: {
          title: form.getValues().title,
          parentSectionId: section.id,
        },
      })
    }

    // Close drawer and reset form
    setDrawer(false)
  }

  const setDrawer = (open: boolean) => {
    navigate({
      from: '/lms/$lmsCode/modules',
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

export default ModulePanel
