import type { EnrollmentPeriodDto } from '@/integrations/api/client'
import {
  enrollmentControllerFindAllEnrollmentsQueryKey,
  enrollmentControllerFindOneEnrollmentQueryKey,
  enrollmentControllerUpdateEnrollmentStatusMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Badge, Box, Menu, rem, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useLocation } from '@tanstack/react-router'
import {
  zodStatusEnum,
  type EnrollmentStatus,
} from '../../validation/create-enrollment.schema'

const STATUS_STYLES: Record<
  EnrollmentStatus,
  { color: string; label: string }
> = {
  draft: { color: 'gray', label: 'Draft' },
  upcoming: { color: 'indigo', label: 'Upcoming' },
  active: { color: 'green.9', label: 'Active' },
  extended: { color: 'blue', label: 'Extended' },
  closed: { color: 'orange', label: 'Closed' },
  canceled: { color: 'red', label: 'Canceled' },
  archived: { color: 'dark', label: 'Archived' },
}

function EnrollmentBadgeStatus({ period }: { period: EnrollmentPeriodDto }) {
  const { color, label } = STATUS_STYLES[period.status]
  const location = useLocation()

  const { mutateAsync: updateStatus } = useAppMutation(
    enrollmentControllerUpdateEnrollmentStatusMutation,
    {
      loading: {
        title: 'Updating Enrollment Status',
        message: 'Please wait while the enrollment status is being updated.',
      },
      success: {
        title: 'Enrollment Status Updated',
        message: 'The enrollment status has been updated.',
      },
      error: {
        title: 'Failed to Update Status',
        message: 'Something went wrong while updating the enrollment status.',
      },
    },
    {
      onMutate: (variables) => {
        const previousStatus = period.status
        period.status = variables.body.status
        return { previousStatus }
      },
      onSuccess: (data, vars) => {
        const { queryClient } = getContext()
        period.status = vars.body.status

        const allEnrollmentsKey =
          enrollmentControllerFindAllEnrollmentsQueryKey()
        const singleEnrollmentKey =
          enrollmentControllerFindOneEnrollmentQueryKey({
            path: { enrollmentId: period.id },
          })

        // Invalidate both queries
        Promise.all([
          queryClient.invalidateQueries({ queryKey: allEnrollmentsKey }),
          queryClient.invalidateQueries({ queryKey: singleEnrollmentKey }),
        ])

        // Reset depending on current page
        const isOnPeriodPage = location.pathname.includes(period.id)
        queryClient.resetQueries({
          queryKey: isOnPeriodPage ? allEnrollmentsKey : singleEnrollmentKey,
        })
      },
      onError: (
        err,
        vars,
        context: { previousStatus: EnrollmentStatus } | undefined,
      ) => {
        if (context) period.status = context.previousStatus
      },
    },
  )

  const handleStatusChange = async (newStatus: EnrollmentStatus) => {
    await updateStatus({
      path: {
        enrollmentId: period.id,
      },
      body: {
        status: newStatus,
      },
    })
  }

  return (
    <Menu shadow="md" radius={'md'} width={200} trigger="click-hover">
      <Menu.Target>
        <Box
          w={'fit-content'}
          onClick={(e) => {
            e.stopPropagation() // prevent click bubbling out of the Menu
          }}
        >
          <Badge
            style={{ cursor: 'pointer' }}
            color={color}
            radius="xl"
            size={'lg'}
            variant="dot"
          >
            <Text fz={rem(10)} fw={600}>
              {label}
            </Text>
          </Badge>
        </Box>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Status</Menu.Label>
        {zodStatusEnum.options.map((statusOption) => (
          <Menu.Item
            key={statusOption}
            onClick={(e) => {
              e.stopPropagation() // prevent click bubbling out of the Menu
              modals.openConfirmModal({
                title: (
                  <Text fw={600} c="gray.9">
                    Change status to{' '}
                    <Text span td="underline">
                      {statusOption}
                    </Text>
                  </Text>
                ),
                children: (
                  <Stack gap="xs">
                    <Text size="sm" c="gray.7">
                      Are you sure you want to update this enrollment period's
                      status to{' '}
                      <Text span fw={600}>
                        {statusOption}
                      </Text>
                      ?
                    </Text>

                    {statusOption === 'active' && (
                      <Text size="sm" c="gray.7">
                        <Text span size="sm" fw={600}>
                          Note:
                        </Text>{' '}
                        This will automatically close any currently active
                        enrollment period.
                      </Text>
                    )}
                  </Stack>
                ),
                centered: true,
                labels: { confirm: 'Confirm', cancel: 'Cancel' },
                onConfirm: async () => await handleStatusChange(statusOption),
              })
            }}
            disabled={statusOption === period.status}
          >
            <Badge
              style={{ cursor: 'pointer' }}
              color={STATUS_STYLES[statusOption].color}
              radius="xl"
              size={'lg'}
              variant="dot"
            >
              <Text fz={rem(10)} fw={600}>
                {statusOption}
              </Text>
            </Badge>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

export default EnrollmentBadgeStatus
