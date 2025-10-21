import { SuspendedPagination } from '@/components/suspense-pagination'
import { isEnrollmentFinalized } from '@/features/enrollment/helpers'
import {
  SuspendedAdminEnrollmentCourseOfferingCards,
  SuspendedStudentEnrollmentFinalizationSectionCards,
} from '@/features/enrollment/suspense'
import type { IPaymentScheme } from '@/features/enrollment/types'
import {
  enrollmentStatusOptions,
  paymentSchemeData,
} from '@/features/enrollment/validation'
import { useSearchState } from '@/hooks/use-search-state'
import {
  type DetailedCourseEnrollmentDto,
  type DetailedCourseOfferingDto,
  type DetailedCourseSectionDto,
  type EnrollmentPeriodDto,
  type PaymentScheme,
} from '@/integrations/api/client'
import {
  courseEnrollmentControllerCreateCourseEnrollmentMutation,
  courseEnrollmentControllerDropCourseEnrollmentMutation,
  courseEnrollmentControllerFinalizeCourseEnrollmentMutation,
  courseEnrollmentControllerGetCourseEnrollmentsOptions,
  courseEnrollmentControllerGetCourseEnrollmentsQueryKey,
  courseOfferingControllerFindCourseOfferingsByPeriodOptions,
  enrollmentControllerFindActiveEnrollmentOptions,
  enrollmentControllerFindActiveEnrollmentQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import type { EnrollmentSearchSchema } from '@/routes/(protected)/enrollment'
import {
  formatDaysAbbrev,
  formatMetaToPagination,
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
  Grid,
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
import {
  useSuspenseQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

const route = getRouteApi('/(protected)/enrollment/')

const { queryClient } = getContext()

export const tabsData = [
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

function EnrollmentStudentQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    status: undefined,
  },
}: {
  children: (props: {
    enrollmentPeriodData: EnrollmentPeriodDto | undefined
    courseOfferings: DetailedCourseOfferingDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: EnrollmentSearchSchema
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
        enrollmentId: enrollmentPeriodData?.id || '',
      },
    }),
  )

  const courseOfferings = courseData?.courseOfferings || []

  const { totalPages, message } = formatMetaToPagination({
    limit: 10,
    page,
    meta: courseData?.meta!,
  })

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
    refetch: (
      options?: RefetchOptions | undefined,
    ) => Promise<QueryObserverResult<DetailedCourseEnrollmentDto[], Error>>
  }) => ReactNode
}) {
  const { data: enrolledCourses, refetch } = useSuspenseQuery({
    ...courseEnrollmentControllerGetCourseEnrollmentsOptions(),
  })

  return children({ enrolledCourses, refetch })
}

