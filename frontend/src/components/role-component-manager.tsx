import type { Role } from '@/integrations/api/client'
import type { ReactNode } from 'react'

type DefaultRoles = Role

type RoleRender = {
  [key in DefaultRoles]?: ReactNode
} & {
  [key: string]: ReactNode | undefined
}

interface RoleComponentManagerProps {
  currentRole: DefaultRoles | string
  roleRender: RoleRender
  defaultComponent?: ReactNode
}

function RoleComponentManager({
  currentRole,
  roleRender,
  defaultComponent = null,
}: RoleComponentManagerProps) {
  return roleRender[currentRole] ?? defaultComponent
}

export default RoleComponentManager
