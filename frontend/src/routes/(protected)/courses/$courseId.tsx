import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  Container,
  Grid,
  GridCol,
  Stack,
  Text,
    Button,
  Group,
  Box,
  useMantineTheme,
} from '@mantine/core'

export const Route = createFileRoute('/(protected)/courses/$courseId')({
  component: RouteComponent,
})

interface SubNavItem {
    link: string
    label: string
    fuzzy?: boolean
}

const SubNavButton = ({ item }: { item: SubNavItem }) => {
    const matchRoute = useMatchRoute()
    const navigate = useNavigate()

  const isActive = matchRoute({ to: item.link, fuzzy: item.fuzzy })

    return (
        <Button
            variant={isActive ? 'light' : 'subtle'}
            justify="start"
            color={isActive ? undefined : 'gray'}
            onClick={() => navigate({ to: item.link })}
            fullWidth
        >
            {item.label}
        </Button>
    )
}

const SubNavBar = ({navItems}: {navItems: SubNavItem[]}) => {
    return (
        <Stack gap={'sm'} mt={'md'} mr={'sm'} h={'100vh'} style={{position: 'sticky', top: 0}}>
            {navItems.map((item, index) => (
                <SubNavButton key={index} item={item}/>
            ))}
        </Stack>
    )
}


function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const { courseId } = useParams({ from: '/(protected)/courses/$courseId' })

  const studentNavItems: SubNavItem[] = [
    {
      link: `/courses/${courseId}`,
      label: 'Overview',
      fuzzy: false,
    },
    {
      link: `/courses/${courseId}/modules`,
      label: 'Modules',
      fuzzy: true,
    },
    {
      link: `/courses/${courseId}/submissions`,
      label: 'Submissions',
      fuzzy: true,
    },
    {
      link: `/courses/${courseId}/grades`,
      label: 'Grades',
      fuzzy: true,
    }
  ]

  return (
    <Group
      w="100%"
      h="100%"
      gap="sm"
      align="stretch"
      style={{
        overflow: 'hidden'
    }}
    >
      {/* Sub Nav */}
      <Box
        h='100vh'
        miw={"12%"}
        style={{
          borderRight: `1px solid ${theme.colors.gray[2]}`,
          overflow: 'hidden',
      }}>
        <RoleComponentManager
          currentRole={authUser.role}
          roleRender={{
            student: <SubNavBar navItems={studentNavItems} />,
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        p="sm"
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <Outlet />
      </Box>
    </Group>
  )
}
