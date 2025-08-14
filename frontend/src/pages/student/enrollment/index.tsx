import { formatPaginationMessage } from '@/utils/formatters'
import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Flex,
  Group,
  Pagination,
  Paper,
  Popover,
  rem,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { IconFilter2, IconSearch, type ReactNode } from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

const route = getRouteApi('/(protected)/enrollment/')

const tabsData = [
  {
    value: 'course-selection',
    label: 'Course Selection',
    Component: CourseSelectionPanel,
  },
  {
    value: 'finalization',
    label: 'Finalization',
    Component: FinalizationPanel,
  },
]

interface IPaymentScheme {
  paymentTypeId: string
  paymentType: string
  paymentDescription: string
  paymentBreakdown: string
}

const paymentSchemeData = [
  {
    paymentTypeId: 'full-payment',
    paymentType: 'Full Payment',
    paymentDescription: 'No Interest • 1 Payment',
    paymentBreakdown: '100% at Enrollment',
  },
  {
    paymentTypeId: 'installment-plan-1',
    paymentType: 'Installment Plan 1',
    paymentDescription: '5% Interest • 3 Payments',
    paymentBreakdown:
      '40% at enrollment • 30% first payment • 30% second payment',
  },
  {
    paymentTypeId: 'installment-plan-2',
    paymentType: 'Installment Plan 2',
    paymentDescription: '7.5% Interest • 3 Payments',
    paymentBreakdown:
      '20% at enrollment • 40% first payment • 40% second payment',
  },
] as IPaymentScheme[]

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

interface IEnrollmentQuery {
  search: string
  page: number
}

