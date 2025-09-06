import { SuspendedPagination } from '@/components/suspense-pagination'
import AsyncMentorCombobox from '@/features/enrollment/async-mentor-combobox'
import EnrollmentBadgeStatus from '@/features/enrollment/enrollment-badge-status'
import { SuspendedAdminEnrollmentCourseOfferingCards } from '@/features/enrollment/suspense'
import {
  EditSectionFormSchema,
  type EditSectionFormValues,
} from '@/features/validation/edit-course-offering-subject'
import {
  type CourseDto,
  type DetailedCourseOfferingDto,
  type DetailedCourseSectionDto,
  type EnrollmentPeriodDto,
} from '@/integrations/api/client'
import {
  courseOfferingControllerCreateCourseOfferingMutation,
  courseOfferingControllerFindCourseOfferingsByPeriodOptions,
  courseOfferingControllerFindCourseOfferingsByPeriodQueryKey,
  courseOfferingControllerRemoveCourseOfferingMutation,
  courseSectionControllerCreateCourseSectionMutation,
  courseSectionControllerRemoveCourseSectionMutation,
  courseSectionControllerUpdateCourseSectionMutation,
  enrollmentControllerFindOneEnrollmentOptions,
  enrollmentControllerFindOneEnrollmentQueryKey,
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
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Pagination,
  Popover,
  rem,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Transition,
  UnstyledButton,
} from '@mantine/core'
import { TimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { randomId, useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconArrowLeft,
  IconBook,
  IconFilter2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Fragment, Suspense, useState } from 'react'

const route = getRouteApi('/(protected)/enrollment/$periodId')
const { queryClient } = getContext()

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
        enrollmentId: periodId,
      },
    }),
  )

  const { data: courseData } = useSuspenseQuery(
    courseOfferingControllerFindCourseOfferingsByPeriodOptions({
      query: {
        page: page,
        search: search || undefined,
      },
      path: {
        enrollmentId: periodId,
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

  const { mutateAsync: addCourseOffering, isPending: addCourseIsPending } =
    useAppMutation(
      courseOfferingControllerCreateCourseOfferingMutation,
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
            courseOfferingControllerFindCourseOfferingsByPeriodQueryKey({
              path: { enrollmentId: periodId },
            })

          const enrollmentKey = enrollmentControllerFindOneEnrollmentQueryKey({
            path: { enrollmentId: periodId },
          })

          // cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: allOfferingsKey })
          await queryClient.cancelQueries({ queryKey: enrollmentKey })

          await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
          await queryClient.invalidateQueries({ queryKey: enrollmentKey })
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
        enrollmentId: periodId,
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
            <Flex
              wrap={'wrap'}
              w={{
                xs: 'auto',
                base: '100%',
              }}
              align={'center'}
              gap={5}
            >
              <TextInput
                placeholder="Search name/email"
                radius={'md'}
                leftSection={<IconSearch size={18} stroke={1} />}
                w={{
                  xs: rem(250),
                  base: '100%',
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
                      xs: 'auto',
                      base: '100%',
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
                w={{
                  xs: 'auto',
                  base: '100%',
                }}
              >
                Create
              </Button>
            </Flex>
          </Group>

          <Divider />

          <Transition
            mounted={addCourseIsPending}
            transition="fade-down"
            duration={50}
          >
            {(styles) => (
              <Group p={'xs'} w={'100%'} style={styles}>
                <Loader mx={'auto'} />
              </Group>
            )}
          </Transition>

          <Accordion variant="filled">
            <Suspense
              fallback={<SuspendedAdminEnrollmentCourseOfferingCards />}
            >
              <EnrollmentPeriodAdminQueryProvider>
                {({ courseOfferings }) => (
                  <>
                    {courseOfferings.length === 0 && !addCourseIsPending && (
                      <Stack
                        gap={0}
                        align="center"
                        justify="center"
                        py="xl"
                        c="dark.3"
                      >
                        <IconBook size={36} stroke={1.5} />
                        <Text mt="sm" fw={500}>
                          No course offerings yet
                        </Text>
                        <Text fz="sm" c="dark.2" ta="center" maw={360}>
                          Create one to start adding sections, assigning
                          mentors, and enrolling students.
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
                              periodId={periodId}
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

function CourseOfferingAccordionControl({
  course,
  periodId,
}: {
  course: DetailedCourseOfferingDto
  periodId: string
}) {
  const isDeletingDisabled = course.courseSections.length > 0

  const {
    mutateAsync: removeCourseOffering,
    isPending: removeCourseOfferingIsPending,
  } = useAppMutation(
    courseOfferingControllerRemoveCourseOfferingMutation,
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
          courseOfferingControllerFindCourseOfferingsByPeriodQueryKey({
            path: { enrollmentId: periodId },
          })

        const enrollmentKey = enrollmentControllerFindOneEnrollmentQueryKey({
          path: { enrollmentId: periodId },
        })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.cancelQueries({ queryKey: enrollmentKey })

        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
        await queryClient.invalidateQueries({ queryKey: enrollmentKey })
      },
    },
  )

  const handleRemoveCourseOffering = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    course: DetailedCourseOfferingDto,
  ) => {
    // Stop event propagation
    e.stopPropagation()

    // Disable button if there are course sections
    if (isDeletingDisabled) return

    modals.openConfirmModal({
      title: 'Delete Course Offering',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to remove this course offering? This action
          cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () =>
        // Call the mutation
        await removeCourseOffering({
          path: {
            offeringId: course.id,
            enrollmentId: periodId,
          },
        }),
    })
  }
  return (
    <Group justify="space-between">
      <LoadingOverlay
        visible={removeCourseOfferingIsPending}
        zIndex={10} // This is to avoid unnecessary flashing of the blur
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
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

      <Tooltip
        hidden={!isDeletingDisabled}
        withArrow
        position="left"
        label={
          <Text size="sm">
            Cannot remove course offering — active sections exist
          </Text>
        }
      >
        <ActionIcon
          component="div"
          variant="subtle"
          c={isDeletingDisabled ? 'gray' : 'red.4'}
          size={'lg'}
          radius={'xl'}
          disabled={isDeletingDisabled}
          onClick={(e) => handleRemoveCourseOffering(e, course)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

function CourseOfferingAccordionPanel({
  course,
}: {
  course: DetailedCourseOfferingDto
}) {
  const { periodId } = route.useParams()
  const {
    mutateAsync: addCourseSection,
    variables: addCourseSectionVariables,
    isPending: isAddCourseSectionPending,
  } = useAppMutation(
    courseSectionControllerCreateCourseSectionMutation,
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
    {
      onSuccess: async () => {
        const allOfferingsKey =
          courseOfferingControllerFindCourseOfferingsByPeriodQueryKey({
            path: { enrollmentId: periodId },
          })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })

        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
      },
    },
  )

  const handleAddCourseSection = async (course: DetailedCourseOfferingDto) => {
    await addCourseSection({
      body: {
        days: ['monday', 'wednesday', 'friday'],
        startSched: '08:00',
        endSched: '09:00',
        maxSlot: 60,
        name: randomId('new-section-'),
      },
      path: {
        offeringId: course.id,
        enrollmentId: periodId,
      },
    })
  }
  return (
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
        {isAddCourseSectionPending && (
          <CourseOfferingSubjectCard
            key={addCourseSectionVariables?.body.name}
            section={{
              ...addCourseSectionVariables?.body,
              id: 'pending',
              createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              deletedAt: null,
              user: null,
              mentorId: null,
            }}
            course={course}
          />
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
  const { periodId } = route.useParams()

  const [opened, { toggle }] = useDisclosure(false)

  const { mutateAsync: removeCourseSection, isPending } = useAppMutation(
    courseSectionControllerRemoveCourseSectionMutation,
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
    {
      onSuccess: async () => {
        const allOfferingsKey =
          courseOfferingControllerFindCourseOfferingsByPeriodQueryKey({
            path: { enrollmentId: periodId },
          })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })

        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
      },
    },
  )

  const handleRemoveCourseSection = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    course: DetailedCourseOfferingDto,
    section: DetailedCourseSectionDto,
  ) => {
    e.stopPropagation()

    modals.openConfirmModal({
      title: 'Delete Course Section',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to remove this course section? This action
          cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () =>
        await removeCourseSection({
          path: {
            sectionId: section.id,
            offeringId: course.id,
            enrollmentId: periodId,
          },
        }),
    })
  }

  return (
    <Card key={section.id} withBorder radius="md" py="sm" pos={'relative'}>
      <LoadingOverlay
        visible={isPending}
        zIndex={1000}
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
              <Text c="gray.6" size="sm">
                {section.mentorId
                  ? `${section.user?.firstName} ${section.user?.lastName}`
                  : 'No Mentor Assigned'}
              </Text>
            </Stack>
          </Grid.Col>

          {/* Second + Third columns stacked */}
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
              <Group gap={rem(5)}>
                <ActionIcon
                  variant="subtle"
                  c="dark.3"
                  size="md"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle()
                  }}
                >
                  {opened ? <IconX size={18} /> : <IconPencil size={18} />}
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  c="red.4"
                  size="md"
                  radius="xl"
                  onClick={(e) => handleRemoveCourseSection(e, course, section)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>

              <Badge
                mr={{
                  base: 'auto',
                  xs: 0,
                }}
                c="gray.6"
                variant="light"
                radius="sm"
              >
                {section.maxSlot} / {section.maxSlot} slots
              </Badge>
            </Flex>
          </Grid.Col>
        </Grid>

        <Collapse in={opened} keepMounted={false}>
          <Stack pt={'sm'}>
            <Divider />

            <CourseOfferingSectionEditForm
              section={section}
              offeringId={course.id}
              onCancel={toggle}
              onSaved={toggle}
            />
          </Stack>
        </Collapse>
      </Box>
    </Card>
  )
}

function CourseOfferingSectionEditForm({
  section,
  offeringId,
  onCancel,
  onSaved,
}: {
  section: DetailedCourseSectionDto
  offeringId: string
  onCancel: () => void
  onSaved: () => void
}) {
  const { periodId } = route.useParams()

  const form = useForm<EditSectionFormValues>({
    mode: 'uncontrolled',
    initialValues: { ...section },
    validate: zod4Resolver(EditSectionFormSchema),
  })

  const { mutateAsync: updateSection, isPending: updating } = useAppMutation(
    courseSectionControllerUpdateCourseSectionMutation,
    {
      loading: {
        title: 'Updating section ' + section.name,
        message: 'Saving changes...',
      },
      success: {
        title: 'Saved',
        message: 'Section updated successfully.',
      },
      error: {
        title: 'Failed',
        message: 'Unable to update section.',
      },
    },
    {
      onSuccess: async () => {
        const allOfferingsKey =
          courseOfferingControllerFindCourseOfferingsByPeriodQueryKey({
            path: { enrollmentId: periodId },
          })
        await queryClient.cancelQueries({ queryKey: allOfferingsKey })
        await queryClient.invalidateQueries({ queryKey: allOfferingsKey })
      },
    },
  )

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ]

  const handleSubmit = async () => {
    if (form.validate().hasErrors) return

    await updateSection({
      path: { offeringId, sectionId: section.id, enrollmentId: periodId },
      body: form.getValues(),
    })

    onSaved()
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text fw={700}>Edit Section</Text>
          <Text size="xs" c="dimmed">
            {section.name || 'Untitled section'}
          </Text>
        </Stack>
        <Badge variant="light" color="blue" radius="xl" size="sm">
          Editing
        </Badge>
      </Group>

      <TextInput
        radius="md"
        label="Section title"
        placeholder="Enter section title"
        {...form.getInputProps('name')}
      />

      <MultiSelect
        radius="md"
        label="Schedule days"
        data={dayOptions}
        styles={{
          pill: {
            backgroundColor: 'var(--mantine-color-gray-2)',
          },
        }}
        {...form.getInputProps('days')}
        placeholder="Choose days"
      />

      <Group grow align="flex-start">
        <TimePicker
          radius="md"
          label="Start time"
          {...form.getInputProps('startSched')}
        />
        <TimePicker
          radius="md"
          label="End time"
          {...form.getInputProps('endSched')}
        />
      </Group>

      <Group grow align="flex-start">
        <NumberInput
          radius="md"
          label="Maximum slots"
          min={1}
          placeholder="e.g. 30"
          {...form.getInputProps('maxSlot')}
        />
        <AsyncMentorCombobox form={form} defaultSelectedUser={section.user} />
      </Group>

      <Group gap="sm" justify="flex-end" pt="lg">
        <Button variant="subtle" onClick={onCancel} disabled={updating}>
          Cancel
        </Button>
        <Button loading={updating} onClick={() => handleSubmit()}>
          Save changes
        </Button>
      </Group>
    </Stack>
  )
}

export default EnrollmentPeriodIdPage
