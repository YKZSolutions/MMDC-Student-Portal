import { createFileRoute } from '@tanstack/react-router'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  Select,
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
  IconPlus,
  IconRubberStamp,
  IconTrash,
} from '@tabler/icons-react'
import CourseTree from '@/features/courses/course-editor/course-tree.tsx'
import { EditorWithPreview } from '@/components/editor-w-preview.tsx'
import { useEffect, useState } from 'react'
import {
  type ContentNode,
  type ContentNodeType,
  mockContentNodes,
} from '@/features/courses/modules/types.ts'
import {
  mockCourseBasicDetails,
  mockInitialContent,
} from '@/features/courses/mocks.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'

export const Route = createFileRoute('/(protected)/cms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CMS />
}

interface EditorState {
  type: ContentNodeType
  data: ContentNode | null
  parentId: string | null
  mode: 'create' | 'edit' | 'preview'
}

type CMSProps = {
  courseCode?: string
}

const CMS = ({ courseCode }: CMSProps) => {
  const theme = useMantineTheme()
  const [isTreeVisible, setIsTreeVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [courseDetails, setCourseDetails] = useState<CourseBasicDetails>()

  useEffect(() => {
    //TODO: fetch course details from API
    if (courseCode) {
      setCourseDetails(
        mockCourseBasicDetails.find(
          (course) => course.courseCode === courseCode,
        ),
      )
    }
  }, [courseCode])

  const [courseData, setCourseData] = useState<ContentNode[]>(mockContentNodes)

  const [editorState, setEditorState] = useState<EditorState>({
    type: 'module',
    data: null,
    parentId: null,
    mode: 'create',
  })

  const handleAdd = (parentId: string = 'root', newType?: ContentNodeType) => {
    setEditorState({
      type: newType || 'module',
      data: null,
      parentId,
      mode: 'create',
    })
  }

  const handleEdit = (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: ContentNode,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      mode: 'edit',
    })
  }

  const handlePreview = (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: ContentNode,
  ) => {
    setEditorState({
      type: nodeType,
      data: nodeData,
      parentId: null,
      mode: 'preview',
    })
  }

  const handleSave = (data: ContentNode) => {
    console.log('Saving data:', data)
    // TODO: update state or make an API call
    setCourseData((prev) =>
      prev.map((item) => (item.id === data.id ? data : item)),
    )
  }

  const handleUpdateContent = (content: string) => {}

  return (
    <Box h={'100%'} w={'100%'}>
      <Stack flex={'1 0 auto'} h={'100%'} w={'100%'} gap={0}>
        <Group
          justify="space-between"
          align="center"
          w={'100%'}
          pb={'sm'}
          style={{ borderBottom: `2px solid ${theme.colors.gray[3]}` }}
        >
          <Select
            data={mockCourseBasicDetails.map((course) => course.courseName)}
            value={courseDetails?.courseName}
            onChange={(value) => {
              const course = mockCourseBasicDetails.find(
                (course) => course.courseName === value,
              )
              if (course) {
                setCourseDetails(course)
              }
            }}
            searchable={true}
          />
          <Title order={3} c={'gray.7'}>
            {courseDetails?.courseCode ? `[${courseDetails?.courseCode}]` : ''}{' '}
            {courseDetails?.courseName}{' '}
            {editorState.data && ` | ${editorState.data.title} `}
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
        <PanelGroup direction="horizontal" style={{ height: '100%' }}>
          <Stack gap={'xs'} p={'xs'} style={{ height: '100%' }}>
            <ActionIcon
              onClick={() => setIsTreeVisible(!isTreeVisible)}
              bg={isTreeVisible ? 'dark.3' : 'transparent'}
            >
              <IconListTree
                size={18}
                color={isTreeVisible ? `white` : 'gray'}
              />
            </ActionIcon>
          </Stack>
          <Divider orientation="vertical" />
          <Panel hidden={!isTreeVisible} minSize={0} defaultSize={20}>
            <Box mt={'xs'}>
              <Container>
                <Group
                  justify="space-between"
                  align="center"
                  mb="md"
                  wrap={'nowrap'}
                >
                  <Title order={4} textWrap={'nowrap'}>
                    Course Structure
                  </Title>
                  <Button
                    variant="default"
                    radius={'md'}
                    leftSection={<IconPlus size={18} />}
                    onClick={() => handleAdd()}
                  >
                    Add Module
                  </Button>
                </Group>

                <CourseTree
                  onAddButtonClick={handleAdd}
                  onEditButtonClick={handleEdit}
                  courseData={courseData}
                />
              </Container>
            </Box>
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
            <Box
              h="100%"
              style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <EditorWithPreview
                content={JSON.stringify(mockInitialContent)}
                onUpdate={(newContent) => console.log('Updated:', newContent)}
              />
            </Box>
          </Panel>
        </PanelGroup>
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
      </Stack>
    </Box>
  )
}
