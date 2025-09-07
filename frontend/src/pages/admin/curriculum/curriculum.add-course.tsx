import {
  courseFormSchema,
  type CourseFormInput,
  type CourseFormOutput,
} from '@/features/curriculum/schema/add-course.schema'
import { coursesControllerCreateMutation } from '@/integrations/api/client/@tanstack/react-query.gen'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Route } from '@/routes/(protected)/curriculum/courses/create'
import {
  ActionIcon,
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft } from '@tabler/icons-react'
import { zod4Resolver } from 'mantine-form-zod-resolver'

function AddCurriculumCourse() {
  const navigate = Route.useNavigate()

  const form = useForm<CourseFormInput>({
    mode: 'uncontrolled',
    initialValues: {
      courseCode: '',
      name: '',
      description: '',
      units: 0,
      majorIds: [],
    },
    validate: zod4Resolver(courseFormSchema),
  })

  const { mutate: addCourse, isPending } = useAppMutation(
    coursesControllerCreateMutation,
    {
      loading: {
        title: 'Adding Course',
        message: 'Adding course',
      },
      success: {
        title: 'Added Course',
        message: 'Successfully added course',
      },
    },
  )

  const handleFinish = async (values: CourseFormOutput) => {
    if (form.validate().hasErrors) return
    const { courseCode, name, description, units } = values

    addCourse({
      body: {
        courseCode,
        name,
        description,
        units,
      },
    })
  }

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Group mb="lg" justify="space-between">
        <Group align="start">
          <ActionIcon
            variant="subtle"
            radius="lg"
            mt={4}
            onClick={() =>
              navigate({
                to: '/curriculum/courses',
              })
            }
          >
            <IconArrowLeft />
          </ActionIcon>
          <Stack gap={0}>
            <Title c={'dark.7'} variant="hero" order={2} fw={700}>
              Add Course
            </Title>
            <Text c={'dark.3'} fw={500}>
              Add a new course
            </Text>
          </Stack>
        </Group>

        <Group justify="end">
          {/* <Button variant="light">Cancel</Button> */}
          <Button
            onClick={() => handleFinish(form.getValues() as CourseFormOutput)}
            disabled={isPending}
          >
            Save
          </Button>
        </Group>
      </Group>

      <Stack>
        <Stack>
          <Group align="start">
            <TextInput
              variant="filled"
              label="Name"
              placeholder="Course name"
              withAsterisk
              className="flex-2"
              disabled={isPending}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              variant="filled"
              label="Course Code"
              placeholder="MO-IT100"
              withAsterisk
              className="flex-1"
              disabled={isPending}
              key={form.key('courseCode')}
              {...form.getInputProps('courseCode')}
            />
            <NumberInput
              variant="filled"
              label="Units"
              placeholder="0"
              withAsterisk
              className="flex-1"
              min={0}
              disabled={isPending}
              key={form.key('units')}
              {...form.getInputProps('units')}
            />
          </Group>

          <Group>
            <Select
              variant="filled"
              label="Type"
              placeholder="Select type"
              withAsterisk
              className="flex-1"
              data={[
                { value: 'core', label: 'Core' },
                { value: 'elective', label: 'Elective' },
                { value: 'general', label: 'General' },
                { value: 'major', label: 'Major' },
                { value: 'specialization', label: 'Specialization' },
              ]}
              disabled={isPending}
            />
            <Select
              variant="filled"
              label="Department"
              placeholder="Select department"
              withAsterisk
              className="flex-1"
              data={[
                { value: 'GE', label: 'General Education' },
                { value: 'IT', label: 'Information Technology' },
                { value: 'BA', label: 'Business Administration' },
              ]}
              disabled={isPending}
            />
          </Group>

          <Textarea
            variant="filled"
            label="Description"
            placeholder="Write the description here..."
            autosize
            minRows={4}
            disabled={isPending}
            key={form.key('description')}
            {...form.getInputProps('description')}
          />
        </Stack>

        <Stack>
          <Text fw={500}>Pre-requisites</Text>
        </Stack>

        <Stack>
          <Text fw={500}>Co-requisites</Text>
        </Stack>
      </Stack>
    </Container>
  )
}

export default AddCurriculumCourse
