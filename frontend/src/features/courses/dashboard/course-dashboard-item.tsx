import type {
  ClassMeeting,
  Course,
  EnrolledCourse,
} from '@/features/courses/types.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  Card,
  Flex,
  Group,
  Image,
  Progress,
  RingProgress,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { IconDeviceDesktop, IconVideo } from '@tabler/icons-react'
import CourseDashboardQuickActions from './course-dashboard-quick-actions'
import { useState } from 'react'

interface CourseDashboardItemProps {
  course: Course | EnrolledCourse
  currentMeeting?: ClassMeeting
  url: string
}

const CourseCard = ({
  course,
  currentMeeting,
  url,
}: CourseDashboardItemProps) => {
  const theme = useMantineTheme()
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  return (
    <Card
      withBorder
      radius="md"
      p="xs"
      className={'drop-shadow-sm hover:drop-shadow-lg'}
      style={{
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate({ to: url })}
    >
      {/*Image*/}
      <Flex pos="relative">
        <Image
          src="https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Norway"
          radius="md"
          miw="100%"
          h="5.375rem"
        />
        <Text
          pos="absolute"
          top="4px"
          left="4px"
          size="0.625em"
          fw={500}
          c="white"
          px="sm"
          py="xs"
          bdrs="md"
          bg="black"
          opacity={0.75}
        >
          {course.courseCode}
          {'section' in course && ` • ${course.section.sectionName}`}
        </Text>
      </Flex>
      {/*Course Details*/}
      <Group justify="space-between" wrap="nowrap" mt="xs">
        <Stack gap={'md'} w={'16rem'} px={'xs'}>
          <Stack mt={'xs'}>
            <Tooltip label={course.courseName}>
              <Title
                order={3}
                w={'100%'}
                lineClamp={1}
                c={theme.primaryColor}
                style={{
                  textDecoration: hovered ? 'underline' : 'none',
                }}
              >
                {course.courseName}
              </Title>
            </Tooltip>
            {'section' in course && (
              <Text fw={400} size={'sm'} c={theme.colors.dark[3]}>
                {course.section.sectionSchedule.day}{' '}
                {course.section.sectionSchedule.time}
              </Text>
            )}
          </Stack>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={course.courseCode}
          />
          <Group justify="space-between">
            <Group gap="0.25rem">
              {'courseProgress' in course && (
                <>
                  <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                    Completed
                  </Text>
                  <Group gap="0">
                    <RingProgress
                      size={20}
                      thickness={3}
                      sections={[
                        {
                          value: course.courseProgress * 100,
                          color: theme.colors.blue[5],
                        },
                      ]}
                    />
                    <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                      {course.courseProgress * 100}%
                    </Text>
                  </Group>
                </>
              )}
            </Group>
            <CourseDashboardQuickActions />
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

const CourseListRow = ({
  course,
  currentMeeting,
  url,
}: CourseDashboardItemProps) => {
  const theme = useMantineTheme()
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <Card
      radius="md"
      p="0"
      px={'md'}
      className={'drop-shadow-sm hover:drop-shadow-lg'}
      w={'100%'}
      style={{
        borderLeft: `4px solid ${theme.colors.primary[0]}`,
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate({ to: url })}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack w={'65%'} p={'xs'} justify={'space-between'}>
          <Group gap={'xs'}>
            <Title
              order={3}
              lineClamp={1}
              c={'primary'}
              style={{
                textDecoration: hovered ? 'underline' : 'none',
              }}
            >
              {course.courseName}
            </Title>
            <CourseDashboardQuickActions />
          </Group>
          <Text fw={400} size={'sm'} c={'dark.3'}>
            {course.courseCode}{' '}
            {'section' in course && (
              <>
                • {course.section.sectionName} |{' '}
                {course.section.sectionSchedule.day}{' '}
                {course.section.sectionSchedule.time}
              </>
            )}
          </Text>
        </Stack>
        <Stack w={'30%'} p={'xs'} justify={'space-between'}>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={course.courseCode}
          />
          <Group gap="xs">
            <Text fw={500} size={'xs'} c={'dark.3'}>
              Completed:
            </Text>
            <Progress color={'blue.5'} value={50} w={'50%'} />
            {'courseProgress' in course && (
              <Text fw={500} size={'xs'} c={'dark.3'}>
                {course.courseProgress * 100}%
              </Text>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

type CourseCardActionButtonProps = {
  currentMeeting?: ClassMeeting
  courseCode: string
}
const CourseCardActionButton = ({
  currentMeeting,
  courseCode,
}: CourseCardActionButtonProps) => {
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()
  return (
    <Button
      leftSection={
        authUser.role === 'student' ? (
          <IconVideo size={16} />
        ) : (
          <IconDeviceDesktop size={16} />
        )
      }
      size="xs"
      radius="xl"
      variant="filled"
      disabled={authUser.role === 'student' ? !currentMeeting : false}
      onClick={(e) => {
        e.stopPropagation()
        authUser.role === 'student'
          ? window.open(currentMeeting?.meetingLink!, '_blank')
          : navigate({
              from: '/cms',
              to: '/cms/$courseCode',
              params: { courseCode },
            })
      }}
    >
      {authUser.role === 'student'
        ? 'Join Meeting'
        : authUser.role === 'mentor'
          ? 'Start Meeting'
          : 'Manage Content'}
    </Button>
  )
}

export { CourseCard, CourseListRow }
