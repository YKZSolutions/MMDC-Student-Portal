import { SuspendedPagination } from '@/components/suspense-pagination'
import EnrollmentBadgeStatus from '@/features/enrollment/enrollment-badge-status'
import type {
  CourseDto,
  CourseSectionDto,
  DetailedCourseOfferingDto,
  EnrollmentPeriodDto,
} from '@/integrations/api/client'
import {
  enrollmentControllerCreateCourseOfferingMutation,
  enrollmentControllerCreateCourseSectionMutation,
  enrollmentControllerFindAllCourseOfferingsOptions,
  enrollmentControllerFindAllCourseOfferingsQueryKey,
  enrollmentControllerFindOneEnrollmentOptions,
  enrollmentControllerFindOneEnrollmentQueryKey,
  enrollmentControllerRemoveCourseOfferingMutation,
  enrollmentControllerRemoveCourseSectionMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { formatPaginationMessage, formatToSchoolYear } from '@/utils/formatters'
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
  Popover,
  rem,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconArrowLeft,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Fragment, Suspense, useState } from 'react'

const route = getRouteApi('/(protected)/enrollment/$periodId')

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
    enrollmentPeriodData: EnrollmentPeriodDto
    courseOfferings: DetailedCourseOfferingDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: IEnrollmentPeriodAdminQuery
}) {
  const { periodId } = route.useParams()
  const { search, page } = props

  const { data: enrollmentPeriodData } = useSuspenseQuery(
    enrollmentControllerFindOneEnrollmentOptions({
      path: {
        id: periodId,
      },
    }),
  )

  const { data: courseData } = useSuspenseQuery(
    enrollmentControllerFindAllCourseOfferingsOptions({
      query: {
        page: page,
        search: search || undefined,
        periodId,
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

function EnrollmentPeriodIdPage() {
  const { queryClient } = getContext()

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

  const { mutateAsync: addCourseOffering } = useAppMutation(
    enrollmentControllerCreateCourseOfferingMutation,
    {
      loading: {
        title: 'Adding course offering',
        message: 'Please wait while the course offering is being added.',
      },
      success: {
        title: 'Course Offering Added',
        message: 'The course offering has been added.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while adding the course offering.',
      },
    },
    {
      onSuccess: async () => {
        const allOfferingsKey =
          enrollmentControllerFindAllCourseOfferingsQueryKey()

        const enrollmentKey = enrollmentControllerFindOneEnrollmentQueryKey({
          path: { id: periodId },
        })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.cancelQueries({ queryKey: enrollmentKey })

        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
        await queryClient.invalidateQueries({ queryKey: enrollmentKey })
      },
    },
  )

  const { mutateAsync: removeCourseOffering } = useAppMutation(
    enrollmentControllerRemoveCourseOfferingMutation,
    {
      loading: {
        title: 'Removing course offering',
        message: 'Please wait while the course offering is being removed.',
      },
      success: {
        title: 'Course Offering Removed',
        message: 'The course offering has been removed.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while removing the course offering.',
      },
    },
    {
      onSuccess: async () => {
        const allOfferingsKey =
          enrollmentControllerFindAllCourseOfferingsQueryKey()

        const enrollmentKey = enrollmentControllerFindOneEnrollmentQueryKey({
          path: { id: periodId },
        })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.cancelQueries({ queryKey: enrollmentKey })

        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
        await queryClient.invalidateQueries({ queryKey: enrollmentKey })
      },
    },
  )

  const { mutateAsync: addCourseSection } = useAppMutation(
    enrollmentControllerCreateCourseSectionMutation,
    {
      loading: {
        title: 'Adding course section',
        message: 'Please wait while the course section is being added.',
      },
      success: {
        title: 'Course Section Added',
        message: 'The course section has been added.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while adding the course section.',
      },
    },
    {},
  )

  const { mutateAsync: removeCourseSection } = useAppMutation(
    enrollmentControllerRemoveCourseSectionMutation,
    {
      loading: {
        title: 'Removing course section',
        message: 'Please wait while the course section is being removed.',
      },
      success: {
        title: 'Course Section Removed',
        message: 'The course section has been removed.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while removing the course section.',
      },
    },
  )

  const handleSelectCourseOffering = async (course: CourseDto) => {
    await addCourseOffering({
      meta: {
        course: course,
      },
      body: {
        courseId: course.id,
      },
      path: {
        periodId: periodId,
      },
    })
  }

  const handleRemoveCourseOffering = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    course: DetailedCourseOfferingDto,
  ) => {
    e.stopPropagation()
    await removeCourseOffering({
      path: {
        offeringId: course.id,
        periodId: periodId,
      },
    })
  }

  const handleAddCourseSection = async (course: DetailedCourseOfferingDto) => {
    await addCourseSection({
      body: {
        days: ['monday'],
        startSched: '08:00',
        endSched: '12:00',
        maxSlot: 0,
        name: 'New Course Section',
      },
      path: {
        offeringId: course.id,
      },
    })
  }

  const handleRemoveCourseSection = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    course: DetailedCourseOfferingDto,
    section: CourseSectionDto,
  ) => {
    e.stopPropagation()

    await removeCourseSection({
      path: {
        sectionId: section.id,
        offeringId: course.id,
      },
    })
  }

  return (
    <Container size={'md'} pb={'lg'}>
      <Stack>
        <Flex align={'center'}>
          <Group align="start">
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
            <Suspense
              fallback={<Skeleton height={20} width={rem(150)} radius="md" />}
            >
              <EnrollmentPeriodAdminQueryProvider>
                {({ enrollmentPeriodData }) => (
                  <>
                    <Title c={'dark.7'} order={3} fw={700}>
                      {formatToSchoolYear(
                        enrollmentPeriodData.startYear,
                        enrollmentPeriodData.endYear,
                      )}
                    </Title>
                    <Divider orientation="vertical" />
                    <Title c={'dark.7'} order={3} fw={700}>
                      Term {enrollmentPeriodData.term}
                    </Title>
                  </>
                )}
              </EnrollmentPeriodAdminQueryProvider>
            </Suspense>
          </Group>
        </Flex>

        <Stack gap={0}>
          <Group py={'md'} justify={'space-between'} align="center">
            <Suspense
              fallback={<Skeleton height={20} width={rem(150)} radius="md" />}
            >
              <EnrollmentPeriodAdminQueryProvider>
                {({ enrollmentPeriodData }) => (
                  <Group gap={'xs'}>
                    <Text fw={600} c={'dark'} fz={'sm'}>
                      Status:
                    </Text>
                    <EnrollmentBadgeStatus period={enrollmentPeriodData} />
                  </Group>
                )}
              </EnrollmentPeriodAdminQueryProvider>
            </Suspense>
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
                  modals.openContextModal({
                    modal: 'enrollmentCourseCreate',
                    innerProps: {
                      onSelect: handleSelectCourseOffering,
                    },
                  })
                }
              >
                Create
              </Button>
            </Flex>
          </Group>

          <Divider />

          <Accordion variant="filled">
            <Suspense>
              <EnrollmentPeriodAdminQueryProvider>
                {({ courseOfferings }) =>
                  courseOfferings.map((course, index) => (
                    <Fragment key={course.id}>
                      <Accordion.Item value={course.id.toString()}>
                        <Accordion.Control py={rem(5)}>
                          <Group justify="space-between">
                            <Stack gap={rem(0)}>
                              <Text fw={500} fz={'md'}>
                                {course.course.name}
                              </Text>
                              <Stack gap={rem(5)}>
                                <Text fw={500} fz={'xs'} c={'dark.3'}>
                                  {course.course.courseCode}
                                </Text>
                                <Badge
                                  c="gray.6"
                                  variant="light"
                                  radius="sm"
                                  size="sm"
                                >
                                  {course.courseSections.length} section(s)
                                </Badge>
                              </Stack>
                            </Stack>

                            <ActionIcon
                              component="div"
                              variant="subtle"
                              c={'red.4'}
                              size={'lg'}
                              radius={'xl'}
                              onClick={(e) =>
                                handleRemoveCourseOffering(e, course)
                              }
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
                                onClick={(e) => handleAddCourseSection(course)}
                              >
                                <Group gap={rem(5)}>
                                  <IconPlus size={18} />
                                  <Text fz={'sm'} fw={500}>
                                    Add Section
                                  </Text>
                                </Group>
                              </Button>
                              {course.courseSections.map((section) => (
                                <Card
                                  key={section.id}
                                  withBorder
                                  radius="md"
                                  py="sm"
                                >
                                  <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                      <Group gap="xs">
                                        <Text fw={600} size="md">
                                          {section.name}
                                        </Text>
                                        <Text c="dimmed" size="xs">
                                          Morning
                                        </Text>
                                      </Group>
                                      <Text c="dimmed" size="sm">
                                        {section.days} | {section.startSched} -{' '}
                                        {section.endSched}
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
                                          onClick={(e) =>
                                            handleRemoveCourseSection(
                                              e,
                                              course,
                                              section,
                                            )
                                          }
                                        >
                                          <IconTrash size={18} />
                                        </ActionIcon>
                                      </Group>
                                      <Badge
                                        c="gray.6"
                                        variant="light"
                                        radius="sm"
                                      >
                                        {section.maxSlot} / {section.maxSlot}{' '}
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
                      <Divider hidden={index == courseOfferings.length - 1} />
                    </Fragment>
                  ))
                }
              </EnrollmentPeriodAdminQueryProvider>
            </Suspense>
          </Accordion>
        </Stack>

        <Suspense fallback={<SuspendedPagination />}>
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
        </Suspense>
      </Stack>
    </Container>
  )
}

export default EnrollmentPeriodIdPage
