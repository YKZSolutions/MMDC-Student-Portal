import AsyncEmployeeCombobox from '@/features/billing/async-employee-combobox'
import {
    CreateBillFormSchema,
    type CreateBillFormValues,
} from '@/features/validation/create-billing'
import {
    Box,
    Button,
    Container,
    Group,
    rem,
    Select,
    Stack,
    Text,
    Title
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconPlus } from '@tabler/icons-react'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const billTypes = [
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
  const form = useForm<CreateBillFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      bill: {
        billType: '',
        costBreakdown: {},
        dueAt: '',
        invoiceId: '',
        issuedAt: new Date().toISOString(),
        outstandingAmount: '0',
        payerEmail: '',
        payerName: '',
        receiptedAmount: '0',
        receivableAmount: '0',
        status: 'unpaid',
      },
      userId: '',
    },
    validate: zod4Resolver(CreateBillFormSchema),
  })

  console.log(form.getValues())

  const handleCreate = () => {
    if (form.validate().hasErrors) return
  }

  return (
    <Container size={'sm'} w={'100%'}>
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
        <Group grow gap="md">
          <DatePickerInput
            label="Due Date"
            placeholder="Pick date"
            withAsterisk
            key={form.key('bill.dueAt')}
            {...form.getInputProps('bill.dueAt')}
            value={
              form.values.bill.dueAt ? new Date(form.values.bill.dueAt) : null
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
        <Stack gap={rem(5)}>
          <Button
            size="md"
            className="border-gray-300"
            variant="default"
            radius="md"
            c="dark.4"
            style={{
              borderColor: form.errors['bill.costBreakdown'] ? 'red' : '',
            }}
            onClick={() => {
              form.setFieldValue('bill.costBreakdown', {
                ...form.values.bill.costBreakdown,
                'Tuition Fee': { value: 0 }, // Example of adding a new field
              })
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

        {/* {Object.entries(form.getValues().bill.costBreakdown).map(
          ([key, value]) => (
            <Stack key={key} gap="xs">
              <Text fz={'sm'} fw={600}>
                {key}
              </Text>
              <Group grow>
                <TextInput
                  label="Computation Type"
                  placeholder="Enter type"
                  withAsterisk
                  onChange={(e) => {
                    form.setFieldValue(`bill.costBreakdown`, {
                      ...form.values.bill.costBreakdown,
                      // Change the key name dynamically
                    })
                  }}
                />
              </Group>

              {Object.entries(value).map(([childKey, childValue]) => (
                <Stack pl={'xl'} key={childKey} gap="xs">
                  <Text fz={'sm'} fw={600}>
                    {childKey}
                  </Text>
                  <Group grow>
                    <TextInput
                      label="Computation Type"
                      placeholder="Enter type"
                      withAsterisk
                      key={form.key(`bill.costBreakdown.${key}.${childKey}`)}
                      {...form.getInputProps(
                        `bill.costBreakdown.${key}.${childKey}`,
                      )}
                    />
                  </Group>
                </Stack>
              ))}
            </Stack>
          ),
        )} */}

        {/* {
          // Map the computation fields based on the length
          Array.from({ length: computationFieldsLength }).map((_, index) => (
            <Stack key={index} gap="xs">
              <Text fz={'sm'} fw={600}>
                Computation {index + 1}
              </Text>
              <Group grow>
                <Select
                  label="Computation Type"
                  placeholder="Select type"
                  data={['Type A', 'Type B', 'Type C']}
                  withAsterisk
                  key={form.key(`bill.costBreakdown.${index}.type`)}
                  {...form.getInputProps(`bill.costBreakdown.${index}.type`)}
                />
                <TextInput
                  label="Value"
                  placeholder="Enter value"
                  withAsterisk
                  key={form.key(`bill.costBreakdown.${index}.value`)}
                  {...form.getInputProps(`bill.costBreakdown.${index}.value`)}
                />
              </Group>
            </Stack>
          ))
        } */}
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
