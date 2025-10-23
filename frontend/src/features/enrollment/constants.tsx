import type { FilterOption } from '@/components/filter'
import type { EnrollmentSearchSchema } from '@/routes/(protected)/enrollment'
import { IconListNumbers } from '@tabler/icons-react'
import {
    zodStatusEnum,
    type EnrollmentStatus,
} from './schema/create-enrollment.schema'
import type { IPaymentScheme } from './types'

export const enrollmentStatusOptions = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Enrolled',
    value: 'enrolled',
  },
  {
    label: 'Not Enrolled',
    value: 'not enrolled',
  },
] as const

export const paymentSchemeData = [
  {
    paymentTypeId: 'full',
    paymentType: 'Full Payment',
    paymentDescription: 'No Interest • 1 Payment',
    paymentBreakdown: '100% at Enrollment',
  },
  {
    paymentTypeId: 'installment1',
    paymentType: 'Installment Plan 1',
    paymentDescription: '5% Interest • 3 Payments',
    paymentBreakdown:
      '40% at enrollment • 30% first payment • 30% second payment',
  },
  {
    paymentTypeId: 'installment2',
    paymentType: 'Installment Plan 2',
    paymentDescription: '7.5% Interest • 3 Payments',
    paymentBreakdown:
      '20% at enrollment • 40% first payment • 40% second payment',
  },
] as IPaymentScheme[]

export const enrollmentBadgeStatus: Record<
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

export const termAdminFilterOptions = [
  {
    label: 'All',
    value: null,
    icon: <IconListNumbers size={16} />,
    color: 'gray',
  },
  {
    label: 'Term 1',
    value: '1',
    icon: null,
    color: 'blue',
  },
  {
    label: 'Term 2',
    value: '2',
    icon: null,
    color: 'blue',
  },
  {
    label: 'Term 3',
    value: '3',
    icon: null,
    color: 'blue',
  },
] satisfies FilterOption<EnrollmentSearchSchema['term']>[]

export const statusAdminFilterOptions = [
  {
    label: 'All',
    value: null,
    icon: <IconListNumbers size={16} />,
    color: 'gray',
  },
  ...(zodStatusEnum.options.map((statusOption) => ({
    label: statusOption.charAt(0).toUpperCase() + statusOption.slice(1),
    value: statusOption as EnrollmentStatus,
    icon: null,
    color: enrollmentBadgeStatus[statusOption].color,
  })) satisfies FilterOption<EnrollmentStatus>[]),
] satisfies FilterOption<EnrollmentStatus>[]
