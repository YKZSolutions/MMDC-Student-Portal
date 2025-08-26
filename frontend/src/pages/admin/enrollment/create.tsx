import {
    CreateEnrollmentPeriodFormSchema,
    type CreateEnrollmentPeriodFormValues,
} from '@/features/validation/create-enrollment'
import {
    billingControllerFindAllQueryKey,
    enrollmentControllerCreateEnrollmentMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
    Box,
    Button,
    Container,
    Group,
    Select,
    Stack,
    Text,
    Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useNavigate } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

function CreateEnrollmentPage() {
  const navigate = useNavigate()
  const form = useForm<CreateEnrollmentPeriodFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      endDate: new Date(),
      endYear: new Date().getFullYear(),
      startDate: new Date(),
      startYear: new Date().getFullYear(),
      term: 1,
      status: 'draft',
    },
    validate: zod4Resolver(CreateEnrollmentPeriodFormSchema),
  })

  const { mutateAsync: create, isPending } = useAppMutation(
    enrollmentControllerCreateEnrollmentMutation,
    {
      loading: {
        title: 'Creating Enrollment Period',
        message: 'Please wait while the enrollment period is being created.',
      },
      success: {
        title: 'Enrollment Period Created',
        message: 'The enrollment period has been created.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while creating the enrollment period.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.removeQueries({
          queryKey: billingControllerFindAllQueryKey(),
        })

        navigate({ to: '/enrollment' })
      },
    },
  )

  const handleCreate = () => {
    if (form.validate().hasErrors) return console.log(form.getValues())

    create({
      body: {
        endDate: form.getValues().endDate.toISOString(),
        endYear: form.getValues().endDate.getFullYear(),
        startDate: form.getValues().startDate.toISOString(),
        startYear: form.getValues().startDate.getFullYear(),
        term: form.getValues().term,
        status: form.getValues().status,
      },
    })
  }

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Box pb={'lg'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Create Enrollment Period
        </Title>
        <Text c={'dark.3'} fw={500}>
          Fill out the form below to create a new enrollment period.
        </Text>
      </Box>
      <Stack gap="xl">
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

        {/* Start Date */}
        <DatePickerInput
          label={'Term Start Date'}
          placeholder="Pick date"
          withAsterisk
          key={form.key(`startDate`)}
          {...form.getInputProps(`startDate`)}
          onChange={(date) => {
            if (date) form.setFieldValue('startDate', new Date(date))
          }}
          error={form.errors.startDate ? form.errors.startDate : undefined}
        />

        {/* End Date */}
        <DatePickerInput
          label={'Term End Date'}
          placeholder="Pick date"
          withAsterisk
          key={form.key(`endDate`)}
          {...form.getInputProps(`endDate`)}
          onChange={(date) => {
            if (date) form.setFieldValue('endDate', new Date(date))
          }}
          error={form.errors.endDate ? form.errors.endDate : undefined}
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
        <Button variant="filled" color="primary" onClick={() => handleCreate()}>
          Create
        </Button>
      </Group>
    </Container>
  )
}

export default CreateEnrollmentPage
