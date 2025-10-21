import { Loader } from '@/components/loader-component'
import RichTextEditor from '@/components/rich-text-editor.tsx'
import {
  EditorProvider,
  type EditorSearchParams,
  type EditorView,
  editorViewOptions,
  useEditorState,
} from '@/features/courses/hooks/useEditorState.tsx'
import type {
  ContentNode,
  ContentNodeType,
  CourseNodeModel,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import type {
  AssignmentItemDto,
  ModuleTreeSectionDto,
} from '@/integrations/api/client'
import {
  lmsContentControllerFindOneQueryKey,
  lmsContentControllerPublishMutation,
  lmsContentControllerRemoveMutation,
  lmsContentControllerUnpublishMutation,
  lmsContentControllerUpdateMutation,
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerRemoveMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { capitalizeFirstLetter } from '@/utils/formatters'
import {
  convertModuleSectionsToTreeData,
  getTypeFromLevel,
  injectAddButtons,
} from '@/utils/helpers'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  rem,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  DndProvider,
  getBackendOptions,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import {
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconFile,
  IconList,
  IconPlus,
  IconRubberStamp,
  IconRubberStampOff,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import dayjs from 'dayjs'
import React, { Suspense, type ReactNode } from 'react'
import AddModuleDrawer from '../modules/admin/add-module-drawer'
import AddModuleItemDrawer from '../modules/admin/add-module-item-drawer'
import ModuleContentView from '../modules/content/module-content-view'
import { CMSContentTreeSuspense } from '../suspense'

const { queryClient } = getContext()

type CMSProps = {
  courseCode?: string
  itemId?: string
  viewMode?: 'editor' | 'full'
}

export function CMS(props: CMSProps) {
  return (
    <Suspense fallback={<Loader />}>
      <EditorProvider>
        <CMSWrapper {...props} />
      </EditorProvider>
    </Suspense>
  )
}

function CMSWrapper({ courseCode }: CMSProps) {
  const searchParams: EditorSearchParams = useSearch({ strict: false })
  const navigate = useNavigate()
  const theme = useMantineTheme()

  const [isTreeOpened, { open: openTree, close: closeTree }] =
    useDisclosure(false)

  const { editorState } = useEditorState()

  const { mutateAsync: updateModuleContent } = useAppMutation(
    lmsContentControllerUpdateMutation,
    {
      loading: {
        message: 'Saving changes...',
        title: 'Updating Content',
      },
      success: {
        message: 'Content updated successfully',
        title: 'Content Updated',
      },
      error: {
        title: 'Failed to update content',
        message: 'Please try again later',
      },
    },
  )

  const { mutateAsync: publishModuleContent } = useAppMutation(
    lmsContentControllerPublishMutation,
    {
      loading: {
        message: 'Publishing changes...',
        title: 'Publishing Content',
      },
      success: {
        message: 'Content published successfully',
        title: 'Content Published',
      },
      error: {
        title: 'Failed to publish content',
        message: 'Please try again later',
      },
    },
    {
      onSuccess: async () => {
        const moduleContentKey = lmsContentControllerFindOneQueryKey({
          path: { moduleContentId: searchParams.id || '' },
        })

        await queryClient.cancelQueries({ queryKey: moduleContentKey })

        await queryClient.invalidateQueries({ queryKey: moduleContentKey })
      },
    },
  )

  const { mutateAsync: unpublishModuleContent } = useAppMutation(
    lmsContentControllerUnpublishMutation,
    {
      loading: {
        message: 'Unpublishing changes...',
        title: 'Unpublishing Content',
      },
      success: {
        message: 'Content unpublished successfully',
        title: 'Content Unpublished',
      },
      error: {
        title: 'Failed to unpublish content',
        message: 'Please try again later',
      },
    },
    {
      onSuccess: async () => {
        const moduleContentKey = lmsContentControllerFindOneQueryKey({
          path: { moduleContentId: searchParams.id || '' },
        })

        await queryClient.cancelQueries({ queryKey: moduleContentKey })

        await queryClient.invalidateQueries({ queryKey: moduleContentKey })
      },
    },
  )

  const { mutateAsync: deleteModuleContent } = useAppMutation(
    lmsContentControllerRemoveMutation,
    {
      loading: {
        message: 'Deleting content...',
        title: 'Deleting Content',
      },
      success: {
        message: 'Content deleted successfully',
        title: 'Content Deleted',
      },
      error: {
        title: 'Failed to delete content',
        message: 'Please try again later',
      },
    },
  )

  const handlePublish = async () => {
    await publishModuleContent({
      path: { moduleContentId: editorState.id || '' },
    })
  }

  const handleUnpublish = async () => {
    await unpublishModuleContent({
      path: { moduleContentId: editorState.id || '' },
    })
  }

  const handleSave = async () => {
    const data = editorState.data
    if (!data) return

    await updateModuleContent({
      path: {
        moduleContentId: editorState.id || '',
      },
      body: {
        ...data,
        content: editorState.content.document,
      },
    })
  }

  const handleDelete = async () => {
    await deleteModuleContent({
      path: { moduleContentId: editorState.id || '' },
    })

    await navigate({ to: '..' })
  }

  const handleSegmentedControl = (value: EditorView) => {
    if (value === editorViewOptions[1].value) {
      return navigate({
        to: '.',
        search: (prev) => ({
          ...prev,
          view: 'preview',
        }),
      })
    }

    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        view: undefined,
      }),
    })
  }

  return (
    <Box h={'100%'} w={'100%'} style={{ overflow: 'hidden' }}>
      <Stack flex={'1 0 auto'} h={'100%'} w={'100%'} gap={0}>
        <Group
          justify="space-between"
          align="center"
          w={'100%'}
          style={{ borderBottom: `2px solid ${theme.colors.gray[3]}` }}
          p={'xs'}
        >
          <Group>
            <ActionIcon
              variant={'transparent'}
              onClick={() =>
                navigate({
                  from: '/lms/$lmsCode/modules',
                  to: '/lms/$lmsCode/modules',
                })
              }
            >
              <IconX />
            </ActionIcon>
            <SegmentedControl
              defaultValue={editorState.view}
              value={editorState.view}
              onChange={(view) => handleSegmentedControl(view as EditorView)}
              data={editorViewOptions.map((option) => ({
                label: option.label,
                value: option.value,
                disabled: option.value === 'preview' && !editorState.data?.id,
              }))}
            />
          </Group>

          {/* <Title order={3} c={'gray.7'} maw={'65%'} lineClamp={1}>
            {courseDetails?.courseCode ? `${courseDetails?.courseCode}` : ''}{' '}
            {courseDetails?.courseName}{' '}
          </Title> */}

          <Group gap={'xs'}>
            <Group wrap="nowrap" gap={0}>
              <Button
                radius={0}
                style={{
                  borderStartStartRadius: '4px',
                  borderEndStartRadius: '4px',
                }}
                onClick={handleSave}
              >
                Save
              </Button>
              <Divider orientation="vertical" />
              <Menu
                transitionProps={{ transition: 'pop' }}
                position="bottom-end"
                withinPortal
              >
                <Menu.Target>
                  <ActionIcon
                    variant="filled"
                    color={theme.primaryColor}
                    size={36}
                    radius={0}
                    style={{
                      borderStartEndRadius: '4px',
                      borderEndEndRadius: '4px',
                    }}
                  >
                    <IconChevronDown size={16} stroke={1.5} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {editorState.data.publishedAt ? (
                    <Menu.Item
                      leftSection={
                        <IconRubberStampOff
                          size={16}
                          stroke={1.5}
                          color={theme.colors.gray[6]}
                        />
                      }
                      onClick={handleUnpublish}
                    >
                      Unpublish
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={
                        <IconRubberStamp
                          size={16}
                          stroke={1.5}
                          color={theme.colors.blue[5]}
                        />
                      }
                      onClick={handlePublish}
                    >
                      Publish
                    </Menu.Item>
                  )}
                  <Menu.Item
                    leftSection={
                      <IconTrash
                        size={16}
                        stroke={1.5}
                        color={theme.colors.red[5]}
                      />
                    }
                    onClick={handleDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Button leftSection={<IconList size={20} />} onClick={openTree}>
              Course Structure
            </Button>
          </Group>
        </Group>

        <Box
          h="100%"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <CMSView courseCode={courseCode} />
        </Box>
      </Stack>

      {/* Course Structure Drawer */}
      {/* Appears ONLY on mobile */}
      <Drawer
        withCloseButton={false}
        keepMounted={false}
        position="right"
        opened={isTreeOpened}
        onClose={closeTree}
      >
        <CMSCourseStructure closeTree={closeTree} />
      </Drawer>

      <CMSStatusBar />
    </Box>
  )
}

