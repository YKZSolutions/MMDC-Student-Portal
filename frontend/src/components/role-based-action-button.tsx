import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { Button } from '@mantine/core'
import { IconEdit, IconVideo } from '@tabler/icons-react'
import React from 'react'
import type { Role } from '@/integrations/api/client'

type DefaultRoles = Role

type RoleBasedActionButtonProps = {
  render: {
    [K in DefaultRoles]?: {
      icon: React.ReactNode;
      text: string;
      click: () => void;
      disabled?: boolean;
    }
  }
}

const RoleBasedActionButton = ({
  render,
}: RoleBasedActionButtonProps) => {
  const { authUser } = useAuth('protected')
  const { role } = authUser
  const { icon, text, click, disabled } = render[role] || {}

  if (!icon || !text || !click) {
    return null
  }

  return (
    <Button
      leftSection={icon}
      size="xs"
      radius="xl"
      variant="filled"
      disabled={disabled}
      onClick={click}
    >
      {text}
    </Button>
  )
}

export default RoleBasedActionButton