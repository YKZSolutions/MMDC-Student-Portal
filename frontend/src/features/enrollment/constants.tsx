import type { FilterOption } from '@/components/filter'
import { IconListNumbers } from '@tabler/icons-react'
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

export const termFilterOptions = [
  {
    label: 'All terms',
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
] satisfies FilterOption[]

export const enrollmentStatusFilterOptions = [
  {
    label: 'All statuses',
    value: null,
    icon: <IconListNumbers size={16} />,
    color: 'gray',
  },
  {
    label: 'Pending',
  },
] satisfies FilterOption[]
