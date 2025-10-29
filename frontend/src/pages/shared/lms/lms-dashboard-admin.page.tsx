import PageHeader from '@/components/page-header'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item'
import { CourseListSuspense } from '@/features/courses/suspense'
import { ViewSelectorButton } from '@/features/lms/components/view-selector-button'
import { useSearchState } from '@/hooks/use-search-state'
import { lmsControllerFindAllForAdminOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Container,
  Divider,
  Group,
  rem,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense } from 'react'

const route = getRouteApi('/(protected)/lms/')

export default function LMSDashboardAdminPage() {
  return (
    <Container size="md" w="100%" pb="xl">
      <Stack gap="lg">
        <PageHeader
          title="Learning Management System"
          subtitle="Manage your modules and track your progress"
        />
        <ActionBar />
        <Group
          wrap="wrap"
          gap="md"
          style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
        >
          <Suspense fallback={<CourseListSuspense />}>
            <ModuleList />
          </Suspense>
        </Group>
      </Stack>
    </Container>
  )
}

function ActionBar() {
  const { search, setSearch } = useSearchState(route)

  return (
    <>
      <Group align="center" justify="end" gap={rem(5)}>
        <TextInput
          placeholder="Search courses"
          radius={'md'}
          leftSection={<IconSearch size={18} stroke={1} />}
          w={{
            base: '100%',
            xs: rem(250),
          }}
        />
        {/* Implement this at a later time */}
        {/* <CourseDashboardFilters
          filters={filters}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        /> */}
        <ViewSelectorButton
          value={search.vie === undefined ? 'grid' : 'list'}
          onSelect={(value) =>
            setSearch({ vie: value === 'list' ? value : undefined })
          }
        />
      </Group>
      <Divider />
    </>
  )
}

function ModuleList() {
  const { search } = useSearchState(route)

  const { data: paginated } = useSuspenseQuery(
    lmsControllerFindAllForAdminOptions({
      query: {
        search: search.search || undefined,
        page: search.page || 1,
        enrollmentPeriodId: undefined,
      },
    }),
  )

  const { modules } = paginated

  return modules.map((module) =>
    search.vie === 'list' ? (
      <CourseListRow
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ) : (
      <CourseCard
        key={module.id}
        url={`/lms/${module.id}`}
        course={module.course || undefined}
      />
    ),
  )
}
