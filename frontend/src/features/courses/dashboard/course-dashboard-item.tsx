import { useAuth } from '@/features/auth/auth.hook.ts'
import type { ClassMeeting } from '@/features/courses/types.ts'
import type {
  CourseDto,
  DetailedCourseSectionDto,
} from '@/integrations/api/client'
import { formatDaysAbbrev } from '@/utils/formatters'
import {
  ActionIcon,
  Box,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  rem,
  RingProgress,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import {
  IconCalendar,
  IconDotsVertical,
  IconEdit,
  IconVideo,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

interface CourseDashboardItemProps {
  course: CourseDto
  section: DetailedCourseSectionDto
  currentMeeting?: ClassMeeting
  url: string
}

function CourseCard({
  course,
  section,
  currentMeeting,
  url,
}: CourseDashboardItemProps) {
  const theme = useMantineTheme()
  const navigate = useNavigate()
  const sectionName = section.name
  const sectionInitial = sectionName.charAt(0)

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      miw={rem(260)}
      maw={rem('32%')}
      w={'100%'}
      role="button"
      onClick={() =>
        navigate({
          to: `/courses/${section.id}`,
        })
      }
      style={{
        cursor: 'pointer',
      }}
      className="drop-shadow-xs hover:drop-shadow-sm"
    >
      {/* Header block */}
      <Flex pos="relative">
        <Image
          src="https://images.unsplash.com/vector-1738590592643-6c848d2a02f2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Norway"
          miw="100%"
          mah={rem(100)}
        />

        {/* Avatar/Initial badge (section initial) */}
        <Box
          pos={'absolute'}
          right={rem(16)}
          bottom={rem(-24)}
          w={rem(48)}
          h={rem(48)}
          bg={theme.colors.orange[7]}
          bd={'2px solid white'}
          bdrs={'50%'}
          style={{
            zIndex: 2,
          }}
        >
          <Flex justify="center" align="center" w="100%" h="100%">
            <Text fw={700} fz={'xl'} c={'white'} tt={'capitalize'}>
              {sectionInitial}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Main content area */}
      <Box p="md" style={{ minHeight: rem(120) }} c={'dark.6'}>
        <Title order={4} lineClamp={1} style={{ fontWeight: 700 }}>
          {course.name}
        </Title>
        <Group gap={rem(5)}>
          <Text size="sm" fw={500}>
            {course.courseCode}
          </Text>
          <Text c={'gray.7'}>•</Text>
          <Text size="sm" fw={500}>
            {sectionName}
          </Text>
        </Group>

        <Text fw={400} size={'sm'} c={theme.colors.dark[3]}>
          {formatDaysAbbrev(section.days)} | {section.startSched} -{' '}
          {section.endSched}
        </Text>
      </Box>

      {/* Actions row */}
      <Divider />
      <Group justify="space-between" p={'xs'} align="center">
        <Group gap={rem(5)}>
          <RingProgress
            size={30}
            thickness={3}
            sections={[
              {
                // value: course.courseProgress * 100,
                value: 60,
                color: theme.colors.blue[5],
              },
            ]}
          />
          <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
            {/* {course.courseProgress * 100}% */}
            60%
          </Text>
        </Group>

        <CourseCardActionButton
          courseCode={section.id}
          currentMeeting={currentMeeting}
        />
      </Group>
    </Card>
  )
}

function CourseListRow({
  course,
  section,
  currentMeeting,
  url,
}: CourseDashboardItemProps) {
  const theme = useMantineTheme()
  const navigate = useNavigate()

  return (
    <Card
      radius="md"
      p={'lg'}
      withBorder
      className={'drop-shadow-xs hover:drop-shadow-sm cursor-pointer'}
      w={'100%'}
      onClick={() => navigate({ to: url })}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs" justify="center">
          <Title order={4} lineClamp={1} c="dark.7">
            {course.name}
          </Title>
          <Group gap={rem(5)} c="dark.3">
            <Text size="sm">{course.courseCode}</Text>
            <Text size="sm">• {section.name}</Text>
            <Group gap={5}>
              <IconCalendar size={14} />
              <Text size="sm">
                {formatDaysAbbrev(section.days)} | {section.startSched} -{' '}
                {section.endSched}
              </Text>
            </Group>
          </Group>
        </Stack>
        <Stack align="end">
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={course.courseCode}
          />
          <Group gap={rem(5)}>
            <RingProgress
              size={30}
              thickness={3}
              sections={[
                {
                  // value: course.courseProgress * 100,
                  value: 60,
                  color: theme.colors.blue[5],
                },
              ]}
            />
            <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
              {/* {course.courseProgress * 100}% */}
              60%
            </Text>
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

function CourseCardActionButton({
  currentMeeting,
  courseCode,
}: CourseCardActionButtonProps) {
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()
  return (
    <Group ml={'auto'}>
      <ActionIcon
        variant="subtle"
        color="primary"
        radius={'lg'}
        size={'lg'}
        p={rem(5)}
        disabled={authUser.role === 'student' ? !currentMeeting : false}
        onClick={(e) => {
          e.stopPropagation()
          authUser.role === 'student'
            ? window.open(currentMeeting?.meetingLink!, '_blank')
            : navigate({
                to: `/courses/${courseCode}/modules`,
              })
        }}
      >
        {authUser.role === 'student' ? <IconVideo /> : <IconEdit />}
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        radius={'lg'}
        size={'lg'}
        p={rem(5)}
        c={'gray.6'}
      >
        <IconCalendar />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        radius={'lg'}
        size={'lg'}
        p={rem(5)}
        c={'gray.6'}
      >
        <IconDotsVertical />
      </ActionIcon>
    </Group>
  )
}

export { CourseCard, CourseListRow }
