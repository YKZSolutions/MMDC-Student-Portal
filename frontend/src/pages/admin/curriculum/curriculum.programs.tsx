import {
  majorFormSchema,
  type MajorFormInput,
  type MajorFormOutput,
} from '@/features/curriculum/schema/add-major.schema'
import {
  programFormSchema,
  type ProgramFormInput,
  type ProgramFormOutput,
} from '@/features/curriculum/schema/add-program.schema'
import { usePaginationSearch } from '@/features/pagination/use-pagination-search'
import { useQuickAction } from '@/hooks/use-quick-action'
import { useQuickForm } from '@/hooks/use-quick-form'
import type { MajorItemDto, ProgramDto } from '@/integrations/api/client'
import {
  majorControllerCreateMutation,
  majorControllerFindAllQueryKey,
  majorControllerFindOneOptions,
  majorControllerRemoveMutation,
  majorControllerUpdateMutation,
  programControllerCreateMutation,
  programControllerFindAllMajorsOptions,
  programControllerFindAllMajorsQueryKey,
  programControllerFindAllOptions,
  programControllerFindAllQueryKey,
  programControllerFindOneOptions,
  programControllerRemoveMutation,
  programControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NumberInput,
  rem,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconBookmark,
  IconCalendarEvent,
  IconDots,
  IconDotsVertical,
  IconFilter2,
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Fragment, Suspense } from 'react'

const route = getRouteApi('/(protected)/curriculum/programs/')

export default function CurriculumPrograms() {
  return (
    <Container size={'md'} w="100%" flex={1} pb="xl" className="flex flex-col">
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Programs
        </Title>
        <Text c={'dark.3'} fw={500}>
          View and manage all programs and majors
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
          <ProgramFormDrawer />
        </Group>

        <ProgramsList />
      </Stack>
    </Container>
  )
}

function ProgramsList() {
  const { selectedProgram } = route.useSearch()
  const navigate = route.useNavigate()

  const {
    pagination: { page, search },
  } = usePaginationSearch(route)

  const { data: paginated } = useSuspenseQuery(
    programControllerFindAllOptions({ query: { page, search } }),
  )

  const { programs } = paginated

  const { remove } = useQuickAction({
    name: 'program',
    removeMutationOptions: programControllerRemoveMutation({}),
    queryKeyInvalidation: programControllerFindAllQueryKey({
      query: { page, search },
    }),
  })

  const handleDrawerUpdate = (programId: string) => {
    navigate({
      search: {
        updateProgram: programId,
      },
    })
  }

  const handleSelectProgram = (programId: string) => {
    navigate({
      search: {
        selectedProgram: programId,
      },
    })
  }

  const handleRemoveProgram = (programId: string) => {
    remove.mutateAsync({
      path: { id: programId },
      query: { directDelete: true },
    })
  }

  return (
    <Group align="start" flex={1}>
      <SimpleGrid
        flex={!selectedProgram ? 1 : undefined}
        cols={{
          base: 1,
          sm: 1,
          md: selectedProgram ? 1 : 2,
          lg: selectedProgram ? 2 : 3,
          xl: selectedProgram ? 2 : 3,
        }}
      >
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onClick={(id) => handleSelectProgram(id)}
            onEdit={(id) => handleDrawerUpdate(id)}
            onDelete={(id) => handleRemoveProgram(id)}
          />
        ))}
      </SimpleGrid>
      {selectedProgram && (
        <Suspense>
          <MajorsList />
        </Suspense>
      )}
    </Group>
  )
}

function ProgramCard({
  program,
  onClick,
  onEdit,
  onDelete,
}: {
  program: ProgramDto
  onClick: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card
      key={program.id}
      radius="md"
      shadow="sm"
      withBorder
      className="cursor-pointer"
      onClick={() => onClick(program.id)}
    >
      <Group>
        <Stack gap={4} w="100%">
          <Group justify="space-between" align="start" wrap="nowrap">
            <Text size="lg" fw={600} c="primary">
              {program.programCode}
            </Text>

            <Menu shadow="md" width={140}>
              <Menu.Target>
                <ActionIcon
                  onClick={(e) => e.stopPropagation()}
                  variant="subtle"
                  color="gray"
                  radius={'xl'}
                >
                  <IconDots size={20} stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(program.id)
                  }}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  c="red"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(program.id)
                  }}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Group gap={4} c="dimmed" wrap="nowrap">
            <IconBookmark size={14} />
            <Text size="sm">{program.name}</Text>
          </Group>
          <Group gap={4} c="dimmed">
            <IconCalendarEvent size={14} />
            <Text size="xs">{program.yearDuration} Years</Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

