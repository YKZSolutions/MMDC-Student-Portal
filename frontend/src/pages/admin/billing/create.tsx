import AsyncEmployeeCombobox from '@/features/billing/async-employee-combobox'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import {
  CreateBillFormSchema,
  type CreateBillFormValues,
} from '@/features/validation/create-billing'
import {
  billingControllerCreateMutation,
  billingControllerFindAllQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { zBillingControllerCreateData } from '@/integrations/api/client/zod.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { formatToLabel } from '@/utils/formatters'
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Group,
  NumberInput,
  rem,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const paymentSchemes =
  zBillingControllerCreateData.shape.body.shape.bill.shape.paymentScheme.options.map(
    (scheme) => ({
      value: scheme,
      label: formatToLabel(scheme),
    }),
  )

const billTypes =
  zBillingControllerCreateData.shape.body.shape.bill.shape.billType.options.map(
    (type) => ({
      value: type,
      label: formatToLabel(type),
    }),
  )

const billCategories = [
  'Tuition Fee',
  'Miscellaneous Fee',
  'Laboratory Fee',
  'Library Fee',
  'Athletic Fee',
  'Medical/Dental Fee',
  'Technology Fee',
  'Graduation Fee',
  'Thesis/Capstone Fee',
  'Internship/Practicum Fee',
  'Uniform Fee',
  'ID Card Fee',
  'Publication Fee',
  'Field Trip/Activity Fee',
  'Penalty Fee',
]

function CreateBillingPage() {
  const navigate = useNavigate()
  const form = useForm<CreateBillFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      bill: {
        paymentScheme: 'full',
        billType: 'academic',
        payerEmail: '',
        payerName: '',
        totalAmount: '',
        costBreakdown: [],
      },
      dueDates: [],
      userId: '',
    },
    validate: zod4Resolver(CreateBillFormSchema),
    onValuesChange: (values, _prevValues) => {
      // re-validate when payment scheme changes
      if (values.bill.paymentScheme !== _prevValues.bill.paymentScheme) {
        form.validate()
      }

      // append T00:00:00Z to all dueDates that do not have time component
      if (
        values.dueDates.length > 0 &&
        values.dueDates.some((date) => !date?.endsWith('T00:00:00Z'))
      ) {
        form.setFieldValue(
          'dueDates',
          values.dueDates.map((date) =>
            date && !date.endsWith('T00:00:00Z')
              ? `${date}T00:00:00Z`
              : date || '',
          ),
        )
      }
    },
  })

  const { mutateAsync: create, isPending } = useMutation({
    ...billingControllerCreateMutation(),

    onMutate: () => {
      const id = notifications.show({
        loading: true,
        title: 'Creating bill',
        message: 'Please wait while the bill is being created.',
        autoClose: false,
        withCloseButton: false,
      })
      return { notifId: id }
    },

    onSuccess: (_, __, context) => {
      const { queryClient } = getContext()

      queryClient.removeQueries({
        queryKey: billingControllerFindAllQueryKey(),
      })

      navigate({ to: '/billing' })

      notifications.update({
        id: context?.notifId,
        color: 'teal',
        title: 'Bill Created',
        message: 'The bill has been created.',
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 1500,
      })
    },

    onError: (_, __, context) => {
      notifications.update({
        id: context?.notifId,
        color: 'red',
        title: 'Failed',
        message: 'Something went wrong while creating the bill.',
        icon: <IconX size={18} />,
        loading: false,
        autoClose: 3000,
      })
    },
  })

  const handleCreate = () => {
    if (form.validate().hasErrors) return console.log(form.getValues())

    create({
      body: {
        bill: {
          ...form.getValues().bill,
          costBreakdown: form.getValues().bill.costBreakdown.map((item) => ({
            name: item.name,
            cost: item.cost.toString(), // Convert to string for backend compatibility
            category: item.category,
          })),
          totalAmount: form
            .getValues()
            .bill.costBreakdown.reduce(
              (acc, item) => acc + parseFloat(item.cost),
              0,
            )
            .toString(),
        },
        dueDates:
          form.getValues().bill.paymentScheme === 'full'
            ? [form.getValues().dueDates[0]]
            : form.getValues().dueDates,
        userId: form.getValues().userId,
      },
    })
  }

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Box pb={'lg'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Create Bill
        </Title>
        <Text c={'dark.3'} fw={500}>
          Fill out the form below to create a new bill for a user.
        </Text>
      </Box>
      <Stack gap="xl">
        {/* User Select */}
        <AsyncEmployeeCombobox form={form} />

        {/* Due Date and Bill Type */}
        <Group grow gap="md" align="start">
          <Select
            allowDeselect={false}
            label="Payment Scheme"
            placeholder="Pick one"
            data={paymentSchemes}
            withAsterisk
            key={form.key('bill.paymentScheme')}
            {...form.getInputProps('bill.paymentScheme')}
          />

          <Select
            allowDeselect={false}
            label="Bill Type"
            placeholder="Pick one"
            data={billTypes}
            withAsterisk
            key={form.key('bill.billType')}
            {...form.getInputProps('bill.billType')}
          />
        </Group>

        <Stack>
          <DatePickerInput
            label={
              form.getValues().bill.paymentScheme === 'full'
                ? 'Due Date'
                : 'Down Payment'
            }
            placeholder="Pick date"
            withAsterisk
            key={form.key(`dueDates.0`)}
            {...form.getInputProps(`dueDates.0`)}
            error={form.errors.dueDates ? form.errors.dueDates : undefined}
          />
          <Collapse in={form.getValues().bill.paymentScheme !== 'full'}>
            <Stack>
              {Array.from({ length: 2 }, (_, index) => (
                <DatePickerInput
                  label={`Installment ${index + 1}`}
                  placeholder="Pick date"
                  withAsterisk
                  key={form.key(`dueDates.${index + 1}`)}
                  {...form.getInputProps(`dueDates.${index + 1}`)}
                  error={
                    form.errors.dueDates ? form.errors.dueDates : undefined
                  }
                />
              ))}
            </Stack>
          </Collapse>
        </Stack>

        {/* Computation Breakdown */}

        <Stack
          gap={form.getValues().bill.costBreakdown.length > 0 ? 'lg' : rem(5)}
        >
          <Group gap={rem(5)}>
            <Text size="sm" fw={500}>
              Computation Breakdown
            </Text>
            <Text size="sm" c="red">
              *
            </Text>
          </Group>

          <Tabs
            variant="outline"
            hidden={form.getValues().bill.costBreakdown.length == 0}
            defaultValue="breakdown"
          >
            <Stack>
              <Tabs.List>
                <Tabs.Tab value="breakdown">
                  <Text size="xs">Breakdown</Text>
                </Tabs.Tab>
                <Tabs.Tab
                  onClick={() => form.validate().hasErrors}
                  value="preview"
                >
                  <Text size="xs">Preview</Text>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="breakdown">
                <Stack>
                  {form.getValues().bill.costBreakdown.map((item, index) => (
                    <Stack gap={'xl'} key={item.id}>
                      <Group grow gap="sm" align="start">
                        <Select
                          searchable
                          label="Category"
                          placeholder="Pick category"
                          data={billCategories}
                          withAsterisk
                          key={form.key(`costBreakdown.${index}.category`)}
                          {...form.getInputProps(
                            `costBreakdown.${index}.category`,
                          )}
                          onChange={(value) => {
                            form.setFieldValue(
                              `bill.costBreakdown.${index}.category`,
                              value || '',
                            )
                          }}
                        />
                        <TextInput
                          label="Name"
                          placeholder="Enter name"
                          withAsterisk
                          key={form.key(`bill.costBreakdown.${index}.name`)}
                          {...form.getInputProps(
                            `bill.costBreakdown.${index}.name`,
                          )}
                        />

                        <Group
                          wrap="nowrap"
                          gap="sm"
                          align={
                            form.errors[`bill.costBreakdown.${index}.cost`]
                              ? 'center'
                              : 'end'
                          }
                        >
                          <NumberInput
                            label="Cost"
                            placeholder="Enter cost"
                            decimalScale={2}
                            fixedDecimalScale
                            withAsterisk
                            thousandSeparator=","
                            key={form.key(`bill.costBreakdown.${index}.cost`)}
                            {...form.getInputProps(
                              `bill.costBreakdown.${index}.cost`,
                            )}
                          />

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            radius={'xl'}
                            mb={
                              form.errors[`bill.costBreakdown.${index}.cost`]
                                ? rem(-3.5)
                                : rem(5)
                            }
                            onClick={() => {
                              const newBreakdown = form
                                .getValues()
                                .bill.costBreakdown.filter(
                                  (_, i) => i !== index,
                                )
                              form.setFieldValue(
                                'bill.costBreakdown',
                                newBreakdown,
                              )
                            }}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Divider />
                    </Stack>
                  ))}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="preview">
                <BillingFeeBreakdown
                  fees={form.getValues().bill.costBreakdown}
                />
              </Tabs.Panel>
            </Stack>
          </Tabs>

          <Button
            size="md"
            className="border-gray-300"
            variant="default"
            radius="sm"
            c="dark.4"
            style={{
              borderColor: form.errors['costBreakdown'] ? 'red' : '',
            }}
            onClick={() => {
              form.setFieldValue('bill.costBreakdown', [
                ...form.getValues().bill.costBreakdown,
                // when you push new items into costBreakdown
                {
                  id: crypto.randomUUID(),
                  category: '',
                  name: '',
                  cost: '0.00',
                },
              ])
            }}
          >
            <Group gap={rem(5)}>
              <IconPlus size={18} />
              <Text fz="sm" fw={500}>
                Add Computation Fields
              </Text>
            </Group>
          </Button>

          {form.errors['bill.costBreakdown'] && (
            <Text size="xs" c="red">
              {form.errors['bill.costBreakdown']}
            </Text>
          )}
        </Stack>
      </Stack>

      {/* Action buttons */}
      <Group mt="xl" justify="flex-end">
        <Button variant="subtle">Cancel</Button>
        <Button variant="filled" color="primary" onClick={() => handleCreate()}>
          Create
        </Button>
      </Group>
    </Container>
  )
}

export default CreateBillingPage
