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
import { IconArrowLeft } from '@tabler/icons-react'

function AddCurriculumCourse() {
  const navigate = Route.useNavigate()

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
          <Button>Save</Button>
        </Group>
      </Group>

      <Stack>
        <Stack>
          <Group>
            <TextInput
              variant="filled"
              label="Name"
              placeholder="Course name"
              withAsterisk
              className="flex-2"
            />
            <TextInput
              variant="filled"
              label="Course Code"
              placeholder="MO-IT100"
              withAsterisk
              className="flex-1"
            />
            <NumberInput
              variant="filled"
              label="Units"
              placeholder="0"
              withAsterisk
              className="flex-1"
              min={0}
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
            />
          </Group>

          <Textarea
            variant="filled"
            label="Description"
            placeholder="Write the description here..."
            autosize
            minRows={4}
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