interface CourseSelectorProps {
  courses: CourseBasicDetails[]
  selectedCourse?: CourseBasicDetails
  handleCourseChange: (course: CourseBasicDetails | undefined) => void
  showAddButton?: boolean
}

function CMSView({ courseCode }: { courseCode?: CMSProps['courseCode'] }) {
  const searchParams: EditorSearchParams = useSearch({ strict: false })

  const { editorState } = useEditorState()

  const existingContent = editorState.data

  const isPublished = editorState.data.publishedAt || false

  const { mutateAsync: updateModuleContent } = useAppMutation(
    lmsContentControllerUpdateMutation,
    {
      loading: {
        title: 'Updating Title',
        message: 'Saving changes...',
      },
      success: {
        title: 'Title Updated',
        message: 'Title updated successfully',
      },
    },
    {
      onSuccess: async () => {
        const moduleContentKey = lmsContentControllerFindOneQueryKey({
          path: { moduleContentId: searchParams.id || '' },
        })

        await queryClient.cancelQueries({ queryKey: moduleContentKey })

        await queryClient.invalidateQueries({ queryKey: moduleContentKey })
      },
    },
  )

  const handleOnBlur = async (
    e: React.FocusEvent<HTMLInputElement, Element>,
  ) => {
    const title = e.currentTarget.value.trim()

    if (!title) {
      throw new Error('Title cannot be empty')
    }

    if (existingContent?.title === title) return

    await updateModuleContent({
      path: {
        moduleContentId: editorState.id || '',
      },
      body: {
        title: title,
      },
    })
  }

  console.log(existingContent)

  switch (editorState.view) {
    case 'content':
      return (
        <Stack gap={0}>
          <Stack gap="md" px={rem(48)} py={'lg'} pb={'xl'}>
            <Group align="start" gap="sm" justify="space-between">
              <Box>
                <TextInput
                  key={existingContent?.id}
                  onBlur={(e) => handleOnBlur(e)}
                  placeholder="Title of the content"
                  defaultValue={existingContent?.title}
                  variant="unstyled"
                  width={'100%'}
                  styles={{
                    input: {
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#212529',
                      padding: 0,
                      border: 'none',
                      backgroundColor: 'transparent',
                      '&::placeholder': {
                        color: '#6c757d',
                      },
                    },
                  }}
                  size="lg"
                />
                <Group gap="xs">
                  <Badge variant="light" color={isPublished ? 'green' : 'red'}>
                    {isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </Group>
              </Box>
            </Group>
          </Stack>
          <Divider />
          <RichTextEditor editor={editorState.content} />
        </Stack>
      )
    case 'preview':
      return (
        <ModuleContentView
          moduleContentData={editorState.data}
          editor={editorState.content}
          isPreview={true}
        />
      )
  }
}

function CMSCourseStructureQueryProvider({
  children,
}: {
  children: (props: {
    moduleTree: ModuleTreeSectionDto[] | null | undefined
  }) => ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })

  const { data: moduleTreeData } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: {
        id: lmsCode || '',
      },
    }),
  )

  const moduleTree = moduleTreeData?.moduleSections

  return children({
    moduleTree,
  })
}

