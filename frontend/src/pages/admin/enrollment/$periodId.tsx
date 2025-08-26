import { formatPaginationMessage } from '@/utils/formatters'
import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Pagination,
  Paper,
  Popover,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  type ReactNode,
} from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

const route = getRouteApi('/(protected)/enrollment/$periodId')

const mockCourseData = [
  {
    id: 1,
    name: 'Capstone 1',
    code: 'MO-IT200',
    credits: 3,
    sections: [
      {
        sectionName: 'A1234',
        schedule: {
          days: 'MWF',
          time: '8:00 - 9:00 AM',
        },
        takenSlots: 0,
        maxSlots: 30,
      },
      {
        sectionName: 'H5678',
        schedule: {
          days: 'MWF',
          time: '2:00 - 3:00 PM',
        },
        takenSlots: 0,
        maxSlots: 30,
      },
      {
        sectionName: 'S9101',
        schedule: {
          days: 'MWF',
          time: '8:00 - 9:00 PM',
        },
        takenSlots: 0,
        maxSlots: 30,
      },
    ],
  },
  {
    id: 2,
    name: 'Data Structures & Algorithms',
    code: 'MO-IT351',
    credits: 3,
    sections: [
      {
        sectionName: 'A1122',
        schedule: {
          days: 'TTh',
          time: '10:00 - 11:30 AM',
        },
        takenSlots: 15,
        maxSlots: 30,
      },
      {
        sectionName: 'H3344',
        schedule: {
          days: 'MWF',
          time: '1:00 - 2:00 PM',
        },
        takenSlots: 10,
        maxSlots: 30,
      },
    ],
  },
  {
    id: 3,
    name: 'Web Technology Applications',
    code: 'MO-BS400',
    credits: 3,
    sections: [
      {
        sectionName: 'A5566',
        schedule: {
          days: 'MWF',
          time: '9:00 - 11:00 AM',
        },
        takenSlots: 25,
        maxSlots: 25,
      },
      {
        sectionName: 'H7788',
        schedule: {
          days: 'MWF',
          time: '1:00 - 3:00 PM',
        },
        takenSlots: 20,
        maxSlots: 25,
      },
    ],
  },
  {
    id: 4,
    name: 'Object-Oriented Programming',
    code: 'MO-IT210',
    credits: 3,
    sections: [
      {
        sectionName: 'A4321',
        schedule: {
          days: 'MW',
          time: '10:00 - 11:30 AM',
        },
        takenSlots: 12,
        maxSlots: 35,
      },
    ],
  },
  {
    id: 5,
    name: 'Database Systems',
    code: 'MO-BS301',
    credits: 3,
    sections: [
      {
        sectionName: 'S8765',
        schedule: {
          days: 'TTh',
          time: '1:30 - 3:00 PM',
        },
        takenSlots: 8,
        maxSlots: 20,
      },
    ],
  },
  {
    id: 6,
    name: 'Human-Computer Interaction',
    code: 'MO-IT405',
    credits: 3,
    sections: [
      {
        sectionName: 'H9876',
        schedule: {
          days: 'F',
          time: '9:00 - 12:00 PM',
        },
        takenSlots: 5,
        maxSlots: 25,
      },
    ],
  },
  {
    id: 7,
    name: 'Introduction to Psychology',
    code: 'MO-BS101',
    credits: 3,
    sections: [
      {
        sectionName: 'A1111',
        schedule: {
          days: 'MWF',
          time: '9:00 - 10:00 AM',
        },
        takenSlots: 18,
        maxSlots: 40,
      },
    ],
  },
  {
    id: 8,
    name: 'Calculus I',
    code: 'MO-BS150',
    credits: 3,
    sections: [
      {
        sectionName: 'A2222',
        schedule: {
          days: 'TTh',
          time: '8:00 - 9:30 AM',
        },
        takenSlots: 20,
        maxSlots: 25,
      },
    ],
  },
  {
    id: 9,
    name: 'Computer Networks',
    code: 'MO-IT320',
    credits: 3,
    sections: [
      {
        sectionName: 'H3333',
        schedule: {
          days: 'MW',
          time: '3:00 - 4:30 PM',
        },
        takenSlots: 7,
        maxSlots: 30,
      },
    ],
  },
  {
    id: 10,
    name: 'System Analysis and Design',
    code: 'MO-IT410',
    credits: 3,
    sections: [
      {
        sectionName: 'S4444',
        schedule: {
          days: 'T',
          time: '1:00 - 4:00 PM',
        },
        takenSlots: 10,
        maxSlots: 15,
      },
    ],
  },
  {
    id: 11,
    name: 'Professional Ethics',
    code: 'MO-BS220',
    credits: 3,
    sections: [
      {
        sectionName: 'A5555',
        schedule: {
          days: 'W',
          time: '10:00 - 12:00 PM',
        },
        takenSlots: 11,
        maxSlots: 20,
      },
    ],
  },
]

interface IEnrollmentPeriodAdminQuery {
  search: string
  page: number
}

function EnrollmentPeriodAdminQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
  },
}: {
  children: (props: {
    courseData: typeof mockCourseData
    message: string
    totalPages: number
  }) => ReactNode
  props?: IEnrollmentPeriodAdminQuery
}) {
  const { search, page } = props

  // const { data } = useSuspenseQuery(
  //   usersControllerFindAllOptions({
  //     query: { search, page, ...(role && { role }) },
  //   }),
  // )

  const courseData = mockCourseData

  const limit = 10
  const total = mockCourseData.length
  const totalPages = 1

  const message = formatPaginationMessage({ limit, page, total })

  return children({
    courseData,
    message,
    totalPages,
  })
}

