import type { CourseBasicDetails } from '@/features/courses/types.ts'
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconBook, IconPlus } from '@tabler/icons-react'
import React from 'react'
import { useDisclosure } from '@mantine/hooks'

interface CourseSelectorProps {
  courses: CourseBasicDetails[]
  selectedCourse?: CourseBasicDetails
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onAddContent?: () => void
  showAddButton?: boolean
}

const CourseSelector = ({
  courses,
  selectedCourse,
  onCourseChange,
  onAddContent,
  showAddButton = true,
}: CourseSelectorProps) => {
  return (
    <Group align="center" mb="md" wrap={'nowrap'}>
      <Select
        data={courses.map((course) => course.courseName)}
        value={selectedCourse?.courseName}
        onChange={(value) => {
          const course = courses.find((c) => c.courseName === value)
          onCourseChange(course)
        }}
        leftSection={<IconBook size={24} />}
        searchable={true}
        flex={1}
      />
      {showAddButton && (
        <Tooltip label={'Add Content'}>
          <ActionIcon
            variant="default"
            radius={'sm'}
            size={32}
            onClick={onAddContent}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  )
}

type CourseSelectorModalProps = {
  onProceed: (courseCode: string) => void
} & CourseSelectorProps

const CourseSelectorModal = ({
  courses,
  selectedCourse,
  onCourseChange,
  onAddContent,
  showAddButton = false,
  onProceed,
}: CourseSelectorModalProps) => {
  const [opened, { open, close }] = useDisclosure(true)
  return (
    <Modal
      title={'Select Course'}
      size={'md'}
      radius={'md'}
      centered
      opened={opened}
      onClose={close}
    >
      <Container h="100%" p="lg">
        <Stack ta="center" h="100%" gap="lg" align={'center'} mb={'md'}>
          <Title order={3}>Select A Course</Title>
          <Text c="dimmed" mb="sm">
            Select the course you want to manage content for.
          </Text>
          <Stack gap="md" maw={300}>
            <Select
              label="Course"
              placeholder="Select a course"
              data={courses.map((course) => course.courseName)}
              value={selectedCourse?.courseName}
              searchable
              onChange={(value) => {
                const course = courses.find((c) => c.courseName === value)
                onCourseChange(course)
              }}
              allowDeselect={false}
              size="md"
              radius="md"
              inputSize="md"
              labelProps={{
                fz: '1.25rem',
                fw: 600,
              }}
            />
            <Button
              onClick={() =>
                onProceed((selectedCourse as CourseBasicDetails).courseCode)
              }
            >
              Proceed
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}

export { CourseSelector, CourseSelectorModal }
