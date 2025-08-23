import {
  createFileRoute,
  Outlet,
  useLocation,
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
  Select,
  Modal,
  Title,
  Divider,
  Flex,
  Card,
  Stepper,
  ActionIcon,
  Input,
  Textarea,
} from '@mantine/core'
import {
  IconArrowBack,
  IconArrowBackUpDouble,
  IconArrowLeft,
  IconArrowsLeft,
  IconBook, IconCategory,
  IconCircleCheck,
  IconMailOpened,
  IconPlus,
  IconShieldCheck,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { type JSX, useState } from 'react'
import CourseEditor from "@/features/courses/course-editor/course-editor.tsx";
import CourseTree from "@/features/courses/course-editor/course-editor.tsx";

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

interface CourseBasicDetails {
  courseId: string
  courseName: string
}

const AddContentButtonAndModal = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button mb={'md'} bg={'secondary'} leftSection={<IconPlus />} onClick={open}>
        Add Content
      </Button>
      <NewContentModal opened={opened} closeModal={close} />
    </>
  );
};

const NewContentModal = ({ opened, closeModal }: { opened: boolean, closeModal: () => void }) => {
  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      title={<Title order={3}>Create new content</Title>}
      centered
      size="lg"
      radius={'md'}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 1,
      }}
    >
      <Stack gap={'sm'}>
        <Divider></Divider>
        <Grid my={'sm'}>
          {/*TODO: add more content types, these are just placeholders*/}
          <GridCol span={6}>
            <ActionCard
              title={'Course'}
              description={'Create a new course that students can enroll in.'}
              icon={<IconBook />}
            />
          </GridCol>
          <GridCol span={6}>
            <ActionCard
              title={'Module'}
              description={'Create a new module that contains assignments and other content.'}
              icon={<IconBook />}
            />
          </GridCol>
          <GridCol span={6}>
            <ActionCard
              title={'Content'}
              description={'Create a new educational content that can be used in modules.'}
              icon={<IconBook />}
            />
          </GridCol>
          <GridCol span={6}>
            <ActionCard
              title={'Assignment'}
              description={'Create a new assignment or task that students can complete.'}
              icon={<IconBook />}
            />
          </GridCol>
          <GridCol span={6}>
            <ActionCard
              title={'Student Group'}
              description={'Create a new student group that can be used to grade multiple students at once.'}
              icon={<IconBook />}
            />
          </GridCol>
          <GridCol span={6}>
            <ActionCard
              title={'Progress Report'}
              description={'Create a new progress report that admins can view.'}
              icon={<IconBook />}
            />
          </GridCol>
        </Grid>
        <Divider></Divider>
        <Flex justify="flex-end">
          <Button
            variant={'default'}
            radius={'md'}
            size={'sm'}
            onClick={closeModal}
          >
            Cancel
          </Button>
        </Flex>
      </Stack>
    </Modal>
  )
}

const ActionCard = (
  { title, description, icon }: { title: string, description: string, icon: JSX.Element}
) => {
  const [hovered, setHovered] = useState(false)
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Card
        withBorder
        radius="md"
        p="xs"
        shadow={hovered ? 'sm' : 'xs'}
        style={{ cursor: 'pointer' }}
        onClick={open}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Stack gap={'xs'}>
          <Group gap={'xs'}>
            {icon}
            <Title order={4} fw={500}>
              {title}
            </Title>
          </Group>
          <Text size={'sm'}>{description}</Text>
        </Stack>
      </Card>
      <ActionsModal opened={opened} closeModal={close}/>
    </>
  )
}

const ActionsModal = ({ opened, closeModal }: { opened: boolean, closeModal: () => void }) => {
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      withCloseButton={false}
      centered
      size="60%"
      radius={'lg'}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 1,
      }}
    >
      <Stack gap={'sm'} h={'85vh'}>
        {/*Header*/}
        <Group justify="space-between" align="center" my={'xs'}>
          <Button variant="outline" radius={'md'} p={'xs'} onClick={closeModal}>
            <IconX size={18} />
          </Button>
          <Stepper
            w={'75%'}
            active={active}
            onStepClick={setActive}
            completedIcon={<IconCircleCheck size={18} />}
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              icon={<IconUserCheck size={18} />}
              label="Step 1"
              description="Identify the course"
            />
            <Stepper.Step
              icon={<IconMailOpened size={18} />}
              label="Step 2"
              description="Verify email"
            />
            <Stepper.Step
              icon={<IconShieldCheck size={18} />}
              label="Step 3"
              description="Get full access"
            />
          </Stepper>
          <Group gap={'xs'} align="center">
            <Button
              variant="default"
              radius={'md'}
              p={'xs'}
              onClick={prevStep}
            >
              <IconArrowsLeft size={18} />
            </Button>
            <Button
              radius={'md'}
              size={'sm'}
              onClick={nextStep}
            >
              {active === 3 ? 'Save' : 'Next'}
            </Button>
          </Group>
        </Group>
        <Divider></Divider>
        <Container w={'70%'} p={'xl'} h={'100%'}>
          {active === 0 && (
              <CourseCreationCard />
          )}
          {active === 1 && (
              <ModuleCreationCard />
          )}
          {active === 2 && (
              <CourseTree />
          )}
          {active === 3 && (
              <div>Final step placeholder</div>
          )}
        </Container>
      </Stack>
    </Modal>
  )
}