function EnrollmentPeriodIdPage() {
  const navigate = useNavigate()
  const { periodId } = route.useParams()

  const searchParam: {
    search: string
  } = route.useSearch()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
  }

  const [query, setQuery] =
    useState<IEnrollmentPeriodAdminQuery>(queryDefaultValues)

  return (
    <Container fluid m={0} pb={'lg'}>
      <Stack>
        <Paper radius={'md'}>
          <Group py={'md'} justify={'space-between'} align="center">
            <Flex align={'center'}>
              <Group>
                <ActionIcon
                  radius={'xl'}
                  variant="subtle"
                  size={'lg'}
                  onClick={() =>
                    navigate({
                      to: '..',
                    })
                  }
                >
                  <IconArrowLeft />
                </ActionIcon>
                <Title c={'dark.7'} order={3} fw={700}>
                  2023 - 2024
                </Title>
                <Divider orientation="vertical" />
                <Title c={'dark.7'} order={3} fw={700}>
                  Term 2
                </Title>
              </Group>
            </Flex>
            <Flex align={'center'} gap={5}>
              <TextInput
                placeholder="Search name/email"
                radius={'md'}
                leftSection={<IconSearch size={18} stroke={1} />}
                w={rem(250)}
              />
              <Popover position="bottom" width={rem(300)}>
                <Popover.Target>
                  <Button
                    variant="default"
                    radius={'md'}
                    leftSection={<IconFilter2 color="gray" size={20} />}
                    lts={rem(0.25)}
                  >
                    Filters
                  </Button>
                </Popover.Target>
                <Popover.Dropdown bg="var(--mantine-color-body)">
                  <Stack>
                    <Flex justify={'space-between'}>
                      <Title fw={500} c={'dark.8'} order={4}>
                        Filter Users
                      </Title>

                      <UnstyledButton
                        styles={{
                          root: {
                            textDecoration: 'underline',
                          },
                        }}
                        c={'primary'}
                      >
                        Reset Filter
                      </UnstyledButton>
                    </Flex>

                    <Stack gap={'xs'}>
                      <Text fw={500} c={'gray.7'} fz={'sm'}>
                        Role
                      </Text>
                    </Stack>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
              <Button
                variant="filled"
                radius={'md'}
                leftSection={<IconPlus size={20} />}
                lts={rem(0.25)}
                onClick={() =>
                  navigate({
                    to: `/enrollment/${periodId}/create`,
                  })
                }
              >
                Create
              </Button>
            </Flex>
          </Group>

          <Divider />

          <Accordion variant="filled">
            {mockCourseData.map((course, index) => (
              <Fragment key={course.id}>
                <Accordion.Item value={course.id.toString()}>
                  <Accordion.Control py={rem(5)}>
                    <Group justify="space-between">
                      <Stack gap={rem(0)}>
                        <Text fw={500} fz={'md'}>
                          {course.name}
                        </Text>
                        <Stack gap={rem(5)}>
                          <Text fw={500} fz={'xs'} c={'dark.3'}>
                            {course.code}
                          </Text>
                          <Badge
                            c="gray.6"
                            variant="light"
                            radius="sm"
                            size="sm"
                          >
                            {course.sections.length} section(s)
                          </Badge>
                        </Stack>
                      </Stack>

                      <ActionIcon
                        component="div"
                        variant="subtle"
                        c={'red.4'}
                        size={'lg'}
                        radius={'xl'}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Accordion.Control>

                  <Accordion.Panel>
                    <Stack>
                      <Divider />
                      <Stack gap={'xs'}>
                        <Button
                          size="md"
                          className="border-gray-300"
                          variant="default"
                          radius={'md'}
                          c={'dark.4'}
                        >
                          <Group gap={rem(5)}>
                            <IconPlus size={18} />
                            <Text fz={'sm'} fw={500}>
                              Add Section
                            </Text>
                          </Group>
                        </Button>
                        {course.sections.map((section) => (
                          <Card
                            key={section.sectionName}
                            withBorder
                            radius="md"
                            py="sm"
                          >
                            <Group justify="space-between" align="center">
                              <Stack gap={2}>
                                <Group gap="xs">
                                  <Text fw={600} size="md">
                                    {section.sectionName}
                                  </Text>
                                  <Text c="dimmed" size="xs">
                                    Morning
                                  </Text>
                                </Group>
                                <Text c="dimmed" size="sm">
                                  {section.schedule.days} |{' '}
                                  {section.schedule.time}
                                </Text>
                              </Stack>
                              <Stack gap={'xs'} align="flex-end">
                                <Group gap={rem(5)}>
                                  <ActionIcon
                                    variant="subtle"
                                    c={'dark.3'}
                                    size={'md'}
                                    radius={'xl'}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconPencil size={18} />
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="subtle"
                                    c={'red.4'}
                                    size={'md'}
                                    radius={'xl'}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconTrash size={18} />
                                  </ActionIcon>
                                </Group>
                                <Badge c="gray.6" variant="light" radius="sm">
                                  {section.takenSlots} / {section.maxSlots}{' '}
                                  slots
                                </Badge>
                              </Stack>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
                <Divider hidden={index == mockCourseData.length - 1} />
              </Fragment>
            ))}
          </Accordion>
        </Paper>

        <EnrollmentPeriodAdminQueryProvider>
          {(props) => (
            <Group justify="flex-end">
              <Text size="sm">{props.message}</Text>
              <Pagination
                total={props.totalPages}
                value={query.page}
                withPages={false}
              />
            </Group>
          )}
        </EnrollmentPeriodAdminQueryProvider>
      </Stack>
    </Container>
  )
}

export default EnrollmentPeriodIdPage
