import { SuspendedPagination } from '@/components/suspense-pagination'
import { SuspendedAdminEnrollmentCourseOfferingCards } from '@/features/enrollment/suspense'
import {
  type CourseOfferingControllerFindCourseOfferingsByPeriodData,
  type DetailedCourseEnrollmentDto,
  type DetailedCourseOfferingDto,
  type DetailedCourseSectionDto,
  type EnrollmentPeriodDto,
} from '@/integrations/api/client'
import {
  courseEnrollmentControllerCreateCourseEnrollmentMutation,
  courseEnrollmentControllerDropCourseEnrollmentMutation,
  courseEnrollmentControllerFinalizeCourseEnrollmentMutation,
  courseEnrollmentControllerGetCourseEnrollmentsOptions,
  courseOfferingControllerFindCourseOfferingsByPeriodOptions,
  enrollmentControllerFindActiveEnrollmentOptions,
  enrollmentControllerFindActiveEnrollmentQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  formatDaysAbbrev,
  formatPaginationMessage,
  formatToSchoolYear,
  formatToTimeOfDay,
} from '@/utils/formatters'
import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Popover,
  rem,
  SegmentedControl,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconBook,
  IconFilter2,
  IconSearch,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

const route = getRouteApi('/(protected)/enrollment/')

const { queryClient } = getContext()

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

