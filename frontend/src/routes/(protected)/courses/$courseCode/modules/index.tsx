import { createFileRoute, Link } from '@tanstack/react-router'
import { mockModule } from '@/features/courses/mocks.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { useState } from 'react'
import { Button, Group, Stack, Title } from '@mantine/core'
import {
  IconPlus,
  IconViewportShort,
  IconViewportTall,
} from '@tabler/icons-react'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'

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
  const [allExpanded, setAllExpanded] = useState(false)

  const { courseCode } = Route.useParams() //TODO: use this later for fetching the module
  const module = mockModule //TODO: replace with suspenseQuery

  const toggleExpandAll = () => {
    setAllExpanded((prev) => !prev)
  }

  return (
    <Stack gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center">
        <Title>Modules</Title>
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
            <Link from={'/courses/$courseCode/modules'} to={`./create`}>
              <Button leftSection={<IconPlus />} bg={'secondary'}>
                Add New Content
              </Button>
            </Link>
          )}
        </Group>
      </Group>
      <ModulePanel allExpanded={allExpanded} module={module} />
    </Stack>
  )
}