function CMSCourseStructure({ closeTree }: { closeTree: () => void }) {
  const { editorState, handleAdd, handleNavigate } = useEditorState()

  return (
    <Box py={'md'} h={'100%'}>
      <Container flex={'1 0 auto'} h={'100%'} style={{ overflow: 'auto' }}>
        <Stack gap={'md'} mb={'xs'}>
          <Group align="center" gap={'xs'}>
            <ActionIcon
              onClick={() => closeTree()}
              variant="subtle"
              c={'dark'}
              radius={'xl'}
            >
              <IconChevronRight />
            </ActionIcon>
            <Text fw={500}>Course Structure</Text>
          </Group>

          <Divider />
        </Stack>

        <Suspense fallback={<CMSContentTreeSuspense />}>
          <CMSCourseStructureQueryProvider>
            {({ moduleTree }) => (
              <CMSContentTree
                moduleTree={moduleTree}
                handleNodeSelect={(nodeData) => {
                  handleNavigate(nodeData)
                  closeTree()
                }}
              />
            )}
          </CMSCourseStructureQueryProvider>
        </Suspense>
      </Container>
    </Box>
  )
}

interface StatusBarProps {}

function CMSStatusBar({}: StatusBarProps) {
  const theme = useMantineTheme()

  const { editorState } = useEditorState()

  const existingContent = editorState.data

  return (
    <Group
      justify={'space-between'}
      style={{
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        padding: theme.spacing.xs,
        backgroundColor: theme.white,
      }}
      mih={32}
    >
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          Last saved: {dayjs(existingContent?.updatedAt).fromNow()}
        </Text>
        <Text size="sm" c={theme.colors.blue[6]}>
          •
        </Text>
        <Text size="sm" c="dimmed">
          Title: {existingContent?.title}
        </Text>
      </Group>
    </Group>
  )
}

