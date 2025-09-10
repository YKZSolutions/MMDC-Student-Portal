import AsyncSearchSelect from '@/components/async-search-select'
import CurriculumBuilder from '@/features/curriculum/components/curriculum-builder'
import { useCurriculumBuilder } from '@/features/curriculum/hooks/curriculum.builder.hook'
import {
  curriculumFormSchema,
  type CurriculumFormInput,
  type CurriculumFormOutput,
} from '@/features/curriculum/schema/add-curriculum.schema'
import {
  curriculumControllerCreateMutation,
  programControllerFindAllMajorsOptions,
  programControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const route = getRouteApi('/(protected)/curriculum/create')

function CurriculumCreate() {
  const navigate = route.useNavigate()
  const { currentCourses, ...builder } = useCurriculumBuilder()
  console.log(builder.courses)
  const form = useForm<CurriculumFormInput>({
    mode: 'uncontrolled',
    initialValues: {
      program: null,
      major: null,
      description: '',
    },
    validate: zod4Resolver(curriculumFormSchema),
  })

  const { mutate: addCurriculum, isPending } = useAppMutation(
    curriculumControllerCreateMutation,
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
    {
      onSuccess: () => {
        navigate({
          to: '/curriculum',
        })
      },
    },
  )

  const handleSubmit = (values: CurriculumFormOutput) => {
    if (form.validate().hasErrors) return

    const { major: majorId, description } = values

    const courses = currentCourses.map((course, idx) => ({
      courseId: course.id,
      order: idx,
      year: course.year,
      semester: course.semester,
    }))

    addCurriculum({
      body: {
        majorId,
        curriculum: {
          icon: '',
          name: '',
          description,
        },
        courses: courses,
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
                to: '/curriculum',
              })
            }
          >
            <IconArrowLeft />
          </ActionIcon>
          <Stack gap={0}>
            <Title c={'dark.7'} variant="hero" order={2} fw={700}>
              Curriculum Builder
            </Title>
            <Text c={'dark.3'} fw={500}>
              Create a new curriculum for a program and major
            </Text>
          </Stack>
        </Group>

        <Group>
          <Button
            leftSection={<IconDeviceFloppy size={20} />}
            onClick={() =>
              handleSubmit(form.getValues() as CurriculumFormOutput)
            }
          >
            Save
          </Button>
        </Group>
      </Group>

      <Stack>
        <Group align="start">
          <AsyncSearchSelect
            variant="filled"
            label="Program"
            placeholder="Pick a program"
            selectFirstOptionOnChange
            withAsterisk
            className="flex-1"
            preloadOptions
            getOptions={(search) =>
              programControllerFindAllOptions({ query: { search } })
            }
            mapData={(data) =>
              data.programs.map((program) => ({
                value: program.id,
                label: program.name,
              }))
            }
            disabled={isPending}
            key={form.key('program')}
            {...form.getInputProps('program')}
            onChange={(val) => {
              form.getInputProps('program').onChange(val)

              form.setFieldValue('major', null)
            }}
          />
          <AsyncSearchSelect
            variant="filled"
            label="Major"
            placeholder="Pick a major"
            selectFirstOptionOnChange
            withAsterisk
            className="flex-1"
            preloadOptions
            getOptions={(search) =>
              programControllerFindAllMajorsOptions({
                path: { programId: form.getValues().program || '' },
                query: { search },
              })
            }
            mapData={(data) =>
              data.majors.map((major) => ({
                value: major.id,
                label: major.name,
              }))
            }
            disabled={form.getValues().program === null || isPending}
            key={form.key('major')}
            {...form.getInputProps('major')}
          />
          {/* <IconSelector variant="filled" w={120} /> */}
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

        <CurriculumBuilder currentCourses={currentCourses} {...builder} />
      </Stack>
    </Container>
  )
}

export default CurriculumCreate
