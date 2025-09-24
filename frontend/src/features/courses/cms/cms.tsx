import RichTextEditor from '@/components/rich-text-editor.tsx'
import { useCourseData } from '@/features/courses/hooks/useCourseData.ts'
import {
  EditorProvider,
  type EditorView,
  editorViewOptions,
  useEditorState,
} from '@/features/courses/hooks/useEditorState.tsx'
import { mockInitialContent } from '@/features/courses/mocks.ts'
import ModuleContentView from '@/features/courses/modules/content/module-content-view.tsx'
import type {
  ContentNode,
  ContentNodeType,
  CourseNodeModel,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import type { ModuleTreeSectionDto } from '@/integrations/api/client'
import { lmsControllerFindModuleTreeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { capitalizeFirstLetter } from '@/utils/formatters'
import {
  convertModuleSectionsToTreeData,
  getTypeFromLevel,
  injectAddButtons,
} from '@/utils/helpers'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  rem,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  DndProvider,
  getBackendOptions,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import {
  IconBook,
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconFile,
  IconList,
  IconPlus,
  IconRubberStamp,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { CMSContentTreeSuspense } from '../suspense'

type CMSProps = {
  courseCode?: string
  itemId?: string
  viewMode?: 'editor' | 'full'
}

export function CMS(props: CMSProps) {
  return (
    <EditorProvider>
      <CMSWrapper {...props} />
    </EditorProvider>
  )
}

function CMSWrapper({ courseCode, itemId, viewMode = 'editor' }: CMSProps) {
  const navigate = useNavigate()
  const theme = useMantineTheme()

  const [isTreeOpened, { open: openTree, close: closeTree }] =
    useDisclosure(false)

  const { courseDetails, setCourseDetails } = useCourseData(courseCode)

  const { editorState } = useEditorState()

  const handleCourseChange = (course: CourseBasicDetails | undefined) => {
    setCourseDetails(course)
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
              onClick={() => navigate({ to: '..' })}
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
                disabled:
                  option.value === 'preview' && !editorState.data?.id
                    ? true
                    : false,
              }))}
            />
          </Group>

          <Title order={3} c={'gray.7'} maw={'65%'} lineClamp={1}>
            {courseDetails?.courseCode ? `${courseDetails?.courseCode}` : ''}{' '}
            {courseDetails?.courseName}{' '}
          </Title>

          <Group gap={'xs'}>
            <Group wrap="nowrap" gap={0}>
              <Button
                radius={0}
                style={{
                  borderStartStartRadius: '4px',
                  borderEndStartRadius: '4px',
                }}
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
                  <Menu.Item
                    leftSection={
                      <IconRubberStamp
                        size={16}
                        stroke={1.5}
                        color={theme.colors.blue[5]}
                      />
                    }
                    component={Link}
                    to={`../publish`}
                  >
                    Publish
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconCalendar
                        size={16}
                        stroke={1.5}
                        color={theme.colors.blue[5]}
                      />
                    }
                  >
                    Schedule publishing
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconTrash
                        size={16}
                        stroke={1.5}
                        color={theme.colors.red[5]}
                      />
                    }
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
        <CMSCourseStructure
          courseCode={courseCode}
          handleCourseChange={handleCourseChange}
          closeTree={closeTree}
        />
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
  const { module, updateCourseContent, getNode } = useCourseData(courseCode)

  const { editorState, handleUpdate } = useEditorState()

  switch (editorState.view) {
    case 'content':
      return (
        <RichTextEditor
          content={
            editorState.data && 'content' in editorState.data
              ? editorState.data?.content || mockInitialContent
              : null
          }
          onUpdate={(newContent) => {
            updateCourseContent(newContent, editorState.data?.id)
            if (editorState.data) {
              const updatedNode = {
                ...editorState.data,
                content: newContent,
              }
              handleUpdate(editorState.type, updatedNode, editorState.view)
            }
          }}
        />
      )
    case 'preview':
      return (
        <ModuleContentView
          module={module}
          moduleItem={editorState.data as ModuleItem}
          parentSection={
            getNode(editorState.data?.parentId as string)?.node as ModuleSection
          }
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
  }) => React.ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })

  const { data: moduleTreeData } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: {
        id: lmsCode || '',
      },
    }),
  )

  console.log(moduleTreeData?.moduleSections)

  const moduleTree = moduleTreeData?.moduleSections

  return children({
    moduleTree,
  })
}

