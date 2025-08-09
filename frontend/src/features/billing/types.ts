export type PaymentMethod = 'gcash' | 'paymaya'
export interface IPaymentMethod {
  //   cardNumber: string
  //   expMonth: number
  //   expYear: number
  //   cvc: string
  //   bankCode: string
  name: string
  email: string
  phone: string
  //   address: {
  //     line1: string
  //     line2?: string
  //     city: string
  //     postalCode: string
  //     country: string
  //   }
  metadata?: Record<string, string>
  installments?: {
    tenure: number
    issuerId: string
  }
  type: PaymentMethod
}

export interface IPaymentMethodResponse {
  data: {
    id: string
    type: 'string'
    attributes: {
      billing: {
        address: {
          city: string | null
          country: string | null
          line1: string | null
          line2: string | null
          postal_code: string | null
          state: string | null
        }
        email: string
        name: string
        phone: string
      }
      created_at: number
      details: Record<string, any> | null
      livemode: boolean
      metadata: Record<string, string>
      type: string
      updated_at: number
    }
  }
}

export interface IPaymentAttach {
  paymentIntentId: string | undefined
  paymentMethodId: string
  clientKey: string | undefined
  // returnUrl: string
}

export interface IPaymentIntentResponse {
  data: {
    id: string
    type: 'payment_intent'
    attributes: {
      amount: number
      capture_type: 'automatic' | 'manual'
      client_key: string
      created_at: number
      currency: string
      description: string
      last_payment_error: any | null
      livemode: boolean
      metadata: Record<string, string>
      next_action: {
        type: 'redirect'
        redirect: {
          url: string
          return_url: string
        }
      } | null
      original_amount: number
      payment_method_allowed: PaymentMethod[]
      payment_method_options: any | null
      payments: any[]
      setup_future_usage: string | null
      statement_descriptor: string
      status:
        | 'awaiting_payment_method'
        | 'awaiting_next_action'
        | 'processing'
        | 'succeeded'
        | 'failed'
      updated_at: number
    }
  }
}