function EnrollmentStudentPage() {
  const { search, setDebouncedSearch } = useSearchState(route)

  const handleChangeTab = (
    value: (typeof tabsData)[number]['value'] | null,
  ) => {
    if (!value) return

    setDebouncedSearch({
      tab: value !== 'course-selection' ? value : undefined,
    })
  }

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
                    {enrollmentPeriodData?.startYear
                      ? formatToSchoolYear(
                          enrollmentPeriodData.startYear,
                          enrollmentPeriodData.endYear,
                        )
                      : 'No active enrollment period'}
                  </Title>
                  <Divider orientation="vertical" />
                  <Title c={'dark.7'} order={2} fw={700}>
                    {enrollmentPeriodData?.term
                      ? 'Term ' + enrollmentPeriodData.term
                      : 'N/A'}
                  </Title>
                </Group>
              )}
            </EnrollmentStudentQueryProvider>
          </Suspense>
        </Group>

        {/* Main Tabs */}
        {/* Don't modify the page layout here. Instead,
        modify each component provided in tabsData */}

        <Tabs
          defaultValue={search.tab || tabsData[0].value}
          onChange={(e) => handleChangeTab(e)}
          inverted
          radius={'md'}
        >
          <Stack>
            <Tabs.List grow>
              <Suspense fallback={<Skeleton height={30} radius="md" />}>
                <EnrollmentStudentFinalizationQueryProvider>
                  {({ enrolledCourses, refetch }) => (
                    <>
                      {tabsData.map((tab) => (
                        <Tabs.Tab
                          disabled={
                            tab.value === 'course-selection' &&
                            isEnrollmentFinalized(enrolledCourses)
                          }
                          style={{
                            borderTopWidth: rem(5),
                          }}
                          key={tab.value}
                          value={tab.value}
                          onClick={() =>
                            // This will refetch the enrolled courses when switching to finalization tab
                            // Which is useful when the user has enrolled something in the course selection tab
                            tab.value == 'finalization' && refetch()
                          }
                        >
                          <Text fw={500} fz={'sm'} c={'dark.5'}>
                            {tab.label}
                          </Text>
                        </Tabs.Tab>
                      ))}
                    </>
                  )}
                </EnrollmentStudentFinalizationQueryProvider>
              </Suspense>
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
  const { search, setDebouncedSearch } = useSearchState(route)

  const handleSegmentedControlChange = (
    value: EnrollmentSearchSchema['status'],
  ) => {
    setDebouncedSearch({ status: value })

    // Invalidate the course offerings query here so it only refetches
    // on the enrolled and not enrolled tab and it retriggers suspense
    if (value == 'enrolled' || value == 'not enrolled')
      queryClient.removeQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0]?._id ===
            'courseOfferingControllerFindCourseOfferingsByPeriod',
      })
  }

  return (
    <Stack>
      <Paper radius={'md'}>
        <Group py={'sm'} justify={'space-between'}>
          <SegmentedControl
            className="grow xs:max-w-2xs xs:min-w-2xs"
            bd={'1px solid gray.2'}
            radius={'md'}
            data-cy="enrollment-tabs" // Add to the container
            data={[...enrollmentStatusOptions]}
            color="primary"
            defaultValue={search.status}
            onChange={(e) =>
              handleSegmentedControlChange(
                e as EnrollmentSearchSchema['status'],
              )
            }
            fullWidth
            w={{
              base: '100%',
              xs: 'auto',
            }}
          />

          <Flex
            wrap={'wrap'}
            w={{
              base: '100%',
              xs: 'auto',
            }}
            align={'center'}
            gap={5}
            ml={{
              base: 0,
              xs: 'auto',
            }}
          >
            <TextInput
              placeholder="Search name/email"
              radius={'md'}
              leftSection={<IconSearch size={18} stroke={1} />}
              w={{
                base: '100%',
                xs: rem(250),
              }}
            />
            <Popover position="bottom" width={rem(300)}>
              <Popover.Target>
                <Button
                  variant="default"
                  radius={'md'}
                  leftSection={<IconFilter2 color="gray" size={20} />}
                  lts={rem(0.25)}
                  w={{
                    base: '100%',
                    xs: 'auto',
                  }}
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
            <EnrollmentStudentQueryProvider props={search}>
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
                            periodId={enrollmentPeriodData?.id}
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
                value={search.page || 1}
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
  const [selectedPaymentScheme, setSelectedPaymentScheme] =
    useState<PaymentScheme | null>(null)

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
    {
      onSuccess: async () => {
        const enrolledCoursesKey =
          courseEnrollmentControllerGetCourseEnrollmentsQueryKey()

        await queryClient.cancelQueries({ queryKey: enrolledCoursesKey })

        await queryClient.invalidateQueries({ queryKey: enrolledCoursesKey })
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
      onConfirm: async () => {
        // Call the mutation
        if (!selectedPaymentScheme) return
        await finalizeMutate({
          body: {
            paymentScheme: selectedPaymentScheme,
          },
        })
      },
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

        <Suspense
          fallback={<SuspendedStudentEnrollmentFinalizationSectionCards />}
        >
          <EnrollmentStudentFinalizationQueryProvider>
            {({ enrolledCourses }) => (
              <Stack gap="xs" pos={'relative'}>
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
                    courseCode={
                      enrolledCourse.courseOffering?.course.courseCode!
                    }
                    sectionName={enrolledCourse.courseSection?.name!}
                    sectionSchedule={{
                      day: formatDaysAbbrev(enrolledCourse.courseSection?.days),
                      time: `${enrolledCourse.courseSection?.startSched!} - ${enrolledCourse.courseSection?.endSched!}`,
                    }}
                    mentor={
                      enrolledCourse.courseSection?.mentor
                        ? `${enrolledCourse.courseSection?.mentor?.firstName} ${enrolledCourse.courseSection?.mentor?.lastName}`
                        : 'No Mentor Assigned'
                    }
                  />
                ))}
              </Stack>
            )}
          </EnrollmentStudentFinalizationQueryProvider>
        </Suspense>

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

        <Suspense
          fallback={
            <Button ml={'auto'} disabled>
              Finalize
            </Button>
          }
        >
          <EnrollmentStudentFinalizationQueryProvider>
            {({ enrolledCourses }) => (
              <Button
                disabled={
                  !selectedPaymentScheme ||
                  enrolledCourses.length === 0 ||
                  isEnrollmentFinalized(enrolledCourses)
                }
                ml={'auto'}
                onClick={handleFinalizeEnrollment}
              >
                Finalize
              </Button>
            )}
          </EnrollmentStudentFinalizationQueryProvider>
        </Suspense>
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
    <Card withBorder radius="md" p="lg">
      <Stack gap={rem(2.5)} className="truncate">
        <Flex
          gap={rem(2.5)}
          justify="space-between"
          align="flex-start"
          wrap="wrap"
          direction={{ base: 'column', xs: 'row' }}
        >
          <Group
            gap="xs"
            align="center"
            w={{
              base: '100%',
              xs: 'auto',
            }}
          >
            <Box maw={'100%'}>
              <Text fw={600} size="lg" truncate>
                {courseName}
              </Text>
              <Text fw={500} fz="xs" c="dark.3" truncate>
                {courseCode}
              </Text>
            </Box>
          </Group>
          <Divider
            variant="dashed"
            size={rem(2.5)}
            w={{
              base: '100%',
              xs: 0,
            }}
            my={{
              base: rem(10),
              xs: 0,
            }}
          />
          <Group
            gap="xs"
            align="center"
            justify="start"
            w={{
              base: '100%',
              xs: 'auto',
            }}
          >
            <Box maw={'100%'}>
              <Text fw={600} size="md" truncate>
                {sectionName}
              </Text>
              <Text
                ta={{
                  base: 'left',
                  xs: 'right',
                }}
                c="dimmed"
                size="sm"
                truncate
              >
                {sectionSchedule.day} | {sectionSchedule.time}
              </Text>
            </Box>
          </Group>
        </Flex>
        <Group gap="xs" align="center" wrap="wrap">
          <Box>
            <Text c="gray.6" size="sm" truncate>
              {mentor}
            </Text>
          </Box>
        </Group>
      </Stack>
    </Card>
  )
}