function CMSCourseStructure({
  courseCode,
  handleCourseChange,
  closeTree,
}: {
  courseCode?: string
  handleCourseChange: (course: CourseBasicDetails | undefined) => void
  closeTree: () => void
}) {
  const { courseDetails, module } = useCourseData(courseCode)

  const { editorState, handleAdd, handleUpdate } = useEditorState()

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

          {/* <CMSCourseSelector
            courses={mockCourseBasicDetails}
            selectedCourse={courseDetails}
            handleCourseChange={handleCourseChange}
          /> */}
          <Divider />
        </Stack>

        <Suspense fallback={<CMSContentTreeSuspense />}>
          <CMSCourseStructureQueryProvider>
            {({ moduleTree }) => (
              <CMSContentTree
                handleAdd={handleAdd}
                moduleTree={moduleTree}
                handleNodeSelect={(nodeData) => {
                  handleUpdate(editorState.type, nodeData, editorState.view)
                }}
              />
            )}
          </CMSCourseStructureQueryProvider>
        </Suspense>
      </Container>
    </Box>
  )
}

function CMSCourseSelector({
  courses,
  selectedCourse,
  handleCourseChange,
}: CourseSelectorProps) {
  return (
    <Group align="center" wrap={'nowrap'}>
      <Select
        data={courses.map((course) => course.courseName)}
        value={selectedCourse?.courseName}
        onChange={(value) => {
          const course = courses.find((c) => c.courseName === value)
          handleCourseChange(course)
        }}
        leftSection={<IconBook size={24} />}
        searchable={true}
        flex={1}
      />
    </Group>
  )
}

interface StatusBarProps {}

function CMSStatusBar({}: StatusBarProps) {
  const theme = useMantineTheme()

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
          Last saved: 2 minutes ago
        </Text>
        <Text size="sm" c={theme.colors.blue[6]}>
          •
        </Text>
        <Text size="sm" c="dimmed">
          Course Version: 1.0.0
        </Text>
      </Group>
    </Group>
  )
}

interface ContentTreeProps {
  moduleTree: ModuleTreeSectionDto[] | null | undefined
  handleAdd: (parentId: string, nodeType: ContentNodeType) => void
  handleNodeSelect: (nodeData: ContentNode) => void
}

function CMSContentTree({
  moduleTree,
  handleAdd,
  handleNodeSelect,
}: ContentTreeProps) {
  const { editorState } = useEditorState()
  // Handle node selection and trigger onChange
  const handleNodeRowSelect = (node: CourseNodeModel) => {
    if (node.data?.type === 'add-button') return

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
              handleAdd={handleAdd}
              handleNodeSelect={handleNodeRowSelect}
            />
          )}
        />
      </Stack>
    </DndProvider>
  )
}

// Get appropriate icon for node type
function CMSNodeIcon({
  type,
  size = 16,
}: {
  type: ContentNodeType | 'add-button'
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
  handleAdd: (parentId: string, nodeType: ContentNodeType) => void
  handleNodeSelect: (node: CourseNodeModel) => void
}

function CMSNodeRow({
  node,
  depth,
  isOpen,
  isDropTarget,
  isSelected,
  onToggle,
  handleAdd,
  handleNodeSelect,
}: NodeRowProps) {
  const theme = useMantineTheme()

  // Calculate proper indentation (20px per level)
  const indentSize = depth * 20

  if (node.data?.type === 'add-button') {
    return (
      <Box pl={indentSize + 24} py={2}>
        <Button
          variant="transparent"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            handleAdd(node.parent as string, getTypeFromLevel(node.data?.level))
          }
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
          <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}