interface ContentTreeProps {
  moduleTree: ModuleTreeSectionDto[] | null | undefined
  handleNodeSelect: (nodeData: ContentNode) => void
}

function CMSContentTree({ moduleTree, handleNodeSelect }: ContentTreeProps) {
  const { editorState } = useEditorState()
  // Handle node selection and trigger onChange
  const handleNodeRowSelect = (node: CourseNodeModel) => {
    if (node.data?.type === 'add-button' || node.data?.type !== 'item') return

    if (node.data?.contentData) {
      handleNodeSelect(node.data.contentData)
    }
  }

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Stack gap={0} h="100%">
        <Tree
          tree={injectAddButtons(
            convertModuleSectionsToTreeData(moduleTree || []),
          )}
          sort={false}
          rootId={'root'}
          insertDroppableFirst={false}
          enableAnimateExpand
          onDrop={() => {}}
          canDrop={() => false}
          canDrag={(node) => node?.data?.type !== 'add-button'}
          dropTargetOffset={5}
          initialOpen={true}
          render={(node, { depth, isOpen, isDropTarget, onToggle }) => (
            <CMSNodeRow
              node={node}
              depth={depth}
              isOpen={isOpen}
              isDropTarget={isDropTarget}
              isSelected={editorState.data?.id === node.id}
              onToggle={onToggle}
              handleNodeSelect={handleNodeRowSelect}
            />
          )}
        />
      </Stack>
    </DndProvider>
  )
}

// Get the appropriate icon for the node type
function CMSNodeIcon({
  type,
  size = 16,
}: {
  type: ContentNodeType
  size?: number
}) {
  switch (type) {
    case 'section':
      return <IconList size={size} />
    case 'item':
      return <IconFile size={size} />
    default:
      return <IconFile size={size} />
  }
}

interface NodeRowProps {
  node: CourseNodeModel
  depth: number
  isOpen: boolean
  isDropTarget: boolean
  isSelected: boolean
  onToggle: () => void
  handleNodeSelect: (node: CourseNodeModel) => void
}

