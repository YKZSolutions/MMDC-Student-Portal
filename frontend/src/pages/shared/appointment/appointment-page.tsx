import AsyncSearchSelect from '@/components/async-search-select'
import SupabaseAvatar from '@/components/supabase-avatar'
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
  appointmentsControllerFindBookedRangeOptions,
  appointmentsControllerFindCoursesOptions,
  appointmentsControllerFindMentorOptions,
  appointmentsControllerFindOneOptions,
  appointmentsControllerUpdateDetailsMutation,
  usersControllerGetMeOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
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
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense, useEffect, useMemo } from 'react'

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
                      {dayjs(appointment.startAt).utc().format('MMM D YYYY')}
                    </Text>
                  </Group>
                  <Group gap={6} c="dimmed">
                    <IconClock size={18} />
                    <Text size="sm">
                      {dayjs(appointment.startAt).utc().format('HH:mm A')}
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
      mode: 'controlled',
      initialValues: {
        currentMonth: null,
        courseOfferingId: null,
        course: null,
        section: null,
        mentor: null,
        topic: '',
        description: '',
        date: null,
        time: '',
      },
      validate: zod4Resolver(appointmentFormSchema),
    },
    transformQueryData: (appointment) => ({
      courseId: appointment.course.id,
      course: appointment.course,
      section: appointment.section,
      mentor: appointment.mentor,
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

  const currentMonth = form.getValues().currentMonth
  const dateData = form.getValues().date
  const courseData = form.getValues().course
  const sectionData = form.getValues().section
  const mentorData = form.getValues().mentor

  const base = currentMonth ? dayjs(currentMonth) : dayjs()

  const { data: bookedSchedules } = useQuery({
    ...appointmentsControllerFindBookedRangeOptions({
      query: {
        from: base.startOf('month').format('YYYY-MM-DDTHH:mm:ss[Z]'),
        to: base.endOf('month').format('YYYY-MM-DDTHH:mm:ss[Z]'),
        courseId: courseData ? courseData.id : '',
        mentorId: mentorData ? mentorData.id : '',
      },
    }),
    enabled: courseData != null && mentorData != null,
  })

  const allowedDayIndexes = sectionData?.days.map((d) =>
    [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ].indexOf(d.toLowerCase()),
  )

  const timeSlots = useMemo(() => {
    if (!sectionData) return []
    const diffMinutes = dayjs(sectionData.endSched, 'HH:mm').diff(
      dayjs(sectionData.startSched, 'HH:mm'),
      'minute',
    )
    const steps = diffMinutes / 15 + 1
    return Array.from({ length: steps }, (_, i) =>
      dayjs(sectionData.startSched, 'HH:mm')
        .add(i * 15, 'minute')
        .format('HH:mm:ss'),
    )
  }, [sectionData])

  const bookedByDay = useMemo(() => {
    if (!bookedSchedules) return {}
    const map: Record<string, Set<string>> = {}
    for (const b of bookedSchedules) {
      const day = dayjs(b.startAt).format('YYYY-MM-DD')
      const time = dayjs(b.startAt).utc().format('HH:mm:ss')
      if (!map[day]) map[day] = new Set()
      map[day].add(time)
    }
    return map
  }, [bookedSchedules])

  const isDayDisabled = (date: Date) => {
    const d = dayjs(date)
    if (allowedDayIndexes && !allowedDayIndexes.includes(d.day())) return true

    const key = d.format('YYYY-MM-DD')
    const booked = bookedByDay[key]
    return booked && booked.size >= timeSlots.length
  }

  const bookedTimes = bookedSchedules
    ? bookedSchedules
        .filter((b) => dayjs(b.startAt).isSame(dateData, 'day'))
        .map((b) => dayjs(b.startAt).utc().format('HH:mm:ss'))
    : []

  const timeOptions = sectionData
    ? Array.from(
        {
          length:
            dayjs(sectionData.endSched, 'HH:mm').diff(
              dayjs(sectionData.startSched, 'HH:mm'),
              'minute',
            ) /
              15 +
            1,
        },
        (_, i) => {
          const t = dayjs(sectionData.startSched, 'HH:mm').add(i * 15, 'minute')
          const value = t.format('HH:mm:ss')
          return {
            value,
            label: t.format('h:mm A'),
            disabled: bookedTimes.includes(value),
          }
        },
      )
    : []

  const handleBookAppointment = async (values: AppointmentFormOutput) => {
    if (form.validate().hasErrors) return
    const {
      courseOfferingId,
      mentor,
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
        courseOfferingId: courseOfferingId,
        mentorId: mentor.id,
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
          getOptions={() => appointmentsControllerFindCoursesOptions({})}
          mapData={(data) =>
            data.map((enrolledCourse) => ({
              value: enrolledCourse.courseOfferingId,
              label: enrolledCourse.courseOffering?.course.name || '',
              data: enrolledCourse,
            }))
          }
          disabled={isPending}
          key={form.key('course')}
          // {...form.getInputProps('course')}
          value={form.values.courseOfferingId}
          onChange={(value, _option, data) => {
            const offering = data?.courseOffering
            const section = data?.courseSection
            form.setFieldValue('courseOfferingId', value)
            if (!offering || !section) return
            form.setFieldValue('course', {
              id: offering.id,
              courseCode: offering.course.courseCode,
              name: offering.course.name,
            })
            form.setFieldValue('section', {
              id: section.id,
              startSched: section.startSched,
              endSched: section.endSched,
              days: section.days,
            })
            form.setFieldValue('mentor', data?.courseSection?.mentor ?? null)
          }}
        />

        <Stack gap={0}>
          <Text fw={500} size="sm">
            Mentor
          </Text>
          <Card withBorder radius="md" py="xs">
            {mentorData ? (
              <Group>
                <SupabaseAvatar
                  bucket={SupabaseBuckets.USER_AVATARS}
                  path={mentorData.id}
                  imageType="jpg"
                  name={`${mentorData.firstName} ${mentorData.lastName}`}
                />
                <Stack gap={0}>
                  <Text>{`${mentorData.firstName} ${mentorData.lastName}`}</Text>
                  <Text size="sm" c="dimmed">
                    {courseData.name}
                  </Text>
                </Stack>
              </Group>
            ) : (
              <Group>
                <Text>Mentor</Text>
              </Group>
            )}
          </Card>
        </Stack>
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
              excludeDate={(date) => {
                const d = dayjs(date)

                const notAllowedDay =
                  allowedDayIndexes && !allowedDayIndexes.includes(d.day())

                const key = d.format('YYYY-MM-DD')
                const fullyBooked =
                  bookedByDay[key] && bookedByDay[key].size >= timeSlots.length

                return notAllowedDay || fullyBooked
              }}
              disabled={isPending || sectionData === null}
              onDateChange={(date) => {
                form.setFieldValue('currentMonth', date)
              }}
              key={form.key('date')}
              {...form.getInputProps('date')}
            />
            <Select
              label="Appointment Time"
              placeholder="Pick a Time Slot"
              flex={1}
              data={timeOptions}
              withAsterisk
              disabled={isPending || sectionData === null || dateData === null}
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
