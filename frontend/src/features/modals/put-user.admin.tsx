import { AvatarUpload } from '@/components/avatar-upload'
import { ButtonGroup } from '@/components/button-group'
import {
  usersControllerCreateMutation,
  usersControllerCreateStaffMutation,
  usersControllerCreateStudentMutation,
  usersControllerFindAllQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Button,
  Divider,
  Grid,
  Group,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'
import {
  IconCalendarWeek,
  IconChalkboardTeacher,
  IconCheck,
  IconSchool,
  IconTool,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import {
  MainFormSchema,
  StaffFormSchema,
  StudentFormSchema,
  type MainFormValues,
  type StaffFormInput,
  type StaffFormOutput,
  type StudentFormInput,
  type StudentFormOutput,
} from './put-user-form.schema'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/integrations/supabase/supabase-client'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'

function PutUserModal({ context, id }: ContextModalProps<{ userId?: string }>) {
  const [active, setActive] = useState(0)

  const form = useForm<MainFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      role: 'student',
      profileImage: null,
      user: {
        firstName: '',
        lastName: '',
        middleName: undefined,
      },
      credentials: {
        email: '',
        password: undefined,
      },
      userDetails: {
        dob: undefined,
        dateJoined: new Date().toISOString(),
        gender: undefined,
      },
    },
    validate: zod4Resolver(MainFormSchema),
  })

  const { mutateAsync: create, isPending } = useMutation({
    ...usersControllerCreateMutation(),
    onSettled: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      })
    },
  })

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current
      }
      return current < 3 ? current + 1 : current
    })
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current))

  const handleFinish = async (values: MainFormValues) => {
    if (form.validate().hasErrors) return

    const user = await create({
      body: {
        role: values.role,
        user: values.user,
        credentials: values.credentials,
        userDetails: values.userDetails,
      },
    })

    if (values.profileImage)
      await handleProfileImageUpload(user.id, values.profileImage)

    context.closeContextModal(id)

    notifications.show({
      color: 'teal',
      title: `User Created`,
      message: `The ${values.role} user has been created`,
      icon: <IconCheck size={18} />,
      loading: false,
      autoClose: 1500,
    })
  }

  return (
    <Stack>
      <Stepper
        className="flex-1"
        iconSize={32}
        size="xs"
        radius="md"
        allowNextStepsSelect={false}
        active={active}
        onStepClick={setActive}
        classNames={{
          steps: 'gap-2',
          separator: 'hidden',
          step: 'flex flex-col flex-1 gap-1.5',
          stepWrapper: 'w-full',
          stepIcon: 'min-w-0 w-full min-h-0 h-1.5 rounded-none border-t-4',
          stepCompletedIcon: 'border-none',
        }}
      >
        <Stepper.Step
          label="Account"
          icon={<></>}
          completedIcon={<></>}
          className=""
        >
          <Stack>
            <Text className="font-semibold">Account Details</Text>
            <Stack align="center">
              <AvatarUpload
                size={120}
                file={form.getValues().profileImage}
                accept="image/png, image/jpeg"
                onImageUpload={(file) =>
                  form.setFieldValue('profileImage', file)
                }
                disabled={isPending}
              />
            </Stack>
            <ButtonGroup
              label="Role"
              options={[
                {
                  icon: <IconSchool size={20} />,
                  value: 'student',
                  label: 'Student',
                },
                {
                  icon: <IconChalkboardTeacher size={22} />,
                  value: 'mentor',
                  label: 'Mentor',
                },
                {
                  icon: <IconTool size={20} />,
                  value: 'admin',
                  label: 'Admin',
                },
              ]}
              disabled={isPending}
              key={form.key('role')}
              {...form.getInputProps('role')}
            />

            <Grid gutter="xs">
              <Grid.Col span={4.5}>
                <TextInput
                  label="First Name"
                  placeholder="Juan"
                  withAsterisk
                  disabled={isPending}
                  key={form.key('user.firstName')}
                  {...form.getInputProps('user.firstName')}
                />
              </Grid.Col>
              <Grid.Col span={4.5}>
                <TextInput
                  label="Last Name"
                  placeholder="Dela Cruz"
                  withAsterisk
                  disabled={isPending}
                  key={form.key('user.lastName')}
                  {...form.getInputProps('user.lastName')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput
                  label="Middle Name"
                  placeholder="Dante"
                  disabled={isPending}
                  key={form.key('user.middleName')}
                  {...form.getInputProps('user.middleName')}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  className="flex-1"
                  data={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Non-binary', label: 'Non-binary' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                    { value: 'Other', label: 'Other (self-describe)' },
                  ]}
                  disabled={isPending}
                  key={form.key('userDetails.gender')}
                  {...form.getInputProps('userDetails.gender')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DatePickerInput
                  label="Date of Birth"
                  placeholder="Pick a date..."
                  className="flex-1"
                  rightSection={<IconCalendarWeek size={20} opacity={0.5} />}
                  disabled={isPending}
                  key={form.key('userDetails.dob')}
                  {...form.getInputProps('userDetails.dob')}
                  value={form.getInputProps('userDetails.dob').value}
                  onChange={(val) =>
                    form
                      .getInputProps('userDetails.dob')
                      .onChange(`${val}T00:00:00Z`)
                  }
                />
              </Grid.Col>
            </Grid>

            <Divider label="Account Credentials" my="xs" />

            <Group gap="xs" align="start">
              <TextInput
                className="flex-1"
                label="Email"
                placeholder="name@email.com"
                withAsterisk
                disabled={isPending}
                key={form.key('credentials.email')}
                {...form.getInputProps('credentials.email')}
              />
              <TextInput
                className="flex-1"
                label="Password"
                placeholder="Input password..."
                disabled={isPending}
                key={form.key('credentials.password')}
                {...form.getInputProps('credentials.password')}
              />
            </Group>
          </Stack>

          <Group justify="space-between" mt="xl">
            <Group></Group>

            <Group>
              <Button
                variant="outline"
                onClick={() => handleFinish(form.getValues())}
                loading={isPending}
              >
                Finish
              </Button>
              <Button onClick={nextStep} disabled={isPending}>
                Next step
              </Button>
            </Group>
          </Group>
        </Stepper.Step>

        <Stepper.Step label="Details" icon={<></>} completedIcon={<></>}>
          {form.getValues().role === 'student' ? (
            <StudentForm
              mainForm={form.getValues()}
              onBack={prevStep}
              onClose={() => context.closeContextModal(id)}
            />
          ) : (
            <StaffForm
              mainForm={form.getValues()}
              onBack={prevStep}
              onClose={() => context.closeContextModal(id)}
            />
          )}
        </Stepper.Step>

        {/* <Stepper.Step label="Final" icon={<></>} completedIcon={<></>}>
          Step 3 content: Get full access
        </Stepper.Step> */}
        <Stepper.Completed>
          Completed, click back button to get to previous step
        </Stepper.Completed>
      </Stepper>
    </Stack>
  )
}

