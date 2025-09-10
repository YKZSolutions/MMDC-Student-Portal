import type { FileRoutesByTo } from '@/routeTree.gen'
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { useToggle } from '@mantine/hooks'
import {
  IconChevronRight,
  type Icon,
  type IconProps,
} from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { memo } from 'react'

export interface NavItem {
  link: keyof FileRoutesByTo
  label: string
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  IconInactive: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  >
  fuzzy?: boolean
  subItems?: Omit<NavItem, 'subItems'>[]
}

export interface NavButtonProps {
  item: NavItem
  fuzzy?: boolean
  collapsed?: boolean
}

export default function NavButton({
  item,
  fuzzy,
  collapsed = false,
}: NavButtonProps) {
  const [open, toggle] = useToggle()

  return (
    <Stack w={!collapsed ? '100%' : undefined} gap={4}>
      <BaseNavButton
        item={item}
        fuzzy={fuzzy}
        open={open}
        toggle={toggle}
        collapsed={collapsed}
      />
      {!collapsed && open && item.subItems && (
        <Group className="w-full" gap={8}>
          <Divider orientation="vertical" ml={16} h="100%" />
          <Stack className="flex-1" gap={4}>
            {item.subItems?.map((subitem) => (
              <BaseNavButton
                key={subitem.link}
                item={subitem}
                fuzzy={fuzzy}
                open={open}
                toggle={toggle}
                collapsed={collapsed}
              />
            ))}
          </Stack>
        </Group>
      )}
    </Stack>
  )
}

interface BaseNavButtonProps extends NavButtonProps {
  open?: boolean
  toggle?: (value?: React.SetStateAction<boolean> | undefined) => void
}

const BaseNavButton = memo(function BaseNavButton({
  item,
  fuzzy,
  open,
  collapsed,
  toggle,
}: BaseNavButtonProps) {
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
      rightSection={
        item.subItems !== undefined && (
          <IconChevronRight
            className={`flex-1 flex justify-end ${open ? 'rotate-90' : 'rotate-0'}`}
            size={20}
            onClick={(e) => {
              e.preventDefault()
              if (toggle) toggle()
            }}
          />
        )
      }
      variant={isActive ? 'light' : 'subtle'}
      justify="start"
      color={isActive ? undefined : 'gray'}
      to={item.link}
      fullWidth
      data-cy={`${item.label.toLowerCase()}-link`}
      classNames={{
        label: 'flex flex-1',
      }}
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
})

// function NavButton({ item, fuzzy, collapsed = false }: NavButtonProps) {
//   const matchRoute = useMatchRoute()

//   const isActive = matchRoute({ to: item.link, fuzzy: fuzzy })

//   const button = collapsed ? (
//     <ActionIcon
//       component={Link}
//       to={item.link}
//       variant={isActive ? 'light' : 'subtle'}
//       color={isActive ? undefined : 'gray'}
//       data-cy={`${item.label.toLowerCase()}-link`}
//     >
//       {isActive ? (
//         <item.Icon size={24} />
//       ) : (
//         <item.IconInactive color="gray" size={24} />
//       )}
//     </ActionIcon>
//   ) : (
//     <Button
//       component={Link}
//       leftSection={
//         isActive ? (
//           <item.Icon size={22} />
//         ) : (
//           <item.IconInactive color="gray" size={22} />
//         )
//       }
//       variant={isActive ? 'light' : 'subtle'}
//       justify="start"
//       color={isActive ? undefined : 'gray'}
//       to={item.link}
//       fullWidth
//       data-cy={`${item.label.toLowerCase()}-link`}
//     >
//       {item.label}
//     </Button>
//   )

//   return (
//     <Tooltip
//       label={item.label}
//       position="right"
//       withArrow
//       disabled={!collapsed}
//     >
//       {button}
//     </Tooltip>
//   )
// }
