import z from 'zod'
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

export const zEnrollmentStatusEnum = z.enum(
  enrollmentStatusOptions.map((option) => option.value),
)
