import { zPricingControllerCreateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodPricingCreate = zPricingControllerCreateData.shape.body.shape

export const pricingFormSchema = z.object({
  ...zodPricingCreate,
  name: zodPricingCreate.name.nonempty('Name should not be empty'),
  amount: zodPricingCreate.amount.nonempty('Should have an amount'),
  type: nullableInput(zodPricingCreate.type, 'Type is required'),
})

export type PricingFormInput = z.input<typeof pricingFormSchema>
export type PricingFormOutput = z.output<typeof pricingFormSchema>