const segmentedControlData = [
  {
    label: 'All',
    value: 'all' satisfies IEnrollmentStudentQuery['status'],
  },
  {
    label: 'Enrolled',
    value: 'enrolled' satisfies IEnrollmentStudentQuery['status'],
  },
  {
    label: 'Not Enrolled',
    value: 'not enrolled' satisfies IEnrollmentStudentQuery['status'],
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

interface IEnrollmentStudentQuery {
  search: string
  page: number
  status:
    | NonNullable<
        CourseOfferingControllerFindCourseOfferingsByPeriodData['query']
      >['status']
    | 'all'
}

function EnrollmentStudentQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    status: undefined,
  },
}: {
  children: (props: {
    enrollmentPeriodData: EnrollmentPeriodDto
    courseOfferings: DetailedCourseOfferingDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: IEnrollmentStudentQuery
}) {
  const { search, page, status } = props

  const { data: enrollmentPeriodData } = useSuspenseQuery(
    enrollmentControllerFindActiveEnrollmentOptions(),
  )

  const { data: courseData } = useSuspenseQuery(
    courseOfferingControllerFindCourseOfferingsByPeriodOptions({
      query: {
        page: page,
        search: search || undefined,
        status: status == 'all' ? undefined : status,
      },
      path: {
        enrollmentId: enrollmentPeriodData.id,
      },
    }),
  )

  const courseOfferings = courseData.courseOfferings

  const limit = 10
  const total = courseOfferings.length
  const totalPages = 1

  const message = formatPaginationMessage({
    page,
    total,
    limit,
  })

  console.log(courseOfferings)

  return children({
    enrollmentPeriodData,
    courseOfferings,
    message,
    totalPages,
  })
}

function EnrollmentStudentFinalizationQueryProvider({
  children,
}: {
  children: (props: {
    enrolledCourses: DetailedCourseEnrollmentDto[]
  }) => ReactNode
}) {
  const { data: enrolledCourses } = useSuspenseQuery(
    courseEnrollmentControllerGetCourseEnrollmentsOptions(),
  )

  return children({ enrolledCourses })
}

function EnrollmentStudentPage() {
  return (
    <Container size={'md'} w={'100%'} pb={'xl'}>
      <Stack gap={'xl'}>
        {/* Page Hero */}
        <Group justify="space-between" align="start">
          <Box>
            <Title c={'dark.7'} order={2} fw={700}>
              Enrollment
            </Title>
            <Text c={'dark.3'} fw={500}>
              Manage your enrollment for this semester.
            </Text>
          </Box>
          <Suspense
            fallback={<Skeleton height={40} width={rem(250)} radius="md" />}
          >
            <EnrollmentStudentQueryProvider>
              {({ enrollmentPeriodData }) => (
                <Group>
                  <Title c={'dark.7'} order={2} fw={700}>
                    {formatToSchoolYear(
                      enrollmentPeriodData.startYear,
                      enrollmentPeriodData.endYear,
                    )}
                  </Title>
                  <Divider orientation="vertical" />
                  <Title c={'dark.7'} order={2} fw={700}>
                    Term {enrollmentPeriodData.term}
                  </Title>
                </Group>
              )}
            </EnrollmentStudentQueryProvider>
          </Suspense>
        </Group>

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
    status: IEnrollmentStudentQuery['status']
  } = route.useSearch()
  const navigate = useNavigate()

  const queryDefaultValues = {
    search: searchParam.search || '',
    page: 1,
    status: searchParam.status || 'all',
  } satisfies IEnrollmentStudentQuery

  const [query, setQuery] =
    useState<IEnrollmentStudentQuery>(queryDefaultValues)

  const handleSegmentedControlChange = (
    value: IEnrollmentStudentQuery['status'],
  ) => {
    setQuery((prev) => ({ ...prev, status: value }))

    navigate({
      to: '/enrollment',
      search: (prev) => ({
        ...prev,
        status: value !== 'all' ? value : undefined,
      }),
    })
  }

  return (
    <Stack>
      <Paper radius={'md'}>
        <Group py={'sm'} justify={'space-between'}>
          <SegmentedControl
            className="grow max-w-2xs"
            bd={'1px solid gray.2'}
            radius={'md'}
            data-cy="enrollment-tabs" // Add to the container
            data={segmentedControlData}
            color="primary"
            defaultValue={query.status}
            onChange={(e) =>
              handleSegmentedControlChange(
                e as IEnrollmentStudentQuery['status'],
              )
            }
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
        </Group>

        <Divider />

        <Accordion variant="filled">
          <Suspense fallback={<SuspendedAdminEnrollmentCourseOfferingCards />}>
            <EnrollmentStudentQueryProvider props={query}>
              {({ enrollmentPeriodData, courseOfferings }) => (
                <>
                  {courseOfferings.length === 0 && (
                    <Stack
                      gap={0}
                      align="center"
                      justify="center"
                      py="xl"
                      c="dark.3"
                    >
                      <IconBook size={36} stroke={1.5} />
                      <Text mt="sm" fw={500}>
                        Nothing here
                      </Text>
                      <Text fz="sm" c="dark.2" ta="center" maw={360}>
                        Adjust your filters if necessary.
                      </Text>
                    </Stack>
                  )}
                  {courseOfferings.map((course, index) => (
                    <Fragment key={course.id}>
                      <Accordion.Item
                        value={course.id.toString()}
                        pos={'relative'}
                      >
                        <Accordion.Control py={rem(5)}>
                          <CourseOfferingAccordionControl
                            course={course}
                            periodId={enrollmentPeriodData.id}
                          />
                        </Accordion.Control>

                        <Accordion.Panel>
                          <CourseOfferingAccordionPanel course={course} />
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Divider hidden={index == courseOfferings.length - 1} />
                    </Fragment>
                  ))}
                </>
              )}
            </EnrollmentStudentQueryProvider>
          </Suspense>
        </Accordion>
      </Paper>

      <Suspense fallback={<SuspendedPagination />}>
        <EnrollmentStudentQueryProvider>
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
        </EnrollmentStudentQueryProvider>
      </Suspense>
    </Stack>
  )
}

function FinalizationPanel() {
  const [selectedPaymentScheme, setSelectedPaymentScheme] = useState<string>('')

  const { mutateAsync: finalizeMutate } = useAppMutation(
    courseEnrollmentControllerFinalizeCourseEnrollmentMutation,
    {
      loading: {
        title: 'Finalizing enrollment',
        message: 'Please wait while we finalize your enrollment.',
      },
      success: {
        title: 'Enrollment finalized',
        message: 'Your enrollment has been successfully finalized.',
      },
      error: {
        title: 'Error finalizing enrollment',
        message:
          'There was an error finalizing your enrollment. Please try again.',
      },
    },
  )

  const handleFinalizeEnrollment = async () => {
    modals.openConfirmModal({
      title: 'Confirm Finalization',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to finalize your enrollment? This action cannot
          be undone.
        </Text>
      ),
      labels: { confirm: 'Finalize', cancel: 'Cancel' },
      onConfirm: async () =>
        // Call the mutation
        await finalizeMutate({}),
    })
  }

  return (
    <Box p="lg">
      <Stack gap={'md'}>
        <Stack gap={rem(5)}>
          <Title order={3}>Finalize Enrollment</Title>
          <Text fw={600} size="sm" c="dimmed">
            Enrolled Courses
          </Text>
        </Stack>

        <EnrollmentStudentFinalizationQueryProvider>
          {({ enrolledCourses }) => (
            <Stack gap="xs">
              {enrolledCourses.length === 0 && (
                <Center py="md">
                  <Stack gap={4} align="center">
                    <IconBook
                      size={28}
                      stroke={1.5}
                      color="var(--mantine-color-dimmed)"
                    />
                    <Text fw={600} size="sm">
                      No enrolled courses found
                    </Text>
                    <Text size="xs" c="dimmed">
                      Once you enroll, your courses will appear here.
                    </Text>
                  </Stack>
                </Center>
              )}
              {enrolledCourses.map((enrolledCourse) => (
                <EnrolledCourseCard
                  courseName={enrolledCourse.courseOffering?.course.name!}
                  courseCode={enrolledCourse.courseOffering?.course.courseCode!}
                  sectionName={enrolledCourse.courseSection?.name!}
                  sectionSchedule={{
                    day: formatDaysAbbrev(enrolledCourse.courseSection?.days),
                    time: `${enrolledCourse.courseSection?.startSched!} - ${enrolledCourse.courseSection?.endSched!}`,
                  }}
                  mentor={
                    enrolledCourse.courseSection?.user
                      ? `${enrolledCourse.courseSection?.user?.firstName} ${enrolledCourse.courseSection?.user?.lastName}`
                      : 'No Mentor Assigned'
                  }
                />
              ))}
            </Stack>
          )}
        </EnrollmentStudentFinalizationQueryProvider>

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

        <EnrollmentStudentFinalizationQueryProvider>
          {({ enrolledCourses }) => (
            <Button
              disabled={
                !selectedPaymentScheme ||
                enrolledCourses.length === 0 ||
                enrolledCourses.some((course) => course.status == 'finalized')
              }
              ml={'auto'}
              onClick={handleFinalizeEnrollment}
            >
              Finalize
            </Button>
          )}
        </EnrollmentStudentFinalizationQueryProvider>
      </Stack>
    </Box>
  )
}