const CourseCreationCard = () => {
  return (
      <Card radius="lg" p={0} h={'100%'}>
        <Box bg={'yellow'} h={'16%'}></Box>
        <Stack justify="space-between" h={'100%'} my={'lg'} p={'lg'}>
          <Input
              variant="unstyled"
              placeholder="Course Title"
              fw={600}
              size="2rem"
          />
          <Grid gutter={'xs'}>
            <Grid.Col span={3}>
              <Group
                  gap={'xs'}
                  h={'100%'}
                  align="center"
              >
                <IconCategory></IconCategory>
                <Text>Category</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={9}>
              <Input
                  variant="unstyled"
                  placeholder="Empty"
                  fw={400}
                  size="md"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Group
                  gap={'xs'}
                  h={'100%'}
                  align="center"
              >
                <IconCategory></IconCategory>
                <Text>Category</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={9}>
              <Input
                  variant="unstyled"
                  placeholder="Empty"
                  fw={400}
                  size="md"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Group
                  gap={'xs'}
                  h={'100%'}
                  align="center"
              >
                <IconCategory></IconCategory>
                <Text>Category</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={9}>
              <Input
                  variant="unstyled"
                  placeholder="Empty"
                  fw={400}
                  size="md"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Group
                  gap={'xs'}
                  h={'100%'}
                  align="center"
              >
                <IconCategory></IconCategory>
                <Text>Category</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={9}>
              <Input
                  variant="unstyled"
                  placeholder="Empty"
                  fw={400}
                  size="md"
              />
            </Grid.Col>
          </Grid>
          <Stack gap={'0'}>
            <Textarea
                variant="unstyled"
                label=""
                placeholder="Type description here..."
            />
            <Divider/>
          </Stack>
        </Stack>
      </Card>
  )
}

const ModuleCreationCard = () => {
  return (
      <Card radius="lg" p={0} h={'100%'}>
        <Box bg={'yellow'} h={'16%'}></Box>
        <Stack justify="space-between" h={'100%'} my={'lg'} p={'lg'}>
          <CourseTree />
        </Stack>
      </Card>
  )
}

const SubNavBar = ({navItems, courses }: {navItems: SubNavItem[], courses: CourseBasicDetails[]}) => {
  const { authUser } = useAuth('protected')
  const { courseId } = useParams({ from: '/(protected)/courses/$courseId' })
  const currentCourse = courses.find((course) => course.courseId === courseId)!
  const getCourseId = (courseName: string) => {
    return courses.find((course) => course.courseName === courseName)!.courseId
  }
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Stack
      gap={'sm'}
      mt={'md'}
      mr={'md'}
      h={'100vh'}
      style={{ position: 'sticky', top: 0 }}
    >
      <RoleComponentManager
        currentRole={authUser.role}
        roleRender={{
          admin: <AddContentButtonAndModal />,
        }}
      />
      <Select
        data={courses.map((course) => course.courseName)}
        defaultValue={currentCourse.courseName}
        onChange={async (value) => {
          if (value) {
            const newCourseId = getCourseId(value)
            const newPath = location.pathname.replace(courseId, newCourseId)
            await navigate({ to: newPath })
          }
        }}
      />
      {navItems.map((item, index) => (
        <SubNavButton key={index} item={item} />
      ))}
    </Stack>
  )
}

const mockCourses: CourseBasicDetails[] = [
    {
        courseId: 'MO-IT200',
        courseName: 'Web Technology Applications',
    },
    {
        courseId: 'MO-IT351',
        courseName: 'Data Structures & Algorithms',
    },
    {
        courseId: 'MO-IT400',
        courseName: 'Capstone 1',
    },
    {
        courseId: 'MO-IT500',
        courseName: 'Capstone 2',
    },
]

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const theme = useMantineTheme()

  const courses: CourseBasicDetails[] = mockCourses
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
      link: `/courses/${courseId}/assignments`,
      label: 'Assignments',
      fuzzy: true,
    },
    {
      link: `/courses/${courseId}/grades`,
      label: 'Grades',
      fuzzy: true,
    }
  ]

  const adminNavItems: SubNavItem[] = [
    ...studentNavItems,
    {
      link: `/courses/${courseId}/files`,
      label: 'Files',
      fuzzy: true
    },
    {
      link: `/courses/${courseId}/students`,
      label: 'Students',
      fuzzy: true
    },
    {
      link: `/courses/${courseId}/progress`,
      label: 'Progress Report',
      fuzzy: true
    },
    {
      link: `/courses/${courseId}/settings`,
      label: 'Settings',
      fuzzy: true
    },
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
            student: <SubNavBar navItems={studentNavItems} courses={courses}/>,
            admin: <SubNavBar navItems={adminNavItems} courses={courses}/>, //TODO: use all courses
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
