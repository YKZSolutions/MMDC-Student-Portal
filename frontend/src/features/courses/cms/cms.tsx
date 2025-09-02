import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import {
  IconCalendar,
  IconChevronDown,
  IconGripVertical,
  IconListTree,
  IconRubberStamp,
  IconTrash,
} from '@tabler/icons-react'
import {
  mockCourseBasicDetails,
  mockInitialContent,
} from '@/features/courses/mocks.ts'
import {
  type EditorState,
  useEditorState,
} from '@/features/courses/hooks/useEditorState.ts'
import { useCourseData } from '@/features/courses/hooks/useCourseData.ts'
import type {
  ContentNode,
  ContentNodeType,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import CourseTree from '@/features/courses/cms/course-tree.tsx'
import { EditorWithPreview } from '@/components/editor-w-preview.tsx'
import { CourseSelector } from '@/features/courses/cms/course-selector.tsx'

type CMSProps = {
  courseCode?: string
}

export const CMS = ({ courseCode }: CMSProps) => {
  const theme = useMantineTheme()
  const [isTreeVisible, setIsTreeVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const { courseDetails, setCourseDetails, courseData, updateCourseData } =
    useCourseData(courseCode)
  const { editorState, handleAdd, handleEdit, handlePreview } = useEditorState()

  const handleSave = (data: ContentNode) => {
    console.log('Saving data:', data)
    updateCourseData(data)
  }

  const handleCourseChange = (course: CourseBasicDetails | undefined) => {
    setCourseDetails(course)
  }

  return (
    <Box h={'100%'} w={'100%'}>
      <PanelGroup direction="horizontal" style={{ height: '100%' }}>
        <Panel hidden={!isTreeVisible} minSize={15} defaultSize={20}>
          <SidePanel
            courseDetails={courseDetails}
            courses={mockCourseBasicDetails}
            courseData={courseData}
            isTreeVisible={isTreeVisible}
            onCourseChange={handleCourseChange}
            onToggleTree={() => setIsTreeVisible(!isTreeVisible)}
            onAddContent={handleAdd}
            onEdit={handleEdit}
          />
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
          hidden={!isTreeVisible}
        >
          <IconGripVertical size={16} />
        </PanelResizeHandle>

        <Panel defaultSize={70} minSize={50}>
          <Stack flex={'1 0 auto'} h={'100%'} w={'100%'} gap={0}>
            <CMSHeader
              courseDetails={courseDetails}
              courses={mockCourseBasicDetails}
              editorState={editorState}
              isTreeVisible={isTreeVisible}
              onCourseChange={handleCourseChange}
              onToggleTree={() => setIsTreeVisible(!isTreeVisible)}
              onAddContent={() => handleAdd()}
            />

            <Box
              h="100%"
              style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <EditorWithPreview
                content={JSON.stringify(mockInitialContent)}
                onUpdate={(newContent) => console.log('Updated:', newContent)}
              />
            </Box>
          </Stack>
        </Panel>
      </PanelGroup>

      <StatusBar editorState={editorState} />
    </Box>
  )
}

interface TreeToggleButtonProps {
  isVisible: boolean
  onToggle: () => void
}

export const TreeToggleButton = ({
  isVisible,
  onToggle,
}: TreeToggleButtonProps) => {
  return (
    <ActionIcon onClick={onToggle} bg={isVisible ? 'dark.3' : 'transparent'}>
      <IconListTree size={18} color={isVisible ? 'white' : 'gray'} />
    </ActionIcon>
  )
}

interface CMSHeaderProps {
  courseDetails?: CourseBasicDetails
  courses: CourseBasicDetails[]
  editorState: EditorState
  isTreeVisible: boolean
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onToggleTree: () => void
  onAddContent: () => void
}

const CMSHeader = ({
  courseDetails,
  courses,
  editorState,
  isTreeVisible,
  onCourseChange,
  onToggleTree,
  onAddContent,
}: CMSHeaderProps) => {
  const theme = useMantineTheme()

  return (
    <Group
      justify="space-between"
      align="center"
      w={'100%'}
      pb={'sm'}
      style={{ borderBottom: `2px solid ${theme.colors.gray[3]}` }}
    >
      <Group gap={'md'} display={isTreeVisible ? 'none' : 'flex'}>
        <TreeToggleButton isVisible={isTreeVisible} onToggle={onToggleTree} />
        <CourseSelector
          courses={courses}
          selectedCourse={courseDetails}
          onCourseChange={onCourseChange}
          onAddContent={onAddContent}
          showAddButton={false}
        />
      </Group>

      <Title order={3} c={'gray.7'}>
        {courseDetails?.courseCode ? `[${courseDetails?.courseCode}]` : ''}{' '}
        {courseDetails?.courseName}{' '}
        {editorState.data && ` | ${editorState.data.title} `}
      </Title>

      <ActionMenu />
    </Group>
  )
}

export const ActionMenu = () => {
  const theme = useMantineTheme()

  return (
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
              <IconTrash size={16} stroke={1.5} color={theme.colors.red[5]} />
            }
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

interface StatusBarProps {
  editorState: EditorState
}

export const StatusBar = ({ editorState }: StatusBarProps) => {
  const theme = useMantineTheme()

  return (
    <Group
      justify={'space-between'}
      style={{
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        padding: theme.spacing.xs,
        backgroundColor: theme.white,
      }}
    >
      <Text size="sm" c="dimmed">
        {editorState.mode === 'edit' ? 'Editing' : 'Creating'}{' '}
        {editorState.type}
      </Text>
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

interface SidePanelProps {
  courseDetails?: CourseBasicDetails
  courses: CourseBasicDetails[]
  courseData: ContentNode[]
  isTreeVisible: boolean
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onToggleTree: () => void
  onAddContent: (parentId?: string, newType?: ContentNodeType) => void
  onEdit: (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: ContentNode,
  ) => void
}

export const SidePanel = ({
  courseDetails,
  courses,
  courseData,
  isTreeVisible,
  onCourseChange,
  onToggleTree,
  onAddContent,
  onEdit,
}: SidePanelProps) => {
  return (
    <Box mt={'xs'}>
      <Container>
        <Group align="center" mb="md" gap={'xs'}>
          <TreeToggleButton isVisible={isTreeVisible} onToggle={onToggleTree} />
          <Text fw={500}>Course Structure</Text>
        </Group>

        <CourseSelector
          courses={courses}
          selectedCourse={courseDetails}
          onCourseChange={onCourseChange}
          onAddContent={() => onAddContent()}
        />

        <CourseTree
          onAddButtonClick={onAddContent}
          onEditButtonClick={onEdit}
          courseData={courseData}
        />
      </Container>
    </Box>
  )
}
