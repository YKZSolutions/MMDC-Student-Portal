import type {
    PaymentScheme
} from '@/integrations/api/client'

export interface IPaymentScheme {
  paymentTypeId: PaymentScheme
  paymentType: string
  paymentDescription: string
  paymentBreakdown: string
}
