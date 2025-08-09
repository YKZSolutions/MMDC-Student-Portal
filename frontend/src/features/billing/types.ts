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
  // paymentIntentId: string
  // paymentMethodId: string
  // clientKey: string
  // returnUrl: string
}
