import { assignmentControllerUpdateMutation } from '@/integrations/api/client/@tanstack/react-query.gen'
import type { AssignmentConfigDto } from '@/integrations/api/client'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  assignmentConfigFormSchema,
  type AssignmentConfigFormInput,
} from '@/features/courses/modules/content/assignment-config.schema'
import { Button, Card, NumberInput, Stack, Text } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'

interface AssignmentConfigCardProps {
  assignmentData: AssignmentConfigDto
}

export function AssignmentConfigCard({
  assignmentData,
}: AssignmentConfigCardProps) {
  const [isPending, setIsPending] = useState(false)

  const { mutateAsync: updateAssignmentConfig } = useAppMutation(
    assignmentControllerUpdateMutation,
    {
      loading: {
        title: 'Updating Assignment Config',
        message: 'Saving assignment configuration...',
      },
      success: {
        title: 'Assignment Config Updated',
        message: 'Assignment configuration updated successfully',
      },
    },
  )

  const form = useForm<AssignmentConfigFormInput>({
    initialValues: {
      maxScore: assignmentData.maxScore
        ? new Decimal(assignmentData.maxScore).toNumber()
        : null,
      maxAttempts: assignmentData.maxAttempts || null,
      dueDate: assignmentData.dueDate
        ? dayjs(assignmentData.dueDate).utc().toISOString()
        : null,
      weightPercentage: assignmentData.weightPercentage || null,
    },
    validate: zod4Resolver(assignmentConfigFormSchema),
  })

  const handleSaveConfig = async (values: AssignmentConfigFormInput) => {
    if (form.validate().hasErrors) return

    setIsPending(true)
    try {
      await updateAssignmentConfig({
        path: { assignmentId: assignmentData.id },
        body: {
          maxScore: values.maxScore || undefined,
          dueDate: values.dueDate
            ? dayjs(values.dueDate).utc().toISOString()
            : undefined,
          maxAttempts: values.maxAttempts || undefined,
          weightPercentage: values.weightPercentage || undefined,
        },
      })
    } catch (error) {
      console.error('Failed to update assignment config:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Text fw={600} size="md">
          Assignment Configuration
        </Text>
        <NumberInput
          variant="filled"
          label="Points"
          placeholder="100"
          size="sm"
          allowDecimal
          disabled={isPending}
          {...form.getInputProps('maxScore')}
        />
        <DateTimePicker
          variant="filled"
          label="Due Date"
          placeholder="Select date and time"
          size="sm"
          disabled={isPending}
          {...form.getInputProps('dueDate')}
        />
        <NumberInput
          variant="filled"
          label="Max Attempts"
          placeholder="Unlimited"
          size="sm"
          min={1}
          disabled={isPending}
          {...form.getInputProps('maxAttempts')}
        />
        <Button
          size="sm"
          fullWidth
          loading={isPending}
          onClick={() => handleSaveConfig(form.values)}
        >
          Save Config
        </Button>
      </Stack>
    </Card>
  )
}
