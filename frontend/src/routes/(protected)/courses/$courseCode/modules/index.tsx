import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { mockModule } from '@/features/courses/mocks.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import React, { useState } from 'react'
import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core'
import {
  IconPlus,
  IconViewportShort,
  IconViewportTall,
} from '@tabler/icons-react'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import {
  getModuleItemsFromModule,
  getOverdueItemsCount,
} from '@/utils/helpers.ts'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/',
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    return mockModule //TODO: replace with actual fetch
  },
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()
  const [allExpanded, setAllExpanded] = useState(false)

  const { courseCode } = Route.useParams() //TODO: use this later for fetching the module
  const module = mockModule //TODO: replace with suspenseQuery

  const toggleExpandAll = () => {
    setAllExpanded((prev) => !prev)
  }

  const allItems = getModuleItemsFromModule(module)
  const overdueItems = getOverdueItemsCount(allItems)

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <div>
            <Title order={3} size="h4">
              {module.courseName}
            </Title>
            <Text size="sm" c="dimmed">
              {module.courseCode} • {module.courseSection}
            </Text>
          </div>
          <Badge
            variant="light"
            color={module.published.isPublished ? 'green' : 'orange'}
          >
            {module.published.isPublished ? 'Published' : 'Draft'}
          </Badge>
          {overdueItems > 0 && (
            <Badge variant="light" color="red">
              {overdueItems} Overdue
            </Badge>
          )}
        </Group>
        <Group align="center">
          <Button
            onClick={toggleExpandAll}
            w={135}
            variant={'default'}
            leftSection={
              allExpanded ? (
                <IconViewportShort size={16} />
              ) : (
                <IconViewportTall size={16} />
              )
            }
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          {authUser.role === 'admin' && (
            <Button
              leftSection={<IconPlus />}
              bg={'secondary'}
              onClick={() =>
                navigate({
                  from: '/courses/$courseCode/modules',
                  to: `./create`,
                })
              }
            >
              Add New Content
            </Button>
          )}
        </Group>
      </Group>
      <ModulePanel allExpanded={allExpanded} module={module} />
    </Stack>
  )
}
