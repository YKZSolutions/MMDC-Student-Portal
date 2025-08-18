import AsyncEmployeeCombobox from '@/features/billing/async-employee-combobox'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import {
    CreateBillFormSchema,
    type CreateBillFormValues,
} from '@/features/validation/create-billing'
import { billingControllerCreateMutation } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
    ActionIcon,
    Box,
    Button,
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
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const billTypes = [
  'Academic', // Tuition Fee, Thesis/Capstone Fee, Internship/Practicum Fee
  'Administrative', // ID Card Fee, Publication Fee, Graduation Fee
  'Facilities', // Library Fee, Laboratory Fee, Technology Fee
  'Student Services', // Medical/Dental Fee, Athletic Fee, Miscellaneous Fee
  'Activities', // Field Trip/Activity Fee, Uniform Fee
  'Penalties', // Penalty Fee
]

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

function EditBillingPage() {
  const navigate = useNavigate()
  const form = useForm<CreateBillFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      bill: {
        billType: '',
        dueAt: '',
        invoiceId: crypto.randomUUID(),
        issuedAt: new Date().toISOString(),
        outstandingAmount: '0',
        payerEmail: '',
        payerName: '',
        receiptedAmount: '0',
        receivableAmount: '0',
        status: 'unpaid',
      },
      costBreakdown: [],
      userId: '',
    },
    validate: zod4Resolver(CreateBillFormSchema),
  })

  console.log(form.getValues())

  const { mutateAsync: create, isPending } = useMutation({
    ...billingControllerCreateMutation(),
    onSuccess: () => {
      navigate({
        to: '/billing',
      })
    },
  })

  const handleCreate = () => {
    if (form.validate().hasErrors) return

    create({
      body: {
        bill: form.getValues().bill,
        costBreakdown: form.getValues().costBreakdown.map((item) => ({
          name: item.name,
          cost: item.cost.toString(), // Since we are using NumberInput, cost will be a number
          category: item.category,
        })),
        userId: form.getValues().userId,
      },
    })
  }

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Box pb={'lg'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Edit Bill
        </Title>
        <Text c={'dark.3'} fw={500}>
          Update the details of the bill below.
        </Text>
      </Box>
      <Stack gap="xl">
        {/* User Select */}
        <AsyncEmployeeCombobox form={form} />

        {/* Due Date and Bill Type */}
        <Group grow gap="md">
          <DatePickerInput
            label="Due Date"
            placeholder="Pick date"
            withAsterisk
            key={form.key('bill.dueAt')}
            {...form.getInputProps('bill.dueAt')}
            value={
              form.getValues().bill.dueAt
                ? new Date(form.getValues().bill.dueAt)
                : null
            }
            onChange={(val) =>
              form.getInputProps('bill.dueAt').onChange(`${val}T00:00:00Z`)
            }
          />
          <Select
            label="Bill Type"
            placeholder="Pick one"
            data={billTypes}
            withAsterisk
            key={form.key('bill.billType')}
            {...form.getInputProps('bill.billType')}
          />
        </Group>

        {/* Computation Breakdown */}

        <Stack gap={form.getValues().costBreakdown.length > 0 ? 'lg' : rem(5)}>
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
            hidden={form.getValues().costBreakdown.length == 0}
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
                  {form.getValues().costBreakdown.map((item, index) => (
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
                              `costBreakdown.${index}.category`,
                              value || '',
                            )
                          }}
                        />
                        <TextInput
                          label="Name"
                          placeholder="Enter name"
                          withAsterisk
                          key={form.key(`costBreakdown.${index}.name`)}
                          {...form.getInputProps(`costBreakdown.${index}.name`)}
                        />

                        <Group
                          wrap="nowrap"
                          gap="sm"
                          align={
                            form.errors[`costBreakdown.${index}.cost`]
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
                            key={form.key(`costBreakdown.${index}.cost`)}
                            {...form.getInputProps(
                              `costBreakdown.${index}.cost`,
                            )}
                          />

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            radius={'xl'}
                            mb={
                              form.errors[`costBreakdown.${index}.cost`]
                                ? rem(-3.5)
                                : rem(5)
                            }
                            onClick={() => {
                              const newBreakdown = form
                                .getValues()
                                .costBreakdown.filter((_, i) => i !== index)
                              form.setFieldValue('costBreakdown', newBreakdown)
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
                <BillingFeeBreakdown fees={form.getValues().costBreakdown} />
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
              form.setFieldValue('costBreakdown', [
                ...form.getValues().costBreakdown,
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

          {form.errors['costBreakdown'] && (
            <Text size="xs" c="red">
              {form.errors['costBreakdown']}
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

export default EditBillingPage
