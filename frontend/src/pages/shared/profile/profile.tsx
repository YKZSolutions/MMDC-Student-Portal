import RoleComponentManager from '@/components/role-component-manager'
import SupabaseAvatar from '@/components/supabase-avatar'
import { SuspendedProfile } from '@/features/profile/suspense'
import type {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/integrations/api/client'
import { usersControllerGetMeOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import {
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Paper,
  rem,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconId,
  IconMail,
  IconPencil,
  IconSchool,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Suspense } from 'react'

function ProfileQueryProvider({
  children,
}: {
  children: (
    data: UserStudentDetailsDto | UserStaffDetailsDto,
  ) => React.ReactNode
}) {
  const { data } = useSuspenseQuery(usersControllerGetMeOptions())

  return children(data)
}

function ProfilePage() {
  return (
    <Suspense fallback={<SuspendedProfile />}>
      <ProfileQueryProvider>
        {(data) => {
          const fullName =
            `${data.firstName} ${data.middleName ?? ''} ${data.lastName}`.trim()

          return (
            <Container size="md" w="100%" py="xl">
              <Stack gap="xl">
                {/* Header Section */}
                <Group gap="lg" align="start">
                  <SupabaseAvatar
                    size={rem(90)}
                    bucket={SupabaseBuckets.USER_AVATARS}
                    path={data.id}
                    imageType="jpg"
                    name={fullName}
                  />

                  <Stack gap={0} my={'auto'}>
                    <Title order={3} fw={600}>
                      {fullName}
                    </Title>
                    <Text size="lg" fw={500} c="gray.6" tt="capitalize">
                      {data.role ?? 'User'}
                    </Text>
                    <Text size="sm" c="gray.5">
                      Member since{' '}
                      {data.userDetails?.dateJoined
                        ? dayjs(data.userDetails.dateJoined).format('MMMM YYYY')
                        : '—'}
                    </Text>
                  </Stack>

                  <Flex gap="md" ml="auto">
                    <Button
                      leftSection={<IconPencil size={16} />}
                      variant="light"
                      color="gray"
                      radius="md"
                    >
                      Edit Profile
                    </Button>
                    <Button
                      leftSection={<IconTrash size={16} />}
                      variant="light"
                      color="red"
                      radius="md"
                    >
                      Deactivate
                    </Button>
                  </Flex>
                </Group>

                <Stack>
                  {/* Personal Information */}
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Paper
                        radius="md"
                        p="xl"
                        withBorder
                        h="100%"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'stretch',
                          minHeight: '100%',
                        }}
                      >
                        <Stack gap="lg" style={{ flex: 1 }}>
                          <Title order={3} size="h4" fw={600} c="gray.8">
                            Personal Information
                          </Title>

                          <Grid>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <InfoItem
                                label="Full Name"
                                value={fullName}
                                icon={<IconUser color="gray" size={16} />}
                              />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <InfoItem
                                label="Email"
                                value={data.email ?? '—'}
                                dataCy="profile-email-value"
                                icon={<IconMail color="gray" size={16} />}
                              />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <InfoItem
                                label="Role"
                                value={data.role ?? '—'}
                                icon={<IconBriefcase color="gray" size={16} />}
                              />
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Paper
                        radius="md"
                        p="xl"
                        withBorder
                        h="100%"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'stretch',
                          minHeight: '100%',
                        }}
                      >
                        <Stack gap="lg" style={{ flex: 1 }}>
                          <Title order={3} size="h4" fw={600} c="gray.8">
                            Account Information
                          </Title>

                          <Grid>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <InfoItem
                                label="Date Joined"
                                value={
                                  data.userDetails?.dateJoined
                                    ? dayjs(data.userDetails.dateJoined).format(
                                        'MMM D, YYYY',
                                      )
                                    : '—'
                                }
                                icon={<IconCalendar color="gray" size={16} />}
                              />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <InfoItem
                                label="Last Updated"
                                value={
                                  data.userDetails?.updatedAt
                                    ? dayjs(data.userDetails.updatedAt).format(
                                        'MMM D, YYYY',
                                      )
                                    : '—'
                                }
                                icon={<IconCalendar color="gray" size={16} />}
                              />
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>
                    </Grid.Col>
                  </Grid>

                  {/* Role-Specific Information */}
                  <RoleComponentManager
                    currentRole={data.role}
                    roleRender={{
                      student:
                        data.role === 'student' ? (
                          <StudentDetails
                            data={data as UserStudentDetailsDto}
                          />
                        ) : null,
                      admin:
                        data.role === 'admin' ? (
                          <StaffDetails data={data as UserStaffDetailsDto} />
                        ) : null,
                      mentor:
                        data.role === 'mentor' ? (
                          <StaffDetails data={data as UserStaffDetailsDto} />
                        ) : null,
                    }}
                  />
                </Stack>
              </Stack>
            </Container>
          )
        }}
      </ProfileQueryProvider>
    </Suspense>
  )
}

function StudentDetails({ data }: { data: UserStudentDetailsDto }) {
  console.log(data)
  return (
    <Paper radius="md" p="xl" withBorder>
      <Stack gap="lg">
        <Title order={3} size="h4" fw={600} c="gray.8">
          Student Details
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Student Number"
              value={data.studentDetails?.studentNumber ?? '—'}
              icon={<IconId color="gray" size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Student Type"
              value={data.studentDetails?.studentType ?? '—'}
              icon={<IconSchool color="gray" size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Year Level"
              value={data.studentDetails?.yearLevel ?? '—'}
              icon={<IconCalendar color="gray" size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Admission Date"
              value={
                data.studentDetails?.admissionDate
                  ? dayjs(data.studentDetails.admissionDate).format(
                      'MMM D, YYYY',
                    )
                  : '—'
              }
              icon={<IconCalendar color="gray" size={16} />}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  )
}

function StaffDetails({ data }: { data: UserStaffDetailsDto }) {
  return (
    <Paper radius="md" p="xl" withBorder>
      <Stack gap="lg">
        <Title order={3} size="h4" fw={600} c="gray.8">
          Staff Details
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Employee Number"
              value={data.staffDetails?.employeeNumber ?? '—'}
              icon={<IconId color="gray" size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Department"
              value={data.staffDetails?.department ?? '—'}
              icon={<IconBuilding color="gray" size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem
              label="Position"
              value={data.staffDetails?.position ?? '—'}
              icon={<IconBriefcase color="gray" size={16} />}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  )
}

function InfoItem({
  label,
  value,
  dataCy,
  icon,
}: {
  label: string
  value: string | number
  dataCy?: string
  icon?: React.ReactNode
}) {
  return (
    <Stack gap={rem(5)}>
      <Group gap={rem(5)} align="center">
        {icon}
        <Text size="xs" fw={500} tt="uppercase" c="gray.6">
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={500} c="gray.9" data-cy={dataCy}>
        {value}
      </Text>
    </Stack>
  )
}

export default ProfilePage
