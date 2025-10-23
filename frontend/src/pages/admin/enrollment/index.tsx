import { AsyncSearchable } from '@/components/async-searchable'
import Filter from '@/components/filter'
import { SuspendedPagination } from '@/components/suspense-pagination'
import EnrollmentBadgeStatus from '@/features/enrollment/components/enrollment-badge-status'
import { SuspendedAdminEnrollmentTableRows } from '@/features/enrollment/components/suspense'
import {
  statusAdminFilterOptions,
  termAdminFilterOptions,
} from '@/features/enrollment/constants'
import {
  enrollmentPeriodFormSchema,
  type EnrollmentPeriodFormInput,
  type EnrollmentPeriodFormOutput,
} from '@/features/enrollment/schema/create-enrollment.schema'
import { useQuickForm } from '@/hooks/use-quick-form'
import { useSearchState } from '@/hooks/use-search-state'
import type {
  BillDto,
  EnrollmentPeriodDto,
  PaginationMetaDto,
} from '@/integrations/api/client'
import {
  enrollmentControllerCreateEnrollmentMutation,
  enrollmentControllerFindAllEnrollmentsOptions,
  enrollmentControllerFindAllEnrollmentsQueryKey,
  enrollmentControllerFindOneEnrollmentOptions,
  enrollmentControllerRemoveEnrollmentMutation,
  enrollmentControllerUpdateEnrollmentMutation,
  pricingGroupControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import type { EnrollmentSearchSchema } from '@/routes/(protected)/enrollment'
import { formatMetaToPagination, formatToSchoolYear } from '@/utils/formatters'
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Drawer,
  Flex,
  Group,
  Menu,
  Pagination,
  rem,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { DatePickerInput, YearPickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrash,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense } from 'react'
import z from 'zod'

const route = getRouteApi('/(protected)/enrollment/')

function EnrollmentAdminQueryProvider({
  children,
  props = { page: 1 },
}: {
  children: (props: {
    enrollmentPeriods: EnrollmentPeriodDto[]
    meta: PaginationMetaDto
    message: string
    totalPages: number
  }) => ReactNode
  props?: EnrollmentSearchSchema
}) {
  const { page, activity, term } = props

  const { data } = useSuspenseQuery(
    enrollmentControllerFindAllEnrollmentsOptions({
      query: {
        page: page,
        status: activity,
        term: term,
      },
    }),
  )

  const enrollmentPeriods = data.enrollments
  const meta = data.meta

  const { totalPages, message } = formatMetaToPagination({
    limit: 10,
    page,
    meta,
  })

  return children({
    enrollmentPeriods,
    meta,
    message,
    totalPages,
  })
}

export default function EnrollmentAdminPage() {
  const { search, setSearch, handlePage, clearSearchParam } =
    useSearchState(route)
  const navigate = route.useNavigate()

  const handleTermFilter = (
    term: EnrollmentSearchSchema['term'] | null,
  ): void => {
    setSearch({ term: term ?? undefined, page: undefined })
  }

  const handleStatusFilter = (
    status: EnrollmentSearchSchema['activity'] | null,
  ): void => {
    setSearch({
      activity: status ?? undefined,
      page: undefined,
    })
  }

  return (
    <Container size={'md'} w="100%" pb={'xl'}>
      <Stack gap={'lg'}>
        {/* Page Hero */}
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Enrollment
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage student enrollment and course selection.
          </Text>
        </Box>

        <Stack gap={'md'}>
          <Flex
            w={{
              base: '100%',
              xs: 'auto',
            }}
            wrap={'wrap'}
            gap={rem(5)}
            justify="end"
            align="center"
          >
            {/* Changed spacing to gap */}
            <Filter
              title="Filter Enrollments"
              shouldExpand
              handleResetFilter={clearSearchParam}
            >
              <Filter.Category
                label="Term"
                options={termAdminFilterOptions}
                matchedSearch={search.term}
                handleSelectFilter={handleTermFilter}
              />
              <Filter.Category
                label="Status"
                options={statusAdminFilterOptions}
                matchedSearch={search.activity}
                handleSelectFilter={handleStatusFilter}
              />
            </Filter>
            <Button
              w={{
                base: '100%',
                xs: 'auto',
              }}
              variant="filled"
              radius={'md'}
              leftSection={<IconPlus size={20} />}
              lts={rem(0.25)}
              // onClick={() => navigate({ to: '/enrollment/create' })}
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    create: true,
                  }),
                })
              }
            >
              Create
            </Button>
            <EnrollmentPeriodFormDrawer />
          </Flex>

          {/* Table */}
          <EnrollmentTable />

          {/* Pagination */}
          <Suspense fallback={<SuspendedPagination />}>
            <EnrollmentAdminQueryProvider props={search}>
              {(props) => (
                <Group justify="flex-end">
                  <Text size="sm">{props.message}</Text>
                  <Pagination
                    total={props.totalPages}
                    value={search.page}
                    onChange={handlePage}
                    withPages={false}
                  />
                </Group>
              )}
            </EnrollmentAdminQueryProvider>
          </Suspense>
        </Stack>
      </Stack>
    </Container>
  )
}

