import type { Course } from '@/features/courses/types.ts'
import {
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'

const CourseTasksSummary = ({
                              courses,
                            }: {courses: Course[]}) => {
  const theme = useMantineTheme()
  return (
    <Paper withBorder radius={'md'} shadow="xs" p="lg">
      <Stack gap={'sm'}>
        <Center>
          <Title c={'dark.7'} variant="hero" order={4} fw={700}>
            Weekly Tasks
          </Title>
        </Center>
        {courses.filter((course) => course.activities.length > 0).length === 0 ? (
          <Stack gap={'md'}>
            <Title c={'dark.7'} variant="hero" order={6} fw={400}>
              Congratulations! You have completed all your tasks for the week.
            </Title>
          </Stack>
        ) : (
          courses.filter((course) => course.activities.length > 0).map((course, index) => (
            <Stack gap={'sm'}>
              <Title c={'dark.7'} variant="hero" order={5} fw={700}>
                {course.courseName}
              </Title>
              <Divider />
              <Stack gap={'md'}>
                {course.activities.map((activity, activityIndex) => (
                  <Group justify="space-between" align="center" key={activityIndex}>
                    <Stack gap={'xs'}>
                      <Text fw={500} size={'xs'} truncate={'end'}>{activity.activityName}</Text>
                      <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                        {activity.dueDate} at {activity.dueTime}
                      </Text>
                    </Stack>
                    <Button
                      variant="default"
                      radius={'md'}
                      size={'xs'}
                    >
                      Submit
                    </Button>
                  </Group>
                ))}
              </Stack>
            </Stack>
          )))}
      </Stack>
    </Paper>
  )
}

export default CourseTasksSummary