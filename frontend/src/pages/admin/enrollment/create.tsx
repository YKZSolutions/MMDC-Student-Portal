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
import { DatePickerInput, YearPickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { zod4Resolver } from 'mantine-form-zod-resolver'

function CreateEnrollmentPage() {
  const navigate = useNavigate()
  const form = useForm<CreateEnrollmentPeriodFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      startDate: dayjs().startOf('day').toDate(),
      startYear: dayjs().year(),
      endDate: dayjs().startOf('day').toDate(),
      endYear: dayjs().add(1, 'year').year(),
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
        startDate: form.getValues().startDate.toISOString(),
        startYear: form.getValues().startDate.getFullYear(),
        endDate: form.getValues().endDate.toISOString(),
        endYear: form.getValues().endDate.getFullYear(),
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
        <Group grow align="start">
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
            defaultValue={[
              form.getValues().startDate,
              form.getValues().endDate,
            ]}
            onChange={(date) => {
              if (date && date[0] && date[1]) {
                form.setFieldValue('startDate', dayjs(date[0]).toDate())
                form.setFieldValue('endDate', dayjs(date[1]).toDate())
              }
            }}
            error={form.errors.startDate ? form.errors.startDate : undefined}
          />
        </Group>

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