function MajorsList() {
  const { selectedProgram } = route.useSearch()
  const navigate = route.useNavigate()

  const { data: program } = useSuspenseQuery(
    programControllerFindOneOptions({
      path: { id: selectedProgram || '' },
    }),
  )
  const { data: paginated } = useSuspenseQuery(
    programControllerFindAllMajorsOptions({
      path: { programId: selectedProgram || '' },
    }),
  )

  const { majors, meta } = paginated

  const { remove } = useQuickAction({
    name: 'major',
    removeMutationOptions: majorControllerRemoveMutation({}),
    queryKeyInvalidation: programControllerFindAllMajorsQueryKey({
      path: { programId: selectedProgram || '' },
    }),
  })

  const handleDrawerUpdate = (majorId: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        updateMajor: majorId,
      }),
    })
  }

  const handleRemoveMajor = (majorId: string) => {
    remove.mutateAsync({
      path: { id: majorId },
      query: { directDelete: true },
    })
  }

  return (
    selectedProgram && (
      <Card flex={1} h="100%" mah={500} radius="md" shadow="lg" withBorder>
        <Card.Section>
          <Group justify="space-between" mx={8} mt={4} mb="xs">
            <ActionIcon
              radius="xl"
              variant="subtle"
              onClick={() =>
                navigate({
                  search: {
                    selectedProgram: undefined,
                  },
                })
              }
            >
              <IconX size={20} />
            </ActionIcon>

            <MajorFormDrawer />
          </Group>
        </Card.Section>

        <Stack gap={4} mb="md">
          <Text size="lg" fw={600} c="primary">
            {program.name}
          </Text>
          <Text size="sm" c="dimmed">
            {program.description.trim() !== ''
              ? program.description
              : 'No description'}
          </Text>
          <Group mt="xs" gap="xs">
            <Badge
              variant="light"
              className="lowercase"
            >{`${program.yearDuration} years`}</Badge>
            <Badge
              variant="light"
              className="lowercase"
            >{`${meta.totalCount} majors`}</Badge>
          </Group>
        </Stack>

        <Text size="sm" fw={600}>
          Majors
        </Text>

        <Divider mt={4} mb="sm" />

        {meta.totalCount > 0 ? (
          <ScrollArea>
            {majors.map((major) => (
              <Fragment key={major.id}>
                <MajorRow
                  major={major}
                  onEdit={(id) => handleDrawerUpdate(id)}
                  onDelete={(id) => handleRemoveMajor(id)}
                />
                <Divider my="sm" />
              </Fragment>
            ))}
          </ScrollArea>
        ) : (
          <Stack align="center" mt={44} gap={0}>
            <Text c="dimmed" fw={500}>
              No Majors
            </Text>
            <Text size="sm" c="dimmed">
              Added majors will be listed here
            </Text>
          </Stack>
        )}
      </Card>
    )
  )
}

function MajorRow({
  major,
  onEdit,
  onDelete,
}: {
  major: MajorItemDto

  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Group px="xs" justify="space-between" wrap="nowrap">
      <Stack gap={2}>
        <Text>{`${major.name} - ${major.majorCode}`}</Text>
        <Text size="sm" c="dimmed">
          {major.description.trim() !== ''
            ? major.description
            : 'No description'}
        </Text>
      </Stack>

      <Menu shadow="md" width={140}>
        <Menu.Target>
          <ActionIcon
            onClick={(e) => e.stopPropagation()}
            variant="subtle"
            color="gray"
            radius={'xl'}
          >
            <IconDotsVertical size={20} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => onEdit(major.id)}>Edit</Menu.Item>
          <Menu.Item c="red" onClick={() => onDelete(major.id)}>
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

function ProgramFormDrawer() {
  const { createProgram, updateProgram } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (opened: boolean) => {
    navigate({
      search: {
        createProgram: opened ? opened : undefined,
        updateProgram: undefined,
      },
    })
  }

  const opened = createProgram === true || updateProgram !== undefined

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
        <ProgramForm />
      </Drawer>
    </>
  )
}

