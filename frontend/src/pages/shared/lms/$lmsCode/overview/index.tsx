import {
  lmsControllerFindModuleTreeOptions,
  lmsControllerFindOneOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import type { ModuleTreeSectionDto, UserDto } from '@/integrations/api/client'
import { formatDaysAbbrev, formatToSchoolYear } from '@/utils/formatters'
import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconBook2,
  IconCalendarWeek,
  IconChecklist,
  IconClockHour4,
  IconUserSquareRounded,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/lms/$lmsCode/_layout/overview/')

function countSectionContents(sections: ModuleTreeSectionDto[]): number {
  return sections.reduce((total, section) => {
    const sectionContents = section.moduleContents?.length || 0
    const subsectionContents = countSectionContents(section.subsections || [])
    return total + sectionContents + subsectionContents
  }, 0)
}

function flattenSections(sections: ModuleTreeSectionDto[]): ModuleTreeSectionDto[] {
  return sections.flatMap((section) => [
    section,
    ...flattenSections(section.subsections || []),
  ])
}

const CourseOverview = () => {
  const { lmsCode } = route.useParams()

  const { data: moduleData } = useSuspenseQuery(
    lmsControllerFindOneOptions({
      path: { id: lmsCode },
    }),
  )

  const { data: moduleTree } = useSuspenseQuery(
    lmsControllerFindModuleTreeOptions({
      path: { id: lmsCode },
    }),
  )

  const course = moduleData.course
  const courseOffering = moduleData.courseOffering
  const enrollmentPeriod = courseOffering?.enrollmentPeriod
  const moduleSections = moduleTree.moduleSections || []
  const allSections = flattenSections(moduleSections)

  const mentorsById = new Map<string, UserDto>(
    (courseOffering?.courseSections || [])
      .filter((section) => section.mentor)
      .map((section) => [section.mentor!.id, section.mentor!]),
  )
  const mentors = [...mentorsById.values()]

  const totalContentItems = countSectionContents(moduleSections)

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="start">
        <Stack gap={4}>
          <Title order={2}>Course Overview</Title>
          <Text c="dimmed">
            Course details, syllabus snapshot, and mentor information
          </Text>
        </Stack>
        {enrollmentPeriod && (
          <Badge variant="light">
            {`Term ${enrollmentPeriod.term} • ${formatToSchoolYear(
              enrollmentPeriod.startYear,
              enrollmentPeriod.endYear,
            )}`}
          </Badge>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder radius="md" p="lg">
          <Group mb="sm">
            <ThemeIcon variant="light" color="blue">
              <IconBook2 size={18} />
            </ThemeIcon>
            <Title order={4}>Course Details</Title>
          </Group>
          <Stack gap={6}>
            <Text fw={600}>{course?.name || 'Untitled Course'}</Text>
            <Text size="sm" c="dimmed">
              {course?.courseCode || 'No course code'}
            </Text>
            <Text size="sm">
              {`Module: ${moduleData.title || 'No module title yet'}`}
            </Text>
            <Text size="sm">{`Units: ${course?.units ?? 0}`}</Text>
            <Text size="sm">{`Type: ${course?.type || 'N/A'}`}</Text>
            <Text size="sm" c="dimmed">
              {course?.description || 'No course description provided yet.'}
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group mb="sm">
            <ThemeIcon variant="light" color="grape">
              <IconUserSquareRounded size={18} />
            </ThemeIcon>
            <Title order={4}>Mentor Details</Title>
          </Group>
          <Stack gap={8}>
            {mentors.length ? (
              mentors.map((mentor) => (
                <Card key={mentor.id} withBorder p="sm" radius="md">
                  <Text fw={600}>{`${mentor.firstName} ${mentor.lastName}`}</Text>
                  <Text size="xs" c="dimmed">
                    {`Role: ${mentor.role}`}
                  </Text>
                </Card>
              ))
            ) : (
              <Text c="dimmed" size="sm">
                No mentors assigned yet.
              </Text>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group mb="sm">
            <ThemeIcon variant="light" color="teal">
              <IconCalendarWeek size={18} />
            </ThemeIcon>
            <Title order={4}>Class Schedule</Title>
          </Group>
          <Stack gap={8}>
            {(courseOffering?.courseSections || []).length ? (
              courseOffering?.courseSections.map((section) => (
                <Card key={section.id} withBorder p="sm" radius="md">
                  <Text fw={600}>{section.name}</Text>
                  <Text size="sm" c="dimmed">
                    {`${formatDaysAbbrev(section.days)} ${section.startSched} - ${section.endSched}`}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {section.mentor
                      ? `Mentor: ${section.mentor.firstName} ${section.mentor.lastName}`
                      : 'Mentor: TBD'}
                  </Text>
                </Card>
              ))
            ) : (
              <Text c="dimmed" size="sm">
                No class schedules added yet.
              </Text>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group mb="sm">
            <ThemeIcon variant="light" color="orange">
              <IconChecklist size={18} />
            </ThemeIcon>
            <Title order={4}>Syllabus Snapshot</Title>
          </Group>
          <Stack gap={6}>
            <Text size="sm">{`Top-level sections: ${moduleSections.length}`}</Text>
            <Text size="sm">{`Total sections: ${allSections.length}`}</Text>
            <Text size="sm">{`Total content items: ${totalContentItems}`}</Text>
            <Text size="sm" c="dimmed">
              {moduleSections.length
                ? 'Section outline:'
                : 'No syllabus sections created yet.'}
            </Text>
            {moduleSections.map((section) => (
              <Group key={section.id} gap={6}>
                <IconClockHour4 size={14} />
                <Text size="sm">{section.title}</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

export default CourseOverview
