import React, { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  SegmentedControl,
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
  type EditorView,
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
import ContentDetailsEditor from '@/features/courses/cms/content-details-editor.tsx'

type CMSProps = {
  courseCode?: string
}

export const CMS = ({ courseCode }: CMSProps) => {
  const theme = useMantineTheme()
  const [isTreeVisible, setIsTreeVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const {
    courseDetails,
    setCourseDetails,
    courseData,
    updateCourseData,
    updateCourseContent,
  } = useCourseData(courseCode)

  const { editorState, handleAdd, handleUpdate, handlePreview, setView } =
    useEditorState()

  const handleCourseChange = (course: CourseBasicDetails | undefined) => {
    setCourseDetails(course)
    setIsTreeVisible(true)
  }

  const View = () => {
    switch (editorState.view) {
      case 'detail': {
        return (
          <ContentDetailsEditor
            opened={true}
            type={editorState.type as ContentNodeType}
            data={editorState.data}
            onSave={(nodeData) => {
              updateCourseData(nodeData)
              handleUpdate(editorState.type, nodeData, editorState.view)
            }}
            p={'xl'}
            style={{
              overflowY: 'auto',
              scrollbarGutter: 'stable',
            }}
          />
        )
      }
      case 'content':
        return (
          <EditorWithPreview
            content={JSON.stringify(mockInitialContent)}
            onUpdate={(newContent) => {
              updateCourseContent(newContent, editorState.data?.id)
              handleUpdate(
                editorState.type,
                courseData.find((n) => n.id === editorState.data?.id)!,
                editorState.view,
              )
            }}
          />
        )
      case 'preview':
        return (
          <EditorWithPreview
            content={JSON.stringify(mockInitialContent)}
            onUpdate={(newContent) => console.log('Updated:', newContent)}
          />
        )
    }
  }

  return (
    <Box h={'100%'} w={'100%'} style={{ overflow: 'hidden' }}>
      <PanelGroup direction="horizontal">
        <Panel hidden={!isTreeVisible} minSize={15} defaultSize={20}>
          <SidePanel
            courseDetails={courseDetails}
            courses={mockCourseBasicDetails}
            courseData={courseData}
            isTreeVisible={isTreeVisible}
            onCourseChange={handleCourseChange}
            onToggleTree={() => setIsTreeVisible(!isTreeVisible)}
            onAddContent={handleAdd}
            onNodeChange={(nodeData) => {
              handleUpdate(editorState.type, nodeData, editorState.view)
            }}
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
              contentTitle={editorState.data?.title}
              isTreeVisible={isTreeVisible}
              onCourseChange={handleCourseChange}
              onToggleTree={() => setIsTreeVisible(!isTreeVisible)}
              onAddContent={() => handleAdd()}
              view={editorState.view}
              onViewChange={(view) => setView(view as EditorView)}
            />

            <Box
              h="100%"
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <View />
            </Box>
          </Stack>
        </Panel>
      </PanelGroup>

      <StatusBar />
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
    <ActionIcon onClick={onToggle} bg={isVisible ? 'blue.3' : 'gray.3'}>
      <IconListTree size={18} color={isVisible ? 'white' : 'gray'} />
    </ActionIcon>
  )
}

interface CMSHeaderProps {
  courseDetails?: CourseBasicDetails
  courses: CourseBasicDetails[]
  isTreeVisible: boolean
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onToggleTree: () => void
  onAddContent: () => void
  contentTitle?: string
  view: string
  onViewChange: (view: string) => void
}

const CMSHeader = ({
  courseDetails,
  courses,
  isTreeVisible,
  onCourseChange,
  onToggleTree,
  onAddContent,
  contentTitle,
  view,
  onViewChange,
}: CMSHeaderProps) => {
  const theme = useMantineTheme()

  return (
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
          display={isTreeVisible ? 'none' : 'flex'}
          align={'center'}
        >
          <TreeToggleButton isVisible={isTreeVisible} onToggle={onToggleTree} />
          <CourseSelector
            courses={courses}
            selectedCourse={courseDetails}
            onCourseChange={onCourseChange}
            onAddContent={onAddContent}
            showAddButton={false}
          />
        </Group>

        <SegmentedControl
          value={view}
          onChange={onViewChange}
          data={[
            { label: 'Details', value: 'detail' },
            { label: 'Content', value: 'content', disabled: true },
            { label: 'Preview', value: 'preview', disabled: true },
          ]}
        />
      </Group>

      <Title order={2} c={'gray.7'}>
        {courseDetails?.courseCode ? `[${courseDetails?.courseCode}]` : ''}{' '}
        {courseDetails?.courseName} {contentTitle && ` | ${contentTitle} `}
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

interface StatusBarProps {}

export const StatusBar = ({}: StatusBarProps) => {
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

interface SidePanelProps {
  courseDetails?: CourseBasicDetails
  courses: CourseBasicDetails[]
  courseData: ContentNode[]
  isTreeVisible: boolean
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onNodeChange: (nodeData: ContentNode) => void
  onToggleTree: () => void
  onAddContent: (parentId?: string, newType?: ContentNodeType) => void
}

export const SidePanel = ({
  courseDetails,
  courses,
  courseData,
  isTreeVisible,
  onCourseChange,
  onNodeChange,
  onToggleTree,
  onAddContent,
}: SidePanelProps) => {
  return (
    <Box mt={'md'}>
      <Container>
        <Stack gap={'xs'} mb={'xs'}>
          <Group align="center" gap={'xs'}>
            <TreeToggleButton
              isVisible={isTreeVisible}
              onToggle={onToggleTree}
            />
            <Text fw={500}>Course Structure</Text>
          </Group>

          <CourseSelector
            courses={courses}
            selectedCourse={courseDetails}
            onCourseChange={onCourseChange}
            onAddContent={() => onAddContent()}
          />
        </Stack>

        <CourseTree
          onAddButtonClick={onAddContent}
          courseData={courseData}
          onNodeChange={onNodeChange}
        />
      </Container>
    </Box>
  )
}