function CMSNodeRow({
  node,
  depth,
  isOpen,
  isDropTarget,
  isSelected,
  onToggle,
  handleNodeSelect,
}: NodeRowProps) {
  const { handleAdd, editorState } = useEditorState()

  const { lmsCode } = useParams({ strict: false })
  const navigate = useNavigate()

  const theme = useMantineTheme()

  // Calculate proper indentation (20px per level)
  const indentSize = depth * 20

  const isSectionAdd = getTypeFromLevel(node.data?.level) === 'section'

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

  const { mutateAsync: deleteModuleSection } = useAppMutation(
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

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    moduleContent: CourseNodeModel,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: (
        <Text fw={600} c={'dark.7'}>
          Delete Module {isSectionAdd ? 'Section' : 'Content'}
        </Text>
      ),
      children: (
        <Text size="sm" c={'dark.3'}>
          Are you sure you want to delete this module{' '}
          {isSectionAdd ? 'section' : 'content'}? This action cannot be undone.
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        isSectionAdd
          ? await deleteModuleSection({
              path: {
                moduleSectionId: moduleContent.id.toString(),
              },
              query: {
                directDelete: true,
              },
            })
          : await deleteModuleContent({
              path: {
                moduleContentId: moduleContent.id.toString(),
              },
              query: {
                directDelete: true,
              },
            })

        await navigate({ to: '..' })
      },
    })
  }

  if (node.data?.type === 'add-button') {
    if (!isSectionAdd) {
      return (
        <Box pl={indentSize + 24} py={2}>
          <AddModuleItemDrawer
            props={{
              section: {
                id: node.parent as string,
                parentSectionId:
                  node.parent === 'root' ||
                  getTypeFromLevel(node.data?.level) === 'subsection'
                    ? null
                    : node.parent,
              } as ModuleTreeSectionDto,
            }}
          >
            {({ setDrawer }) => (
              <Button
                variant="transparent"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => handleAdd(setDrawer)}
                style={{
                  color: theme.colors.blue[8],
                  height: 'auto',
                  padding: '4px 8px',
                }}
              >
                <Text size="sm" fw={500}>
                  Add{' '}
                  {capitalizeFirstLetter(getTypeFromLevel(node.data?.level))}
                </Text>
              </Button>
            )}
          </AddModuleItemDrawer>
        </Box>
      )
    }

    return (
      <Box pl={indentSize + 24} py={2}>
        <AddModuleDrawer>
          {({ setDrawer }) => (
            <Button
              variant="transparent"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => handleAdd(setDrawer)}
              style={{
                color: theme.colors.blue[8],
                height: 'auto',
                padding: '4px 8px',
              }}
            >
              <Text size="sm" fw={500}>
                Add {capitalizeFirstLetter(getTypeFromLevel(node.data?.level))}
              </Text>
            </Button>
          )}
        </AddModuleDrawer>
      </Box>
    )
  }

  return (
    <Group
      gap={rem(5)}
      wrap="nowrap"
      style={{
        paddingLeft: indentSize + 5,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: isSelected
          ? theme.colors.gray[3]
          : isDropTarget
            ? theme.colors.gray[1]
            : 'transparent',
        borderRadius: 4,
        border: isDropTarget
          ? `2px solid ${theme.colors.gray[4]}`
          : '2px solid transparent',
        cursor: 'pointer',
        margin: '1px 0',
      }}
      onClick={() => handleNodeSelect(node)}
    >
      {/* Toggle button or spacer */}
      <Box
        w={15}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {node.droppable ? (
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            variant="subtle"
            size="sm"
            style={{ minWidth: 20, minHeight: 20 }}
          >
            <IconChevronRight
              size={14}
              style={{
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </ActionIcon>
        ) : null}
      </Box>

      {/* Node icon */}
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        <CMSNodeIcon type={node.data?.type || 'item'} size={14} />
      </Box>

      {/* Node text */}
      <Text
        fw={400}
        size="xs"
        lh="sm"
        truncate
        style={{
          flex: 1,
        }}
      >
        {node.text}
      </Text>

      {/* Node type badge */}
      <Text
        size="xs"
        c="dimmed"
        mr="xs"
        style={{ textTransform: 'capitalize' }}
      >
        {node.data?.type}
      </Text>

      {/* Actions menu */}
      <Menu withinPortal shadow="md" width={150}>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            style={{
              opacity: isSelected ? 1 : 0.7,
              transition: 'opacity 0.15s ease',
            }}
          >
            <IconDotsVertical size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={(e) => handleDelete(e, node)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
