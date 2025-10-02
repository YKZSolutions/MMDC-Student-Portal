import SupabaseAvatar from '@/components/supabase-avatar'
import { useAuth } from '@/features/auth/auth.hook'
import {
  appointmentsControllerFindAllQueryKey,
  appointmentsControllerFindOneOptions,
  appointmentsControllerFindOneQueryKey,
  appointmentsControllerUpdateStatusMutation,
  usersControllerFindOneOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Group,
  rem,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { Container } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconArrowBack,
  IconArrowLeft,
  IconBook2,
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconHourglassEmpty,
  IconInfoCircle,
  IconPresentationAnalytics,
  IconUser,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'
import { sentenceCase, titleCase } from 'text-case'

const route = getRouteApi('/(protected)/appointment/$appointmentId')

function AppointmentDetails() {
  const navigate = route.useNavigate()

  const { appointmentId } = route.useParams()
  const { data: appointment } = useSuspenseQuery(
    appointmentsControllerFindOneOptions({ path: { id: appointmentId } }),
  )

  const { student, mentor } = appointment

  const { data: studentData } = useSuspenseQuery(
    usersControllerFindOneOptions({ path: { id: student.id } }),
  )

  const { data: mentorData } = useSuspenseQuery(
    usersControllerFindOneOptions({ path: { id: mentor.id } }),
  )

  return (
    <Container size={'sm'} pb={'xl'} w="100%">
      <Group align={'center'} pb={'lg'}>
        <ActionIcon
          variant="subtle"
          size="lg"
          radius="xl"
          onClick={() =>
            navigate({
              to: '/appointment',
            })
          }
        >
          <IconArrowLeft />
        </ActionIcon>

        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Appointment Details
          </Title>
          <Text c={'dark.3'} fw={500}>
            Information about the selected appointment.
          </Text>
        </Box>
      </Group>

      <Stack gap="sm">
        <SimpleGrid cols={2}>
          <Card withBorder>
            <Labeled label="Student" icon={<IconUser size={16} />}>
              <Group mt={2}>
                <SupabaseAvatar
                  size={rem(50)}
                  bucket={SupabaseBuckets.USER_AVATARS}
                  path={student.id}
                  imageType="jpg"
                  name={`${student.firstName} ${student.lastName}`}
                />
                <Stack gap={2}>
                  <Text
                    fw={500}
                    size="lg"
                  >{`${student.firstName} ${student.lastName}`}</Text>
                  <Text size="sm" c="dimmed">
                    {studentData.userAccount?.email}
                  </Text>
                </Stack>
              </Group>
            </Labeled>
          </Card>

          <Card withBorder>
            <Labeled label="Mentor" icon={<IconUser size={16} />}>
              <Group mt={2}>
                <SupabaseAvatar
                  size={rem(50)}
                  bucket={SupabaseBuckets.USER_AVATARS}
                  path={mentor.id}
                  imageType="jpg"
                  name={`${mentor.firstName} ${mentor.lastName}`}
                />
                <Stack gap={2}>
                  <Text
                    fw={500}
                    size="lg"
                  >{`${mentor.firstName} ${mentor.lastName}`}</Text>
                  <Text size="sm" c="dimmed">
                    {mentorData.userAccount?.email}
                  </Text>
                </Stack>
              </Group>
            </Labeled>
          </Card>
        </SimpleGrid>

        <Card withBorder>
          <Stack gap="sm">
            <Text size="lg" fw={500}>
              Details
            </Text>
            <Stack gap="xl">
              <SimpleGrid cols={3}>
                <Labeled
                  label="Topic"
                  text={appointment.title}
                  icon={<IconPresentationAnalytics size={16} />}
                />
                <Labeled
                  label="Course"
                  text={appointment.course.name}
                  icon={<IconBook2 size={16} />}
                />
                <Labeled
                  label="Status"
                  text={titleCase(appointment.status)}
                  icon={<IconInfoCircle size={16} />}
                />
              </SimpleGrid>
              <SimpleGrid cols={3}>
                <Labeled
                  label="Date"
                  text={dayjs(appointment.startAt).format('MMM D YYYY')}
                  icon={<IconCalendar size={16} />}
                />
                <Labeled
                  label="Time"
                  text={dayjs(appointment.startAt).format('HH:mm A')}
                  icon={<IconClock size={16} />}
                />
                <Labeled
                  label="Estimated"
                  text={sentenceCase(dayjs(appointment.startAt).fromNow())}
                  icon={<IconHourglassEmpty size={16} />}
                />
              </SimpleGrid>
              <Stack mih={100}>
                <Labeled
                  label="Description"
                  text={appointment.description}
                  icon={<IconFileDescription size={16} />}
                />
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      <AppointmentActions />
    </Container>
  )
}

function AppointmentActions() {
  const {
    authUser: { role },
  } = useAuth('protected')
  const { appointmentId } = route.useParams()

  const { data: appointment } = useSuspenseQuery(
    appointmentsControllerFindOneOptions({ path: { id: appointmentId } }),
  )

  const { mutateAsync: updateStatus } = useAppMutation(
    appointmentsControllerUpdateStatusMutation,
    {
      loading: {
        message: 'Saving changes...',
        title: 'Updating status',
      },
      success: {
        message: 'Status Updated',
        title: "The appointment's status has been updated",
      },
      error: {
        title: 'Failed to update status',
        message: 'Please try again later',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: appointmentsControllerFindOneQueryKey({
            path: { id: appointmentId },
          }),
        })
        queryClient.invalidateQueries({
          queryKey: appointmentsControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleApprove = () => {
    updateStatus({
      path: { id: appointmentId },
      body: {
        status: 'approved',
      },
    })
  }

  const handleReject = () => {
    modals.openConfirmModal({
      title: 'Reject Appointment?',
      children: (
        <Text>
          This will change the status to rejected and cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => {
        updateStatus({
          path: { id: appointmentId },
          body: {
            status: 'cancelled',
          },
        })
      },
    })
  }

  const handleCancel = () => {
    modals.open({
      title: 'Cancel Appointment?',
      children: (
        <CancelModal
          onConfirm={(reason) => {
            updateStatus({
              path: { id: appointmentId },
              body: {
                status: 'cancelled',
                cancelReason: reason,
              },
            })
          }}
        />
      ),
    })
  }

  return (
    <Group mt="lg" justify="end">
      {role === 'mentor' ? (
        <>
          <Button
            color="red"
            onClick={() => handleReject()}
            disabled={appointment.status !== 'booked'}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleApprove()}
            disabled={appointment.status !== 'booked'}
          >
            Approve
          </Button>
        </>
      ) : role === 'student' ? (
        <>
          <Button
            color="red"
            onClick={() => handleCancel()}
            disabled={appointment.status !== 'booked'}
          >
            Cancel Appointment
          </Button>
        </>
      ) : undefined}
    </Group>
  )
}

function CancelModal({ onConfirm }: { onConfirm: (reason: string) => void }) {
  const [cancelReason, setCancelReason] = useInputState('')

  return (
    <Stack>
      <Text size="sm">
        Are you sure you want to cancel the appointment? Write your reason down
        below.
      </Text>
      <Textarea
        label="Cancel Reason"
        placeholder="Why you want to cancel the appointment"
        data-autofocus
        autosize
        minRows={4}
        value={cancelReason}
        onChange={setCancelReason}
      />
      <Group justify="end">
        <Button variant="outline" color="dark" className=" border-neutral-300">
          Cancel
        </Button>
        <Button onClick={() => onConfirm(cancelReason)}>Confirm</Button>
      </Group>
    </Stack>
  )
}

interface LabeledText {
  label: string
  icon?: ReactNode
  text: string
}

interface LabeledComponent {
  label: string
  icon?: ReactNode
  children: ReactNode
}

type LabeledProps = LabeledText | LabeledComponent

function Labeled({ label, icon, ...props }: LabeledProps) {
  return (
    <Stack gap={0}>
      <Group gap={4} c="dimmed">
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
      {'text' in props ? <Text>{props.text}</Text> : props.children}
    </Stack>
  )
}

export default AppointmentDetails
