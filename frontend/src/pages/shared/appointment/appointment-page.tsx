import AsyncSearchSelect from '@/components/async-search-select'
import {
  appointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormOutput,
} from '@/features/appointment/appointment-form.schema'
import { useAuth } from '@/features/auth/auth.hook'
import { useQuickForm } from '@/hooks/use-quick-form'
import type {
  AppointmentStatus,
  UserStudentDetailsDto,
} from '@/integrations/api/client'
import {
  appointmentsControllerCreateMutation,
  appointmentsControllerFindAllOptions,
  appointmentsControllerFindAllQueryKey,
  appointmentsControllerFindCoursesOptions,
  appointmentsControllerFindMentorOptions,
  appointmentsControllerFindOneOptions,
  appointmentsControllerUpdateDetailsMutation,
  usersControllerGetMeOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import type { AppointmentStatusFilter } from '@/routes/(protected)/appointment'
import {
  Badge,
  Button,
  Card,
  Drawer,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { Box, Container, Group, Title } from '@mantine/core'
import { Calendar, DatePickerInput } from '@mantine/dates'
import {
  IconBook2,
  IconCalendar,
  IconCalendarPlus,
  IconClock,
  IconUser,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense } from 'react'

const route = getRouteApi('/(protected)/appointment/')

function AppointmentPage() {
  const { status } = route.useSearch()
  const navigate = route.useNavigate()

  const handleChangeStatus = (status: AppointmentStatusFilter | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        status,
      }),
    })
  }

  return (
    <Container size={'md'} pb={'xl'} w="100%">
      <Group align={'start'} pb={'lg'}>
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Appointment
          </Title>
          <Text c={'dark.3'} fw={500}>
            Book an appointment with your mentors.
          </Text>
        </Box>
      </Group>

      <Group gap={60} align="start">
        <Stack flex={1}>
          <Group justify="space-between">
            <SegmentedControl
              data={[
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Finished', value: 'finished' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              value={status || 'upcoming'}
              onChange={(val) => {
                const statusVal = val as AppointmentStatusFilter
                handleChangeStatus(
                  statusVal !== 'upcoming' ? statusVal : undefined,
                )
              }}
            />
          </Group>

          <Suspense
            fallback={
              <Stack flex={1} gap="sm">
                <Skeleton radius="md" h={95.391} />
                <Skeleton radius="md" h={95.391} />
                <Skeleton radius="md" h={95.391} />
              </Stack>
            }
          >
            <AppointmentList />
          </Suspense>
        </Stack>

        <AppointmentCalendarSection />
      </Group>
    </Container>
  )
}

function AppointmentList() {
  const { status } = route.useSearch()

  const statusMap: Record<AppointmentStatusFilter, AppointmentStatus[]> = {
    upcoming: ['booked', 'approved', 'rescheduled', 'extended'],
    finished: ['finished'],
    cancelled: ['cancelled'],
  }

  const { data: paginated } = useSuspenseQuery(
    appointmentsControllerFindAllOptions({
      query: {
        status:
          status && status != 'upcoming'
            ? statusMap[status]
            : statusMap['upcoming'],
      },
    }),
  )

  const { appointments, meta } = paginated

  return (
    <Stack flex={1} gap="sm">
      {meta.totalCount > 0 ? (
        appointments.map((appointment) => (
          <Link
            key={appointment.id}
            to="/appointment/$appointmentId"
            params={{ appointmentId: appointment.id }}
          >
            <Card py="sm" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text fw={500}>{appointment.title}</Text>
                  <Group gap={6} c="dimmed">
                    <IconUser size={18} />
                    <Text size="sm">{`${appointment.mentor.firstName} ${appointment.mentor.lastName}`}</Text>
                  </Group>
                  <Group gap={6} c="dimmed">
                    <IconBook2 size={18} />
                    <Text size="sm">{appointment.course.name}</Text>
                  </Group>
                </Stack>

                <Stack gap={2} align="end">
                  <Badge>{appointment.status}</Badge>
                  <Group gap={6} c="dimmed">
                    <IconCalendar size={18} />
                    <Text size="sm">
                      {dayjs(appointment.startAt).format('MMM D YYYY')}
                    </Text>
                  </Group>
                  <Group gap={6} c="dimmed">
                    <IconClock size={18} />
                    <Text size="sm">
                      {dayjs(appointment.startAt).format('HH:mm A')}
                    </Text>
                  </Group>
                </Stack>
              </Group>
            </Card>
          </Link>
        ))
      ) : (
        <Stack>
          <Text>No appointments yet</Text>
        </Stack>
      )}
    </Stack>
  )
}

function AppointmentCalendarSection() {
  const navigate = route.useNavigate()
  const {
    authUser: { role },
  } = useAuth('protected')

  const handleOpenDrawer = () => {
    navigate({
      search: {
        bookAppointment: true,
      },
    })
  }

  return (
    <Stack mr={50} align="end">
      {role === 'student' ? (
        <Button
          leftSection={<IconCalendarPlus size={20} />}
          onClick={() => handleOpenDrawer()}
        >
          Book Appointment
        </Button>
      ) : (
        <Stack h={34}></Stack>
      )}

      <Calendar highlightToday />
      <AppointmentFormDrawer />
    </Stack>
  )
}

function AppointmentFormDrawer() {
  const { bookAppointment } = route.useSearch()
  const navigate = route.useNavigate()

  const handleCloseDrawer = () => {
    navigate({
      search: {
        bookAppointment: undefined,
      },
    })
  }

  return (
    <Drawer
      opened={bookAppointment === true}
      onClose={() => handleCloseDrawer()}
      title={
        <Text size="xl" fw={600}>
          Book an Appointment
        </Text>
      }
      position="right"
      size="md"
      overlayProps={{ opacity: 0.2, blur: 2 }}
      padding="xl"
    >
      <AppointmentForm />
    </Drawer>
  )
}

function AppointmentForm() {
  const { bookAppointment } = route.useSearch()
  const navigate = route.useNavigate()

  const handleCloseDrawer = () => {
    navigate({
      search: {
        bookAppointment: undefined,
      },
    })
  }

  const { data } = useSuspenseQuery(usersControllerGetMeOptions())

  const user = data as UserStudentDetailsDto

  const { create, form, isPending } = useQuickForm<
    AppointmentFormInput,
    AppointmentFormOutput
  >()({
    name: 'appointment',
    formOptions: {
      initialValues: {
        course: null,
        mentor: null,
        topic: '',
        description: '',
        date: null,
        time: '',
      },
      validate: zod4Resolver(appointmentFormSchema),
    },
    transformQueryData: (appointment) => ({
      course: appointment.course.id,
      mentor: appointment.mentor.id,
      topic: appointment.title,
      description: appointment.description,
      date: appointment.startAt,
      time: appointment.startAt,
    }),
    queryOptions: {
      ...appointmentsControllerFindOneOptions({
        path: { id: '' },
      }),
      enabled: false,
    },
    createMutationOptions: appointmentsControllerCreateMutation({}),
    updateMutationOptions: appointmentsControllerUpdateDetailsMutation({
      path: { id: '' },
    }),
    queryKeyInvalidation: appointmentsControllerFindAllQueryKey({
      // query: { page, search },
    }),
  })

  const timeOptions = [
    { value: '08:00:00', label: '8:00 AM' },
    { value: '09:00:00', label: '9:00 AM' },
    { value: '10:00:00', label: '10:00 AM' },
  ]

  const handleBookAppointment = async (values: AppointmentFormOutput) => {
    if (form.validate().hasErrors) return
    const {
      course: courseId,
      mentor: mentorId,
      topic: title,
      description,
      date,
      time,
    } = values

    const dateObject = dayjs(date)
    const timeObject = dayjs(time, 'HH:mm:ss')

    const startAt = dateObject
      .set('hour', timeObject.hour())
      .set('minute', timeObject.minute())
      .set('second', timeObject.second())

    const endAt = startAt.add(15, 'minute')

    await create.mutateAsync({
      body: {
        studentId: user.id,
        courseId,
        mentorId,
        title,
        description,
        startAt: startAt.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        endAt: endAt.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      },
    })
    handleCloseDrawer()
  }

  return (
    <Drawer
      opened={bookAppointment === true}
      onClose={() => handleCloseDrawer()}
      title={
        <Text size="xl" fw={600}>
          Book an Appointment
        </Text>
      }
      position="right"
      size="md"
      overlayProps={{ opacity: 0.2, blur: 2 }}
      padding="xl"
    >
      <Stack gap="md">
        <AsyncSearchSelect
          // variant="filled"
          label="Course"
          placeholder="Pick a course"
          selectFirstOptionOnChange
          withAsterisk
          className="flex-1"
          preloadOptions
          getOptions={(search) => appointmentsControllerFindCoursesOptions({})}
          mapData={(data) =>
            data.map((enrolledCourse) => ({
              value: enrolledCourse.courseOfferingId,
              label: enrolledCourse.courseOffering?.course.name || '',
            }))
          }
          disabled={isPending}
          key={form.key('course')}
          {...form.getInputProps('course')}
        />
        <AsyncSearchSelect
          // variant="filled"
          label="Mentors"
          placeholder="Choose a mentor"
          selectFirstOptionOnChange
          withAsterisk
          className="flex-1"
          preloadOptions
          getOptions={(search) =>
            appointmentsControllerFindMentorOptions({
              query: {
                search,
              },
            })
          }
          mapData={(data) =>
            data.users.map((users) => ({
              value: users.id,
              label: `${users.firstName} ${users.lastName}`,
            }))
          }
          disabled={isPending}
          key={form.key('mentor')}
          {...form.getInputProps('mentor')}
        />
        <TextInput
          label="Topic"
          placeholder="The appointment's topic"
          radius="md"
          required
          disabled={isPending}
          key={form.key('topic')}
          {...form.getInputProps('topic')}
        />
        <Textarea
          label="Description"
          placeholder="Additional details..."
          radius="md"
          autosize
          minRows={4}
          disabled={isPending}
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <Stack gap="sm">
          <Group gap="sm">
            <DatePickerInput
              label="Appointment Date"
              placeholder="Pick a Date"
              flex={1}
              highlightToday
              withAsterisk
              minDate={dayjs().add(1, 'day').toISOString()}
              excludeDate={(date) => dayjs(date).day() === 0}
              disabled={isPending}
              key={form.key('date')}
              {...form.getInputProps('date')}
            />
            <Select
              label="Appointment Time"
              placeholder="Pick a Time Slot"
              flex={1}
              data={timeOptions}
              withAsterisk
              disabled={isPending}
              key={form.key('time')}
              {...form.getInputProps('time')}
            />
          </Group>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => handleCloseDrawer()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => handleBookAppointment(form.getValues())}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}

interface TimeButtonProps {
  text: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

function TimeButton({ text, selected, disabled, onClick }: TimeButtonProps) {
  return (
    <Card
      p="xs"
      radius="md"
      ta="center"
      bg={selected ? 'primary' : undefined}
      className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      c={disabled ? 'dimmed' : undefined}
      withBorder
      onClick={onClick}
    >
      <Text
        size="sm"
        c={selected ? 'white' : undefined}
        className="select-none "
      >
        {text}
      </Text>
    </Card>
  )
}

export default AppointmentPage
