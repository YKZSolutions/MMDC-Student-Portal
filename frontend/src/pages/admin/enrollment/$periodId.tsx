import { SuspendedPagination } from '@/components/suspense-pagination'
import EnrollmentBadgeStatus from '@/features/enrollment/enrollment-badge-status'
import type {
  CourseDto,
  DetailedCourseOfferingDto,
  EnrollmentPeriodDto,
} from '@/integrations/api/client'
import {
  enrollmentControllerCreateCourseOfferingMutation,
  enrollmentControllerFindAllCourseOfferingsOptions,
  enrollmentControllerFindOneEnrollmentOptions,
  enrollmentControllerRemoveCourseOfferingMutation,
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
      // optimistic update
      onMutate: async (variables) => {
        const { queryClient } = getContext()
        const page = 1 // optimistic insert to first page — adjust if you need to target current page
        const search = queryDefaultValues.search
        const allOfferingsKey =
          enrollmentControllerFindAllCourseOfferingsOptions({
            query: { page, search: search || undefined },
          }).queryKey
        const enrollmentKey = enrollmentControllerFindOneEnrollmentOptions({
          path: { id: periodId },
        }).queryKey

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.cancelQueries({ queryKey: enrollmentKey })

        // snapshot previous values
        const previousOfferings = queryClient.getQueryData<any>(
          allOfferingsKey,
        ) ?? { courseOfferings: [] }
        const previousEnrollment = queryClient.getQueryData<any>(enrollmentKey)

        // build optimistic offering using minimal shape expected by UI
        const tempId = `temp-${Date.now()}`
        const optimisticOffering = {
          id: tempId,
          course: variables.meta?.course,
          courseSections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // optimistically update offerings list
        queryClient.setQueryData(allOfferingsKey, (old: any) => {
          if (!old) return { courseOfferings: [optimisticOffering] }
          return {
            ...old,
            courseOfferings: [
              optimisticOffering,
              ...(old.courseOfferings ?? []),
            ],
          }
        })

        // optimistically update enrollment detail if exists
        queryClient.setQueryData(enrollmentKey, (old: any) => {
          if (!old) return old
          return {
            ...old,
            courseOfferings: [
              optimisticOffering,
              ...(old.courseOfferings ?? []),
            ],
          }
        })

        return {
          previousOfferings,
          previousEnrollment,
          keys: {
            allOfferingsKey,
            enrollmentKey,
          },
        }
      },
      // onSettled: async (data, error, variables, context) => {
      //   const { queryClient } = getContext()
      //   // ensure fresh data
      //   queryClient.invalidateQueries({
      //     queryKey: context?.keys.allOfferingsKey,
      //   })
      //   queryClient.invalidateQueries({
      //     queryKey: context?.keys.enrollmentKey,
      //   })
      // },
      onError: (err, variables, context) => {
        const { queryClient } = getContext()
        const page = 1
        const search = queryDefaultValues.search

        // rollback
        if (context?.previousOfferings) {
          queryClient.setQueryData(
            context?.keys.allOfferingsKey,
            context.previousOfferings,
          )
        }
        if (context?.previousEnrollment) {
          queryClient.setQueryData(
            context?.keys.enrollmentKey,
            context.previousEnrollment,
          )
        }
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
      // optimistic removal
      onMutate: async (variables) => {
        const { queryClient } = getContext()
        const page = query.page ?? 1
        const search = query.search ?? ''
        const allOfferingsKey =
          enrollmentControllerFindAllCourseOfferingsOptions({
            query: { page, search: search || undefined },
          }).queryKey
        const enrollmentKey = enrollmentControllerFindOneEnrollmentOptions({
          path: { id: periodId },
        }).queryKey

        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.cancelQueries({ queryKey: enrollmentKey })

        const previousOfferings = queryClient.getQueryData<any>(allOfferingsKey)
        const previousEnrollment = queryClient.getQueryData<any>(enrollmentKey)

        // remove optimistically
        queryClient.setQueryData(allOfferingsKey, (old: any) => {
          if (!old) return old
          return {
            ...old,
            courseOfferings: (old.courseOfferings ?? []).filter(
              (o: any) => o.id !== variables.path.offeringId,
            ),
          }
        })

        if (previousEnrollment) {
          queryClient.setQueryData(enrollmentKey, (old: any) => {
            if (!old) return old
            return {
              ...old,
              courseOfferings: (old.courseOfferings ?? []).filter(
                (o: any) => o.id !== variables.path.offeringId,
              ),
            }
          })
        }

        return {
          previousOfferings,
          previousEnrollment,
          keys: {
            allOfferingsKey,
            enrollmentKey,
          },
        }
      },
      onError: (err, variables, context: any) => {
        const { queryClient } = getContext()
        const page = query.page ?? 1
        const search = query.search ?? ''
        const allOfferingsKey =
          enrollmentControllerFindAllCourseOfferingsOptions({
            query: { page, search: search || undefined },
          }).queryKey
        const enrollmentKey = enrollmentControllerFindOneEnrollmentOptions({
          path: { id: periodId },
        }).queryKey

        // rollback
        if (context?.previousOfferings) {
          queryClient.setQueryData(allOfferingsKey, context.previousOfferings)
        }
        if (context?.previousEnrollment) {
          queryClient.setQueryData(enrollmentKey, context.previousEnrollment)
        }
      },
      // onSettled: async () => {
      //   const { queryClient } = getContext()
      //   queryClient.invalidateQueries({
      //     queryKey: enrollmentControllerFindAllCourseOfferingsOptions({
      //       query: { page: query.page, search: query.search || undefined },
      //     }).queryKey,
      //   })
      //   queryClient.invalidateQueries({
      //     queryKey: enrollmentControllerFindOneEnrollmentOptions({
      //       path: { id: periodId },
      //     }).queryKey,
      //   })
      // },
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
    removeCourseOffering({
      path: {
        offeringId: course.id,
        periodId: periodId,
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
                                        onClick={(e) => e.stopPropagation()}
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
