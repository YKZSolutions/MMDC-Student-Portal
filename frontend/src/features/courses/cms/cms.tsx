import RichTextEditor from '@/components/rich-text-editor.tsx'
import { useCourseData } from '@/features/courses/hooks/useCourseData.ts'
import {
  EditorProvider,
  type EditorView,
  editorViewOptions,
  useEditorState,
} from '@/features/courses/hooks/useEditorState.tsx'
import {
  mockCourseBasicDetails,
  mockInitialContent,
} from '@/features/courses/mocks.ts'
import ModuleContentView from '@/features/courses/modules/content/module-content-view.tsx'
import type {
  ContentNode,
  ContentNodeType,
  CourseNodeModel,
  Module,
  ModuleItem,
  ModuleSection,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { capitalizeFirstLetter } from '@/utils/formatters'
import {
  convertModuleToTreeData,
  getTypeFromLevel,
  injectAddButtons,
} from '@/utils/helpers'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
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
  IconGripVertical,
  IconList,
  IconListTree,
  IconPlus,
  IconRubberStamp,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

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

  const [isTreeVisible, setIsTreeVisible] = useState(viewMode === 'full')
  const [isDragging, setIsDragging] = useState(false)

  const { courseDetails, setCourseDetails, module } = useCourseData(courseCode)

  const { editorState, handleAdd, handleUpdate } = useEditorState()

  const handleCourseChange = (course: CourseBasicDetails | undefined) => {
    setCourseDetails(course)
    setIsTreeVisible(true)
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
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={50}>
          <Stack flex={'1 0 auto'} h={'100%'} w={'100%'} gap={0}>
            <Group
              justify="space-between"
              align="center"
              w={'100%'}
              style={{ borderBottom: `2px solid ${theme.colors.gray[3]}` }}
              p={'xs'}
            >
              <Group>
                <Group
                  gap={'md'}
                  display={
                      isTreeVisible || viewMode === 'editor' ? 'none' : 'flex'
                    }
                  align={'center'}
                >
                  <CMSCourseSelector
                    courses={mockCourseBasicDetails}
                    selectedCourse={courseDetails}
                    handleCourseChange={handleCourseChange}
                  />
                </Group>
                <ActionIcon
                  variant={'transparent'}
                  hidden={viewMode !== 'editor'}
                  onClick={() => window.history.back()}
                >
                  <IconX />
                </ActionIcon>

                <SegmentedControl
                  defaultValue={editorState.view}
                  value={editorState.view}
                  onChange={(view) =>
                    handleSegmentedControl(view as EditorView)
                  }
                  data={editorViewOptions}
                />
              </Group>

              <Title order={3} c={'gray.7'} maw={'65%'} lineClamp={1}>
                {courseDetails?.courseCode
                  ? `[${courseDetails?.courseCode}]`
                  : ''}{' '}
                {courseDetails?.courseName}{' '}
                {/* {editorState.data?.title && ` | ${editorState.data.title} `} */}
              </Title>

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
        </Panel>

        <PanelResizeHandle
          onDragging={setIsDragging}
          style={{
            backgroundColor: isDragging
              ? theme.colors.blue[2]
              : theme.colors.gray[0],
            borderRight: `1px solid ${theme.colors.gray[3]}`,
            borderLeft: `1px solid ${theme.colors.gray[3]}`,
            cursor: 'col-resize',
            transition: 'background-color 0.3s ease',
            width: '10px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hidden={!isTreeVisible || viewMode === 'editor'}
        >
          <IconGripVertical size={16} />
        </PanelResizeHandle>

        <Panel
          hidden={!isTreeVisible || viewMode === 'editor'}
          minSize={15}
          defaultSize={20}
        >
          <Box py={'md'} h={'100%'}>
            <Container
              flex={'1 0 auto'}
              h={'100%'}
              style={{ overflow: 'auto' }}
            >
              <Stack gap={'xs'} mb={'xs'}>
                <Group align="center" gap={'xs'}>
                  <ActionIcon
                    onClick={() => setIsTreeVisible(!isTreeVisible)}
                    bg={isTreeVisible ? 'blue.3' : 'gray.3'}
                  >
                    <IconListTree
                      size={18}
                      color={isTreeVisible ? 'white' : 'gray'}
                    />
                  </ActionIcon>
                  <Text fw={500}>Course Structure</Text>
                </Group>

                <CMSCourseSelector
                  courses={mockCourseBasicDetails}
                  selectedCourse={courseDetails}
                  handleCourseChange={handleCourseChange}
                />
              </Stack>

              <CMSContentTree
                handleAdd={handleAdd}
                module={module}
                handleNodeSelect={(nodeData) => {
                  handleUpdate(editorState.type, nodeData, editorState.view)
                }}
              />
            </Container>
          </Box>
        </Panel>
      </PanelGroup>

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

  console.log('editorState', editorState)
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
  module: Module
  handleAdd: (parentId: string, nodeType: ContentNodeType) => void
  handleNodeSelect: (nodeData: ContentNode) => void
}

function CMSContentTree({
  module,
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
          tree={injectAddButtons(convertModuleToTreeData(module))}
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
            handleAdd(
              node.parent as string,
              getTypeFromLevel(node.data?.level),
            )
          }
          style={{
            color: theme.colors.blue[6],
            fontStyle: 'italic',
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
      gap={0}
      wrap="nowrap"
      style={{
        paddingLeft: indentSize,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: isSelected
          ? theme.colors.blue[0]
          : isDropTarget
            ? theme.colors.gray[1]
            : 'transparent',
        borderRadius: 4,
        border: isDropTarget
          ? `2px solid ${theme.colors.blue[4]}`
          : '2px solid transparent',
        cursor: 'pointer',
        margin: '1px 0',
      }}
      onClick={() => handleNodeSelect(node)}
    >
      {/* Toggle button or spacer */}
      <Box
        w={24}
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
      <Box mr="xs" style={{ display: 'flex', alignItems: 'center' }}>
        <CMSNodeIcon type={node.data?.type || 'item'} size={16} />
      </Box>

      {/* Node text */}
      <Text
        fw={400}
        size="sm"
        lh="sm"
        truncate
        style={{
          flex: 1,
          color: isSelected ? theme.colors.blue[7] : 'inherit',
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