function ProgramForm() {
  const { updateProgram } = route.useSearch()
  const {
    pagination: { page, search },
  } = usePaginationSearch(route)
  const navigate = route.useNavigate()

  const { create, update, form, isPending } = useQuickForm<
    ProgramFormInput,
    ProgramFormOutput
  >()({
    name: 'program',
    formOptions: {
      initialValues: {
        programCode: '',
        name: '',
        description: '',
        yearDuration: 0,
      },
      validate: zod4Resolver(programFormSchema),
    },
    transformQueryData: (program) => ({
      programCode: program.programCode,
      name: program.name,
      description: program.description,
      yearDuration: program.yearDuration,
    }),
    queryOptions: {
      ...programControllerFindOneOptions({
        path: { id: updateProgram || '' },
      }),
      enabled: !!updateProgram,
    },
    createMutationOptions: programControllerCreateMutation({}),
    updateMutationOptions: programControllerUpdateMutation({
      path: { id: updateProgram || '' },
    }),
    queryKeyInvalidation: programControllerFindAllQueryKey({
      query: { page, search },
    }),
  })

  const handleCloseDrawer = () => {
    navigate({
      search: {
        createProgram: undefined,
        updateProgram: undefined,
      },
    })
  }

  const handleCreate = async (values: ProgramFormOutput) => {
    if (form.validate().hasErrors) return
    const { programCode, name, description, yearDuration } = values

    await create.mutateAsync({
      body: {
        programCode,
        name,
        description,
        yearDuration,
      },
    })

    handleCloseDrawer()
  }

  const handleUpdate = async (values: ProgramFormOutput) => {
    if (form.validate().hasErrors || !updateProgram) return
    const { programCode, name, description, yearDuration } = values

    await update.mutateAsync({
      path: { id: updateProgram },
      body: {
        programCode,
        name,
        description,
        yearDuration,
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
              {updateProgram ? 'Update' : 'Add'} Program
            </Title>
            <Text c={'dark.3'} fw={500}>
              {updateProgram ? 'Update a' : 'Add a new'} program
            </Text>
          </Stack>
        </Group>
      </Group>

      <Stack>
        <Stack>
          <TextInput
            variant="filled"
            label="Name"
            placeholder="Program name"
            withAsterisk
            className="flex-2"
            disabled={isPending}
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <Group align="start">
            <TextInput
              variant="filled"
              label="Program Code"
              placeholder="BSIT"
              withAsterisk
              className="flex-1"
              disabled={isPending}
              key={form.key('programCode')}
              {...form.getInputProps('programCode')}
            />
            <NumberInput
              variant="filled"
              label="Year Duration"
              placeholder="0"
              withAsterisk
              className="flex-1"
              min={0}
              disabled={isPending}
              key={form.key('yearDuration')}
              {...form.getInputProps('yearDuration')}
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
              updateProgram
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

function MajorFormDrawer() {
  const { createMajor, updateMajor } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (opened: boolean) => {
    navigate({
      search: (prev) => ({
        ...prev,
        createMajor: opened ? opened : undefined,
        updateMajor: undefined,
      }),
    })
  }

  const opened = createMajor === true || updateMajor !== undefined

  return (
    <>
      <Button
        variant="light"
        size="sm"
        mt={8}
        mr={4}
        h={30}
        leftSection={<IconPlus />}
        onClick={() => handleDrawerState(true)}
      >
        Add Major
      </Button>
      <Drawer
        position="right"
        opened={opened}
        onClose={() => handleDrawerState(false)}
      >
        <MajorForm />
      </Drawer>
    </>
  )
}

function MajorForm() {
  const { selectedProgram, updateMajor } = route.useSearch()
  const navigate = route.useNavigate()

  const { create, update, form, isPending } = useQuickForm<
    MajorFormInput,
    MajorFormOutput
  >()({
    name: 'major',
    formOptions: {
      initialValues: {
        majorCode: '',
        name: '',
        description: '',
      },
      validate: zod4Resolver(majorFormSchema),
    },
    transformQueryData: (major) => ({
      majorCode: major.majorCode,
      name: major.name,
      description: major.description,
    }),
    queryOptions: {
      ...majorControllerFindOneOptions({
        path: { id: updateMajor || '' },
      }),
      enabled: !!updateMajor,
    },
    createMutationOptions: majorControllerCreateMutation({}),
    updateMutationOptions: majorControllerUpdateMutation({
      path: { id: updateMajor || '' },
    }),
    queryKeyInvalidation: programControllerFindAllMajorsQueryKey({
      path: { programId: selectedProgram || '' },
    }),
  })

  const handleCloseDrawer = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        createMajor: undefined,
        updateMajor: undefined,
      }),
    })
  }

  const handleCreate = async (values: MajorFormOutput) => {
    if (form.validate().hasErrors || !selectedProgram) return
    const { majorCode, name, description } = values

    await create.mutateAsync({
      body: {
        programId: selectedProgram,
        major: {
          majorCode,
          name,
          description,
        },
      },
    })

    handleCloseDrawer()
  }

  const handleUpdate = async (values: MajorFormOutput) => {
    if (form.validate().hasErrors || !updateMajor) return
    const { majorCode, name, description } = values

    await update.mutateAsync({
      path: { id: updateMajor },
      body: {
        majorCode,
        name,
        description,
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
              {updateMajor ? 'Update' : 'Add'} Major
            </Title>
            <Text c={'dark.3'} fw={500}>
              {updateMajor ? 'Update a' : 'Add a new'} major
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
              placeholder="Major name"
              withAsterisk
              className="flex-2"
              disabled={isPending}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              variant="filled"
              label="Major Code"
              placeholder="SD"
              withAsterisk
              className="flex-1"
              disabled={isPending}
              key={form.key('majorCode')}
              {...form.getInputProps('majorCode')}
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
              updateMajor
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
