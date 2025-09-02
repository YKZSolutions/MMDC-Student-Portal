import RoleComponentManager from '@/components/role-component-manager'
import type {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/integrations/api/client'
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconCamera } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { usersControllerGetMeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { useSuspenseQuery } from '@tanstack/react-query'

function ProfilePage() {
  const { data } = useSuspenseQuery(usersControllerGetMeOptions())

  const fullName =
    `${data.firstName} ${data.middleName ?? ''} ${data.lastName}`.trim()
  const avatarInitials = `${data.firstName?.[0] ?? ''}${data.lastName?.[0] ?? ''}`

  return (
    <Container fluid m={0}>
      <Box pb="lg">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="md">
            <Avatar size={80} radius="xl" color="blue">
              {avatarInitials}
            </Avatar>
            <Box>
              <Title order={2} fw={700} c="dark.7" data-cy="profile-fullname-header">
                {fullName}
              </Title>
              <Text c="dark.3" fw={500}>
                Profile information and account details
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      <Stack gap="xl">
        <Button
          variant="light"
          leftSection={<IconCamera size={16} />}
          size="xs"
          maw={200}
        >
          Change Avatar
        </Button>

        <ProfileSection title="Basic Information">
          <Field label="Full Name" value={fullName} />
          <Field label="Email" value={data.email ?? '—'} dataCy="profile-email-value" />
          <Field
            label="Date Joined"
            value={
              data.userDetails?.dateJoined
                ? dayjs(data.userDetails.dateJoined).format('MMM D, YYYY')
                : '—'
            }
          />
          <Field label="Gender" value={data.userDetails?.gender ?? '—'} />
          <Field
            label="Date of Birth"
            value={
              data.userDetails?.dob
                ? dayjs(data.userDetails.dob).format('MMM D, YYYY')
                : '—'
            }
          />
        </ProfileSection>

        <RoleComponentManager
          currentRole={data.role}
          roleRender={{
            student:
              data.role === 'student'
                ? studentDetails(data as UserStudentDetailsDto)
                : null,
            admin:
              data.role === 'admin'
                ? staffDetails(data as UserStaffDetailsDto)
                : null,
            mentor:
              data.role === 'mentor'
                ? staffDetails(data as UserStaffDetailsDto)
                : null,
          }}
        />

        <ProfileSection title="Other Details">
          <div> </div>
        </ProfileSection>
      </Stack>
    </Container>
  )
}

function studentDetails(data: UserStudentDetailsDto) {
  return (
    <ProfileSection title="Student Details">
      <Field
        label="Student Number"
        value={data.studentDetails?.studentNumber ?? '—'}
      />
      <Field
        label="Student Type"
        value={data.studentDetails?.studentType ?? '—'}
      />
      <Field
        label="Admission Date"
        value={
          data.studentDetails?.admissionDate
            ? dayjs(data.studentDetails.admissionDate).format('MMM D, YYYY')
            : '—'
        }
      />
    </ProfileSection>
  )
}

function staffDetails(data: UserStaffDetailsDto) {
  return (
    <ProfileSection title="Staff Details">
      <Field
        label="Employee Number"
        value={data.staffDetails?.employeeNumber ?? '—'}
      />
      <Field label="Department" value={data.staffDetails?.department ?? '—'} />
      <Field label="Position" value={data.staffDetails?.position ?? '—'} />
    </ProfileSection>
  )
}

function ProfileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Title order={3} size="h4" mb="sm" c="dark.6">
        {title}
      </Title>
      <Stack gap="xs" p="md" bg="gray.0" style={{ borderRadius: 8 }}>
        {children}
      </Stack>
    </Box>
  )
}

function Field({ 
  label, 
  value, 
  dataCy 
}: { 
  label: string; 
  value: string | number;
  dataCy?: string;
}) {
  return (
    <Flex justify="space-between" align="center">
      <Text c="dark.5" fw={500}>
        {label}
      </Text>
      <Text fw={600} c="dark.7" data-cy={dataCy}>
        {value}
      </Text>
    </Flex>
  )
}

export default ProfilePage