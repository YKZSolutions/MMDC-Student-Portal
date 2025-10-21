import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import {
  Box,
  Card,
  Group,
  Progress,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconChartBar } from '@tabler/icons-react'
import { useParams } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ModuleProgressDetail } from '@/integrations/api/client'
import { lmsControllerGetModuleProgressDetailOptions } from '@/integrations/api/client/@tanstack/react-query.gen.ts'

function ModuleProgressQueryProvider({
  children,
}: {
  children: (props: { moduleProgress: ModuleProgressDetail }) => ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })

  const { data } = useSuspenseQuery(
    lmsControllerGetModuleProgressDetailOptions({
      path: {
        id: lmsCode || '',
      },
    }),
  )

  console.log('Content Progresses:', data)

  return children({
    moduleProgress: data,
  })
}

function ModulesMentorPage() {
  const theme = useMantineTheme()
  const [allExpanded, setAllExpanded] = useState(true)

  return (
    <Box>
      {/* Section Statistics */}
      <ModuleProgressQueryProvider>
        {({ moduleProgress }) => (
          <>
            <Box mb="lg">
              <Title order={4}>Section Statistics</Title>
              <Group gap="md">
                <Card shadow="sm" p="md" withBorder>
                  <Group>
                    <ThemeIcon variant="light" size="lg" color="blue">
                      <IconChartBar size={16} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={500}>
                        Section Progress
                      </Text>
                      <Progress
                        value={
                          moduleProgress.overallProgress.progressPercentage
                        }
                        size="sm"
                        mt="xs"
                      />
                      <Text size="xs" c="dimmed" mt="xs">
                        {moduleProgress.overallProgress.completedStudentsCount}{' '}
                        students completed
                      </Text>
                    </Box>
                  </Group>
                </Card>
              </Group>
            </Box>
          </>
        )}
      </ModuleProgressQueryProvider>

      {/* Module Content with mentor-specific actions */}
      <ModulePanel viewMode="mentor" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesMentorPage
