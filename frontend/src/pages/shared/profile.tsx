import RoleComponentManager from '@/components/role-component-manager'
import type {
  UserDetailsFullDto,
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
import { usersControllerGetMeOptions } from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import { useQuery } from '@tanstack/react-query'

// type ProfileUser = {
//   firstName: string
//   middleName?: string | null
//   lastName: string
//   role: 'student' | 'staff' | 'admin'
//   userAccount?: {
//     email: string | null
//   }
//   userDetails?: {
//     dateJoined: string
//     dob?: string | null
//     gender?: string | null
//   }
//   studentDetails?: {
//     student_number: number
//     student_type: string
//     admission_date: string
//   }
//   staffDetails?: {
//     employee_number: number
//     department: string
//     position: string
//   }
// }

// const mockStudent: UserStudentDetailsDto = {
//   id: '',
//   email: 'jane.doe@example.com',
//   firstName: 'Jane',
//   middleName: 'A.',
//   lastName: 'Doe',
//   role: 'student',
//   userDetails: {
//     dateJoined: '2024-09-01T00:00:00.000Z',
//     dob: '2002-05-15T00:00:00.000Z',
//     gender: 'Female',
//     id: '',
//     createdAt: '',
//     updatedAt: '',
//     deletedAt: null,
//   },
//   studentDetails: {
//     student_number: 202301234,
//     student_type: 'regular',
//     admission_date: '2024-08-15T00:00:00.000Z',
//     id: '',
//     other_details: {},
//     createdAt: '',
//     updatedAt: '',
//     deletedAt: null,
//   },
// }

const mockStaff: UserStaffDetailsDto = {
  id: '',
  email: null,
  firstName: '',
  middleName: null,
  lastName: '',
  role: 'student',
  userDetails: null,
  staffDetails: null,
}

const staffDetails = (
  <ProfileSection title="Staff Details">
    <Field
      label="Employee Number"
      value={mockStaff.staffDetails?.employee_number ?? '—'}
    />
    <Field
      label="Department"
      value={mockStaff.staffDetails?.department ?? '—'}
    />
    <Field label="Position" value={mockStaff.staffDetails?.position ?? '—'} />
  </ProfileSection>
)

const studentDetails = (data) => {
  return <ProfileSection title="Student Details">
    <Field
      label="Student Number"
      value={data.studentDetails?.student_number ?? '—'}
    />
    <Field
      label="Student Type"
      value={data.studentDetails?.student_type ?? '—'}
    />
    <Field
      label="Admission Date"
      value={
        data.studentDetails?.admission_date
          ? dayjs(data.studentDetails.admission_date).format(
              'MMM D, YYYY',
            )
          : '—'
      }
    />
  </ProfileSection>
}

function ProfilePage() {
  const {data} = useQuery(usersControllerGetMeOptions())
  const fullName = `${data?.firstName} ${data?.middleName ?? ''} ${data?.lastName}`

  return (
    <Container fluid m={0}>
      <Box pb="lg">
        <Flex justify="space-between" align="center">
          {/* Avatar Section */}
          <Flex align="center" gap="md">
            <Avatar size={80} radius="xl" color="blue">
              {data?.firstName[0]}
              {data?.lastName[0]}
            </Avatar>
            <Box>
              <Title order={2} fw={700} c="dark.7">
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
          <Field label="Email" value={data?.email ?? '—'} />
          <Field
            label="Date Joined"
            value={
              data?.userDetails?.dateJoined
                ? dayjs(data?.userDetails.dateJoined).format(
                    'MMM D, YYYY',
                  )
                : '—'
            }
          />
          <Field
            label="Gender"
            value={data?.userDetails?.gender ?? '—'}
          />
          <Field
            label="Date of Birth"
            value={
              data?.userDetails?.dob
                ? dayjs(data?.userDetails.dob).format('MMM D, YYYY')
                : '—'
            }
          />
        </ProfileSection>

        <RoleComponentManager
          currentRole={data?.role || 'student'}
          roleRender={{
            student: studentDetails(data),
            admin: staffDetails,
            mentor: staffDetails,
          }}
        />

        {/* Other details */}
        <ProfileSection title="Other Details">
          <div> </div>
        </ProfileSection>
      </Stack>
    </Container>
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

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <Flex justify="space-between" align="center">
      <Text c="dark.5" fw={500}>
        {label}
      </Text>
      <Text fw={600} c="dark.7">
        {value}
      </Text>
    </Flex>
  )
}

export default ProfilePage
