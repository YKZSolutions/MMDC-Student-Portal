import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import {
  ActionIcon,
  Button,
  Group,
  Image,
  Menu,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  IconChevronsLeft,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import NavButton from '@/features/navigation/nav-button'
import type { User } from '@supabase/supabase-js'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { adminLinks, studentLinks } from '@/features/navigation/navLinks'
import SupabaseAvatar from '@/components/supabase-avatar'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import { useQuery } from '@tanstack/react-query'
import { usersControllerGetMeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { useState } from 'react'

function Sidebar() {
  const { authUser } = useAuth('protected')
  const isCMS =
    authUser?.role === 'admin' && useLocation().pathname.startsWith('/cms')

  const [isExpanded, setIsExpanded] = useState(false)

  if (!authUser) {
    return null //TODO: or a loader / skeleton
  }

  return (
    <Stack
      className={`sticky top-0 left-0 ${isExpanded ? 'w-52' : 'w-16'} h-screen transition-all duration-200`}
    >
      <Stack className="flex-1" gap={0} p={'sm'} h={'100%'}>
        <Group justify={isExpanded ? 'end' : 'center'}>
          <ActionIcon
            variant={'subtle'}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? (
              <IconChevronsLeft size={'20'} />
            ) : (
              <IconMenu2 size={'20'} />
            )}
          </ActionIcon>
        </Group>
        <Stack justify={'space-between'} flex={1} p={0} w={'100%'}>
          <Stack
            gap={isExpanded ? 4 : 12}
            p={0}
            align={'center'}
            mt={!isExpanded ? 'xs' : 0}
          >
            {/* <Image src={logo} w={80} h={80} className="mb-4 contrast-[0.96]" /> */}
            <Image
              src="/mmdc-logo.jpg"
              w={isExpanded ? 120 : 60}
              h={isExpanded ? 120 : 60}
              className="mb-4 contrast-[0.96] mx-auto"
            />

            <RoleComponentManager
              currentRole={authUser.role}
              roleRender={{
                student: studentLinks.map((item) => (
                  <NavButton
                    key={item.link}
                    item={item}
                    fuzzy={item.fuzzy}
                    collapsed={!isExpanded}
                  />
                )),
                admin: adminLinks.map((item) => (
                  <NavButton
                    key={item.link}
                    item={item}
                    fuzzy={item.fuzzy}
                    collapsed={!isExpanded}
                  />
                )),
              }}
            />
          </Stack>

          <Stack className="pb-4">
            <AccountButton user={authUser.user} collapsed={!isExpanded} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

interface AccountButtonProps {
  user: User
  collapsed?: boolean
}

function AccountButton(props: AccountButtonProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const { data } = useQuery(usersControllerGetMeOptions())

  const onLogoutClick = () => {
    logout()
    navigate({
      to: '/login',
    })
  }

  return (
    <Menu width="target">
      <Menu.Target>
        <Tooltip
          label="My account"
          position="right"
          withArrow
          disabled={!props.collapsed}
        >
          <Button
            variant="subtle"
            px={2}
            h="auto"
            justify={props.collapsed ? 'center' : 'start'}
            data-cy="my-account-button"
          >
            <SupabaseAvatar
              size={34}
              bucket={SupabaseBuckets.USER_AVATARS}
              path={data?.id || ''}
              imageType="jpg"
              name={`${data?.firstName} ${data?.lastName}`}
            />
            {!props.collapsed && (
              <Stack gap={0} align="start" w="100%" ml={'xs'}>
                <Text className="text-left w-full" c="dark" fw={500} w="100%">
                  Test User
                </Text>
                <Text
                  className="text-left w-full truncate"
                  size="xs"
                  c="dimmed"
                >
                  {props.user.email}
                </Text>
              </Stack>
            )}
          </Button>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>My Account</Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>

        <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>

        <Menu.Divider />

        <Menu.Item
          onClick={onLogoutClick}
          color="red"
          leftSection={<IconLogout size={14} />}
          data-cy="logout-button"
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default Sidebar
