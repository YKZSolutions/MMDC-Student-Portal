import { lmsControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatToSchoolYear } from '@/utils/formatters'
import {
  Box,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconBookmark } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Outlet } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/lms/$lmsCode')

export default function LMSHeaderLayout() {
  return (
    <Stack w="100%" h="100%" gap={0}>
      <Group wrap={'nowrap'} justify="space-between" align="center" mb={'md'}>
        <Group gap="sm" align="center">
          <ThemeIcon size="lg" variant="light" color="blue">
            <IconBookmark size={20} />
          </ThemeIcon>
          <ModuleHeader />
        </Group>
      </Group>
      <Divider />
      <Outlet />
    </Stack>
  )
}

function ModuleHeader() {
  const { lmsCode } = route.useParams()

  const { data } = useSuspenseQuery(
    lmsControllerFindOneOptions({
      path: {
        id: lmsCode,
      },
    }),
  )

  const course = data?.course || undefined
  const enrollmentPeriod = data?.courseOffering?.enrollmentPeriod

  return (
    <Box>
      <Title order={3}>{course?.name}</Title>
      <Group gap={'xs'} className="">
        <Text size="sm" c="dimmed">
          {course?.courseCode}
        </Text>
        <Text size="sm" c="dimmed">
          •
        </Text>
        <Text size="sm" c="dimmed">
          {formatToSchoolYear(
            enrollmentPeriod?.startYear || 0,
            enrollmentPeriod?.endYear || 0,
          )}
        </Text>
        <Text size="sm" c="dimmed">
          •
        </Text>
        <Text size="sm" c="dimmed">
          Term {enrollmentPeriod?.term}
        </Text>
        <Text size="sm" c="dimmed">
          •
        </Text>
        <Text size="sm" c="dimmed">
          {data?.title}
        </Text>
      </Group>
    </Box>
  )
}