interface NextFormProps {
  mainForm: MainFormValues
  onBack: () => void
  onClose: () => void
}

function StudentForm(props: NextFormProps) {
  const { mutateAsync: create, isPending } = useMutation({
    ...usersControllerCreateStudentMutation(),
    onSettled: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      })
    },
  })

  const form = useForm<StudentFormInput>({
    mode: 'uncontrolled',
    initialValues: {
      student_number: null,
      student_type: null,
      admission_date: null,
      other_details: {},
    },
    validate: zod4Resolver(StudentFormSchema),
  })

  const handleFinish = async (values: StudentFormOutput) => {
    if (form.validate().hasErrors) return

    const user = await create({
      body: {
        user: props.mainForm.user,
        credentials: props.mainForm.credentials,
        userDetails: props.mainForm.userDetails,
        specificDetails: values,
      },
    })

    if (props.mainForm.profileImage)
      await handleProfileImageUpload(user.id, props.mainForm.profileImage)

    props.onClose()

    notifications.show({
      color: 'teal',
      title: `User Created`,
      message: `The student user has been created`,
      icon: <IconCheck size={18} />,
      loading: false,
      autoClose: 1500,
    })
  }

  return (
    <Stack>
      <Text className="font-semibold">Student Details</Text>
      <TextInput
        type="number"
        className="flex-1"
        label="Student Number"
        placeholder="202XXXXX"
        withAsterisk
        key={form.key('student_number')}
        {...form.getInputProps('student_number')}
        onChange={(val) =>
          form
            .getInputProps('student_number')
            .onChange(val.target.value !== '' ? Number(val.target.value) : null)
        }
      />
      <Select
        label="Student Type"
        placeholder="Select type"
        className="flex-1"
        withAsterisk
        withScrollArea={false}
        data={[
          { value: 'new', label: 'New' },
          { value: 'regular', label: 'Regular' },
          { value: 'irregular', label: 'Irregular' },
          { value: 'transfer', label: 'Transfer' },
          { value: 'returnee', label: 'Returnee' },
          { value: 'graduate', label: 'Graduate' },
          { value: 'special', label: 'Special' },
        ]}
        key={form.key('student_type')}
        {...form.getInputProps('student_type')}
      />
      <DatePickerInput
        className="flex-1"
        label="Admission Date"
        placeholder="Pick a date"
        withAsterisk
        key={form.key('admission_date')}
        {...form.getInputProps('admission_date')}
        value={form.getInputProps('admission_date').value}
        onChange={(val) =>
          form.getInputProps('admission_date').onChange(`${val}T00:00:00Z`)
        }
      />

      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          onClick={() => props.onBack()}
          disabled={isPending}
        >
          Back
        </Button>

        <Group>
          <Button
            onClick={() => handleFinish(form.getValues() as StudentFormOutput)}
            loading={isPending}
          >
            Finish
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}

