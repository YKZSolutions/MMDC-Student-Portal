import type { FileRoutesByTo } from '@/routeTree.gen'
import { Button } from '@mantine/core'
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
}

function NavButton({ item, fuzzy }: NavButtonProps) {
  const matchRoute = useMatchRoute()

  const isActive = matchRoute({ to: item.link, fuzzy: fuzzy })

  return (
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
    >
      {item.label}
    </Button>
  )
}

export default NavButton
