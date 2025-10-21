import PaginatedTable from '@/components/paginated-table'
import {
  courseFormSchema,
  type CourseFormInput,
  type CourseFormOutput,
} from '@/features/curriculum/schema/add-course.schema'
import { useQuickAction } from '@/hooks/use-quick-action'
import { useQuickForm } from '@/hooks/use-quick-form'
import { useSearchState } from '@/hooks/use-search-state'
import {
  coursesControllerCreateMutation,
  coursesControllerFindAllOptions,
  coursesControllerFindAllQueryKey,
  coursesControllerFindOneOptions,
  coursesControllerRemoveMutation,
  coursesControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Box,
  Button,
  Container,
  Drawer,
  Group,
  NumberInput,
  rem,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { IconFilter2, IconPlus, IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const route = getRouteApi('/(protected)/curriculum/courses/')

export default function CurriculumCourses() {
  return (
    <Container size={'md'} w="100%" flex={1} pb="xl" className="flex flex-col">
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Courses
        </Title>
        <Text c={'dark.3'} fw={500}>
          View and manage all courses
        </Text>
      </Box>

      <Stack gap={'md'} flex={1}>
        <Group gap={rem(5)} justify="end" align="center">
          <TextInput
            placeholder="Search year/term/date"
            radius={'md'}
            leftSection={<IconSearch size={18} stroke={1} />}
            w={rem(250)}
          />
          <Button
            variant="default"
            radius={'md'}
            leftSection={<IconFilter2 color="gray" size={20} />}
            lts={rem(0.25)}
          >
            Filters
          </Button>
          <CreateCourseDrawer />
        </Group>

        <EnrollmentTable />
      </Stack>
    </Container>
  )
}

function EnrollmentTable() {
  const navigate = route.useNavigate()

  const handleOpenDrawer = (id: string) => {
    navigate({
      search: {
        updateCourse: id,
      },
    })
  }

  const {
    search: { page, search },
    handlePage,
  } = useSearchState(route)

  const { data: paginated } = useSuspenseQuery(
    coursesControllerFindAllOptions({ query: { page, search } }),
  )

  const { remove, isPending } = useQuickAction({
    name: 'courses',
    removeMutationOptions: coursesControllerRemoveMutation({}),
    queryKeyInvalidation: coursesControllerFindAllQueryKey({
      query: { page, search },
    }),
  })

  const { courses, meta } = paginated

  return (
    <PaginatedTable
      fullHeight
      data={courses}
      meta={meta}
      currentPage={page}
      onPaginationChange={(val) => handlePage(val)}
      heading={['Code', 'Name', 'Units', 'Prerequisites', 'Corequisites']}
      onItemEdit={(course) => handleOpenDrawer(course.id)}
      onItemDelete={(course) =>
        remove.mutateAsync({
          path: { id: course.id },
          query: { directDelete: true },
        })
      }
      rowComponent={(course) => (
        <>
          <Table.Td>
            <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
              {course.courseCode}
            </Text>
          </Table.Td>

          <Table.Td>
            <Text size="sm" c={'dark.8'} fw={500} py={'xs'}>
              {course?.name}
            </Text>
          </Table.Td>

          {/* <Table.Td>
              <Badge radius="lg">
                <Text size="sm" className="capitalize" fw={500} py={'xs'}>
                  {course.department}
                </Text>
              </Badge>
            </Table.Td>

            <Table.Td>
              <Badge variant="light" radius="lg">
                <Text size="sm" className="capitalize" fw={500} py={'xs'}>
                  {course.type}
                </Text>
              </Badge>
            </Table.Td> */}

          <Table.Td>
            <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
              {course.units}
            </Text>
          </Table.Td>

          <Table.Td>
            <Stack gap={0} py={'xs'}>
              {course.prereqs.length > 0 ? (
                <>
                  <Text size="sm" c={'dark.3'} fw={500}>
                    {course.prereqs[0].name}
                  </Text>
                  <Text size="xs" c={'dark.1'} fw={500}>
                    {course.prereqs[0].courseCode}
                  </Text>
                </>
              ) : (
                <Text size="sm" c={'dark.3'} fw={500}>
                  N/A
                </Text>
              )}
            </Stack>
          </Table.Td>

          <Table.Td>
            <Stack gap={0} py={'xs'}>
              {course.coreqs.length > 0 ? (
                <>
                  <Text size="sm" c={'dark.3'} fw={500}>
                    {course.coreqs[0].name}
                  </Text>
                  <Text size="xs" c={'dark.1'} fw={500}>
                    {course.coreqs[0].courseCode}
                  </Text>
                </>
              ) : (
                <Text size="sm" c={'dark.3'} fw={500}>
                  N/A
                </Text>
              )}
            </Stack>
          </Table.Td>
        </>
      )}
    />
  )
}

function CreateCourseDrawer() {
  const { createCourse, updateCourse } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (opened: boolean) => {
    navigate({
      search: {
        createCourse: opened ? opened : undefined,
        updateCourse: undefined,
      },
    })
  }

  const opened = createCourse === true || updateCourse !== undefined

  return (
    <>
      <Button
        variant="filled"
        radius={'md'}
        leftSection={<IconPlus size={20} />}
        lts={rem(0.25)}
        onClick={() => handleDrawerState(true)}
      >
        Create
      </Button>
      <Drawer
        position="right"
        opened={opened}
        onClose={() => handleDrawerState(false)}
      >
        <CreateCourseForm />
      </Drawer>
    </>
  )
}

function CreateCourseForm() {
  const { updateCourse } = route.useSearch()
  const {
    search: { page, search },
  } = useSearchState(route)
  const navigate = route.useNavigate()

  const { create, update, form, isPending } = useQuickForm<
    CourseFormInput,
    CourseFormOutput
  >()({
    name: 'course',
    formOptions: {
      initialValues: {
        courseCode: '',
        name: '',
        description: '',
        type: '',
        units: 0,
        majorIds: [],
        prereqIds: [],
        coreqIds: [],
      },
      validate: zod4Resolver(courseFormSchema),
    },
    transformQueryData: (course) => ({
      courseCode: course.courseCode,
      name: course.name,
      description: course.description,
      type: course.type,
      units: course.units,
    }),
    queryOptions: {
      ...coursesControllerFindOneOptions({
        path: { id: updateCourse || '' },
      }),
      enabled: !!updateCourse,
    },
    createMutationOptions: coursesControllerCreateMutation({}),
    updateMutationOptions: coursesControllerUpdateMutation({
      path: { id: updateCourse || '' },
    }),
    queryKeyInvalidation: coursesControllerFindAllQueryKey({
      query: { page, search },
    }),
  })

  const handleCloseDrawer = () => {
    navigate({
      search: {
        createCourse: undefined,
        updateCourse: undefined,
      },
    })
  }

  const handleCreate = async (values: CourseFormOutput) => {
    if (form.validate().hasErrors) return
    const { courseCode, name, description, units, type } = values

    await create.mutateAsync({
      body: {
        courseCode,
        name,
        description,
        type,
        units,
      },
    })

    handleCloseDrawer()
  }

  const handleUpdate = async (values: CourseFormOutput) => {
    if (form.validate().hasErrors || !updateCourse) return
    const { courseCode, name, description, units, type } = values

    await update.mutateAsync({
      path: { id: updateCourse },
      body: {
        courseCode,
        name,
        description,
        type,
        units,
      },
    })

    handleCloseDrawer()
  }

  return (
    <Stack>
      <Group mb="lg" justify="space-between">
        <Group align="start">
          <Stack gap={0}>
            <Title c={'dark.7'} variant="hero" order={2} fw={700}>
              {updateCourse ? 'Update' : 'Add'} Course
            </Title>
            <Text c={'dark.3'} fw={500}>
              {updateCourse ? 'Update a' : 'Add a new'} course
            </Text>
          </Stack>
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
          </Group>

          <Group>
            <Select
              variant="filled"
              label="Type"
              placeholder="Select type"
              withAsterisk
              className="flex-3"
              data={[
                { value: 'core', label: 'Core' },
                { value: 'elective', label: 'Elective' },
                { value: 'general', label: 'General' },
                { value: 'major', label: 'Major' },
                { value: 'specialization', label: 'Specialization' },
              ]}
              disabled={isPending}
              key={form.key('type')}
              {...form.getInputProps('type')}
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
            {/* <Select
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
            /> */}
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

        {/* <Stack>
          <Text fw={500}>Pre-requisites</Text>
        </Stack>

        <Stack>
          <Text fw={500}>Co-requisites</Text>
        </Stack> */}

        <Group justify="end">
          <Button
            variant="light"
            onClick={handleCloseDrawer}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              updateCourse
                ? handleUpdate(form.getValues())
                : handleCreate(form.getValues())
            }
            disabled={isPending}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Stack>
  )
}
