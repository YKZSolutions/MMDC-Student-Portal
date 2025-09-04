import type { FileRoutesByTo } from '@/routeTree.gen'
import { ActionIcon, Button, Tooltip } from '@mantine/core'
import { type Icon, type IconProps } from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'

export interface NavItem {
  link: keyof FileRoutesByTo
  label: string
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  IconInactive: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  >
  fuzzy?: boolean
}

export interface NavButtonProps {
  item: NavItem
  fuzzy?: boolean
  collapsed?: boolean
}

function NavButton({ item, fuzzy, collapsed = false }: NavButtonProps) {
  const matchRoute = useMatchRoute()

  const isActive = matchRoute({ to: item.link, fuzzy: fuzzy })

  const button = collapsed ? (
    <ActionIcon
      component={Link}
      to={item.link}
      variant={isActive ? 'light' : 'subtle'}
      color={isActive ? undefined : 'gray'}
      data-cy={`${item.label.toLowerCase()}-link`}
    >
      {isActive ? (
        <item.Icon size={24} />
      ) : (
        <item.IconInactive color="gray" size={24} />
      )}
    </ActionIcon>
  ) : (
    <Button
      component={Link}
      leftSection={
        isActive ? (
          <item.Icon size={22} />
        ) : (
          <item.IconInactive color="gray" size={22} />
        )
      }
      variant={isActive ? 'light' : 'subtle'}
      justify="start"
      color={isActive ? undefined : 'gray'}
      to={item.link}
      fullWidth
      data-cy={`${item.label.toLowerCase()}-link`}
    >
      {item.label}
    </Button>
  )

  return (
    <Tooltip
      label={item.label}
      position="right"
      withArrow
      disabled={!collapsed}
    >
      {button}
    </Tooltip>
  )
}

export default NavButton
