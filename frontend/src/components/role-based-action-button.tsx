import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { type BoxProps, Button } from '@mantine/core'
import React, { type ComponentPropsWithoutRef } from 'react'
import type { Role } from '@/integrations/api/client'

type RoleBasedActionButtonProps = {
  render: {
    [K in Role]?: {
      icon: React.ReactNode
      text: string
      onClick: () => void
      disabled?: boolean
    }
  }
} & Omit<
  ComponentPropsWithoutRef<typeof Button>,
  'onClick' | 'leftSection' | 'disabled'
> &
  BoxProps

const RoleBasedActionButton = ({
  render,
  ...buttonProps
}: RoleBasedActionButtonProps) => {
  const { authUser } = useAuth('protected')
  const { role } = authUser
  const { icon, text, onClick, disabled } = render[role] || {}

  if (!icon || !text || !onClick) {
    return null
  }

  return (
    <Button
      leftSection={icon}
      size="xs"
      radius="xl"
      variant="filled"
      disabled={disabled}
      onClick={onClick}
      {...buttonProps}
    >
      {text}
    </Button>
  )
}

export default RoleBasedActionButton