function EnrollmentTable() {
  const { search } = useSearchState(route)
  const navigate = route.useNavigate()

  const { mutateAsync: remove } = useAppMutation(
    enrollmentControllerRemoveEnrollmentMutation,
    {
      loading: {
        title: 'Deleting Enrollment Period',
        message: 'Please wait while the enrollment period is being deleted...',
      },
      success: {
        title: 'Enrollment Period deleted',
        message: 'The enrollment period has been successfully deleted.',
      },
      error: {
        title: 'Failed to delete the enrollment period.',
        message:
          'An error occurred while trying to delete the enrollment period. Please try again.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()
        queryClient.invalidateQueries({
          queryKey: enrollmentControllerFindAllEnrollmentsQueryKey(),
        })
      },
    },
  )

  const handleMenuAction = (
    id: BillDto['id'],
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) =>
    // Prevent the list from being clicked when a menu item is clicked
    (
      e.stopPropagation(),
      {
        view: () => {
          navigate({
            to: `/enrollment/${id}`,
          })
        },
        edit: () => {
          navigate({
            search: (prev) => ({
              ...prev,
              update: id,
            }),
          })
        },
        delete: () => {
          modals.openConfirmModal({
            title: (
              <Text fw={600} c={'dark.7'}>
                Delete Enrollment Period
              </Text>
            ),
            children: (
              <Text size="sm" c={'dark.3'}>
                Are you sure you want to delete this enrollment period? This
                action cannot be undone.
              </Text>
            ),
            centered: true,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
              await remove({
                path: {
                  enrollmentId: id,
                },
                query: {
                  directDelete: true,
                },
              })
            },
          })
        },
      }
    )

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table
        verticalSpacing={'md'}
        highlightOnHover
        highlightOnHoverColor="gray.0"
        style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
            }}
            bg={'gray.1'}
            c={'dark.5'}
          >
            <Table.Th>School Year</Table.Th>
            <Table.Th>Term</Table.Th>
            <Table.Th>Start Date</Table.Th>
            <Table.Th>End Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          style={{
            cursor: 'pointer',
          }}
        >
          <Suspense fallback={<SuspendedAdminEnrollmentTableRows />}>
            <EnrollmentAdminQueryProvider props={search}>
              {(props) =>
                props.enrollmentPeriods.map((period) => (
                  <Table.Tr
                    onClick={(e) =>
                      navigate({
                        to: '/enrollment/' + period.id,
                      })
                    }
                    key={period.id}
                  >
                    <Table.Td>
                      <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
                        {formatToSchoolYear(period.startYear, period.endYear)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={'dark.3'} fw={500}>
                        {period.term}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={'dark.3'} fw={500}>
                        {dayjs(period.startDate).format('MMM D, YYYY')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={'dark.3'} fw={500}>
                        {dayjs(period.endDate).format('MMM D, YYYY')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <EnrollmentBadgeStatus period={period} />
                    </Table.Td>

                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            onClick={(e) => e.stopPropagation()}
                            variant="subtle"
                            color="gray"
                            radius="xl"
                          >
                            <IconDotsVertical size={20} stroke={1.5} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={16} stroke={1.5} />}
                            onClick={(e) =>
                              handleMenuAction(period.id, e).view()
                            }
                          >
                            View Details
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconPencil size={16} stroke={1.5} />}
                            onClick={(e) =>
                              handleMenuAction(period.id, e).edit()
                            }
                          >
                            Edit
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconTrash size={16} stroke={1.5} />}
                            onClick={(e) =>
                              handleMenuAction(period.id, e).delete()
                            }
                            c="red"
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              }
            </EnrollmentAdminQueryProvider>
          </Suspense>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

function EnrollmentPeriodFormDrawer() {
  const { create, update } = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <Drawer
      opened={create === true || update !== undefined}
      onClose={() =>
        navigate({
          search: (prev) => ({
            ...prev,
            create: undefined,
            update: undefined,
          }),
        })
      }
      title={
        <Text size="xl" fw={600}>
          Create Enrollment Period
        </Text>
      }
      position="right"
      size="md"
      padding="xl"
    >
      <EnrollmentPeriodForm />
    </Drawer>
  )
}

function EnrollmentPeriodForm() {
  const { update: updateId } = route.useSearch()
  const navigate = route.useNavigate()

  const { create, update, form, isPending } = useQuickForm<
    EnrollmentPeriodFormInput,
    EnrollmentPeriodFormOutput
  >()({
    name: 'enrollment period',
    formOptions: {
      mode: 'uncontrolled',
      initialValues: {
        startDate: dayjs().startOf('day').toDate(),
        startYear: dayjs().year(),
        endDate: dayjs().startOf('day').toDate(),
        endYear: dayjs().add(1, 'year').year(),
        term: 1,
        status: 'draft',
        pricingGroup: null,
      },
      validate: zod4Resolver(enrollmentPeriodFormSchema),
    },
    transformQueryData: (enrollment) => ({
      startDate: dayjs(enrollment.startDate).toDate(),
      startYear: enrollment.startYear,
      endDate: dayjs(enrollment.endDate).toDate(),
      endYear: enrollment.endYear,
      term: enrollment.term,
      status: enrollment.status,
      pricingGroup: enrollment.pricingGroup,
    }),
    queryOptions: {
      ...enrollmentControllerFindOneEnrollmentOptions({
        path: { enrollmentId: updateId || '' },
      }),
      enabled: z.uuidv4().safeParse(updateId).success,
    },
    createMutationOptions: enrollmentControllerCreateEnrollmentMutation({}),
    updateMutationOptions: enrollmentControllerUpdateEnrollmentMutation({
      path: { enrollmentId: updateId || '' },
    }),
    queryKeyInvalidation: enrollmentControllerFindAllEnrollmentsQueryKey({
      // query: { page, search },
    }),
  })

  const handleCreate = () => {
    if (form.validate().hasErrors) return console.log(form.getValues())

    const values = form.getValues()
    if (!values.pricingGroup) return

    create.mutateAsync({
      body: {
        startDate: values.startDate.toISOString(),
        startYear: values.startYear,
        endDate: values.endDate.toISOString(),
        endYear: values.endYear,
        term: values.term,
        status: values.status,
        pricingGroupId: values.pricingGroup.id,
      },
    })

    navigate({
      search: (prev) => ({
        ...prev,
        create: undefined,
      }),
    })
  }

  const handleUpdate = () => {
    if (form.validate().hasErrors) return console.log(form.getValues())

    const values = form.getValues()
    if (!values.pricingGroup || !updateId) return

    update.mutateAsync({
      path: { enrollmentId: updateId },
      body: {
        startDate: values.startDate.toISOString(),
        startYear: values.startYear,
        endDate: values.endDate.toISOString(),
        endYear: values.endYear,
        term: values.term,
        pricingGroupId: values.pricingGroup.id,
      },
    })

    navigate({
      search: (prev) => ({
        ...prev,
        update: undefined,
      }),
    })
  }

  return (
    <Stack>
      {/* <Box pb={'lg'}>
        <Text c={'dark.3'} fw={500}>
          Fill out the form below to create a new enrollment period.
        </Text>
      </Box> */}
      <Stack gap="xl">
        {/* <Group grow align="start"> */}
        {/* Term */}
        <Select
          allowDeselect={false}
          label="Term"
          placeholder="Pick one"
          data={[
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
          withAsterisk
          key={form.key('term')}
          {...form.getInputProps('term')}
          defaultValue={form.values.term.toString()}
          onChange={(value) => {
            if (value) form.setFieldValue('term', Number(value))
          }}
        />

        {/* Term Dates */}
        <DatePickerInput
          type="range"
          label={'Term Duration'}
          placeholder="Pick date"
          withAsterisk
          key={form.key(`startDate`)}
          {...form.getInputProps(`startDate`)}
          presets={[
            {
              value: [
                dayjs(form.getValues().startDate).format('YYYY-MM-DD'),
                dayjs(form.getValues().startDate)
                  .add(3, 'months')
                  .format('YYYY-MM-DD'),
              ],
              label: 'Next 3 months',
            },
            {
              value: [
                dayjs(form.getValues().startDate).format('YYYY-MM-DD'),
                dayjs(form.getValues().startDate)
                  .add(4, 'months')
                  .format('YYYY-MM-DD'),
              ],
              label: 'Next 4 months',
            },
            {
              value: [
                dayjs(form.getValues().startDate).format('YYYY-MM-DD'),
                dayjs(form.getValues().startDate)
                  .add(5, 'months')
                  .format('YYYY-MM-DD'),
              ],
              label: 'Next 5 months',
            },
          ]}
          defaultValue={[form.getValues().startDate, form.getValues().endDate]}
          onChange={(date) => {
            if (date && date[0] && date[1]) {
              form.setFieldValue('startDate', dayjs(date[0]).toDate())
              form.setFieldValue('endDate', dayjs(date[1]).toDate())
            }
          }}
          error={form.errors.startDate ? form.errors.startDate : undefined}
        />
        {/* </Group> */}

        {/* School Year */}
        <YearPickerInput
          type="range"
          label={'School Year'}
          placeholder="Pick date"
          withAsterisk
          key={form.key(`startYear`)}
          {...form.getInputProps(`startYear`)}
          defaultValue={[
            dayjs().year(form.getValues().startYear).toDate(),
            dayjs().year(form.getValues().endYear).toDate(),
          ]}
          onChange={(date) => {
            if (date && date[0] && date[1]) {
              form.setFieldValue('startYear', dayjs(date[0]).year())
              form.setFieldValue('endYear', dayjs(date[1]).year())
            }
          }}
          error={form.errors.startYear ? form.errors.startYear : undefined}
        />

        <AsyncSearchable
          getOptions={(search) =>
            pricingGroupControllerFindAllOptions({ query: { search } })
          }
          mapData={(data) => data.pricingGroups}
          getValue={(data) => data.id}
          getLabel={(data) => data.name}
          withAsterisk
          // renderValue={(item) => <Card>{item?.name}</Card>}
          renderOption={(item) => (
            <Group justify="space-between">
              <Text size="sm">{item.name}</Text>
              <Text size="sm">₱{item.amount}</Text>
            </Group>
          )}
          renderValue={(item) =>
            item && (
              <Group justify="space-between">
                <Text size="sm">{item.name}</Text>
                <Text size="sm">₱{item.amount}</Text>
              </Group>
            )
          }
          placeholder="Pick a Pricing Group"
          selectFirstOption={true}
          label="Pricing Group"
          {...form.getInputProps('pricingGroup')}
          value={form.getValues().pricingGroup}
        />
      </Stack>

      {/* Action buttons */}
      <Group mt="xl" justify="flex-end">
        <Button
          variant="subtle"
          onClick={() => navigate({ to: '/enrollment' })}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          color="primary"
          onClick={() => (updateId ? handleUpdate() : handleCreate())}
        >
          {updateId ? 'Update' : 'Create'}
        </Button>
      </Group>
    </Stack>
  )
}
