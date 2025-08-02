import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import { Avatar, Button, Image, Menu, Stack, Text } from '@mantine/core'
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react'
import NavButton from '../../features/navigation/nav-button'
import type { User } from '@supabase/supabase-js'
import { useNavigate } from '@tanstack/react-router'
import { adminLinks, studentLinks } from '@/features/navigation/navLinks'

function Sidebar() {
  const { authUser } = useAuth('protected')

  // const logo =
  //   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjhAGEboKYtmpm-_22nBVPqrIxmbiyRQNIgQ&s'

  const logoLabel =
    'https://media.licdn.com/dms/image/v2/C560BAQFfvE6ykJsacg/company-logo_200_200/company-logo_200_200/0/1637725925401/mapua_malayan_digital_college_of_the_philippines_logo?e=2147483647&v=beta&t=mkaMsKKKMxQKjYLppivAZhRx5M9QayYxfgQtfy2mx4Y'

  return (
    <Stack className="sticky top-0 left-0 w-52 h-screen">
      <Stack className="flex-1 p-4" gap={0} justify="space-between">
        <Stack gap={4}>
          {/* <Image src={logo} w={80} h={80} className="mb-4 contrast-[0.96]" /> */}
          <Image
            src={logoLabel}
            w={120}
            h={120}
            className="mb-4 contrast-[0.96] mx-auto"
          />

          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              student: studentLinks.map((item) => (
                <NavButton key={item.link} item={item} fuzzy={item.fuzzy} />
              )),
              admin: adminLinks.map((item) => (
                <NavButton key={item.link} item={item} fuzzy={item.fuzzy} />
              )),
            }}
          />
        </Stack>

        <Stack className="pb-4">
          <AccountButton user={authUser.user} />
        </Stack>
      </Stack>
    </Stack>
  )
}

interface AccountButtonProps {
  user: User
}

function AccountButton(props: AccountButtonProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const onLogoutClick = () => {
    logout()
    navigate({
      to: '/login',
    })
  }

  return (
    <Menu width="target">
      <Menu.Target>
        <Button
          variant="subtle"
          px={2}
          h="auto"
          justify="start"
          leftSection={<Avatar size={34}>TU</Avatar>}
        >
          <Stack gap={0} align="start" w="100%">
            <Text className="text-left w-full" c="dark" fw={500} w="100%">
              Test User
            </Text>
            <Text className="text-left w-full truncate" size="xs" c="dimmed">
              {props.user.email}
            </Text>
          </Stack>
        </Button>
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
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default Sidebar
