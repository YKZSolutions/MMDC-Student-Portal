import { Button, Group, Stack, Title } from '@mantine/core'
import {
  IconPlus,
  IconViewportShort,
  IconViewportTall,
} from '@tabler/icons-react'
import React, { useState } from 'react'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'

const CourseModules = () => {
  const { authUser } = useAuth('protected')
  const [allExpanded, setAllExpanded] = useState(false)

  const toggleExpandAll = () => {
    setAllExpanded((prev) => !prev)
  }

  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false)

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
            <>
              <Button
                leftSection={<IconPlus />}
                onClick={() => setIsCourseSelectorOpen(true)}
                bg={'secondary'}
              >
                Add New Content
              </Button>
            </>
          )}
        </Group>
      </Group>
      <ModulePanel allExpanded={allExpanded} />
    </Stack>
  )
}

export default CourseModules