function PaymentPlanCard({
  props,
}: {
  props: IPaymentScheme & {
    selectedPaymentScheme: PaymentScheme | null
    setSelectedPaymentScheme: React.Dispatch<
      React.SetStateAction<PaymentScheme | null>
    >
  }
}) {
  const handleSelectPaymentScheme = () => {
    props.setSelectedPaymentScheme((prev) =>
      prev === props.paymentTypeId ? null : props.paymentTypeId,
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
  periodId: string | undefined
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
        {course.courseSections.length === 0 && (
          <Center py="md">
            <Stack gap={rem(2)} align="center">
              <IconBook
                size={28}
                stroke={1.5}
                color="var(--mantine-color-dimmed)"
              />
              <Text fw={600} size="sm" c={'dark.3'}>
                No sections available
              </Text>
              <Text size="xs" c="dimmed">
                This course currently has no available sections.
              </Text>
            </Stack>
          </Center>
        )}
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

  const isEnrolled = course.courseEnrollments.find(
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
        <Grid gutter={0} justify="space-between" align="center">
          {/* First column (left) */}
          <Grid.Col
            span={{
              base: 12,
              xs: 6,
            }}
          >
            <Stack gap={2}>
              <Group gap="xs">
                <Text truncate maw="12ch" fw={600} size="md">
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
                  ? `${section.mentor?.firstName} ${section.mentor?.lastName}`
                  : 'No Mentor Assigned'}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col
            span={{
              base: 12,
              xs: 6,
            }}
          >
            <Flex
              direction={{
                base: 'row-reverse',
                xs: 'column',
              }}
              gap="xs"
              align="flex-end"
            >
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
                  disabled={course.courseEnrollments.length > 0}
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
              <Badge
                mr={{
                  base: 'auto',
                  xs: 0,
                }}
                c="gray.6"
                variant="light"
                radius="sm"
              >
                {section.availableSlots} / {section.maxSlot} slots
              </Badge>
            </Flex>
          </Grid.Col>
        </Grid>
      </Box>
    </Card>
  )
}

export default EnrollmentStudentPage
