//TODO: implement action function for booking a mentoring session and navigating to gspace
import React from 'react'
import { ActionIcon, Group, Tooltip, useMantineTheme } from '@mantine/core'
import { IconCalendar, IconMessage } from '@tabler/icons-react'

import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'

const CourseQuickActions = () => {
  const theme = useMantineTheme()
  const { authUser } = useAuth('protected')

  const IconButton = (label: string, icon: React.ReactNode) => {
    return (
      <Tooltip label={label} withArrow color={theme.colors.dark[6]}>
        <ActionIcon color={theme.colors.dark[6]} variant="white" radius="lg" bd={`1px solid ${theme.colors.dark[0]}`}>
          {icon}
        </ActionIcon>
      </Tooltip>
    )
  }
  return (
    <Group gap="xs">
      {/*TODO: Add badge for mentoring session*/}
      <RoleComponentManager
        currentRole={authUser.role}
        roleRender={{
          student: IconButton("Book Mentoring Session", <IconCalendar size={'60%'} stroke={1.5} />),
          admin: IconButton("Manage Mentoring Sessions", <IconCalendar size={'60%'} stroke={1.5} />)
        }}
      />
      <Tooltip label="Got to Chat" withArrow color={theme.colors.dark[6]}>
        <ActionIcon color={theme.colors.dark[6]} variant="white" radius="lg" bd={`1px solid ${theme.colors.dark[0]}`}>
          <IconMessage size={'50%'} stroke={1.5}/>
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

export default CourseQuickActions