function EnrolledCourseCard({
  courseName,
  courseCode,
  sectionName,
  sectionSchedule,
  mentor,
}: {
  courseName: string
  courseCode: string
  sectionName: string
  sectionSchedule: {
    day: string
    time: string
  }
  mentor: string
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
          <Text c={'gray.6'} size="sm">
            {mentor}
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

function CourseOfferingAccordionControl({
  course,
  periodId,
}: {
  course: DetailedCourseOfferingDto
  periodId: string
}) {
  return (
    <Group justify="space-between">
      <Stack gap={rem(0)}>
        <Text fw={500} fz={'md'}>
          {course.course.name}
        </Text>
        <Stack gap={rem(5)}>
          <Text fw={500} fz={'xs'} c={'dark.3'}>
            {course.course.courseCode}
          </Text>
          <Badge c="gray.6" variant="light" radius="sm" size="sm">
            {course.courseSections.length} section(s)
          </Badge>
        </Stack>
      </Stack>
    </Group>
  )
}

function CourseOfferingAccordionPanel({
  course,
}: {
  course: DetailedCourseOfferingDto
}) {
  return (
    <Stack>
      <Divider />
      <Stack gap={'xs'}>
        {course.courseSections.map((section) => (
          <CourseOfferingSubjectCard
            key={section.id}
            section={section}
            course={course}
          />
        ))}
      </Stack>
    </Stack>
  )
}

function CourseOfferingSubjectCard({
  section,
  course,
}: {
  section: DetailedCourseSectionDto
  course: DetailedCourseOfferingDto
}) {
  const { mutateAsync: enrollMutate, isPending: enrollIsPending } =
    useAppMutation(
      courseEnrollmentControllerCreateCourseEnrollmentMutation,
      {
        loading: {
          title: 'Enrolling in ' + course.course.name,
          message: 'Please wait...',
        },
        success: {
          title: 'Successfully enrolled in ' + course.course.name,
          message: 'You have been enrolled in the course.',
        },
        error: {
          title: 'Failed to enroll in ' + course.course.name,
          message: 'Please try again later.',
        },
      },
      {
        onSuccess: async () => {
          const activeEnrollmentKey =
            enrollmentControllerFindActiveEnrollmentQueryKey()

          await queryClient.cancelQueries({ queryKey: activeEnrollmentKey })

          await queryClient.invalidateQueries({ queryKey: activeEnrollmentKey })

          await queryClient.cancelQueries({
            predicate: (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey[0]?._id ===
                'courseOfferingControllerFindCourseOfferingsByPeriod',
          })

          await queryClient.invalidateQueries({
            predicate: (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey[0]?._id ===
                'courseOfferingControllerFindCourseOfferingsByPeriod',
          })
        },
      },
    )

  const { mutateAsync: dropMutate, isPending: dropIsPending } = useAppMutation(
    courseEnrollmentControllerDropCourseEnrollmentMutation,
    {
      loading: {
        title: 'Dropping course enrollment',
        message: 'Please wait...',
      },
      success: {
        title: 'Successfully dropped course enrollment',
        message: 'You have been dropped from the course.',
      },
      error: {
        title: 'Failed to drop course enrollment',
        message: 'Please try again later.',
      },
    },
    {
      onSuccess: async () => {
        const activeEnrollmentKey =
          enrollmentControllerFindActiveEnrollmentQueryKey()

        await queryClient.cancelQueries({ queryKey: activeEnrollmentKey })

        await queryClient.invalidateQueries({ queryKey: activeEnrollmentKey })

        await queryClient.cancelQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id ===
              'courseOfferingControllerFindCourseOfferingsByPeriod',
        })

        await queryClient.invalidateQueries({
          predicate: (query) => {
            console.log(query)
            return (
              Array.isArray(query.queryKey) &&
              query.queryKey[0]?._id ===
                'courseOfferingControllerFindCourseOfferingsByPeriod'
            )
          },
        })
      },
    },
  )

  const isEnrolled = course.courseEnrollment.find(
    (enrolled) => enrolled.courseSectionId == section.id,
  )

  return (
    <Card key={section.id} withBorder radius="md" py="sm" pos={'relative'}>
      <LoadingOverlay
        visible={dropIsPending || enrollIsPending}
        zIndex={10} // This is to avoid unnecessary flashing of the blur
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Box>
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Group gap="xs">
              <Text fw={600} size="md">
                {section.name}
              </Text>
              <Text c="dimmed" size="xs">
                {formatToTimeOfDay(section.startSched, section.endSched)}
              </Text>
            </Group>
            <Text c="dimmed" size="sm">
              {formatDaysAbbrev(section.days)} | {section.startSched} -{' '}
              {section.endSched}
            </Text>
            <Text c={'gray.6'} size="sm">
              {section.mentorId
                ? `${section.user?.firstName} ${section.user?.lastName}`
                : 'No Mentor Assigned'}
            </Text>
          </Stack>
          <Stack gap={'xs'} align="flex-end">
            {isEnrolled ? (
              <Button
                size="xs"
                radius={'lg'}
                onClick={() =>
                  dropMutate({
                    path: {
                      sectionId: section.id,
                    },
                    body: {},
                  })
                }
              >
                Drop
              </Button>
            ) : (
              <Button
                disabled={course.courseEnrollment.length > 0}
                size="xs"
                radius={'lg'}
                onClick={() =>
                  enrollMutate({
                    path: {
                      sectionId: section.id,
                    },
                    body: {},
                  })
                }
              >
                Enroll
              </Button>
            )}
            <Badge c="gray.6" variant="light" radius="sm">
              {section.maxSlot} / {section.maxSlot} slots
            </Badge>
          </Stack>
        </Group>
      </Box>
    </Card>
  )
}

export default EnrollmentStudentPage