function EnrollmentQueryProvider({
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
  props?: IEnrollmentQuery
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

function EnrollmentStudentPage() {
  return (
    <Container size={'md'} w={'100%'} pb={'xl'}>
      <Stack gap={'xl'}>
        {/* Page Hero */}
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Enrollment
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage your enrollment for this semester.
          </Text>
        </Box>

        {/* Main Tabs */}
        {/* Don't modify page layout here. Instead,
        modify each component provided in tabsData */}

        <Tabs defaultValue={tabsData[0].value} inverted radius={'md'}>
          <Stack>
            <Tabs.List grow>
              {tabsData.map((tab) => (
                <Tabs.Tab
                  style={{
                    borderTopWidth: rem(5),
                  }}
                  key={tab.value}
                  value={tab.value}
                >
                  <Text fw={500} fz={'sm'} c={'dark.5'}>
                    {tab.label}
                  </Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {tabsData.map((tab) => (
              <Tabs.Panel key={tab.value + '-panel'} value={tab.value}>
                <tab.Component />
              </Tabs.Panel>
            ))}
          </Stack>
        </Tabs>
      </Stack>
    </Container>
  )
}

function CourseSelectionPanel() {
  const searchParam: {
    search: string
  } = route.useSearch()
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
  }

  const [query, setQuery] = useState<IEnrollmentQuery>(queryDefaultValues)

  return (
    <Stack>
      <Paper radius={'md'}>
        <Flex p={'sm'} justify={'space-between'}>
          <SegmentedControl
            className="grow max-w-2xs"
            bd={'1px solid gray.2'}
            radius={'md'}
            data={['All', 'Enrolled', 'Not Enrolled']}
            color="primary"
          />

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
          </Flex>
        </Flex>

        <Divider />

        <Accordion variant="filled">
          {mockCourseData.map((course, index) => (
            <Fragment key={course.id}>
              <Accordion.Item value={course.id.toString()}>
                <Accordion.Control py={rem(5)}>
                  <Stack gap={rem(0)}>
                    <Text fw={500} fz={'md'}>
                      {course.name}
                    </Text>
                    <Text fw={500} fz={'xs'} c={'dark.3'}>
                      {course.code}
                    </Text>
                  </Stack>
                </Accordion.Control>

                <Accordion.Panel>
                  <Stack>
                    <Divider />
                    <Stack gap={'xs'}>
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
                              <Button size="xs" radius={'lg'}>
                                Enroll
                              </Button>
                              <Badge c="gray.6" variant="light" radius="sm">
                                {section.takenSlots} / {section.maxSlots} slots
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

      <EnrollmentQueryProvider>
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
      </EnrollmentQueryProvider>
    </Stack>
  )
}

function FinalizationPanel() {
  const [selectedPaymentScheme, setSelectedPaymentScheme] = useState<string>('')

  return (
    <Box p="lg">
      <Stack gap={'md'}>
        <Stack gap={rem(5)}>
          <Title order={3}>Finalize Enrollment</Title>
          <Text fw={600} size="sm" c="dimmed">
            Enrolled Courses
          </Text>
        </Stack>

        <Stack gap="xs">
          <EnrolledCourseCard
            courseName="Capstone 1"
            courseCode="MO-IT200"
            sectionName="A2101"
            sectionSchedule={{
              day: 'MWF',
              time: '8:00 - 9:00 AM',
            }}
          />
          <EnrolledCourseCard
            courseName="Web Technology Applications"
            courseCode="MO-IT200"
            sectionName="A2101"
            sectionSchedule={{
              day: 'MWF',
              time: '8:00 - 9:00 AM',
            }}
          />
        </Stack>

        <Stack pt={'xs'} gap={'xs'}>
          <Text fw={600} size="sm" c="dimmed">
            Payment Scheme
          </Text>
          <Group>
            {paymentSchemeData.map((scheme) => (
              <PaymentPlanCard
                key={scheme.paymentTypeId}
                props={{
                  ...scheme,
                  selectedPaymentScheme,
                  setSelectedPaymentScheme,
                }}
              />
            ))}
          </Group>
        </Stack>

        <Button disabled={!selectedPaymentScheme} ml={'auto'}>
          Finalize
        </Button>
      </Stack>
    </Box>
  )
}

function EnrolledCourseCard({
  courseName,
  courseCode,
  sectionName,
  sectionSchedule,
}: {
  courseName: string
  courseCode: string
  sectionName: string
  sectionSchedule: {
    day: string
    time: string
  }
}) {
  return (
    <Card withBorder radius="md" p="md" className="flex-1">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4} miw={0} className="truncate">
          <Text fw={600} size="md" truncate="end">
            {courseName}
          </Text>
          <Text fw={500} fz={'xs'} c={'dark.3'}>
            {courseCode}
          </Text>
        </Stack>
        <Stack gap={4} miw={'fit-content'}>
          <Group gap="xs" justify="end">
            <Text fw={600} size="md">
              {sectionName}
            </Text>
          </Group>
          <Group gap="xs" justify="end">
            <Text c="dimmed" size="sm">
              {sectionSchedule.day} | {sectionSchedule.time}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

function PaymentPlanCard({
  props,
}: {
  props: IPaymentScheme & {
    selectedPaymentScheme: string
    setSelectedPaymentScheme: React.Dispatch<React.SetStateAction<string>>
  }
}) {
  const handleSelectPaymentScheme = () => {
    props.setSelectedPaymentScheme((prev) =>
      prev === props.paymentTypeId ? '' : props.paymentTypeId,
    )
  }

  return (
    <UnstyledButton className="flex-1/4" onClick={handleSelectPaymentScheme}>
      <Paper radius="md" withBorder py="lg" px={'xl'}>
        <Stack align="center" justify="space-between">
          <Checkbox
            size="md"
            tabIndex={-1}
            checked={props.selectedPaymentScheme === props.paymentTypeId}
            onChange={() => {}}
          />
          <Stack gap={4} align="center">
            <Text fw={500}>{props.paymentType}</Text>
            <Text truncate size="sm" c="dimmed">
              {props.paymentDescription}
            </Text>
          </Stack>
          <Tooltip label={props.paymentBreakdown} position="bottom">
            <Text fz="xs" c="blue" mt="xs" td="underline">
              View payment breakdown
            </Text>
          </Tooltip>
        </Stack>
      </Paper>
    </UnstyledButton>
  )
}

export default EnrollmentStudentPage