function StaffForm(props: NextFormProps) {
  const { mutateAsync: create, isPending } = useMutation({
    ...usersControllerCreateStaffMutation(),
    onSettled: async () => {
      const { queryClient } = getContext()
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      })
    },
  })

  const form = useForm<StaffFormInput>({
    mode: 'uncontrolled',
    initialValues: {
      employee_number: null,
      department: null,
      position: null,
      other_details: {},
    },
    validate: zod4Resolver(StaffFormSchema),
  })

  const handleFinish = async (values: StaffFormOutput) => {
    console.log(form.validate().errors)
    if (form.validate().hasErrors) return

    if (props.mainForm.role === 'student') return

    const user = await create({
      body: {
        role: props.mainForm.role,
        user: props.mainForm.user,
        credentials: props.mainForm.credentials,
        userDetails: props.mainForm.userDetails,
        specificDetails: values,
      },
    })

    if (props.mainForm.profileImage)
      await handleProfileImageUpload(user.id, props.mainForm.profileImage)

    props.onClose()
    notifications.show({
      color: 'teal',
      title: `User Created`,
      message: `The student user has been created`,
      icon: <IconCheck size={18} />,
      loading: false,
      autoClose: 1500,
    })
  }

  console.log(form.values)

  return (
    <Stack>
      <Text className="font-semibold">Staff Details</Text>
      <TextInput
        type="number"
        className="flex-1"
        label="Employee Number"
        placeholder="202XXXXX"
        withAsterisk
        disabled={isPending}
        key={form.key('employee_number')}
        {...form.getInputProps('employee_number')}
        onChange={(val) =>
          form
            .getInputProps('employee_number')
            .onChange(val.target.value !== '' ? Number(val.target.value) : null)
        }
      />
      <TextInput
        className="flex-1"
        label="Department"
        placeholder="Department"
        withAsterisk
        disabled={isPending}
        key={form.key('department')}
        {...form.getInputProps('department')}
      />
      <TextInput
        className="flex-1"
        label="Position"
        placeholder="Position"
        withAsterisk
        disabled={isPending}
        key={form.key('position')}
        {...form.getInputProps('position')}
      />

      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          onClick={() => props.onBack()}
          disabled={isPending}
        >
          Back
        </Button>

        <Group>
          <Button
            onClick={() => handleFinish(form.getValues() as StaffFormOutput)}
            loading={isPending}
          >
            Finish
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}

const handleProfileImageUpload = async (id: string, file: File) => {
  const filePath = `${id}.jpg`
  const { data } = await supabase.storage
    .from(SupabaseBuckets.USER_AVATARS)
    .upload(filePath, file, {
      contentType: file.type,
    })

  return data
}

export default PutUserModal
